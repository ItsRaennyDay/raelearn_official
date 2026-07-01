import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import TemplateEditor from "./TemplateEditor";
import { TemplateSettings } from "@/lib/certificate-types";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}

export default async function EditTemplatePage({ params, searchParams }: Props) {
  const { id } = await params;
  const { saved } = await searchParams;
  const db = createAdminClient();

  const { data: template } = await db
    .from("certificate_templates")
    .select("id, name, settings")
    .eq("id", id)
    .single();

  if (!template) notFound();

  const { data: courses } = await db
    .from("courses")
    .select("id, title, certificate_template_id")
    .eq("certificate_eligible", true)
    .order("title");

  return (
    <div className="flex flex-col h-full" style={{ minHeight: 0 }}>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-4 shrink-0">
        <Link href="/admin/certificates" className="text-sm hover:underline" style={{ color: "#7A9878" }}>Certificates</Link>
        <span style={{ color: "#C8DEC8" }}>/</span>
        <Link href="/admin/certificates/templates" className="text-sm hover:underline" style={{ color: "#7A9878" }}>Templates</Link>
        <span style={{ color: "#C8DEC8" }}>/</span>
        <span className="text-sm font-semibold" style={{ color: "#1A2E1C" }}>{template.name}</span>
      </div>

      <div className="flex-1 min-h-0">
        <TemplateEditor
          id={template.id}
          initialName={template.name}
          initialSettings={template.settings as Partial<TemplateSettings>}
          courses={courses ?? []}
          savedParam={saved === "1"}
        />
      </div>
    </div>
  );
}
