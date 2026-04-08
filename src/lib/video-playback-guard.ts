/** Pause any other in-app video element when one starts playing (single decode / GPU budget). */

let activeElement: HTMLVideoElement | null = null;

export function claimVideoPlayback(el: HTMLVideoElement | null) {
  if (!el) return;
  if (activeElement && activeElement !== el && !activeElement.paused) {
    activeElement.pause();
  }
  activeElement = el;
}

export function releaseVideoPlayback(el: HTMLVideoElement | null) {
  if (activeElement === el) activeElement = null;
}
