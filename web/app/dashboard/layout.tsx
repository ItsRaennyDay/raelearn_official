import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardShell from "./DashboardShell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  const { count: enrolledCount } = await supabase
    .from("enrollments")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("status", "active");

  const { count: certCount } = await supabase
    .from("certificates")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const firstName = profile?.full_name?.split(" ")[0] ?? user.email?.split("@")[0] ?? "there";
  const role = profile?.role ?? "learner";
  const isAdmin = user.email?.toLowerCase() === (process.env.ADMIN_EMAIL ?? "rae2xyz@gmail.com").toLowerCase();

  return (
    <DashboardShell
      firstName={firstName}
      email={user.email ?? ""}
      role={role}
      isAdmin={isAdmin}
      enrolledCount={enrolledCount ?? 0}
      certCount={certCount ?? 0}
    >
      {children}
    </DashboardShell>
  );
}
