import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import CoursesClient, { type CourseWithTags, type TagGroup } from "./CoursesClient";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Courses",
  description:
    "Browse all RaeLearn courses — practical training on operations, admin systems, nonprofit compliance, websites, donor support, and more for VAs, founders, and small teams.",
  openGraph: {
    title: "Courses · RaeLearn by RAEFORM",
    description:
      "Practical courses for VAs, nonprofit leaders, founders, and small teams. Browse all topics.",
    url: "https://raelearn.byraeform.com/courses",
  },
};

export default async function CoursesPage() {
  const supabase = await createClient();

  const { data: coursesRaw } = await supabase
    .from("courses")
    .select(`
      id, title, slug, level, price_type, certificate_eligible,
      course_tags ( tag_id, tags ( id, name, slug, group ) )
    `)
    .eq("status", "published")
    .order("created_at", { ascending: false });

  const { data: tagsRaw } = await supabase
    .from("tags")
    .select("id, name, slug, group, sort_order")
    .order("group")
    .order("sort_order");

  const courses: CourseWithTags[] = (coursesRaw ?? []).map((c) => ({
    id: c.id,
    title: c.title,
    slug: c.slug,
    level: c.level,
    price_type: c.price_type,
    certificate_eligible: c.certificate_eligible,
    tags: ((c.course_tags ?? []) as unknown as { tags: CourseWithTags["tags"][number] | null }[])
      .map((ct) => ct.tags)
      .filter((t): t is CourseWithTags["tags"][number] => t !== null),
  }));

  // Build tag groups from tags that actually appear on at least one published course
  const usedTagIds = new Set(courses.flatMap((c) => c.tags.map((t) => t.id)));
  const allTags = (tagsRaw ?? []).filter((t) => usedTagIds.has(t.id));

  const groupMap = new Map<string, TagGroup>();
  for (const tag of allTags) {
    if (!groupMap.has(tag.group)) {
      groupMap.set(tag.group, { group: tag.group, label: tag.group, tags: [] });
    }
    groupMap.get(tag.group)!.tags.push({ id: tag.id, name: tag.name, slug: tag.slug });
  }

  // Show audience before topic; everything else alphabetically after
  const GROUP_ORDER = ["audience", "topic"];
  const tagGroups: TagGroup[] = [...groupMap.values()].sort((a, b) => {
    const ai = GROUP_ORDER.indexOf(a.group);
    const bi = GROUP_ORDER.indexOf(b.group);
    if (ai !== -1 && bi !== -1) return ai - bi;
    if (ai !== -1) return -1;
    if (bi !== -1) return 1;
    return a.group.localeCompare(b.group);
  });

  return <CoursesClient courses={courses} tagGroups={tagGroups} />;
}
