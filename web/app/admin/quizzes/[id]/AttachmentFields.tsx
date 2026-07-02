"use client";

import { useMemo, useState } from "react";

export interface CourseOption { id: string; title: string }
export interface LessonOption { id: string; title: string; courseId: string | null; courseTitle: string | null }

const selectCls = "px-3 py-2 text-[13px] rounded-xl border outline-none";
const label = "text-[11px] font-bold tracking-[0.04em] uppercase";

export default function AttachmentFields({
  courses, lessons, initialCourseId, initialLessonId,
}: {
  courses: CourseOption[];
  lessons: LessonOption[];
  initialCourseId: string;
  initialLessonId: string;
}) {
  const initialLesson = lessons.find((l) => l.id === initialLessonId);
  // If a lesson is already attached but no course was explicitly set, narrow
  // to that lesson's own course so the picker starts in a sensible state.
  const [courseId, setCourseId] = useState(initialCourseId || initialLesson?.courseId || "");
  const [lessonId, setLessonId] = useState(initialLessonId);

  const filteredLessons = useMemo(
    () => (courseId ? lessons.filter((l) => l.courseId === courseId) : lessons),
    [courseId, lessons]
  );

  function handleCourseChange(next: string) {
    setCourseId(next);
    const stillValid = lessonId && lessons.find((l) => l.id === lessonId)?.courseId === next;
    if (!stillValid) setLessonId("");
  }

  return (
    <>
      <div className="flex flex-col gap-1.5">
        <label className={label} style={{ color: "var(--admin-text-muted)" }}>Course</label>
        <select
          name="course_id"
          value={courseId}
          onChange={(e) => handleCourseChange(e.target.value)}
          className={selectCls}
          style={{ borderColor: "var(--admin-border-mid)", background: "var(--admin-table-head-bg)", color: "var(--admin-text-primary)" }}
        >
          <option value="">All courses</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>{c.title}</option>
          ))}
        </select>
        <p className="text-[11px]" style={{ color: "var(--admin-text-dim)" }}>Narrows the lesson list below. Only saved as the attachment if no lesson is picked.</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={label} style={{ color: "var(--admin-text-muted)" }}>Lesson</label>
        <select
          name="lesson_id"
          value={lessonId}
          onChange={(e) => setLessonId(e.target.value)}
          className={selectCls}
          style={{ borderColor: "var(--admin-border-mid)", background: "var(--admin-table-head-bg)", color: "var(--admin-text-primary)" }}
        >
          <option value="">None</option>
          {filteredLessons.map((l) => (
            <option key={l.id} value={l.id}>
              {courseId ? l.title : `${l.courseTitle ? `${l.courseTitle} — ` : ""}${l.title}`}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}
