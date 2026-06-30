import Link from "next/link";

const LEARN_LINKS = [
  { href: "/",          label: "Home" },
  { href: "/courses",   label: "Courses" },
  { href: "/free-courses", label: "Free Courses" },
  { href: "/pricing",   label: "Pricing" },
];

const FOR_YOU_LINKS = [
  { href: "/for-vas",        label: "For VAs" },
  { href: "/courses?cat=nonprofit", label: "Nonprofit Courses" },
  { href: "/courses?cat=business",  label: "Business Courses" },
  { href: "/signup?type=group",     label: "Group Account Signup" },
];

const LEGAL_LINKS = [
  { href: "/help",            label: "Help Center" },
  { href: "/legal/terms",     label: "Terms of Use" },
  { href: "/legal/privacy",   label: "Privacy Policy" },
  { href: "/legal/refund",    label: "Refund Policy" },
  { href: "/legal/disclaimers", label: "Education Disclaimer" },
];

export default function SiteFooter() {
  return (
    <footer className="bg-[#1A2E1C] w-full text-[#9AB89E]" style={{ fontFamily: "var(--font-sans)" }}>
      <div className="max-w-[1240px] mx-auto px-7 pt-14 pb-8 grid grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-9">
        {/* Brand col */}
        <div className="min-w-[220px]">
          <div className="flex flex-col leading-none mb-4">
            <span className="font-head font-extrabold text-2xl text-[#F5F0E8]">RaeLearn</span>
            <span className="text-[9.5px] font-bold tracking-[0.22em] uppercase text-[#6A8A6E] mt-1.5">
              by RAEFORM
            </span>
          </div>
          <p className="text-sm leading-relaxed text-[#8AAE8E] max-w-[300px] mb-5">
            Practical training on the systems behind better businesses, nonprofits, and support teams.
          </p>
          <a
            href="https://byraeform.com"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#F5F0E8] border border-white/25 px-4 py-3 rounded-[10px] hover:border-[#7DAA82] hover:text-[#7DAA82] transition-colors"
          >
            Main RAEFORM Website →
          </a>
        </div>

        {/* Learn col */}
        <div>
          <div className="text-[11px] font-extrabold tracking-[0.1em] uppercase text-[#7DAA82] mb-4">
            Learn
          </div>
          <div className="flex flex-col gap-3 text-sm">
            {LEARN_LINKS.map(({ href, label }) => (
              <Link key={href} href={href} className="text-[#9AB89E] hover:text-white transition-colors">
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* For you col */}
        <div>
          <div className="text-[11px] font-extrabold tracking-[0.1em] uppercase text-[#7DAA82] mb-4">
            For you
          </div>
          <div className="flex flex-col gap-3 text-sm">
            {FOR_YOU_LINKS.map(({ href, label }) => (
              <Link key={href} href={href} className="text-[#9AB89E] hover:text-white transition-colors">
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* Support & legal col */}
        <div>
          <div className="text-[11px] font-extrabold tracking-[0.1em] uppercase text-[#7DAA82] mb-4">
            Support &amp; legal
          </div>
          <div className="flex flex-col gap-3 text-sm">
            {LEGAL_LINKS.map(({ href, label }) => (
              <Link key={href} href={href} className="text-[#9AB89E] hover:text-white transition-colors">
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-white/[0.08]">
        <div className="max-w-[1240px] mx-auto px-7 py-5 flex items-center justify-between gap-4 flex-wrap text-[12.5px] text-[#5A7A5E]">
          <span>© 2026 RaeLearn by RAEFORM. All rights reserved.</span>
          <span>raelearn.byraeform.com · Educational content only — not legal or tax advice.</span>
        </div>
      </div>
    </footer>
  );
}
