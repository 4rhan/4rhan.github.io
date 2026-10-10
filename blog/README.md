# Blog posts

Each post is a folder here containing a `post.md` file plus any images it uses:

```
blog/
  posts.json
  my-new-post/
    post.md
    assets/diagram.png   <- referenced in post.md as assets/diagram.png
```

To publish a post:

1. Create `blog/<slug>/post.md`. A leading `# Title` line is dropped, because the title comes from `posts.json`.
2. Add an entry to the top of `blog/posts.json`:

   ```json
   {
     "slug": "my-new-post",
     "title": "My New Post",
     "authors": ["Arhan Chavare"],
     "date": "2026-10",
     "summary": "One or two sentences shown on the Blogs page.",
     "tags": ["RL"]
   }
   ```

   Set `"comingSoon": true` (no `post.md` needed) to list a post before it's written.

Posts are rendered in the browser from Markdown, with `$inline$` and `$$display$$` maths via KaTeX.
Image and link paths in `post.md` are relative to the post's folder.

To preview locally, serve the site (`python3 -m http.server`) rather than opening the HTML file directly.
