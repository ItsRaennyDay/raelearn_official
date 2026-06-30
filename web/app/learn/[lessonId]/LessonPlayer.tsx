"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { markLessonComplete, saveVideoProgress } from "./actions";

interface Lesson {
  id: string;
  title: string;
  lesson_type: string;
  content: string | null;
  video_url: string | null;
  duration_mins: number | null;
  sort_order: number;
  module_id: string;
}

interface SidebarLesson {
  id: string;
  title: string;
  lesson_type: string;
  duration_mins: number | null;
  sort_order: number;
  module_id: string;
}

interface Module {
  id: string;
  title: string;
  sort_order: number;
  lessons: SidebarLesson[];
}

interface Resource {
  id: string;
  title: string;
  resource_type: string | null;
  external_url: string | null;
  file_path: string | null;
}

interface Props {
  lesson: Lesson;
  course: { id: string; title: string; slug: string };
  modules: Module[];
  initialCompleted: boolean;
  prevLesson: { id: string; title: string } | null;
  nextLesson: { id: string; title: string } | null;
  moduleTitle: string;
  moduleIndex: number;
  lessonIndex: number;
  totalLessons: number;
  completedLessonIds: string[];
  resources: Resource[];
}

type Tab = "resources" | "notes" | "checklist";

const LESSON_ICONS: Record<string, React.ReactNode> = {
  video: (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="5,3 13,8 5,13" />
    </svg>
  ),
  text: (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 4h10M3 8h10M3 12h6" />
    </svg>
  ),
  quiz: (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="6" /><path d="M8 10V8M8 6h.01" />
    </svg>
  ),
  assignment: (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 2H6L5 4H3a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1h-2L10 2Z" />
      <path d="M6 8h4M6 11h2" />
    </svg>
  ),
};

