import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL ?? "rae2xyz@gmail.com").toLowerCase();

async function issueCertificate(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email?.toLowerCase() !== ADMIN_EMAIL) return;

  const userId = formData.get("userId") as string;
  const courseId = formData.get("courseId") as string;
  if (!userId || !courseId) return;

  const db = createAdminClient();
  const certNum = "RL-" + new Date().getFullYear() + "-" + Math.random().toString(36).slice(2, 10).toUpperCase();
  await db.from("certificates").upsert({
    user_id: userId,
    course_id: courseId,
    certificate_number: certNum,
    issued_at: new Date().toISOString(),
  }, { onConflict: "user_id,course_id" });

  revalidatePath("/admin/certificates");
  redirect("/admin/certificates?issued=1");
}

export default async function CertificatesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; issued?: string }>;
}) {
  const { q = "", issued } = await searchParams;
  const db = createAdminClient();

  const [eligibleRes, completionsRes, templateRes, certsRes] = await Promise.all([
    db.from("courses").select("*", { count: "exact", head: true }).eq("certificate_eligible", true),
    db.from("enrollments").select("*", { count: "exact", head: true }).not("completed_at", "is", null),
    db.from("certificate_templates").select("*", { count: "exact", head: true }),
    db.from("certificates")
      .select(`id, certificate_number, issued_at, expires_at,
        profiles:user_id (full_name, email),
        courses:course_id (title, slug),
        certificate_templates:template_id (name)`, { count: "exact" })
      .order("issued_at", { ascending: false })
      .limit(100),
  ]);

  const allCerts = certsRes.data ?? [];

  const certs = q
    ? allCerts.filter((c) => {
        const profile = c.profiles as unknown as { full_name?: string; email?: string } | null;
        const course = c.courses as unknown as { title?: string } | null;
        const term = q.toLowerCase();
        return (
          profile?.full_name?.toLowerCase().includes(term) ||
          profile?.email?.toLowerCase().includes(term) ||
          course?.title?.toLowerCase().includes(term) ||
          c.certificate_number?.toLowerCase().includes(term)
        );
      })
    : allCerts;

  const stats = [
    { label: "Eligible Courses", value: eligibleRes.count ?? 0, color: "#2A5230", bg: "#EEF5EE" },
    { label: "Issued Certificates", value: certsRes.count ?? 0, color: "#6B4FBB", bg: "#F0EEFF" },
    { label: "Course Completions", value: completionsRes.count ?? 0, color: "#8A6020", bg: "#FFF3DC" },
    { label: "Templates", value: templateRes.count ?? 0, color: "#1A4A8A", bg: "#E8F2FF" },
  ];

  return (
    <div className="p-4 md:p-8 max-w-6xl">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="font-extrabold text-2xl" style={{ fontFamily: "var(--font-head)", color: "#1A2E1C" }}>Certificates</h1>
          <p className="text-sm mt-0.5" style={{ color: "#7A9878" }}>Manage issued certificates and design templates</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/certificates/templates"
            className="px-4 py-2.5 text-sm font-bold rounded-xl"
            style={{ background: "#fff", color: "#2A5230", border: "1.5px solid #C8DEC8" }}>
            Template Designer
          </Link>
          <Link href="/admin/certificates/templates/new"
            className="px-4 py-2.5 text-sm font-bold rounded-xl"
            style={{ background: "#2A5230", color: "#fff" }}>
            + New Template
          </Link>
        </div>
      </div>

      {issued && (
        <div className="mb-4 px-4 py-3 rounded-xl text-sm font-medium" style={{ background: "#EEF5EE", color: "#2A5230", border: "1px solid #C8DEC8" }}>
          Certificate issued successfully.
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className="rounded-2xl p-5" style={{ background: "#fff", border: "1.5px solid #E8EDE6" }}>
            <div className="text-3xl font-extrabold mb-1" style={{ fontFamily: "var(--font-head)", color: s.color }}>{s.value}</div>
            <div className="text-xs font-semibold" style={{ color: "#7A9878" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Templates quick-access */}
      <div className="mb-6 rounded-2xl p-5" style={{ background: "#fff", border: "1.5px solid #E8EDE6" }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-sm" style={{ color: "#2A5230" }}>Certificate Templates</h2>
          <Link href="/admin/certificates/templates" className="text-xs font-semibold hover:underline" style={{ color: "#7A9878" }}>
            View all →
          </Link>
        </div>
        {(templateRes.count ?? 0) === 0 ? (
          <div className="flex items-center gap-4 p-4 rounded-xl" style={{ background: "#FAFCFA", border: "1.5px dashed #DDE8DA" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#EEF5EE" }}>
              <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="#2A5230" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="16" height="12" rx="1.5" />
                <circle cx="8" cy="10" r="2.5" />
                <path d="M12 8.5h3M12 10h3M12 11.5h2" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold mb-0.5" style={{ color: "#1A2E1C" }}>Design your first certificate template</div>
              <div className="text-xs" style={{ color: "#9AB89E" }}>Customize colors, fonts, borders, and branding. Assign templates to courses.</div>
            </div>
            <Link href="/admin/certificates/templates/new"
              className="text-sm font-bold px-4 py-2 rounded-xl shrink-0"
              style={{ background: "#2A5230", color: "#fff" }}>
              Create Template
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="text-sm" style={{ color: "#4A6650" }}>
              You have <span className="font-bold" style={{ color: "#2A5230" }}>{templateRes.count}</span> template{templateRes.count !== 1 ? "s" : ""} created.
            </div>
            <Link href="/admin/certificates/templates"
              className="text-sm font-bold px-4 py-2 rounded-xl"
              style={{ background: "#EEF5EE", color: "#2A5230" }}>
              Manage Templates →
            </Link>
          </div>
        )}
      </div>

      {/* Issued certificates table */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-sm" style={{ color: "#1A2E1C" }}>
            Issued Certificates <span className="font-normal text-xs ml-1" style={{ color: "#9AB89E" }}>({certsRes.count ?? 0})</span>
          </h2>
          <form method="GET" className="flex gap-2">
            <input name="q" defaultValue={q} placeholder="Search learner, course…"
              className="px-3 py-1.5 text-xs rounded-xl border outline-none"
              style={{ borderColor: "#DDE8DA", background: "#fff", color: "#1A2E1C", width: 220 }} />
            <button type="submit" className="px-3 py-1.5 text-xs font-bold rounded-xl"
              style={{ background: "#2A5230", color: "#fff" }}>Search</button>
            {q && <Link href="/admin/certificates" className="px-3 py-1.5 text-xs rounded-xl" style={{ background: "#F5F0E8", color: "#7A9878" }}>Clear</Link>}
          </form>
        </div>

        <div className="rounded-2xl overflow-hidden" style={{ border: "1.5px solid #E8EDE6" }}>
          <div style={{ background: "#fff", minWidth: 680 }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid #F0F7F0", background: "#FAFCFA" }}>
                  {["Learner", "Course", "Cert Number", "Template", "Issued", ""].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: "#7A9878" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {certs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-sm" style={{ color: "#9AB89E" }}>
                      {q ? "No certificates match your search." : "No certificates issued yet."}
                    </td>
                  </tr>
                ) : certs.map((cert) => {
                  const profile = cert.profiles as unknown as { full_name?: string; email?: string } | null;
                  const course = cert.courses as unknown as { title?: string; slug?: string } | null;
                  const tmpl = cert.certificate_templates as unknown as { name?: string } | null;
                  return (
                    <tr key={cert.id} className="transition-colors hover:bg-[#FAFCFA]" style={{ borderBottom: "1px solid #F5FAF5" }}>
                      <td className="px-4 py-3">
                        <div className="font-medium text-sm" style={{ color: "#1A2E1C" }}>
                          {profile?.full_name || profile?.email?.split("@")[0] || "—"}
                        </div>
                        <div className="text-xs" style={{ color: "#9AB89E" }}>{profile?.email}</div>
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: "#4A6650" }}>
                        {course?.slug ? (
                          <Link href={`/courses/${course.slug}`} target="_blank" className="hover:underline">{course.title}</Link>
                        ) : (course?.title ?? "—")}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-mono px-2 py-0.5 rounded" style={{ background: "#F5FAF5", color: "#4A6650" }}>
                          {cert.certificate_number}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: "#7A9878" }}>
                        {tmpl?.name ? (
                          <span className="px-2 py-0.5 rounded-full font-semibold" style={{ background: "#EEF5EE", color: "#2A5230" }}>{tmpl.name}</span>
                        ) : <span style={{ color: "#C8C8C8" }}>Default</span>}
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: "#9AB89E" }}>
                        {cert.issued_at ? new Date(cert.issued_at).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/dashboard/certificates/${cert.id}`}
                          target="_blank"
                          className="text-xs font-bold px-3 py-1 rounded-lg"
                          style={{ background: "#EEF5EE", color: "#2A5230" }}
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
