const SETTING_GROUPS = [
  {
    label: "Platform",
    items: [
      { key: "site_name", label: "Site Name", value: "RaeLearn", type: "text" },
      { key: "site_url", label: "Site URL", value: "https://raelearn.com", type: "text" },
      { key: "support_email", label: "Support Email", value: "support@raelearn.com", type: "email" },
    ],
  },
  {
    label: "Payments (Xendit)",
    items: [
      { key: "xendit_mode", label: "Mode", value: "Test", type: "select" },
      { key: "currency", label: "Currency", value: "PHP", type: "text" },
    ],
  },
  {
    label: "Enrollment",
    items: [
      { key: "free_preview", label: "Allow free preview of first lesson", value: "Enabled", type: "toggle" },
      { key: "cert_threshold", label: "Certificate pass threshold (%)", value: "80", type: "number" },
    ],
  },
];

export default function SettingsPage() {
  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="font-extrabold text-2xl" style={{ fontFamily: "var(--font-head)", color: "var(--admin-text-primary)" }}>Settings</h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--admin-text-muted)" }}>Platform-wide configuration</p>
      </div>

      <div className="space-y-6">
        {SETTING_GROUPS.map((group) => (
          <div key={group.label} className="rounded-2xl overflow-hidden" style={{ background: "var(--admin-card-bg)", border: "1.5px solid var(--admin-border)" }}>
            <div className="px-5 py-3" style={{ borderBottom: "1px solid var(--admin-border)", background: "var(--admin-table-head-bg)" }}>
              <h2 className="font-bold text-sm" style={{ color: "var(--admin-accent)" }}>{group.label}</h2>
            </div>
            <div className="divide-y" style={{ borderColor: "var(--admin-table-row-border)" }}>
              {group.items.map((item) => (
                <div key={item.key} className="px-5 py-4 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-medium" style={{ color: "var(--admin-text-primary)" }}>{item.label}</div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm" style={{ color: "var(--admin-text-muted)" }}>{item.value}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#F3F3F3", color: "#888" }}>
                      Soon
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-xl p-4 text-sm" style={{ background: "#FFF8E8", border: "1px solid #EAD9B5", color: "#8A6020" }}>
        Settings editor with live save is coming soon. Configure environment variables directly in your hosting provider (Vercel) for now.
      </div>
    </div>
  );
}
