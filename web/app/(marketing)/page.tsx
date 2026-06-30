import Link from "next/link";

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
        <div className="relative h-[58px] my-1 mb-4">
          <svg viewBox="0 0 380 58" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
            <path
              d="M18,40 C70,8 120,8 168,32 C210,52 250,52 300,22 C330,6 350,10 364,16"
              fill="none" stroke="#C5D8C5" strokeWidth="2.4" strokeDasharray="2 7" strokeLinecap="round"
            />
          </svg>
          <span className="absolute left-2 top-[30px] w-[22px] h-[22px] rounded-full bg-[#4A7A4E] text-white text-[11px] font-extrabold flex items-center justify-center">✓</span>
          <span className="absolute left-[152px] top-[22px] w-[22px] h-[22px] rounded-full bg-[#4A7A4E] text-white text-[11px] font-extrabold flex items-center justify-center">✓</span>
          <span className="absolute left-[288px] top-3 w-6 h-6 rounded-full bg-white border-[2.5px] border-[#5A8C5E] shadow-[0_0_0_4px_rgba(90,140,94,0.16)]" />
          <span className="absolute left-[352px] top-1.5 w-[18px] h-[18px] rounded-full bg-[#EAF2EA] border-2 border-dashed border-[#C5D8C5]" />
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
        className="absolute -bottom-7 -right-2 z-10 bg-white border border-[#DDE8DA] rounded-[13px] px-4 py-3.5 shadow-[0_14px_30px_-10px_rgba(42,82,48,0.18)] flex items-center gap-3"
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
      <section id="top" className="relative max-w-[1240px] mx-auto px-7 pt-16 pb-12">
        <div className="relative flex gap-14 items-center flex-wrap">
          {/* Left */}
          <div className="flex-1 min-w-[320px]" style={{ flexBasis: "440px" }}>
            {/* Eyebrow pill */}
            <div className="inline-flex items-center gap-2 bg-white border border-[#DDE8DA] rounded-full px-3.5 py-[7px] mb-6">
              <span className="w-2 h-2 rounded-full bg-[#4A7A4E] shrink-0" />
              <span className="text-xs font-bold tracking-[0.06em] text-[#4A6650]">
                PRACTICAL TRAINING FOR PEOPLE WHO RUN THINGS
              </span>
            </div>

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
            <div className="flex gap-3.5 flex-wrap items-center">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 text-base font-bold text-white bg-[#2A5230] px-6 py-[15px] rounded-xl shadow-[0_6px_18px_rgba(42,82,48,0.22)] whitespace-nowrap hover:bg-[#1e3d24] hover:-translate-y-px transition-all"
              >
                Start Learning <span className="text-[18px] leading-none">→</span>
              </Link>
              <Link
                href="/signup?type=group"
                className="inline-flex items-center text-base font-bold text-[#2A5230] bg-white border-[1.6px] border-[#2A5230] px-6 py-[15px] rounded-xl whitespace-nowrap hover:bg-[#2A5230] hover:text-white transition-colors"
              >
                Create Group Account
              </Link>
            </div>

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
          <div className="flex-1 min-w-[320px] relative" style={{ flexBasis: "440px" }}>
            <DashboardMockup />
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="bg-[#EEE8DC] border-t border-[#DDD5C4] px-7 py-[88px]">
        <div className="max-w-[960px] mx-auto">
          <div className="flex items-center gap-2 mb-[18px]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#5A8C5E] shrink-0" />
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
                <div className="font-mono text-[36px] text-[#4A7A4E] leading-none mb-3">{n}</div>
                <h3 className="font-display font-bold text-lg text-[#2A5230] mb-2.5 leading-[1.3]">{title}</h3>
                <p className="text-sm leading-[1.65] text-[#4A6650]">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Courses ── */}
      <section className="bg-[#F5F0E8] border-t border-[#E5DDD0] px-7 py-[88px]">
        <div className="max-w-[960px] mx-auto text-center">
          <div className="inline-flex items-center gap-2 mb-[18px]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#5A8C5E] shrink-0" />
            <span className="text-xs font-medium tracking-[0.1em] uppercase text-[#5A8C5E]">Courses</span>
          </div>
          <h2 className="font-display font-bold text-3xl text-[#2A5230] mb-4 leading-[1.2]">
            Practical training for VAs, founders &amp; nonprofits.
          </h2>
          <p className="text-[#4A6650] text-base leading-relaxed mb-8 max-w-[520px] mx-auto">
            Courses covering operations, admin systems, websites, nonprofit admin, workflow setup, and more — launching soon.
          </p>
          <Link
            href="/courses"
            className="inline-flex items-center text-sm font-semibold text-[#2A5230] border border-[#A8C4A4] px-6 py-3 rounded-[10px] hover:border-[#2A5230] transition-colors"
          >
            Browse Courses →
          </Link>
        </div>
      </section>

      {/* ── CTA banner ── */}
      <section className="bg-[#2A5230] px-7 py-[72px]">
        <div className="max-w-[720px] mx-auto text-center">
          <h2 className="font-head font-extrabold text-[clamp(26px,4vw,42px)] text-white mb-4 leading-[1.1]">
            Ready to build the skills that run the show?
          </h2>
          <p className="text-[#A8C4A4] text-lg mb-8 leading-[1.6]">
            Start with a free course today. No credit card required.
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
