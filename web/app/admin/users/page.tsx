import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import Link from "next/link";
import DeleteUserButton from "./DeleteUserButton";
import { logAction } from "@/lib/audit";

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL ?? "rae2xyz@gmail.com").toLowerCase();

async function verifyAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email?.toLowerCase() !== ADMIN_EMAIL) throw new Error("Unauthorized");
}

async function inviteUser(formData: FormData) {
  "use server";
  const actor = await verifyAdmin();
  const email = (formData.get("email") as string ?? "").trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    redirect("/admin/users?error=invalid-email");
  }
  const db = createAdminClient();
  const { error } = await db.auth.admin.inviteUserByEmail(email);
  if (error) redirect(`/admin/users?error=${encodeURIComponent(error.message)}`);
  await logAction({ actorId: actor.id, action: "invite", tableName: "auth.users", newValues: { email } });
  redirect("/admin/users?invited=1");
}

async function updateRole(formData: FormData) {
  "use server";
  const actor = await verifyAdmin();
  const userId = formData.get("userId") as string;
  const role = formData.get("role") as string;
  const allowed = ["learner", "group_learner", "group_admin", "content_admin", "platform_admin"];
  if (!userId || !allowed.includes(role)) redirect("/admin/users?error=invalid-role");
  const db = createAdminClient();
  const { data: old } = await db.from("profiles").select("role").eq("id", userId).single();
  await db.from("profiles").upsert({ id: userId, role }, { onConflict: "id" });
  await logAction({ actorId: actor.id, action: "role_change", tableName: "profiles", recordId: userId, oldValues: old ?? undefined, newValues: { role } });
  revalidatePath("/admin/users");
}

async function deleteUser(formData: FormData) {
  "use server";
  const actor = await verifyAdmin();
  const userId = formData.get("userId") as string;
  if (!userId) return;
  const db = createAdminClient();
  const { data: old } = await db.from("profiles").select("email, role, full_name").eq("id", userId).single();
  await logAction({ actorId: actor.id, action: "delete", tableName: "auth.users", recordId: userId, oldValues: old ?? undefined });
  await db.from("profiles").delete().eq("id", userId);
  await db.auth.admin.deleteUser(userId);
  revalidatePath("/admin/users");
  redirect("/admin/users?deleted=1");
}

