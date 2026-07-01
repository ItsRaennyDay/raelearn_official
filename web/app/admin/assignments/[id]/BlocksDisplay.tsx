import React from "react";

// ── Types ─────────────────────────────────────────────────────────────────────
type HeadingLevel = 1 | 2 | 3 | 4;
type CalloutVariant = "tip" | "warning" | "info" | "note";
type BulletStyle = "disc" | "circle" | "square" | "arrow" | "check" | "dash" | "star" | "number";

interface ParagraphBlock  { type: "paragraph";  text: string }
interface HeadingBlock    { type: "heading";    text: string; level: HeadingLevel }
interface QuoteBlock      { type: "quote";      text: string; attribution?: string }
interface CalloutBlock    { type: "callout";    variant: CalloutVariant; title?: string; text: string }
interface VideoBlock      { type: "video";      url: string; title?: string; caption?: string }
interface QuizBlock       { type: "quiz";       question: string; options: string[]; correct: number; explanation?: string }
interface BulletListBlock { type: "bulletlist"; items: string[]; style: BulletStyle }
interface TableBlock      { type: "table";      headers: string[]; rows: string[][] }
interface ChecklistBlock  { type: "checklist";  items: { text: string; checked: boolean }[] }
interface CodeBlock       { type: "code";       code: string; language?: string }
interface ResourceBlock   { type: "resource";   url: string; title: string; description?: string }
interface DividerBlock    { type: "divider" }
interface FlashcardBlock  { type: "flashcard";  cards: { front: string; back: string }[] }

type Block =
  | ParagraphBlock | HeadingBlock | QuoteBlock | CalloutBlock | VideoBlock | QuizBlock
  | BulletListBlock | TableBlock | ChecklistBlock | CodeBlock | ResourceBlock | DividerBlock | FlashcardBlock;

// ── Helpers ───────────────────────────────────────────────────────────────────
function renderRich(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("*")  && part.endsWith("*")  && part.length > 2)  return <em key={i}>{part.slice(1, -1)}</em>;
    return part;
  });
}

function getEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com")) { const v = u.searchParams.get("v"); return v ? `https://www.youtube.com/embed/${v}` : null; }
    if (u.hostname.includes("youtu.be"))    return `https://www.youtube.com/embed${u.pathname}`;
    if (u.hostname.includes("vimeo.com"))   { const id = u.pathname.split("/").filter(Boolean).pop(); return id ? `https://player.vimeo.com/video/${id}` : null; }
  } catch { /* */ }
  return null;
}

const CALLOUT_META: Record<CalloutVariant, { icon: React.ReactNode; color: string; bg: string; border: string }> = {
  tip: {
    icon: <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 14h6M8.5 17h3M10 2a6 6 0 0 0-3.8 10.6c.5.4.8 1 .8 1.4H13c0-.4.3-1 .8-1.4A6 6 0 0 0 10 2Z" /></svg>,
    color: "#166534", bg: "#F0FDF4", border: "#86EFAC",
  },
  warning: {
    icon: <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8.57 3.23a1.64 1.64 0 0 1 2.86 0l5.97 10.35A1.64 1.64 0 0 1 16 16H4a1.64 1.64 0 0 1-1.4-2.42L8.57 3.23Z" /><path d="M10 8v3M10 13.5v.5" /></svg>,
    color: "#92400E", bg: "#FFFBEB", border: "#FCD34D",
  },
  info: {
    icon: <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="10" cy="10" r="7.5" /><path d="M10 9v5M10 6.5v.5" /></svg>,
    color: "#1E40AF", bg: "#EFF6FF", border: "#93C5FD",
  },
  note: {
    icon: <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 2v9M8 4h4M6 11h8l-1 2H7l-1-2ZM10 13v5" /></svg>,
    color: "#374151", bg: "#F9FAFB", border: "#D1D5DB",
  },
};

const BULLET_CHARS: Record<BulletStyle, string> = {
  disc: "•", circle: "○", square: "▪", arrow: "→", check: "✓", dash: "—", star: "★", number: "",
};

