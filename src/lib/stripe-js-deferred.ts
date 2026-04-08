/**
 * When you add `@stripe/stripe-js`, load it only from checkout/subscribe routes — never from `layout.tsx`.
 *
 * Example (subscribe or payment page only):
 *
 *   const stripe = await import("@stripe/stripe-js").then((m) => m.loadStripe(publishableKey));
 *
 * Keep `stripe` (server SDK) in API routes only; the browser bundle should not import Stripe until needed.
 */

export {};
