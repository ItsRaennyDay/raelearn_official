import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CourseEditor from "./CourseEditor";

interface Props { params: Promise<{ id: string }> }

export default async function AdminCourseEditorPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: course } = await supabase
    .from("courses")
    .select("*")
    .eq("id", id)
    .single();

  if (!course) notFound();

  const { data: modules } = await supabase
    .from("modules")
    .select(`id, title, description, sort_order, status, lessons(id, title, lesson_type, duration_mins, sort_order, status)`)
    .eq("course_id", id)
    .order("sort_order");

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .order("name");

  const { data: allTags } = await supabase
    .from("tags")
    .select("id, name, slug, group, sort_order")
    .order("group")
    .order("sort_order");

  const { data: courseTagRows } = await supabase
    .from("course_tags")
    .select("tag_id")
    .eq("course_id", id);

  const selectedTagIds = (courseTagRows ?? []).map((r) => r.tag_id);

  return (
    <CourseEditor
      course={course}
      modules={modules ?? []}
      categories={categories ?? []}
      allTags={allTags ?? []}
      selectedTagIds={selectedTagIds}
    />
  );
}
