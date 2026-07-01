export default function ResourcesPage() {
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="font-extrabold text-2xl" style={{ fontFamily: "var(--font-head)", color: "var(--admin-text-primary)" }}>Resources</h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--admin-text-muted)" }}>Manage downloadable files and attachments</p>
      </div>
      <div className="rounded-2xl p-12 text-center" style={{ background: "var(--admin-card-bg)", border: "1.5px solid var(--admin-border)" }}>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "#EEF5EE" }}>
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#2A5230" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6" /><path d="M12 18v-6m-3 3 3 3 3-3" />
          </svg>
        </div>
        <h2 className="font-bold text-lg mb-2" style={{ fontFamily: "var(--font-head)", color: "var(--admin-text-primary)" }}>Resource Library</h2>
        <p className="text-sm max-w-md mx-auto" style={{ color: "var(--admin-text-muted)" }}>
          A central file library with upload management and lesson attachment tracking is coming soon. Files can be added to lessons via the Download block in the Lesson Editor.
        </p>
      </div>
    </div>
  );
}
