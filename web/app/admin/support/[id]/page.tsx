import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { logAction } from "@/lib/audit";

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL ?? "rae2xyz@gmail.com").toLowerCase();

async function verifyAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email?.toLowerCase() !== ADMIN_EMAIL) throw new Error("Unauthorized");
  return user;
}

async function updateStatus(formData: FormData) {
  "use server";
  const actor = await verifyAdmin();
  const id     = formData.get("id") as string;
  const status = formData.get("status") as string;
  const allowed = ["open", "in_progress", "resolved", "closed"];
  if (!id || !allowed.includes(status)) return;
  const db = createAdminClient();
  const resolved_at = status === "resolved" ? new Date().toISOString() : null;
  await db.from("support_tickets").update({ status, resolved_at, updated_at: new Date().toISOString() }).eq("id", id);
  await logAction({ actorId: actor.id, action: "update", tableName: "support_tickets", recordId: id, newValues: { status } });
  revalidatePath(`/admin/support/${id}`);
}

async function updatePriority(formData: FormData) {
  "use server";
  const actor    = await verifyAdmin();
  const id       = formData.get("id") as string;
  const priority = formData.get("priority") as string;
  const allowed  = ["low", "normal", "high", "urgent"];
  if (!id || !allowed.includes(priority)) return;
  const db = createAdminClient();
  await db.from("support_tickets").update({ priority, updated_at: new Date().toISOString() }).eq("id", id);
  await logAction({ actorId: actor.id, action: "update", tableName: "support_tickets", recordId: id, newValues: { priority } });
  revalidatePath(`/admin/support/${id}`);
}

async function saveNotes(formData: FormData) {
  "use server";
  const actor       = await verifyAdmin();
  const id          = formData.get("id") as string;
  const admin_notes = formData.get("admin_notes") as string;
  if (!id) return;
  const db = createAdminClient();
  await db.from("support_tickets").update({ admin_notes, updated_at: new Date().toISOString() }).eq("id", id);
  await logAction({ actorId: actor.id, action: "update", tableName: "support_tickets", recordId: id, newValues: { admin_notes } });
  revalidatePath(`/admin/support/${id}`);
  redirect(`/admin/support/${id}?saved=1`);
}

const STATUS_META: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  open:        { label: "Open",        bg: "#FFF3DC", text: "#8A6020", dot: "#C48A3A" },
  in_progress: { label: "In Progress", bg: "#E8F2FF", text: "#1A4A8A", dot: "#3A7AC8" },
  resolved:    { label: "Resolved",    bg: "#EEF5EE", text: "#2A5230", dot: "#4A8A52" },
  closed:      { label: "Closed",      bg: "#F3F3F3", text: "#666",    dot: "#999"    },
};

const PRIORITY_META: Record<string, { label: string; color: string }> = {
  low:    { label: "Low",    color: "var(--admin-text-dim)" },
  normal: { label: "Normal", color: "var(--admin-text-muted)" },
  high:   { label: "High",   color: "#C48A3A" },
  urgent: { label: "Urgent", color: "#AA2222" },
};

const CATEGORY_LABELS: Record<string, string> = {
  general:         "General Question",
  course_help:     "Course Help",
  billing:         "Billing",
  group_account:   "Group Account",
  custom_training: "Custom Training",
  other:           "Other",
};

