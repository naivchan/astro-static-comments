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
    
    // Simple regex to grab mastodon_id and instance from frontmatter without a library
    const mastodonId = content.match(/mastodon_id:\s*["']?(\d+)["']?/)?.[1];
    const instance = content.match(/mastodon_instance:\s*["']?([^"'\s]+)["']?/)?.[1];
    const slug = file.replace(/\.(md|mdoc)$/, '');

    if (mastodonId && instance) {
      console.log(`Fetching comments for: ${slug}`);
      try {
        const response = await fetch(
          `https://${instance}/api/v1/statuses/${mastodonId}/context`,
          { headers: { 'User-Agent': 'NaviBlogBot/1.0' } }
        );

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const resData = await response.json();
        fs.writeFileSync(
          path.join(DATA_DIR, `${slug}.json`),
          JSON.stringify(resData.descendants || [], null, 2)
        );
        console.log(`✅ Saved ${slug}.json`);
      } catch (e) {
        console.error(`❌ Failed ${slug}: ${e.message}`);
      }
    }
  }
}

fetchComments();
