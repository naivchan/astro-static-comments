const REPO_OWNER = "REPO-OWNER";
const REPO_NAME = "REPO-NAME";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN; // you need to add GITHUB_TOKEN as a env variable in Netlify

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { username, userUrl, content, replyToId, postPath, honeypot } = JSON.parse(event.body);

    // 1. Honeypot check
    if (honeypot && honeypot.length > 0) {
      return { 
        statusCode: 200, 
        body: JSON.stringify({ message: "Comment received (filtered as spam)" }) 
      };
    }
    
    const slug = postPath.split('/').filter(Boolean).pop() || 'home';
    const filePath = `src/data/manual-comments/${slug}.json`;
    const apiUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filePath}`;

    // 2. Get existing comments from GitHub
    let comments = [];
    let sha = null;

    const getFile = await fetch(apiUrl, {
      headers: { 
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        "Accept": "application/vnd.github.v3+json"
      }
    });

    if (getFile.ok) {
      const data = await getFile.json();
      sha = data.sha;
      // Decode base64 content from GitHub
      const fileContent = Buffer.from(data.content, "base64").toString("utf-8");
      comments = JSON.parse(fileContent);
    }

    // 3. Create the new comment object
    const commentId = `manual-${Date.now()}`;
    const websiteUrl = userUrl || "#"; // Fallback if no URL provided
    
    const newComment = {
      id: commentId,
      in_reply_to_id: replyToId || null,
      is_manual: true,
      created_at: new Date().toISOString(),
      url: `#${commentId}`,
      content: `<p>${content.replace(/\n/g, '<br>')}</p>`,
      account: {
        username: (username || "guest").toLowerCase().replace(/\s+/g, '-'),
        acct: websiteUrl,
        display_name: username || "Friendly Reader",
        url: websiteUrl,
        avatar_static: `https://api.dicebear.com/9.x/thumbs/svg?seed=${username || 'Guest'}`
      }
    };

    comments.push(newComment);

    // 4. Push updated JSON back to GitHub
    const putBody = {
      message: `Comment by ${username} on ${slug}`,
      content: Buffer.from(JSON.stringify(comments, null, 2)).toString("base64"),
      branch: "main"
    };

    if (sha) putBody.sha = sha; // Required by GitHub if updating existing file

    const putRes = await fetch(apiUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        "Content-Type": "application/json",
        "Accept": "application/vnd.github.v3+json"
      },
      body: JSON.stringify(putBody)
    });

    if (!putRes.ok) {
      const errorData = await putRes.json();
      throw new Error(`GitHub API Error: ${errorData.message}`);
    }

    return { 
      statusCode: 200, 
      body: JSON.stringify({ message: "Comment saved and synced to GitHub!" }) 
    };

  } catch (error) {
    console.error("Function Error:", error);
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: error.message }) 
    };
  }
};
