"use client";

import { useState, useTransition, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

type LessonRow = { id: string; title: string; lesson_type: string; duration_mins: number | null; sort_order: number; status: string };
type ModuleRow = { id: string; title: string; description: string | null; sort_order: number; status: string; lessons: LessonRow[] };
type Category = { id: string; name: string };
type Tag = { id: string; name: string; slug: string; group: string; sort_order: number };

interface Props {
  course: Record<string, unknown>;
  modules: ModuleRow[];
  categories: Category[];
  allTags: Tag[];
  selectedTagIds: string[];
}

const LEVELS = ["beginner", "intermediate", "advanced"] as const;
const STATUSES = ["draft", "published", "archived"] as const;

const inputCls = "w-full px-3.5 py-2.5 rounded-xl border border-[#DDE8DA] bg-white text-[#2A5230] text-sm focus:outline-none focus:ring-2 focus:ring-[#2A5230] focus:border-transparent transition";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-wide text-[#7A9878] mb-1.5">
        {label}{hint && <span className="normal-case font-normal ml-1">— {hint}</span>}
      </label>
      {children}
    </div>
  );
}

function LessonTypeIcon({ type }: { type: string }) {
  if (type === "video") return (
    <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor">
      <path d="M2 3.5A1.5 1.5 0 0 1 3.5 2h9A1.5 1.5 0 0 1 14 3.5v9a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 12.5v-9ZM6 5.5v5l4.5-2.5L6 5.5Z" />
    </svg>
  );
  if (type === "quiz") return (
    <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="6" />
      <path d="M6 7.5a2 2 0 1 1 3.46 1L8 10" />
      <circle cx="8" cy="12" r=".6" fill="currentColor" stroke="none" />
    </svg>
  );
  if (type === "assignment") return (
    <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 2l3 3-7 7H4V9l7-7Z" />
    </svg>
  );
  return (
    <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <path d="M2 4h12M2 7h12M2 10h8" />
    </svg>
  );
}

