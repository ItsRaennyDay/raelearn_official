import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 60;

const SUPPORT_AREAS = [
  {
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#2A5230" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 11c0 5.5-7 10-7 10z" />
      </svg>
    ),
    bg: "#DDE8DA",
    title: "Nonprofit VA support",
    desc: "Donors, boards, grants, and compliance calendars.",
    href: "/courses",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#2A5230" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 7h7M8 4l3 3-3 3M20 17h-7M16 14l-3 3 3 3" />
      </svg>
    ),
    bg: "#EEE8DC",
    title: "Business VA support",
    desc: "Client workflows, SOPs, and backend setup.",
    href: "/courses",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#2A5230" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="13" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
    bg: "#DDE8DA",
    title: "Website maintenance",
    desc: "Backups, updates, uptime, and content edits.",
    href: "/courses",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#2A5230" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 6h16M4 12h16M4 18h10" />
      </svg>
    ),
    bg: "#EEE8DC",
    title: "Operations support",
    desc: "SOPs, documentation, and workflow mapping.",
    href: "/courses",
  },
];

export default async function ForVAsPage() {
  const supabase = await createClient();

  // Fetch published bundles for VAs (va-specific + general)
  const { data: bundles } = await supabase
    .from("bundles")
    .select(`
      id, title, description, slug, sort_order,
      bundle_courses ( course_id )
    `)
    .in("audience", ["va", "general"])
    .eq("is_published", true)
    .order("sort_order");

  // Fetch published VA courses (tagged audience=va)
  const { data: vaCourses } = await supabase
    .from("courses")
    .select(`
      id, title, slug, level, price_type, certificate_eligible,
      course_tags ( tags ( slug, group ) )
    `)
    .eq("status", "published")
    .limit(50);

  // Filter to those with audience tag "va"
  type CourseRaw = typeof vaCourses extends (infer T)[] | null ? T : never;
  function hasVATag(c: CourseRaw): boolean {
    const ct = (c as Record<string, unknown>).course_tags as { tags: { slug: string; group: string } | null }[] | null;
    return (ct ?? []).some((row) => row.tags?.group === "audience" && row.tags?.slug === "va");
  }
  const vaTaggedCourses = (vaCourses ?? []).filter(hasVATag);
  const popularVA = vaTaggedCourses.slice(0, 4);
  const vaCerts = vaTaggedCourses.filter((c) => c.certificate_eligible);

  const ACC_META: Record<string, { label: string; color: string; bg: string; cta: string }> = {
    free: { label: "FREE", color: "#2D8BFF", bg: "#E4F0FF", cta: "Enroll Free" },
    paid: { label: "PAID", color: "#4A6650", bg: "#DDE8DA", cta: "View Course" },
  };

  return (
    <div className="bg-rl-bg" style={{ fontFamily: "var(--font-sans)" }}>
      {/* Header */}
      <section className="relative bg-[#EAF4EE] border-b border-rl-border overflow-hidden">
        <div className="relative max-w-[1240px] mx-auto px-7 pt-12 pb-14 flex gap-12 items-center flex-wrap">
          <div className="flex-1 min-w-[300px]">
            <div className="text-[12.5px] font-bold text-rl-sage mb-4">
              <Link href="/" className="text-rl-sage hover:text-rl-forest transition-colors">Home</Link>
              <span className="mx-1.5">/</span>
              For VAs
            </div>
            <div className="inline-flex items-center bg-white border border-rl-border-mid rounded-full px-[13px] py-1.5 mb-4">
              <span className="text-[11.5px] font-extrabold tracking-[0.08em] uppercase text-rl-forest">Support &amp; Operations track</span>
            </div>
            <h1 className="font-head font-extrabold text-[clamp(32px,4.6vw,54px)] leading-[1.04] tracking-[-0.02em] mb-4 text-rl-forest">
              Become the VA founders and nonprofits actually rely on.
            </h1>
            <p className="text-[17px] leading-relaxed text-rl-muted max-w-[560px] mb-7">
              Build real, sellable support skills — inbox and calendar systems, website upkeep, nonprofit admin,
              donor records, SOPs, and operations — with courses, paths, and certificates made for virtual assistants.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 text-[16px] font-bold text-white bg-rl-forest px-6 py-[15px] rounded-xl whitespace-nowrap hover:bg-[#1e3d24] transition-colors"
              >
                Start VA Courses →
              </Link>
              <Link
                href="/courses"
                className="inline-flex items-center text-[16px] font-bold text-rl-forest bg-white border-[1.6px] border-rl-forest px-[22px] py-[15px] rounded-xl whitespace-nowrap hover:bg-rl-forest hover:text-white transition-colors"
              >
                View VA Certificates
              </Link>
            </div>
          </div>

          {/* Checklist card */}
          <div className="flex-none relative" style={{ flex: "0 1 340px", minWidth: "260px" }}>
            <div className="bg-white border border-rl-border rounded-2xl p-[18px] shadow-[0_24px_50px_-24px_rgba(42,82,48,0.35)]" style={{ transform: "rotate(-1.4deg)" }}>
              <div className="font-head font-bold text-[16px] mb-3.5 text-rl-forest">This week&apos;s checklist</div>
              <div className="flex flex-col gap-2.5">
                {[
                  { label: "Clear & label client inbox",   done: true },
                  { label: "Run website backup check",     done: true },
                  { label: "Update donor records sheet",   done: false },
                  { label: "Send weekly client report",    done: false },
                ].map(({ label, done }) => (
                  <div key={label} className="flex items-center gap-2.5 text-[13.5px]" style={{ color: done ? "#2A5230" : "#7A9878" }}>
                    <span
                      className="w-[18px] h-[18px] rounded-[5px] flex-shrink-0 flex items-center justify-center"
                      style={{ background: done ? "#2A5230" : "#fff", border: done ? "none" : "1.6px solid #B8D4B5" }}
                    >
                      {done && (
                        <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                      )}
                    </span>
                    {label}
                  </div>
                ))}
              </div>
            </div>
            <div
              className="absolute bottom-[-16px] right-2.5 bg-[#FFF3DC] px-3 py-1.5 rounded-sm shadow-[0_8px_18px_rgba(42,82,48,0.15)] whitespace-nowrap"
              style={{ transform: "rotate(5deg)" }}
            >
              <span className="font-hand text-[16px] font-bold text-[#9c6c12]">real client work</span>
            </div>
          </div>
        </div>
      </section>

      {/* Learning Tracks — from DB */}
      {bundles && bundles.length > 0 && (
        <section className="max-w-[1240px] mx-auto px-7 pt-16 pb-9">
          <div className="mb-8">
            <div className="text-[12.5px] font-extrabold tracking-[0.16em] uppercase text-rl-dim mb-3">Pick a track</div>
            <h2 className="font-head font-extrabold text-[clamp(26px,3.4vw,40px)] leading-[1.1] tracking-[-0.015em] mb-2.5 text-rl-forest">
              VA learning tracks
            </h2>
            <p className="text-[15.5px] leading-relaxed text-rl-muted max-w-[560px]">
              Each track bundles the courses for one kind of support work, in a recommended order.
            </p>
          </div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4">
            {bundles.map((bundle) => {
              const count = (bundle.bundle_courses as { course_id: string }[] | null)?.length ?? 0;
              return (
                <Link
                  key={bundle.id}
                  href={`/bundles/${bundle.slug}`}
                  className="bg-white border border-rl-border border-l-4 border-l-rl-forest rounded-[13px] p-5 block shadow-[0_10px_24px_-22px_rgba(42,82,48,0.35)] hover:-translate-y-[3px] transition-transform"
                >
                  <h3 className="font-head font-bold text-[18px] mb-[7px] text-rl-forest">{bundle.title}</h3>
                  {bundle.description && (
                    <p className="text-[13.5px] leading-[1.5] text-rl-muted mb-3">{bundle.description}</p>
                  )}
                  <span className="text-[12.5px] font-bold text-rl-forest">
                    {count} course{count !== 1 ? "s" : ""} →
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Support areas — static (these are structural, not filler) */}
      <section className="max-w-[1240px] mx-auto px-7 py-9">
        <div className="bg-[#F0F5F1] border border-rl-border rounded-[22px] p-[38px_30px]">
          <div className="text-center max-w-[600px] mx-auto mb-7">
            <h2 className="font-head font-extrabold text-[clamp(24px,3vw,34px)] leading-[1.12] mb-2 text-rl-forest">
              Support any kind of client
            </h2>
            <p className="text-[15px] leading-relaxed text-rl-muted">
              RaeLearn teaches the same VA skills cleanly across four common client types.
            </p>
          </div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3.5">
            {SUPPORT_AREAS.map((area) => (
              <Link
                key={area.title}
                href={area.href}
                className="bg-white border border-rl-border rounded-[13px] p-5 block hover:-translate-y-[2px] transition-transform"
              >
                <div className="w-[42px] h-[42px] rounded-[11px] flex items-center justify-center mb-3.5" style={{ background: area.bg }}>
                  {area.icon}
                </div>
                <h3 className="font-head font-bold text-[16.5px] mb-1.5 text-rl-forest">{area.title}</h3>
                <p className="text-[13px] leading-[1.5] text-rl-muted">{area.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Popular VA courses — from DB */}
      {popularVA.length > 0 && (
        <section className="max-w-[1240px] mx-auto px-7 pt-11 pb-5">
          <div className="flex items-end justify-between gap-5 flex-wrap mb-6">
            <h2 className="font-head font-extrabold text-[clamp(24px,3vw,34px)] text-rl-forest">Popular VA courses</h2>
            <Link
              href="/courses"
              className="text-[14px] font-bold text-rl-forest border-[1.5px] border-rl-forest px-4 py-2.5 rounded-[10px] whitespace-nowrap hover:bg-rl-forest hover:text-white transition-colors"
            >
              See all VA courses →
            </Link>
          </div>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(248px,1fr))] gap-4">
            {popularVA.map((c) => {
              const accKey = c.certificate_eligible ? "paid" : c.price_type;
              const acc = ACC_META[accKey] ?? ACC_META.free;
              return (
                <Link
                  key={c.id}
                  href={`/courses/${c.slug}`}
                  className="bg-white border border-rl-border rounded-[14px] overflow-hidden shadow-[0_12px_28px_-24px_rgba(42,82,48,0.3)] flex flex-col hover:-translate-y-[3px] transition-transform"
                >
                  <div className="h-[5px] bg-rl-forest" />
                  <div className="p-[18px] flex flex-col flex-1">
                    <div className="flex justify-between mb-[11px]">
                      <span className="text-[11px] font-extrabold text-rl-forest bg-[#DDE8DA] px-[9px] py-1 rounded-[7px]">
                        VA
                      </span>
                      <span className="text-[10.5px] font-extrabold px-[9px] py-1 rounded-[7px]" style={{ color: acc.color, background: acc.bg }}>
                        {acc.label}
                      </span>
                    </div>
                    <h3 className="font-head font-bold text-[17px] leading-[1.25] mb-3 flex-1 text-rl-forest">{c.title}</h3>
                    <span className="text-center text-[13.5px] font-bold text-rl-forest border-[1.5px] border-rl-border py-2.5 rounded-[9px]">
                      {acc.cta}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* VA Certificates + Suggested path */}
      <section className="max-w-[1240px] mx-auto px-7 pt-9 pb-5 grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-6">
        {vaCerts.length > 0 && (
          <div>
            <h2 className="font-head font-extrabold text-[clamp(22px,2.6vw,30px)] mb-4 text-rl-forest">VA certificates</h2>
            <div className="flex flex-col gap-3">
              {vaCerts.map((cert) => (
                <Link
                  key={cert.id}
                  href={`/courses/${cert.slug}`}
                  className="flex items-center gap-3.5 bg-white border border-rl-border rounded-[13px] p-4 hover:-translate-y-[2px] transition-transform"
                >
                  <div className="w-[42px] h-[42px] rounded-full bg-[#DDE8DA] flex items-center justify-center flex-shrink-0">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#2A5230" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="9" r="5" />
                      <path d="M8.5 13.5L7 21l5-2.5L17 21l-1.5-7.5" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-head font-bold text-[16px] mb-0.5 text-rl-forest">{cert.title}</h3>
                    <div className="text-[12.5px] text-rl-dim capitalize">{cert.level}</div>
                  </div>
                  <span className="text-[18px] text-rl-forest">→</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div>
          <h2 className="font-head font-extrabold text-[clamp(22px,2.6vw,30px)] mb-4 text-rl-forest">Suggested by skill level</h2>
          <div className="bg-white border border-rl-border rounded-2xl p-[22px]">
            <div className="flex flex-col gap-0">
              {[
                { level: "Beginner",     color: "#3E9A52", title: "General VA Foundations",          sub: "Inbox, calendar, client communication" },
                { level: "Intermediate", color: "#2A5230", title: "Nonprofit or Website Maintenance", sub: "Specialize in a client type" },
                { level: "Advanced",     color: "#C48A3A", title: "Earn a VA Certificate",            sub: "Prove the full system, raise your rate" },
              ].map((step, i, arr) => (
                <div key={step.level} className="flex gap-3.5">
                  <div className="flex flex-col items-center">
                    <span className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ background: step.color }} />
                    {i < arr.length - 1 && <span className="w-0.5 flex-1 bg-rl-border my-0.5" />}
                  </div>
                  <div className={i < arr.length - 1 ? "pb-[18px]" : ""}>
                    <div className="text-[11px] font-extrabold tracking-[0.08em] uppercase mb-0.5" style={{ color: step.color }}>{step.level}</div>
                    <div className="text-[14.5px] font-bold text-rl-forest">{step.title}</div>
                    <div className="text-[13px] text-rl-muted">{step.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-[1240px] mx-auto px-7 pt-10 pb-20">
        <div className="bg-rl-forest rounded-[22px] p-[48px_32px] text-center text-white">
          <h2 className="font-head font-extrabold text-[clamp(26px,3.4vw,40px)] mb-3">Start free, then specialize.</h2>
          <p className="text-[16px] leading-relaxed text-[#C8DEC8] mx-auto mb-6 max-w-[520px]">
            Take a free VA course today and move into a paid track or certificate when you&apos;re ready.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link
              href="/courses"
              className="text-[16px] font-bold text-rl-forest bg-white px-7 py-[15px] rounded-xl whitespace-nowrap hover:bg-[#F5F0E8] transition-colors"
            >
              Start a Free VA Course
            </Link>
            <Link
              href="/courses"
              className="text-[16px] font-bold text-white border-[1.6px] border-white/50 px-6 py-[15px] rounded-xl whitespace-nowrap hover:border-white hover:bg-white/10 transition-colors"
            >
              View VA Certificates
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
