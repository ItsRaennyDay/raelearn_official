import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import GroupAccountCTA from "@/components/GroupAccountCTA";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the RaeLearn team. Questions about courses, group accounts, or custom training — we'd love to hear from you.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact · RaeLearn by RAEFORM",
    description: "Get in touch with the RaeLearn team.",
    url: "https://raelearn.byraeform.com/contact",
  },
};

async function submitTicket(formData: FormData) {
  "use server";
  const name     = (formData.get("name")     as string ?? "").trim();
  const email    = (formData.get("email")    as string ?? "").trim().toLowerCase();
  const category = (formData.get("category") as string ?? "general");
  const subject  = (formData.get("subject")  as string ?? "").trim();
  const body     = (formData.get("body")     as string ?? "").trim();

  if (!name || !email || !subject || !body) {
    redirect("/contact?error=missing-fields");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    redirect("/contact?error=invalid-email");
  }

  const db = createAdminClient();
  const { data } = await db
    .from("support_tickets")
    .insert({ submitter_name: name, email, category, subject, body, status: "open", priority: "normal" })
    .select("ticket_id")
    .single();

  redirect(`/contact?submitted=${data?.ticket_id ?? "submitted"}`);
}

function IgIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

const CATEGORIES = [
  { value: "general",         label: "General Question" },
  { value: "course_help",     label: "Course Help" },
  { value: "billing",         label: "Billing" },
  { value: "group_account",   label: "Group Account" },
  { value: "custom_training", label: "Custom Training" },
  { value: "other",           label: "Other" },
];

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ submitted?: string; error?: string; category?: string }>;
}) {
  const { submitted, error, category } = await searchParams;
  const defaultCategory = CATEGORIES.some((c) => c.value === category) ? category : "general";

  return (
    <div className="bg-rl-bg" style={{ fontFamily: "var(--font-sans)" }}>
      {/* Header */}
      <section className="bg-[#F5F0E8] border-b border-rl-border">
        <div className="max-w-[1240px] mx-auto px-7 pt-12 pb-10 text-center">
          <div className="text-[12.5px] font-extrabold tracking-[0.16em] uppercase text-rl-dim mb-3.5">Contact</div>
          <h1 className="font-head font-extrabold text-[clamp(28px,4vw,48px)] leading-[1.05] tracking-[-0.02em] mx-auto mb-3.5 text-rl-forest max-w-[640px]">
            We&rsquo;d love to hear from you.
          </h1>
          <p className="text-[16px] leading-relaxed text-rl-muted max-w-[500px] mx-auto">
            Questions about a course, group pricing, or custom training? Send us a message and we&rsquo;ll get back to you.
          </p>
        </div>
      </section>

      {/* Main content */}
      <section className="max-w-[1020px] mx-auto px-7 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10 items-start">

          {/* Form */}
          <div className="rounded-[20px] p-7 md:p-9" style={{ background: "#fff", border: "1px solid #DDE8DA" }}>
            {submitted ? (
              <div className="text-center py-8">
                <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: "#EEF5EE" }}>
                  <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#2A5230" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h2 className="font-head font-extrabold text-[22px] mb-2" style={{ color: "#1A2E1C" }}>
                  Message received!
                </h2>
                <p className="text-[14.5px] mb-2" style={{ color: "#7A9878" }}>
                  Your ticket has been submitted.
                </p>
                <div className="inline-block px-4 py-2 rounded-[10px] text-[13px] font-bold mb-6" style={{ background: "#EEF5EE", color: "#2A5230" }}>
                  Ticket ID: {submitted}
                </div>
                <p className="text-[13.5px] mb-6" style={{ color: "#9AB89E" }}>
                  We typically respond within 1–2 business days. Keep your ticket ID handy.
                </p>
                <Link
                  href="/contact"
                  className="text-[13.5px] font-bold"
                  style={{ color: "#2A5230" }}
                >
                  Submit another message →
                </Link>
              </div>
            ) : (
              <>
                <h2 className="font-head font-extrabold text-[20px] mb-6" style={{ color: "#1A2E1C" }}>
                  Send a message
                </h2>

                {error && (
                  <div className="mb-5 px-4 py-3 rounded-xl text-sm font-medium" style={{ background: "#FFF0F0", color: "#AA2222", border: "1px solid #FFCCCC" }}>
                    {error === "missing-fields" ? "Please fill in all fields." : "Please enter a valid email address."}
                  </div>
                )}

                <form action={submitTicket} className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[12px] font-bold tracking-[0.04em] uppercase" style={{ color: "#7A9878" }}>Name</label>
                      <input
                        name="name"
                        type="text"
                        required
                        placeholder="Your name"
                        className="px-4 py-2.5 text-[14px] rounded-xl border outline-none"
                        style={{ borderColor: "#DDE8DA", background: "#FAFCFA", color: "#1A2E1C" }}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[12px] font-bold tracking-[0.04em] uppercase" style={{ color: "#7A9878" }}>Email</label>
                      <input
                        name="email"
                        type="email"
                        required
                        placeholder="you@example.com"
                        className="px-4 py-2.5 text-[14px] rounded-xl border outline-none"
                        style={{ borderColor: "#DDE8DA", background: "#FAFCFA", color: "#1A2E1C" }}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-bold tracking-[0.04em] uppercase" style={{ color: "#7A9878" }}>Category</label>
                    <select
                      name="category"
                      defaultValue={defaultCategory}
                      className="px-4 py-2.5 text-[14px] rounded-xl border outline-none"
                      style={{ borderColor: "#DDE8DA", background: "#FAFCFA", color: "#1A2E1C" }}
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-bold tracking-[0.04em] uppercase" style={{ color: "#7A9878" }}>Subject</label>
                    <input
                      name="subject"
                      type="text"
                      required
                      placeholder="Brief description of your question"
                      className="px-4 py-2.5 text-[14px] rounded-xl border outline-none"
                      style={{ borderColor: "#DDE8DA", background: "#FAFCFA", color: "#1A2E1C" }}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-bold tracking-[0.04em] uppercase" style={{ color: "#7A9878" }}>Message</label>
                    <textarea
                      name="body"
                      required
                      rows={6}
                      placeholder="Tell us how we can help…"
                      className="px-4 py-2.5 text-[14px] rounded-xl border outline-none resize-none"
                      style={{ borderColor: "#DDE8DA", background: "#FAFCFA", color: "#1A2E1C" }}
                    />
                  </div>

                  <button
                    type="submit"
                    className="mt-1 px-6 py-3 text-[14.5px] font-bold rounded-xl self-start"
                    style={{ background: "#2A5230", color: "#fff" }}
                  >
                    Send Message
                  </button>
                </form>
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-5">
            {/* Direct contact */}
            <div className="rounded-[16px] p-6" style={{ background: "#fff", border: "1px solid #DDE8DA" }}>
              <div className="text-[11px] font-extrabold tracking-[0.1em] uppercase mb-4" style={{ color: "#7A9878" }}>
                Direct contact
              </div>
              <div className="flex flex-col gap-4">
                <a href="mailto:raeformtoday@gmail.com" className="flex items-center gap-3 text-[13.5px] font-medium hover:underline" style={{ color: "#2A5230" }}>
                  <span className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "#EEF5EE" }}>
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#2A5230" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <polyline points="2,4 12,13 22,4" />
                    </svg>
                  </span>
                  raeformtoday@gmail.com
                </a>
                <a href="https://www.instagram.com/byraeform" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-[13.5px] font-medium hover:underline" style={{ color: "#2A5230" }}>
                  <span className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "#EEF5EE" }}>
                    <IgIcon />
                  </span>
                  @byraeform
                </a>
                <a href="https://www.linkedin.com/company/raeform" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-[13.5px] font-medium hover:underline" style={{ color: "#2A5230" }}>
                  <span className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "#EEF5EE" }}>
                    <LinkedInIcon />
                  </span>
                  RAEFORM on LinkedIn
                </a>
              </div>
            </div>

            {/* Response time */}
            <div className="rounded-[16px] px-5 py-4" style={{ background: "#F0F5F1", border: "1px solid #DDE8DA" }}>
              <div className="text-[12.5px] font-bold mb-1" style={{ color: "#2A5230" }}>Response time</div>
              <p className="text-[12.5px] leading-relaxed" style={{ color: "#7A9878" }}>
                We typically reply within 1–2 business days. For urgent group or training inquiries, email directly for fastest response.
              </p>
            </div>

            {/* Quick links */}
            <div className="flex flex-col gap-2">
              {[
                { href: "/pricing",        label: "View Pricing" },
                { href: "/courses",        label: "Browse Courses" },
                { href: "/legal/refund",   label: "Refund Policy" },
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="text-[13px] font-medium hover:underline"
                  style={{ color: "#7A9878" }}
                >
                  {label} →
                </Link>
              ))}
              <GroupAccountCTA className="text-left text-[13px] font-medium hover:underline" style={{ color: "#7A9878" }}>
                Group Account Signup →
              </GroupAccountCTA>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
