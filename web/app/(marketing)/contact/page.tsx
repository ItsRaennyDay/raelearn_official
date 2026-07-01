import type { Metadata } from "next";
import Link from "next/link";
import { Mail } from "lucide-react";

function IgIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function LinkedInIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the RaeLearn team. Questions about courses, group accounts, or custom training — we'd love to hear from you.",
  openGraph: {
    title: "Contact · RaeLearn by RAEFORM",
    description: "Get in touch with the RaeLearn team.",
    url: "https://raelearn.byraeform.com/contact",
  },
};

const CONTACT_ITEMS = [
  {
    Icon: ({ size }: { size: number }) => <Mail size={size} strokeWidth={1.8} />,
    label: "Email",
    value: "raeformtoday@gmail.com",
    href: "mailto:raeformtoday@gmail.com",
    note: "Best for course questions, enrollment help, and custom training inquiries.",
  },
  {
    Icon: IgIcon,
    label: "Instagram",
    value: "@raeformtoday",
    href: "https://www.instagram.com/raeformtoday",
    note: "Updates, behind-the-scenes, and quick DMs welcome.",
  },
  {
    Icon: LinkedInIcon,
    label: "LinkedIn",
    value: "RAEFORM",
    href: "https://www.linkedin.com/company/raeform",
    note: "Professional inquiries, partnerships, and org training requests.",
  },
];

const FAQS = [
  {
    q: "How do I access a course I purchased?",
    a: "Log in and head to your Learner Dashboard. All purchased and enrolled courses appear under My Courses.",
  },
  {
    q: "Do you offer group or team pricing?",
    a: "Yes. Group Accounts start at 3 seats (Starter), 10 seats (Team), or 25+ seats (Organization). Reach out for a custom quote.",
  },
  {
    q: "Can you build a custom training for my organization?",
    a: "Absolutely. Send us an email with your team size, goals, and timeline and we'll put together a scoped proposal.",
  },
  {
    q: "What is your refund policy?",
    a: "We offer refunds within 7 days of purchase if you haven't completed more than 20% of the course. See the full policy for details.",
  },
];

export default function ContactPage() {
  return (
    <div className="bg-rl-bg" style={{ fontFamily: "var(--font-sans)" }}>
      {/* Header */}
      <section className="relative bg-[#F5F0E8] border-b border-rl-border overflow-hidden">
        <div className="relative max-w-[1240px] mx-auto px-7 pt-12 pb-10 text-center">
          <div className="text-[12.5px] font-extrabold tracking-[0.16em] uppercase text-rl-dim mb-3.5">
            Contact
          </div>
          <h1 className="font-head font-extrabold text-[clamp(32px,4.4vw,52px)] leading-[1.05] tracking-[-0.02em] mx-auto mb-3.5 text-rl-forest max-w-[680px]">
            We&rsquo;d love to hear from you.
          </h1>
          <p className="text-[16.5px] leading-relaxed text-rl-muted max-w-[520px] mx-auto">
            Questions about a course, group pricing, or custom training? Reach out and we&rsquo;ll get back to you.
          </p>
        </div>
      </section>

      {/* Contact cards */}
      <section className="max-w-[860px] mx-auto px-7 pt-12 pb-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {CONTACT_ITEMS.map(({ Icon, label, value, href, note }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith("mailto") ? undefined : "_blank"}
              rel={href.startsWith("mailto") ? undefined : "noopener noreferrer"}
              className="group flex flex-col gap-3 rounded-[18px] p-6 border transition-shadow hover:shadow-md"
              style={{ background: "#fff", border: "1px solid #DDE8DA" }}
            >
              <div
                className="w-10 h-10 rounded-[10px] flex items-center justify-center"
                style={{ background: "#EEF5EE", color: "#2A5230" }}
              >
                <Icon size={20} />
              </div>
              <div>
                <div className="text-[11px] font-extrabold tracking-[0.1em] uppercase mb-1" style={{ color: "#7A9878" }}>
                  {label}
                </div>
                <div className="font-bold text-[15px] group-hover:underline" style={{ color: "#2A5230" }}>
                  {value}
                </div>
              </div>
              <p className="text-[13px] leading-relaxed" style={{ color: "#7A9878" }}>
                {note}
              </p>
            </a>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-[860px] mx-auto px-7 py-12">
        <div className="mb-7">
          <div className="text-[12px] font-extrabold tracking-[0.12em] uppercase mb-2" style={{ color: "#7A9878" }}>
            Common questions
          </div>
          <h2 className="font-head font-extrabold text-[26px] leading-tight" style={{ color: "#1A2E1C" }}>
            Before you reach out
          </h2>
        </div>
        <div className="flex flex-col gap-4">
          {FAQS.map(({ q, a }) => (
            <div
              key={q}
              className="rounded-[14px] px-6 py-5"
              style={{ background: "#fff", border: "1px solid #DDE8DA" }}
            >
              <div className="font-bold text-[14.5px] mb-2" style={{ color: "#1A2E1C" }}>{q}</div>
              <p className="text-[13.5px] leading-relaxed" style={{ color: "#7A9878" }}>{a}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 text-[12.5px]" style={{ color: "#9AB89E" }}>
          More details in our{" "}
          <Link href="/legal/refund" className="underline hover:text-[#2A5230]">Refund Policy</Link>
          {" "}and{" "}
          <Link href="/legal/terms" className="underline hover:text-[#2A5230]">Terms of Use</Link>.
        </div>
      </section>
    </div>
  );
}
