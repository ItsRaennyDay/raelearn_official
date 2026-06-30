export default function AuditLogsPage() {
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="font-extrabold text-2xl" style={{ fontFamily: "var(--font-head)", color: "#1A2E1C" }}>Audit Logs</h1>
        <p className="text-sm mt-0.5" style={{ color: "#7A9878" }}>Platform activity and security event trail</p>
      </div>
      <div className="rounded-2xl p-12 text-center" style={{ background: "#fff", border: "1.5px solid #E8EDE6" }}>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "#EEF5EE" }}>
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#2A5230" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 5H5a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1h-4" />
            <path d="M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v0a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2Z" />
            <path d="M9 12h6M9 16h4" />
          </svg>
        </div>
        <h2 className="font-bold text-lg mb-2" style={{ fontFamily: "var(--font-head)", color: "#1A2E1C" }}>Audit Trail</h2>
        <p className="text-sm max-w-md mx-auto" style={{ color: "#7A9878" }}>
          Tamper-evident logging of admin actions, payment events, and authentication activity is coming soon. Supabase Auth logs are always available in your Supabase dashboard.
        </p>
      </div>
    </div>
  );
}
