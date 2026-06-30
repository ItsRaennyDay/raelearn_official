"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

export type CourseWithTags = {
  id: string;
  title: string;
  slug: string;
  level: string;
  price_type: string;
  certificate_eligible: boolean;
  tags: { id: string; name: string; slug: string; group: string }[];
};

export type TagGroup = {
  group: string;
  label: string;
  tags: { id: string; name: string; slug: string }[];
};

const ACC_META: Record<string, { label: string; color: string; bg: string; cta: string }> = {
  free:        { label: "FREE",        color: "#2D8BFF", bg: "#E4F0FF", cta: "Enroll Free" },
  paid:        { label: "PAID",        color: "#4A6650", bg: "#DDE8DA", cta: "View Course" },
  certificate: { label: "CERTIFICATE", color: "#9c6c12", bg: "#FFF3DC", cta: "View Course" },
};

const LVL_META: Record<string, { label: string; dot: string }> = {
  beginner:     { label: "Beginner",     dot: "#3E9A52" },
  intermediate: { label: "Intermediate", dot: "#2A5230" },
  advanced:     { label: "Advanced",     dot: "#C48A3A" },
};

const GROUP_LABELS: Record<string, string> = {
  audience: "Audience",
  topic:    "Topic",
};

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
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

export default function CoursesClient({
  courses,
  tagGroups,
}: {
  courses: CourseWithTags[];
  tagGroups: TagGroup[];
}) {
  const [access, setAccess]   = useState<string>("all");
  const [level, setLevel]     = useState<string>("all");
  const [tagFilters, setTagFilters] = useState<Record<string, string>>({});
  const [q, setQ]             = useState("");

  function toggleTag(group: string, slug: string) {
    setTagFilters((prev) => ({
      ...prev,
      [group]: prev[group] === slug ? "" : slug,
    }));
  }

  const clearAll = () => {
    setAccess("all");
    setLevel("all");
    setTagFilters({});
    setQ("");
  };

  const filtered = useMemo(() => {
    const qLower = q.trim().toLowerCase();
    return courses.filter((c) => {
      // Access filter
      if (access !== "all") {
        if (access === "certificate" && !c.certificate_eligible) return false;
        if (access === "free" && c.price_type !== "free") return false;
        if (access === "paid" && (c.price_type !== "paid" || c.certificate_eligible)) return false;
      }
      // Level filter
      if (level !== "all" && c.level !== level) return false;
      // Tag filters (one active per group)
      for (const [group, slug] of Object.entries(tagFilters)) {
        if (!slug) continue;
        if (!c.tags.some((t) => t.group === group && t.slug === slug)) return false;
      }
      // Search
      if (qLower) {
        const tagNames = c.tags.map((t) => t.name).join(" ");
        return (
          c.title.toLowerCase().includes(qLower) ||
          tagNames.toLowerCase().includes(qLower)
        );
      }
      return true;
    });
  }, [courses, access, level, tagFilters, q]);

  const hasActiveFilters =
    access !== "all" ||
    level !== "all" ||
    Object.values(tagFilters).some(Boolean) ||
    q.trim() !== "";

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
            {hasActiveFilters && (
              <button
                onClick={clearAll}
                className="text-[12.5px] font-bold text-rl-dim hover:text-rl-forest bg-none border-none cursor-pointer transition-colors"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Access — always shown, derived from price_type/certificate_eligible */}
          <div className="mb-5">
            <div className="text-[11px] font-extrabold tracking-[0.1em] uppercase text-rl-dim mb-2.5">Access</div>
            <div className="flex flex-wrap gap-2">
              {[
                { value: "free", label: "Free" },
                { value: "paid", label: "Paid" },
                { value: "certificate", label: "Certificate" },
              ].map((item) => (
                <Chip
                  key={item.value}
                  label={item.label}
                  active={access === item.value}
                  onClick={() => setAccess(access === item.value ? "all" : item.value)}
                />
              ))}
            </div>
          </div>

          {/* Dynamic tag groups (audience, topic, etc.) */}
          {tagGroups.map((group) => (
            <div key={group.group} className="mb-5">
              <div className="text-[11px] font-extrabold tracking-[0.1em] uppercase text-rl-dim mb-2.5">
                {GROUP_LABELS[group.group] ?? group.label}
              </div>
              <div className="flex flex-wrap gap-2">
                {group.tags.map((tag) => (
                  <Chip
                    key={tag.id}
                    label={tag.name}
                    active={tagFilters[group.group] === tag.slug}
                    onClick={() => toggleTag(group.group, tag.slug)}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* Skill Level — always shown, derived from level column */}
          <div className="mb-5">
            <div className="text-[11px] font-extrabold tracking-[0.1em] uppercase text-rl-dim mb-2.5">Skill Level</div>
            <div className="flex flex-wrap gap-2">
              {["beginner", "intermediate", "advanced"].map((lv) => (
                <Chip
                  key={lv}
                  label={lv.charAt(0).toUpperCase() + lv.slice(1)}
                  active={level === lv}
                  onClick={() => setLevel(level === lv ? "all" : lv)}
                />
              ))}
            </div>
          </div>
        </aside>

        {/* Course grid */}
        <div className="flex-1 min-w-[300px]">
          <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
            <span className="text-[14.5px] font-semibold text-rl-muted">
              <strong className="text-rl-forest">{filtered.length}</strong> course{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>

          {courses.length === 0 ? (
            <div className="text-center py-16 px-5 text-rl-dim">
              <div className="font-hand text-[26px] text-rl-sage mb-1.5">no courses yet</div>
              <p className="text-[15px]">Check back soon — courses are being added.</p>
            </div>
          ) : filtered.length === 0 ? (
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
              {filtered.map((course) => {
                const lvlMeta = LVL_META[course.level] ?? LVL_META.beginner;
                const accKey = course.certificate_eligible ? "certificate" : course.price_type;
                const accMeta = ACC_META[accKey] ?? ACC_META.free;
                const audienceTags = course.tags.filter((t) => t.group === "audience");
                const audienceLabel = audienceTags.length > 0
                  ? audienceTags.map((t) => t.name).join(" · ")
                  : null;

                return (
                  <Link
                    key={course.id}
                    href={`/courses/${course.slug}`}
                    className="relative bg-white border border-rl-border rounded-[15px] overflow-hidden shadow-[0_12px_28px_-24px_rgba(42,82,48,0.3)] flex flex-col transition-all hover:-translate-y-[3px] hover:shadow-[0_18px_34px_-20px_rgba(42,82,48,0.25)]"
                  >
                    <div className="h-[5px]" style={{ background: "#2A5230" }} />
                    <div className="p-[18px] flex flex-col flex-1">
                      <div className="flex items-center justify-between gap-2 mb-3">
                        {audienceLabel ? (
                          <span className="text-[11px] font-extrabold tracking-[0.04em] px-[9px] py-1 rounded-[7px] whitespace-nowrap" style={{ color: "#2A5230", background: "#DDE8DA" }}>
                            {audienceLabel}
                          </span>
                        ) : <span />}
                        <span
                          className="text-[10.5px] font-extrabold tracking-[0.03em] px-[9px] py-1 rounded-[7px] whitespace-nowrap"
                          style={{ color: accMeta.color, background: accMeta.bg }}
                        >
                          {accMeta.label}
                        </span>
                      </div>
                      <h3 className="font-head font-bold text-[17.5px] leading-[1.25] mb-3 text-rl-forest flex-1">
                        {course.title}
                      </h3>
                      <div className="flex items-center gap-3 text-[12px] text-rl-dim font-semibold mb-3.5">
                        <span className="inline-flex items-center gap-[5px]">
                          <span className="w-[7px] h-[7px] rounded-full" style={{ background: lvlMeta.dot }} />
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
