Please read this blog post to understand how this project and these files were put together. 

These are only the files needed to make the Astro Static Comments function work, in the context of my Astro blog theme Fuwari.

You will probably need to modify the location and references based on how your theme works.


| path/File                                                       | Purpose |
| ------------------------------------- | ---------------------------------------------------------- |
| scripts/fetch-comments.js             | Javascript that talks to Mastodon and generates JSON.      |
| package.json                          | Update this so that fetch-comments.js runs before the site is built. |
| src/components/MastodonComments.astro | Astro Template that displays the JSON content as HTML.  |
| .github/workflows/fetch-comments.yml  | Github Action that runs fetch-comments.js once a week.|
| src/data/comments/                    | The folder where your comments are saved permanently as JSON files that map to your blog posts.|
| src/pages/posts/[...slug].astro       | Update this so that the comments will load on each blog posts. If you use a different astro theme from me (I use Fuwari), you will probably have a different template you need to update. |
| src/content/config.ts                 | Update this so that Astro knows you added new frontmatter sections

How it works
1. The Data Source (Mastodon)
    - You add mastodon_id and mastodon_instance to your blog post's frontmatter. ID = post ID, Instance = What mastodon server you're on. 
2. The Persistence Layer (GitHub Actions)
    - An automated script (fetch-comments.js) runs once a week or whenever you trigger it manually with Github Actions.
    -  It scans your posts for the mastodon_id and mastodon_instance in the front matter, and fetch the latest replies from Mastodon. There are no dependencies because it uses Node.js which is already part of my Astro build (I think?). 
    - It commits these comments as JSON files directly into your Github repository (src/data/comments/).
3. The Display Layer (Astro & Netlify)
   -  When the JSON files are updated (or you write a new markdown post), Netlify automatically detects the change and triggers a build.
   - The MastodonComments.astro component reads these local JSON files during the build process.
   - It generates static HTML with your custom styling
   - If it's unable to find a JSON comments file, Netlify will make a live call to the Mastodon API to pull the thread and replies of mastodon post specified in the frontmatter, similar to the original Mastodon-Comments.js file. 
