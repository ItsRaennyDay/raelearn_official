import { createAdminClient } from "@/lib/supabase/admin";
import { DEFAULT_TEMPLATES, substitute, wrapLayout, type TemplateKey } from "./render";

export { BASE_URL, TEMPLATE_VARS, DEFAULT_TEMPLATES, type TemplateKey } from "./render";

// Fetches the admin-edited template from the DB if one exists, otherwise falls
// back to the built-in default. Renders subject/body with the given variables.
export async function renderEmail(
  key: TemplateKey,
  vars: Record<string, string>
): Promise<{ subject: string; html: string }> {
  const fallback = DEFAULT_TEMPLATES[key];
  let subject = fallback.subject;
  let body = fallback.body;

  try {
    const db = createAdminClient();
    const { data: row } = await db
      .from("email_templates")
      .select("subject, body_html")
      .eq("key", key)
      .single();
    if (row?.subject) subject = row.subject;
    if (row?.body_html) body = row.body_html;
  } catch {
    // No DB override — use built-in default.
  }

  return {
    subject: substitute(subject, vars),
    html: wrapLayout(substitute(body, vars)),
  };
}
