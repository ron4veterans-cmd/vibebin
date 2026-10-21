"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/Button";
import {
  FREE_PROMPT_LIMIT,
  PRO_MONTHLY_PRICE,
  PRO_YEARLY_PRICE,
} from "@/types";
import { IconCheck } from "@/components/Icons";

export default function UpgradePage() {
  const [loading, setLoading] = useState<"monthly" | "yearly" | null>(null);
  const [error, setError] = useState("");

  const startCheckout = async (plan: "monthly" | "yearly") => {
    const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
    const priceId =
      plan === "yearly"
        ? process.env.NEXT_PUBLIC_PADDLE_PRICE_YEARLY
        : process.env.NEXT_PUBLIC_PADDLE_PRICE_MONTHLY;

    if (!token || !priceId) {
      setError("Paddle is not configured yet.");
      return;
    }

    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    if (!supabase) {
      setError("Auth not available.");
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setError("Please sign in first.");
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
    script.onload = () => {
      // @ts-expect-error
      // @ts-expect-error
      Paddle.Initialize({ token });
      // @ts-expect-error
      Paddle.Checkout.open({
        items: [{ priceId, quantity: 1 }],
        customData: { user_id: user.id },
      });
    };
    document.body.appendChild(script);
    setLoading(plan);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            VibeBin
          </Link>
          <Link href="/library" className="text-sm text-muted hover:text-foreground">
            Back to library
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto px-6 py-12 w-full">
        <h1 className="text-3xl font-semibold tracking-tight text-center">
          Upgrade to Pro
        </h1>
        <p className="mt-3 text-muted text-center max-w-md mx-auto">
          Unlimited prompts, collections, sharing, and export. Cancel anytime.
        </p>

        {error && (
          <div className="mt-6 max-w-md mx-auto rounded-lg border border-destructive/40 
bg-destructive/10 p-3 text-sm text-destructive text-center">
            {error}
          </div>
        )}

        <div className="mt-10 grid sm:grid-cols-2 gap-6">
          <div className="border border-border rounded-xl p-6 bg-surface">
            <h2 className="font-medium">Monthly</h2>
            <p className="mt-2 text-3xl font-semibold">
              ${PRO_MONTHLY_PRICE}
              <span className="text-base font-normal text-muted">/mo</span>
            </p>
            <ul className="mt-6 space-y-2.5 text-sm text-muted">
              <li className="flex gap-2"><IconCheck className="w-4 h-4 text-success shrink-0 mt-0.5" /> 
Unlimited prompts</li>
              <li className="flex gap-2"><IconCheck className="w-4 h-4 text-success shrink-0 mt-0.5" /> 
Collections</li>
              <li className="flex gap-2"><IconCheck className="w-4 h-4 text-success shrink-0 mt-0.5" /> 
Share links</li>
              <li className="flex gap-2"><IconCheck className="w-4 h-4 text-success shrink-0 mt-0.5" /> 
Export</li>
            </ul>
            <Button className="w-full mt-6" disabled={loading !== null} onClick={() => 
startCheckout("monthly")}>
              {loading === "monthly" ? "Opening…" : `Get Pro – $${PRO_MONTHLY_PRICE}/mo`}
            </Button>
          </div>

          <div className="border border-accent/40 rounded-xl p-6 bg-surface relative">
            <div className="absolute -top-3 left-6 bg-accent text-background text-xs font-medium px-2.5 
py-0.5 rounded-full">
              Best value
            </div>
            <h2 className="font-medium">Yearly</h2>
            <p className="mt-2 text-3xl font-semibold">
              ${PRO_YEARLY_PRICE}
              <span className="text-base font-normal text-muted">/yr</span>
            </p>
            <p className="text-xs text-accent mt-1">≈ ${(PRO_YEARLY_PRICE / 12).toFixed(2)}/mo</p>
            <ul className="mt-6 space-y-2.5 text-sm text-muted">
              <li className="flex gap-2"><IconCheck className="w-4 h-4 text-success shrink-0 mt-0.5" /> 
Everything in Monthly</li>
              <li className="flex gap-2"><IconCheck className="w-4 h-4 text-success shrink-0 mt-0.5" /> 
Two months free</li>
            </ul>
            <Button className="w-full mt-6" disabled={loading !== null} onClick={() => 
startCheckout("yearly")}>
              {loading === "yearly" ? "Opening…" : `Get Pro – $${PRO_YEARLY_PRICE}/yr`}
            </Button>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-muted">
          Free plan includes {FREE_PROMPT_LIMIT} prompts. Payments by Paddle.
        </p>
      </main>
    </div>
  );
}
