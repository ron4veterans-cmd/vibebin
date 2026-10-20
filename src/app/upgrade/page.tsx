"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/Button";
import { FREE_PROMPT_LIMIT, PRO_MONTHLY_PRICE, PRO_YEARLY_PRICE } from "@/types";
import { IconCheck } from "@/components/Icons";

export default function UpgradePage() {
  const [loading, setLoading] = useState<"monthly" | "yearly" | null>(null);
  const [error, setError] = useState("");

  const startCheckout = async (plan: "monthly" | "yearly") => {
    setError("User ID wiring coming next");
    setLoading(plan);
  };

  return (
    <div className="min-h-screen p-8 text-center">
      <h1 className="text-2xl">Upgrade</h1>
      <Button onClick={() => startCheckout("monthly")}>Test</Button>
    </div>
  );
}
