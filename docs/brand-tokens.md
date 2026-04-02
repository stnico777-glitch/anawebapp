# Brand tokens (awake + align)

Reference for design tokens from the brand book.

## Typography

- **Headlines:** Poppins (`--font-headline` / `var(--font-poppins)`)
- **Body / UI:** Open Sans (`--font-body` / `var(--font-open-sans)`)

## Colors

### Primary

- **Cream:** `#FFFCE9` — main background
- **Light yellow:** `#FCF3B3` — accents, highlights
- **Sky blue:** `#6EADE4` — primary accent (links, buttons)

### Secondary

- **Gray:** `#788287` — muted text, secondary UI
- **Accent pink:** `#E34369` — CTAs, alerts
- **Accent amber:** `#E6B15C` — warm accent

## Tailwind usage

- `bg-cream`, `text-cream`, `border-cream`
- `bg-light-yellow`, `text-sky-blue`, `bg-sky-blue`
- `text-gray`, `bg-accent-pink`, `bg-accent-amber`

CSS variables: `--cream`, `--light-yellow`, `--sky-blue`, `--gray`, `--accent-pink`, `--accent-amber`.

## Phase 3 (optional)

- **Hero:** Brand book uses soft sky/cloud and sun-over-water motif; hero video and top bar already use sky-blue. For full alignment, consider a gradient or static asset in cream/light-yellow/sky-blue.
- **Icons:** Brand uses minimal line-art (sun, waves, birds, palms). Existing UI icons use `text-gray`; optional future pass could use line-art assets.
- **Accessibility:** Primary text uses `--foreground` (#4A4039) on `--background` (#FFFCE9). Sky-blue links/buttons on cream meet contrast for large text; verify critical CTAs if needed.