const ROLE_META: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  platform_admin: { label: "Platform Admin", bg: "#EEE8FF", text: "#5A3FA0", dot: "#7B5EA7" },
  content_admin:  { label: "Content Admin",  bg: "#E8F5EE", text: "#2A5230", dot: "#4A8A52" },
  group_admin:    { label: "Group Admin",    bg: "#FFF3DC", text: "#8A6020", dot: "#C48A3A" },
  group_learner:  { label: "Group Learner",  bg: "#E8F2FF", text: "#1A4A8A", dot: "#3A7AC8" },
  learner:        { label: "Learner",        bg: "#F3F3F3", text: "#555",    dot: "#999"    },
};

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; role?: string; page?: string; invited?: string; deleted?: string; error?: string }>;
}) {
  const { q = "", role = "", page = "1", invited, deleted, error } = await searchParams;
  const db = createAdminClient();

  // Fetch ALL users directly from Supabase Auth — no profile row required
  const { data: { users: authUsers } } = await db.auth.admin.listUsers({
    page: Number(page),
    perPage: 50,
  });

  // Fetch all profiles to get roles
  const userIds = (authUsers ?? []).map((u) => u.id);
  const { data: profiles } = userIds.length
    ? await db.from("profiles").select("id, full_name, role").in("id", userIds)
    : { data: [] };

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

  // Merge auth users with profile data
  let merged = (authUsers ?? []).map((u) => ({
    id:        u.id,
    email:     u.email ?? "",
    full_name: profileMap.get(u.id)?.full_name ?? u.user_metadata?.full_name ?? null,
    role:      profileMap.get(u.id)?.role ?? "learner",
    created_at: u.created_at,
    confirmed:  !!u.email_confirmed_at,
    last_sign_in: u.last_sign_in_at,
  }));

  // Client-side filter (auth.admin.listUsers doesn't support server-side search easily)
  if (q) {
    const search = q.toLowerCase();
    merged = merged.filter(
      (u) =>
        u.email.toLowerCase().includes(search) ||
        (u.full_name ?? "").toLowerCase().includes(search)
    );
  }
  if (role) {
    merged = merged.filter((u) => u.role === role);
  }

  const ERROR_MESSAGES: Record<string, string> = {
    "invalid-email": "Please enter a valid email address.",
    "invalid-role":  "Invalid role selection.",
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-extrabold text-2xl" style={{ fontFamily: "var(--font-head)", color: "#1A2E1C" }}>Users</h1>
          <p className="text-sm mt-0.5" style={{ color: "#7A9878" }}>{merged.length} accounts shown</p>
        </div>
      </div>

      {/* Feedback banners */}
      {invited && (
        <div className="mb-4 px-4 py-3 rounded-xl text-sm font-medium" style={{ background: "#EEF5EE", color: "#2A5230", border: "1px solid #C8DEC8" }}>
          Invitation email sent successfully.
        </div>
      )}
      {deleted && (
        <div className="mb-4 px-4 py-3 rounded-xl text-sm font-medium" style={{ background: "#EEF5EE", color: "#2A5230", border: "1px solid #C8DEC8" }}>
          User deleted successfully.
        </div>
      )}
      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl text-sm font-medium" style={{ background: "#FFF0F0", color: "#AA2222", border: "1px solid #FFCCCC" }}>
          {ERROR_MESSAGES[error] ?? decodeURIComponent(error)}
        </div>
      )}

      {/* Invite user panel */}
      <div className="mb-6 rounded-2xl p-5" style={{ background: "#fff", border: "1.5px solid #E8EDE6" }}>
        <h2 className="font-bold text-sm mb-3" style={{ color: "#2A5230" }}>Invite New User</h2>
        <form action={inviteUser} className="flex gap-3">
          <input
            name="email"
            type="email"
            required
            placeholder="user@example.com"
            className="flex-1 max-w-sm px-4 py-2 text-sm rounded-xl border outline-none"
            style={{ borderColor: "#DDE8DA", background: "#FAFCFA", color: "#1A2E1C" }}
          />
          <button
            type="submit"
            className="px-5 py-2 text-sm font-bold rounded-xl"
            style={{ background: "#2A5230", color: "#fff" }}
          >
            Send Invite
          </button>
        </form>
        <p className="text-xs mt-2" style={{ color: "#9AB89E" }}>
          Sends a magic-link email. User defaults to &quot;Learner&quot; — change role below after they sign up.
        </p>
      </div>

      {/* Filters */}
      <form method="GET" className="flex flex-wrap gap-3 mb-4">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search name or email…"
          className="flex-1 max-w-sm px-4 py-2 text-sm rounded-xl border outline-none"
          style={{ borderColor: "#DDE8DA", background: "#fff", color: "#1A2E1C" }}
        />
        <select
          name="role"
          defaultValue={role}
          className="px-3 py-2 text-sm rounded-xl border outline-none"
          style={{ borderColor: "#DDE8DA", background: "#fff", color: "#1A2E1C" }}
        >
          <option value="">All roles</option>
          <option value="learner">Learner</option>
          <option value="group_learner">Group Learner</option>
          <option value="group_admin">Group Admin</option>
          <option value="content_admin">Content Admin</option>
          <option value="platform_admin">Platform Admin</option>
        </select>
        <button type="submit" className="px-4 py-2 text-sm font-bold rounded-xl" style={{ background: "#2A5230", color: "#fff" }}>
          Search
        </button>
        {(q || role) && (
          <Link href="/admin/users" className="px-4 py-2 text-sm rounded-xl" style={{ background: "#F5F0E8", color: "#7A9878" }}>
            Clear
          </Link>
        )}
      </form>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl" style={{ border: "1.5px solid #E8EDE6" }}>
      <div style={{ background: "#fff", minWidth: "700px" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid #F0F7F0", background: "#FAFCFA" }}>
              <th className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: "#7A9878" }}>User</th>
              <th className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: "#7A9878" }}>Status</th>
              <th className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: "#7A9878" }}>Role</th>
              <th className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: "#7A9878" }}>Change Role</th>
              <th className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: "#7A9878" }}>Joined</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {merged.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-sm" style={{ color: "#9AB89E" }}>No users found</td>
              </tr>
            ) : (
              merged.map((u) => {
                const meta = ROLE_META[u.role] ?? ROLE_META.learner;
                const isMe = u.email.toLowerCase() === ADMIN_EMAIL;
                const initials = (u.full_name ?? u.email)
                  .split(/[\s@]/).map((n: string) => n[0]).slice(0, 2).join("").toUpperCase();

                return (
                  <tr
                    key={u.id}
                    className="transition-colors hover:bg-[#FAFCFA]"
                    style={{
                      borderBottom: "1px solid #F5FAF5",
                      background: isMe ? "#FAFFF8" : undefined,
                    }}
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                          style={{ background: isMe ? "#2A5230" : "#EEF5EE", color: isMe ? "#A8D4AC" : "#2A5230" }}
                        >
                          {initials}
                        </div>
                        <div>
                          <div className="font-medium flex items-center gap-1.5" style={{ color: "#1A2E1C" }}>
                            {u.full_name ?? <span style={{ color: "#9AB89E" }}>No name</span>}
                            {isMe && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "#2A5230", color: "#A8D4AC" }}>
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-xs mt-0.5" style={{ color: "#9AB89E" }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{
                          background: u.confirmed ? "#EEF5EE" : "#FFF8E8",
                          color: u.confirmed ? "#2A5230" : "#8A6020",
                        }}
                      >
                        {u.confirmed ? "Confirmed" : "Pending"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full" style={{ background: meta.bg, color: meta.text }}>
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: meta.dot }} />
                        {meta.label}
                      </span>
                    </td>
                    <td className="px-5 py-2.5">
                      <form action={updateRole} className="flex items-center gap-2">
                        <input type="hidden" name="userId" value={u.id} />
                        <select
                          name="role"
                          defaultValue={u.role}
                          className="px-2.5 py-1.5 text-xs rounded-lg border outline-none"
                          style={{ borderColor: "#DDE8DA", background: "#FAFCFA", color: "#1A2E1C" }}
                        >
                          <option value="learner">Learner</option>
                          <option value="group_learner">Group Learner</option>
                          <option value="group_admin">Group Admin</option>
                          <option value="content_admin">Content Admin</option>
                          <option value="platform_admin">Platform Admin</option>
                        </select>
                        <button
                          type="submit"
                          className="px-3 py-1.5 text-xs font-bold rounded-lg"
                          style={{ background: "#EEF5EE", color: "#2A5230" }}
                        >
                          Save
                        </button>
                      </form>
                    </td>
                    <td className="px-5 py-3 text-xs" style={{ color: "#9AB89E" }}>
                      <div>{u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}</div>
                      {u.last_sign_in && (
                        <div className="mt-0.5" style={{ color: "#C8DEC8" }}>
                          Last: {new Date(u.last_sign_in).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      {!isMe && (
                        <DeleteUserButton
                          userId={u.id}
                          email={u.email}
                          action={deleteUser}
                        />
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      </div>

      {/* Pagination — auth.admin.listUsers is paginated server-side */}
      <div className="flex items-center justify-between mt-4">
        <span className="text-xs" style={{ color: "#9AB89E" }}>
          Showing page {page} · {merged.length} users
        </span>
        <div className="flex gap-2">
          {Number(page) > 1 && (
            <Link href={`/admin/users?q=${q}&role=${role}&page=${Number(page) - 1}`} className="px-3 py-1.5 text-xs rounded-lg" style={{ background: "#fff", border: "1px solid #DDE8DA", color: "#2A5230" }}>← Prev</Link>
          )}
          {(authUsers ?? []).length === 50 && (
            <Link href={`/admin/users?q=${q}&role=${role}&page=${Number(page) + 1}`} className="px-3 py-1.5 text-xs rounded-lg" style={{ background: "#fff", border: "1px solid #DDE8DA", color: "#2A5230" }}>Next →</Link>
          )}
        </div>
      </div>
    </div>
  );
}