export default async function TicketDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  await verifyAdmin();
  const { id } = await params;
  const { saved } = await searchParams;
  const db = createAdminClient();

  const { data: ticket } = await db
    .from("support_tickets")
    .select("*")
    .eq("id", id)
    .single();

  if (!ticket) notFound();

  const sm = STATUS_META[ticket.status]       ?? STATUS_META.open;
  const pm = PRIORITY_META[ticket.priority ?? "normal"] ?? PRIORITY_META.normal;

  return (
    <div className="p-4 md:p-8 max-w-4xl">
      {/* Back + breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-sm" style={{ color: "var(--admin-text-muted)" }}>
        <Link href="/admin/support" className="hover:text-[#2A5230] transition-colors">
          ← Support Inbox
        </Link>
        <span>/</span>
        <span className="font-bold" style={{ color: "var(--admin-accent)" }}>{ticket.ticket_id ?? id.slice(0, 8)}</span>
      </div>

      {saved && (
        <div className="mb-5 px-4 py-3 rounded-xl text-sm font-medium" style={{ background: "var(--admin-card-bg-alt)", color: "var(--admin-text-muted)", border: "1px solid var(--admin-border)" }}>
          Notes saved.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        {/* Main: ticket content */}
        <div className="flex flex-col gap-5">
          {/* Header */}
          <div className="rounded-[18px] p-6" style={{ background: "var(--admin-card-bg)", border: "1px solid var(--admin-border-mid)" }}>
            <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
              <div>
                <div className="text-[12px] font-extrabold tracking-[0.08em] uppercase mb-1" style={{ color: "var(--admin-text-dim)" }}>
                  {ticket.ticket_id}
                </div>
                <h1 className="font-head font-extrabold text-[20px] leading-tight" style={{ color: "var(--admin-text-primary)" }}>
                  {ticket.subject}
                </h1>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full shrink-0" style={{ background: sm.bg, color: sm.text }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: sm.dot }} />
                {sm.label}
              </span>
            </div>
            <div className="flex flex-wrap gap-4 text-[12.5px]" style={{ color: "var(--admin-text-dim)" }}>
              <span>From: <strong style={{ color: "var(--admin-text-muted)" }}>{ticket.submitter_name ?? "—"}</strong></span>
              <span>Email: <strong style={{ color: "var(--admin-text-muted)" }}>{ticket.email}</strong></span>
              <span>Category: <strong style={{ color: "var(--admin-text-muted)" }}>{CATEGORY_LABELS[ticket.category ?? "general"] ?? ticket.category}</strong></span>
              <span>Priority: <strong style={{ color: pm.color }}>{pm.label}</strong></span>
              <span>Submitted: <strong style={{ color: "var(--admin-text-muted)" }}>{ticket.created_at ? new Date(ticket.created_at).toLocaleString() : "—"}</strong></span>
              {ticket.resolved_at && (
                <span>Resolved: <strong style={{ color: "var(--admin-text-muted)" }}>{new Date(ticket.resolved_at).toLocaleString()}</strong></span>
              )}
            </div>
          </div>

          {/* Message body */}
          <div className="rounded-[18px] p-6" style={{ background: "var(--admin-card-bg)", border: "1px solid var(--admin-border-mid)" }}>
            <div className="text-[11px] font-extrabold tracking-[0.1em] uppercase mb-3" style={{ color: "var(--admin-text-muted)" }}>Message</div>
            <p className="text-[14px] leading-relaxed whitespace-pre-wrap" style={{ color: "var(--admin-text-primary)" }}>
              {ticket.body}
            </p>
          </div>

          {/* Admin notes */}
          <div className="rounded-[18px] p-6" style={{ background: "var(--admin-card-bg)", border: "1px solid var(--admin-border-mid)" }}>
            <div className="text-[11px] font-extrabold tracking-[0.1em] uppercase mb-3" style={{ color: "var(--admin-text-muted)" }}>Internal Notes</div>
            <form action={saveNotes} className="flex flex-col gap-3">
              <input type="hidden" name="id" value={ticket.id} />
              <textarea
                name="admin_notes"
                rows={5}
                defaultValue={ticket.admin_notes ?? ""}
                placeholder="Notes visible only to admins…"
                className="w-full px-4 py-3 text-[13.5px] rounded-xl border outline-none resize-none"
                style={{ borderColor: "var(--admin-border-mid)", background: "var(--admin-table-head-bg)", color: "var(--admin-text-primary)" }}
              />
              <button
                type="submit"
                className="self-start px-4 py-2 text-sm font-bold rounded-xl"
                style={{ background: "#2A5230", color: "#fff" }}
              >
                Save Notes
              </button>
            </form>
          </div>
        </div>

        {/* Sidebar: actions */}
        <div className="flex flex-col gap-4">
          {/* Status */}
          <div className="rounded-[16px] p-5" style={{ background: "var(--admin-card-bg)", border: "1px solid var(--admin-border-mid)" }}>
            <div className="text-[11px] font-extrabold tracking-[0.1em] uppercase mb-3" style={{ color: "var(--admin-text-muted)" }}>Status</div>
            <form action={updateStatus} className="flex flex-col gap-2">
              <input type="hidden" name="id" value={ticket.id} />
              <select
                name="status"
                defaultValue={ticket.status}
                className="w-full px-3 py-2 text-sm rounded-xl border outline-none"
                style={{ borderColor: "var(--admin-border-mid)", background: "var(--admin-table-head-bg)", color: "var(--admin-text-primary)" }}
              >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
              <button type="submit" className="px-3 py-2 text-sm font-bold rounded-xl" style={{ background: "#EEF5EE", color: "#2A5230" }}>
                Update Status
              </button>
            </form>
          </div>

          {/* Priority */}
          <div className="rounded-[16px] p-5" style={{ background: "var(--admin-card-bg)", border: "1px solid var(--admin-border-mid)" }}>
            <div className="text-[11px] font-extrabold tracking-[0.1em] uppercase mb-3" style={{ color: "var(--admin-text-muted)" }}>Priority</div>
            <form action={updatePriority} className="flex flex-col gap-2">
              <input type="hidden" name="id" value={ticket.id} />
              <select
                name="priority"
                defaultValue={ticket.priority ?? "normal"}
                className="w-full px-3 py-2 text-sm rounded-xl border outline-none"
                style={{ borderColor: "var(--admin-border-mid)", background: "var(--admin-table-head-bg)", color: "var(--admin-text-primary)" }}
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
              <button type="submit" className="px-3 py-2 text-sm font-bold rounded-xl" style={{ background: "#EEF5EE", color: "#2A5230" }}>
                Update Priority
              </button>
            </form>
          </div>

          {/* Quick resolve */}
          {ticket.status !== "resolved" && ticket.status !== "closed" && (
            <form action={updateStatus}>
              <input type="hidden" name="id" value={ticket.id} />
              <input type="hidden" name="status" value="resolved" />
              <button
                type="submit"
                className="w-full px-3 py-2.5 text-sm font-bold rounded-xl"
                style={{ background: "#2A5230", color: "#fff" }}
              >
                Mark as Resolved
              </button>
            </form>
          )}

          {/* Reply shortcut */}
          <a
            href={`mailto:${ticket.email}?subject=Re: [${ticket.ticket_id}] ${ticket.subject}`}
            className="w-full px-3 py-2.5 text-sm font-bold rounded-xl text-center block"
            style={{ background: "#F0F5F1", color: "#2A5230", border: "1px solid var(--admin-border-mid)" }}
          >
            Reply via Email
          </a>

          <div className="text-[11.5px] leading-relaxed" style={{ color: "var(--admin-text-dim)" }}>
            Clicking &ldquo;Reply via Email&rdquo; opens your mail client pre-filled with the ticket subject and ID so replies stay threaded.
          </div>
        </div>
      </div>
    </div>
  );
}
