This is a folder to store manual comments that I enter from other mastodon posts or received through the contact form. 

WHen you create the json file, it needs to match the post slug (all lowercase and dashes instead of spaces).

To add manual comments that blend perfectly with your Mastodon-sourced ones, your JSON file must follow the specific structure expected by the component.

Create a file at src/data/manual-comments/your-post-slug.json and use this template:
JSON

<code>
[
  {
    "id": "manual-001",
    "created_at": "2024-05-20T12:00:00.000Z",
    "url": "https://yourblog.com/contact",
    "content": "<p>This is the comment text. You can use <b>HTML</b> tags like links or bold text here.</p>",
    "favourites_count": 0,
    "reblogs_count": 0,
    "account": {
      "username": "guest",
      "acct": "Guest",
      "display_name": "Friendly Reader",
      "url": "#",
      "avatar_static": "https://api.dicebear.com/7.x/bottts/svg?seed=Lucky"
    },
    "media_attachments": []
  }
]
</code>

Key Fields Explained:

    id: Give it a unique string (e.g., "manual-001"). If you add more comments to the same file, make sure their IDs are different.

    created_at: Use the ISO format (YYYY-MM-DDTHH:MM:SSZ). Our component uses this to sort the comments, so if you want this to appear at the top, give it a very recent date.

    content: Must be wrapped in HTML tags (usually <p>) because the component uses set:html to render it.

    account:

        display_name: The name shown in bold.

        acct: The handle shown with the @ symbol.

        avatar_static: A link to an image. If the person didn't provide one, I recommend using a service like DiceBear (as shown in the template) which generates a consistent "bot" or "human" icon based on the name you put in the seed.

    media_attachments: Keep this as an empty array [] unless you want to manually link an image.

Pro-Tips for Manual Comments:

    The "Author" Badge: If you want to add a manual comment as yourself, set the username inside the account block to "navi". The component will automatically give you the "Author" badge.

    Multiple Comments: The file starts with [ and ends with ]. This means it is an array. To add a second manual comment to the same post, just put a comma after the first {} block and add another one.

### Recommended Online Tools to turn content into valid JSON string

*   [**JSON Stringify Text (Online Text Tools)**](https://onlinetexttools.com/json-stringify-text): This is probably the best one for your specific needs. You paste your raw HTML on the left, and it instantly gives you the "quoted and escaped" version on the right.
    
*   [**JSONLint Stringify**](https://jsonlint.com/json-stringify): Great for taking a block of text and making it "string-safe."
    
*   [**FreeFormatter JSON Escape**](https://www.freeformatter.com/json-escape.html): A very reliable classic for developers.
