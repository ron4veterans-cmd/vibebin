import { NextResponse } from "next/server";

/**
 * POST /api/stripe/webhook
 * Handles Stripe subscription events and updates the user profile.
 *
 * Events to handle in production:
 * - checkout.session.completed
 * - customer.subscription.updated
 * - customer.subscription.deleted
 *
 * Requires STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, and Supabase service role.
 */
export async function POST(request: Request) {
  const secret = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secret || !webhookSecret) {
    return NextResponse.json(
      { error: "Stripe webhook not configured" },
      { status: 503 }
    );
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  try {
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(secret);
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    switch (event.type) {
      case "checkout.session.completed":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        // TODO: Update profiles.subscription_status / subscription_plan in Supabase
        // using the customer id from the event.
        console.log(`Stripe event received: ${event.type}`);
        break;
      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 400 });
  }
}
