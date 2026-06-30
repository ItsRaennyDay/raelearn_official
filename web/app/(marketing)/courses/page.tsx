"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

type AccessType = "all" | "free" | "paid" | "certificate";
type AudType = "all" | "va" | "nonprofit" | "business" | "founder" | "team";
type LevelType = "all" | "beginner" | "intermediate" | "advanced";

const AUD_META: Record<string, { label: string; color: string; bg: string }> = {
  va:        { label: "VA",        color: "#2A5230", bg: "#DDE8DA" },
  nonprofit: { label: "Nonprofit", color: "#2A5230", bg: "#C8DEC8" },
  business:  { label: "Business",  color: "#4A6650", bg: "#EEE8DC" },
  founder:   { label: "Founder",   color: "#2A5230", bg: "#DDE8DA" },
  team:      { label: "Team",      color: "#4A6650", bg: "#EEE8DC" },
};

const LVL_META: Record<string, { label: string; dot: string }> = {
  beginner:     { label: "Beginner",     dot: "#3E9A52" },
  intermediate: { label: "Intermediate", dot: "#2A5230" },
  advanced:     { label: "Advanced",     dot: "#C48A3A" },
};

const ACC_META: Record<string, { label: string; color: string; bg: string; cta: string }> = {
  free:        { label: "FREE",        color: "#2D8BFF", bg: "#E4F0FF", cta: "Enroll Free" },
  paid:        { label: "PAID",        color: "#4A6650", bg: "#DDE8DA", cta: "View Course" },
  certificate: { label: "CERTIFICATE", color: "#9c6c12", bg: "#FFF3DC", cta: "View Certificate" },
};

const TOPIC_LABELS: Record<string, string> = {
  website:    "Website",
  operations: "Operations",
  compliance: "Compliance",
  board:      "Board Support",
  donor:      "Donor/Fundraising",
  grant:      "Grant Readiness",
  automation: "Automation",
};

type Course = {
  t: string;
  acc: "free" | "paid" | "certificate";
  aud: string[];
  topic: string;
  lvl: "beginner" | "intermediate" | "advanced";
  h: string;
};

const COURSES: Course[] = [
  { t: "Nonprofit vs 501(c)(3)",                             acc: "free",        aud: ["nonprofit"],         topic: "compliance", lvl: "beginner",     h: "~1.5 hrs" },
  { t: "What Is Form 990?",                                  acc: "free",        aud: ["nonprofit"],         topic: "compliance", lvl: "beginner",     h: "~1 hr"   },
  { t: "Board Basics for Startup Nonprofits",                acc: "free",        aud: ["nonprofit"],         topic: "board",      lvl: "beginner",     h: "~1.5 hrs" },
  { t: "Donor Records Basics",                               acc: "free",        aud: ["nonprofit"],         topic: "donor",      lvl: "beginner",     h: "~1 hr"   },
  { t: "Grant Readiness Basics",                             acc: "free",        aud: ["nonprofit"],         topic: "grant",      lvl: "beginner",     h: "~1.5 hrs" },
  { t: "Website Maintenance Basics",                         acc: "free",        aud: ["va", "business"],    topic: "website",    lvl: "beginner",     h: "~1 hr"   },
  { t: "SOP Writing Basics",                                 acc: "free",        aud: ["business"],          topic: "operations", lvl: "beginner",     h: "~1.5 hrs" },
  { t: "Google Drive Cleanup for Small Businesses",          acc: "free",        aud: ["business"],          topic: "operations", lvl: "beginner",     h: "~1 hr"   },
  { t: "What VAs Need to Know Before Supporting a Nonprofit",acc: "free",        aud: ["va"],                topic: "operations", lvl: "beginner",     h: "~1 hr"   },
  { t: "Inbox & Calendar Basics",                            acc: "free",        aud: ["va"],                topic: "operations", lvl: "beginner",     h: "~1 hr"   },
  { t: "Nonprofit Operations VA Certificate",                acc: "certificate", aud: ["nonprofit", "va"],   topic: "operations", lvl: "intermediate", h: "~9 hrs"  },
  { t: "Founder Support VA Certificate",                     acc: "certificate", aud: ["va", "founder"],     topic: "operations", lvl: "intermediate", h: "~8 hrs"  },
  { t: "SOP & Workflow Certificate",                         acc: "certificate", aud: ["business"],          topic: "operations", lvl: "intermediate", h: "~7 hrs"  },
  { t: "Website Maintenance for VAs",                        acc: "paid",        aud: ["va"],                topic: "website",    lvl: "beginner",     h: "~5 hrs"  },
  { t: "U.S. Nonprofit Startup Operations Bootcamp",         acc: "paid",        aud: ["nonprofit"],         topic: "operations", lvl: "advanced",     h: "~12 hrs" },
  { t: "Startup Backend Setup",                              acc: "paid",        aud: ["business"],          topic: "operations", lvl: "intermediate", h: "~7 hrs"  },
  { t: "SOP Builder Course",                                 acc: "paid",        aud: ["business"],          topic: "operations", lvl: "beginner",     h: "~6 hrs"  },
  { t: "Donor Operations for Small Nonprofits",              acc: "paid",        aud: ["nonprofit"],         topic: "donor",      lvl: "intermediate", h: "~6 hrs"  },
  { t: "Board Admin Support for Nonprofit VAs",              acc: "paid",        aud: ["va", "nonprofit"],   topic: "board",      lvl: "intermediate", h: "~5 hrs"  },
  { t: "Client Operations Setup",                            acc: "paid",        aud: ["business"],          topic: "operations", lvl: "intermediate", h: "~6 hrs"  },
  { t: "Automation Basics for Small Teams",                  acc: "paid",        aud: ["business", "team"],  topic: "automation", lvl: "beginner",     h: "~4 hrs"  },
  { t: "Compliance Calendar Support",                        acc: "paid",        aud: ["nonprofit"],         topic: "compliance", lvl: "intermediate", h: "~4 hrs"  },
];

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "text-[12.5px] font-semibold px-3 py-[7px] rounded-[9px] cursor-pointer transition-all whitespace-nowrap border-[1.5px]",
        active
          ? "bg-rl-forest text-white border-rl-forest"
          : "bg-white text-rl-muted border-rl-border hover:border-rl-border-mid",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

