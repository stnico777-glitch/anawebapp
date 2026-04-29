import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { appBaseUrl, getStripe } from "@/lib/stripe-server";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const profile = await prisma.profile.findUnique({
    where: { id: session.user.id },
    select: { stripeCustomerId: true },
  });

  if (!profile?.stripeCustomerId?.trim()) {
    return NextResponse.json(
      { error: "No Stripe customer on file yet. Complete a subscription checkout first." },
      { status: 400 },
    );
  }

  try {
    const stripe = getStripe();
    const portal = await stripe.billingPortal.sessions.create({
      customer: profile.stripeCustomerId,
      return_url: `${appBaseUrl(request)}/subscribe`,
    });
    if (!portal.url) {
      return NextResponse.json({ error: "Portal did not return a URL" }, { status: 500 });
    }
    return NextResponse.json({ url: portal.url });
  } catch (e) {
    console.error("[stripe/create-portal-session]", e);
    return NextResponse.json({ error: "Could not open billing portal" }, { status: 500 });
  }
}
