import { createAdminClient } from "@/lib/supabase/admin";
import { headers } from "next/headers";

export async function logAction({
  actorId,
  action,
  tableName,
  recordId,
  oldValues,
  newValues,
}: {
  actorId: string | null;
  action: string;
  tableName: string;
  recordId?: string | null;
  oldValues?: Record<string, unknown> | null;
  newValues?: Record<string, unknown> | null;
}) {
  try {
    const h = await headers();
    const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
    const userAgent = h.get("user-agent") ?? null;
    const db = createAdminClient();
    await db.from("audit_logs").insert({
      actor_id: actorId,
      action,
      table_name: tableName,
      record_id: recordId ?? null,
      old_values: oldValues ?? null,
      new_values: newValues ?? null,
      ip_address: ip,
      user_agent: userAgent,
    });
  } catch {
    // Audit logging must never crash the main flow
  }
}
