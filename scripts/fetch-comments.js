import fs from 'fs';
import path from 'path';

const CONTENT_DIR = path.join(process.cwd(), 'src/content/posts');
const DATA_DIR = path.join(process.cwd(), 'src/data/comments');

async function fetchComments() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(CONTENT_DIR)) return;

  const posts = fs.readdirSync(CONTENT_DIR).filter(file => file.endsWith('.md') || file.endsWith('.mdoc'));

  for (const file of posts) {
    const filePath = path.join(CONTENT_DIR, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    
    const mastodonId = content.match(/mastodon_id:\s*["']?([\w-]+)["']?/)?.[1];
    const instance = content.match(/mastodon_instance:\s*["']?([^"'\s]+)["']?/)?.[1];
    const slug = file.replace(/\.(md|mdoc)$/, '');

    if (mastodonId && instance) {
      console.log(`Fetching comments for: ${slug}`);
      try {
        // Fetch BOTH the thread and the original post status
        const [contextRes, statusRes] = await Promise.all([
          fetch(`https://${instance}/api/v1/statuses/${mastodonId}/context`, { headers: { 'User-Agent': 'NaviBlogBot/1.0' } }),
          fetch(`https://${instance}/api/v1/statuses/${mastodonId}`, { headers: { 'User-Agent': 'NaviBlogBot/1.0' } })
        ]);

        if (!contextRes.ok || !statusRes.ok) throw new Error(`HTTP Error`);

        const contextData = await contextRes.json();
        const statusData = await statusRes.json();

        // Bundle everything into one JSON object
        const finalData = {
          comments: contextData.descendants || [],
          author: {
            username: statusData.account.username,
            url: statusData.url
          },
          stats: {
            favorites_count: statusData.favourites_count || statusData.favorites_count || 0,
            reblogs_count: statusData.reblogs_count || 0,
            replies_count: statusData.replies_count || 0
          }
        };

        fs.writeFileSync(
          path.join(DATA_DIR, `${slug}.json`),
          JSON.stringify(finalData, null, 2)
        );
        console.log(`✅ Saved ${slug}.json (with stats & author)`);
      } catch (e) {
        console.error(`❌ Failed ${slug}: ${e.message}`);
      }
    }
  }
}

fetchComments();
