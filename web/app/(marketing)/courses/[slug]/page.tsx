import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import EnrollButton from "./EnrollButton";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function CourseDetailPage({ params }: Props) {
  const { slug } = await params;

  // Sanitize slug — only allow URL-safe chars
  if (!/^[a-z0-9-]+$/.test(slug)) notFound();

  const supabase = await createClient();

  const { data: course } = await supabase
    .from("courses")
    .select(`
      id, title, slug, description, outcomes, requirements,
      level, price_type, price_cents, status,
      certificate_eligible, legal_disclaimer,
      thumbnail_url, preview_video_url,
      categories (name),
      profiles (full_name)
    `)
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!course) notFound();

  const { data: modules } = await supabase
    .from("modules")
    .select(`
      id, title, description, sort_order,
      lessons (id, title, lesson_type, duration_mins, is_required, sort_order, status)
    `)
    .eq("course_id", course.id)
    .eq("status", "published")
    .order("sort_order");

  const { data: { user } } = await supabase.auth.getUser();

  let isEnrolled = false;
  if (user) {
    const { data: enrollment } = await supabase
      .from("enrollments")
      .select("id")
      .eq("user_id", user.id)
      .eq("course_id", course.id)
      .eq("status", "active")
      .single();
    isEnrolled = !!enrollment;
  }

  const totalLessons = modules?.reduce(
    (acc, m) => acc + ((m.lessons as unknown as unknown[])?.length ?? 0), 0
  ) ?? 0;

  const totalMins = modules?.reduce((acc, m) => {
    const lessons = m.lessons as unknown as { duration_mins: number | null }[];
    return acc + (lessons?.reduce((a, l) => a + (l.duration_mins ?? 0), 0) ?? 0);
  }, 0) ?? 0;

  const levelColor =
    course.level === "beginner" ? "#3E9A52" :
    course.level === "intermediate" ? "#2A5230" : "#C48A3A";

  const isFree = course.price_type === "free";
  const price = isFree ? "Free" : `$${(course.price_cents / 100).toFixed(0)}`;

  return (
    <main>
      {/* Hero */}
      <section className="bg-[#1A2E1C] text-white px-7 py-14">
        <div className="max-w-[960px] mx-auto">
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <Link href="/courses" className="text-[#A8C4A4] text-sm hover:text-white transition-colors">
              ← Courses
            </Link>
            <span className="text-[#4A6A4E]">·</span>
            <span
              className="text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded-full"
              style={{ background: "#2A4030", color: levelColor }}
            >
              {course.level}
            </span>
            {course.certificate_eligible && (
              <span className="text-xs font-bold bg-[#3D2A00] text-[#E8B84B] px-2.5 py-1 rounded-full">
                Certificate eligible
              </span>
            )}
          </div>

          <h1 className="font-head font-extrabold text-[clamp(26px,4vw,42px)] leading-[1.1] mb-4 max-w-[720px]">
            {course.title}
          </h1>

          {course.description && (
            <p className="text-[#A8C4A4] text-lg leading-relaxed max-w-[660px] mb-6">
              {course.description}
            </p>
          )}

          <div className="flex items-center gap-5 flex-wrap text-sm text-[#7A9878] mb-8">
            {totalLessons > 0 && <span>{totalLessons} lessons</span>}
            {totalMins > 0 && <span>~{Math.round(totalMins / 60 * 10) / 10} hrs</span>}
            {(course.categories as unknown as { name: string } | null)?.name && (
              <span>{(course.categories as unknown as { name: string }).name}</span>
            )}
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <div className="text-2xl font-extrabold text-white">{price}</div>
            <EnrollButton
              courseId={course.id}
              courseTitle={course.title}
              isFree={isFree}
              isEnrolled={isEnrolled}
              isLoggedIn={!!user}
            />
          </div>
        </div>
      </section>

      {/* Body */}
      <div className="max-w-[960px] mx-auto px-7 py-12 grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* Left */}
        <div className="lg:col-span-2 space-y-10">

          {/* Outcomes */}
          {course.outcomes && course.outcomes.length > 0 && (
            <section>
              <h2 className="font-head font-bold text-xl text-[#2A5230] mb-4">What you&apos;ll learn</h2>
              <ul className="space-y-2">
                {(course.outcomes as string[]).map((o, i) => (
                  <li key={i} className="flex items-start gap-3 text-[#4A6650]">
                    <span className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-[#DDE8DA] flex items-center justify-center">
                      <svg viewBox="0 0 12 12" width="10" height="10" fill="none" stroke="#2A5230" strokeWidth="2" strokeLinecap="round">
                        <path d="M2 6l3 3 5-5" />
                      </svg>
                    </span>
                    <span className="text-sm leading-relaxed">{o}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Requirements */}
          {course.requirements && course.requirements.length > 0 && (
            <section>
              <h2 className="font-head font-bold text-xl text-[#2A5230] mb-4">Requirements</h2>
              <ul className="space-y-2">
                {(course.requirements as string[]).map((r, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-[#4A6650] leading-relaxed">
                    <span className="mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full bg-[#5A8C5E]" />
                    {r}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Curriculum */}
          {modules && modules.length > 0 && (
            <section>
              <h2 className="font-head font-bold text-xl text-[#2A5230] mb-4">Course curriculum</h2>
              <div className="space-y-3">
                {modules.map((mod) => {
                  const lessons = (mod.lessons as unknown as {
                    id: string; title: string; lesson_type: string;
                    duration_mins: number | null; is_required: boolean; sort_order: number;
                  }[])?.sort((a, b) => a.sort_order - b.sort_order) ?? [];

                  return (
                    <details
                      key={mod.id}
                      className="bg-white border border-[#DDE8DA] rounded-xl overflow-hidden group"
                    >
                      <summary className="px-5 py-4 cursor-pointer font-semibold text-[#2A5230] flex items-center justify-between select-none list-none">
                        <span>{mod.title}</span>
                        <span className="text-xs text-[#7A9878] shrink-0 ml-3">
                          {lessons.length} lesson{lessons.length !== 1 ? "s" : ""}
                        </span>
                      </summary>
                      {lessons.length > 0 && (
                        <div className="border-t border-[#EAF2EA] divide-y divide-[#F0F7F0]">
                          {lessons.map((lesson) => (
                            <div key={lesson.id} className="px-5 py-3 flex items-center gap-3">
                              <span className="shrink-0 text-[#7A9878]">
                                {lesson.lesson_type === "video" ? "▶" :
                                 lesson.lesson_type === "quiz" ? "✓" :
                                 lesson.lesson_type === "assignment" ? "✏" : "📄"}
                              </span>
                              <span className="flex-1 text-sm text-[#4A6650]">{lesson.title}</span>
                              {lesson.duration_mins && (
                                <span className="text-xs text-[#A0B8A0] shrink-0">
                                  {lesson.duration_mins}m
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </details>
                  );
                })}
              </div>
            </section>
          )}

          {/* Legal disclaimer */}
          {course.legal_disclaimer && (
            <div className="bg-[#FFF8EC] border border-[#E8D5A0] rounded-xl p-5 text-sm text-[#7A5A00] leading-relaxed">
              <strong>Disclaimer: </strong>{course.legal_disclaimer}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div>
          <div className="bg-white border border-[#DDE8DA] rounded-xl p-6 sticky top-24">
            <div className="text-2xl font-extrabold text-[#2A5230] mb-1">{price}</div>

            {course.certificate_eligible && (
              <div className="flex items-center gap-2 text-xs text-[#9c6c12] bg-[#FFF3DC] px-3 py-2 rounded-lg mb-4">
                <span>🎓</span>
                <span className="font-semibold">Certificate of completion</span>
              </div>
            )}

            <EnrollButton
              courseId={course.id}
              courseTitle={course.title}
              isFree={isFree}
              isEnrolled={isEnrolled}
              isLoggedIn={!!user}
              fullWidth
            />

            <div className="mt-5 space-y-2.5 text-sm text-[#4A6650]">
              {totalLessons > 0 && (
                <div className="flex justify-between">
                  <span>Lessons</span>
                  <span className="font-semibold text-[#2A5230]">{totalLessons}</span>
                </div>
              )}
              {totalMins > 0 && (
                <div className="flex justify-between">
                  <span>Duration</span>
                  <span className="font-semibold text-[#2A5230]">~{Math.round(totalMins / 60 * 10) / 10} hrs</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Level</span>
                <span className="font-semibold capitalize" style={{ color: levelColor }}>{course.level}</span>
              </div>
              {course.certificate_eligible && (
                <div className="flex justify-between">
                  <span>Certificate</span>
                  <span className="font-semibold text-[#2A5230]">Yes</span>
                </div>
              )}
            </div>

            <div className="mt-5 pt-4 border-t border-[#EAF2EA] text-xs text-[#7A9878] text-center">
              Educational content only — not legal or tax advice.
              <br />
              <Link href="/legal/disclaimers" className="underline hover:text-[#4A6650] transition-colors">
                Read full disclaimer
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
