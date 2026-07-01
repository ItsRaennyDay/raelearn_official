const TEMPLATES = [
  { key: "welcome",           label: "Welcome Email",             description: "Sent when a new user registers" },
  { key: "enrollment",        label: "Enrollment Confirmation",   description: "Sent after successful enrollment" },
  { key: "course_complete",   label: "Course Completion",         description: "Sent when a learner completes a course" },
  { key: "certificate",       label: "Certificate Issued",        description: "Sent with certificate download link" },
  { key: "payment_receipt",   label: "Payment Receipt",           description: "Sent after successful Xendit payment" },
  { key: "payment_failed",    label: "Payment Failed",            description: "Sent when a payment fails" },
  { key: "org_invite",        label: "Organization Invite",       description: "Sent to users invited to an organization" },
  { key: "password_reset",    label: "Password Reset",            description: "Password reset link email" },
];

export default function EmailTemplatesPage() {
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="font-extrabold text-2xl" style={{ fontFamily: "var(--font-head)", color: "var(--admin-text-primary)" }}>Email Templates</h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--admin-text-muted)" }}>Transactional email templates for platform events</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-8">
        {TEMPLATES.map((t) => (
          <div
            key={t.key}
            className="rounded-xl p-4 flex items-start gap-4"
            style={{ background: "var(--admin-card-bg)", border: "1.5px solid var(--admin-border)" }}
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#EEF5EE" }}>
              <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="#2A5230" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="16" height="13" rx="1.5" />
                <path d="M2 7l8 5.5L18 7" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm" style={{ color: "var(--admin-text-primary)" }}>{t.label}</div>
              <div className="text-xs mt-0.5" style={{ color: "var(--admin-text-dim)" }}>{t.description}</div>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full shrink-0" style={{ background: "#F3F3F3", color: "#888" }}>
              Soon
            </span>
          </div>
        ))}
      </div>

      <div className="rounded-2xl p-8 text-center" style={{ background: "var(--admin-card-bg)", border: "1.5px solid var(--admin-border)" }}>
        <p className="text-sm" style={{ color: "var(--admin-text-muted)" }}>
          Visual email template editor with preview, variable insertion, and send-test is coming soon.
        </p>
      </div>
    </div>
  );
}
