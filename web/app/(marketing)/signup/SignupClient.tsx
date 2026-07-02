"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import GroupAccountCTA from "@/components/GroupAccountCTA";

const TYPES = [
  ["va",          "VA"],
  ["freelancer",  "Freelancer"],
  ["founder",     "Founder"],
  ["np_founder",  "Nonprofit founder"],
  ["biz_owner",   "Small business owner"],
  ["team_member", "Team member"],
  ["student",     "Student / learner"],
  ["other",       "Other"],
] as const;

const INTERESTS = [
  ["nonprofit_ops", "Nonprofit operations"],
  ["business_ops",  "Business operations"],
  ["va_support",    "VA support"],
  ["website",       "Website maintenance"],
  ["donor",         "Donor / fundraising admin"],
  ["board",         "Board support"],
  ["startup",       "Startup systems"],
  ["sops",          "SOPs / workflows"],
  ["automation",    "Automation"],
  ["grants",        "Grant readiness"],
] as const;

type TypeKey = (typeof TYPES)[number][0];

// Maps userType → bundle audience value (in priority order)
const TYPE_AUDIENCES: Record<TypeKey, string[]> = {
  va:          ["va",        "general"],
  freelancer:  ["va",        "business", "general"],
  founder:     ["founder",   "business", "general"],
  np_founder:  ["nonprofit", "general"],
  biz_owner:   ["business",  "general"],
  team_member: ["va",        "general"],
  student:     ["va",        "general"],
  other:       ["general"],
};

// Maps interest key → bundle audience that matches it best
const INTEREST_AUDIENCES: Record<string, string> = {
  nonprofit_ops: "nonprofit",
  business_ops:  "business",
  va_support:    "va",
  website:       "va",
  donor:         "nonprofit",
  board:         "nonprofit",
  startup:       "founder",
  sops:          "business",
  automation:    "business",
  grants:        "nonprofit",
};

// Static fallback if no bundles in DB yet
const FALLBACK: Record<TypeKey, { path: string; desc: string; first: string }> = {
  va:          { path: "New VA Path",                    desc: "Build the core support skills every VA needs, then specialize.",  first: "Inbox & Calendar Basics" },
  freelancer:  { path: "Founder Support VA Path",        desc: "Turn freelance skills into reliable client systems.",             first: "Inbox & Calendar Basics" },
  founder:     { path: "Startup Founder Path",           desc: "Set up the backend your business runs on before you scale.",     first: "Startup Systems" },
  np_founder:  { path: "Nonprofit Founder Path",         desc: "Stand up your nonprofit operations the right way.",              first: "Nonprofit vs 501(c)(3)" },
  biz_owner:   { path: "Small Business Operations Path", desc: "Get out of the weeds with repeatable processes.",               first: "Google Drive Cleanup" },
  team_member: { path: "General VA Foundations",         desc: "Learn the systems your team relies on day to day.",              first: "Inbox & Calendar Basics" },
  student:     { path: "New VA Path",                    desc: "A practical, beginner-friendly place to start.",                 first: "Inbox & Calendar Basics" },
  other:       { path: "Choose your path",               desc: "Tell us your interests and we'll point you to the right place.", first: "Nonprofit vs 501(c)(3)" },
};

export type BundleForSignup = {
  id: string;
  title: string;
  description: string | null;
  audience: string;
  first_course_title: string | null;
  first_course_price_type: string | null;
};

