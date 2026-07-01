import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAction } from "@/lib/audit";

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL ?? "rae2xyz@gmail.com").toLowerCase();

async function verifyAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.email?.toLowerCase() !== ADMIN_EMAIL) redirect("/admin");
  return user;
}

async function createTag(formData: FormData) {
  "use server";
  const actor = await verifyAdmin();
  const name  = (formData.get("name") as string ?? "").trim().slice(0, 80);
  const group = (formData.get("group") as string ?? "").trim().toLowerCase().slice(0, 40);
  if (!name || !group) return;
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const db = createAdminClient();
  const { data } = await db.from("tags").insert({ name, slug, group }).select("id").single();
  await logAction({ actorId: actor.id, action: "create", tableName: "tags", recordId: data?.id, newValues: { name, slug, group } });
  revalidatePath("/admin/tags");
}

async function deleteTag(formData: FormData) {
  "use server";
  const actor = await verifyAdmin();
  const id = (formData.get("id") as string ?? "").trim();
  if (!id) return;
  const db = createAdminClient();
  const { data: old } = await db.from("tags").select("name, slug, group").eq("id", id).single();
  await db.from("tags").delete().eq("id", id);
  await logAction({ actorId: actor.id, action: "delete", tableName: "tags", recordId: id, oldValues: old ?? undefined });
  revalidatePath("/admin/tags");
}

const GROUP_LABELS: Record<string, string> = {
  audience: "Audience",
  topic:    "Topic",
};

export default async function TagsPage() {
  await verifyAdmin();
  const supabase = await createClient();

  const { data: tags } = await supabase
    .from("tags")
    .select("id, name, slug, group, sort_order, created_at")
    .order("group")
    .order("sort_order");

  // Group tags
  const grouped = new Map<string, typeof tags>();
  for (const tag of tags ?? []) {
    if (!grouped.has(tag.group)) grouped.set(tag.group, []);
    grouped.get(tag.group)!.push(tag);
  }

  const existingGroups = [...grouped.keys()];

  return (
    <div className="p-4 md:p-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="font-extrabold text-2xl" style={{ fontFamily: "var(--font-head)", color: "var(--admin-text-primary)" }}>Tags</h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--admin-text-muted)" }}>
          Filter chips on the course catalog — tag courses by audience, topic, or any group you create.
        </p>
      </div>

      {/* Add tag form */}
      <form
        action={createTag}
        className="rounded-xl p-5 mb-8 flex gap-3 flex-wrap items-end"
        style={{ background: "var(--admin-card-bg)", border: "1.5px solid var(--admin-border)" }}
      >
        <div className="flex-1 min-w-[140px]">
          <label className="block text-xs font-bold uppercase tracking-wide mb-1" style={{ color: "var(--admin-text-dim)" }}>Tag name</label>
          <input
            name="name"
            required
            placeholder="e.g. Virtual Assistant"
            className="w-full text-sm px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-2"
            style={{ borderColor: "var(--admin-border-mid)", color: "var(--admin-text-primary)" }}
          />
        </div>
        <div className="flex-1 min-w-[120px]">
          <label className="block text-xs font-bold uppercase tracking-wide mb-1" style={{ color: "var(--admin-text-dim)" }}>Group</label>
          <input
            name="group"
            required
            list="group-suggestions"
            placeholder="audience or topic"
            className="w-full text-sm px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-2"
            style={{ borderColor: "var(--admin-border-mid)", color: "var(--admin-text-primary)" }}
          />
          <datalist id="group-suggestions">
            <option value="audience" />
            <option value="topic" />
            {existingGroups.filter((g) => !["audience", "topic"].includes(g)).map((g) => (
              <option key={g} value={g} />
            ))}
          </datalist>
        </div>
        <button
          type="submit"
          className="text-sm font-bold px-5 py-2.5 rounded-xl shrink-0"
          style={{ background: "#2A5230", color: "#fff" }}
        >
          + Add Tag
        </button>
      </form>

      {/* Tags by group */}
      {grouped.size === 0 ? (
        <div className="rounded-xl p-10 text-center" style={{ background: "var(--admin-card-bg)", border: "1.5px dashed #C8DEC8" }}>
          <p className="text-sm" style={{ color: "var(--admin-text-dim)" }}>No tags yet. Add your first tag above.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {[...grouped.entries()].map(([group, groupTags]) => (
            <div key={group}>
              <h2 className="text-xs font-extrabold uppercase tracking-widest mb-3" style={{ color: "var(--admin-text-dim)" }}>
                {GROUP_LABELS[group] ?? group}
              </h2>
              <div className="rounded-xl overflow-hidden" style={{ border: "1.5px solid var(--admin-border)" }}>
                {(groupTags ?? []).map((tag, i) => (
                  <div
                    key={tag.id}
                    className="flex items-center justify-between px-5 py-3"
                    style={{
                      borderTop: i > 0 ? "1px solid #F5FAF5" : undefined,
                      background: "var(--admin-card-bg)",
                    }}
                  >
                    <div>
                      <span className="text-sm font-semibold" style={{ color: "var(--admin-text-primary)" }}>{tag.name}</span>
                      <span className="ml-2 text-xs font-mono" style={{ color: "var(--admin-text-dim)" }}>{tag.slug}</span>
                    </div>
                    <form action={deleteTag}>
                      <input type="hidden" name="id" value={tag.id} />
                      <button
                        type="submit"
                        className="text-xs font-bold px-3 py-1 rounded-lg transition-colors"
                        style={{ color: "#AA2222", background: "#FFF0F0" }}
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
