import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  const secret = process.env.PADDLE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Webhook secret not set" }, { status: 503 });
  }

  const raw = await request.text();
  const signature = request.headers.get("paddle-signature") || "";

  const parts = Object.fromEntries(
    signature.split(";").map((p) => p.split("="))
  );
  const ts = parts.ts;
  const h1 = parts.h1;
  if (!ts || !h1) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const payload = `${ts}:${raw}`;
  const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  if (expected !== h1) {
    return NextResponse.json({ error: "Signature mismatch" }, { status: 400 });
  }

  const event = JSON.parse(raw);
  const eventType = event?.event_type;

  if (eventType === "subscription.created" || eventType === "subscription.updated") {
    const userId = event?.data?.custom_data?.user_id;

    if (userId && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );

      const { error } = await supabase
        .from("profiles")
        .update({ subscription_status: "active" })
        .eq("id", userId);

      console.log("Webhook update:", error || "success", "userId:", userId);
    }
  }

  return NextResponse.json({ received: true });
}
