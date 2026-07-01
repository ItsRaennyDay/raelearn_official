import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PasswordForm from "./PasswordForm";
import PrefsForm from "./PrefsForm";
import AccessibilityForm from "./AccessibilityForm";

const PW_ERRORS: Record<string, string> = {
  "too-short": "Password must be at least 8 characters.",
  "mismatch": "Passwords do not match.",
  "wrong-current": "Current password is incorrect.",
  "failed": "Failed to update password. Please try again.",
};

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ pwSaved?: string; pwError?: string; prefsSaved?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  const { pwSaved, pwError, prefsSaved } = await searchParams;

  const { data: profile } = await supabase
    .from("profiles")
    .select("preferences")
    .eq("id", user.id)
    .single();

  const raw = profile?.preferences as Record<string, boolean> | null;
  const prefs = {
    email_enrollment: raw?.email_enrollment ?? true,
    email_updates: raw?.email_updates ?? true,
    email_support: raw?.email_support ?? true,
  };

  return (
    <div className="max-w-xl">
      <div className="mb-6">
        <h1 className="font-extrabold text-2xl" style={{ fontFamily: "var(--font-head)", color: "#1A2E1C" }}>Settings</h1>
        <p className="text-sm mt-0.5" style={{ color: "#7A9878" }}>Password, notifications, and preferences</p>
      </div>

      <div className="space-y-4">
        {/* Change Password */}
        <section className="rounded-2xl p-5" style={{ background: "#fff", border: "1.5px solid #E8EDE6" }}>
          <h2 className="font-bold text-sm" style={{ color: "#1A2E1C" }}>Change Password</h2>
          <p className="text-xs mt-0.5" style={{ color: "#9AB89E" }}>Update your login password</p>
          {pwSaved && (
            <div className="mt-3 px-4 py-2.5 rounded-xl text-sm" style={{ background: "#EEF5EE", color: "#2A5230", border: "1px solid #C8DEC8" }}>
              Password updated successfully.
            </div>
          )}
          {pwError && (
            <div className="mt-3 px-4 py-2.5 rounded-xl text-sm" style={{ background: "#FFF0F0", color: "#AA2222", border: "1px solid #FFCCCC" }}>
              {PW_ERRORS[pwError] ?? "Something went wrong."}
            </div>
          )}
          <PasswordForm />
        </section>

        {/* Email Preferences */}
        <section className="rounded-2xl p-5" style={{ background: "#fff", border: "1.5px solid #E8EDE6" }}>
          <h2 className="font-bold text-sm" style={{ color: "#1A2E1C" }}>Email Preferences</h2>
          <p className="text-xs mt-0.5" style={{ color: "#9AB89E" }}>Control which emails you receive</p>
          {prefsSaved && (
            <div className="mt-3 px-4 py-2.5 rounded-xl text-sm" style={{ background: "#EEF5EE", color: "#2A5230", border: "1px solid #C8DEC8" }}>
              Preferences saved.
            </div>
          )}
          <PrefsForm prefs={prefs} />
        </section>

        {/* Accessibility */}
        <section className="rounded-2xl p-5" style={{ background: "#fff", border: "1.5px solid #E8EDE6" }}>
          <h2 className="font-bold text-sm" style={{ color: "#1A2E1C" }}>Accessibility</h2>
          <p className="text-xs mt-0.5" style={{ color: "#9AB89E" }}>Font size, contrast, and motion settings</p>
          <AccessibilityForm />
        </section>

        {/* Privacy */}
        <section className="rounded-2xl p-5" style={{ background: "#fff", border: "1.5px solid #E8EDE6" }}>
          <h2 className="font-bold text-sm" style={{ color: "#1A2E1C" }}>Privacy & Data</h2>
          <p className="text-xs mt-0.5" style={{ color: "#9AB89E" }}>Your data is stored securely and never sold to third parties.</p>
          <div className="mt-4 space-y-0.5">
            {[
              { label: "Data storage", value: "Secure cloud (Supabase)" },
              { label: "Retention", value: "Account data kept while active" },
              { label: "Delete account", value: "Contact support to request deletion" },
            ].map((row) => (
              <div
                key={row.label}
                className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-0.5 sm:gap-4 py-2.5 text-sm"
                style={{ borderBottom: "1px solid #F0F7F0" }}
              >
                <span style={{ color: "#7A9878" }}>{row.label}</span>
                <span className="font-medium text-xs sm:text-sm" style={{ color: "#1A2E1C" }}>{row.value}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
