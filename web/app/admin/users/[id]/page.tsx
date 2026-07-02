import { notFound } from "next/navigation";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import NotesTab from "./NotesTab";
import { addNote, deleteNote, updateUserRole } from "./actions";

type Tab = "overview" | "courses" | "tickets" | "billing" | "notes";

const ROLE_META: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  platform_admin: { label: "Platform Admin", bg: "#EEE8FF", text: "#5A3FA0", dot: "#7B5EA7" },
  content_admin:  { label: "Content Admin",  bg: "#E8F5EE", text: "#2A5230", dot: "#4A8A52" },
  group_admin:    { label: "Group Admin",    bg: "#FFF3DC", text: "#8A6020", dot: "#C48A3A" },
  group_learner:  { label: "Group Learner",  bg: "#E8F2FF", text: "#1A4A8A", dot: "#3A7AC8" },
  learner:        { label: "Learner",        bg: "#F3F3F3", text: "#555",    dot: "#999"    },
};

const ORDER_STATUS_META: Record<string, { bg: string; text: string }> = {
  paid:      { bg: "#EEF5EE", text: "#2A5230" },
  pending:   { bg: "#FFF3DC", text: "#8A6020" },
  failed:    { bg: "#FFF0F0", text: "#AA2222" },
  refunded:  { bg: "#F3F3F3", text: "#666"    },
  cancelled: { bg: "#F3F3F3", text: "#666"    },
};

const TICKET_STATUS_META: Record<string, { bg: string; text: string }> = {
  open:        { bg: "#FFF0F0", text: "#AA2222" },
  in_progress: { bg: "#FFF3DC", text: "#8A6020" },
  resolved:    { bg: "#EEF5EE", text: "#2A5230" },
  closed:      { bg: "#F3F3F3", text: "#666"    },
};

