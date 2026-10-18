"use client";

import Link from "next/link";
import { Button } from "./Button";
import { FREE_PROMPT_LIMIT, PRO_MONTHLY_PRICE, PRO_YEARLY_PRICE } from "@/types";

interface LimitModalProps {
  open: boolean;
  onClose: () => void;
}

export function LimitModal({ open, onClose }: LimitModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative w-full max-w-md border border-border rounded-xl bg-surface p-6 shadow-xl">
        <h2 className="text-lg font-semibold">Free limit reached</h2>
        <p className="mt-2 text-sm text-muted leading-relaxed">
          You&apos;ve reached the free limit of {FREE_PROMPT_LIMIT} prompts.
          Upgrade to Pro for unlimited prompts, collections, sharing, and
          export.
        </p>

        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">Monthly</span>
            <span className="font-medium">${PRO_MONTHLY_PRICE}/month</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">Yearly</span>
            <span className="font-medium">
              ${PRO_YEARLY_PRICE}/year{" "}
              <span className="text-accent text-xs">save ~17%</span>
            </span>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2">
          <Link href="/upgrade" className="w-full">
            <Button className="w-full" size="lg">
              Upgrade to Pro
            </Button>
          </Link>
          <Button variant="ghost" className="w-full" onClick={onClose}>
            Maybe later
          </Button>
        </div>
      </div>
    </div>
  );
}
