import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function updateProfile(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  const fullName = (formData.get("full_name") as string ?? "").trim();
  if (!fullName) redirect("/dashboard/profile?error=name-required");

  await supabase.from("profiles").update({ full_name: fullName }).eq("id", user.id);
  redirect("/dashboard/profile?saved=1");
}

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  const { saved, error } = await searchParams;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, created_at")
    .eq("id", user.id)
    .single();

  const initial = (profile?.full_name ?? user.email ?? "?")[0]?.toUpperCase();

  return (
    <div className="max-w-xl">
      <div className="mb-6">
        <h1 className="font-extrabold text-2xl" style={{ fontFamily: "var(--font-head)", color: "#1A2E1C" }}>Profile</h1>
        <p className="text-sm mt-0.5" style={{ color: "#7A9878" }}>Your account information</p>
      </div>

      {saved && (
        <div className="mb-4 px-4 py-3 rounded-xl text-sm font-medium" style={{ background: "#EEF5EE", color: "#2A5230", border: "1px solid #C8DEC8" }}>
          Profile updated successfully.
        </div>
      )}
      {error === "name-required" && (
        <div className="mb-4 px-4 py-3 rounded-xl text-sm font-medium" style={{ background: "#FFF0F0", color: "#AA2222", border: "1px solid #FFCCCC" }}>
          Name cannot be empty.
        </div>
      )}

      <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", border: "1.5px solid #E8EDE6" }}>
        {/* Avatar header */}
        <div className="px-6 py-8 flex items-center gap-5" style={{ borderBottom: "1px solid #EEF5EE" }}>
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-extrabold shrink-0"
            style={{ background: "#DDE8DA", color: "#2A5230", fontFamily: "var(--font-head)" }}
          >
            {initial}
          </div>
          <div>
            <div className="font-bold text-lg" style={{ color: "#1A2E1C" }}>{profile?.full_name ?? "—"}</div>
            <div className="text-sm" style={{ color: "#7A9878" }}>{user.email}</div>
            <div className="text-xs mt-1 capitalize" style={{ color: "#9AB89E" }}>{(profile?.role ?? "learner").replace(/_/g, " ")}</div>
          </div>
        </div>

        {/* Edit form */}
        <form action={updateProfile} className="px-6 py-5 space-y-4">
          <div>
            <label htmlFor="full_name" className="text-xs font-bold uppercase tracking-wide block mb-1" style={{ color: "#9AB89E" }}>
              Full Name
            </label>
            <input
              id="full_name"
              name="full_name"
              type="text"
              required
              defaultValue={profile?.full_name ?? ""}
              placeholder="Your full name"
              className="w-full px-4 py-2.5 text-sm rounded-xl border outline-none focus:ring-2"
              style={{ borderColor: "#DDE8DA", background: "#FAFCFA", color: "#1A2E1C" }}
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wide block mb-1" style={{ color: "#9AB89E" }}>Email</label>
            <div className="px-4 py-2.5 text-sm rounded-xl" style={{ background: "#F5F5F5", color: "#888", border: "1px solid #E8EDE6" }}>
              {user.email}
            </div>
            <p className="text-xs mt-1" style={{ color: "#C8C8C8" }}>Email cannot be changed here. Contact support.</p>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wide block mb-1" style={{ color: "#9AB89E" }}>Member Since</label>
            <div className="px-4 py-2.5 text-sm rounded-xl" style={{ background: "#F5F5F5", color: "#888", border: "1px solid #E8EDE6" }}>
              {profile?.created_at
                ? new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
                : "—"}
            </div>
          </div>

          <div className="pt-1">
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 text-sm font-bold rounded-xl"
              style={{ background: "#2A5230", color: "#fff" }}
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
