/**
 * Hosted **Stripe Checkout** (this app) redirects the browser to `session.url` — no `@stripe/stripe-js` is required.
 *
 * If you later add Payment Element / embedded UI, load Stripe.js only from that route — never from `layout.tsx`:
 *
 *   const stripe = await import("@stripe/stripe-js").then((m) => m.loadStripe(publishableKey));
 *
 * Keep the server `stripe` SDK in API routes only.
 */

export {};
