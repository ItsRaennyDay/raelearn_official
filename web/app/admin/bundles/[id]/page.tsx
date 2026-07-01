import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL ?? "rae2xyz@gmail.com").toLowerCase();

async function verifyAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.email?.toLowerCase() !== ADMIN_EMAIL) redirect("/admin");
  return user;
}

const AUDIENCE_OPTIONS = [
  { value: "va",        label: "Virtual Assistants (VA)" },
  { value: "nonprofit", label: "Nonprofits" },
  { value: "business",  label: "Business" },
  { value: "founder",   label: "Founders" },
  { value: "general",   label: "General / All" },
];

export default async function BundleEditPage({ params }: { params: Promise<{ id: string }> }) {
  await verifyAdmin();
  const { id } = await params;
  const db = createAdminClient();

  const { data: bundle } = await db
    .from("bundles")
    .select("id, title, slug, description, audience, is_published, sort_order")
    .eq("id", id)
    .single();

  if (!bundle) notFound();

  const { data: bundleCourseRows } = await db
    .from("bundle_courses")
    .select("course_id, sort_order, courses(id, title, slug, level, price_type, certificate_eligible)")
    .eq("bundle_id", id)
    .order("sort_order");

  const { data: allCourses } = await db
    .from("courses")
    .select("id, title, slug, level, price_type, certificate_eligible, status")
    .order("title");

  type CourseRow = { id: string; title: string; slug: string; level: string; price_type: string; certificate_eligible: boolean; status: string };
  const bundleCourses = (bundleCourseRows ?? []).map((r) => ({
    course_id: r.course_id,
    sort_order: r.sort_order,
    course: r.courses as unknown as CourseRow,
  })).filter((r) => r.course !== null);

  const inBundle = new Set(bundleCourses.map((r) => r.course_id));
  const available = (allCourses ?? []).filter((c) => !inBundle.has(c.id));

  // ── Server Actions ──────────────────────────────────────────────
  async function saveBundle(formData: FormData) {
    "use server";
    await verifyAdmin();
    const title       = (formData.get("title") as string ?? "").trim().slice(0, 200);
    const description = (formData.get("description") as string ?? "").trim().slice(0, 500);
    const audience    = (formData.get("audience") as string ?? "general").trim();
    const is_published = formData.get("is_published") === "true";
    // Keep status in sync so RLS policy (status = 'published') also passes
    const status = is_published ? "published" : "draft";
    if (!title) return;
    const db2 = createAdminClient();
    await db2.from("bundles").update({ title, description, audience, is_published, status, updated_at: new Date().toISOString() }).eq("id", id);
    revalidatePath(`/admin/bundles/${id}`);
    revalidatePath("/admin/bundles");
  }

  async function addCourse(formData: FormData) {
    "use server";
    await verifyAdmin();
    const course_id = (formData.get("course_id") as string ?? "").trim();
    if (!course_id) return;
    const db2 = createAdminClient();
    const { data: existing } = await db2
      .from("bundle_courses")
      .select("sort_order")
      .eq("bundle_id", id)
      .order("sort_order", { ascending: false })
      .limit(1);
    const sort_order = existing && existing.length > 0 ? existing[0].sort_order + 1 : 0;
    await db2.from("bundle_courses").upsert({ bundle_id: id, course_id, sort_order });
    revalidatePath(`/admin/bundles/${id}`);
  }

  async function removeCourse(formData: FormData) {
    "use server";
    await verifyAdmin();
    const course_id = (formData.get("course_id") as string ?? "").trim();
    if (!course_id) return;
    const db2 = createAdminClient();
    await db2.from("bundle_courses").delete().eq("bundle_id", id).eq("course_id", course_id);
    revalidatePath(`/admin/bundles/${id}`);
  }

  async function moveUp(formData: FormData) {
    "use server";
    await verifyAdmin();
    const course_id = (formData.get("course_id") as string ?? "").trim();
    const current_order = Number(formData.get("sort_order"));
    if (!course_id) return;
    const db2 = createAdminClient();
    // Find the row just above
    const { data: prev } = await db2
      .from("bundle_courses")
      .select("course_id, sort_order")
      .eq("bundle_id", id)
      .lt("sort_order", current_order)
      .order("sort_order", { ascending: false })
      .limit(1);
    if (!prev || prev.length === 0) return;
    // Swap sort_orders
    await db2.from("bundle_courses").update({ sort_order: prev[0].sort_order }).eq("bundle_id", id).eq("course_id", course_id);
    await db2.from("bundle_courses").update({ sort_order: current_order }).eq("bundle_id", id).eq("course_id", prev[0].course_id);
    revalidatePath(`/admin/bundles/${id}`);
  }

  async function moveDown(formData: FormData) {
    "use server";
    await verifyAdmin();
    const course_id = (formData.get("course_id") as string ?? "").trim();
    const current_order = Number(formData.get("sort_order"));
    if (!course_id) return;
    const db2 = createAdminClient();
    const { data: next } = await db2
      .from("bundle_courses")
      .select("course_id, sort_order")
      .eq("bundle_id", id)
      .gt("sort_order", current_order)
      .order("sort_order", { ascending: true })
      .limit(1);
    if (!next || next.length === 0) return;
    await db2.from("bundle_courses").update({ sort_order: next[0].sort_order }).eq("bundle_id", id).eq("course_id", course_id);
    await db2.from("bundle_courses").update({ sort_order: current_order }).eq("bundle_id", id).eq("course_id", next[0].course_id);
    revalidatePath(`/admin/bundles/${id}`);
  }

  // ── UI ──────────────────────────────────────────────────────────
  const LEVEL_COLOR: Record<string, string> = {
    beginner:     "#3E9A52",
    intermediate: "#2A5230",
    advanced:     "#C48A3A",
  };

  return (
    <div className="max-w-2xl p-8">
      {/* Back + preview */}
      <div className="flex items-center justify-between mb-6">
        <Link href="/admin/bundles" className="inline-flex items-center gap-1.5 text-sm" style={{ color: "var(--admin-text-muted)" }}>
          <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
            <path fillRule="evenodd" d="M14 8a.75.75 0 0 1-.75.75H4.56l3.22 3.22a.75.75 0 1 1-1.06 1.06l-4.5-4.5a.75.75 0 0 1 0-1.06l4.5-4.5a.75.75 0 0 1 1.06 1.06L4.56 7.25h8.69A.75.75 0 0 1 14 8Z" clipRule="evenodd" />
          </svg>
          All Bundles
        </Link>
        {bundle.is_published && (
          <Link
            href={`/bundles/${bundle.slug}`}
            target="_blank"
            className="text-xs font-bold px-3 py-1.5 rounded-lg"
            style={{ background: "#EEF5EE", color: "#2A5230" }}
          >
            Preview ↗
          </Link>
        )}
      </div>

      {/* Bundle settings */}
      <div className="rounded-2xl overflow-hidden mb-6" style={{ border: "1.5px solid var(--admin-border)", background: "var(--admin-card-bg)" }}>
        <div className="px-6 py-4" style={{ borderBottom: "1px solid var(--admin-border)", background: "var(--admin-table-head-bg)" }}>
          <h1 className="font-extrabold text-lg" style={{ fontFamily: "var(--font-head)", color: "var(--admin-text-primary)" }}>
            Bundle Settings
          </h1>
        </div>
        <form action={saveBundle} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: "var(--admin-text-dim)" }}>Title</label>
            <input
              name="title"
              required
              defaultValue={bundle.title}
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#2A5230]"
              style={{ borderColor: "var(--admin-border-mid)", color: "var(--admin-text-primary)" }}
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: "var(--admin-text-dim)" }}>Description</label>
            <textarea
              name="description"
              rows={2}
              defaultValue={bundle.description ?? ""}
              placeholder="Short description shown on audience pages"
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#2A5230] resize-none"
              style={{ borderColor: "var(--admin-border-mid)", color: "var(--admin-text-primary)" }}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: "var(--admin-text-dim)" }}>Audience</label>
              <select
                name="audience"
                defaultValue={bundle.audience}
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#2A5230] bg-white"
                style={{ borderColor: "var(--admin-border-mid)", color: "var(--admin-text-primary)" }}
              >
                {AUDIENCE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: "var(--admin-text-dim)" }}>Status</label>
              <select
                name="is_published"
                defaultValue={bundle.is_published ? "true" : "false"}
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#2A5230] bg-white"
                style={{ borderColor: "var(--admin-border-mid)", color: "var(--admin-text-primary)" }}
              >
                <option value="false">Draft — not visible publicly</option>
                <option value="true">Published — visible on site</option>
              </select>
            </div>
          </div>
          <button
            type="submit"
            className="text-sm font-bold px-5 py-2.5 rounded-xl"
            style={{ background: "#2A5230", color: "#fff" }}
          >
            Save Changes
          </button>
        </form>
      </div>

      {/* Course list */}
      <div className="rounded-2xl overflow-hidden" style={{ border: "1.5px solid var(--admin-border)", background: "var(--admin-card-bg)" }}>
        <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--admin-border)", background: "var(--admin-table-head-bg)" }}>
          <h2 className="font-bold text-sm" style={{ color: "var(--admin-text-primary)" }}>
            Courses in this bundle
            <span className="ml-2 text-xs font-normal" style={{ color: "var(--admin-text-dim)" }}>{bundleCourses.length} course{bundleCourses.length !== 1 ? "s" : ""}</span>
          </h2>
          <span className="text-xs" style={{ color: "var(--admin-text-dim)" }}>Drag to reorder · first course shows on signup page</span>
        </div>

        {bundleCourses.length === 0 ? (
          <div className="px-6 py-8 text-center text-sm" style={{ color: "var(--admin-text-dim)" }}>
            No courses yet — add one below.
          </div>
        ) : (
          <div>
            {bundleCourses.map(({ course_id, sort_order, course }, i) => (
              <div
                key={course_id}
                className="flex items-center gap-3 px-5 py-3.5"
                style={{ borderBottom: i < bundleCourses.length - 1 ? "1px solid #F5FAF5" : undefined }}
              >
                {/* Position */}
                <span className="text-xs font-bold w-5 text-center shrink-0" style={{ color: "#C8DEC8" }}>{i + 1}</span>

                {/* Up/down */}
                <div className="flex flex-col gap-0.5 shrink-0">
                  <form action={moveUp}>
                    <input type="hidden" name="course_id" value={course_id} />
                    <input type="hidden" name="sort_order" value={sort_order} />
                    <button type="submit" disabled={i === 0} className="block p-0.5 disabled:opacity-20" style={{ color: "var(--admin-text-muted)" }}>
                      <svg viewBox="0 0 12 12" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 8l4-4 4 4" />
                      </svg>
                    </button>
                  </form>
                  <form action={moveDown}>
                    <input type="hidden" name="course_id" value={course_id} />
                    <input type="hidden" name="sort_order" value={sort_order} />
                    <button type="submit" disabled={i === bundleCourses.length - 1} className="block p-0.5 disabled:opacity-20" style={{ color: "var(--admin-text-muted)" }}>
                      <svg viewBox="0 0 12 12" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 4l4 4 4-4" />
                      </svg>
                    </button>
                  </form>
                </div>

                {/* Course info */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate" style={{ color: "var(--admin-text-primary)" }}>{course.title}</div>
                  <div className="text-xs mt-0.5" style={{ color: LEVEL_COLOR[course.level] ?? "#9AB89E" }}>
                    {course.level}
                    {course.certificate_eligible && " · Certificate"}
                    {" · "}{course.price_type === "free" ? "Free" : "Paid"}
                  </div>
                </div>

                {/* Remove */}
                <form action={removeCourse} className="shrink-0">
                  <input type="hidden" name="course_id" value={course_id} />
                  <button
                    type="submit"
                    className="text-xs font-bold px-2.5 py-1 rounded-lg"
                    style={{ color: "#AA2222", background: "#FFF0F0" }}
                  >
                    Remove
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}

        {/* Add course */}
        {available.length > 0 && (
          <form action={addCourse} className="flex gap-2 px-5 py-4" style={{ borderTop: "1px solid #F0F7F0", background: "var(--admin-table-head-bg)" }}>
            <select
              name="course_id"
              required
              defaultValue=""
              className="flex-1 text-sm px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#2A5230] bg-white"
              style={{ borderColor: "var(--admin-border-mid)", color: "var(--admin-text-primary)" }}
            >
              <option value="" disabled>Select a course to add…</option>
              {available.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                  {c.status !== "published" ? ` [${c.status}]` : ""}
                  {c.certificate_eligible ? " [Cert]" : ""}
                  {" — "}{c.price_type === "free" ? "Free" : "Paid"}
                  {" · "}{c.level}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="text-sm font-bold px-5 py-2.5 rounded-xl shrink-0"
              style={{ background: "#2A5230", color: "#fff" }}
            >
              + Add
            </button>
          </form>
        )}

        {available.length === 0 && bundleCourses.length > 0 && (
          <div className="px-6 py-3 text-xs" style={{ borderTop: "1px solid #F0F7F0", color: "var(--admin-text-dim)" }}>
            All published courses are in this bundle.{" "}
            <Link href="/admin/courses" className="font-bold" style={{ color: "#4A8A52" }}>Add more courses →</Link>
          </div>
        )}
      </div>
    </div>
  );
}
