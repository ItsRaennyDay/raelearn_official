import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function Page() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  const title = "assignments".replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="font-extrabold text-2xl" style={{ fontFamily: "var(--font-head)", color: "#1A2E1C" }}>{title}</h1>
      </div>
      <div className="rounded-xl p-12 text-center" style={{ background: "#fff", border: "1.5px solid #E8EDE6" }}>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: "#EEF5EE" }}>
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#2A5230" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" /><path d="M12 8v5" /><circle cx="12" cy="16" r=".5" fill="#2A5230" stroke="none" />
          </svg>
        </div>
        <h3 className="font-bold text-sm mb-2" style={{ color: "#2A5230" }}>{title}</h3>
        <p className="text-xs" style={{ color: "#9AB89E" }}>This section is coming soon.</p>
      </div>
    </div>
  );
}
