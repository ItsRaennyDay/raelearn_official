import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, avatar_url, created_at")
    .eq("id", user.id)
    .single();

  const firstName = profile?.full_name?.split(" ")[0] ?? "there";

  return (
    <div className="max-w-xl">
      <div className="mb-6">
        <h1 className="font-extrabold text-2xl" style={{ fontFamily: "var(--font-head)", color: "#1A2E1C" }}>Profile</h1>
        <p className="text-sm mt-0.5" style={{ color: "#7A9878" }}>Your account information</p>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", border: "1.5px solid #E8EDE6" }}>
        <div className="px-6 py-8 flex items-center gap-5" style={{ borderBottom: "1px solid #EEF5EE" }}>
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-extrabold shrink-0"
            style={{ background: "#DDE8DA", color: "#2A5230", fontFamily: "var(--font-head)" }}
          >
            {firstName[0]?.toUpperCase()}
          </div>
          <div>
            <div className="font-bold text-lg" style={{ color: "#1A2E1C" }}>{profile?.full_name ?? "—"}</div>
            <div className="text-sm" style={{ color: "#7A9878" }}>{user.email}</div>
            <div className="text-xs mt-1 capitalize" style={{ color: "#9AB89E" }}>{(profile?.role ?? "learner").replace(/_/g, " ")}</div>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wide" style={{ color: "#9AB89E" }}>Full Name</label>
            <div className="mt-1 text-sm font-medium" style={{ color: "#1A2E1C" }}>{profile?.full_name ?? "—"}</div>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wide" style={{ color: "#9AB89E" }}>Email</label>
            <div className="mt-1 text-sm font-medium" style={{ color: "#1A2E1C" }}>{user.email}</div>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wide" style={{ color: "#9AB89E" }}>Member Since</label>
            <div className="mt-1 text-sm font-medium" style={{ color: "#1A2E1C" }}>
              {profile?.created_at ? new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "—"}
            </div>
          </div>
        </div>

        <div className="px-6 py-4" style={{ borderTop: "1px solid #EEF5EE", background: "#FAFCFA" }}>
          <p className="text-xs" style={{ color: "#9AB89E" }}>Profile editing is coming soon. Contact support to update your name or email.</p>
        </div>
      </div>
    </div>
  );
}
