import type { MetadataRoute } from "next";
import { createAdminClient } from "@/lib/supabase/admin";

const BASE_URL = "https://raelearn.byraeform.com";

// Sitemap data is fully public — use the admin client (no cookies()) so this
// route isn't forced dynamic and can actually be cached per `revalidate`.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createAdminClient();

  const [{ data: courses }, { data: bundles }] = await Promise.all([
    supabase
      .from("courses")
      .select("slug, updated_at")
      .eq("status", "published"),
    supabase
      .from("bundles")
      .select("slug, updated_at")
      .eq("is_published", true),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL,                    lastModified: new Date(), changeFrequency: "weekly",  priority: 1.0 },
    { url: `${BASE_URL}/courses`,       lastModified: new Date(), changeFrequency: "weekly",  priority: 0.9 },
    { url: `${BASE_URL}/for-vas`,       lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/pricing`,       lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/contact`,       lastModified: new Date(), changeFrequency: "yearly",  priority: 0.4 },
    { url: `${BASE_URL}/legal/privacy`,     lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE_URL}/legal/terms`,       lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE_URL}/legal/refund`,      lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE_URL}/legal/disclaimers`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
  ];

  const courseRoutes: MetadataRoute.Sitemap = (courses ?? []).map((c) => ({
    url: `${BASE_URL}/courses/${c.slug}`,
    lastModified: c.updated_at ? new Date(c.updated_at) : new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const bundleRoutes: MetadataRoute.Sitemap = (bundles ?? []).map((b) => ({
    url: `${BASE_URL}/bundles/${b.slug}`,
    lastModified: b.updated_at ? new Date(b.updated_at) : new Date(),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...courseRoutes, ...bundleRoutes];
}