export default function LessonPlayer({
  lesson,
  course,
  modules,
  initialCompleted,
  prevLesson,
  nextLesson,
  moduleTitle,
  moduleIndex,
  lessonIndex,
  totalLessons,
  completedLessonIds,
  resources,
}: Props) {
  const router = useRouter();
  const [leftOpen, setLeftOpen] = useState(true);
  const [tab, setTab] = useState<Tab>("resources");
  const [completed, setCompleted] = useState(initialCompleted);
  const [markingDone, setMarkingDone] = useState(false);
  const [notes, setNotes] = useState("");
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    modules.forEach((m) => { init[m.id] = m.lessons.some((l) => l.id === lesson.id); });
    return init;
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sessionStartRef = useRef(Date.now());

  const totalCompleted = completedLessonIds.length + (completed && !completedLessonIds.includes(lesson.id) ? 1 : 0);
  const totalAllLessons = modules.reduce((s, m) => s + m.lessons.length, 0);
  const progressPct = totalAllLessons > 0 ? Math.round((totalCompleted / totalAllLessons) * 100) : 0;

  const handleMarkComplete = useCallback(async () => {
    if (completed || markingDone) return;
    setMarkingDone(true);
    const result = await markLessonComplete(lesson.id, course.id);
    setMarkingDone(false);
    if (!result?.error) {
      setCompleted(true);
      router.refresh();
    }
  }, [completed, markingDone, lesson.id, course.id, router]);

  const scheduleSaveProgress = useCallback(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      const video = videoRef.current;
      if (!video) return;
      const timeSpent = Math.floor((Date.now() - sessionStartRef.current) / 1000);
      await saveVideoProgress(lesson.id, course.id, video.currentTime, timeSpent);
    }, 5000);
  }, [lesson.id, course.id]);

  useEffect(() => {
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, []);

  const toggleModule = (id: string) => {
    setExpandedModules((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const allLessonsFlat = modules.flatMap((m) => m.lessons.map((l) => ({ ...l, moduleTitle: m.title })));
  const currentIndex = allLessonsFlat.findIndex((l) => l.id === lesson.id);

  // Parse content lines as paragraphs
  const contentParagraphs = lesson.content ? lesson.content.split(/\n\n+/).filter(Boolean) : [];

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "#F1F3FB", fontFamily: "var(--font-sans)" }}>
      {/* Top bar */}
      <header
        className="sticky top-0 z-40 flex items-center gap-3 px-5 h-14"
        style={{ background: "#fff", borderBottom: "1px solid #E4E7F5", boxShadow: "0 1px 6px rgba(90,61,245,0.06)" }}
      >
        <Link href={`/dashboard/my-courses/${course.slug}`} className="flex items-center gap-1.5 text-xs font-semibold transition-colors" style={{ color: "#5A3DF5" }}>
          <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 12L6 8l4-4" />
          </svg>
          Course
        </Link>
        <div className="w-px h-4 shrink-0" style={{ background: "#E4E7F5" }} />
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#9CA3C8" }}>
            Module {moduleIndex + 1} · Lesson {lessonIndex + 1}
          </div>
          <div className="text-sm font-bold truncate" style={{ color: "#0F1023" }}>{lesson.title}</div>
        </div>
        {/* Progress */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-32 h-1.5 rounded-full overflow-hidden" style={{ background: "#E8EBFA" }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${progressPct}%`, background: "linear-gradient(90deg,#5A3DF5,#7B5CF8)" }} />
            </div>
            <span className="text-xs font-bold" style={{ color: "#5A3DF5" }}>{progressPct}%</span>
          </div>
        </div>
        <Link href="/dashboard" className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors shrink-0" style={{ background: "#F1F3FB", color: "#5A5A80" }}>
          Exit
        </Link>
      </header>

      {/* Body */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left sidebar */}
        <aside
          className="flex flex-col shrink-0 transition-all duration-300 overflow-hidden"
          style={{
            width: leftOpen ? 304 : 0,
            minWidth: leftOpen ? 304 : 0,
            background: "#fff",
            borderRight: "1px solid #E4E7F5",
          }}
        >
          <div className="flex-1 overflow-y-auto py-4 min-w-[304px]">
            <div className="px-4 mb-3">
              <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "#9CA3C8" }}>Course Outline</div>
              <div className="text-xs font-semibold truncate" style={{ color: "#0F1023" }}>{course.title}</div>
            </div>
            <div className="space-y-1 px-3">
              {modules.map((mod, mi) => (
                <div key={mod.id}>
                  <button
                    onClick={() => toggleModule(mod.id)}
                    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition-colors"
                    style={{ background: expandedModules[mod.id] ? "#F1F3FB" : "transparent" }}
                  >
                    <svg
                      viewBox="0 0 12 12" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="1.5"
                      className="shrink-0 transition-transform"
                      style={{
                        color: "#9CA3C8",
                        transform: expandedModules[mod.id] ? "rotate(90deg)" : "rotate(0deg)",
                      }}
                    >
                      <path d="M4 2l4 4-4 4" />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <div className="text-[9px] font-bold uppercase tracking-wider" style={{ color: "#9CA3C8" }}>Module {mi + 1}</div>
                      <div className="text-xs font-semibold truncate" style={{ color: "#0F1023" }}>{mod.title}</div>
                    </div>
                    {/* Module completion */}
                    {(() => {
                      const done = mod.lessons.filter((l) => completedLessonIds.includes(l.id) || (l.id === lesson.id && completed)).length;
                      const total = mod.lessons.length;
                      return (
                        <span className="text-[9px] font-bold shrink-0" style={{ color: done === total && total > 0 ? "#5A3DF5" : "#C0C4DC" }}>
                          {done}/{total}
                        </span>
                      );
                    })()}
                  </button>
                  {expandedModules[mod.id] && (
                    <div className="space-y-0.5 mt-0.5 ml-4">
                      {mod.lessons.map((l, li) => {
                        const isDone = completedLessonIds.includes(l.id) || (l.id === lesson.id && completed);
                        const isCurrent = l.id === lesson.id;
                        return (
                          <Link
                            key={l.id}
                            href={`/learn/${l.id}`}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors"
                            style={{
                              background: isCurrent ? "#EDE9FF" : "transparent",
                              opacity: 1,
                            }}
                          >
                            <span style={{ color: isDone ? "#5A3DF5" : isCurrent ? "#5A3DF5" : "#C0C4DC" }}>
                              {isDone ? (
                                <svg viewBox="0 0 14 14" width="14" height="14" fill="none">
                                  <circle cx="7" cy="7" r="6" fill="#5A3DF5" />
                                  <path d="M4.5 7l2 2 3-3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              ) : (
                                <span style={{ color: isCurrent ? "#5A3DF5" : "#C0C4DC" }}>
                                  {LESSON_ICONS[l.lesson_type] ?? LESSON_ICONS.text}
                                </span>
                              )}
                            </span>
                            <span
                              className="text-xs truncate"
                              style={{
                                color: isCurrent ? "#5A3DF5" : "#0F1023",
                                fontWeight: isCurrent ? 600 : 400,
                              }}
                            >
                              {li + 1}. {l.title}
                            </span>
                            {l.duration_mins && (
                              <span className="text-[9px] shrink-0 ml-auto" style={{ color: "#C0C4DC" }}>{l.duration_mins}m</span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Toggle button */}
        <button
          onClick={() => setLeftOpen((v) => !v)}
          className="absolute left-0 z-30 flex items-center justify-center w-5 h-10 rounded-r-lg transition-all"
          style={{
            top: "50%",
            transform: "translateY(-50%)",
            left: leftOpen ? 304 : 0,
            background: "#5A3DF5",
            color: "#fff",
            transition: "left 0.3s",
          }}
          aria-label="Toggle course outline"
        >
          <svg viewBox="0 0 10 10" width="8" height="8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d={leftOpen ? "M6 2L4 5l2 3" : "M4 2l2 3-2 3"} />
          </svg>
        </button>

        {/* Main content */}
        <main className="flex-1 min-w-0 overflow-y-auto pb-24">
          {/* Header band */}
          <div
            className="relative px-8 py-10 overflow-hidden"
            style={{
              background: "linear-gradient(135deg,#5A3DF5 0%,#3D1FA8 60%,#0F1023 100%)",
            }}
          >
            <div className="relative z-10 max-w-2xl">
              <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.55)" }}>
                {moduleTitle} · Lesson {lessonIndex + 1} of {totalLessons}
              </div>
              <h1 className="text-2xl font-extrabold mb-3 leading-tight" style={{ fontFamily: "var(--font-head)", color: "#fff" }}>
                {lesson.title}
              </h1>
              <div className="flex items-center gap-4">
                <span
                  className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full"
                  style={{ background: "rgba(255,255,255,0.13)", color: "rgba(255,255,255,0.85)" }}
                >
                  {lesson.lesson_type === "video" ? (
                    <svg viewBox="0 0 12 12" width="10" height="10" fill="currentColor"><polygon points="3,2 10,6 3,10" /></svg>
                  ) : (
                    <svg viewBox="0 0 12 12" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M2 3h8M2 6h8M2 9h5" /></svg>
                  )}
                  {lesson.lesson_type === "video" ? "Video Lesson" : "Text Lesson"}
                  {lesson.duration_mins && ` · ${lesson.duration_mins} min`}
                </span>
                {completed && (
                  <span
                    className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full"
                    style={{ background: "rgba(34,197,94,0.2)", color: "#4ade80" }}
                  >
                    <svg viewBox="0 0 12 12" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M2 6l3 3 5-5" />
                    </svg>
                    Completed
                  </span>
                )}
              </div>
            </div>
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10" style={{ background: "#7B5CF8", transform: "translate(30%,-30%)" }} />
            <div className="absolute bottom-0 right-16 w-40 h-40 rounded-full opacity-10" style={{ background: "#5A3DF5", transform: "translateY(50%)" }} />
          </div>

          <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">
            {/* Video player */}
            {lesson.video_url && (
              <div>
                <div
                  className="relative w-full rounded-2xl overflow-hidden"
                  style={{ aspectRatio: "16/9", background: "#0F1023", boxShadow: "0 8px 32px rgba(90,61,245,0.15)" }}
                >
                  {lesson.video_url.includes("youtube.com") || lesson.video_url.includes("youtu.be") ? (
                    <iframe
                      src={lesson.video_url.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/")}
                      className="absolute inset-0 w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : lesson.video_url.includes("vimeo.com") ? (
                    <iframe
                      src={lesson.video_url.replace("vimeo.com/", "player.vimeo.com/video/")}
                      className="absolute inset-0 w-full h-full"
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      ref={videoRef}
                      src={lesson.video_url}
                      controls
                      className="absolute inset-0 w-full h-full"
                      onTimeUpdate={scheduleSaveProgress}
                    />
                  )}
                </div>

                {/* Transcript toggle */}
                <button
                  onClick={() => setTranscriptOpen((v) => !v)}
                  className="flex items-center gap-2 mt-3 text-xs font-semibold transition-colors"
                  style={{ color: "#5A3DF5" }}
                >
                  <svg viewBox="0 0 14 14" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 4h10M2 7h10M2 10h6" />
                  </svg>
                  {transcriptOpen ? "Hide" : "Show"} Transcript
                  <svg
                    viewBox="0 0 10 10" width="8" height="8" fill="none" stroke="currentColor" strokeWidth="1.5"
                    className="transition-transform"
                    style={{ transform: transcriptOpen ? "rotate(180deg)" : "none" }}
                  >
                    <path d="M2 4l3 3 3-3" />
                  </svg>
                </button>

                {transcriptOpen && lesson.content && (
                  <div
                    className="mt-3 p-5 rounded-xl text-sm leading-relaxed"
                    style={{ background: "#F8F9FF", border: "1px solid #E4E7F5", color: "#3D3F5C", whiteSpace: "pre-wrap" }}
                  >
                    {lesson.content}
                  </div>
                )}
              </div>
            )}

            {/* Text content (non-video) */}
            {!lesson.video_url && lesson.content && (
              <div className="space-y-4">
                {contentParagraphs.map((para, i) => {
                  if (para.startsWith("# ")) return (
                    <h2 key={i} className="text-xl font-extrabold" style={{ fontFamily: "var(--font-head)", color: "#0F1023" }}>{para.slice(2)}</h2>
                  );
                  if (para.startsWith("## ")) return (
                    <h3 key={i} className="text-base font-bold" style={{ color: "#0F1023" }}>{para.slice(3)}</h3>
                  );
                  if (para.startsWith("- ")) {
                    const items = para.split("\n").filter((l) => l.startsWith("- ")).map((l) => l.slice(2));
                    return (
                      <ul key={i} className="space-y-1.5 pl-4">
                        {items.map((item, j) => (
                          <li key={j} className="text-sm flex gap-2" style={{ color: "#3D3F5C" }}>
                            <span style={{ color: "#5A3DF5", marginTop: 2 }}>•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    );
                  }
                  return (
                    <p key={i} className="text-sm leading-relaxed" style={{ color: "#3D3F5C" }}>{para}</p>
                  );
                })}
              </div>
            )}

            {/* Empty state */}
            {!lesson.video_url && !lesson.content && (
              <div className="text-center py-12" style={{ color: "#9CA3C8" }}>
                <svg viewBox="0 0 48 48" width="48" height="48" className="mx-auto mb-3 opacity-40" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 6h24a2 2 0 0 1 2 2v32a2 2 0 0 1-2 2H12a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" />
                  <path d="M16 16h16M16 22h16M16 28h10" />
                </svg>
                <p className="text-sm">Content coming soon.</p>
              </div>
            )}
          </div>
        </main>

        {/* Right panel */}
        <aside
          className="w-80 shrink-0 flex flex-col overflow-hidden"
          style={{ background: "#fff", borderLeft: "1px solid #E4E7F5" }}
        >
          {/* Progress ring */}
          <div className="px-5 pt-5 pb-4" style={{ borderBottom: "1px solid #E4E7F5" }}>
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 shrink-0">
                <svg viewBox="0 0 44 44" className="w-full h-full -rotate-90">
                  <circle cx="22" cy="22" r="18" fill="none" stroke="#E8EBFA" strokeWidth="4" />
                  <circle
                    cx="22" cy="22" r="18" fill="none" stroke="#5A3DF5" strokeWidth="4"
                    strokeDasharray={`${2 * Math.PI * 18}`}
                    strokeDashoffset={`${2 * Math.PI * 18 * (1 - progressPct / 100)}`}
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-extrabold" style={{ color: "#5A3DF5" }}>
                  {progressPct}%
                </div>
              </div>
              <div>
                <div className="text-sm font-bold" style={{ color: "#0F1023" }}>Course Progress</div>
                <div className="text-xs" style={{ color: "#9CA3C8" }}>{totalCompleted} of {totalAllLessons} lessons done</div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex" style={{ borderBottom: "1px solid #E4E7F5" }}>
            {(["resources", "notes", "checklist"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="flex-1 py-2.5 text-xs font-bold capitalize transition-colors"
                style={{
                  color: tab === t ? "#5A3DF5" : "#9CA3C8",
                  borderBottom: tab === t ? "2px solid #5A3DF5" : "2px solid transparent",
                }}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {/* Resources tab */}
            {tab === "resources" && (
              <div className="space-y-3">
                {resources.length === 0 ? (
                  <p className="text-xs text-center py-6" style={{ color: "#C0C4DC" }}>No resources for this lesson.</p>
                ) : (
                  resources.map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center gap-3 p-3 rounded-xl"
                      style={{ background: "#F8F9FF", border: "1px solid #E4E7F5" }}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: "#EDE9FF" }}
                      >
                        <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="#5A3DF5" strokeWidth="1.5" strokeLinecap="round">
                          <path d="M8 2H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V6L8 2Z" />
                          <path d="M8 2v4h4" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold truncate" style={{ color: "#0F1023" }}>{r.title}</div>
                        {r.resource_type && <div className="text-[10px] uppercase tracking-wide" style={{ color: "#9CA3C8" }}>{r.resource_type}</div>}
                      </div>
                      {r.external_url && (
                        <a
                          href={r.external_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold px-2 py-1 rounded-lg shrink-0"
                          style={{ background: "#5A3DF5", color: "#fff" }}
                        >
                          Open
                        </a>
                      )}
                    </div>
                  ))
                )}

                {/* Next lesson preview */}
                {nextLesson && (
                  <div className="mt-4 pt-4" style={{ borderTop: "1px solid #E4E7F5" }}>
                    <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: "#9CA3C8" }}>Up Next</div>
                    <Link
                      href={`/learn/${nextLesson.id}`}
                      className="flex items-center gap-2 p-3 rounded-xl transition-colors"
                      style={{ background: "#F1F3FB", border: "1px solid #E4E7F5" }}
                    >
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: "#EDE9FF" }}>
                        <svg viewBox="0 0 12 12" width="10" height="10" fill="none" stroke="#5A3DF5" strokeWidth="1.5" strokeLinecap="round">
                          <path d="M4 2l4 4-4 4" />
                        </svg>
                      </div>
                      <span className="text-xs font-semibold truncate" style={{ color: "#0F1023" }}>{nextLesson.title}</span>
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Notes tab */}
            {tab === "notes" && (
              <div>
                <div className="text-xs font-semibold mb-2" style={{ color: "#9CA3C8" }}>Your notes for this lesson</div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Type your notes here…"
                  rows={12}
                  className="w-full text-sm rounded-xl p-3 resize-none outline-none"
                  style={{
                    background: "#F8F9FF",
                    border: "1px solid #E4E7F5",
                    color: "#0F1023",
                    fontFamily: "var(--font-sans)",
                  }}
                />
                <p className="text-[10px] mt-1" style={{ color: "#C0C4DC" }}>Notes are saved locally in your browser.</p>
              </div>
            )}

            {/* Checklist tab */}
            {tab === "checklist" && (
              <div className="space-y-2">
                <div className="text-xs font-semibold mb-3" style={{ color: "#9CA3C8" }}>Learning Checklist</div>
                {[
                  "I watched / read the lesson fully",
                  "I understand the key concepts",
                  "I took notes or highlighted key points",
                  "I can apply this to my work",
                ].map((item, i) => (
                  <label
                    key={i}
                    className="flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-colors"
                    style={{ background: checklist[i] ? "#EDE9FF" : "#F8F9FF", border: `1px solid ${checklist[i] ? "#C4B8FC" : "#E4E7F5"}` }}
                  >
                    <div
                      className="w-4 h-4 rounded flex items-center justify-center shrink-0 mt-0.5 transition-colors"
                      style={{ background: checklist[i] ? "#5A3DF5" : "#fff", border: `1.5px solid ${checklist[i] ? "#5A3DF5" : "#D0D4E8"}` }}
                    >
                      {checklist[i] && (
                        <svg viewBox="0 0 10 10" width="8" height="8" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round">
                          <path d="M2 5l2 2 4-4" />
                        </svg>
                      )}
                    </div>
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={!!checklist[i]}
                      onChange={() => setChecklist((prev) => ({ ...prev, [i]: !prev[i] }))}
                    />
                    <span className="text-xs" style={{ color: checklist[i] ? "#5A3DF5" : "#3D3F5C" }}>{item}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Bottom fixed nav */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 flex items-center gap-3 px-6 h-16"
        style={{ background: "#fff", borderTop: "1px solid #E4E7F5", boxShadow: "0 -4px 16px rgba(90,61,245,0.06)" }}
      >
        {prevLesson ? (
          <Link
            href={`/learn/${prevLesson.id}`}
            className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
            style={{ background: "#F1F3FB", color: "#5A3DF5" }}
          >
            <svg viewBox="0 0 14 14" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M9 11L5 7l4-4" />
            </svg>
            Previous
          </Link>
        ) : (
          <div />
        )}

        <div className="flex-1 text-center">
          <div className="text-xs" style={{ color: "#9CA3C8" }}>
            {currentIndex + 1} / {allLessonsFlat.length} lessons
          </div>
        </div>

        {completed ? (
          nextLesson ? (
            <Link
              href={`/learn/${nextLesson.id}`}
              className="flex items-center gap-1.5 text-sm font-bold px-5 py-2.5 rounded-xl transition-colors"
              style={{ background: "#5A3DF5", color: "#fff" }}
            >
              Next Lesson
              <svg viewBox="0 0 14 14" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M5 3l4 4-4 4" />
              </svg>
            </Link>
          ) : (
            <Link
              href={`/dashboard/my-courses/${course.slug}`}
              className="flex items-center gap-1.5 text-sm font-bold px-5 py-2.5 rounded-xl"
              style={{ background: "#22c55e", color: "#fff" }}
            >
              Course Complete!
              <svg viewBox="0 0 14 14" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M2 7l4 4 6-6" />
              </svg>
            </Link>
          )
        ) : (
          <button
            onClick={handleMarkComplete}
            disabled={markingDone}
            className="flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-xl transition-all disabled:opacity-50"
            style={{ background: "linear-gradient(135deg,#5A3DF5,#7B5CF8)", color: "#fff" }}
          >
            {markingDone ? (
              <>
                <svg className="animate-spin" viewBox="0 0 14 14" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="7" cy="7" r="5" strokeOpacity="0.3" />
                  <path d="M7 2a5 5 0 0 1 5 5" />
                </svg>
                Saving…
              </>
            ) : (
              <>
                <svg viewBox="0 0 14 14" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M2 7l4 4 6-6" />
                </svg>
                Mark as Complete
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
