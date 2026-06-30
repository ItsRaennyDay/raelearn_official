import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
}

const AUDIENCE_LABELS: Record<string, string> = {
  va:        "Virtual Assistants",
  nonprofit: "Nonprofits",
  business:  "Business",
  founder:   "Founders",
  general:   "All learners",
};

const LEVEL_COLOR: Record<string, string> = {
  beginner:     "#3E9A52",
  intermediate: "#2A5230",
  advanced:     "#C48A3A",
};

type TagRow = { id: string; name: string; slug: string; group: string };

type CourseRow = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  level: string;
  price_type: string;
  price_cents: number;
  certificate_eligible: boolean;
  status: string;
  course_tags: { tags: TagRow | null }[];
};

type BundleCourseRow = { sort_order: number; courses: CourseRow | null };

export default async function BundlePage({ params }: Props) {
  const { slug } = await params;
  if (!/^[a-z0-9-]+$/.test(slug)) notFound();

  const supabase = await createClient();

  const { data: bundle } = await supabase
    .from("bundles")
    .select(`
      id, title, description, audience,
      bundle_courses (
        sort_order,
        courses (
          id, title, slug, description, level, price_type, price_cents,
          certificate_eligible, status,
          course_tags ( tags ( id, name, slug, group ) )
        )
      )
    `)
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!bundle) notFound();

  const courses = ((bundle.bundle_courses as unknown as BundleCourseRow[]) ?? [])
    .filter((bc) => bc.courses?.status === "published")
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((bc) => bc.courses!);

  const hasCert = courses.some((c) => c.certificate_eligible);
  const audience = bundle.audience as string;
  const totalFree = courses.filter((c) => c.price_type === "free").length;

  return (
    <main className="bg-[#F5F0E8] min-h-screen">
      {/* Hero */}
      <section className="bg-[#1A2E1C] text-white px-7 py-14">
        <div className="max-w-[960px] mx-auto">
          <div className="flex items-center gap-2 mb-5 flex-wrap">
            <Link href="/courses" className="text-[#A8C4A4] text-sm hover:text-white transition-colors">
              ← Courses
            </Link>
            <span className="text-[#4A6A4E]">·</span>
            <span className="text-xs font-bold bg-[#2A4030] text-[#7ABD80] px-2.5 py-1 rounded-full uppercase tracking-wide">
              {AUDIENCE_LABELS[audience] ?? "All learners"}
            </span>
            {hasCert && (
              <span className="text-xs font-bold bg-[#3D2A00] text-[#E8B84B] px-2.5 py-1 rounded-full">
                Certificate included
              </span>
            )}
          </div>

          <h1 className="font-head font-extrabold text-[clamp(28px,4.5vw,50px)] leading-[1.06] mb-4 max-w-[720px]">
            {bundle.title}
          </h1>

          {bundle.description && (
            <p className="text-[#A8C4A4] text-[17px] leading-relaxed max-w-[600px] mb-6">
              {bundle.description}
            </p>
          )}

          <div className="flex items-center gap-5 flex-wrap text-sm text-[#7A9878]">
            <span>{courses.length} course{courses.length !== 1 ? "s" : ""}</span>
            {totalFree > 0 && (
              <span>{totalFree === courses.length ? "All free" : `${totalFree} free`}</span>
            )}
            <span>Curated in recommended order</span>
          </div>
        </div>
      </section>

      {/* Course list + sidebar */}
      <div className="max-w-[960px] mx-auto px-7 py-12 flex gap-8 items-start flex-wrap lg:flex-nowrap">

        {/* Course cards */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          {courses.length === 0 ? (
            <div className="bg-white border border-[#DDE8DA] rounded-2xl px-8 py-16 text-center text-[#9AB89E] text-sm">
              No courses in this bundle yet.
            </div>
          ) : courses.map((course, i) => {
            const tags = (course.course_tags ?? [])
              .map((ct) => ct.tags)
              .filter((t): t is TagRow => t !== null && t.group !== "audience");
            const isFree = course.price_type === "free";
            const levelColor = LEVEL_COLOR[course.level] ?? "#2A5230";

            return (
              <div
                key={course.id}
                className="bg-white border border-[#DDE8DA] rounded-2xl p-6 flex gap-5 hover:shadow-[0_8px_28px_-16px_rgba(42,82,48,0.22)] transition-shadow"
              >
                {/* Step number */}
                <div className="shrink-0 w-11 h-11 rounded-xl bg-[#EEF5EE] flex items-center justify-center mt-0.5">
                  <span className="font-head font-bold text-[17px] text-[#2A5230] leading-none">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 flex-wrap mb-2">
                    <h2 className="font-head font-bold text-[18px] text-[#1A2E1C] leading-snug">
                      {course.title}
                    </h2>
                    <Link
                      href={`/courses/${course.slug}`}
                      className="shrink-0 text-sm font-bold text-white bg-[#2A5230] px-4 py-2 rounded-xl hover:bg-[#1e3d24] transition-colors whitespace-nowrap"
                    >
                      Start Course →
                    </Link>
                  </div>

                  {course.description && (
                    <p className="text-sm text-[#4A6650] leading-relaxed mb-3 max-w-[560px]">
                      {course.description}
                    </p>
                  )}

                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full capitalize"
                      style={{ color: levelColor, background: levelColor + "18" }}
                    >
                      {course.level}
                    </span>
                    <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${
                      isFree ? "text-blue-700 bg-blue-50" : "text-[#4A6650] bg-[#DDE8DA]"
                    }`}>
                      {isFree ? "Free" : `$${(course.price_cents / 100).toFixed(0)}`}
                    </span>
                    {course.certificate_eligible && (
                      <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full text-[#9A6800] bg-[#FFF3DC]">
                        Certificate
                      </span>
                    )}
                    {tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full text-[#7A9878] bg-[#F0F7F0] border border-[#DDE8DA]"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-64 shrink-0 space-y-4">
          <div className="bg-white border border-[#DDE8DA] rounded-2xl p-5 sticky top-6">
            <p className="text-xs font-bold uppercase tracking-wide text-[#7A9878] mb-4">Bundle Summary</p>

            <div className="space-y-3 mb-5">
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#7A9878]">Courses</span>
                <span className="font-bold text-[#1A2E1C]">{courses.length}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#7A9878]">Free</span>
                <span className="font-bold text-[#1A2E1C]">{totalFree}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#7A9878]">Certificate</span>
                <span className="font-bold text-[#1A2E1C]">{hasCert ? "Yes" : "No"}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#7A9878]">For</span>
                <span className="font-bold text-[#1A2E1C] text-right max-w-[120px]">
                  {AUDIENCE_LABELS[audience] ?? "All"}
                </span>
              </div>
            </div>

            <div className="h-px bg-[#F0F7F0] mb-5" />

            {courses[0] && (
              <Link
                href={`/courses/${courses[0].slug}`}
                className="block w-full text-center text-sm font-bold text-white bg-[#2A5230] px-4 py-3 rounded-xl hover:bg-[#1e3d24] transition-colors"
              >
                Start Bundle →
              </Link>
            )}

            <Link
              href="/courses"
              className="block w-full text-center text-sm font-semibold text-[#4A6650] mt-2 py-2 hover:text-[#2A5230] transition-colors"
            >
              Browse all courses
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
