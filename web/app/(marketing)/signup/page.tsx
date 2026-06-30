import { createClient } from "@/lib/supabase/server";
import SignupClient, { type BundleForSignup } from "./SignupClient";

export const revalidate = 60;

export default async function SignupPage() {
  const supabase = await createClient();

  // Fetch published bundles with their first course title
  const { data: bundleRows } = await supabase
    .from("bundles")
    .select(`
      id, title, description, audience, sort_order,
      bundle_courses ( sort_order, courses ( title, price_type ) )
    `)
    .eq("is_published", true)
    .order("sort_order");

  const bundles: BundleForSignup[] = (bundleRows ?? []).map((b) => {
    type BCRow = { sort_order: number; courses: { title: string; price_type: string } | null };
    const sorted = ((b.bundle_courses as unknown as BCRow[]) ?? [])
      .filter((r) => r.courses !== null)
      .sort((a, z) => a.sort_order - z.sort_order);
    const first = sorted[0]?.courses ?? null;
    return {
      id: b.id,
      title: b.title,
      description: b.description,
      audience: b.audience,
      first_course_title: first?.title ?? null,
      first_course_price_type: first?.price_type ?? null,
    };
  });

  return <SignupClient bundles={bundles} />;
}
