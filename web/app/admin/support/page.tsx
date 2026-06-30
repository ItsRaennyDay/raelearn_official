export default function SupportPage() {
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="font-extrabold text-2xl" style={{ fontFamily: "var(--font-head)", color: "#1A2E1C" }}>Support</h1>
        <p className="text-sm mt-0.5" style={{ color: "#7A9878" }}>Learner support tickets and requests</p>
      </div>
      <div className="rounded-2xl p-12 text-center" style={{ background: "#fff", border: "1.5px solid #E8EDE6" }}>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "#EEF5EE" }}>
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#2A5230" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 10h8M8 14h4" />
            <path d="M3 6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3H9l-6 3V6Z" />
          </svg>
        </div>
        <h2 className="font-bold text-lg mb-2" style={{ fontFamily: "var(--font-head)", color: "#1A2E1C" }}>Support Inbox</h2>
        <p className="text-sm max-w-md mx-auto" style={{ color: "#7A9878" }}>
          A ticketing system for learner support requests is coming soon.
        </p>
      </div>
    </div>
  );
}
