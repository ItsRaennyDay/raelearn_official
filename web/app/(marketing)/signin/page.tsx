"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { BASE_URL } from "@/lib/email/render";

function safeNext(raw: string | null): string {
  if (!raw) return "/dashboard";
  // Must start with / but not // (protocol-relative) and contain no ://
  if (raw.startsWith("/") && !raw.startsWith("//") && !raw.includes("://")) {
    return raw;
  }
  return "/dashboard";
}

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = safeNext(searchParams.get("next"));

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (authError) {
      setError("Email or password is incorrect. Please try again.");
      setLoading(false);
      return;
    }

    router.push(nextPath);
    router.refresh();
  }

  async function handleForgot(e: React.MouseEvent) {
    e.preventDefault();
    if (!email.trim()) {
      setError("Enter your email address above, then click Forgot password.");
      return;
    }
    setLoading(true);
    setError(null);
    const supabase = createClient();
    // Always point at the real production domain, not window.location.origin —
    // if this runs from a Vercel preview URL, that origin is behind Vercel's own
    // login wall and the reset link would dead-end there instead of the app.
    await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${BASE_URL}/api/auth/callback?next=/reset-password`,
    });
    setLoading(false);
    setError("✓ Password reset email sent — check your inbox.");
  }

  return (
    <main className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">


        {/* Card */}
        <div className="bg-white rounded-2xl border border-[var(--color-rl-border)] shadow-sm p-8 md:p-10">

          {/* Header */}
          <div className="mb-8 text-center">
            <h1
              className="font-display text-3xl font-bold text-[var(--color-rl-forest)] mb-2"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Welcome back
            </h1>
            <p className="text-[var(--color-rl-muted)] text-sm">
              Sign in to continue learning
            </p>
          </div>

          {/* Error / success message */}
          {error && (
            <div
              className={`mb-6 px-4 py-3 rounded-lg text-sm border ${
                error.startsWith("✓")
                  ? "bg-green-50 border-green-200 text-green-800"
                  : "bg-red-50 border-red-200 text-red-700"
              }`}
            >
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-[var(--color-rl-forest)] mb-1.5"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-rl-border)] bg-[var(--color-rl-bg)] text-[var(--color-rl-forest)] placeholder:text-[var(--color-rl-dim)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-rl-forest)] focus:border-transparent transition"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-[var(--color-rl-forest)]"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={handleForgot}
                  className="text-xs text-[var(--color-rl-muted)] hover:text-[var(--color-rl-forest)] transition underline underline-offset-2"
                >
                  Forgot password?
                </button>
              </div>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-rl-border)] bg-[var(--color-rl-bg)] text-[var(--color-rl-forest)] placeholder:text-[var(--color-rl-dim)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-rl-forest)] focus:border-transparent transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[var(--color-rl-forest)] text-white font-semibold text-sm hover:bg-[var(--color-rl-muted)] disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-[var(--color-rl-border)]" />
            <span className="text-xs text-[var(--color-rl-dim)]">or</span>
            <div className="flex-1 h-px bg-[var(--color-rl-border)]" />
          </div>

          {/* Footer links */}
          <p className="text-center text-sm text-[var(--color-rl-muted)]">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="text-[var(--color-rl-forest)] font-semibold hover:underline underline-offset-2"
            >
              Start learning free
            </Link>
          </p>
        </div>

        {/* Below card */}
        <p className="mt-6 text-center text-xs text-[var(--color-rl-dim)]">
          Need a group account?{" "}
          <Link
            href="/signup?type=group"
            className="underline underline-offset-2 hover:text-[var(--color-rl-muted)] transition"
          >
            Create one for your team
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  );
}