export default function CoursesPage() {
  const [access, setAccess] = useState<AccessType>("all");
  const [aud, setAud]       = useState<AudType>("all");
  const [topic, setTopic]   = useState<string>("all");
  const [level, setLevel]   = useState<LevelType>("all");
  const [q, setQ]           = useState("");

  function toggle<T extends string>(
    current: T,
    value: T,
    setter: (v: T) => void,
    allValue: T
  ) {
    setter(current === value ? allValue : value);
  }

  const clearAll = () => {
    setAccess("all");
    setAud("all");
    setTopic("all");
    setLevel("all");
    setQ("");
  };

  const filtered = useMemo(() => {
    const qLower = q.trim().toLowerCase();
    return COURSES.filter((c) => {
      if (access !== "all" && c.acc !== access) return false;
      if (aud !== "all" && !c.aud.includes(aud)) return false;
      if (topic !== "all" && c.topic !== topic) return false;
      if (level !== "all" && c.lvl !== level) return false;
      if (qLower) {
        const topicLabel = TOPIC_LABELS[c.topic] ?? "";
        const audLabels = c.aud.map((a) => AUD_META[a]?.label ?? "").join(" ");
        return (
          c.t.toLowerCase().includes(qLower) ||
          topicLabel.toLowerCase().includes(qLower) ||
          audLabels.toLowerCase().includes(qLower)
        );
      }
      return true;
    });
  }, [access, aud, topic, level, q]);

  const activeSummary = [
    access !== "all" ? ACC_META[access].label.toLowerCase() : null,
    aud !== "all" ? AUD_META[aud].label : null,
    topic !== "all" ? TOPIC_LABELS[topic] : null,
    level !== "all" ? level : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="bg-rl-bg min-h-screen" style={{ fontFamily: "var(--font-sans)" }}>
      {/* Header */}
      <section className="relative bg-[#F5F0E8] border-b border-rl-border overflow-hidden">
        <div className="relative max-w-[1240px] mx-auto px-7 pt-12 pb-10">
          <div className="text-[12.5px] font-bold text-rl-dim mb-3.5">
            <Link href="/" className="text-rl-dim hover:text-rl-forest transition-colors">Home</Link>
            <span className="mx-1.5">/</span>
            Courses
          </div>
          <h1 className="font-head font-extrabold text-[clamp(32px,4.4vw,52px)] leading-[1.05] tracking-[-0.02em] mb-3.5 text-rl-forest">
            The full course catalog.
          </h1>
          <p className="text-[16.5px] leading-relaxed text-rl-muted max-w-[600px] mb-6">
            Every RaeLearn course in one place — free starters, paid deep-dives, and certificates.
            Filter by access, audience, topic, and skill level.
          </p>
          <div className="relative max-w-[480px]">
            <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="#7A9878" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" />
            </svg>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search courses, topics, audiences…"
              className="w-full text-[15px] pl-11 pr-4 py-3.5 border-[1.5px] border-rl-border rounded-xl bg-white text-rl-forest outline-none focus:border-rl-forest placeholder:text-rl-dim"
            />
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="max-w-[1240px] mx-auto px-7 pt-9 pb-20 flex gap-8 items-start flex-wrap">
        {/* Filter sidebar */}
        <aside className="flex-none w-[248px] min-w-[220px] sticky top-[88px]">
          <div className="flex items-center justify-between mb-4">
            <span className="font-head font-bold text-[18px] text-rl-forest">Filters</span>
            <button
              onClick={clearAll}
              className="text-[12.5px] font-bold text-rl-dim hover:text-rl-forest bg-none border-none cursor-pointer transition-colors"
            >
              Clear all
            </button>
          </div>

          {[
            {
              label: "Access",
              items: [
                { value: "free", label: "Free" },
                { value: "paid", label: "Paid" },
                { value: "certificate", label: "Certificate" },
              ] as { value: AccessType; label: string }[],
              current: access,
              setter: (v: AccessType) => toggle(access, v, setAccess, "all"),
            },
            {
              label: "Audience",
              items: [
                { value: "nonprofit", label: "Nonprofit" },
                { value: "business", label: "Business" },
                { value: "va", label: "VA" },
                { value: "founder", label: "Founder" },
                { value: "team", label: "Team Training" },
              ] as { value: AudType; label: string }[],
              current: aud,
              setter: (v: AudType) => toggle(aud, v, setAud, "all"),
            },
          ].map((group) => (
            <div key={group.label} className="mb-5">
              <div className="text-[11px] font-extrabold tracking-[0.1em] uppercase text-rl-dim mb-2.5">
                {group.label}
              </div>
              <div className="flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <Chip
                    key={item.value}
                    label={item.label}
                    active={group.current === item.value}
                    onClick={() => group.setter(item.value as never)}
                  />
                ))}
              </div>
            </div>
          ))}

          <div className="mb-5">
            <div className="text-[11px] font-extrabold tracking-[0.1em] uppercase text-rl-dim mb-2.5">Topic</div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(TOPIC_LABELS).map(([key, label]) => (
                <Chip
                  key={key}
                  label={label}
                  active={topic === key}
                  onClick={() => setTopic(topic === key ? "all" : key)}
                />
              ))}
            </div>
          </div>

          <div className="mb-5">
            <div className="text-[11px] font-extrabold tracking-[0.1em] uppercase text-rl-dim mb-2.5">Skill level</div>
            <div className="flex flex-wrap gap-2">
              {(["beginner", "intermediate", "advanced"] as LevelType[]).map((lv) => (
                <Chip
                  key={lv}
                  label={lv.charAt(0).toUpperCase() + lv.slice(1)}
                  active={level === lv}
                  onClick={() => toggle(level, lv, setLevel, "all")}
                />
              ))}
            </div>
          </div>
        </aside>

        {/* Grid */}
        <div className="flex-1 min-w-[300px]">
          <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
            <span className="text-[14.5px] font-semibold text-rl-muted">
              <strong className="text-rl-forest">{filtered.length}</strong> courses
            </span>
            {activeSummary && (
              <span className="text-[13px] text-rl-dim">{activeSummary}</span>
            )}
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16 px-5 text-rl-dim">
              <div className="font-hand text-[26px] text-rl-sage mb-1.5">nothing here yet</div>
              <p className="text-[15px] mb-4">No courses match those filters.</p>
              <button
                onClick={clearAll}
                className="text-[14px] font-bold text-white bg-rl-forest border-none px-5 py-2.5 rounded-[10px] cursor-pointer hover:bg-[#1e3d24] transition-colors"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(248px,1fr))] gap-[18px]">
              {filtered.map((c) => {
                const audMeta = AUD_META[c.aud[0]];
                const lvlMeta = LVL_META[c.lvl];
                const accMeta = ACC_META[c.acc];
                const audLabel = c.aud.map((a) => AUD_META[a]?.label ?? a).join(" · ");
                return (
                  <Link
                    key={c.t}
                    href="/courses"
                    className="relative bg-white border border-rl-border rounded-[15px] overflow-hidden shadow-[0_12px_28px_-24px_rgba(42,82,48,0.3)] flex flex-col transition-all hover:-translate-y-[3px] hover:shadow-[0_18px_34px_-20px_rgba(42,82,48,0.25)]"
                  >
                    <div className="h-[5px]" style={{ background: audMeta?.color ?? "#2A5230" }} />
                    <div className="p-[18px] flex flex-col flex-1">
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span
                          className="text-[11px] font-extrabold tracking-[0.04em] px-[9px] py-1 rounded-[7px] whitespace-nowrap"
                          style={{ color: audMeta?.color, background: audMeta?.bg }}
                        >
                          {audLabel}
                        </span>
                        <span
                          className="text-[10.5px] font-extrabold tracking-[0.03em] px-[9px] py-1 rounded-[7px] whitespace-nowrap"
                          style={{ color: accMeta.color, background: accMeta.bg }}
                        >
                          {accMeta.label}
                        </span>
                      </div>
                      <h3 className="font-head font-bold text-[17.5px] leading-[1.25] mb-3 text-rl-forest flex-1">
                        {c.t}
                      </h3>
                      <div className="flex items-center gap-3 text-[12px] text-rl-dim font-semibold mb-3.5">
                        <span>{c.h}</span>
                        <span className="inline-flex items-center gap-[5px]">
                          <span
                            className="w-[7px] h-[7px] rounded-full"
                            style={{ background: lvlMeta.dot }}
                          />
                          {lvlMeta.label}
                        </span>
                      </div>
                      <span className="block text-center text-[13.5px] font-bold text-rl-forest border-[1.5px] border-rl-border py-2.5 rounded-[9px]">
                        {accMeta.cta}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
