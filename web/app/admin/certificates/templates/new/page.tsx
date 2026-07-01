import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import TemplateEditor from "../[id]/TemplateEditor";

export default async function NewTemplatePage() {
  const db = createAdminClient();

  const { data: courses } = await db
    .from("courses")
    .select("id, title, certificate_template_id")
    .eq("certificate_eligible", true)
    .order("title");

  return (
    <div className="flex flex-col h-full" style={{ minHeight: 0 }}>
      <div className="flex items-center gap-2 mb-4 shrink-0">
        <Link href="/admin/certificates" className="text-sm hover:underline" style={{ color: "#7A9878" }}>Certificates</Link>
        <span style={{ color: "#C8DEC8" }}>/</span>
        <Link href="/admin/certificates/templates" className="text-sm hover:underline" style={{ color: "#7A9878" }}>Templates</Link>
        <span style={{ color: "#C8DEC8" }}>/</span>
        <span className="text-sm font-semibold" style={{ color: "#1A2E1C" }}>New Template</span>
      </div>

      <div className="flex-1 min-h-0">
        <TemplateEditor courses={courses ?? []} />
      </div>
    </div>
  );
}
