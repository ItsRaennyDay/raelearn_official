import type { Metadata } from "next";
import Link from "next/link";
import GroupAccountCTA from "@/components/GroupAccountCTA";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "RaeLearn pricing — start free or purchase individual courses. No subscription required. Pay once, keep access forever.",
  alternates: {
    canonical: "/pricing",
  },
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
    priceNote: "Starter · Team · Organization",
    dark: true,
    featured: "For Organizations",
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
    ctaHref: "/contact?category=custom_training",
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

              {plan.name === "Group Account" ? (
                <GroupAccountCTA
                  className="text-center text-[14.5px] font-bold px-3 py-3 rounded-[10px] block w-full"
                  style={{ background: "#C8DEC8", color: "#2A5230" }}
                >
                  {plan.ctaLabel}
                </GroupAccountCTA>
              ) : (
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
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Bundle tiers */}
      <section className="max-w-[1020px] mx-auto px-7 pb-6">
        <div className="bg-[#F0F5F1] border border-rl-border rounded-[20px] p-6 md:p-8">
          <div className="flex items-center gap-2 mb-5">
            <span className="text-[12px] font-extrabold tracking-[0.08em] uppercase text-[#2A5230]">Group Account</span>
            <span className="text-[11px] font-bold text-[#7A9878] px-2 py-0.5 bg-[#DDE8DA] rounded-full">Seat bundles</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-2">
            {[
              { tier: "Starter", seats: "3 seats", note: "Small teams & founder + VAs" },
              { tier: "Team",    seats: "10 seats", note: "Nonprofits & small biz staff" },
              { tier: "Organization", seats: "25+ seats", note: "Mid-size orgs & agencies" },
            ].map(({ tier, seats, note }) => (
              <div key={tier} className="bg-white border border-[#DDE8DA] rounded-[14px] px-5 py-4">
                <div className="font-head font-extrabold text-[16px] text-[#2A5230] mb-0.5">{tier}</div>
                <div className="text-[14px] font-bold text-[#4A6650] mb-1">{seats}</div>
                <div className="text-[12.5px] text-[#7A9878]">{note}</div>
              </div>
            ))}
          </div>
          <p className="text-[12.5px] text-[#7A9878] mt-3">Pricing is per seat. Contact us to get a quote for your team size.</p>
        </div>
      </section>

      {/* Individual vs Group comparison */}
      <section className="max-w-[1020px] mx-auto px-7 py-6">
        <div className="overflow-x-auto rounded-[20px] border border-rl-border">
          <table className="w-full text-[13.5px] min-w-[480px]" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#F0F5F1" }}>
                <th className="text-left px-6 py-4 text-[12px] font-extrabold tracking-[0.06em] uppercase text-[#7A9878] w-[44%]">Feature</th>
                <th className="text-center px-6 py-4 text-[13px] font-extrabold text-[#2A5230] w-[28%]">Individual</th>
                <th className="text-center px-6 py-4 text-[13px] font-extrabold text-[#2A5230] w-[28%]">Group</th>
              </tr>
            </thead>
            <tbody>
              {[
                { feature: "Free courses",            ind: true,  grp: true  },
                { feature: "Paid courses",            ind: true,  grp: true  },
                { feature: "Certificates",            ind: true,  grp: true  },
                { feature: "Workbooks & resources",   ind: true,  grp: true  },
                { feature: "Learner dashboard",       ind: true,  grp: true  },
                { feature: "Personal progress tracking", ind: true, grp: true },
                { feature: "Manage team seats",       ind: false, grp: true  },
                { feature: "Assign courses & paths",  ind: false, grp: true  },
                { feature: "Track team progress",     ind: false, grp: true  },
                { feature: "Completions overview",    ind: false, grp: true  },
                { feature: "Export reports",          ind: false, grp: true  },
                { feature: "Group dashboard",         ind: false, grp: true  },
              ].map(({ feature, ind, grp }, i) => (
                <tr key={feature} style={{ borderTop: "1px solid #EEF5EE", background: i % 2 === 0 ? "#fff" : "#FAFCF8" }}>
                  <td className="px-6 py-3.5 text-[#4A6650]">{feature}</td>
                  <td className="px-6 py-3.5 text-center">
                    {ind
                      ? <span className="text-[#3E9A52] font-bold text-base">✓</span>
                      : <span className="text-[#C8D8C8]">—</span>}
                  </td>
                  <td className="px-6 py-3.5 text-center">
                    {grp
                      ? <span className="text-[#3E9A52] font-bold text-base">✓</span>
                      : <span className="text-[#C8D8C8]">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
            href="/contact?category=custom_training"
            className="text-[15px] font-bold text-rl-forest border-[1.5px] border-rl-forest px-[22px] py-3.5 rounded-[11px] whitespace-nowrap hover:bg-rl-forest hover:text-white transition-colors"
          >
            Request Custom Quote
          </Link>
        </div>
      </section>
    </div>
  );
}
