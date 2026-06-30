export default function QuizzesPage() {
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="font-extrabold text-2xl" style={{ fontFamily: "var(--font-head)", color: "#1A2E1C" }}>Quizzes</h1>
        <p className="text-sm mt-0.5" style={{ color: "#7A9878" }}>Manage quiz blocks across all lessons</p>
      </div>
      <ComingSoon
        title="Quiz Manager"
        description="A dedicated quiz builder with question banks, randomization, and scoring rules is coming soon. For now, create quiz blocks directly inside the Lesson Editor."
      />
    </div>
  );
}

function ComingSoon({ title, description }: { title: string; description: string }) {
  return (
    <div
      className="rounded-2xl p-12 text-center"
      style={{ background: "#fff", border: "1.5px solid #E8EDE6" }}
    >
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
        style={{ background: "#EEF5EE" }}
      >
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#2A5230" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v5" />
          <circle cx="12" cy="16" r=".5" fill="#2A5230" stroke="none" />
        </svg>
      </div>
      <h2 className="font-bold text-lg mb-2" style={{ fontFamily: "var(--font-head)", color: "#1A2E1C" }}>{title}</h2>
      <p className="text-sm max-w-md mx-auto" style={{ color: "#7A9878" }}>{description}</p>
    </div>
  );
}
