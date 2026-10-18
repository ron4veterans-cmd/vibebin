"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { getLocalUser, setLocalUser } from "@/lib/store";
import { Button } from "@/components/Button";
import {
  FREE_PROMPT_LIMIT,
  PRO_MONTHLY_PRICE,
  PRO_YEARLY_PRICE,
} from "@/types";
import { IconCheck } from "@/components/Icons";

export default function UpgradePage() {
  const router = useRouter();
  const user = typeof window !== "undefined" ? getLocalUser() : null;

  const activatePro = (plan: "monthly" | "yearly") => {
    if (!user) {
      router.push("/login");
      return;
    }
    // Demo: instantly upgrade. Real Stripe checkout comes next.
    setLocalUser({ ...user, isPro: true });
    router.push("/library");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            VibeBin
          </Link>
          <Link
            href="/library"
            className="text-sm text-muted hover:text-foreground"
          >
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

        <div className="mt-10 grid sm:grid-cols-2 gap-6">
          {/* Monthly */}
          <div className="border border-border rounded-xl p-6 bg-surface">
            <h2 className="font-medium">Monthly</h2>
            <p className="mt-2 text-3xl font-semibold">
              ${PRO_MONTHLY_PRICE}
              <span className="text-base font-normal text-muted">/mo</span>
            </p>
            <ul className="mt-6 space-y-2.5 text-sm text-muted">
              <li className="flex gap-2">
                <IconCheck className="w-4 h-4 text-success shrink-0 mt-0.5" />
                Unlimited prompts & agent configs
              </li>
              <li className="flex gap-2">
                <IconCheck className="w-4 h-4 text-success shrink-0 mt-0.5" />
                Collections & folders
              </li>
              <li className="flex gap-2">
                <IconCheck className="w-4 h-4 text-success shrink-0 mt-0.5" />
                Public share links
              </li>
              <li className="flex gap-2">
                <IconCheck className="w-4 h-4 text-success shrink-0 mt-0.5" />
                Export JSON / Markdown
              </li>
            </ul>
            <Button
              className="w-full mt-6"
              onClick={() => activatePro("monthly")}
            >
              Get Pro – ${PRO_MONTHLY_PRICE}/mo
            </Button>
          </div>

          {/* Yearly */}
          <div className="border border-accent/40 rounded-xl p-6 bg-surface relative">
            <div className="absolute -top-3 left-6 bg-accent text-background text-xs font-medium px-2.5 py-0.5 rounded-full">
              Best value
            </div>
            <h2 className="font-medium">Yearly</h2>
            <p className="mt-2 text-3xl font-semibold">
              ${PRO_YEARLY_PRICE}
              <span className="text-base font-normal text-muted">/yr</span>
            </p>
            <p className="text-xs text-accent mt-1">
              ≈ ${(PRO_YEARLY_PRICE / 12).toFixed(2)}/mo · save ~17%
            </p>
            <ul className="mt-6 space-y-2.5 text-sm text-muted">
              <li className="flex gap-2">
                <IconCheck className="w-4 h-4 text-success shrink-0 mt-0.5" />
                Everything in Monthly
              </li>
              <li className="flex gap-2">
                <IconCheck className="w-4 h-4 text-success shrink-0 mt-0.5" />
                Two months free
              </li>
              <li className="flex gap-2">
                <IconCheck className="w-4 h-4 text-success shrink-0 mt-0.5" />
                Priority support
              </li>
            </ul>
            <Button
              className="w-full mt-6"
              onClick={() => activatePro("yearly")}
            >
              Get Pro – ${PRO_YEARLY_PRICE}/yr
            </Button>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-muted">
          Free plan includes {FREE_PROMPT_LIMIT} prompts. Demo upgrade is
          instant — real Stripe billing comes in the next phase.
        </p>
      </main>
    </div>
  );
}
