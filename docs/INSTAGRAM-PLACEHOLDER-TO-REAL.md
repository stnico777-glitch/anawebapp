# Step-by-Step: From Placeholders to Real Instagram on the Carousel

Your homepage carousel can show real Instagram content in **three ways**. Pick one based on how much setup you want.

---

## Choose your path

| Option | Effort | What you get |
|--------|--------|--------------|
| **A) Embed widget** | ~5 min, no API | Third-party iframe (e.g. SnapWidget) – they handle Instagram; you just add one URL. |
| **B) Live Instagram API** | ~20 min, Meta app | Your app fetches posts from Instagram automatically; carousel stays “yours” (no iframe). |
| **C) Admin carousel** | ~2 min, no API | You add posts manually in admin (image URL + link). Good for a few hand-picked posts. |

---

## Option A: Embed widget (fastest, no API)

Use a free widget that embeds your Instagram feed. You only add one URL to your project.

### Step 1: Get an embed URL

1. Go to **[SnapWidget](https://snapwidget.com/free-instagram-feed)** or **[EmbedSocial](https://embedsocial.com/free-instagram-widget)**.
2. Sign up / log in and create a widget using your Instagram username: **awakeandalign_**.
3. When they show embed code, copy the **iframe URL** (the part inside `src="..."`).  
   Example: `https://snapwidget.com/embed/xxxxxx`

### Step 2: Put the URL in your project

1. In the project root (same folder as `package.json`), open **`.env`** or **`.env.local`**.
2. Add this line (use your real URL):

   ```env
   NEXT_PUBLIC_INSTAGRAM_EMBED_IFRAME_URL="https://snapwidget.com/embed/xxxxxx"
   ```

3. Save the file.

### Step 3: Restart and check

1. Stop the dev server (Ctrl+C or Cmd+C).
2. Run **`npm run dev`** again.  
   (Restart is required for `NEXT_PUBLIC_` variables.)
3. Open the homepage and scroll to the Instagram section. You should see the widget feed instead of placeholders.

**Done.** The widget service talks to Instagram; you don’t need tokens or a Meta app.

---

## Option B: Live Instagram API (automatic, your own carousel)

Your app fetches posts from Instagram’s API. Needs an Instagram **Business or Creator** account linked to a **Facebook Page** and a **Meta Developer** app.

### Step 1: Meta app and permissions

1. Go to **[developers.facebook.com](https://developers.facebook.com)** → **My Apps** → **Create App**.
2. Choose **Other** or **Business**, name it (e.g. “Awake & Align”), create.
3. In the app: **Add Products** → add **Instagram** (Instagram Graph API).
4. **App Review** → **Permissions and Features**: request or enable for development:
   - **instagram_basic**
   - **pages_read_engagement** (or **pages_show_list**)

### Step 2: Get your Instagram User ID

1. Open **[Graph API Explorer](https://developers.facebook.com/tools/explorer/)**.
2. Select **your app** and **User or Page** (not “User token” only). Click **Generate Access Token** and grant the permissions above.
3. Run: **`GET /me/accounts`** → Submit. Copy the **id** of the Facebook Page linked to Instagram (Page ID).
4. Run (replace `YOUR_PAGE_ID` with that id):

   ```text
   GET /YOUR_PAGE_ID?fields=instagram_business_account
   ```

5. In the response, copy **`instagram_business_account.id`**. That is your **Instagram User ID**.

### Step 3: Get a long-lived access token

1. In Graph API Explorer, run (replace with your app id, app secret, and current token):

   ```text
   GET /oauth/access_token?grant_type=fb_exchange_token&client_id=YOUR_APP_ID&client_secret=YOUR_APP_SECRET&fb_exchange_token=YOUR_CURRENT_TOKEN
   ```

   - **YOUR_APP_ID** and **YOUR_APP_SECRET**: from your app **Settings → Basic**.
   - **YOUR_CURRENT_TOKEN**: the token shown in the Explorer.

2. Submit. Copy the **access_token** from the response — that’s your **long-lived token**.

### Step 4: Add to your project

1. In project root, open **`.env`** or **`.env.local`**.
2. Add:

   ```env
   INSTAGRAM_ACCESS_TOKEN=your_long_lived_token_here
   INSTAGRAM_USER_ID=your_instagram_user_id_here
   ```

3. Save. Do **not** commit this file.

### Step 5: Restart and check

1. Stop the dev server (Ctrl+C / Cmd+C).
2. Run **`npm run dev`**.
3. Open the homepage and scroll to the Instagram carousel. It should show your latest Instagram posts; each tile links to the real post on Instagram.

If something fails, the app falls back to admin carousel or placeholders. See **docs/INSTAGRAM-LIVE-FEED.md** for more detail and troubleshooting.

---

## Option C: Admin carousel (manual, no API)

You add posts one by one in the admin. Each post = one image URL + one link (usually to an Instagram post).

### Step 1: Open the carousel admin

1. Log in to your app (as an admin).
2. Go to **Admin** (e.g. `/admin`) → **Instagram / Carousel** (or `/admin/carousel`).

### Step 2: Add a post

1. Click **Add post** (or whatever opens the “new post” form).
2. Fill in:
   - **Image URL**:  
     - Use a **direct image URL** from Instagram (right‑click a post image → “Copy image address”), or  
     - A URL from a CDN, or  
     - A path like `/day-previews/foo.png` if you’ve added that file to `public/`.
   - **Link URL**:  
     - The Instagram post URL, e.g. `https://www.instagram.com/p/ABC123/`, or any URL you want the tile to open.
   - **Alt text** (optional): short description for accessibility.
3. Save.

### Step 3: Add more and order

1. Add more posts the same way.
2. Use **Order** / **Sort order** (if the form has it) to control the order (e.g. lower number = first).
3. Save.

### Step 4: Check the homepage

1. Open the homepage and scroll to the Instagram section.
2. If the **live Instagram API** and **embed iframe** are **not** set (or fail), the carousel will use these admin posts instead of placeholders.

So: **placeholders → admin posts** as soon as you add at least one carousel post and the app loads them (from the server or via `/api/carousel`).

---

## Summary: “Placeholders → real Instagram”

- **Fastest:** Option A (embed widget) — one URL in `.env`, restart.
- **Most integrated:** Option B (live API) — token + user id in `.env`, restart.
- **No API / no embed:** Option C (admin) — add posts in `/admin/carousel`; carousel uses them when API/embed aren’t used.

Only one of A or B is “active” at a time: if **NEXT_PUBLIC_INSTAGRAM_EMBED_IFRAME_URL** is set, the page shows the iframe; otherwise it uses the live API (if configured) or admin posts or placeholders.