export default function CourseEditor({ course, modules: initModules, categories, allTags, selectedTagIds: initTagIds }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [tab, setTab] = useState<"settings" | "curriculum" | "enrollments">(
    searchParams.get("tab") === "curriculum" ? "curriculum" :
    searchParams.get("tab") === "enrollments" ? "enrollments" : "settings"
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [modules, setModules] = useState<ModuleRow[]>(initModules);
  const [selectedTagIds, setSelectedTagIds] = useState<Set<string>>(new Set(initTagIds));

  // Course settings form state
  const [form, setForm] = useState({
    title: String(course.title ?? ""),
    slug: String(course.slug ?? ""),
    description: String(course.description ?? ""),
    level: String(course.level ?? "beginner") as typeof LEVELS[number],
    price_type: String(course.price_type ?? "free"),
    price_cents: Number(course.price_cents ?? 0),
    status: String(course.status ?? "draft") as typeof STATUSES[number],
    certificate_eligible: Boolean(course.certificate_eligible),
    category_id: String(course.category_id ?? ""),
    thumbnail_url: String(course.thumbnail_url ?? ""),
    preview_video_url: String(course.preview_video_url ?? ""),
    legal_disclaimer: String(course.legal_disclaimer ?? ""),
    outcomes: (course.outcomes as string[] | null) ?? [],
    requirements: (course.requirements as string[] | null) ?? [],
  });

  function set<K extends keyof typeof form>(key: K, val: typeof form[K]) {
    setForm((f) => ({ ...f, [key]: val }));
    setSuccess(false);
  }

  function setListField(key: "outcomes" | "requirements", raw: string) {
    set(key, raw.split("\n").map((l) => l.trim()).filter(Boolean));
  }

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const res = await fetch(`/api/admin/courses/${course.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, price_cents: form.price_type === "free" ? 0 : form.price_cents, tag_ids: [...selectedTagIds] }),
    });
    setSaving(false);
    if (!res.ok) {
      const d = await res.json();
      setError(d.error ?? "Save failed.");
    } else {
      setSuccess(true);
      startTransition(() => router.refresh());
    }
  }

  // Enrollment state
  type EnrollmentRow = {
    id: string; user_id: string; status: string; enrolled_at: string | null;
    source: string | null; full_name: string | null; email: string | null;
    role: string; completed_lessons: number;
  };
  const [enrollments, setEnrollments] = useState<EnrollmentRow[]>([]);
  const [enrollStatus, setEnrollStatus] = useState<"idle" | "loading" | "loaded" | "error">("idle");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [enrollError, setEnrollError] = useState<string | null>(null);
  const [enrollSuccess, setEnrollSuccess] = useState<string | null>(null);
  const [revoking, setRevoking] = useState<string | null>(null);

  const loadEnrollments = useCallback(async () => {
    setEnrollStatus("loading");
    try {
      const res = await fetch(`/api/admin/courses/${course.id}/enrollments`);
      if (res.ok) {
        const d = await res.json();
        setEnrollments(d.enrollments ?? []);
        setEnrollStatus("loaded");
      } else {
        setEnrollStatus("error");
      }
    } catch {
      setEnrollStatus("error");
    }
  }, [course.id]);

  useEffect(() => {
    if (tab === "enrollments" && enrollStatus === "idle") {
      loadEnrollments();
    }
  }, [tab, enrollStatus, loadEnrollments]);

  async function inviteLearner(e: React.FormEvent) {
    e.preventDefault();
    setEnrollError(null);
    setEnrollSuccess(null);
    const email = inviteEmail.trim().toLowerCase();
    if (!email) return;
    setInviting(true);
    const res = await fetch(`/api/admin/courses/${course.id}/enrollments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setInviting(false);
    if (!res.ok) {
      const d = await res.json();
      setEnrollError(d.error ?? "Failed to enroll.");
    } else {
      setInviteEmail("");
      setEnrollSuccess("Learner enrolled successfully.");
      setEnrollStatus("idle");
    }
  }

  async function revokeEnrollment(enrollmentId: string) {
    if (!confirm("Remove this learner from the course?")) return;
    setRevoking(enrollmentId);
    const res = await fetch(`/api/admin/enrollments/${enrollmentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "revoked" }),
    });
    setRevoking(null);
    if (res.ok) {
      setEnrollments((prev) => prev.map((e) => e.id === enrollmentId ? { ...e, status: "cancelled" } : e));
    }
  }

  // Module management
  const [newModTitle, setNewModTitle] = useState("");
  const [addingMod, setAddingMod] = useState(false);

  async function addModule() {
    if (!newModTitle.trim()) return;
    setAddingMod(true);
    const res = await fetch(`/api/admin/courses/${course.id}/modules`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newModTitle.trim(), sort_order: modules.length }),
    });
    setAddingMod(false);
    if (res.ok) {
      const data = await res.json();
      setModules((m) => [...m, { ...data, lessons: [] }]);
      setNewModTitle("");
    }
  }

  async function deleteModule(modId: string) {
    if (!confirm("Delete this module and all its lessons?")) return;
    await fetch(`/api/admin/modules/${modId}`, { method: "DELETE" });
    setModules((m) => m.filter((x) => x.id !== modId));
  }

  // Lesson management
  const [newLessonTitles, setNewLessonTitles] = useState<Record<string, string>>({});
  const [addingLesson, setAddingLesson] = useState<string | null>(null);

  async function addLesson(modId: string) {
    const title = newLessonTitles[modId]?.trim();
    if (!title) return;
    setAddingLesson(modId);
    const mod = modules.find((m) => m.id === modId)!;
    const res = await fetch(`/api/admin/modules/${modId}/lessons`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, sort_order: mod.lessons.length }),
    });
    setAddingLesson(null);
    if (res.ok) {
      const data = await res.json();
      setModules((mods) =>
        mods.map((m) => m.id === modId ? { ...m, lessons: [...m.lessons, data] } : m)
      );
      setNewLessonTitles((t) => ({ ...t, [modId]: "" }));
    }
  }

  async function deleteLesson(modId: string, lessonId: string) {
    if (!confirm("Delete this lesson?")) return;
    await fetch(`/api/admin/lessons/${lessonId}`, { method: "DELETE" });
    setModules((mods) =>
      mods.map((m) => m.id === modId
        ? { ...m, lessons: m.lessons.filter((l) => l.id !== lessonId) }
        : m
      )
    );
  }

  const statusColor: Record<string, string> = {
    published:  "text-green-700 bg-green-50 border-green-200",
    active:     "text-green-700 bg-green-50 border-green-200",
    draft:      "text-yellow-700 bg-yellow-50 border-yellow-200",
    archived:   "text-gray-600 bg-gray-50 border-gray-200",
    revoked:    "text-gray-500 bg-gray-50 border-gray-200",
    expired:    "text-gray-500 bg-gray-50 border-gray-200",
    completed:  "text-blue-700 bg-blue-50 border-blue-200",
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Top bar */}
      <div className="flex items-center justify-between px-8 py-4 bg-white border-b border-[#DDE8DA]">
        <div className="flex items-center gap-3">
          <Link href="/admin/courses" className="text-[#7A9878] hover:text-[#2A5230] transition-colors text-sm">
            ← Courses
          </Link>
          <span className="text-[#DDE8DA]">/</span>
          <h1 className="font-head font-bold text-base text-[#2A5230] truncate max-w-[360px]">
            {form.title || "Untitled Course"}
          </h1>
          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border capitalize ${statusColor[form.status] ?? statusColor.draft}`}>
            {form.status}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {form.status === "published" && (
            <Link
              href={`/courses/${form.slug}`}
              target="_blank"
              className="text-xs font-bold text-[#4A6650] border border-[#DDE8DA] px-3 py-1.5 rounded-lg hover:border-[#2A5230] transition-colors"
            >
              Preview ↗
            </Link>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#DDE8DA] bg-white px-8">
        {(["settings", "curriculum", "enrollments"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={[
              "px-4 py-3 text-sm font-semibold capitalize border-b-2 -mb-px transition-colors",
              tab === t
                ? "text-[#2A5230] border-[#2A5230]"
                : "text-[#7A9878] border-transparent hover:text-[#2A5230]",
            ].join(" ")}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8">

        {/* ── SETTINGS TAB ── */}
        {tab === "settings" && (
          <form onSubmit={saveSettings} className="max-w-2xl space-y-6">
            {error && <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>}
            {success && <div className="px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 flex items-center gap-2"><svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 8l4 4 7-7"/></svg>Saved</div>}

            <div className="grid grid-cols-2 gap-4">
              <Field label="Status">
                <select value={form.status} onChange={(e) => set("status", e.target.value as typeof STATUSES[number])} className={inputCls}>
                  {STATUSES.map((s) => <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
              </Field>
              <Field label="Level">
                <select value={form.level} onChange={(e) => set("level", e.target.value as typeof LEVELS[number])} className={inputCls}>
                  {LEVELS.map((l) => <option key={l} value={l} className="capitalize">{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
                </select>
              </Field>
            </div>

            <Field label="Title">
              <input required value={form.title} onChange={(e) => set("title", e.target.value)} className={inputCls} />
            </Field>

            <Field label="Slug" hint="URL identifier">
              <input required pattern="[a-z0-9-]+" value={form.slug} onChange={(e) => set("slug", e.target.value)} className={inputCls} />
            </Field>

            <Field label="Description">
              <textarea rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} className={inputCls} />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Price type">
                <select value={form.price_type} onChange={(e) => set("price_type", e.target.value)} className={inputCls}>
                  <option value="free">Free</option>
                  <option value="paid">Paid</option>
                </select>
              </Field>
              {form.price_type === "paid" && (
                <Field label="Price (cents)" hint="e.g. 4900 = $49">
                  <input
                    type="number" min={0}
                    value={form.price_cents}
                    onChange={(e) => set("price_cents", Number(e.target.value))}
                    className={inputCls}
                  />
                </Field>
              )}
            </div>

            {categories.length > 0 && (
              <Field label="Category">
                <select value={form.category_id} onChange={(e) => set("category_id", e.target.value)} className={inputCls}>
                  <option value="">— none —</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </Field>
            )}

            {allTags.length > 0 && (() => {
              const groups = [...new Map(allTags.map((t) => [t.group, t.group])).keys()];
              return (
                <div className="space-y-3">
                  <label className="block text-xs font-bold uppercase tracking-wide text-[#7A9878] mb-1.5">
                    Tags <span className="normal-case font-normal">— select all that apply</span>
                  </label>
                  {groups.map((group) => (
                    <div key={group}>
                      <div className="text-[10px] font-extrabold uppercase tracking-widest text-[#9AB89E] mb-1.5 capitalize">{group}</div>
                      <div className="flex flex-wrap gap-2">
                        {allTags.filter((t) => t.group === group).map((tag) => {
                          const active = selectedTagIds.has(tag.id);
                          return (
                            <button
                              key={tag.id}
                              type="button"
                              onClick={() => {
                                setSelectedTagIds((prev) => {
                                  const next = new Set(prev);
                                  if (next.has(tag.id)) next.delete(tag.id);
                                  else next.add(tag.id);
                                  return next;
                                });
                                setSuccess(false);
                              }}
                              className={[
                                "text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all",
                                active
                                  ? "bg-[#2A5230] text-white border-[#2A5230]"
                                  : "bg-white text-[#2A5230] border-[#DDE8DA] hover:border-[#2A5230]",
                              ].join(" ")}
                            >
                              {tag.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}

            <Field label="Thumbnail URL">
              <input value={form.thumbnail_url} onChange={(e) => set("thumbnail_url", e.target.value)} className={inputCls} placeholder="https://..." />
            </Field>

            <Field label="Preview video URL">
              <input value={form.preview_video_url} onChange={(e) => set("preview_video_url", e.target.value)} className={inputCls} placeholder="https://youtube.com/..." />
            </Field>

            <Field label="What you'll learn" hint="one per line">
              <textarea
                rows={4}
                value={form.outcomes.join("\n")}
                onChange={(e) => setListField("outcomes", e.target.value)}
                className={inputCls}
                placeholder={"How to organize a client inbox\nHow to create SOPs"}
              />
            </Field>

            <Field label="Requirements" hint="one per line">
              <textarea
                rows={3}
                value={form.requirements.join("\n")}
                onChange={(e) => setListField("requirements", e.target.value)}
                className={inputCls}
                placeholder="No prior experience needed"
              />
            </Field>

            <Field label="Legal disclaimer">
              <textarea rows={2} value={form.legal_disclaimer} onChange={(e) => set("legal_disclaimer", e.target.value)} className={inputCls} />
            </Field>

            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.certificate_eligible} onChange={(e) => set("certificate_eligible", e.target.checked)} className="w-4 h-4 rounded accent-[#2A5230]" />
              <span className="text-sm font-medium text-[#2A5230]">Certificate eligible</span>
            </label>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-[#2A5230] text-white font-bold text-sm rounded-xl hover:bg-[#1e3d24] disabled:opacity-50 transition-colors"
            >
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </form>
        )}

        {/* ── ENROLLMENTS TAB ── */}
        {tab === "enrollments" && (() => {
          const totalLessons = modules.reduce((s, m) => s + m.lessons.length, 0);
          const active = enrollments.filter((e) => e.status === "active");
          const completed = enrollments.filter((e) => e.status === "completed");
          const avgPct = active.length > 0 && totalLessons > 0
            ? Math.round(active.reduce((s, e) => s + e.completed_lessons, 0) / active.length / totalLessons * 100)
            : 0;
          const groupCount = enrollments.filter((e) => e.role === "group_learner" || e.role === "group_admin").length;
          const adminCount = enrollments.filter((e) => e.source === "admin").length;

          return (
            <div className="flex flex-col lg:flex-row gap-6 lg:items-start">

              {/* ── Left: form + table ── */}
              <div className="flex-1 min-w-0 order-2 lg:order-1">
                {/* Invite form */}
                <div className="bg-white border border-[#DDE8DA] rounded-2xl p-5 mb-5">
                  <p className="text-xs font-bold uppercase tracking-wide text-[#7A9878] mb-3">Enroll a Learner</p>
                  {enrollError && <div className="mb-3 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">{enrollError}</div>}
                  {enrollSuccess && <div className="mb-3 px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-xs text-green-700">{enrollSuccess}</div>}
                  <form onSubmit={inviteLearner} className="flex gap-2 items-center">
                    <input
                      type="email"
                      required
                      value={inviteEmail}
                      onChange={(e) => { setInviteEmail(e.target.value); setEnrollError(null); setEnrollSuccess(null); }}
                      placeholder="learner@example.com"
                      className={inputCls + " flex-1"}
                    />
                    <button
                      type="submit"
                      disabled={inviting}
                      className="px-5 py-2.5 bg-[#2A5230] text-white text-sm font-bold rounded-xl hover:bg-[#1e3d24] disabled:opacity-50 transition-colors whitespace-nowrap"
                    >
                      {inviting ? "Enrolling…" : "+ Enroll"}
                    </button>
                  </form>
                  <p className="text-xs mt-2 text-[#9AB89E]">User must already be registered. Enrollment will be marked as source: admin.</p>
                </div>

                {/* Enrollment table */}
                <div className="bg-white border border-[#DDE8DA] rounded-2xl overflow-x-auto">
                  <div className="flex items-center justify-between px-5 py-3 bg-[#FAFCFA] border-b border-[#F0F7F0]">
                    <span className="text-xs font-bold uppercase tracking-wide text-[#7A9878]">
                      {enrollStatus === "loaded"
                        ? `${active.length} active · ${enrollments.length} total`
                        : "Enrolled Learners"}
                    </span>
                    <button
                      onClick={() => setEnrollStatus("idle")}
                      disabled={enrollStatus === "loading"}
                      className="text-xs text-[#7A9878] hover:text-[#2A5230] transition-colors disabled:opacity-40"
                    >
                      {enrollStatus === "loading" ? "Loading…" : "↻ Refresh"}
                    </button>
                  </div>

                  {enrollStatus === "loading" ? (
                    <div className="px-5 py-12 text-center text-sm text-[#9AB89E]">Loading…</div>
                  ) : enrollStatus === "error" ? (
                    <div className="px-5 py-12 text-center text-sm text-red-400">
                      Failed to load enrollments.{" "}
                      <button onClick={() => setEnrollStatus("idle")} className="underline">Retry</button>
                    </div>
                  ) : enrollments.length === 0 ? (
                    <div className="px-5 py-12 text-center text-sm text-[#9AB89E]">No enrollments yet</div>
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[#F0F7F0]">
                          <th className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wide text-[#7A9878]">Name</th>
                          <th className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wide text-[#7A9878]">Email</th>
                          <th className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wide text-[#7A9878]">Account</th>
                          <th className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wide text-[#7A9878]">Progress</th>
                          <th className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wide text-[#7A9878]">Status</th>
                          <th className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wide text-[#7A9878]">Enrolled</th>
                          <th className="px-5 py-3" />
                        </tr>
                      </thead>
                      <tbody>
                        {enrollments.map((e) => {
                          const pct = totalLessons > 0 ? Math.round((e.completed_lessons / totalLessons) * 100) : 0;
                          const isGroup = e.role === "group_learner" || e.role === "group_admin";
                          return (
                            <tr key={e.id} className="border-b border-[#F5FAF5] hover:bg-[#FAFCFA] transition-colors last:border-0">
                              <td className="px-5 py-3 font-medium text-[#1A2E1C] whitespace-nowrap">
                                {e.full_name ?? <span className="text-[#9AB89E]">—</span>}
                              </td>
                              <td className="px-5 py-3 text-xs text-[#4A6650]">
                                {e.email ?? <span className="text-[#9AB89E]">—</span>}
                              </td>
                              <td className="px-5 py-3">
                                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${isGroup ? "bg-blue-50 text-blue-700" : "bg-[#EEF5EE] text-[#2A5230]"}`}>
                                  {isGroup ? "Group" : "Individual"}
                                </span>
                              </td>
                              <td className="px-5 py-3 min-w-[130px]">
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 h-1.5 bg-[#EEF5EE] rounded-full overflow-hidden">
                                    <div className="h-full bg-[#2A5230] rounded-full transition-all" style={{ width: `${pct}%` }} />
                                  </div>
                                  <span className="text-xs font-semibold text-[#4A6650] shrink-0 w-8 text-right">{pct}%</span>
                                </div>
                                <div className="text-[10px] text-[#9AB89E] mt-0.5">{e.completed_lessons}/{totalLessons} lessons</div>
                              </td>
                              <td className="px-5 py-3">
                                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border capitalize ${statusColor[e.status] ?? statusColor.draft}`}>
                                  {e.status}
                                </span>
                              </td>
                              <td className="px-5 py-3 text-xs text-[#9AB89E] whitespace-nowrap">
                                {e.enrolled_at ? new Date(e.enrolled_at).toLocaleDateString() : "—"}
                                {e.source && <div className="text-[10px] text-[#C8DEC8] mt-0.5 capitalize">{e.source}</div>}
                              </td>
                              <td className="px-5 py-3">
                                {e.status === "active" && (
                                  <button
                                    onClick={() => revokeEnrollment(e.id)}
                                    disabled={revoking === e.id}
                                    className="text-xs font-bold px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50 transition-colors"
                                  >
                                    {revoking === e.id ? "…" : "Remove"}
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              {/* ── Right: Insights panel ── */}
              <div className="w-full lg:w-64 lg:shrink-0 space-y-4 order-1 lg:order-2">
                <div className="bg-white border border-[#DDE8DA] rounded-2xl p-5">
                  <p className="text-xs font-bold uppercase tracking-wide text-[#7A9878] mb-4">Enrollment Insights</p>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between lg:block">
                      <div className="text-3xl font-head font-bold text-[#2A5230]">{enrollments.length}</div>
                      <div className="text-xs text-[#9AB89E] lg:mt-0.5">Total enrolled</div>
                    </div>
                    <div className="h-px bg-[#F0F7F0]" />
                    <div className="grid grid-cols-4 lg:grid-cols-2 gap-3">
                      <div>
                        <div className="text-xl font-bold text-[#2A5230]">{active.length}</div>
                        <div className="text-[10px] text-[#9AB89E] mt-0.5 uppercase tracking-wide">Active</div>
                      </div>
                      <div>
                        <div className="text-xl font-bold text-[#2A5230]">{completed.length}</div>
                        <div className="text-[10px] text-[#9AB89E] mt-0.5 uppercase tracking-wide">Completed</div>
                      </div>
                    </div>
                    <div className="h-px bg-[#F0F7F0]" />
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] uppercase tracking-wide font-bold text-[#9AB89E]">Avg Progress</span>
                        <span className="text-sm font-bold text-[#2A5230]">{avgPct}%</span>
                      </div>
                      <div className="h-2 bg-[#EEF5EE] rounded-full overflow-hidden">
                        <div className="h-full bg-[#2A5230] rounded-full transition-all" style={{ width: `${avgPct}%` }} />
                      </div>
                    </div>
                    <div className="h-px bg-[#F0F7F0]" />
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-[#7A9878]">Individual</span>
                        <span className="text-xs font-bold text-[#2A5230]">{enrollments.length - groupCount}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-[#7A9878]">Group</span>
                        <span className="text-xs font-bold text-blue-600">{groupCount}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-[#7A9878]">Admin-added</span>
                        <span className="text-xs font-bold text-[#2A5230]">{adminCount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          );
        })()}

        {/* ── CURRICULUM TAB ── */}
        {tab === "curriculum" && (
          <div className="max-w-2xl space-y-4">
            {modules.map((mod, mi) => (
              <div key={mod.id} className="bg-white border border-[#DDE8DA] rounded-2xl overflow-hidden">
                {/* Module header */}
                <div className="flex items-center justify-between px-5 py-4 bg-[#F5F0E8] border-b border-[#DDE8DA]">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-extrabold text-[#7A9878] w-6 text-center">{mi + 1}</span>
                    <span className="font-head font-bold text-[#2A5230] text-sm">{mod.title}</span>
                    <span className="text-xs text-[#7A9878]">{mod.lessons.length} lessons</span>
                  </div>
                  <button
                    onClick={() => deleteModule(mod.id)}
                    className="text-xs text-red-400 hover:text-red-600 transition-colors"
                  >
                    Delete
                  </button>
                </div>

                {/* Lessons */}
                <div className="divide-y divide-[#F0F7F0]">
                  {[...mod.lessons].sort((a, b) => a.sort_order - b.sort_order).map((lesson) => (
                    <div key={lesson.id} className="flex items-center gap-3 px-5 py-3 group">
                      <span className="text-[#7A9878] text-xs shrink-0">
                        <LessonTypeIcon type={lesson.lesson_type} />
                      </span>
                      <span className="flex-1 text-sm text-[#2A5230]">{lesson.title}</span>
                      {lesson.duration_mins && (
                        <span className="text-xs text-[#A0B8A0] shrink-0">{lesson.duration_mins}m</span>
                      )}
                      <span className={`text-xs px-2 py-0.5 rounded-full border capitalize shrink-0 ${statusColor[lesson.status] ?? statusColor.draft}`}>
                        {lesson.status}
                      </span>
                      <Link
                        href={`/admin/courses/${course.id}/lessons/${lesson.id}`}
                        className="text-xs font-bold text-[#2A5230] opacity-0 group-hover:opacity-100 transition-opacity hover:underline shrink-0"
                      >
                        Edit →
                      </Link>
                      <button
                        onClick={() => deleteLesson(mod.id, lesson.id)}
                        className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all shrink-0"
                      >
                        <svg viewBox="0 0 16 16" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                          <path d="M3 3l10 10M13 3L3 13" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add lesson */}
                <div className="px-5 py-3 bg-[#FAFCFA] border-t border-[#F0F7F0] flex gap-2">
                  <input
                    value={newLessonTitles[mod.id] ?? ""}
                    onChange={(e) => setNewLessonTitles((t) => ({ ...t, [mod.id]: e.target.value }))}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addLesson(mod.id); } }}
                    placeholder="New lesson title…"
                    className="flex-1 text-sm px-3 py-2 rounded-lg border border-[#DDE8DA] bg-white text-[#2A5230] focus:outline-none focus:ring-1 focus:ring-[#2A5230] transition"
                  />
                  <button
                    onClick={() => addLesson(mod.id)}
                    disabled={addingLesson === mod.id}
                    className="px-4 py-2 bg-[#2A5230] text-white text-xs font-bold rounded-lg hover:bg-[#1e3d24] disabled:opacity-50 transition-colors"
                  >
                    {addingLesson === mod.id ? "…" : "+ Add"}
                  </button>
                </div>
              </div>
            ))}

            {/* Add module */}
            <div className="bg-white border border-dashed border-[#B8D4B5] rounded-2xl p-5">
              <p className="text-xs font-bold text-[#7A9878] uppercase tracking-wide mb-3">Add Module</p>
              <div className="flex gap-2">
                <input
                  value={newModTitle}
                  onChange={(e) => setNewModTitle(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addModule(); } }}
                  placeholder="Module title…"
                  className="flex-1 text-sm px-3.5 py-2.5 rounded-xl border border-[#DDE8DA] bg-white text-[#2A5230] focus:outline-none focus:ring-2 focus:ring-[#2A5230] transition"
                />
                <button
                  onClick={addModule}
                  disabled={addingMod}
                  className="px-5 py-2.5 bg-[#2A5230] text-white text-sm font-bold rounded-xl hover:bg-[#1e3d24] disabled:opacity-50 transition-colors"
                >
                  {addingMod ? "…" : "+ Module"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
