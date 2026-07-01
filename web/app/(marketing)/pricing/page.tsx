import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "RaeLearn pricing — start free or purchase individual courses. No subscription required. Pay once, keep access forever.",
  openGraph: {
    title: "Pricing · RaeLearn by RAEFORM",
    description:
      "Start free or buy individual courses. No subscription, no recurring fees.",
    url: "https://raelearn.byraeform.com/pricing",
  },
};

const PLANS = [
  {
    name: "Free",
    tagline: "For beginners getting started.",
    price: "$0",
    priceNote: null,
    dark: false,
    featured: null,
    features: [
      "Free courses",
      "Starter templates",
      "Checklists",
      "Personal progress tracking",
    ],
    ctaLabel: "Start Free",
    ctaHref: "/signup",
  },
  {
    name: "Individual",
    tagline: "For VAs, freelancers, founders, and independent learners.",
    price: "Per course",
    priceNote: "or certificate bundles",
    dark: false,
    featured: null,
    features: [
      "Everything in Free",
      "Paid courses",
      "Certificates",
      "Workbooks & resources",
      "Learner dashboard",
    ],
    ctaLabel: "Browse Courses",
    ctaHref: "/courses",
  },
  {
    name: "Group Account",
    tagline: "For founders, nonprofit heads, owners, and team leads.",
    price: "Per seat",
    priceNote: "plans from 3 seats up",
    dark: true,
    featured: "FOR ORGANIZATIONS",
    features: [
      "Buy & manage seats",
      "Assign courses & paths",
      "Track team progress",
      "Completions & certificates",
      "Export reports",
      "Group dashboard",
    ],
    ctaLabel: "Create Group Account",
    ctaHref: "/signup?type=group",
  },
  {
    name: "Custom Training",
    tagline: "For organizations needing tailored training.",
    price: "Let's talk",
    priceNote: "scoped to your org",
    dark: false,
    featured: null,
    features: [
      "Intake & review",
      "Custom learning plan",
      "Private training",
      "Workshops",
      "Implementation guidance",
    ],
    ctaLabel: "Request Custom Quote",
    ctaHref: "/signup",
  },
];

