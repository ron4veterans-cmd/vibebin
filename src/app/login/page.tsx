"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { safeNextPath } from "@/lib/utils";
import { Button } from "@/components/Button";
import { IconGoogle } from "@/components/Icons";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <LoginShell>
          <Button type="button" className="w-full gap-2" disabled>
            <IconGoogle className="w-4 h-4" />
            Continue with Google
          </Button>
        </LoginShell>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const error =
    actionError ||
    (searchParams.get("error") === "auth"
      ? "Google sign-in didn't finish. Try again."
      : "");

  const signInWithGoogle = async () => {
    setActionError("");
    setLoading(true);

    const supabase = createClient();
    if (!supabase) {
      setActionError("Auth not available.");
      setLoading(false);
      return;
    }

    const next = safeNextPath(searchParams.get("next"));
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });

    if (authError) {
      setActionError(authError.message);
      setLoading(false);
    }
  };

  return (
    <LoginShell>
      {error && <p className="mb-4 text-sm text-destructive text-center">{error}</p>}

      <Button
        type="button"
        className="w-full gap-2"
        disabled={loading}
        onClick={signInWithGoogle}
      >
        <IconGoogle className="w-4 h-4" />
        {loading ? "Redirecting…" : "Continue with Google"}
      </Button>
    </LoginShell>
  );
}

function LoginShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <Link href="/" className="text-2xl font-semibold tracking-tight mb-1">
        VibeBin
      </Link>
      <p className="text-muted text-sm mb-8">Never lose a good prompt again</p>

      <div className="w-full max-w-sm border border-border rounded-xl p-6 bg-surface">
        <h1 className="text-lg font-medium text-center mb-2">Sign in</h1>
        <p className="text-sm text-muted text-center mb-6">
          Use your Google account. No password to remember.
        </p>

        {children}
      </div>

      <Link href="/" className="mt-6 text-sm text-muted hover:text-foreground">
        ← Back to home
      </Link>
    </div>
  );
}
