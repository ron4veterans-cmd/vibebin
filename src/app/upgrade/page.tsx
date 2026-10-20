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

  const startCheckout = (plan: "monthly" | "yearly") => {
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

  // Get current user ID
  const { createClient } = await import("@/lib/supabase/client");
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    setError("Please sign in first.");
    return;
  }

  const script = document.createElement("script");
  script.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
  script.onload = () => {
    // @ts-expect-error
    Paddle.Environment.set("sandbox");
    // @ts-expect-error
    Paddle.Initialize({ token });
    // @ts-expect-error
    Paddle.Checkout.open({
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
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setError("Please sign in first.");
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
    script.onload = () => {
      // @ts-expect-