// ── Block renderer ────────────────────────────────────────────────────────────
function BlockDisplay({ block }: { block: Block }) {
  if (block.type === "paragraph") {
    return (
      <p className="text-[15px] leading-[1.8] whitespace-pre-wrap" style={{ color: "var(--admin-text-primary)" }}>
        {block.text ? renderRich(block.text) : null}
      </p>
    );
  }

  if (block.type === "heading") {
    const Tag = `h${block.level}` as "h1" | "h2" | "h3" | "h4";
    const size = block.level === 1 ? "text-3xl" : block.level === 2 ? "text-2xl" : block.level === 3 ? "text-xl" : "text-lg";
    return (
      <Tag className={`${size} ${block.level <= 2 ? "font-extrabold" : "font-bold"}`} style={{ fontFamily: "var(--font-head)", color: "var(--admin-text-primary)" }}>
        {block.text}
      </Tag>
    );
  }

  if (block.type === "quote") {
    return (
      <blockquote className="px-5 py-4 rounded-r-2xl" style={{ borderLeft: "4px solid #2A5230", background: "#F5FAF5" }}>
        <p className="text-[15px] leading-relaxed italic" style={{ color: "#2A5230" }}>
          {block.text ? renderRich(block.text) : ""}
        </p>
        {block.attribution && <p className="text-xs font-semibold mt-2" style={{ color: "#2A5230" }}>{block.attribution}</p>}
      </blockquote>
    );
  }

  if (block.type === "callout") {
    const m = CALLOUT_META[block.variant] ?? CALLOUT_META.note;
    return (
      <div className="flex gap-3 px-4 py-4 rounded-xl" style={{ background: m.bg, borderLeft: `4px solid ${m.border}`, color: m.color }}>
        <span className="shrink-0">{m.icon}</span>
        <div>
          {block.title && <p className="font-bold text-sm mb-1">{block.title}</p>}
          <p className="text-sm leading-relaxed">{block.text ? renderRich(block.text) : ""}</p>
        </div>
      </div>
    );
  }

  if (block.type === "video") {
    const embed = getEmbedUrl(block.url);
    return (
      <div>
        {block.title && <p className="font-semibold text-sm mb-2" style={{ color: "var(--admin-text-primary)" }}>{block.title}</p>}
        {embed ? (
          <div className="relative w-full rounded-2xl overflow-hidden" style={{ paddingBottom: "56.25%" }}>
            <iframe src={embed} className="absolute inset-0 w-full h-full" allow="autoplay; fullscreen" allowFullScreen />
          </div>
        ) : (
          <div className="rounded-2xl flex items-center justify-center p-8 text-sm" style={{ background: "#F0F7F0", border: "2px dashed #B8D4B5", color: "var(--admin-text-dim)" }}>
            {block.url ? "Invalid video URL" : "No video URL"}
          </div>
        )}
        {block.caption && <p className="text-xs text-center mt-2" style={{ color: "var(--admin-text-dim)" }}>{block.caption}</p>}
      </div>
    );
  }

  if (block.type === "bulletlist") {
    return (
      <ul className="space-y-1.5">
        {block.items.map((item, i) => (
          <li key={i} className="flex items-start gap-2.5 text-[15px] leading-relaxed" style={{ color: "var(--admin-text-primary)" }}>
            <span className="shrink-0 font-bold mt-0.5" style={{ color: "#2A5230", minWidth: 18, textAlign: "center" as const }}>
              {block.style === "number" ? `${i + 1}.` : (BULLET_CHARS[block.style] ?? "•")}
            </span>
            <span>{item ? renderRich(item) : ""}</span>
          </li>
        ))}
      </ul>
    );
  }

  if (block.type === "checklist") {
    return (
      <div className="space-y-2">
        {block.items.map((item, i) => (
          <div key={i} className="flex items-start gap-3">
            <span className="w-5 h-5 rounded border-2 shrink-0 mt-0.5" style={{ borderColor: "#B8D4B5" }} />
            <span className="text-sm leading-relaxed" style={{ color: "var(--admin-text-primary)" }}>
              {item.text ? renderRich(item.text) : ""}
            </span>
          </div>
        ))}
      </div>
    );
  }

  if (block.type === "code") {
    return (
      <div className="rounded-xl overflow-hidden" style={{ background: "#0D1F0E" }}>
        {block.language && block.language !== "text" && (
          <div className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest" style={{ background: "#1A3820", color: "#7DAA82", borderBottom: "1px solid #2A5230" }}>
            {block.language}
          </div>
        )}
        <pre className="px-4 py-4 text-sm overflow-x-auto" style={{ color: "#A8D4AC", lineHeight: 1.65 }}>
          {block.code || ""}
        </pre>
      </div>
    );
  }

  if (block.type === "resource") {
    return (
      <a href={block.url || "#"} target="_blank" rel="noopener noreferrer"
        className="flex items-center gap-4 p-4 rounded-2xl"
        style={{ background: "var(--admin-card-bg)", border: "2px solid var(--admin-border)", textDecoration: "none" }}
      >
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm truncate" style={{ color: "var(--admin-text-primary)" }}>{block.title || "Resource"}</div>
          {block.description && <div className="text-xs mt-0.5 truncate" style={{ color: "var(--admin-text-dim)" }}>{block.description}</div>}
          <div className="text-xs font-bold mt-1 truncate" style={{ color: "#7C3AED" }}>{block.url}</div>
        </div>
      </a>
    );
  }

  if (block.type === "table") {
    return (
      <div className="overflow-x-auto rounded-xl" style={{ border: "1px solid var(--admin-border)" }}>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr style={{ background: "#EEF5EE" }}>
              {block.headers.map((h, c) => (
                <th key={c} className="px-4 py-2.5 text-left text-xs font-bold" style={{ color: "#2A5230", borderBottom: "1px solid var(--admin-border)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row, r) => (
              <tr key={r} style={{ background: r % 2 === 0 ? "var(--admin-table-head-bg)" : "transparent" }}>
                {row.map((cell, c) => (
                  <td key={c} className="px-4 py-2.5 text-xs" style={{ color: "var(--admin-text-primary)" }}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (block.type === "quiz") {
    return (
      <div className="rounded-2xl overflow-hidden" style={{ border: "1.5px solid var(--admin-border)" }}>
        <div className="px-5 py-3.5 flex items-center gap-2" style={{ background: "#EEF5EE", borderBottom: "1px solid var(--admin-border)" }}>
          <span className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-extrabold" style={{ background: "#2A5230", color: "#fff" }}>Q</span>
          <span className="text-xs font-bold uppercase tracking-wide" style={{ color: "#2A5230" }}>Knowledge Check</span>
        </div>
        <div className="px-5 py-4">
          <p className="font-semibold text-[15px] mb-3" style={{ color: "var(--admin-text-primary)" }}>{block.question}</p>
          <div className="space-y-2">
            {block.options.map((opt, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl border-2"
                style={{ borderColor: i === block.correct ? "#2A5230" : "var(--admin-border)", background: i === block.correct ? "#EEF5EE" : "var(--admin-card-bg)" }}>
                <span className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0"
                  style={{ borderColor: i === block.correct ? "#2A5230" : "var(--admin-border-mid)", background: i === block.correct ? "#2A5230" : "transparent" }}>
                  {i === block.correct && <svg viewBox="0 0 10 10" width="9" height="9" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 5l2 2 4-4" /></svg>}
                </span>
                <span className="text-sm" style={{ color: i === block.correct ? "#2A5230" : "var(--admin-text-primary)" }}>{opt}</span>
              </div>
            ))}
          </div>
          {block.explanation && (
            <div className="mt-3 px-4 py-2 rounded-xl text-sm" style={{ background: "#EEF5EE", color: "#2A5230" }}>{block.explanation}</div>
          )}
        </div>
      </div>
    );
  }

  if (block.type === "flashcard") {
    const cards = Array.isArray(block.cards) ? block.cards : [];
    return (
      <div className="space-y-2">
        {cards.map((card, i) => (
          <div key={i} className="rounded-xl overflow-hidden" style={{ border: "1.5px solid var(--admin-border)" }}>
            <div className="px-4 py-3" style={{ background: "#EEF5EE", borderBottom: "1px solid var(--admin-border)" }}>
              <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "var(--admin-text-muted)" }}>Front</div>
              <p className="text-sm" style={{ color: "var(--admin-text-primary)" }}>{card.front}</p>
            </div>
            <div className="px-4 py-3" style={{ background: "#F5F0E8" }}>
              <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "#B8965A" }}>Back</div>
              <p className="text-sm" style={{ color: "var(--admin-text-primary)" }}>{card.back}</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (block.type === "divider") {
    return <hr style={{ border: "none", borderTop: "1.5px solid var(--admin-border)" }} />;
  }

  return null;
}

// ── Public component ──────────────────────────────────────────────────────────
export function BlocksDisplay({ blocksJson }: { blocksJson: string | null }) {
  if (!blocksJson) {
    return <p className="text-sm" style={{ color: "var(--admin-text-dim)" }}>No instructions provided.</p>;
  }

  let blocks: Block[] = [];
  try {
    const parsed = JSON.parse(blocksJson);
    if (Array.isArray(parsed)) blocks = parsed;
    else if (Array.isArray(parsed?.blocks)) blocks = parsed.blocks;
  } catch { /* fall through */ }

  if (blocks.length === 0) {
    return <p className="text-sm" style={{ color: "var(--admin-text-dim)" }}>No instructions provided.</p>;
  }

  return (
    <div className="space-y-4">
      {blocks.map((block, i) => (
        <BlockDisplay key={i} block={block} />
      ))}
    </div>
  );
}
