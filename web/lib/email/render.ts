// Pure, client-safe email rendering pieces — no server-only imports here,
// so the admin editor's live preview can use the exact same logic.

export const BASE_URL = "https://raelearn.byraeform.com";
const LOGO_URL = `${BASE_URL}/raelearn-mark.png`;

export type TemplateKey = "welcome" | "enrollment" | "certificate";

export const TEMPLATE_VARS: Record<TemplateKey, string[]> = {
  welcome: ["firstName", "ctaUrl"],
  enrollment: ["firstName", "courseTitle", "ctaUrl"],
  certificate: ["firstName", "courseTitle", "ctaUrl"],
};

export const TEMPLATE_PREVIEW_VARS: Record<TemplateKey, Record<string, string>> = {
  welcome: { firstName: "Jamie", ctaUrl: `${BASE_URL}/courses` },
  enrollment: { firstName: "Jamie", courseTitle: "Virtual Assistant Foundations", ctaUrl: `${BASE_URL}/dashboard` },
  certificate: { firstName: "Jamie", courseTitle: "Virtual Assistant Foundations", ctaUrl: `${BASE_URL}/dashboard/certificates/sample` },
};

export const DEFAULT_TEMPLATES: Record<TemplateKey, { label: string; subject: string; body: string }> = {
  welcome: {
    label: "Welcome Email",
    subject: "Welcome to RaeLearn 🎉",
    body: `<h1 style="margin:0 0 16px;font-size:22px;color:#2A5230;">Welcome, {{firstName}}!</h1>
<p>Thanks for joining RaeLearn. You're all set to start learning practical skills for VAs, founders, and nonprofit leaders.</p>
<p>Browse our courses and enroll in your first one to get started.</p>
<a href="{{ctaUrl}}" style="display:inline-block;background:#2A5230;color:#FFFFFF;text-decoration:none;font-weight:bold;font-size:14px;padding:12px 24px;border-radius:10px;margin-top:20px;">Browse Courses →</a>`,
  },
  enrollment: {
    label: "Enrollment Confirmation",
    subject: "You're enrolled in {{courseTitle}}",
    body: `<h1 style="margin:0 0 16px;font-size:22px;color:#2A5230;">You're in, {{firstName}}!</h1>
<p>You've successfully enrolled in <strong>{{courseTitle}}</strong>.</p>
<p>Head to your dashboard to start learning.</p>
<a href="{{ctaUrl}}" style="display:inline-block;background:#2A5230;color:#FFFFFF;text-decoration:none;font-weight:bold;font-size:14px;padding:12px 24px;border-radius:10px;margin-top:20px;">Go to Dashboard →</a>`,
  },
  certificate: {
    label: "Certificate Issued",
    subject: "Your certificate for {{courseTitle}} is ready",
    body: `<h1 style="margin:0 0 16px;font-size:22px;color:#2A5230;">Congratulations, {{firstName}}!</h1>
<p>Your certificate for completing <strong>{{courseTitle}}</strong> has been issued.</p>
<a href="{{ctaUrl}}" style="display:inline-block;background:#2A5230;color:#FFFFFF;text-decoration:none;font-weight:bold;font-size:14px;padding:12px 24px;border-radius:10px;margin-top:20px;">View Certificate →</a>`,
  },
};

export function wrapLayout(bodyHtml: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F5F0E8;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F5F0E8;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#FFFFFF;border-radius:16px;overflow:hidden;max-width:560px;">
        <tr><td style="background:#2A5230;padding:28px 32px;">
          <img src="${LOGO_URL}" width="40" height="40" alt="RaeLearn" style="display:block;border-radius:8px;">
        </td></tr>
        <tr><td style="padding:32px;color:#2B2B2B;font-size:15px;line-height:1.6;">
          ${bodyHtml}
        </td></tr>
        <tr><td style="padding:20px 32px;border-top:1px solid #EEE;">
          <p style="margin:0;font-size:12px;color:#999;">RaeLearn · by RAEFORM</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function substitute(text: string, vars: Record<string, string>): string {
  return text.replace(/{{\s*(\w+)\s*}}/g, (_, key) => vars[key] ?? "");
}
