import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import Link from "next/link";

async function markRead(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const id = formData.get("id") as string;
  await supabase.from("notifications").update({ status: "read" }).eq("id", id).eq("user_id", user.id);
  revalidatePath("/dashboard/notifications");
}

async function markAllRead() {
  "use server";
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase
    .from("notifications")
    .update({ status: "read" })
    .eq("user_id", user.id)
    .eq("status", "unread");
  revalidatePath("/dashboard/notifications");
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const TYPE_META: Record<string, { bg: string; color: string; icon: React.ReactNode }> = {
  enrollment: {
    bg: "#EEF5EE", color: "#2A5230",
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    ),
  },
  completion: {
    bg: "#FFF3DC", color: "#8A6020",
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="6" /><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
      </svg>
    ),
  },
  support: {
    bg: "#E8F2FF", color: "#1A4A8A",
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  general: {
    bg: "#F3F3F3", color: "#666",
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" />
      </svg>
    ),
  },
};

export default async function NotificationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  const { data: notifications } = await supabase
    .from("notifications")
    .select("id, title, body, action_url, status, notification_type, created_at")
    .eq("user_id", user.id)
    .neq("status", "archived")
    .order("created_at", { ascending: false })
    .limit(50);

  const items = notifications ?? [];
  const unreadCount = items.filter((n) => n.status === "unread").length;

  return (
    <div className="max-w-2xl">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-extrabold text-2xl" style={{ fontFamily: "var(--font-head)", color: "#1A2E1C" }}>Notifications</h1>
          <p className="text-sm mt-0.5" style={{ color: "#7A9878" }}>
            {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
          </p>
        </div>
        {unreadCount > 0 && (
          <form action={markAllRead}>
            <button type="submit" className="text-xs font-bold px-3 py-1.5 rounded-xl mt-1" style={{ background: "#EEF5EE", color: "#2A5230" }}>
              Mark all read
            </button>
          </form>
        )}
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl p-12 text-center" style={{ background: "#fff", border: "1.5px solid #E8EDE6" }}>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: "#EEF5EE" }}>
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#2A5230" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </div>
          <p className="text-sm font-medium" style={{ color: "#2A5230" }}>No notifications yet</p>
          <p className="text-xs mt-1" style={{ color: "#9AB89E" }}>You&apos;ll see enrollment updates, course news, and support replies here.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((n) => {
            const meta = TYPE_META[n.notification_type] ?? TYPE_META.general;
            const isUnread = n.status === "unread";
            const inner = (
              <div
                className="rounded-xl p-4 flex items-start gap-3 transition-colors"
                style={{
                  background: isUnread ? "#FAFCFA" : "#fff",
                  border: `1.5px solid ${isUnread ? "#C8DEC8" : "#E8EDE6"}`,
                }}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: meta.bg, color: meta.color }}>
                  {meta.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold leading-snug" style={{ color: "#1A2E1C" }}>{n.title}</p>
                    <span className="text-xs shrink-0 mt-0.5" style={{ color: "#9AB89E" }}>{timeAgo(n.created_at)}</span>
                  </div>
                  {n.body && <p className="text-xs mt-0.5 leading-relaxed" style={{ color: "#7A9878" }}>{n.body}</p>}
                </div>
                {isUnread && (
                  <div className="w-2 h-2 rounded-full shrink-0 mt-1.5" style={{ background: "#4A8A52" }} />
                )}
              </div>
            );

            return (
              <div key={n.id} className="relative group">
                {n.action_url ? (
                  <Link href={n.action_url}>{inner}</Link>
                ) : inner}
                {isUnread && (
                  <form action={markRead} className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <input type="hidden" name="id" value={n.id} />
                    <button
                      type="submit"
                      className="text-xs px-2 py-1 rounded-lg font-medium"
                      style={{ background: "#fff", border: "1px solid #DDE8DA", color: "#7A9878" }}
                    >
                      Dismiss
                    </button>
                  </form>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