export default function PricingPage() {
  return (
    <div className="bg-rl-bg" style={{ fontFamily: "var(--font-sans)" }}>
      {/* Header */}
      <section className="relative bg-[#F5F0E8] border-b border-rl-border overflow-hidden">
        <div className="relative max-w-[1240px] mx-auto px-7 pt-12 pb-10 text-center">
          <div className="text-[12.5px] font-extrabold tracking-[0.16em] uppercase text-rl-dim mb-3.5">Pricing</div>
          <h1 className="font-head font-extrabold text-[clamp(32px,4.4vw,52px)] leading-[1.05] tracking-[-0.02em] mx-auto mb-3.5 text-rl-forest max-w-[720px]">
            Start free. Pay only when you need more.
          </h1>
          <p className="text-[16.5px] leading-relaxed text-rl-muted max-w-[600px] mx-auto">
            Four ways to learn with RaeLearn — from free starters to fully custom training built around your organization.
          </p>
        </div>
      </section>

      {/* Plans */}
      <section className="max-w-[1240px] mx-auto px-7 pt-11 pb-6">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(248px,1fr))] gap-[18px] items-stretch">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className="relative rounded-[18px] p-[26px_24px] flex flex-col"
              style={{
                background: plan.dark ? "#2A5230" : "#fff",
                border: plan.dark ? "1px solid #2A5230" : "1px solid #DDE8DA",
                boxShadow: plan.dark
                  ? "0 24px 50px -24px rgba(42,82,48,0.5)"
                  : "0 14px 30px -26px rgba(42,82,48,0.3)",
                color: plan.dark ? "#fff" : "inherit",
              }}
            >
              {plan.featured && (
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 text-[11px] font-extrabold tracking-[0.05em] px-3 py-1 rounded-[7px] whitespace-nowrap"
                  style={{ background: "#C8DEC8", color: "#2A5230" }}
                >
                  {plan.featured}
                </div>
              )}

              <h2
                className="font-head font-extrabold text-[22px] mb-1"
                style={{ color: plan.dark ? "#fff" : "#2A5230" }}
              >
                {plan.name}
              </h2>
              <p
                className="text-[13.5px] mb-4"
                style={{ color: plan.dark ? "#9AB89E" : "#7A9878", minHeight: "38px" }}
              >
                {plan.tagline}
              </p>

              <div
                className="font-head font-extrabold text-[36px] mb-0.5"
                style={{ color: plan.dark ? "#fff" : "#2A5230" }}
              >
                {plan.price}
              </div>
              {plan.priceNote ? (
                <div className="text-[13px] mb-[18px]" style={{ color: plan.dark ? "#9AB89E" : "#7A9878" }}>
                  {plan.priceNote}
                </div>
              ) : (
                <div className="mb-[18px]" />
              )}

              <div className="flex flex-col gap-[9px] text-[13.5px] flex-1 mb-5">
                {plan.features.map((feat) => (
                  <div key={feat} className="flex gap-[9px]" style={{ color: plan.dark ? "#DDE8DA" : "#4A6650" }}>
                    <span className="font-extrabold" style={{ color: plan.dark ? "#9AB89E" : "#3E9A52" }}>✓</span>
                    {feat}
                  </div>
                ))}
              </div>

              <Link
                href={plan.ctaHref}
                className="text-center text-[14.5px] font-bold px-3 py-3 rounded-[10px] block"
                style={
                  plan.dark
                    ? { background: "#C8DEC8", color: "#2A5230" }
                    : { color: "#2A5230", border: "1.6px solid #2A5230", background: "transparent" }
                }
              >
                {plan.ctaLabel}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Individual vs Group */}
      <section className="max-w-[1020px] mx-auto px-7 py-6">
        <div className="bg-[#F0F5F1] border border-rl-border rounded-[20px] p-8 grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-7">
          <div>
            <div className="text-[11px] font-extrabold tracking-[0.1em] uppercase text-rl-forest mb-3">
              Individual learner account
            </div>
            <p className="text-[14.5px] leading-relaxed text-rl-muted mb-3">
              For VAs, freelancers, founders, nonprofit founders, business owners, and learners taking courses for themselves.
            </p>
            <div className="text-[13.5px] text-rl-muted leading-[1.9]">
              Enroll in free courses · buy paid courses · complete certificates · download resources · track your own progress
            </div>
          </div>
          <div>
            <div className="text-[11px] font-extrabold tracking-[0.1em] uppercase text-rl-sage mb-3">
              Group account
            </div>
            <p className="text-[14.5px] leading-relaxed text-rl-muted mb-3">
              For founders, executive directors, nonprofit heads, business owners, team leads, operations managers, and agency owners.
            </p>
            <div className="text-[13.5px] text-rl-muted leading-[1.9]">
              Add learners · buy seats · assign courses &amp; paths · monitor progress · view completions · export reports · manage seats · request custom training
            </div>
          </div>
        </div>
      </section>

      {/* CTA strip */}
      <section className="max-w-[1240px] mx-auto px-7 pt-7 pb-20 text-center">
        <p className="text-[15px] text-rl-muted mb-[18px]">Not sure which fits? Start free and upgrade anytime.</p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link
            href="/signup"
            className="text-[15px] font-bold text-white bg-rl-forest px-[22px] py-3.5 rounded-[11px] whitespace-nowrap hover:bg-[#1e3d24] transition-colors"
          >
            Start Free
          </Link>
          <Link
            href="/courses"
            className="text-[15px] font-bold text-rl-forest border-[1.5px] border-rl-forest px-[22px] py-3.5 rounded-[11px] whitespace-nowrap hover:bg-rl-forest hover:text-white transition-colors"
          >
            Browse Courses
          </Link>
          <Link
            href="/signup"
            className="text-[15px] font-bold text-rl-forest border-[1.5px] border-rl-forest px-[22px] py-3.5 rounded-[11px] whitespace-nowrap hover:bg-rl-forest hover:text-white transition-colors"
          >
            Request Custom Quote
          </Link>
        </div>
      </section>
    </div>
  );
}
