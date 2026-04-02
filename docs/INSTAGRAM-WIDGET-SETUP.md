# Instagram Feed – Simple Setup (Widget / Plugin)

No API keys or Meta app. You enter your **Instagram username** in a free tool, get an embed link, and add one line to your project.

---

## Carousel still not live? Checklist

- [ ] You created **`.env.local`** in the project root (same folder as `package.json`).
- [ ] You added **exactly** this variable name: `NEXT_PUBLIC_INSTAGRAM_EMBED_IFRAME_URL` (no typos).
- [ ] The value is the full URL in quotes, e.g. `NEXT_PUBLIC_INSTAGRAM_EMBED_IFRAME_URL="https://snapwidget.com/embed/xxxxx"`.
- [ ] You **restarted the dev server** (stop with Ctrl+C, then run `npm run dev` again). Required for `NEXT_PUBLIC_` variables.
- [ ] Your Instagram username in the widget tool is **awakeandalign_** (with the underscore).

If all are done and it still shows placeholders, try a hard refresh (Cmd+Shift+R / Ctrl+Shift+R) or clear the browser cache.

---

## Step 1: Pick a free widget

Use one of these (both have free plans and work with just your username):

| Tool | What you do |
|------|------------------|
| **[SnapWidget](https://snapwidget.com/free-instagram-feed)** | Sign up → enter your Instagram username → choose layout → copy the **embed link** or iframe URL. |
| **[EmbedSocial](https://embedsocial.com/free-instagram-widget)** | Sign up → connect or enter username → create widget → copy the **embed code** or iframe **src** URL. |

You only need the **URL** that their embed uses (the iframe `src`). It usually looks like:

- `https://snapwidget.com/embed/xxxxxx`
- or `https://embedsocial.com/embed/xxxxxx`

If they give you a full `<iframe src="...">` tag, copy only the part inside the quotes after `src=`.

---

## Step 2: Add the URL to your project

1. In your project root, open **`.env.local`** (create it if it doesn’t exist).
2. Add this line (paste your real URL):

   ```env
   NEXT_PUBLIC_INSTAGRAM_EMBED_IFRAME_URL=paste_your_embed_url_here
   ```

   Example:

   ```env
   NEXT_PUBLIC_INSTAGRAM_EMBED_IFRAME_URL=https://snapwidget.com/embed/abc123
   ```

3. Save the file. Don’t commit `.env.local` to git.

---

## Step 3: Restart and check

1. Stop the dev server (Ctrl+C or Cmd+C).
2. Start it again: **`npm run dev`**.
3. Open the homepage. The Instagram section will show the widget feed instead of the default carousel.

---

## Summary

| What | Where |
|------|--------|
| Enter username | SnapWidget or EmbedSocial (their website) |
| Get embed URL | From their “Get code” / “Embed” step (iframe `src`) |
| Put URL in project | `.env.local` → `NEXT_PUBLIC_INSTAGRAM_EMBED_IFRAME_URL=...` |
| Restart | `npm run dev` |

No Meta Developer account, no tokens, no API. The widget service handles connecting to Instagram and updating the feed.

---

## If your tool only gives a script (no iframe URL)

Some widgets give a `<script>` tag instead of an iframe. In that case:

- Prefer a tool that offers an **iframe** or **embed URL** and use the steps above, or  
- Use the [Graph API setup](INSTAGRAM-LIVE-FEED.md) for a custom feed, or  
- Use the **Admin → Instagram Carousel** in your app to add posts manually (image URL + link).

---

## Turning the widget off

Remove the line from `.env.local` (or leave it blank), restart the dev server, and the site will show the built-in carousel again (admin posts or placeholders).
