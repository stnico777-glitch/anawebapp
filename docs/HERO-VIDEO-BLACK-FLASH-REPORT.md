# Hero Video Black Flash — Investigation Report

## Summary

When switching between hero videos 1 → 2 → 3, a brief black flash appears. The root cause is **swapping which video is visible on the `playing` event**, which fires before the first frame is actually painted. Additional contributors: a 150ms opacity transition (unwanted fade) and redundant `<source>` usage.

---

## Current Logic (HeroVideo.tsx)

- **Two video elements** (slot 0 and 1): one visible (`opacity: 1`), one hidden (`opacity: 0`).
- The visible one plays `HERO_VIDEOS[currentIndex]`; the hidden one preloads `HERO_VIDEOS[nextIndex]`.
- On **ended** of the visible video → `goToNext()`:
  1. On the **hidden** element: add a one-shot `"playing"` listener, set `currentTime = 0`, call `play()`.
  2. When **"playing"** fires: remove listener, pause the previous video, call `setVisibleSlot(1 - visibleSlot)` and `setCurrentIndex(next)` so the preloaded video becomes visible.

---

## Root Causes

### 1. **`playing` fires before the first frame is on screen (primary)**

- The HTML5 **`playing`** event fires when playback is *ready to start*, not when the first frame has been decoded and **composited**.
- The code flips visibility (hidden → visible) as soon as `playing` fires, so for one or more frames the newly visible element can still show **no frame** (black) until the compositor gets the first frame.
- **Fix:** Only swap visibility when the first frame is actually ready for composition, e.g. using **`requestVideoFrameCallback()`** (with a fallback for older browsers).

### 2. **Opacity transition causes a short fade**

- The videos use `transition-opacity duration-150`. When we set the new video to `opacity: 1`, it transitions from 0 → 1 over 150ms.
- You asked for an **immediate cut**, not a fade. That transition also increases the chance of seeing an intermediate state (e.g. black) if the first frame isn't ready yet.
- **Fix:** Remove the opacity transition so the visible/hidden switch is an instant cut.

### 3. **Redundant `<source>`**

- Both the `<video>` element's `src` and a child `<source>` set the same URL. This is redundant and can lead to inconsistent loading or double work in some browsers.
- **Fix:** Use only the `src` attribute on `<video>` and remove the `<source>` element.

### 4. **Possible extra: updating the hidden element's `src` in the same render**

- On `setVisibleSlot` + `setCurrentIndex`, React re-renders and the **previously visible** (now hidden) element gets its `src` updated to the next video in the cycle for preloading. Changing `src` can clear and reload the element; in theory that could affect compositing. In practice, the main fix is (1) and (2); we can defer this `src` update if needed.

---

## Solution Implemented

1. **First-frame readiness:** Use **`requestVideoFrameCallback()`** when available; when it fires (first frame delivered to compositor), perform the swap. Fallback: wait for the first **`timeupdate`** after **`playing`** (with `currentTime > 0`) so we're past "playback started" before showing.
2. **Instant cut:** Remove `transition-opacity duration-150` from the video elements so the switch is an immediate cut with no fade.
3. **Single source of truth:** Use only `src` on `<video>` and remove the `<source>` child.

Result: we only make the preloaded video visible after its first frame is ready, and we do it with an instant cut and no fade, eliminating the black flash.
