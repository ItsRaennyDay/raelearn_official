import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import Link from "next/link";

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL ?? "rae2xyz@gmail.com").toLowerCase();

async function verifyAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email?.toLowerCase() !== ADMIN_EMAIL) throw new Error("Unauthorized");
}

async function createEnrollment(formData: FormData) {
  "use server";
  await verifyAdmin();
  const email = (formData.get("email") as string ?? "").trim().toLowerCase();
  const courseId = formData.get("courseId") as string;
  if (!email || !courseId) redirect("/admin/enrollments?error=missing-fields");

  const db = createAdminClient();

  // Find user by email in profiles
  const { data: profile } = await db
    .from("profiles")
    .select("id")
    .eq("email", email)
    .single();

  if (!profile) redirect("/admin/enrollments?error=user-not-found");

  // Prevent duplicate active enrollment
  const { data: existing } = await db
    .from("enrollments")
    .select("id")
    .eq("user_id", profile.id)
    .eq("course_id", courseId)
    .eq("status", "active")
    .single();

  if (existing) redirect("/admin/enrollments?error=already-enrolled");

  await db.from("enrollments").insert({
    user_id: profile.id,
    course_id: courseId,
    status: "active",
    source: "admin",
    enrolled_at: new Date().toISOString(),
  });

  revalidatePath("/admin/enrollments");
  redirect("/admin/enrollments?created=1");
}

async function revokeEnrollment(formData: FormData) {
  "use server";
  await verifyAdmin();
  const enrollmentId = formData.get("enrollmentId") as string;
  if (!enrollmentId) return;
  const db = createAdminClient();
  await db.from("enrollments").update({ status: "cancelled" }).eq("id", enrollmentId);
  revalidatePath("/admin/enrollments");
}

const STATUS_META: Record<string, { bg: string; text: string; dot: string }> = {
  active:    { bg: "#EEF5EE", text: "#2A5230", dot: "#4A8A52" },
  expired:   { bg: "#FFF3DC", text: "#8A6020", dot: "#C48A3A" },
  cancelled: { bg: "#F3F3F3", text: "#666",    dot: "#999"    },
  completed: { bg: "#E8F2FF", text: "#1A4A8A", dot: "#3A7AC8" },
};

