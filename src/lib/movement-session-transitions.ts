/** Durations shared by `AppTabHeroBand` (schedule-day chrome) and `ScheduleDayMovementSession`. */
export const MOVEMENT_SESSION_CHROME_FADE_MS = 420;
export const MOVEMENT_SESSION_INTRO_VIDEO_DELAY_MS = 90;

export function movementSessionChromeFadeDurationMs(reducedMotion: boolean): number {
  return reducedMotion ? 0 : MOVEMENT_SESSION_CHROME_FADE_MS;
}
