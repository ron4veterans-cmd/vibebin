import { NextResponse } from "next/server";

/**
 * POST /api/stripe/checkout
 * Creates a Stripe Checkout session for Pro monthly or yearly.
 *
 * Body: { plan: "monthly" | "yearly" }
 *
 * Requires STRIPE_SECRET_KEY and STRIPE_PRICE_MONTHLY / STRIPE_PRICE_YEARLY.
 * When env is missing, returns a clear error so the UI can fall back to demo mode.
 */
export async function POST(request: Request) {
  const secret = process.env.STRIPE_SECRET_KEY;
  const priceMonthly = process.env.STRIPE_PRICE_MONTHLY;
  const priceYearly = process.env.STRIPE_PRICE_YEARLY;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (!secret || !priceMonthly || !priceYearly) {
    return NextResponse.json(
      {
        error: "Stripe is not configured. Use the demo upgrade on /upgrade for now.",
        demo: true,
      },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const plan = body.plan === "yearly" ? "yearly" : "monthly";
    const priceId = plan === "yearly" ? priceYearly : priceMonthly;

    // Dynamic import so the app builds without the stripe package until installed
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(secret);

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/library?upgraded=1`,
      cancel_url: `${appUrl}/upgrade`,
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json(
      { error: "Could not create checkout session" },
      { status: 500 }
    );
  }
}
