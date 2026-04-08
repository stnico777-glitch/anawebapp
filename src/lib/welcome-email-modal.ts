/** Session keys + event for WelcomeMessageBubble / FloatingMessageBubble */
export const WELCOME_MODAL_SEEN_KEY = "awake-align-welcome-modal-seen";
export const WELCOME_REOPEN_EVENT = "awake-align-reopen-welcome";
/** Same-tab: sessionStorage writes do not fire `storage`; bubble listens for this instead of polling. */
export const WELCOME_BUBBLE_STORAGE_EVENT = "awake-align-welcome-bubble-storage";

export function notifyWelcomeBubbleStorageChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(WELCOME_BUBBLE_STORAGE_EVENT));
}
/** Set when user closes the modal without submitting email — floating bubble shows a nudge */
export const WELCOME_BUBBLE_NUDGE_KEY = "awake-align-welcome-bubble-nudge";
/** Set after they submit their email — floating bubble shows a thank-you line */
export const WELCOME_BUBBLE_SUCCESS_KEY = "awake-align-welcome-bubble-success";
/** User dismissed the text pill above the FAB — FAB stays; pill can show again after a new modal outcome */
export const WELCOME_BUBBLE_PILL_DISMISSED_KEY = "awake-align-welcome-bubble-pill-dismissed";
