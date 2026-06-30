export default function AssignmentsPage() {
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="font-extrabold text-2xl" style={{ fontFamily: "var(--font-head)", color: "#1A2E1C" }}>Assignments</h1>
        <p className="text-sm mt-0.5" style={{ color: "#7A9878" }}>Review and grade learner submissions</p>
      </div>
      <div className="rounded-2xl p-12 text-center" style={{ background: "#fff", border: "1.5px solid #E8EDE6" }}>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "#EEF5EE" }}>
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#2A5230" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 3l5 5-9 9H7V12l9-9Z" /><path d="M14 5l5 5" />
          </svg>
        </div>
        <h2 className="font-bold text-lg mb-2" style={{ fontFamily: "var(--font-head)", color: "#1A2E1C" }}>Assignment Grader</h2>
        <p className="text-sm max-w-md mx-auto" style={{ color: "#7A9878" }}>
          Submission review, grading workflow, and feedback tools are coming soon. Assignment blocks can already be added in the Lesson Editor.
        </p>
      </div>
    </div>
  );
}
