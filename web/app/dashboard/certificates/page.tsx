import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function CertificatesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  const { data: certs } = await supabase
    .from("certificates")
    .select("id, certificate_number, issued_at, courses(title, slug)")
    .eq("user_id", user.id)
    .order("issued_at", { ascending: false });

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="font-extrabold text-2xl" style={{ fontFamily: "var(--font-head)", color: "#1A2E1C" }}>My Certificates</h1>
        <p className="text-sm mt-0.5" style={{ color: "#7A9878" }}>{certs?.length ?? 0} certificates earned</p>
      </div>

      {!certs || certs.length === 0 ? (
        <div className="rounded-xl p-12 text-center" style={{ background: "#fff", border: "1.5px dashed #C8DEC8" }}>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: "#FFF3DC" }}>
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#9c6c12" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="9" cy="12" r="3" /><path d="M14 10h4M14 12h4M14 14h2" />
            </svg>
          </div>
          <h3 className="font-bold text-sm mb-2" style={{ color: "#2A5230" }}>No certificates yet</h3>
          <p className="text-xs mb-4" style={{ color: "#9AB89E" }}>Complete a certificate-eligible course to earn your first certificate.</p>
          <Link href="/courses?cert=true" className="inline-flex items-center text-sm font-bold px-5 py-2.5 rounded-xl" style={{ background: "#2A5230", color: "#fff" }}>
            Browse Certificate Courses →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {certs.map((cert) => {
            const course = cert.courses as unknown as { title?: string; slug?: string } | null;
            return (
              <div key={cert.id} className="rounded-xl p-5 flex items-center gap-4" style={{ background: "#fff", border: "1px solid #E8EDE6" }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#FFF3DC" }}>
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#9c6c12" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="9" cy="12" r="3" /><path d="M14 10h3M14 12h3" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm" style={{ color: "#1A2E1C" }}>{course?.title ?? "Certificate"}</div>
                  <div className="text-xs mt-0.5" style={{ color: "#9AB89E" }}>
                    #{cert.certificate_number} · Issued {new Date(cert.issued_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button className="text-xs font-bold px-3 py-1.5 rounded-lg" style={{ background: "#EEF5EE", color: "#2A5230" }}>Download</button>
                  <button className="text-xs font-bold px-3 py-1.5 rounded-lg" style={{ background: "#F5F0E8", color: "#7A9878" }}>Share</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
