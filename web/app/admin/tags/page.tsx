import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL ?? "rae2xyz@gmail.com").toLowerCase();

async function verifyAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.email?.toLowerCase() !== ADMIN_EMAIL) redirect("/admin");
  return user;
}

async function createTag(formData: FormData) {
  "use server";
  await verifyAdmin();
  const name  = (formData.get("name") as string ?? "").trim().slice(0, 80);
  const group = (formData.get("group") as string ?? "").trim().toLowerCase().slice(0, 40);
  if (!name || !group) return;
  // generate slug from name
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const db = createAdminClient();
  await db.from("tags").insert({ name, slug, group });
  revalidatePath("/admin/tags");
}

async function deleteTag(formData: FormData) {
  "use server";
  await verifyAdmin();
  const id = (formData.get("id") as string ?? "").trim();
  if (!id) return;
  const db = createAdminClient();
  await db.from("tags").delete().eq("id", id);
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
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="font-extrabold text-2xl" style={{ fontFamily: "var(--font-head)", color: "#1A2E1C" }}>Tags</h1>
        <p className="text-sm mt-0.5" style={{ color: "#7A9878" }}>
          Filter chips on the course catalog — tag courses by audience, topic, or any group you create.
        </p>
      </div>

      {/* Add tag form */}
      <form
        action={createTag}
        className="rounded-xl p-5 mb-8 flex gap-3 flex-wrap items-end"
        style={{ background: "#fff", border: "1.5px solid #E8EDE6" }}
      >
        <div className="flex-1 min-w-[140px]">
          <label className="block text-xs font-bold uppercase tracking-wide mb-1" style={{ color: "#9AB89E" }}>Tag name</label>
          <input
            name="name"
            required
            placeholder="e.g. Virtual Assistant"
            className="w-full text-sm px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-2"
            style={{ borderColor: "#DDE8DA", color: "#1A2E1C" }}
          />
        </div>
        <div className="flex-1 min-w-[120px]">
          <label className="block text-xs font-bold uppercase tracking-wide mb-1" style={{ color: "#9AB89E" }}>Group</label>
          <input
            name="group"
            required
            list="group-suggestions"
            placeholder="audience or topic"
            className="w-full text-sm px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-2"
            style={{ borderColor: "#DDE8DA", color: "#1A2E1C" }}
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
        <div className="rounded-xl p-10 text-center" style={{ background: "#fff", border: "1.5px dashed #C8DEC8" }}>
          <p className="text-sm" style={{ color: "#9AB89E" }}>No tags yet. Add your first tag above.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {[...grouped.entries()].map(([group, groupTags]) => (
            <div key={group}>
              <h2 className="text-xs font-extrabold uppercase tracking-widest mb-3" style={{ color: "#9AB89E" }}>
                {GROUP_LABELS[group] ?? group}
              </h2>
              <div className="rounded-xl overflow-hidden" style={{ border: "1.5px solid #E8EDE6" }}>
                {(groupTags ?? []).map((tag, i) => (
                  <div
                    key={tag.id}
                    className="flex items-center justify-between px-5 py-3"
                    style={{
                      borderTop: i > 0 ? "1px solid #F5FAF5" : undefined,
                      background: "#fff",
                    }}
                  >
                    <div>
                      <span className="text-sm font-semibold" style={{ color: "#1A2E1C" }}>{tag.name}</span>
                      <span className="ml-2 text-xs font-mono" style={{ color: "#9AB89E" }}>{tag.slug}</span>
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
