import { createAdminClient } from "@/lib/supabase/admin";

export default async function CertificatesPage() {
  const db = createAdminClient();

  const { count: eligible } = await db
    .from("courses")
    .select("*", { count: "exact", head: true })
    .eq("certificate_eligible", true);

  const { count: completions } = await db
    .from("enrollments")
    .select("*", { count: "exact", head: true })
    .not("completed_at", "is", null);

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="font-extrabold text-2xl" style={{ fontFamily: "var(--font-head)", color: "#1A2E1C" }}>Certificates</h1>
        <p className="text-sm mt-0.5" style={{ color: "#7A9878" }}>Certificate issuance and verification</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="rounded-2xl p-5" style={{ background: "#fff", border: "1.5px solid #E8EDE6" }}>
          <div className="text-3xl font-extrabold mb-1" style={{ fontFamily: "var(--font-head)", color: "#2A5230" }}>{eligible ?? 0}</div>
          <div className="text-sm font-semibold" style={{ color: "#4A6650" }}>Certificate-eligible courses</div>
        </div>
        <div className="rounded-2xl p-5" style={{ background: "#fff", border: "1.5px solid #E8EDE6" }}>
          <div className="text-3xl font-extrabold mb-1" style={{ fontFamily: "var(--font-head)", color: "#6B4FBB" }}>{completions ?? 0}</div>
          <div className="text-sm font-semibold" style={{ color: "#4A6650" }}>Course completions</div>
        </div>
      </div>

      <div className="rounded-2xl p-12 text-center" style={{ background: "#fff", border: "1.5px solid #E8EDE6" }}>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "#EEF5EE" }}>
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#2A5230" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <circle cx="9" cy="12" r="3" />
            <path d="M14 10h4M14 12h4M14 14h2" />
          </svg>
        </div>
        <h2 className="font-bold text-lg mb-2" style={{ fontFamily: "var(--font-head)", color: "#1A2E1C" }}>Certificate Management</h2>
        <p className="text-sm max-w-md mx-auto" style={{ color: "#7A9878" }}>
          Certificate template designer, bulk issuance, and verification portal are coming soon. Certificates are already issued automatically via the backend when a learner completes all required lessons.
        </p>
      </div>
    </div>
  );
}
