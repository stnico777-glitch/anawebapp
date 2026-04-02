# How to Set Up the Live Instagram Feed

This guide walks you through connecting your Instagram account so the homepage carousel shows your latest posts automatically.

---

## Before You Start

You’ll need:

- An **Instagram Business or Creator account** (Settings → Account type). Personal accounts don’t work with the API.
- A **Facebook Page** linked to that Instagram account (Instagram Settings → Account → Linked accounts → Facebook).
- A **Meta (Facebook) Developer account** (free) at [developers.facebook.com](https://developers.facebook.com).

---

## Step 1: Create a Meta App

1. Go to **[developers.facebook.com](https://developers.facebook.com)** and log in.
2. Click **My Apps** → **Create App**.
3. Choose **Other** or **Business** → **Next**.
4. Name the app (e.g. “Awake & Align”) and add your contact email → **Create App**.

---

## Step 2: Add Instagram and Get Permissions

1. In the app dashboard, open **Add Products** (or **Products** in the left menu).
2. Find **Instagram** and click **Set up**.
3. Use **Instagram Graph API** (with Facebook Login).
4. Go to **App Review** → **Permissions and Features**.
5. Request (or enable for development):
   - **instagram_basic**
   - **pages_read_engagement** or **pages_show_list**

In **Development** mode, these can be used without full App Review.

---

## Step 3: Get Your Instagram User ID

1. Open the **[Graph API Explorer](https://developers.facebook.com/tools/explorer/)**.
2. At the top, select **your app** and choose **User or Page** (not “User token” only).
3. Click **Generate Access Token** and allow the permissions you added (e.g. `instagram_basic`, `pages_read_engagement`).
4. In the query box, run:
   ```text
   GET /me/accounts
   ```
   Click **Submit**. In the response, find the **id** of your Facebook Page (the one linked to Instagram). Copy that **Page ID**.

5. Change the query to (replace `YOUR_PAGE_ID` with the id you copied):
   ```text
   GET /YOUR_PAGE_ID?fields=instagram_business_account
   ```
   Click **Submit**. In the response you’ll see something like:
   ```json
   "instagram_business_account": {
     "id": "17841400008460056"
   }
   ```
   Copy that **id**. This is your **Instagram User ID**.

---

## Step 4: Get a Long-Lived Access Token

The token from the Graph API Explorer is short-lived (about an hour). You need a long-lived one (about 60 days).

1. In the Graph API Explorer, with your app and token selected, run:
   ```text
   GET /oauth/access_token?grant_type=fb_exchange_token&client_id=YOUR_APP_ID&client_secret=YOUR_APP_SECRET&fb_exchange_token=YOUR_CURRENT_TOKEN
   ```
   Replace:
   - **YOUR_APP_ID** → from your app’s **Settings → Basic**
   - **YOUR_APP_SECRET** → from the same page (click **Show**)
   - **YOUR_CURRENT_TOKEN** → the access token shown in the Explorer

2. Click **Submit**. The response will include an **access_token**. Copy that token — this is your **long-lived access token**.

(For production, consider a **Page** access token or automated token refresh; for testing, this token is enough.)

---

## Step 5: Add the Values to Your Project

1. In your project root, open **`.env.local`** (create it if it doesn’t exist).
2. Add these two lines (use your real values):

   ```env
   INSTAGRAM_ACCESS_TOKEN=paste_your_long_lived_token_here
   INSTAGRAM_USER_ID=paste_your_instagram_user_id_here
   ```

3. Save the file. Don’t commit `.env.local` to git (it should be in `.gitignore`).

---

## Step 6: Restart the App

1. Stop the dev server (Ctrl+C or Cmd+C).
2. Start it again: **`npm run dev`**.
3. Open the homepage. The carousel should load your latest Instagram posts. If the API isn’t configured or returns an error, the site falls back to admin carousel posts or placeholders.

---

## Quick Reference

| What you need        | Where it comes from                                                                 |
|----------------------|--------------------------------------------------------------------------------------|
| Instagram User ID     | `GET /YOUR_PAGE_ID?fields=instagram_business_account` → `instagram_business_account.id` |
| Long-lived token     | `GET /oauth/access_token?grant_type=fb_exchange_token&...&fb_exchange_token=CURRENT_TOKEN` |

**Env variables:**

```env
INSTAGRAM_ACCESS_TOKEN=your_long_lived_token
INSTAGRAM_USER_ID=your_instagram_user_id
```

---

## Troubleshooting

- **Carousel still shows placeholders**  
  - Confirm both `INSTAGRAM_ACCESS_TOKEN` and `INSTAGRAM_USER_ID` are set in `.env.local`.  
  - Restart the dev server after changing env.

- **“Instagram API error” or empty feed**  
  - Check that the Instagram account is **Business or Creator** and linked to the **Facebook Page**.  
  - Ensure the token has **instagram_basic** and **pages_read_engagement** (or **pages_show_list**).  
  - In the Explorer, test: `GET /YOUR_INSTAGRAM_USER_ID/media?fields=id,media_url,permalink` with your token.

- **Token stopped working**  
  - Long-lived user tokens expire (e.g. after ~60 days). Generate a new long-lived token and update `INSTAGRAM_ACCESS_TOKEN`. For production, use a Page token or refresh logic.

---

## What Happens in the App

- The homepage carousel calls **`/api/instagram/feed`**.
- That route uses your token and Instagram User ID to fetch recent posts from the Instagram Graph API (cached for about 1 hour).
- If that succeeds, the carousel shows those posts; each tile links to the post on Instagram.
- If the API isn’t set up or returns an error, the carousel uses posts from **Admin → Instagram Carousel** or the built-in placeholders.
