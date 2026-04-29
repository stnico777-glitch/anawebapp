import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { appBaseUrl, getStripe } from "@/lib/stripe-server";
import { stripePriceIdForInterval } from "@/lib/stripe-price-env";

const bodySchema = z.object({
  interval: z.enum(["month", "year"]),
});

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }

    const json = await request.json();
    const { interval } = bodySchema.parse(json);

    const priceId = stripePriceIdForInterval(interval);

    if (!priceId) {
      return NextResponse.json(
        {
          error:
            "Stripe subscription price IDs are missing. In Stripe Dashboard → Product catalog → your membership product → copy each recurring Price ID (monthly + annual) into env: STRIPE_PRICE_ID_MONTHLY and STRIPE_PRICE_ID_YEARLY (or EXPO_PUBLIC_STRIPE_MONTHLY_PRICE_ID / EXPO_PUBLIC_STRIPE_YEARLY_PRICE_ID if you reuse mobile keys). Then restart the dev server or redeploy.",
        },
        { status: 503 },
      );
    }

    const base = appBaseUrl();
    const stripe = getStripe();
    const uid = session.user.id;
    const checkout = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: session.user.email ?? undefined,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${base}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/subscribe?canceled=1`,
      client_reference_id: uid,
      /** Shared with Awake&Align mobile (camelCase) + web (snake_case). */
      metadata: { supabase_user_id: uid, supabaseUserId: uid },
      subscription_data: {
        metadata: { supabase_user_id: uid, supabaseUserId: uid },
      },
      allow_promotion_codes: true,
    });

    if (!checkout.url) {
      return NextResponse.json({ error: "Checkout did not return a URL" }, { status: 500 });
    }

    return NextResponse.json({ url: checkout.url });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    console.error("[stripe/create-checkout-session]", err);
    return NextResponse.json({ error: "Could not start checkout" }, { status: 500 });
  }
}