export default async function UserDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string; error?: string }>;
}) {
  const { id } = await params;
  const { tab: tabParam, error } = await searchParams;
  const tab: Tab = (["overview", "courses", "tickets", "billing", "notes"] as Tab[]).includes(tabParam as Tab)
    ? (tabParam as Tab)
    : "overview";

  const db = createAdminClient();

  const { data: authUser } = await db.auth.admin.getUserById(id);
  if (!authUser?.user) notFound();

  const { data: profile } = await db
    .from("profiles")
    .select("full_name, role, avatar_url, created_at")
    .eq("id", id)
    .single();

  const [
    { count: enrollCount },
    { count: ticketCount },
    { count: orderCount },
    { count: noteCount },
    { data: orgMembership },
  ] = await Promise.all([
    db.from("enrollments").select("*", { count: "exact", head: true }).eq("user_id", id),
    db.from("support_tickets").select("*", { count: "exact", head: true }).eq("user_id", id),
    db.from("orders").select("*", { count: "exact", head: true }).eq("user_id", id),
    db.from("user_notes").select("*", { count: "exact", head: true }).eq("user_id", id),
    db.from("organization_memberships")
      .select("role, status, organizations:organization_id(name, slug)")
      .eq("user_id", id)
      .maybeSingle(),
  ]);

  let enrollments: Array<{ id: string; status: string; enrolled_at: string | null; completed_at: string | null; source: string | null; courses: { title?: string; slug?: string } | null }> = [];
  let certificates: Array<{ id: string; certificate_number: string; issued_at: string; courses: { title?: string } | null }> = [];
  let tickets: Array<{ id: string; subject: string; status: string; priority: string; created_at: string }> = [];
  let orders: Array<{ id: string; status: string; total_cents: number; created_at: string; order_items: Array<{ courses: { title?: string } | null; bundles: { title?: string } | null }> }> = [];
  let notes: Array<{ id: string; note: string; created_at: string; author: { full_name?: string; email?: string } | null }> = [];

  if (tab === "courses" || tab === "overview") {
    const { data } = await db
      .from("enrollments")
      .select("id, status, enrolled_at, completed_at, source, courses:course_id(title, slug)")
      .eq("user_id", id)
      .order("enrolled_at", { ascending: false })
      .limit(tab === "overview" ? 5 : 100);
    enrollments = (data ?? []) as typeof enrollments;

    const { data: certData } = await db
      .from("certificates")
      .select("id, certificate_number, issued_at, courses:course_id(title)")
      .eq("user_id", id)
      .order("issued_at", { ascending: false });
    certificates = (certData ?? []) as typeof certificates;
  }

  if (tab === "tickets" || tab === "overview") {
    const { data } = await db
      .from("support_tickets")
      .select("id, subject, status, priority, created_at")
      .eq("user_id", id)
      .order("created_at", { ascending: false })
      .limit(tab === "overview" ? 5 : 100);
    tickets = data ?? [];
  }

  if (tab === "billing" || tab === "overview") {
    const { data } = await db
      .from("orders")
      .select("id, status, total_cents, created_at, order_items(courses:course_id(title), bundles:bundle_id(title))")
      .eq("user_id", id)
      .order("created_at", { ascending: false })
      .limit(tab === "overview" ? 5 : 100);
    orders = (data ?? []) as typeof orders;
  }

  if (tab === "notes") {
    const { data } = await db
      .from("user_notes")
      .select("id, note, created_at, author:author_id(full_name, email)")
      .eq("user_id", id)
      .order("created_at", { ascending: false });
    notes = (data ?? []) as typeof notes;
  }

  const email = authUser.user.email ?? "";
  const fullName = profile?.full_name ?? (authUser.user.user_metadata?.full_name as string | undefined) ?? null;
  const role = profile?.role ?? "learner";
  const meta = ROLE_META[role] ?? ROLE_META.learner;
  const confirmed = !!authUser.user.email_confirmed_at;
  const initials = (fullName ?? email).split(/[\s@]/).map((w: string) => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
  const org = orgMembership?.organizations as unknown as { name?: string; slug?: string } | null;

  const TABS: { id: Tab; label: string; count?: number }[] = [
    { id: "overview", label: "Overview" },
    { id: "courses",  label: "Courses",  count: enrollCount ?? 0 },
    { id: "tickets",  label: "Tickets",  count: ticketCount ?? 0 },
    { id: "billing",  label: "Billing",  count: orderCount ?? 0 },
    { id: "notes",    label: "Notes",    count: noteCount ?? 0 },
  ];

  return (
    <div className="p-4 md:p-8 max-w-5xl">
      <div className="mb-5 flex items-center gap-2 text-sm" style={{ color: "var(--admin-text-muted)" }}>
        <Link href="/admin/users" className="hover:text-[#2A5230] transition-colors">← Users</Link>
        <span>/</span>
        <span style={{ color: "var(--admin-accent)" }}>{fullName || email}</span>
      </div>

      {error && (
        <div className="mb-5 px-4 py-3 rounded-xl text-sm font-medium" style={{ background: "#FFF0F0", color: "#AA2222", border: "1px solid #FFCCCC" }}>
          {decodeURIComponent(error)}
        </div>
      )}

      {/* Header card */}
      <div className="rounded-2xl p-5 mb-6 flex flex-wrap items-center gap-4" style={{ background: "var(--admin-card-bg)", border: "1.5px solid var(--admin-border)" }}>
        <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-extrabold shrink-0" style={{ background: "#EEF5EE", color: "#2A5230" }}>
          {initials}
        </div>
        <div className="flex-1 min-w-[200px]">
          <div className="flex items-center gap-2">
            <h1 className="font-extrabold text-xl" style={{ fontFamily: "var(--font-head)", color: "var(--admin-text-primary)" }}>
              {fullName || "No name"}
            </h1>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: confirmed ? "#EEF5EE" : "#FFF8E8", color: confirmed ? "#2A5230" : "#8A6020" }}>
              {confirmed ? "Confirmed" : "Pending"}
            </span>
          </div>
          <div className="text-sm mt-0.5" style={{ color: "var(--admin-text-muted)" }}>{email}</div>
          <div className="flex items-center gap-3 mt-2 text-xs" style={{ color: "var(--admin-text-dim)" }}>
            <span className="inline-flex items-center gap-1.5 font-bold px-2.5 py-0.5 rounded-full" style={{ background: meta.bg, color: meta.text }}>
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: meta.dot }} />
              {meta.label}
            </span>
            {org && (
              <span>
                Org: <span style={{ color: "var(--admin-text-muted)" }}>{org.name}</span> ({orgMembership?.role})
              </span>
            )}
            <span>Joined {authUser.user.created_at ? new Date(authUser.user.created_at).toLocaleDateString() : "—"}</span>
            {authUser.user.last_sign_in_at && (
              <span>Last sign-in {new Date(authUser.user.last_sign_in_at).toLocaleDateString()}</span>
            )}
          </div>
        </div>

        <form action={updateUserRole} className="flex items-center gap-2">
          <input type="hidden" name="userId" value={id} />
          <select
            name="role"
            defaultValue={role}
            className="px-2.5 py-1.5 text-xs rounded-lg border outline-none"
            style={{ borderColor: "var(--admin-border-mid)", background: "var(--admin-table-head-bg)", color: "var(--admin-text-primary)" }}
          >
            <option value="learner">Learner</option>
            <option value="group_learner">Group Learner</option>
            <option value="group_admin">Group Admin</option>
            <option value="content_admin">Content Admin</option>
            <option value="platform_admin">Platform Admin</option>
          </select>
          <button type="submit" className="px-3 py-1.5 text-xs font-bold rounded-lg" style={{ background: "#EEF5EE", color: "#2A5230" }}>
            Save Role
          </button>
        </form>
      </div>

      {/* Tab nav */}
      <div className="flex items-center gap-1 mb-6 overflow-x-auto" style={{ borderBottom: "1.5px solid var(--admin-border)" }}>
        {TABS.map((t) => (
          <Link
            key={t.id}
            href={`/admin/users/${id}?tab=${t.id}`}
            className="px-4 py-2.5 text-sm font-bold transition-colors whitespace-nowrap"
            style={{
              color: tab === t.id ? "var(--admin-accent)" : "var(--admin-text-muted)",
              borderBottom: tab === t.id ? "2px solid var(--admin-accent)" : "2px solid transparent",
              marginBottom: "-1.5px",
            }}
          >
            {t.label}
            {typeof t.count === "number" && <span className="ml-1.5 opacity-60">{t.count}</span>}
          </Link>
        ))}
      </div>

      {/* Overview */}
      {tab === "overview" && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Courses",      value: enrollCount ?? 0, href: "courses" },
              { label: "Certificates", value: certificates.length, href: "courses" },
              { label: "Tickets",      value: ticketCount ?? 0, href: "tickets" },
              { label: "Orders",       value: orderCount ?? 0, href: "billing" },
            ].map((s) => (
              <Link key={s.label} href={`/admin/users/${id}?tab=${s.href}`} className="rounded-xl p-4 transition-all hover:-translate-y-0.5" style={{ background: "var(--admin-card-bg)", border: "1.5px solid var(--admin-border)" }}>
                <div className="text-2xl font-extrabold" style={{ fontFamily: "var(--font-head)", color: "var(--admin-accent)" }}>{s.value}</div>
                <div className="text-xs font-semibold mt-1" style={{ color: "var(--admin-text-muted)" }}>{s.label}</div>
              </Link>
            ))}
          </div>

          <div className="rounded-2xl overflow-hidden" style={{ background: "var(--admin-card-bg)", border: "1.5px solid var(--admin-border)" }}>
            <div className="px-5 py-3 font-bold text-sm" style={{ borderBottom: "1px solid var(--admin-border)", color: "var(--admin-text-primary)" }}>Recent Enrollments</div>
            {enrollments.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm" style={{ color: "var(--admin-text-dim)" }}>No enrollments yet.</div>
            ) : (
              <div className="divide-y" style={{ borderColor: "var(--admin-table-row-border)" }}>
                {enrollments.map((e) => (
                  <div key={e.id} className="px-5 py-3 flex items-center justify-between text-sm">
                    <span style={{ color: "var(--admin-text-primary)" }}>{e.courses?.title ?? "—"}</span>
                    <span className="text-xs capitalize" style={{ color: "var(--admin-text-dim)" }}>{e.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl overflow-hidden" style={{ background: "var(--admin-card-bg)", border: "1.5px solid var(--admin-border)" }}>
            <div className="px-5 py-3 font-bold text-sm" style={{ borderBottom: "1px solid var(--admin-border)", color: "var(--admin-text-primary)" }}>Recent Tickets</div>
            {tickets.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm" style={{ color: "var(--admin-text-dim)" }}>No support tickets.</div>
            ) : (
              <div className="divide-y" style={{ borderColor: "var(--admin-table-row-border)" }}>
                {tickets.map((t) => {
                  const tm = TICKET_STATUS_META[t.status] ?? TICKET_STATUS_META.open;
                  return (
                    <Link key={t.id} href={`/admin/support/${t.id}`} className="px-5 py-3 flex items-center justify-between text-sm hover:bg-[#FAFCFA] transition-colors">
                      <span style={{ color: "var(--admin-text-primary)" }}>{t.subject}</span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full capitalize" style={{ background: tm.bg, color: tm.text }}>{t.status.replace("_", " ")}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Courses */}
      {tab === "courses" && (
        <div className="space-y-5">
          <div className="rounded-2xl overflow-hidden" style={{ background: "var(--admin-card-bg)", border: "1.5px solid var(--admin-border)" }}>
            <div className="px-5 py-3 font-bold text-sm" style={{ borderBottom: "1px solid var(--admin-border)", color: "var(--admin-text-primary)" }}>Enrollments</div>
            {enrollments.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm" style={{ color: "var(--admin-text-dim)" }}>No enrollments yet.</div>
            ) : (
              <div className="divide-y" style={{ borderColor: "var(--admin-table-row-border)" }}>
                {enrollments.map((e) => (
                  <div key={e.id} className="px-5 py-3 flex items-center justify-between text-sm">
                    <div>
                      <div style={{ color: "var(--admin-text-primary)" }}>{e.courses?.title ?? "—"}</div>
                      <div className="text-xs mt-0.5" style={{ color: "var(--admin-text-dim)" }}>
                        Enrolled {e.enrolled_at ? new Date(e.enrolled_at).toLocaleDateString() : "—"} · {e.source ?? "—"}
                        {e.completed_at && ` · Completed ${new Date(e.completed_at).toLocaleDateString()}`}
                      </div>
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full capitalize" style={{ background: "#EEF5EE", color: "#2A5230" }}>{e.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl overflow-hidden" style={{ background: "var(--admin-card-bg)", border: "1.5px solid var(--admin-border)" }}>
            <div className="px-5 py-3 font-bold text-sm" style={{ borderBottom: "1px solid var(--admin-border)", color: "var(--admin-text-primary)" }}>Certificates</div>
            {certificates.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm" style={{ color: "var(--admin-text-dim)" }}>No certificates issued.</div>
            ) : (
              <div className="divide-y" style={{ borderColor: "var(--admin-table-row-border)" }}>
                {certificates.map((c) => (
                  <Link key={c.id} href={`/dashboard/certificates/${c.id}`} target="_blank" className="px-5 py-3 flex items-center justify-between text-sm hover:bg-[#FAFCFA] transition-colors">
                    <span style={{ color: "var(--admin-text-primary)" }}>{c.courses?.title ?? "—"}</span>
                    <span className="text-xs font-mono" style={{ color: "var(--admin-text-dim)" }}>{c.certificate_number}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tickets */}
      {tab === "tickets" && (
        <div className="rounded-2xl overflow-hidden" style={{ background: "var(--admin-card-bg)", border: "1.5px solid var(--admin-border)" }}>
          {tickets.length === 0 ? (
            <div className="px-5 py-12 text-center text-sm" style={{ color: "var(--admin-text-dim)" }}>No support tickets.</div>
          ) : (
            <div className="divide-y" style={{ borderColor: "var(--admin-table-row-border)" }}>
              {tickets.map((t) => {
                const tm = TICKET_STATUS_META[t.status] ?? TICKET_STATUS_META.open;
                return (
                  <Link key={t.id} href={`/admin/support/${t.id}`} className="px-5 py-3 flex items-center justify-between text-sm hover:bg-[#FAFCFA] transition-colors">
                    <div>
                      <div style={{ color: "var(--admin-text-primary)" }}>{t.subject}</div>
                      <div className="text-xs mt-0.5 capitalize" style={{ color: "var(--admin-text-dim)" }}>{t.priority} priority · {new Date(t.created_at).toLocaleDateString()}</div>
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full capitalize" style={{ background: tm.bg, color: tm.text }}>{t.status.replace("_", " ")}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Billing */}
      {tab === "billing" && (
        <div className="rounded-2xl overflow-hidden" style={{ background: "var(--admin-card-bg)", border: "1.5px solid var(--admin-border)" }}>
          {orders.length === 0 ? (
            <div className="px-5 py-12 text-center text-sm" style={{ color: "var(--admin-text-dim)" }}>
              No orders yet. RaeLearn doesn&apos;t have a recurring subscription model — this shows one-time course/bundle purchases.
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: "var(--admin-table-row-border)" }}>
              {orders.map((o) => {
                const om = ORDER_STATUS_META[o.status] ?? ORDER_STATUS_META.pending;
                const items = (o.order_items ?? []).map((it) => it.courses?.title || it.bundles?.title).filter(Boolean).join(", ");
                return (
                  <div key={o.id} className="px-5 py-3 flex items-center justify-between text-sm">
                    <div>
                      <div style={{ color: "var(--admin-text-primary)" }}>{items || "—"}</div>
                      <div className="text-xs mt-0.5" style={{ color: "var(--admin-text-dim)" }}>{new Date(o.created_at).toLocaleDateString()}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold" style={{ color: "var(--admin-text-primary)" }}>${(o.total_cents / 100).toFixed(2)}</span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full capitalize" style={{ background: om.bg, color: om.text }}>{o.status}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Notes */}
      {tab === "notes" && (
        <NotesTab userId={id} notes={notes} addNote={addNote} deleteNote={deleteNote} />
      )}
    </div>
  );
}
