import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  return (
    <div className="max-w-xl">
      <div className="mb-6">
        <h1 className="font-extrabold text-2xl" style={{ fontFamily: "var(--font-head)", color: "#1A2E1C" }}>Settings</h1>
        <p className="text-sm mt-0.5" style={{ color: "#7A9878" }}>Password, notifications, and preferences</p>
      </div>

      <div className="space-y-3">
        {[
          { label: "Change Password", desc: "Update your login password" },
          { label: "Email Preferences", desc: "Control which emails you receive" },
          { label: "Accessibility", desc: "Font size, contrast, and motion settings" },
          { label: "Privacy", desc: "Control your data and profile visibility" },
        ].map((item) => (
          <div key={item.label} className="rounded-xl p-4 flex items-center justify-between" style={{ background: "#fff", border: "1px solid #E8EDE6" }}>
            <div>
              <div className="font-semibold text-sm" style={{ color: "#1A2E1C" }}>{item.label}</div>
              <div className="text-xs mt-0.5" style={{ color: "#9AB89E" }}>{item.desc}</div>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#F3F3F3", color: "#999" }}>Soon</span>
          </div>
        ))}
      </div>
    </div>
  );
}