export default async function EnrollmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string; created?: string; error?: string }>;
}) {
  const { q = "", status = "", page = "1", created, error } = await searchParams;
  const db = createAdminClient();
  const pageSize = 50;
  const offset = (Number(page) - 1) * pageSize;

  // Fetch courses for the enroll form
  const { data: courses } = await db
    .from("courses")
    .select("id, title")
    .order("title");

  let query = db
    .from("enrollments")
    .select(
      `id, status, enrolled_at, completed_at, source,
       profiles:user_id (full_name, email),
       courses:course_id (title, slug)`,
      { count: "exact" }
    )
    .order("enrolled_at", { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (status) query = query.eq("status", status);

  const { data: enrollments, count } = await query;

  const filtered = q
    ? (enrollments ?? []).filter((e) => {
        const profile = e.profiles as unknown as { full_name?: string; email?: string } | null;
        const course = e.courses as unknown as { title?: string } | null;
        const search = q.toLowerCase();
        return (
          profile?.full_name?.toLowerCase().includes(search) ||
          profile?.email?.toLowerCase().includes(search) ||
          course?.title?.toLowerCase().includes(search)
        );
      })
    : (enrollments ?? []);

  const totalPages = Math.ceil((count ?? 0) / pageSize);

  const ERROR_MESSAGES: Record<string, string> = {
    "missing-fields":   "Please provide both email and course.",
    "user-not-found":   "No registered user found with that email address.",
    "already-enrolled": "This user already has an active enrollment in that course.",
    "invalid-role":     "Invalid role selection.",
  };

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="font-extrabold text-2xl" style={{ fontFamily: "var(--font-head)", color: "#1A2E1C" }}>Enrollments</h1>
        <p className="text-sm mt-0.5" style={{ color: "#7A9878" }}>{count ?? 0} total enrollments</p>
      </div>

      {/* Feedback banners */}
      {created && (
        <div className="mb-4 px-4 py-3 rounded-xl text-sm font-medium" style={{ background: "#EEF5EE", color: "#2A5230", border: "1px solid #C8DEC8" }}>
          Enrollment created successfully.
        </div>
      )}
      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl text-sm font-medium" style={{ background: "#FFF0F0", color: "#AA2222", border: "1px solid #FFCCCC" }}>
          {ERROR_MESSAGES[error] ?? decodeURIComponent(error)}
        </div>
      )}

      {/* Manual enrollment panel */}
      <div className="mb-6 rounded-2xl p-5" style={{ background: "#fff", border: "1.5px solid #E8EDE6" }}>
        <h2 className="font-bold text-sm mb-3" style={{ color: "#2A5230" }}>Enroll a User Manually</h2>
        <form action={createEnrollment} className="flex gap-3 flex-wrap items-end">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold" style={{ color: "#7A9878" }}>Learner email</label>
            <input
              name="email"
              type="email"
              required
              placeholder="learner@example.com"
              className="px-4 py-2 text-sm rounded-xl border outline-none w-64"
              style={{ borderColor: "#DDE8DA", background: "#FAFCFA", color: "#1A2E1C" }}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold" style={{ color: "#7A9878" }}>Course</label>
            <select
              name="courseId"
              required
              className="px-3 py-2 text-sm rounded-xl border outline-none w-64"
              style={{ borderColor: "#DDE8DA", background: "#FAFCFA", color: "#1A2E1C" }}
            >
              <option value="">Select a course…</option>
              {(courses ?? []).map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="px-5 py-2 text-sm font-bold rounded-xl"
            style={{ background: "#2A5230", color: "#fff" }}
          >
            Enroll
          </button>
        </form>
        <p className="text-xs mt-2" style={{ color: "#9AB89E" }}>
          The user must already be registered. Enrollment will be marked as source: admin.
        </p>
      </div>

      {/* Filters */}
      <form method="GET" className="flex gap-3 mb-4">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search learner or course…"
          className="flex-1 max-w-sm px-4 py-2 text-sm rounded-xl border outline-none"
          style={{ borderColor: "#DDE8DA", background: "#fff", color: "#1A2E1C" }}
        />
        <select
          name="status"
          defaultValue={status}
          className="px-3 py-2 text-sm rounded-xl border outline-none"
          style={{ borderColor: "#DDE8DA", background: "#fff", color: "#1A2E1C" }}
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="expired">Expired</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <button type="submit" className="px-4 py-2 text-sm font-bold rounded-xl" style={{ background: "#2A5230", color: "#fff" }}>Filter</button>
        {(q || status) && (
          <Link href="/admin/enrollments" className="px-4 py-2 text-sm rounded-xl" style={{ background: "#F5F0E8", color: "#7A9878" }}>Clear</Link>
        )}
      </form>

      <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", border: "1.5px solid #E8EDE6" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid #F0F7F0", background: "#FAFCFA" }}>
              <th className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: "#7A9878" }}>Learner</th>
              <th className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: "#7A9878" }}>Course</th>
              <th className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: "#7A9878" }}>Status</th>
              <th className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: "#7A9878" }}>Source</th>
              <th className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: "#7A9878" }}>Enrolled</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-sm" style={{ color: "#9AB89E" }}>No enrollments found</td>
              </tr>
            ) : (
              filtered.map((e) => {
                const profile = e.profiles as unknown as { full_name?: string; email?: string } | null;
                const course = e.courses as unknown as { title?: string; slug?: string } | null;
                const meta = STATUS_META[e.status] ?? STATUS_META.active;
                return (
                  <tr key={e.id} className="transition-colors hover:bg-[#FAFCFA]" style={{ borderBottom: "1px solid #F5FAF5" }}>
                    <td className="px-5 py-3">
                      <div className="font-medium" style={{ color: "#1A2E1C" }}>{profile?.full_name ?? "—"}</div>
                      <div className="text-xs mt-0.5" style={{ color: "#9AB89E" }}>{profile?.email ?? "—"}</div>
                    </td>
                    <td className="px-5 py-3" style={{ color: "#4A6650" }}>
                      {course?.slug ? (
                        <Link href={`/courses/${course.slug}`} className="hover:underline" target="_blank">{course.title ?? "—"}</Link>
                      ) : (course?.title ?? "—")}
                    </td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full capitalize" style={{ background: meta.bg, color: meta.text }}>
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: meta.dot }} />
                        {e.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs capitalize" style={{ color: "#7A9878" }}>{e.source ?? "—"}</td>
                    <td className="px-5 py-3 text-xs" style={{ color: "#9AB89E" }}>
                      {e.enrolled_at ? new Date(e.enrolled_at).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-5 py-3">
                      {e.status === "active" && (
                        <form action={revokeEnrollment}>
                          <input type="hidden" name="enrollmentId" value={e.id} />
                          <button
                            type="submit"
                            className="text-xs font-bold px-3 py-1 rounded-lg"
                            style={{ background: "#FFF0F0", color: "#AA2222" }}
                          >
                            Revoke
                          </button>
                        </form>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-xs" style={{ color: "#9AB89E" }}>Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            {Number(page) > 1 && (
              <Link href={`/admin/enrollments?status=${status}&page=${Number(page) - 1}`} className="px-3 py-1.5 text-xs rounded-lg" style={{ background: "#fff", border: "1px solid #DDE8DA", color: "#2A5230" }}>← Prev</Link>
            )}
            {Number(page) < totalPages && (
              <Link href={`/admin/enrollments?status=${status}&page=${Number(page) + 1}`} className="px-3 py-1.5 text-xs rounded-lg" style={{ background: "#fff", border: "1px solid #DDE8DA", color: "#2A5230" }}>Next →</Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
