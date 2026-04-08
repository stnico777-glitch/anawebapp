# GPU / compositor profiling (before and after)

Use the same viewport, route, and ~10–20 s window for comparable numbers.

1. Open Chrome DevTools → **Performance**, enable **Screenshots** if helpful, record while scrolling the target route (home, community, prayer library with audio playing).
2. Compare **GPU**, **Raster**, **Compositor**, and **Main** time in the summary; expand **Frames** to spot jank.
3. **Rendering** tab → **Frame Rendering Stats** (or Performance monitor) can show FPS while you interact.

Re-run after changes to quantify impact; absolute GPU percentages vary by machine and display scale.

**App-tab hero (`sourceTier="appTabs"`):** compare a main-tab route (e.g. `/schedule`, `/prayer`) before/after regenerating `public/hero-app-tabs-*.mp4` with `npm run hero:app-tabs`. Marketing `/` still uses full-size carousel sources.
