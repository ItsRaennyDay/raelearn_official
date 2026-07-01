import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import PrintButton from "./PrintButton";

export default async function CertificatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  const { data: cert } = await supabase
    .from("certificates")
    .select("id, certificate_number, issued_at, courses(title), profiles:user_id(full_name)")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!cert) notFound();

  const course = cert.courses as unknown as { title?: string } | null;
  const profile = cert.profiles as unknown as { full_name?: string } | null;
  const issuedDate = new Date(cert.issued_at).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <>
      <style>{`
        @media print {
          nav, header, aside, footer,
          .no-print { display: none !important; }
          body { background: white !important; }
          #cert-card {
            border: 2px solid #E8EDE6 !important;
            box-shadow: none !important;
            page-break-inside: avoid;
          }
        }
      `}</style>

      {/* Back + print controls (hidden on print) */}
      <div className="no-print max-w-3xl mb-5 flex flex-wrap items-center gap-3">
        <Link
          href="/dashboard/certificates"
          className="text-sm font-medium"
          style={{ color: "#7A9878" }}
        >
          ← Back to Certificates
        </Link>
        <PrintButton />
      </div>

      {/* Certificate card */}
      <div className="max-w-3xl">
        <div
          id="cert-card"
          className="rounded-2xl p-8 md:p-14 text-center"
          style={{ background: "#fff", border: "2px solid #E8EDE6" }}
        >
          {/* Decorative top bar */}
          <div className="w-full h-1.5 rounded-full mb-8" style={{ background: "linear-gradient(90deg, #2A5230 0%, #4A8A52 50%, #DDE8DA 100%)" }} />

          {/* Logo / brand */}
          <div className="mb-2 font-extrabold text-2xl md:text-3xl" style={{ fontFamily: "var(--font-head)", color: "#1A2E1C" }}>
            RaeLearn
          </div>
          <div className="text-xs uppercase tracking-widest mb-8" style={{ color: "#9AB89E", letterSpacing: "0.2em" }}>
            Certificate of Completion
          </div>

          <div className="w-12 h-0.5 mx-auto mb-8" style={{ background: "#DDE8DA" }} />

          <p className="text-sm mb-3" style={{ color: "#7A9878" }}>This is to certify that</p>

          <div
            className="font-extrabold text-3xl md:text-5xl mb-4 leading-tight"
            style={{ fontFamily: "var(--font-head)", color: "#1A2E1C" }}
          >
            {profile?.full_name ?? "—"}
          </div>

          <p className="text-sm mb-3" style={{ color: "#7A9878" }}>has successfully completed the course</p>

          <div className="font-bold text-xl md:text-2xl mb-10" style={{ color: "#2A5230" }}>
            {course?.title ?? "—"}
          </div>

          <div className="w-12 h-0.5 mx-auto mb-8" style={{ background: "#DDE8DA" }} />

          {/* Footer details */}
          <div className="flex flex-col sm:flex-row justify-center gap-8 sm:gap-20">
            <div>
              <div
                className="font-bold text-base"
                style={{ color: "#1A2E1C", fontFamily: "var(--font-head)" }}
              >
                {issuedDate}
              </div>
              <div className="text-xs mt-0.5 uppercase tracking-wider" style={{ color: "#9AB89E" }}>Date Issued</div>
            </div>
            <div>
              <div
                className="font-bold text-base"
                style={{ color: "#1A2E1C", fontFamily: "var(--font-head)" }}
              >
                #{cert.certificate_number}
              </div>
              <div className="text-xs mt-0.5 uppercase tracking-wider" style={{ color: "#9AB89E" }}>Certificate No.</div>
            </div>
          </div>

          {/* Bottom decorative bar */}
          <div className="w-full h-1.5 rounded-full mt-8" style={{ background: "linear-gradient(90deg, #DDE8DA 0%, #4A8A52 50%, #2A5230 100%)" }} />
        </div>
      </div>
    </>
  );
}
