import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import CertificatePreview from "../CertificatePreview";
import { TemplateSettings } from "@/lib/certificate-types";

export default async function TemplatesPage() {
  const db = createAdminClient();

  const { data: templates } = await db
    .from("certificate_templates")
    .select("id, name, settings, created_at")
    .order("created_at", { ascending: false });

  // Count courses per template
  const { data: courseAssignments } = await db
    .from("courses")
    .select("certificate_template_id")
    .not("certificate_template_id", "is", null);

  const courseCountByTemplate: Record<string, number> = {};
  for (const c of courseAssignments ?? []) {
    if (c.certificate_template_id) {
      courseCountByTemplate[c.certificate_template_id] = (courseCountByTemplate[c.certificate_template_id] ?? 0) + 1;
    }
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl">
      <div className="flex items-end justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/admin/certificates" className="text-sm hover:underline" style={{ color: "#7A9878" }}>Certificates</Link>
            <span style={{ color: "#C8DEC8" }}>/</span>
            <span className="text-sm font-semibold" style={{ color: "#1A2E1C" }}>Templates</span>
          </div>
          <h1 className="font-extrabold text-2xl" style={{ fontFamily: "var(--font-head)", color: "#1A2E1C" }}>
            Certificate Templates
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "#7A9878" }}>
            {templates?.length ?? 0} template{templates?.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/admin/certificates/templates/new"
          className="px-5 py-2.5 text-sm font-bold rounded-xl"
          style={{ background: "#2A5230", color: "#fff" }}
        >
          + New Template
        </Link>
      </div>

      {(!templates || templates.length === 0) ? (
        <div className="rounded-2xl p-14 text-center" style={{ background: "#fff", border: "1.5px dashed #C8DEC8" }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "#EEF5EE" }}>
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#2A5230" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <circle cx="9" cy="12" r="3" />
              <path d="M14 10h4M14 12h4M14 14h2" />
            </svg>
          </div>
          <h3 className="font-bold text-base mb-1" style={{ color: "#2A5230" }}>No templates yet</h3>
          <p className="text-sm mb-5" style={{ color: "#9AB89E" }}>Design your first certificate template.</p>
          <Link href="/admin/certificates/templates/new"
            className="inline-flex items-center text-sm font-bold px-6 py-3 rounded-xl"
            style={{ background: "#2A5230", color: "#fff" }}>
            Create Template →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {(templates ?? []).map((t) => {
            const count = courseCountByTemplate[t.id] ?? 0;
            return (
              <Link key={t.id} href={`/admin/certificates/templates/${t.id}`}
                className="group rounded-2xl overflow-hidden transition-shadow hover:shadow-md"
                style={{ border: "1.5px solid #E8EDE6", background: "#fff" }}>
                {/* Mini preview */}
                <div className="relative overflow-hidden" style={{ background: "#EAEEE9", height: 200 }}>
                  <div style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%) scale(0.36)",
                    transformOrigin: "center",
                    pointerEvents: "none",
                  }}>
                    <CertificatePreview
                      settings={t.settings as Partial<TemplateSettings>}
                      learnerName="Learner Name"
                      courseTitle="Course Title"
                      certNumber="RL-2025-XXXXXX"
                      issuedAt={t.created_at}
                    />
                  </div>
                  {/* Hover overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: "#1A2E1C22" }}>
                    <span className="text-sm font-bold px-4 py-2 rounded-xl" style={{ background: "#fff", color: "#2A5230" }}>
                      Edit Template →
                    </span>
                  </div>
                </div>

                {/* Card footer */}
                <div className="px-4 py-3 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-sm" style={{ color: "#1A2E1C" }}>{t.name}</div>
                    <div className="text-xs mt-0.5" style={{ color: "#9AB89E" }}>
                      {count > 0 ? `Used by ${count} course${count !== 1 ? "s" : ""}` : "Not assigned to any course"}
                    </div>
                  </div>
                  <div className="text-xs font-semibold px-2.5 py-1 rounded-lg"
                    style={{ background: count > 0 ? "#EEF5EE" : "#F5F5F5", color: count > 0 ? "#2A5230" : "#9AB89E" }}>
                    {count > 0 ? `${count} course${count !== 1 ? "s" : ""}` : "Unassigned"}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
