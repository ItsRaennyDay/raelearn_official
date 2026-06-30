"use client";

import { useState } from "react";

type CourseRow = { id: string; title: string; slug: string; level: string; price_type: string; certificate_eligible: boolean };
type BundleRow = { id: string; title: string; slug: string; description: string | null; audience: string; is_published: boolean; sort_order: number; created_at: string };

const AUDIENCE_OPTIONS = [
  { value: "va",        label: "Virtual Assistants (VA)" },
  { value: "nonprofit", label: "Nonprofits" },
  { value: "business",  label: "Business" },
  { value: "founder",   label: "Founders" },
  { value: "general",   label: "General / All" },
];

const LEVEL_COLOR: Record<string, string> = {
  beginner:     "#3E9A52",
  intermediate: "#2A5230",
  advanced:     "#C48A3A",
};

export default function BundleManager({
  bundles,
  coursesByBundle,
  allCourses,
  createBundle,
  deleteBundle,
  togglePublish,
  addCourseToBundle,
  removeCourseFromBundle,
}: {
  bundles: BundleRow[];
  coursesByBundle: Record<string, { course_id: string; sort_order: number; course: CourseRow }[]>;
  allCourses: (CourseRow & { status: string })[];
  createBundle: (fd: FormData) => Promise<void>;
  deleteBundle: (fd: FormData) => Promise<void>;
  togglePublish: (fd: FormData) => Promise<void>;
  addCourseToBundle: (fd: FormData) => Promise<void>;
  removeCourseFromBundle: (fd: FormData) => Promise<void>;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const audienceGroups = AUDIENCE_OPTIONS.map((opt) => ({
    ...opt,
    bundles: bundles.filter((b) => b.audience === opt.value),
  })).filter((g) => g.bundles.length > 0);

  const ungrouped = bundles.filter(
    (b) => !AUDIENCE_OPTIONS.some((o) => o.value === b.audience)
  );

  function renderBundle(bundle: BundleRow) {
    const courses = coursesByBundle[bundle.id] ?? [];
    const isOpen  = expanded === bundle.id;
    const alreadyInBundle = new Set(courses.map((c) => c.course_id));
    const available = allCourses.filter((c) => !alreadyInBundle.has(c.id));

    return (
      <div
        key={bundle.id}
        className="rounded-xl overflow-hidden"
        style={{ border: "1.5px solid #E8EDE6", background: "#fff" }}
      >
        {/* Bundle header row */}
        <div className="flex items-center gap-3 px-5 py-3.5">
          <button
            type="button"
            onClick={() => setExpanded(isOpen ? null : bundle.id)}
            className="flex-1 flex items-center gap-3 text-left min-w-0"
          >
            <svg
              viewBox="0 0 16 16" width="14" height="14" fill="none"
              stroke="#7A9878" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              className="shrink-0 transition-transform"
              style={{ transform: isOpen ? "rotate(90deg)" : "rotate(0deg)" }}
            >
              <path d="M6 4l4 4-4 4" />
            </svg>
            <div className="min-w-0">
              <div className="font-semibold text-sm truncate" style={{ color: "#1A2E1C" }}>{bundle.title}</div>
              {bundle.description && (
                <div className="text-xs truncate mt-0.5" style={{ color: "#9AB89E" }}>{bundle.description}</div>
              )}
            </div>
            <span className="text-xs shrink-0" style={{ color: "#9AB89E" }}>{courses.length} course{courses.length !== 1 ? "s" : ""}</span>
          </button>

          {/* Published toggle */}
          <form action={togglePublish} className="shrink-0">
            <input type="hidden" name="id" value={bundle.id} />
            <input type="hidden" name="current" value={String(bundle.is_published)} />
            <button
              type="submit"
              className="text-xs font-bold px-2.5 py-1 rounded-full"
              style={{
                background: bundle.is_published ? "#EEF5EE" : "#F3F3F3",
                color: bundle.is_published ? "#2A5230" : "#999",
              }}
            >
              {bundle.is_published ? "Published" : "Draft"}
            </button>
          </form>

          {/* Delete */}
          <form
            action={deleteBundle}
            onSubmit={(e) => {
              if (!confirm(`Delete "${bundle.title}"?`)) e.preventDefault();
            }}
            className="shrink-0"
          >
            <input type="hidden" name="id" value={bundle.id} />
            <button
              type="submit"
              className="text-xs font-bold px-2.5 py-1 rounded-lg"
              style={{ color: "#AA2222", background: "#FFF0F0" }}
            >
              Delete
            </button>
          </form>
        </div>

        {/* Expanded: course list + add course */}
        {isOpen && (
          <div style={{ borderTop: "1px solid #F0F7F0" }}>
            {courses.length === 0 ? (
              <div className="px-5 py-3 text-xs" style={{ color: "#9AB89E" }}>No courses added yet.</div>
            ) : (
              <div>
                {courses.map(({ course_id, course }) => (
                  <div
                    key={course_id}
                    className="flex items-center gap-3 px-5 py-2.5"
                    style={{ borderBottom: "1px solid #F5FAF5" }}
                  >
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium truncate block" style={{ color: "#1A2E1C" }}>{course.title}</span>
                      <span className="text-xs" style={{ color: LEVEL_COLOR[course.level] ?? "#9AB89E" }}>
                        {course.level}
                        {course.certificate_eligible && " · Certificate"}
                        {course.price_type === "free" ? " · Free" : " · Paid"}
                      </span>
                    </div>
                    <form action={removeCourseFromBundle} className="shrink-0">
                      <input type="hidden" name="bundle_id" value={bundle.id} />
                      <input type="hidden" name="course_id" value={course_id} />
                      <button type="submit" className="text-xs" style={{ color: "#AA2222" }}>Remove</button>
                    </form>
                  </div>
                ))}
              </div>
            )}

            {/* Add course dropdown */}
            {available.length > 0 && (
              <form action={addCourseToBundle} className="flex gap-2 px-5 py-3" style={{ background: "#FAFCFA" }}>
                <input type="hidden" name="bundle_id" value={bundle.id} />
                <select
                  name="course_id"
                  required
                  className="flex-1 text-sm px-3 py-2 rounded-lg border focus:outline-none focus:ring-1 focus:ring-[#2A5230] bg-white"
                  style={{ borderColor: "#DDE8DA", color: "#1A2E1C" }}
                  defaultValue=""
                >
                  <option value="" disabled>Add a course…</option>
                  {available.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} ({c.price_type === "free" ? "Free" : "Paid"}{c.certificate_eligible ? " · Cert" : ""})
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="text-xs font-bold px-4 py-2 rounded-lg shrink-0"
                  style={{ background: "#2A5230", color: "#fff" }}
                >
                  + Add
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-3xl p-8">
      <div className="mb-6">
        <h1 className="font-extrabold text-2xl" style={{ fontFamily: "var(--font-head)", color: "#1A2E1C" }}>Bundles</h1>
        <p className="text-sm mt-0.5" style={{ color: "#7A9878" }}>
          Group courses into learning tracks displayed on audience pages (For VAs, etc.)
        </p>
      </div>

      {/* Create bundle form */}
      <form
        action={createBundle}
        className="rounded-xl p-5 mb-8 space-y-3"
        style={{ background: "#fff", border: "1.5px solid #E8EDE6" }}
      >
        <h2 className="text-sm font-bold" style={{ color: "#1A2E1C" }}>New Bundle</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide mb-1" style={{ color: "#9AB89E" }}>Title</label>
            <input
              name="title"
              required
              placeholder="e.g. General VA Foundations"
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-2"
              style={{ borderColor: "#DDE8DA", color: "#1A2E1C" }}
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide mb-1" style={{ color: "#9AB89E" }}>Audience</label>
            <select
              name="audience"
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-2 bg-white"
              style={{ borderColor: "#DDE8DA", color: "#1A2E1C" }}
            >
              {AUDIENCE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide mb-1" style={{ color: "#9AB89E" }}>Description</label>
          <input
            name="description"
            placeholder="Short description shown on the page"
            className="w-full text-sm px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-2"
            style={{ borderColor: "#DDE8DA", color: "#1A2E1C" }}
          />
        </div>
        <button
          type="submit"
          className="text-sm font-bold px-5 py-2.5 rounded-xl"
          style={{ background: "#2A5230", color: "#fff" }}
        >
          Create Bundle
        </button>
      </form>

      {/* Bundle list grouped by audience */}
      {bundles.length === 0 ? (
        <div className="rounded-xl p-10 text-center" style={{ background: "#fff", border: "1.5px dashed #C8DEC8" }}>
          <p className="text-sm" style={{ color: "#9AB89E" }}>No bundles yet. Create one above.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {audienceGroups.map((group) => (
            <section key={group.value}>
              <h2 className="text-xs font-extrabold uppercase tracking-widest mb-3" style={{ color: "#9AB89E" }}>
                {group.label}
              </h2>
              <div className="space-y-2">
                {group.bundles.map(renderBundle)}
              </div>
            </section>
          ))}
          {ungrouped.length > 0 && (
            <section>
              <h2 className="text-xs font-extrabold uppercase tracking-widest mb-3" style={{ color: "#9AB89E" }}>Other</h2>
              <div className="space-y-2">{ungrouped.map(renderBundle)}</div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
