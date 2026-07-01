import type { Metadata } from "next";
import Link from "next/link";
import HeroCTAs from "@/components/HeroCTAs";

export const metadata: Metadata = {
  title: "RaeLearn by RAEFORM — Practical training for VAs, founders & nonprofit leaders",
  description:
    "Practical online courses for virtual assistants, nonprofit leaders, founders, and small teams. Learn operations, admin systems, websites, compliance, and more — at your own pace.",
  openGraph: {
    title: "RaeLearn by RAEFORM — Practical training for VAs, founders & nonprofit leaders",
    description:
      "Practical online courses for VAs, nonprofit leaders, founders, and small teams. Learn at your pace.",
    url: "https://raelearn.byraeform.com",
  },
};

/* ─── Hero dashboard mockup ─── */
function DashboardMockup() {
  return (
    <div className="relative">
      {/* Sticky note */}
      <div
        className="absolute -top-8 left-3.5 z-10 bg-[#D8EDD8] px-4 py-2.5 rounded-[3px] shadow-[0_8px_18px_rgba(42,82,48,0.13)] whitespace-nowrap animate-float"
        style={{ transform: "rotate(-5deg)", "--rot": "-5deg" } as React.CSSProperties}
      >
        <span className="font-hand text-[19px] font-bold text-[#2A5230]">start here →</span>
      </div>

      {/* Card */}
      <div
        className="relative bg-white border border-[#DDE8DA] rounded-[18px] p-[22px] shadow-[0_22px_50px_-18px_rgba(42,82,48,0.20),0_4px_12px_rgba(42,82,48,0.06)]"
        style={{ transform: "rotate(1.1deg)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-[18px]">
          <div>
            <div className="font-head font-bold text-[18px] text-[#2A5230]">Your learning dashboard</div>
            <div className="text-xs text-[#7A9878] mt-0.5">Nonprofit VA Path · 3 of 7 complete</div>
          </div>
          <div className="flex gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#5A8C5E]" />
            <span className="w-2 h-2 rounded-full bg-[#5A8C5E]" />
            <span className="w-2 h-2 rounded-full bg-[#4A7A4E]" />
          </div>
        </div>

        {/* Path line */}
        <div className="relative h-[60px] my-1 mb-4">
          <svg viewBox="0 0 340 60" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
            <path
              d="M12,44 C50,14 90,10 120,30 C150,50 180,50 220,28 C250,10 280,8 328,18"
              fill="none" stroke="#C5D8C5" strokeWidth="2.2" strokeDasharray="3 8" strokeLinecap="round"
            />
          </svg>
          {/* step 1 — done */}
          <span className="absolute left-[4px] top-[34px] w-[22px] h-[22px] rounded-full bg-[#4A7A4E] text-white text-[10px] font-extrabold flex items-center justify-center">✓</span>
          {/* step 2 — done */}
          <span className="absolute left-[108px] top-[20px] w-[22px] h-[22px] rounded-full bg-[#4A7A4E] text-white text-[10px] font-extrabold flex items-center justify-center">✓</span>
          {/* step 3 — current */}
          <span className="absolute left-[212px] top-[17px] w-[24px] h-[24px] rounded-full bg-white border-[2.5px] border-[#5A8C5E] shadow-[0_0_0_4px_rgba(90,140,94,0.15)]" />
          {/* step 4 — upcoming */}
          <span className="absolute right-[4px] top-3 w-[18px] h-[18px] rounded-full bg-[#EAF2EA] border-[2px] border-dashed border-[#C5D8C5]" />
        </div>

        {/* Course rows */}
        <div className="flex flex-col gap-2.5">
          {[
            {
              icon: (
                <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="#4A7A4E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 6h16M4 12h16M4 18h10" />
                </svg>
              ),
              bg: "#E4EFE4",
              label: "Inbox & Calendar Systems",
              pct: "100%",
              color: "#4A7A4E",
              bar: "w-full",
            },
            {
              icon: (
                <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="#5A8C5E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 11c0 5.5-7 10-7 10z" />
                </svg>
              ),
              bg: "#DDEADE",
              label: "Donor Records Cleanup",
              pct: "46%",
              color: "#5A8C5E",
              bar: "w-[46%]",
            },
          ].map((row) => (
            <div
              key={row.label}
              className="flex items-center gap-3 bg-white border border-[#EAF2EA] rounded-xl px-3 py-3"
            >
              <div
                className="w-[38px] h-[38px] rounded-[9px] flex items-center justify-center shrink-0"
                style={{ background: row.bg }}
              >
                {row.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13.5px] font-bold text-[#2A5230]">{row.label}</div>
                <div className="h-1.5 bg-[#EAF2EA] rounded-full mt-[7px] overflow-hidden">
                  <div
                    className={`h-full ${row.bar} rounded-full animate-grow`}
                    style={{ background: row.color }}
                  />
                </div>
              </div>
              <span className="text-[11px] font-extrabold" style={{ color: row.color }}>{row.pct}</span>
            </div>
          ))}
        </div>

        {/* Tags */}
        <div className="flex gap-1.5 flex-wrap mt-4">
          {["VA · Operations", "Nonprofit", "+4 more"].map((tag, i) => (
            <span
              key={tag}
              className="text-[10.5px] font-bold tracking-[0.04em] px-2.5 py-1 rounded-full"
              style={{
                color: i === 0 ? "#4A7A4E" : i === 1 ? "#5A8C5E" : "#4A6650",
                background: i === 0 ? "#E4EFE4" : i === 1 ? "#DDEADE" : "#EAF2EA",
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Certificate chip */}
      <div
        className="absolute -bottom-7 right-4 z-10 bg-white border border-[#DDE8DA] rounded-[13px] px-4 py-3.5 shadow-[0_14px_30px_-10px_rgba(42,82,48,0.18)] flex items-center gap-3"
        style={{ transform: "rotate(-3deg)" }}
      >
        <div className="w-[34px] h-[34px] rounded-full bg-[#E4EFE4] flex items-center justify-center">
          <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="#4A7A4E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="9" r="5" />
            <path d="M8.5 13.5L7 21l5-2.5L17 21l-1.5-7.5" />
          </svg>
        </div>
        <div className="whitespace-nowrap">
          <div className="text-[12.5px] font-extrabold text-[#2A5230] leading-[1.3]">Certificate earned</div>
          <div className="text-[11px] text-[#7A9878] leading-[1.3]">Nonprofit Ops VA</div>
        </div>
      </div>

      {/* Arrow */}
      <svg viewBox="0 0 70 50" className="absolute bottom-10 -left-10 w-16 h-12 overflow-visible z-10">
        <path d="M6,8 C2,28 20,40 44,40" fill="none" stroke="#4A7A4E" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M44,40 L33,35 M44,40 L37,48" fill="none" stroke="#4A7A4E" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
    </div>
  );
}


/* ─── Page ─── */
export default function HomePage() {
  return (
    <>
      {/* ── Hero ── */}
      <section id="top" className="relative max-w-[1240px] mx-auto px-7 pt-16 pb-12 overflow-x-clip">
        <div className="relative flex gap-14 items-center flex-wrap">
          {/* Left */}
          <div className="flex-1 min-w-[320px]" style={{ flexBasis: "440px" }}>
            {/* Headline */}
            <h1 className="font-head font-extrabold text-[clamp(36px,5.1vw,62px)] leading-[1.04] tracking-[-0.018em] mb-6 text-[#2A5230]">
              Learn the{" "}
              <span className="relative whitespace-nowrap">
                <span
                  className="relative z-10"
                  style={{
                    background: "linear-gradient(100deg,rgba(74,122,78,0) 1%,rgba(74,122,78,.22) 4%,rgba(74,122,78,.20) 94%,rgba(74,122,78,0) 99%)",
                    padding: "0 .06em",
                    borderRadius: "3px",
                  }}
                >
                  systems
                </span>
              </span>{" "}
              behind better businesses, nonprofits, and{" "}
              <span className="relative whitespace-nowrap">
                support teams
                <svg
                  viewBox="0 0 320 14"
                  preserveAspectRatio="none"
                  className="absolute left-0 w-full overflow-visible"
                  style={{ bottom: "-9px", height: "13px" }}
                >
                  <path
                    d="M3,9 Q80,2 160,7 T317,5"
                    fill="none"
                    stroke="#4A7A4E"
                    strokeWidth="3.4"
                    strokeLinecap="round"
                    style={{ "--len": "340", strokeDasharray: "340" } as React.CSSProperties}
                    className="animate-draw"
                  />
                </svg>
              </span>
              .
            </h1>

            {/* Subheadline */}
            <p className="text-[clamp(16px,1.5vw,18.5px)] leading-[1.62] text-[#4A6650] max-w-[560px] mb-8">
              RaeLearn gives VAs, founders, nonprofit leaders, and small teams practical courses
              on operations, admin systems, websites, compliance awareness, donor support, workflow
              setup, and digital business maintenance.
            </p>

            {/* CTAs */}
            <HeroCTAs />

            {/* Trust line */}
            <div className="flex items-center gap-6 mt-8 flex-wrap">
              <span className="text-[13.5px] text-[#7A9878] font-medium">
                Trusted by VAs, nonprofit teams &amp; founders
              </span>
              <div className="flex items-center gap-2">
                <span className="font-hand text-[21px] text-[#4A7A4E] font-bold">free to start</span>
                <svg viewBox="0 0 60 34" className="w-[54px] h-[30px] overflow-visible">
                  <path d="M4,6 C26,2 40,14 50,26" fill="none" stroke="#4A7A4E" strokeWidth="2.4" strokeLinecap="round" />
                  <path d="M40,26 L51,27 L46,17" fill="none" stroke="#4A7A4E" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>

          {/* Right — dashboard mockup */}
          <div className="flex-1 min-w-[320px] relative pt-10 pb-10" style={{ flexBasis: "440px" }}>
            <DashboardMockup />
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="bg-[#EEE8DC] border-t border-[#DDD5C4] px-7 py-[88px]">
        <div className="max-w-[960px] mx-auto">
          <div className="mb-[18px]">
            <span className="text-xs font-medium tracking-[0.1em] uppercase text-[#5A8C5E]">How it works</span>
          </div>
          <h2 className="font-display font-bold text-3xl text-[#2A5230] mb-11 leading-[1.2]">
            Three steps to your first VA client.
          </h2>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4">
            {[
              {
                n: "01",
                title: "Pick a course",
                body: "Start with VA Foundations — it's free and covers exactly what beginners need to know.",
              },
              {
                n: "02",
                title: "Learn at your pace",
                body: "Short lessons you can actually finish. Watch, read, and practice in under 20 minutes per session.",
              },
              {
                n: "03",
                title: "Apply it immediately",
                body: "Every lesson ends with a clear action step. You leave with a deliverable, not just notes.",
              },
            ].map(({ n, title, body }) => (
              <div key={n} className="bg-white border border-[#DDE8DA] rounded-xl p-7">
                <div className="font-head font-bold text-[38px] text-[#4A7A4E] leading-none mb-3">{n}</div>
                <h3 className="font-display font-bold text-lg text-[#2A5230] mb-2.5 leading-[1.3]">{title}</h3>
                <p className="text-sm leading-[1.65] text-[#4A6650]">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="bg-[#F5F0E8] border-t border-[#E5DDD0] px-5 md:px-7 py-[88px]">
        <div className="max-w-[1100px] mx-auto">
          <div className="mb-3">
            <span className="text-xs font-medium tracking-[0.1em] uppercase text-[#5A8C5E]">Learner stories</span>
          </div>
          <h2 className="font-head font-extrabold text-[clamp(26px,3.5vw,38px)] text-[#2A5230] mb-10 leading-[1.15]">
            Real results from real learners.
          </h2>

          {/* Masonry grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 items-start">

            {/* Card 1 — large, dark forest */}
            <div
              className="rounded-[18px] p-7 flex flex-col gap-5 sm:row-span-2"
              style={{ background: "#2A5230" }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-extrabold shrink-0" style={{ background: "#4A7A4E", color: "#C8E6CA" }}>MS</div>
                <div>
                  <div className="text-sm font-bold text-white leading-tight">Maria Santos</div>
                  <div className="text-[11px] font-medium" style={{ color: "#7DAA82" }}>Verified Learner · VA</div>
                </div>
              </div>
              <p className="font-head font-extrabold text-[22px] leading-[1.25] text-white">
                I landed my first retainer client within two weeks of finishing the course.
              </p>
              <p className="text-[13.5px] leading-[1.65] italic" style={{ color: "#A8C4A4" }}>
                "I had no idea what a VA 'system' even meant before this. Now I manage three clients' inboxes, handle their calendars, and built their SOPs from scratch. The Inbox &amp; Calendar module alone changed everything."
              </p>
            </div>

            {/* Card 2 — white, medium */}
            <div className="rounded-[18px] p-6 flex flex-col gap-4 bg-white border border-[#DDE8DA]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0" style={{ background: "#EEF5EE", color: "#2A5230" }}>JP</div>
                <div>
                  <div className="text-sm font-bold text-[#1A2E1C] leading-tight">Jennifer Park</div>
                  <div className="text-[11px] font-medium text-[#7A9878]">Verified Learner · Founder</div>
                </div>
              </div>
              <p className="font-head font-bold text-[18px] leading-[1.3] text-[#1A2E1C]">
                Hired a VA, trained her in a weekend.
              </p>
              <p className="text-[13px] leading-[1.65] italic text-[#4A6650]">
                "I pointed my new VA at the course on a Friday. By Monday she had our Google Drive cleaned up, our inbox at zero, and a weekly report template ready. Worth every cent."
              </p>
            </div>

            {/* Card 3 — sage green */}
            <div
              className="rounded-[18px] p-6 flex flex-col gap-4"
              style={{ background: "#4E6B46" }}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0" style={{ background: "rgba(255,255,255,0.15)", color: "#fff" }}>RM</div>
                <div>
                  <div className="text-sm font-bold text-white leading-tight">Rachel Moore</div>
                  <div className="text-[11px] font-medium" style={{ color: "#B8D8A8" }}>Verified Learner · Team member</div>
                </div>
              </div>
              <p className="font-head font-bold text-[18px] leading-[1.3] text-white">
                I use these systems every single week.
              </p>
              <p className="text-[13px] leading-[1.65] italic" style={{ color: "#C0D8B4" }}>
                "The workflow and SOP modules changed how our whole team communicates. We wasted so much time before having documented processes."
              </p>
            </div>

            {/* Card 4 — cream, large */}
            <div
              className="rounded-[18px] p-7 flex flex-col gap-5"
              style={{ background: "#EEE8DC", border: "1.5px solid #DDD5C4" }}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0" style={{ background: "#D8CFBE", color: "#2A5230" }}>TR</div>
                <div>
                  <div className="text-sm font-bold text-[#1A2E1C] leading-tight">Trina Reyes</div>
                  <div className="text-[11px] font-medium text-[#7A9878]">Verified Learner · Nonprofit ED</div>
                </div>
              </div>
              <p className="font-head font-extrabold text-[20px] leading-[1.3] text-[#1A2E1C]">
                The nonprofit compliance module alone is worth it.
              </p>
              <p className="text-[13.5px] leading-[1.65] italic text-[#4A6650]">
                "We were running our 501(c)(3) on sheer luck and spreadsheets. RaeLearn taught me exactly what our donors expect and what our board actually needed from us. Wish I had this when we filed for status."
              </p>
            </div>

            {/* Card 5 — white */}
            <div className="rounded-[18px] p-6 flex flex-col gap-4 bg-white border border-[#DDE8DA]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0" style={{ background: "#EEF5EE", color: "#2A5230" }}>CD</div>
                <div>
                  <div className="text-sm font-bold text-[#1A2E1C] leading-tight">Camille Dizon</div>
                  <div className="text-[11px] font-medium text-[#7A9878]">Verified Learner · Freelancer → VA</div>
                </div>
              </div>
              <p className="font-head font-bold text-[18px] leading-[1.3] text-[#1A2E1C]">
                From graphic design to operations VA in 3 months.
              </p>
              <p className="text-[13px] leading-[1.65] italic text-[#4A6650]">
                "This is the only course that actually showed me how the backend of a business runs. Not theory — real systems I could offer immediately as services."
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ── CTA banner (merged with courses teaser) ── */}
      <section className="bg-[#2A5230] px-5 md:px-7 py-[80px]">
        <div className="max-w-[760px] mx-auto text-center">
          <div className="mb-3">
            <span className="text-xs font-bold tracking-[0.12em] uppercase" style={{ color: "#7DAA82" }}>Courses · Operations · Systems</span>
          </div>
          <h2 className="font-head font-extrabold text-[clamp(26px,4vw,44px)] text-white mb-4 leading-[1.1]">
            Ready to build the skills that run the show?
          </h2>
          <p className="text-[#A8C4A4] text-base md:text-lg mb-8 leading-[1.6] max-w-[540px] mx-auto">
            Practical courses for VAs, founders &amp; nonprofits — covering operations, admin systems, workflow setup, and more. Free to start, no card needed.
          </p>
          <div className="flex gap-3.5 flex-wrap items-center justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 text-base font-bold text-[#2A5230] bg-white px-7 py-[15px] rounded-xl whitespace-nowrap hover:bg-[#F5F0E8] transition-colors"
            >
              Start Learning Free →
            </Link>
            <Link
              href="/courses"
              className="inline-flex items-center text-base font-semibold text-white border border-white/30 px-7 py-[15px] rounded-xl whitespace-nowrap hover:border-white/60 transition-colors"
            >
              Browse Courses
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
