import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import Link from "next/link";

const CATEGORIES = [
  { value: "general",         label: "General Question" },
  { value: "course_help",     label: "Course Help" },
  { value: "billing",         label: "Billing" },
  { value: "group_account",   label: "Group Account" },
  { value: "custom_training", label: "Custom Training" },
  { value: "other",           label: "Other" },
];

const STATUS_META: Record<string, { bg: string; text: string }> = {
  open:        { bg: "#FFF0F0", text: "#AA2222" },
  in_progress: { bg: "#FFF3DC", text: "#8A6020" },
  resolved:    { bg: "#EEF5EE", text: "#2A5230" },
  closed:      { bg: "#F3F3F3", text: "#666"    },
};

async function submitTicket(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  const category = (formData.get("category") as string ?? "general");
  const subject  = (formData.get("subject")  as string ?? "").trim().slice(0, 200);
  const body     = (formData.get("body")     as string ?? "").trim().slice(0, 4000);

  if (!subject || !body) {
    redirect("/dashboard/support?error=missing-fields");
  }

  const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();

  const { data } = await supabase
    .from("support_tickets")
    .insert({
      user_id: user.id,
      submitter_name: profile?.full_name || user.email,
      email: user.email,
      category,
      subject,
      body,
      status: "open",
      priority: "normal",
    })
    .select("ticket_id")
    .single();

  revalidatePath("/dashboard/support");
  redirect(`/dashboard/support?submitted=${data?.ticket_id ?? "1"}`);
}

export default async function SupportPage({
  searchParams,
}: {
  searchParams: Promise<{ submitted?: string; error?: string }>;
}) {
  const { submitted, error } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  const { data: tickets } = await supabase
    .from("support_tickets")
    .select("id, ticket_id, subject, category, status, priority, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="font-extrabold text-2xl" style={{ fontFamily: "var(--font-head)", color: "#1A2E1C" }}>Support</h1>
        <p className="text-sm mt-0.5" style={{ color: "#7A9878" }}>Submit a ticket and we&apos;ll get back to you within 1–2 business days.</p>
      </div>

      {submitted && (
        <div className="mb-5 px-4 py-3 rounded-xl text-sm font-medium flex items-center justify-between" style={{ background: "#EEF5EE", color: "#2A5230", border: "1px solid #C8DEC8" }}>
          <span>Ticket submitted successfully.</span>
          {submitted !== "1" && <span className="font-mono text-xs px-2 py-0.5 rounded" style={{ background: "#fff" }}>{submitted}</span>}
        </div>
      )}
      {error === "missing-fields" && (
        <div className="mb-5 px-4 py-3 rounded-xl text-sm font-medium" style={{ background: "#FFF0F0", color: "#AA2222", border: "1px solid #FFCCCC" }}>
          Please fill in the subject and message.
        </div>
      )}

      {/* New ticket form */}
      <div className="rounded-xl p-6 mb-8" style={{ background: "#fff", border: "1.5px solid #E8EDE6" }}>
        <h2 className="font-bold text-sm mb-4" style={{ color: "#1A2E1C" }}>Submit a new ticket</h2>
        <form action={submitTicket} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold tracking-[0.04em] uppercase" style={{ color: "#7A9878" }}>Category</label>
            <select
              name="category"
              className="px-4 py-2.5 text-sm rounded-xl border outline-none"
              style={{ borderColor: "#DDE8DA", background: "#FAFCFA", color: "#1A2E1C" }}
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold tracking-[0.04em] uppercase" style={{ color: "#7A9878" }}>Subject</label>
            <input
              name="subject"
              type="text"
              required
              placeholder="Brief description of your question"
              className="px-4 py-2.5 text-sm rounded-xl border outline-none"
              style={{ borderColor: "#DDE8DA", background: "#FAFCFA", color: "#1A2E1C" }}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold tracking-[0.04em] uppercase" style={{ color: "#7A9878" }}>Message</label>
            <textarea
              name="body"
              required
              rows={5}
              placeholder="Tell us how we can help…"
              className="px-4 py-2.5 text-sm rounded-xl border outline-none resize-none"
              style={{ borderColor: "#DDE8DA", background: "#FAFCFA", color: "#1A2E1C" }}
            />
          </div>
          <button
            type="submit"
            className="mt-1 px-6 py-2.5 text-sm font-bold rounded-xl self-start"
            style={{ background: "#2A5230", color: "#fff" }}
          >
            Submit Ticket
          </button>
        </form>
      </div>

      {/* Ticket history */}
      <div>
        <h2 className="font-bold text-sm mb-3" style={{ color: "#1A2E1C" }}>
          Your tickets {tickets?.length ? <span className="font-normal" style={{ color: "#9AB89E" }}>({tickets.length})</span> : null}
        </h2>
        {!tickets?.length ? (
          <div className="rounded-xl p-8 text-center" style={{ background: "#fff", border: "1.5px solid #E8EDE6" }}>
            <p className="text-sm" style={{ color: "#9AB89E" }}>You haven&apos;t submitted any tickets yet.</p>
          </div>
        ) : (
          <div className="rounded-xl overflow-hidden" style={{ background: "#fff", border: "1.5px solid #E8EDE6" }}>
            <div className="divide-y" style={{ borderColor: "#EEF5EE" }}>
              {tickets.map((t) => {
                const meta = STATUS_META[t.status] ?? STATUS_META.open;
                return (
                  <div key={t.id} className="px-5 py-3.5 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold truncate" style={{ color: "#1A2E1C" }}>{t.subject}</div>
                      <div className="text-xs mt-0.5" style={{ color: "#9AB89E" }}>
                        {t.ticket_id} · {new Date(t.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full shrink-0 capitalize" style={{ background: meta.bg, color: meta.text }}>
                      {t.status.replace("_", " ")}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <p className="text-xs mt-6" style={{ color: "#9AB89E" }}>
        Prefer email? Reach us directly at{" "}
        <a href="mailto:raeformtoday@gmail.com" className="font-semibold hover:underline" style={{ color: "#2A5230" }}>
          raeformtoday@gmail.com
        </a>{" "}
        or use the <Link href="/contact" className="font-semibold hover:underline" style={{ color: "#2A5230" }}>public contact form</Link>.
      </p>
    </div>
  );
}