export default function SignupClient({ bundles }: { bundles: BundleForSignup[] }) {
  const [userType, setUserType]   = useState<TypeKey>("va");
  const [interests, setInterests] = useState<string[]>([]);
  const [name, setName]           = useState("");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [success, setSuccess]     = useState(false);

  const toggleInterest = (key: string) => {
    setInterests((prev) =>
      prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key]
    );
  };

  // Pick the best matching bundle based on userType + interests
  const recommendation = useMemo(() => {
    if (bundles.length === 0) return null;

    // Derive candidate audiences from interests first, then fall back to userType
    const interestAudiences = interests
      .map((i) => INTEREST_AUDIENCES[i])
      .filter(Boolean);

    const preferredAudiences =
      interestAudiences.length > 0
        ? [...new Set([...interestAudiences, ...TYPE_AUDIENCES[userType]])]
        : TYPE_AUDIENCES[userType];

    for (const audience of preferredAudiences) {
      const match = bundles.find((b) => b.audience === audience);
      if (match) return match;
    }
    return bundles[0]; // last resort: first available bundle
  }, [bundles, userType, interests]);

  const fallback = FALLBACK[userType];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, userType, interests }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Signup failed");
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const chipBase =
    "text-[13px] font-semibold px-3.5 py-2 rounded-[10px] cursor-pointer transition-all whitespace-nowrap border-[1.5px]";

  if (success) {
    return (
      <div className="bg-rl-bg min-h-screen flex items-center justify-center px-7 py-20" style={{ fontFamily: "var(--font-sans)" }}>
        <div className="max-w-[480px] text-center">
          <div className="w-16 h-16 rounded-full bg-[#DDE8DA] flex items-center justify-center mx-auto mb-5">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#2A5230" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <h1 className="font-head font-extrabold text-[28px] text-rl-forest mb-3">Check your inbox</h1>
          <p className="text-[15.5px] text-rl-muted mb-6">
            We sent a confirmation link to <strong className="text-rl-forest">{email}</strong>. Click it to activate your account.
          </p>
          <Link href="/" className="text-[14px] font-bold text-rl-forest hover:underline">← Back to home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-rl-bg" style={{ fontFamily: "var(--font-sans)" }}>
      <section className="max-w-[1100px] mx-auto px-5 md:px-7 pt-10 pb-20">
        <div className="text-[12.5px] font-bold text-rl-dim mb-5">
          <Link href="/" className="text-rl-dim hover:text-rl-forest transition-colors">Home</Link>
          <span className="mx-1.5">/</span>
          Create individual account
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.55fr_1fr] gap-[30px] items-start">
          {/* Form */}
          <form onSubmit={handleSubmit}>
            <h1 className="font-head font-extrabold text-[clamp(28px,3.6vw,40px)] leading-[1.06] tracking-[-0.015em] mb-2.5 text-rl-forest">
              Create your learner account
            </h1>
            <p className="text-[15.5px] leading-relaxed text-rl-muted mb-7">
              For VAs, freelancers, founders, and anyone learning for themselves. Free to start — no card needed.
            </p>

            {/* Step 1 */}
            <div className="bg-white border border-rl-border rounded-2xl p-[26px] mb-[18px]">
              <div className="text-[11px] font-extrabold tracking-[0.1em] uppercase text-rl-forest mb-3.5">Step 1 · I am a…</div>
              <div className="flex flex-wrap gap-[9px]">
                {TYPES.map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setUserType(key)}
                    className={[
                      chipBase,
                      userType === key
                        ? "bg-rl-forest text-white border-rl-forest"
                        : "bg-[#FCFBF7] text-rl-muted border-rl-border hover:border-rl-border-mid",
                    ].join(" ")}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white border border-rl-border rounded-2xl p-[26px] mb-[18px]">
              <div className="text-[11px] font-extrabold tracking-[0.1em] uppercase text-rl-forest mb-1.5">
                Step 2 · I&apos;m interested in…
              </div>
              <div className="text-[13px] text-rl-dim mb-3.5">Pick as many as you like.</div>
              <div className="flex flex-wrap gap-[9px]">
                {INTERESTS.map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleInterest(key)}
                    className={[
                      chipBase,
                      interests.includes(key)
                        ? "bg-[#1A2E1C] text-white border-[#1A2E1C]"
                        : "bg-[#FCFBF7] text-rl-muted border-rl-border hover:border-rl-border-mid",
                    ].join(" ")}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white border border-rl-border rounded-2xl p-[26px]">
              <div className="text-[11px] font-extrabold tracking-[0.1em] uppercase text-rl-forest mb-3.5">
                Step 3 · Create account
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-3.5">
                <div>
                  <label className="block text-[12.5px] font-bold text-rl-muted mb-1.5">Full name</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    required
                    className="w-full text-[14.5px] px-3.5 py-3 border-[1.5px] border-rl-border rounded-[10px] bg-[#FCFBF7] outline-none focus:border-rl-forest placeholder:text-rl-dim"
                  />
                </div>
                <div>
                  <label className="block text-[12.5px] font-bold text-rl-muted mb-1.5">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jane@email.com"
                    required
                    className="w-full text-[14.5px] px-3.5 py-3 border-[1.5px] border-rl-border rounded-[10px] bg-[#FCFBF7] outline-none focus:border-rl-forest placeholder:text-rl-dim"
                  />
                </div>
              </div>
              <div className="mb-5">
                <label className="block text-[12.5px] font-bold text-rl-muted mb-1.5">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  required
                  minLength={8}
                  className="w-full text-[14.5px] px-3.5 py-3 border-[1.5px] border-rl-border rounded-[10px] bg-[#FCFBF7] outline-none focus:border-rl-forest placeholder:text-rl-dim"
                />
              </div>

              {error && (
                <div className="mb-4 text-[13.5px] text-red-600 bg-red-50 border border-red-200 rounded-[9px] px-4 py-3">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full text-[15.5px] font-bold text-white bg-rl-forest border-none py-[15px] rounded-[11px] cursor-pointer hover:bg-[#1e3d24] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Creating account…" : "Create Free Account"}
              </button>
              <p className="text-[12.5px] text-rl-dim mt-3.5 text-center">
                Already have an account?{" "}
                <Link href="/signin" className="text-rl-forest font-bold hover:underline">Sign in</Link>
              </p>
            </div>
          </form>

          {/* Recommendation sidebar */}
          <div className="lg:sticky lg:top-[88px]">
            <div className="bg-[#F0F5F1] border border-rl-border rounded-[18px] p-6">
              <div className="font-hand text-[21px] font-bold text-rl-forest mb-1">we recommend</div>

              {recommendation ? (
                <>
                  <h2 className="font-head font-extrabold text-[22px] mb-1.5 text-rl-forest">{recommendation.title}</h2>
                  {recommendation.description && (
                    <p className="text-[13.5px] leading-[1.55] text-rl-muted mb-4">{recommendation.description}</p>
                  )}
                  {recommendation.first_course_title && (
                    <div className="bg-white border border-rl-border rounded-xl p-3.5 mb-4">
                      <div className="text-[11px] font-extrabold tracking-[0.08em] uppercase text-rl-dim mb-2">Starts with</div>
                      <div className="text-[14px] font-bold text-rl-forest mb-0.5">{recommendation.first_course_title}</div>
                      <div className="text-[12.5px] text-rl-dim capitalize">
                        {recommendation.first_course_price_type === "free" ? "Free · " : ""}beginner-friendly
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <h2 className="font-head font-extrabold text-[22px] mb-1.5 text-rl-forest">{fallback.path}</h2>
                  <p className="text-[13.5px] leading-[1.55] text-rl-muted mb-4">{fallback.desc}</p>
                  <div className="bg-white border border-rl-border rounded-xl p-3.5 mb-4">
                    <div className="text-[11px] font-extrabold tracking-[0.08em] uppercase text-rl-dim mb-2">Starts with</div>
                    <div className="text-[14px] font-bold text-rl-forest mb-0.5">{fallback.first}</div>
                    <div className="text-[12.5px] text-rl-dim">Free · beginner-friendly</div>
                  </div>
                </>
              )}

              <Link
                href="/courses"
                className="block text-center text-[14px] font-bold text-rl-forest bg-[#DDE8DA] py-2.5 rounded-[10px] hover:bg-rl-forest hover:text-white transition-colors"
              >
                See full path →
              </Link>
            </div>
            <div className="flex items-center gap-2.5 mt-[18px] px-1.5">
              <span className="text-[13px] text-rl-dim">Leading a team instead?</span>
              <GroupAccountCTA className="text-[13px] font-bold text-rl-forest hover:underline">
                Create a group account →
              </GroupAccountCTA>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
