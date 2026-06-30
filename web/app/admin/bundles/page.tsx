import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import BundleManager from "./BundleManager";

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL ?? "rae2xyz@gmail.com").toLowerCase();

async function verifyAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.email?.toLowerCase() !== ADMIN_EMAIL) redirect("/admin");
  return user;
}

export async function createBundle(formData: FormData) {
  "use server";
  await verifyAdmin();
  const title    = (formData.get("title") as string ?? "").trim().slice(0, 200);
  const audience = (formData.get("audience") as string ?? "general").trim().slice(0, 40);
  const description = (formData.get("description") as string ?? "").trim().slice(0, 500);
  if (!title) return;
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const db = createAdminClient();
  await db.from("bundles").insert({ title, slug, description, audience, is_published: false });
  revalidatePath("/admin/bundles");
}

export async function deleteBundle(formData: FormData) {
  "use server";
  await verifyAdmin();
  const id = (formData.get("id") as string ?? "").trim();
  if (!id) return;
  const db = createAdminClient();
  await db.from("bundles").delete().eq("id", id);
  revalidatePath("/admin/bundles");
}

export async function togglePublish(formData: FormData) {
  "use server";
  await verifyAdmin();
  const id      = (formData.get("id") as string ?? "").trim();
  const current = formData.get("current") === "true";
  if (!id) return;
  const db = createAdminClient();
  await db.from("bundles").update({ is_published: !current }).eq("id", id);
  revalidatePath("/admin/bundles");
}

export async function addCourseToBundle(formData: FormData) {
  "use server";
  await verifyAdmin();
  const bundle_id = (formData.get("bundle_id") as string ?? "").trim();
  const course_id = (formData.get("course_id") as string ?? "").trim();
  if (!bundle_id || !course_id) return;
  const db = createAdminClient();
  // get current max sort_order
  const { data: existing } = await db
    .from("bundle_courses")
    .select("sort_order")
    .eq("bundle_id", bundle_id)
    .order("sort_order", { ascending: false })
    .limit(1);
  const sort_order = existing && existing.length > 0 ? (existing[0].sort_order + 1) : 0;
  await db.from("bundle_courses").upsert({ bundle_id, course_id, sort_order });
  revalidatePath("/admin/bundles");
}

export async function removeCourseFromBundle(formData: FormData) {
  "use server";
  await verifyAdmin();
  const bundle_id = (formData.get("bundle_id") as string ?? "").trim();
  const course_id = (formData.get("course_id") as string ?? "").trim();
  if (!bundle_id || !course_id) return;
  const db = createAdminClient();
  await db.from("bundle_courses").delete().eq("bundle_id", bundle_id).eq("course_id", course_id);
  revalidatePath("/admin/bundles");
}

export default async function BundlesPage() {
  await verifyAdmin();
  const db = createAdminClient();

  const { data: bundles } = await db
    .from("bundles")
    .select("id, title, slug, description, audience, is_published, sort_order, created_at")
    .order("sort_order")
    .order("created_at");

  const { data: bundleCourseRows } = await db
    .from("bundle_courses")
    .select("bundle_id, course_id, sort_order, courses(id, title, slug, level, price_type, certificate_eligible)")
    .order("sort_order");

  const { data: allCourses } = await db
    .from("courses")
    .select("id, title, slug, level, price_type, certificate_eligible, status")
    .order("title");

  // Group bundle_courses by bundle_id
  type CourseRow = { id: string; title: string; slug: string; level: string; price_type: string; certificate_eligible: boolean };
  const coursesByBundle: Record<string, { course_id: string; sort_order: number; course: CourseRow }[]> = {};
  for (const row of bundleCourseRows ?? []) {
    const course = row.courses as unknown as CourseRow | null;
    if (!course) continue;
    if (!coursesByBundle[row.bundle_id]) coursesByBundle[row.bundle_id] = [];
    coursesByBundle[row.bundle_id].push({ course_id: row.course_id, sort_order: row.sort_order, course });
  }
  for (const list of Object.values(coursesByBundle)) {
    list.sort((a, b) => a.sort_order - b.sort_order);
  }

  return (
    <BundleManager
      bundles={bundles ?? []}
      coursesByBundle={coursesByBundle}
      allCourses={(allCourses ?? []).filter((c) => c.status === "published")}
      createBundle={createBundle}
      deleteBundle={deleteBundle}
      togglePublish={togglePublish}
      addCourseToBundle={addCourseToBundle}
      removeCourseFromBundle={removeCourseFromBundle}
    />
  );
}
