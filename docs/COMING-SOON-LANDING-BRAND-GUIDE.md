# Coming soon page — developer brand guide

Build a standalone **coming soon** landing page that matches **awake + align** (cream palette, Poppins/Open Sans) and optionally the **iMessage-style modal** (warm peach glow + iOS message colors).

---

## Quick start (minimum viable match)

1. Load **Poppins** + **Open Sans** from Google Fonts (see [Fonts](#fonts)).
2. Paste the **`:root` CSS variables** from [Brand tokens (copy-paste)](#brand-tokens-copy-paste).
3. Set `body` background to `--background` (`#FFFCE9`), text to `--foreground` (`#4A4039`).
4. Render the wordmark **`awake + align`** with Poppins semibold, tight letter-spacing (~`-0.025em`).
5. Use `--sky-blue` (`#6EADE4`) for links, focus rings, and accent icons.

If you add a **message UI mock**: use [iMessage colors](#imessage-ui-colors) for bubbles + [glow layer](#imessage-glow-layer-css) behind the phone frame so it matches the site, not flat gray.

---

## Repo map (where values live)

| Path | What to copy from it |
|------|----------------------|
| `src/app/globals.css` | `--background`, `--foreground`, accent tokens, `homepage-imessage-surface`, `animate-welcome-glow`, keyframes |
| `src/app/layout.tsx` | Which Google fonts and weights are registered |
| `src/components/WelcomeMessageBubble.tsx` | Exact modal radii, iOS hex colors, stacked `background` on glow layer |
| `src/components/FloatingMessageBubble.tsx` | FAB: size, ring, sky-blue icon |
| `src/components/SiteHeader.tsx` | Wordmark classes (`text-xl` / `text-2xl`, headline font) |
| `src/components/HeroTitle.tsx` | Hero title + tagline wording |
| `src/components/SunRaysSection.tsx` | Optional full-page peach radial (simplified = fine) |
| `docs/brand-tokens.md` | Short brand-book summary |

---

## Brand tokens (copy-paste)

Drop this in your global CSS (or design tokens file). Hex values match `globals.css`.

```css
:root {
  --background: #fffce9;
  --app-surface: #fffcf7;
  --foreground: #4a4039;
  --cream: #fcf3b3;
  --light-yellow: #fcf3b3;
  --sky-blue: #6eade4;
  --gray: #788287;
  --accent-pink: #e34369;
  --accent-amber: #e6b15c;
  --sunset-peach: #fff4e8;
  --sand: #e8e4d4;
  --muted: #a9b8c3;
  --pastel-blue-light: #e8eef3;
  --font-headline: "Poppins", system-ui, sans-serif;
  --font-body: "Open Sans", system-ui, sans-serif;
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-body);
}
```

### Token cheat sheet

| Variable | Hex | When to use |
|----------|-----|----------------|
| `--background` | `#FFFCE9` | Page background |
| `--foreground` | `#4A4039` | Body copy, headings on cream |
| `--sky-blue` | `#6EADE4` | Links, primary accent, icon strokes |
| `--gray` | `#788287` | Secondary text, masked icon tint |
| `--sand` | `#E8E4D4` | Borders (e.g. `1px solid`) |
| `--cream` | `#FCF3B3` | Highlights / soft accent blocks |

**Note:** In Tailwind on this repo, `cream` maps to `#FCF3B3`; the **page** cream is `--background` `#FFFCE9`.

---

## Fonts

| Role | Font | CSS |
|------|------|-----|
| Logo + headings | Poppins | `font-family: var(--font-headline)` |
| Body | Open Sans | `font-family: var(--font-body)` |

**Weights:** Poppins 300–700; Open Sans 400–700 (see `layout.tsx`).

**Google Fonts `<link>` (non–Next.js):**

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600;700&family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
```

**Reference styles (marketing header):**

- Wordmark: Poppins semibold, `tracking-tight`, ~`1.25rem` mobile / ~`1.5rem` desktop.
- Optional hero on video: Poppins light, large display size, `color: white`, `text-shadow` / `drop-shadow` for legibility.

---

## Copy & naming

| Field | Value |
|-------|--------|
| Wordmark | `awake + align` (lowercase, `+` with spaces) |
| Browser title pattern | `awake + align — Faith + Fitness` |
| Homepage-style tagline | `power • love • sound mind` (lowercase, `•` separators) |

---

## Layout (marketing chrome)

**Sticky header (matches `SiteHeader`):**

- Container: `border-b` with `border-color: var(--sand)` (or `1px solid #E8E4D4`).
- Bar: `background: rgba(255,255,255,0.95)` + `backdrop-filter: blur(8px)` (or equivalent).
- Nav links: small caps feel — `font-size: 0.75rem`, `font-weight: 500`, `letter-spacing: 0.05em`, `text-transform: uppercase`; default `color: var(--foreground)`, hover `color: var(--sky-blue)`.

---

## iMessage UI (optional but on-brand)

The modal is **two systems**:

1. **Brand glow** (warm white + peach at bottom) — same language as the homepage.
2. **iOS chrome** (grays/blues) — so bubbles read as real Messages.

### Phone frame

- `border-radius: 2rem` (32px)
- `max-width: 375px`; height ~`700px`, `max-height: calc(100vh - 3rem)`
- `box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25)` (or `shadow-2xl`)
- `outline: 1px solid rgb(0 0 0 / 0.1)`
- Backdrop behind modal: `rgba(0,0,0,0.5)` + light `backdrop-filter: blur(4px)`

### iMessage UI colors

Use these for **bubbles and chrome** (from `WelcomeMessageBubble.tsx`):

| UI element | Hex |
|------------|-----|
| Incoming bubble | `#E5E5EA` |
| Outgoing bubble | `#007AFF` |
| Outgoing text | `#ffffff` |
| Primary text (labels) | `#000000` |
| Secondary (timestamps, meta) | `#8E8E93` |
| Input border | `#C6C6C8` at ~50% opacity |
| Send / focus blue | `#007AFF` |
| Avatar circle | `#C4B5D4` with white letter |

**Geometry:** message bubbles `border-radius: 18px`; composer input `border-radius: 20px`; message text `font-size: 15px`, `line-height: 1.35`.

### iMessage glow layer (CSS)

Apply to a **full-bleed layer** inside the rounded frame (`position: absolute; inset: 0; border-radius: inherit; pointer-events: none`). This is the important **brand** piece:

```css
.imessage-glow-layer {
  background:
    linear-gradient(
      to bottom,
      rgba(255, 255, 255, 0.98) 0%,
      rgba(255, 255, 255, 0.9) 55%,
      rgba(255, 255, 255, 0.55) 78%,
      rgba(255, 255, 255, 0.12) 100%
    ),
    radial-gradient(
      ellipse 150% 125% at 50% 102%,
      rgba(255, 230, 185, 0.72) 0%,
      rgba(255, 238, 210, 0.45) 28%,
      rgba(254, 250, 240, 0.16) 52%,
      transparent 76%
    ),
    radial-gradient(
      ellipse 110% 82% at 50% 102%,
      rgba(255, 242, 205, 0.78) 0%,
      rgba(255, 235, 198, 0.4) 42%,
      transparent 68%
    );
}

/* Optional pulse on top — see `welcome-glow` keyframes in globals.css */
.imessage-glow-pulse::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: radial-gradient(
    ellipse 100% 90% at 50% 100%,
    rgba(255, 240, 210, 0.4) 0%,
    transparent 55%
  );
  animation: welcome-glow 4s ease-in-out infinite;
}

@keyframes welcome-glow {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
}
```

### Chat motion (if you animate)

- Typing dots: `8px` circles, `#8E8E93`, stagger delays `0ms / 200ms / 400ms`.
- New message: ~`250ms`, from `translateY(8px) scale(0.98)` to identity; easing `cubic-bezier(0.25, 0.8, 0.25, 1)`.
- Modal enter: backdrop fade ~`0.6s`; panel `translateY(80px)` → `0` over ~`1s`, `cubic-bezier(0.32, 0.72, 0, 1)`.

**Accessibility:** `@media (prefers-reduced-motion: reduce)` — disable infinite animations and entrance motion; keep text visible.

---

## Icons & assets

| Asset | Path | Notes |
|-------|------|--------|
| Email arrow (mask) | `public/welcome-email-arrow.png` | Tint with `#788287` via CSS `mask-image` |
| Sun outline (mask) | `public/schedule-sun-outline.png` | Same pattern |
| FAB icon | inline SVG | Stroke ~`1.5`, color `#6EADE4`, 56×56px button, white fill, `1px` sand ring |

**Marketing icons:** outline stroke, not filled; brand accent `#6EADE4` where appropriate.

---

## Optional full-page effects

| Effect | What |
|--------|------|
| Homepage scroll band | Class `homepage-imessage-surface` in `globals.css` — white base + `::before` fixed gradients (white → transparent + bottom peach radials). Copy from file if you need pixel-perfect parity. |
| Global sun | `SunRaysSection` — fixed viewport radials, peach tones, opacity increases with scroll; **static** coming soon page can use one low-opacity bottom radial only. |

---

## Motion class names (reference)

Defined in `globals.css` — search by name if you port to CSS-in-JS:

| Class / keyframe | Purpose |
|------------------|---------|
| `animate-welcome-glow` | Peach pulse on iMessage glow |
| `animate-welcome-bubble-in` | Modal slide up |
| `animate-modal-backdrop-in` | Dimmed backdrop fade |
| `fadeIn` | Short content fade + slight lift |

---

## Pre-launch checklist

- [ ] Fonts loaded (Poppins + Open Sans).
- [ ] `--background` / `--foreground` / `--sky-blue` applied.
- [ ] Wordmark spelling: `awake + align`.
- [ ] iMessage mock: **glow layer** + **iOS bubble colors** if showing chat UI.
- [ ] Focus states visible (e.g. `outline` or `box-shadow` using `--sky-blue`).
- [ ] `prefers-reduced-motion` respected for animations.

---

## See also

- `docs/brand-tokens.md` — condensed brand book.
- `src/app/globals.css` — full gradients and keyframes.
