import { notFound } from "next/navigation";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { DEFAULT_TEMPLATES, TEMPLATE_VARS, type TemplateKey } from "@/lib/email/render";
import EmailTemplateEditor from "./EmailTemplateEditor";

interface Props {
  params: Promise<{ key: string }>;
  searchParams: Promise<{ saved?: string; reset?: string; error?: string }>;
}

export default async function EmailTemplateEditPage({ params, searchParams }: Props) {
  const { key } = await params;
  const { saved, reset, error } = await searchParams;

  if (!(key in DEFAULT_TEMPLATES)) notFound();
  const templateKey = key as TemplateKey;
  const fallback = DEFAULT_TEMPLATES[templateKey];

  const db = createAdminClient();
  const { data: row } = await db
    .from("email_templates")
    .select("subject, body_html, updated_at")
    .eq("key", templateKey)
    .single();

  return (
    <div className="p-4 md:p-8 max-w-5xl">
      <div className="flex items-center gap-2 mb-4">
        <Link href="/admin/email-templates" className="text-sm hover:underline" style={{ color: "var(--admin-text-muted)" }}>Email Templates</Link>
        <span style={{ color: "var(--admin-border-mid)" }}>/</span>
        <span className="text-sm font-semibold" style={{ color: "var(--admin-text-primary)" }}>{fallback.label}</span>
      </div>

      {saved && (
        <div className="mb-4 px-4 py-3 rounded-xl text-sm font-medium" style={{ background: "var(--admin-card-bg-alt)", color: "var(--admin-text-muted)", border: "1px solid var(--admin-border)" }}>
          Template saved.
        </div>
      )}
      {reset && (
        <div className="mb-4 px-4 py-3 rounded-xl text-sm font-medium" style={{ background: "var(--admin-card-bg-alt)", color: "var(--admin-text-muted)", border: "1px solid var(--admin-border)" }}>
          Reset to the default template.
        </div>
      )}
      {error === "missing-fields" && (
        <div className="mb-4 px-4 py-3 rounded-xl text-sm font-medium" style={{ background: "#FFF0F0", color: "#AA2222", border: "1px solid #FFCCCC" }}>
          Subject and body are required.
        </div>
      )}

      <EmailTemplateEditor
        templateKey={templateKey}
        label={fallback.label}
        availableVars={TEMPLATE_VARS[templateKey]}
        initialSubject={row?.subject ?? fallback.subject}
        initialBody={row?.body_html ?? fallback.body}
        isCustomized={!!row}
        lastUpdated={row?.updated_at ?? null}
      />
    </div>
  );
}
