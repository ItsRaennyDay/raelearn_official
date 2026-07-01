import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import DeleteBundleButton from "./DeleteBundleButton";

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL ?? "rae2xyz@gmail.com").toLowerCase();

async function verifyAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.email?.toLowerCase() !== ADMIN_EMAIL) redirect("/admin");
  return user;
}

async function createBundle(formData: FormData) {
  "use server";
  await verifyAdmin();
  const title    = (formData.get("title") as string ?? "").trim().slice(0, 200);
  const audience = (formData.get("audience") as string ?? "general").trim();
  const description = (formData.get("description") as string ?? "").trim().slice(0, 500);
  if (!title) return;
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const db = createAdminClient();
  await db.from("bundles").insert({ title, slug, description, audience, is_published: false });
  revalidatePath("/admin/bundles");
}

async function deleteBundle(formData: FormData) {
  "use server";
  await verifyAdmin();
  const id = (formData.get("id") as string ?? "").trim();
  if (!id) return;
  const db = createAdminClient();
  await db.from("bundles").delete().eq("id", id);
  revalidatePath("/admin/bundles");
}

const AUDIENCE_OPTIONS = [
  { value: "va",        label: "Virtual Assistants (VA)" },
  { value: "nonprofit", label: "Nonprofits" },
  { value: "business",  label: "Business" },
  { value: "founder",   label: "Founders" },
  { value: "general",   label: "General / All" },
];

const AUDIENCE_LABELS: Record<string, string> = Object.fromEntries(
  AUDIENCE_OPTIONS.map((o) => [o.value, o.label])
);

export default async function BundlesPage() {
  await verifyAdmin();
  const db = createAdminClient();

  const { data: bundles } = await db
    .from("bundles")
    .select("id, title, description, audience, is_published, sort_order, created_at")
    .order("audience")
    .order("sort_order")
    .order("created_at");

  const { data: countRows } = await db
    .from("bundle_courses")
    .select("bundle_id");

  const countByBundle: Record<string, number> = {};
  for (const row of countRows ?? []) {
    countByBundle[row.bundle_id] = (countByBundle[row.bundle_id] ?? 0) + 1;
  }

  // Group by audience
  const grouped = new Map<string, typeof bundles>();
  for (const bundle of bundles ?? []) {
    if (!grouped.has(bundle.audience)) grouped.set(bundle.audience, []);
    grouped.get(bundle.audience)!.push(bundle);
  }

  return (
    <div className="max-w-2xl p-8">
      <div className="mb-6">
        <h1 className="font-extrabold text-2xl" style={{ fontFamily: "var(--font-head)", color: "var(--admin-text-primary)" }}>Bundles</h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--admin-text-muted)" }}>
          Group courses into learning tracks shown on audience pages. Click a bundle to edit it.
        </p>
      </div>

      {/* Create bundle form */}
      <form
        action={createBundle}
        className="rounded-xl p-5 mb-8 space-y-3"
        style={{ background: "var(--admin-card-bg)", border: "1.5px solid var(--admin-border)" }}
      >
        <h2 className="text-sm font-bold" style={{ color: "var(--admin-text-primary)" }}>New Bundle</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide mb-1" style={{ color: "var(--admin-text-dim)" }}>Title</label>
            <input
              name="title"
              required
              placeholder="e.g. General VA Foundations"
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#2A5230]"
              style={{ borderColor: "var(--admin-border-mid)", color: "var(--admin-text-primary)" }}
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide mb-1" style={{ color: "var(--admin-text-dim)" }}>Audience</label>
            <select
              name="audience"
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#2A5230] bg-white"
              style={{ borderColor: "var(--admin-border-mid)", color: "var(--admin-text-primary)" }}
            >
              {AUDIENCE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide mb-1" style={{ color: "var(--admin-text-dim)" }}>Description</label>
          <input
            name="description"
            placeholder="Short description shown on the page"
            className="w-full text-sm px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#2A5230]"
            style={{ borderColor: "var(--admin-border-mid)", color: "var(--admin-text-primary)" }}
          />
        </div>
        <button
          type="submit"
          className="text-sm font-bold px-5 py-2.5 rounded-xl"
          style={{ background: "#2A5230", color: "#fff" }}
        >
          Create Bundle
        </button>
      </form>

      {/* Bundle list */}
      {(!bundles || bundles.length === 0) ? (
        <div className="rounded-xl p-10 text-center" style={{ background: "var(--admin-card-bg)", border: "1.5px dashed #C8DEC8" }}>
          <p className="text-sm" style={{ color: "var(--admin-text-dim)" }}>No bundles yet. Create one above.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {[...grouped.entries()].map(([audience, audienceBundles]) => (
            <section key={audience}>
              <h2 className="text-xs font-extrabold uppercase tracking-widest mb-2" style={{ color: "var(--admin-text-dim)" }}>
                {AUDIENCE_LABELS[audience] ?? audience}
              </h2>
              <div className="rounded-xl overflow-hidden" style={{ border: "1.5px solid var(--admin-border)" }}>
                {(audienceBundles ?? []).map((bundle, i) => {
                  const courseCount = countByBundle[bundle.id] ?? 0;
                  return (
                    <div
                      key={bundle.id}
                      className="flex items-center gap-3 px-4 py-3.5"
                      style={{
                        background: "var(--admin-card-bg)",
                        borderTop: i > 0 ? "1px solid #F5FAF5" : undefined,
                      }}
                    >
                      {/* Click row to edit */}
                      <Link
                        href={`/admin/bundles/${bundle.id}`}
                        className="flex-1 flex items-center gap-3 min-w-0 group"
                      >
                        <div className="min-w-0">
                          <div className="font-semibold text-sm group-hover:underline truncate" style={{ color: "var(--admin-text-primary)" }}>
                            {bundle.title}
                          </div>
                          {bundle.description && (
                            <div className="text-xs truncate mt-0.5" style={{ color: "var(--admin-text-dim)" }}>{bundle.description}</div>
                          )}
                        </div>
                        <span className="text-xs shrink-0 ml-auto" style={{ color: "var(--admin-text-dim)" }}>
                          {courseCount} course{courseCount !== 1 ? "s" : ""}
                        </span>
                      </Link>

                      {/* Status badge */}
                      <span
                        className="text-xs font-bold px-2.5 py-1 rounded-full shrink-0"
                        style={{
                          background: bundle.is_published ? "#EEF5EE" : "#F3F3F3",
                          color: bundle.is_published ? "#2A5230" : "#999",
                        }}
                      >
                        {bundle.is_published ? "Published" : "Draft"}
                      </span>

                      {/* Edit link */}
                      <Link
                        href={`/admin/bundles/${bundle.id}`}
                        className="text-xs font-bold px-3 py-1.5 rounded-lg shrink-0"
                        style={{ background: "#EEF5EE", color: "#2A5230" }}
                      >
                        Edit →
                      </Link>

                      {/* Delete */}
                      <DeleteBundleButton
                        id={bundle.id}
                        title={bundle.title}
                        deleteAction={deleteBundle}
                      />
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
