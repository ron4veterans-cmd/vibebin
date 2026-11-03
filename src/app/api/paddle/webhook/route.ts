import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import type { SubscriptionPlan, SubscriptionStatus } from "@/types";

export const runtime = "nodejs";

const SUBSCRIPTION_EVENTS = new Set([
  "subscription.created",
  "subscription.activated",
  "subscription.updated",
  "subscription.canceled",
  "subscription.past_due",
  "subscription.paused",
  "subscription.resumed",
]);

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type PaddleSubscription = {
  id?: string;
  status?: string;
  customer_id?: string;
  custom_data?: unknown;
  billing_cycle?: { interval?: string };
  current_billing_period?: { ends_at?: string };
  items?: Array<{ price?: { id?: string }; price_id?: string }>;
};

type PaddleEvent = {
  event_type?: string;
  data?: PaddleSubscription;
};

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

function readUserId(custom: unknown): string | null {
  let value: unknown = custom;
  if (typeof custom === "string") {
    try {
      value = JSON.parse(custom) as unknown;
    } catch {
      return null;
    }
  }
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  const id = record.user_id ?? record.userId;
  return typeof id === "string" && UUID_RE.test(id) ? id : null;
}

function mapStatus(eventType: string, status: string | undefined): SubscriptionStatus | null {
  if (status === "active" || status === "trialing") return "active";
  if (status === "past_due") return "past_due";
  if (status === "canceled" || status === "paused") return "canceled";
  if (eventType === "subscription.canceled" || eventType === "subscription.paused") {
    return "canceled";
  }
  if (eventType === "subscription.past_due") return "past_due";
  if (eventType === "subscription.activated" || eventType === "subscription.resumed") {
    return "active";
  }
  return null;
}

function mapPlan(data: PaddleSubscription): SubscriptionPlan {
  const priceId = data.items?.[0]?.price?.id ?? data.items?.[0]?.price_id;
  if (priceId && priceId === process.env.NEXT_PUBLIC_PADDLE_PRICE_YEARLY) return "yearly";
  if (priceId && priceId === process.env.NEXT_PUBLIC_PADDLE_PRICE_MONTHLY) return "monthly";
  if (data.billing_cycle?.interval === "year") return "yearly";
  if (data.billing_cycle?.interval === "month") return "monthly";
  return null;
}

export async function POST(request: Request) {
  const secret = process.env.PADDLE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Webhook secret not set" }, { status: 503 });
  }

  const raw = await request.text();
  const signature = request.headers.get("paddle-signature") || "";
  const parts = Object.fromEntries(
    signature.split(";").map((part) => {
      const index = part.indexOf("=");
      return [part.slice(0, index), part.slice(index + 1)];
    })
  );
  const ts = parts.ts;
  const h1 = parts.h1;
  if (!ts || !h1) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const tsNum = Number(ts);
  if (!Number.isFinite(tsNum) || Math.abs(Date.now() / 1000 - tsNum) > 300) {
    return NextResponse.json({ error: "Stale signature" }, { status: 400 });
  }

  const expected = crypto.createHmac("sha256", secret).update(`${ts}:${raw}`).digest("hex");
  if (!safeEqual(expected, h1)) {
    return NextResponse.json({ error: "Signature mismatch" }, { status: 400 });
  }

  let event: PaddleEvent;
  try {
    event = JSON.parse(raw) as PaddleEvent;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventType = event.event_type ?? "";
  if (!SUBSCRIPTION_EVENTS.has(eventType)) {
    return NextResponse.json({ received: true });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: "Supabase service role not set" }, { status: 503 });
  }

  const data = event.data ?? {};
  const status = mapStatus(eventType, data.status);
  if (!status) {
    return NextResponse.json({ received: true, updated: false });
  }

  const supabase = createClient(supabaseUrl, serviceKey);
  let userId = readUserId(data.custom_data);

  if (!userId && data.customer_id) {
    const { data: row } = await supabase
      .from("profiles")
      .select("id")
      .eq("paddle_customer_id", data.customer_id)
      .maybeSingle();
    if (row && typeof row.id === "string") userId = row.id;
  }

  if (!userId && data.id) {
    const { data: row } = await supabase
      .from("profiles")
      .select("id")
      .eq("paddle_subscription_id", data.id)
      .maybeSingle();
    if (row && typeof row.id === "string") userId = row.id;
  }

  if (!userId) {
    console.log("Paddle webhook: no user for", eventType);
    return NextResponse.json({ received: true, updated: false });
  }

  const patch: Record<string, string | null> = { subscription_status: status };
  const plan = mapPlan(data);
  if (plan) patch.subscription_plan = plan;
  if (data.current_billing_period?.ends_at) {
    patch.current_period_end = data.current_billing_period.ends_at;
  }
  if (data.customer_id) patch.paddle_customer_id = data.customer_id;
  if (data.id) patch.paddle_subscription_id = data.id;

  const { error } = await supabase.from("profiles").update(patch).eq("id", userId);
  if (error) {
    console.log("Paddle webhook update failed:", eventType, error.message);
    return NextResponse.json({ error: "Profile update failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true, updated: true });
}
