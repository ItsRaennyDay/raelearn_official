"use client";

import { useMemo, useState } from "react";
import { wrapLayout, substitute, TEMPLATE_PREVIEW_VARS, type TemplateKey } from "@/lib/email/render";
import { saveTemplate, resetTemplate } from "../actions";

interface Props {
  templateKey: TemplateKey;
  label: string;
  availableVars: string[];
  initialSubject: string;
  initialBody: string;
  isCustomized: boolean;
  lastUpdated: string | null;
}

export default function EmailTemplateEditor({
  templateKey,
  label,
  availableVars,
  initialSubject,
  initialBody,
  isCustomized,
  lastUpdated,
}: Props) {
  const [subject, setSubject] = useState(initialSubject);
  const [body, setBody] = useState(initialBody);

  const previewVars = TEMPLATE_PREVIEW_VARS[templateKey];
  const previewHtml = useMemo(() => wrapLayout(substitute(body, previewVars)), [body, previewVars]);
  const previewSubject = useMemo(() => substitute(subject, previewVars), [subject, previewVars]);

  const inputStyle = {
    borderColor: "var(--admin-border-mid)",
    background: "var(--admin-table-head-bg)",
    color: "var(--admin-text-primary)",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="font-extrabold text-2xl" style={{ fontFamily: "var(--font-head)", color: "var(--admin-text-primary)" }}>{label}</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--admin-text-dim)" }}>
            {isCustomized
              ? `Custom template · last saved ${lastUpdated ? new Date(lastUpdated).toLocaleString() : ""}`
              : "Using the built-in default — no custom version saved yet."}
          </p>
        </div>
        {isCustomized && (
          <form action={resetTemplate} onSubmit={(e) => { if (!confirm("Reset to the default template? This deletes your customizations.")) e.preventDefault(); }}>
            <input type="hidden" name="key" value={templateKey} />
            <button type="submit" className="text-xs font-bold px-3 py-2 rounded-lg" style={{ background: "#FFF0F0", color: "#AA2222" }}>
              Reset to Default
            </button>
          </form>
        )}
      </div>

      <div className="mb-4 px-4 py-3 rounded-xl text-xs" style={{ background: "var(--admin-table-head-bg)", border: "1px solid var(--admin-border)", color: "var(--admin-text-muted)" }}>
        Available variables: {availableVars.map((v) => (
          <code key={v} className="mx-1 px-1.5 py-0.5 rounded font-mono" style={{ background: "#EEF5EE", color: "#2A5230" }}>{`{{${v}}}`}</code>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <form action={saveTemplate} className="flex flex-col gap-4">
          <input type="hidden" name="key" value={templateKey} />
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold" style={{ color: "var(--admin-text-muted)" }}>Subject</label>
            <input
              name="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-2 text-sm rounded-xl border outline-none"
              style={inputStyle}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold" style={{ color: "var(--admin-text-muted)" }}>Body (HTML)</label>
            <textarea
              name="bodyHtml"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={16}
              className="w-full px-4 py-3 text-xs font-mono rounded-xl border outline-none resize-y"
              style={inputStyle}
            />
          </div>
          <button
            type="submit"
            className="self-start px-5 py-2 text-sm font-bold rounded-xl"
            style={{ background: "#2A5230", color: "#fff" }}
          >
            Save Template
          </button>
        </form>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold" style={{ color: "var(--admin-text-muted)" }}>
            Live Preview <span className="font-normal" style={{ color: "var(--admin-text-dim)" }}>(sample data)</span>
          </label>
          <div className="text-sm font-semibold px-4 py-2 rounded-t-xl" style={{ background: "var(--admin-table-head-bg)", border: "1px solid var(--admin-border)", borderBottom: "none", color: "var(--admin-text-primary)" }}>
            {previewSubject}
          </div>
          <iframe
            title="Email preview"
            srcDoc={previewHtml}
            className="w-full rounded-b-xl"
            style={{ height: 520, border: "1px solid var(--admin-border)" }}
          />
        </div>
      </div>
    </div>
  );
}
