# 5 Instagram Feed Widget Options

Comparison for embedding a **live** Instagram feed (e.g. **@awakeandalign_**) on the site. All work by entering your username and pasting an embed URL or code into the app.

---

## 1. **EmbedSocial**

| | |
|---|--|
| **Site** | [embedsocial.com/free-instagram-widget](https://embedsocial.com/free-instagram-widget) |
| **Free tier** | Forever free, no credit card |
| **Setup** | Sign up → connect/enter username → create widget → copy iframe URL |
| **Layouts** | Carousel, grid, masonry, slideshow |
| **Branding** | “Powered by EmbedSocial” on free plan |
| **Notes** | Uses official Instagram API (stable). 300k+ brands. Multiple widgets allowed. |

**Best for:** Reliable, long-term free option with several layouts and official API.

---

## 2. **Curator.io**

| | |
|---|--|
| **Site** | [curator.io](https://curator.io) |
| **Free tier** | Free forever – 3 sources/feeds |
| **Setup** | Sign up → add Instagram source (username) → pick layout → copy embed (iframe) |
| **Layouts** | 20+ templates, grid/carousel/masonry, lightweight |
| **Branding** | Small “Powered by Curator” link |
| **Notes** | Fast load, iframe-friendly, under 5 min setup. |

**Best for:** Minimal branding and a solid free plan with multiple feeds.

---

## 3. **SnapWidget**

| | |
|---|--|
| **Site** | [snapwidget.com](https://snapwidget.com) |
| **Free tier** | Free with limits; watermarks on free plan |
| **Setup** | Sign up → enter username → choose widget → copy embed URL |
| **Layouts** | Grid, slideshow, simple and lightweight |
| **Branding** | Visible on free tier |
| **Notes** | Very simple, used by many sites. Fewer features than others. |

**Best for:** Easiest “just get something up” option; accept watermark or upgrade.

---

## 4. **Elfsight**

| | |
|---|--|
| **Site** | [elfsight.com](https://elfsight.com) |
| **Free tier** | Limited free; paid from ~$5/month |
| **Setup** | Sign up → add Instagram widget → customize → get embed code/URL |
| **Layouts** | 50+ options, carousel/grid/masonry, drag-and-drop |
| **Branding** | Depends on plan |
| **Notes** | Many customization options; full power often needs paid plan. |

**Best for:** Maximum design control if you’re okay with a paid plan.

---

## 5. **POWR**

| | |
|---|--|
| **Site** | [powr.io](https://powr.io) (Instagram Feed app) |
| **Free tier** | Free tier available; paid for more features |
| **Setup** | Sign up → add Instagram Feed app → connect account → copy embed |
| **Layouts** | Multiple feed styles, auto-refresh |
| **Branding** | Varies by plan |
| **Notes** | Good reviews on Shopify etc.; works on many platforms. |

**Best for:** If you already use or prefer POWR’s ecosystem.

---

## Recommended choice: **EmbedSocial**

**Why it’s the best fit here:**

1. **Forever free** – No credit card, no trial expiry.
2. **Official Instagram API** – Fewer breakages than scrapers or unofficial APIs.
3. **Iframe URL** – Fits the existing setup: paste URL into `NEXT_PUBLIC_INSTAGRAM_EMBED_IFRAME_URL` and restart the app.
4. **Carousel layout** – Matches the “carousel” style you already have in the design.
5. **Widely used** – 300k+ brands; well maintained and documented.

**Close second:** **Curator.io** – Same idea (username → iframe), minimal branding, and 3 free feeds if you ever need more than one source.

---

## How to use the winner (EmbedSocial) with this project

1. Go to [embedsocial.com/free-instagram-widget](https://embedsocial.com/free-instagram-widget).
2. Sign up and create a widget for **@awakeandalign_**.
3. Choose a **carousel** (or grid) layout and copy the **iframe URL** (the `src="..."` part).
4. In the project root, in **`.env.local`**:
   ```env
   NEXT_PUBLIC_INSTAGRAM_EMBED_IFRAME_URL="https://embedsocial.com/embed/xxxxx"
   ```
5. Restart the dev server (`npm run dev`). The Instagram section will show the live widget.

Full step-by-step is in **`docs/INSTAGRAM-WIDGET-SETUP.md`**.
