"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";

/* ─────────────────────────── Types ─────────────────────────── */
type HeadingLevel = 1 | 2 | 3 | 4;
type CalloutVariant = "tip" | "warning" | "info" | "note";
type ResourceFileType = "pdf" | "doc" | "sheet" | "link" | "zip" | "other";

interface ParagraphBlock { type: "paragraph"; text: string }
interface HeadingBlock   { type: "heading";   text: string; level: HeadingLevel }
interface QuoteBlock     { type: "quote";     text: string; attribution?: string }
interface CalloutBlock   { type: "callout";   variant: CalloutVariant; title?: string; text: string }
interface VideoBlock     { type: "video";     url: string; title?: string; caption?: string }
interface QuizBlock      { type: "quiz";      question: string; options: string[]; correct: number; explanation?: string }
interface FlashcardBlock { type: "flashcard"; front: string; back: string; hint?: string }
interface ChecklistBlock { type: "checklist"; items: { text: string; checked: boolean }[] }
interface CodeBlock      { type: "code";      code: string; language?: string }
interface ResourceBlock  { type: "resource";  url: string; title: string; description?: string; fileType: ResourceFileType }
interface DividerBlock   { type: "divider" }

type Block =
  | ParagraphBlock | HeadingBlock | QuoteBlock | CalloutBlock
  | VideoBlock | QuizBlock | FlashcardBlock | ChecklistBlock
  | CodeBlock | ResourceBlock | DividerBlock;

type BlockType = Block["type"];

const LESSON_TYPES = ["text", "video", "quiz", "assignment"] as const;
const STATUSES     = ["draft", "published"] as const;

function uid() { return Math.random().toString(36).slice(2, 9); }

/* ─────────────────────────── Defaults ─────────────────────────── */
const makeBlock: Record<BlockType, () => Block> = {
  paragraph: () => ({ type: "paragraph", text: "" }),
  heading:   () => ({ type: "heading",   text: "", level: 2 }),
  quote:     () => ({ type: "quote",     text: "", attribution: "" }),
  callout:   () => ({ type: "callout",   variant: "tip", title: "", text: "" }),
  video:     () => ({ type: "video",     url: "", title: "", caption: "" }),
  quiz:      () => ({ type: "quiz",      question: "", options: ["", "", "", ""], correct: 0, explanation: "" }),
  flashcard: () => ({ type: "flashcard", front: "", back: "", hint: "" }),
  checklist: () => ({ type: "checklist", items: [{ text: "", checked: false }] }),
  code:      () => ({ type: "code",      code: "", language: "text" }),
  resource:  () => ({ type: "resource",  url: "", title: "", description: "", fileType: "link" }),
  divider:   () => ({ type: "divider" }),
};

/* ─────────────────────────── Palette ─────────────────────────── */
const PALETTE_GROUPS = [
  {
    label: "Text",
    items: [
      { type: "paragraph" as BlockType, label: "Paragraph",  icon: "¶",   desc: "Body text" },
      { type: "heading"   as BlockType, label: "Heading",    icon: "H",   desc: "H1 – H4 title" },
      { type: "quote"     as BlockType, label: "Quote",      icon: "❝",   desc: "Pull quote" },
      { type: "callout"   as BlockType, label: "Callout",    icon: "💡",  desc: "Tip / warning" },
    ],
  },
  {
    label: "Media",
    items: [
      { type: "video"     as BlockType, label: "Video",      icon: "▶",   desc: "YouTube / Vimeo" },
      { type: "code"      as BlockType, label: "Code",       icon: "</>", desc: "Code snippet" },
    ],
  },
  {
    label: "Interactive",
    items: [
      { type: "quiz"      as BlockType, label: "Quiz",       icon: "✓",   desc: "Multiple choice" },
      { type: "flashcard" as BlockType, label: "Flashcard",  icon: "🃏",  desc: "Flip card" },
      { type: "checklist" as BlockType, label: "Checklist",  icon: "☑",   desc: "Action list" },
    ],
  },
  {
    label: "Utility",
    items: [
      { type: "resource"  as BlockType, label: "Resource",   icon: "📥",  desc: "Download / link" },
      { type: "divider"   as BlockType, label: "Divider",    icon: "—",   desc: "Section break" },
    ],
  },
];

/* ─────────────────────────── Auto-resize textarea ─────────────────────────── */
function AutoTextarea({
  value, onChange, placeholder, className, minRows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  minRows?: number;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = ref.current.scrollHeight + "px";
    }
  }, [value]);

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={minRows}
      className={className}
      style={{ resize: "none", overflow: "hidden" }}
    />
  );
}

/* ─────────────────────────── Block editors ─────────────────────────── */
const input = "w-full px-3 py-2 rounded-lg border border-[#DDE8DA] bg-white text-[#1A2E1C] text-sm focus:outline-none focus:ring-2 focus:ring-[#2A5230]/30 focus:border-[#2A5230] transition";
const textarea = "w-full px-3 py-2 rounded-lg border border-[#DDE8DA] bg-white text-[#1A2E1C] text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#2A5230]/30 focus:border-[#2A5230] transition";
const label = "block text-[10px] font-bold uppercase tracking-widest text-[#9AB89E] mb-1.5";

function ParagraphEditor({ block, onChange }: { block: ParagraphBlock; onChange: (b: ParagraphBlock) => void }) {
  return (
    <div>
      <div className={label}>Content</div>
      <AutoTextarea
        value={block.text}
        onChange={(v) => onChange({ ...block, text: v })}
        placeholder="Write your lesson content here…"
        className={textarea}
        minRows={4}
      />
    </div>
  );
}

function HeadingEditor({ block, onChange }: { block: HeadingBlock; onChange: (b: HeadingBlock) => void }) {
  const levels: HeadingLevel[] = [1, 2, 3, 4];
  const sizes: Record<HeadingLevel, string> = {
    1: "text-2xl font-extrabold",
    2: "text-xl font-bold",
    3: "text-lg font-semibold",
    4: "text-base font-semibold",
  };
  return (
    <div className="space-y-3">
      <div>
        <div className={label}>Heading Level</div>
        <div className="flex gap-2">
          {levels.map((l) => (
            <button
              key={l}
              onClick={() => onChange({ ...block, level: l })}
              className="w-10 h-10 rounded-lg font-extrabold text-sm transition-all"
              style={{
                background: block.level === l ? "#2A5230" : "#F0F7F0",
                color: block.level === l ? "#fff" : "#4A6650",
                fontFamily: "var(--font-head)",
              }}
            >
              H{l}
            </button>
          ))}
        </div>
      </div>
      <div>
        <div className={label}>Text</div>
        <input
          className={`${input} ${sizes[block.level]}`}
          style={{ fontFamily: "var(--font-head)", color: "#1A2E1C" }}
          value={block.text}
          onChange={(e) => onChange({ ...block, text: e.target.value })}
          placeholder={`Heading ${block.level} text…`}
        />
      </div>
    </div>
  );
}

function QuoteEditor({ block, onChange }: { block: QuoteBlock; onChange: (b: QuoteBlock) => void }) {
  return (
    <div className="space-y-3">
      <div>
        <div className={label}>Quote Text</div>
        <AutoTextarea
          value={block.text}
          onChange={(v) => onChange({ ...block, text: v })}
          placeholder="The quote or key takeaway…"
          className={textarea}
          minRows={2}
        />
      </div>
      <div>
        <div className={label}>Attribution (optional)</div>
        <input
          className={input}
          value={block.attribution ?? ""}
          onChange={(e) => onChange({ ...block, attribution: e.target.value })}
          placeholder="— Source or author"
        />
      </div>
    </div>
  );
}

const calloutMeta: Record<CalloutVariant, { icon: string; color: string; bg: string; border: string }> = {
  tip:     { icon: "💡", color: "#166534", bg: "#F0FDF4", border: "#86EFAC" },
  warning: { icon: "⚠️", color: "#92400E", bg: "#FFFBEB", border: "#FCD34D" },
  info:    { icon: "ℹ️", color: "#1E40AF", bg: "#EFF6FF", border: "#93C5FD" },
  note:    { icon: "📌", color: "#374151", bg: "#F9FAFB", border: "#D1D5DB" },
};

function CalloutEditor({ block, onChange }: { block: CalloutBlock; onChange: (b: CalloutBlock) => void }) {
  const variants: CalloutVariant[] = ["tip", "warning", "info", "note"];
  return (
    <div className="space-y-3">
      <div>
        <div className={label}>Style</div>
        <div className="flex gap-2">
          {variants.map((v) => {
            const m = calloutMeta[v];
            return (
              <button
                key={v}
                onClick={() => onChange({ ...block, variant: v })}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold capitalize border-2 transition-all"
                style={{
                  background: block.variant === v ? m.bg : "#fff",
                  borderColor: block.variant === v ? m.border : "#E5E7EB",
                  color: block.variant === v ? m.color : "#9CA3AF",
                }}
              >
                <span>{m.icon}</span> {v}
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <div className={label}>Title (optional)</div>
        <input
          className={input}
          value={block.title ?? ""}
          onChange={(e) => onChange({ ...block, title: e.target.value })}
          placeholder="Callout title"
        />
      </div>
      <div>
        <div className={label}>Content</div>
        <AutoTextarea
          value={block.text}
          onChange={(v) => onChange({ ...block, text: v })}
          placeholder="Callout body text…"
          className={textarea}
          minRows={2}
        />
      </div>
    </div>
  );
}

function VideoEditor({ block, onChange }: { block: VideoBlock; onChange: (b: VideoBlock) => void }) {
  return (
    <div className="space-y-3">
      <div>
        <div className={label}>Video URL</div>
        <input
          className={input}
          value={block.url}
          onChange={(e) => onChange({ ...block, url: e.target.value })}
          placeholder="https://youtube.com/watch?v=… or https://vimeo.com/…"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className={label}>Title (optional)</div>
          <input className={input} value={block.title ?? ""} onChange={(e) => onChange({ ...block, title: e.target.value })} placeholder="Video title" />
        </div>
        <div>
          <div className={label}>Caption (optional)</div>
          <input className={input} value={block.caption ?? ""} onChange={(e) => onChange({ ...block, caption: e.target.value })} placeholder="Caption below video" />
        </div>
      </div>
    </div>
  );
}

function QuizEditor({ block, onChange }: { block: QuizBlock; onChange: (b: QuizBlock) => void }) {
  function setOpt(i: number, v: string) {
    const o = [...block.options]; o[i] = v; onChange({ ...block, options: o });
  }
  function addOpt() { onChange({ ...block, options: [...block.options, ""] }); }
  function removeOpt(i: number) {
    const o = block.options.filter((_, x) => x !== i);
    onChange({ ...block, options: o, correct: Math.min(block.correct, o.length - 1) });
  }

  return (
    <div className="space-y-4">
      <div>
        <div className={label}>Question</div>
        <AutoTextarea
          value={block.question}
          onChange={(v) => onChange({ ...block, question: v })}
          placeholder="What is the question learners need to answer?"
          className={textarea}
          minRows={2}
        />
      </div>

      <div>
        <div className={label}>Answer Options — click the circle to mark correct</div>
        <div className="space-y-2">
          {block.options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <button
                onClick={() => onChange({ ...block, correct: i })}
                className="shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all"
                style={{
                  borderColor: block.correct === i ? "#2A5230" : "#DDE8DA",
                  background: block.correct === i ? "#2A5230" : "white",
                }}
                title="Mark as correct answer"
              >
                {block.correct === i && (
                  <svg viewBox="0 0 10 10" width="10" height="10" fill="white">
                    <path d="M2 5.5L4 7.5L8 3" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
              <input
                className={`${input} flex-1`}
                style={{ borderColor: block.correct === i ? "#2A5230" : undefined }}
                value={opt}
                onChange={(e) => setOpt(i, e.target.value)}
                placeholder={`Option ${String.fromCharCode(65 + i)}`}
              />
              {block.options.length > 2 && (
                <button onClick={() => removeOpt(i)} className="text-xs text-red-400 hover:text-red-600 shrink-0 transition-colors">✕</button>
              )}
            </div>
          ))}
        </div>
        {block.options.length < 6 && (
          <button onClick={addOpt} className="mt-2 text-xs font-bold text-[#2A5230] hover:underline">+ Add option</button>
        )}
      </div>

      <div>
        <div className={label}>Explanation (shown after answer)</div>
        <AutoTextarea
          value={block.explanation ?? ""}
          onChange={(v) => onChange({ ...block, explanation: v })}
          placeholder="Explain why the correct answer is right…"
          className={textarea}
          minRows={2}
        />
      </div>
    </div>
  );
}

function FlashcardEditor({ block, onChange }: { block: FlashcardBlock; onChange: (b: FlashcardBlock) => void }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div
          className="rounded-xl p-4"
          style={{ background: "#EEF5EE", border: "2px solid #B8D4B5" }}
        >
          <div className={label} style={{ color: "#2A5230" }}>Front (Question)</div>
          <AutoTextarea
            value={block.front}
            onChange={(v) => onChange({ ...block, front: v })}
            placeholder="Question, term, or concept…"
            className="w-full text-sm text-[#1A2E1C] bg-transparent focus:outline-none leading-relaxed"
            minRows={3}
          />
        </div>
        <div
          className="rounded-xl p-4"
          style={{ background: "#F5F0E8", border: "2px solid #E8D8B0" }}
        >
          <div className={label} style={{ color: "#8A6020" }}>Back (Answer)</div>
          <AutoTextarea
            value={block.back}
            onChange={(v) => onChange({ ...block, back: v })}
            placeholder="Answer, definition, or explanation…"
            className="w-full text-sm text-[#1A2E1C] bg-transparent focus:outline-none leading-relaxed"
            minRows={3}
          />
        </div>
      </div>
      <div>
        <div className={label}>Hint (optional)</div>
        <input
          className={input}
          value={block.hint ?? ""}
          onChange={(e) => onChange({ ...block, hint: e.target.value })}
          placeholder="Optional clue shown before flip"
        />
      </div>
    </div>
  );
}

function ChecklistEditor({ block, onChange }: { block: ChecklistBlock; onChange: (b: ChecklistBlock) => void }) {
  function setItem(i: number, text: string) {
    const items = block.items.map((it, x) => x === i ? { ...it, text } : it);
    onChange({ ...block, items });
  }
  function addItem() { onChange({ ...block, items: [...block.items, { text: "", checked: false }] }); }
  function removeItem(i: number) { onChange({ ...block, items: block.items.filter((_, x) => x !== i) }); }

  return (
    <div className="space-y-2">
      <div className={label}>Checklist Items</div>
      {block.items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-5 h-5 rounded border-2 border-[#B8D4B5] shrink-0" />
          <input
            className={`${input} flex-1`}
            value={item.text}
            onChange={(e) => setItem(i, e.target.value)}
            placeholder={`Action item ${i + 1}`}
          />
          {block.items.length > 1 && (
            <button onClick={() => removeItem(i)} className="text-xs text-red-400 hover:text-red-600 shrink-0 transition-colors">✕</button>
          )}
        </div>
      ))}
      <button onClick={addItem} className="text-xs font-bold text-[#2A5230] hover:underline">+ Add item</button>
    </div>
  );
}

function CodeEditor({ block, onChange }: { block: CodeBlock; onChange: (b: CodeBlock) => void }) {
  const langs = ["text", "javascript", "typescript", "python", "html", "css", "sql", "bash", "json"];
  return (
    <div className="space-y-3">
      <div>
        <div className={label}>Language</div>
        <select
          className={input}
          value={block.language ?? "text"}
          onChange={(e) => onChange({ ...block, language: e.target.value })}
        >
          {langs.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
      </div>
      <div>
        <div className={label}>Code</div>
        <textarea
          rows={8}
          className="w-full px-4 py-3 rounded-xl text-sm font-mono focus:outline-none resize-y"
          style={{ background: "#0D1F0E", color: "#A8D4AC", border: "2px solid #1A3820", lineHeight: 1.6 }}
          value={block.code}
          onChange={(e) => onChange({ ...block, code: e.target.value })}
          placeholder="// your code here"
        />
      </div>
    </div>
  );
}

const fileTypeIcons: Record<ResourceFileType, { icon: string; bg: string; color: string; label: string }> = {
  pdf:   { icon: "📄", bg: "#FEF2F2", color: "#DC2626", label: "PDF" },
  doc:   { icon: "📝", bg: "#EFF6FF", color: "#2563EB", label: "Document" },
  sheet: { icon: "📊", bg: "#F0FDF4", color: "#16A34A", label: "Spreadsheet" },
  link:  { icon: "🔗", bg: "#F5F3FF", color: "#7C3AED", label: "Link" },
  zip:   { icon: "📦", bg: "#FFF7ED", color: "#EA580C", label: "Archive" },
  other: { icon: "📁", bg: "#F9FAFB", color: "#374151", label: "File" },
};

function ResourceEditor({ block, onChange }: { block: ResourceBlock; onChange: (b: ResourceBlock) => void }) {
  const types: ResourceFileType[] = ["pdf", "doc", "sheet", "link", "zip", "other"];
  return (
    <div className="space-y-3">
      <div>
        <div className={label}>File Type</div>
        <div className="flex gap-2 flex-wrap">
          {types.map((t) => {
            const m = fileTypeIcons[t];
            return (
              <button
                key={t}
                onClick={() => onChange({ ...block, fileType: t })}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all"
                style={{
                  background: block.fileType === t ? m.bg : "#fff",
                  borderColor: block.fileType === t ? m.color : "#E5E7EB",
                  color: block.fileType === t ? m.color : "#9CA3AF",
                }}
              >
                {m.icon} {m.label}
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <div className={label}>Title</div>
        <input
          className={input}
          value={block.title}
          onChange={(e) => onChange({ ...block, title: e.target.value })}
          placeholder="Resource name (e.g. Nonprofit SOP Template)"
        />
      </div>
      <div>
        <div className={label}>URL / Link</div>
        <input
          className={input}
          value={block.url}
          onChange={(e) => onChange({ ...block, url: e.target.value })}
          placeholder="https://…"
        />
      </div>
      <div>
        <div className={label}>Description (optional)</div>
        <input
          className={input}
          value={block.description ?? ""}
          onChange={(e) => onChange({ ...block, description: e.target.value })}
          placeholder="What's in this resource?"
        />
      </div>
    </div>
  );
}

/* ─────────────────────────── Utility ─────────────────────────── */
function getEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      return v ? `https://www.youtube.com/embed/${v}` : null;
    }
    if (u.hostname.includes("youtu.be")) {
      return `https://www.youtube.com/embed${u.pathname}`;
    }
    if (u.hostname.includes("vimeo.com")) {
      const id = u.pathname.split("/").filter(Boolean).pop();
      return id ? `https://player.vimeo.com/video/${id}` : null;
    }
  } catch { /* invalid */ }
  return null;
}

/* ─────────────────────────── Interactive Preview blocks ─────────────────────────── */
function QuizPreview({ block }: { block: QuizBlock }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  function submit() { if (selected !== null) setSubmitted(true); }
  function reset() { setSelected(null); setSubmitted(false); }

  const isCorrect = submitted && selected === block.correct;

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ border: "1.5px solid #DDE8DA", background: "#FAFCFA" }}
    >
      {/* Question header */}
      <div
        className="px-5 py-3.5 flex items-center gap-2"
        style={{ background: "#EEF5EE", borderBottom: "1px solid #DDE8DA" }}
      >
        <span
          className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-extrabold"
          style={{ background: "#2A5230", color: "#fff", fontFamily: "var(--font-head)" }}
        >
          Q
        </span>
        <span className="text-xs font-bold uppercase tracking-wide" style={{ color: "#2A5230" }}>
          Knowledge Check
        </span>
      </div>

      <div className="px-5 py-4">
        <p className="font-semibold text-[15px] mb-4 leading-snug" style={{ color: "#1A2E1C" }}>
          {block.question || "Question goes here"}
        </p>

        <div className="space-y-2.5">
          {block.options.map((opt, i) => {
            const isSelected = selected === i;
            const isRight = i === block.correct;
            let bg = "#fff", border = "#DDE8DA", color = "#1A2E1C", dotBg = "#DDE8DA";
            if (submitted) {
              if (isRight)  { bg = "#F0FDF4"; border = "#86EFAC"; color = "#166534"; dotBg = "#22C55E"; }
              else if (isSelected) { bg = "#FEF2F2"; border = "#FECACA"; color = "#DC2626"; dotBg = "#EF4444"; }
            } else if (isSelected) {
              bg = "#EEF5EE"; border = "#2A5230"; color = "#1A2E1C"; dotBg = "#2A5230";
            }

            return (
              <button
                key={i}
                onClick={() => !submitted && setSelected(i)}
                disabled={submitted}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all"
                style={{ background: bg, borderColor: border, color }}
              >
                <span
                  className="w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center text-[10px] font-extrabold"
                  style={{ borderColor: dotBg, background: (isSelected || (submitted && isRight)) ? dotBg : "transparent", color: "#fff" }}
                >
                  {submitted && isRight && "✓"}
                  {submitted && isSelected && !isRight && "✕"}
                </span>
                <span className="text-sm font-medium">{opt || `Option ${String.fromCharCode(65 + i)}`}</span>
              </button>
            );
          })}
        </div>

        {!submitted ? (
          <button
            onClick={submit}
            disabled={selected === null}
            className="mt-4 px-5 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-40"
            style={{ background: "#2A5230", color: "#fff" }}
          >
            Check Answer
          </button>
        ) : (
          <div className="mt-4">
            <div
              className="px-4 py-3 rounded-xl text-sm mb-3"
              style={{
                background: isCorrect ? "#F0FDF4" : "#FEF2F2",
                border: `1px solid ${isCorrect ? "#86EFAC" : "#FECACA"}`,
                color: isCorrect ? "#166534" : "#DC2626",
              }}
            >
              <span className="font-bold">{isCorrect ? "Correct! 🎉" : "Not quite."}</span>
              {block.explanation && <span className="ml-2">{block.explanation}</span>}
            </div>
            <button onClick={reset} className="text-xs font-bold underline" style={{ color: "#7A9878" }}>
              Try again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function FlashcardPreview({ block }: { block: FlashcardBlock }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="w-full cursor-pointer select-none"
        style={{ perspective: "1000px", minHeight: "160px" }}
        onClick={() => setFlipped((f) => !f)}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            minHeight: "160px",
            transformStyle: "preserve-3d",
            transition: "transform 0.5s cubic-bezier(0.4,0,0.2,1)",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center p-6 text-center"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              background: "linear-gradient(135deg, #EEF5EE 0%, #E0EEE0 100%)",
              border: "2px solid #B8D4B5",
            }}
          >
            <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#7A9878" }}>
              Question
            </div>
            <p className="font-semibold text-base leading-snug" style={{ color: "#1A2E1C" }}>
              {block.front || "Front of card"}
            </p>
            {block.hint && (
              <p className="mt-3 text-xs italic" style={{ color: "#9AB89E" }}>
                Hint: {block.hint}
              </p>
            )}
            <div className="mt-4 text-xs" style={{ color: "#B8D4B5" }}>Click to flip →</div>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center p-6 text-center"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              background: "linear-gradient(135deg, #FFF8E8 0%, #F5EED8 100%)",
              border: "2px solid #E8D8B0",
            }}
          >
            <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#B8965A" }}>
              Answer
            </div>
            <p className="text-base leading-relaxed" style={{ color: "#1A2E1C" }}>
              {block.back || "Back of card"}
            </p>
            <div className="mt-4 text-xs" style={{ color: "#E8D8B0" }}>← Click to flip back</div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setFlipped(false)}
          className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
          style={{
            background: !flipped ? "#2A5230" : "#EEF5EE",
            color: !flipped ? "#fff" : "#2A5230",
          }}
        >
          Question
        </button>
        <button
          onClick={() => setFlipped(true)}
          className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
          style={{
            background: flipped ? "#C48A3A" : "#FFF8E8",
            color: flipped ? "#fff" : "#C48A3A",
          }}
        >
          Answer
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────── Preview renderer ─────────────────────────── */
function BlockPreview({ block }: { block: Block }) {
  if (block.type === "paragraph") {
    return (
      <p className="text-[15px] leading-[1.8] whitespace-pre-wrap" style={{ color: "#374151" }}>
        {block.text || <span className="italic" style={{ color: "#C0D4C0" }}>Empty paragraph</span>}
      </p>
    );
  }

  if (block.type === "heading") {
    const Tag = `h${block.level}` as "h1"|"h2"|"h3"|"h4";
    const size = block.level === 1 ? "text-3xl" : block.level === 2 ? "text-2xl" : block.level === 3 ? "text-xl" : "text-lg";
    const weight = block.level <= 2 ? "font-extrabold" : "font-bold";
    return (
      <Tag className={`${size} ${weight}`} style={{ fontFamily: "var(--font-head)", color: "#1A2E1C" }}>
        {block.text || <span className="opacity-30">Heading {block.level}</span>}
      </Tag>
    );
  }

  if (block.type === "quote") {
    return (
      <blockquote
        className="px-5 py-4 rounded-r-2xl"
        style={{ borderLeft: "4px solid #2A5230", background: "#F5FAF5" }}
      >
        <p className="text-[15px] leading-relaxed italic" style={{ color: "#2A5230" }}>
          {block.text || "Quote text"}
        </p>
        {block.attribution && (
          <p className="text-xs font-semibold mt-2" style={{ color: "#7A9878" }}>
            {block.attribution}
          </p>
        )}
      </blockquote>
    );
  }

  if (block.type === "callout") {
    const m = calloutMeta[block.variant];
    return (
      <div
        className="flex gap-3 px-4 py-4 rounded-xl"
        style={{ background: m.bg, borderLeft: `4px solid ${m.border}` }}
      >
        <span className="text-xl shrink-0">{m.icon}</span>
        <div>
          {block.title && <p className="font-bold text-sm mb-1" style={{ color: m.color }}>{block.title}</p>}
          <p className="text-sm leading-relaxed" style={{ color: m.color }}>
            {block.text || "Callout text"}
          </p>
        </div>
      </div>
    );
  }

  if (block.type === "video") {
    const embed = getEmbedUrl(block.url);
    return (
      <div>
        {block.title && <p className="font-semibold text-sm mb-2" style={{ color: "#1A2E1C" }}>{block.title}</p>}
        {embed ? (
          <div className="relative w-full rounded-2xl overflow-hidden" style={{ paddingBottom: "56.25%" }}>
            <iframe
              src={embed}
              className="absolute inset-0 w-full h-full"
              allow="autoplay; fullscreen"
              allowFullScreen
            />
          </div>
        ) : (
          <div
            className="rounded-2xl flex items-center justify-center p-12 text-sm"
            style={{ background: "#F0F7F0", border: "2px dashed #B8D4B5", color: "#9AB89E" }}
          >
            {block.url ? "Invalid video URL" : "Paste a YouTube or Vimeo URL to preview"}
          </div>
        )}
        {block.caption && <p className="text-xs text-center mt-2" style={{ color: "#9AB89E" }}>{block.caption}</p>}
      </div>
    );
  }

  if (block.type === "quiz") return <QuizPreview block={block} />;
  if (block.type === "flashcard") return <FlashcardPreview block={block} />;

  if (block.type === "checklist") {
    return (
      <div className="space-y-2">
        {block.items.map((item, i) => (
          <div key={i} className="flex items-start gap-3">
            <span
              className="w-5 h-5 rounded border-2 shrink-0 mt-0.5"
              style={{ borderColor: "#B8D4B5" }}
            />
            <span className="text-sm leading-relaxed" style={{ color: "#374151" }}>
              {item.text || `Item ${i + 1}`}
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
          <div
            className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest"
            style={{ background: "#1A3820", color: "#7DAA82", borderBottom: "1px solid #2A5230" }}
          >
            {block.language}
          </div>
        )}
        <pre
          className="px-4 py-4 text-sm overflow-x-auto"
          style={{ fontFamily: "var(--font-mono)", color: "#A8D4AC", lineHeight: 1.65 }}
        >
          {block.code || "// code"}
        </pre>
      </div>
    );
  }

  if (block.type === "resource") {
    const m = fileTypeIcons[block.fileType];
    return (
      <a
        href={block.url || "#"}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-4 p-4 rounded-2xl transition-all hover:-translate-y-0.5"
        style={{
          background: "#fff",
          border: "2px solid #E5E7EB",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          textDecoration: "none",
        }}
      >
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
          style={{ background: m.bg }}
        >
          {m.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm truncate" style={{ color: "#1A2E1C" }}>
            {block.title || "Untitled resource"}
          </div>
          {block.description && (
            <div className="text-xs mt-0.5 truncate" style={{ color: "#9CA3AF" }}>
              {block.description}
            </div>
          )}
          <div className="text-xs font-bold mt-1 truncate" style={{ color: m.color }}>
            {m.label} · {block.url || "No URL set"}
          </div>
        </div>
        <div
          className="shrink-0 text-xs font-bold px-3 py-1.5 rounded-lg"
          style={{ background: m.bg, color: m.color }}
        >
          Download ↓
        </div>
      </a>
    );
  }

  if (block.type === "divider") {
    return (
      <div className="flex items-center gap-4 py-2">
        <div className="flex-1 h-px" style={{ background: "#E5E7EB" }} />
        <span style={{ color: "#D1D5DB", fontSize: "12px" }}>§</span>
        <div className="flex-1 h-px" style={{ background: "#E5E7EB" }} />
      </div>
    );
  }

  return null;
}

/* ─────────────────────────── Block label map ─────────────────────────── */
const blockMeta: Record<BlockType, { label: string; icon: string; color: string }> = {
  paragraph: { label: "Paragraph", icon: "¶",   color: "#2A5230" },
  heading:   { label: "Heading",   icon: "H",   color: "#1E40AF" },
  quote:     { label: "Quote",     icon: "❝",   color: "#059669" },
  callout:   { label: "Callout",   icon: "💡",  color: "#D97706" },
  video:     { label: "Video",     icon: "▶",   color: "#7C3AED" },
  quiz:      { label: "Quiz",      icon: "✓",   color: "#2A5230" },
  flashcard: { label: "Flashcard", icon: "🃏",  color: "#B45309" },
  checklist: { label: "Checklist", icon: "☑",   color: "#0369A1" },
  code:      { label: "Code",      icon: "</>", color: "#0F172A" },
  resource:  { label: "Resource",  icon: "📥",  color: "#7C3AED" },
  divider:   { label: "Divider",   icon: "—",   color: "#9CA3AF" },
};

/* ─────────────────────────── Block wrapper ─────────────────────────── */
function BlockItem({
  block, index, total, onChange, onDelete, onMove,
}: {
  block: Block; index: number; total: number;
  onChange: (b: Block) => void;
  onDelete: () => void;
  onMove: (dir: -1 | 1) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const meta = blockMeta[block.type];

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all"
      style={{
        background: "#fff",
        border: "1.5px solid #DDE8DA",
        boxShadow: "0 1px 4px rgba(42,82,48,0.04)",
      }}
    >
      {/* Header bar */}
      <div
        className="flex items-center justify-between px-4 py-2.5"
        style={{ background: "#FAFCFA", borderBottom: "1px solid #F0F7F0" }}
      >
        <div className="flex items-center gap-2.5">
          <span
            className="w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-bold shrink-0"
            style={{ background: "#EEF5EE", color: meta.color, fontFamily: "var(--font-head)" }}
          >
            {meta.icon}
          </span>
          <span className="text-xs font-bold uppercase tracking-wide" style={{ color: "#7A9878" }}>
            {meta.label}
            {block.type === "heading" && ` H${(block as HeadingBlock).level}`}
          </span>
        </div>
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => onMove(-1)}
            disabled={index === 0}
            className="w-6 h-6 flex items-center justify-center rounded text-xs transition-colors disabled:opacity-25 hover:bg-[#F0F7F0]"
            style={{ color: "#9AB89E" }}
          >
            ↑
          </button>
          <button
            onClick={() => onMove(1)}
            disabled={index === total - 1}
            className="w-6 h-6 flex items-center justify-center rounded text-xs transition-colors disabled:opacity-25 hover:bg-[#F0F7F0]"
            style={{ color: "#9AB89E" }}
          >
            ↓
          </button>
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="w-6 h-6 flex items-center justify-center rounded text-xs transition-colors hover:bg-[#F0F7F0]"
            style={{ color: "#9AB89E" }}
          >
            {collapsed ? "▸" : "▾"}
          </button>
          <button
            onClick={onDelete}
            className="w-6 h-6 flex items-center justify-center rounded text-xs transition-colors hover:bg-red-50 ml-1"
            style={{ color: "#FCA5A5" }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Editor body */}
      {!collapsed && (
        <div className="px-5 py-4">
          {block.type === "paragraph"  && <ParagraphEditor  block={block} onChange={onChange as (b: ParagraphBlock)  => void} />}
          {block.type === "heading"    && <HeadingEditor    block={block} onChange={onChange as (b: HeadingBlock)    => void} />}
          {block.type === "quote"      && <QuoteEditor      block={block} onChange={onChange as (b: QuoteBlock)      => void} />}
          {block.type === "callout"    && <CalloutEditor    block={block} onChange={onChange as (b: CalloutBlock)    => void} />}
          {block.type === "video"      && <VideoEditor      block={block} onChange={onChange as (b: VideoBlock)      => void} />}
          {block.type === "quiz"       && <QuizEditor       block={block} onChange={onChange as (b: QuizBlock)       => void} />}
          {block.type === "flashcard"  && <FlashcardEditor  block={block} onChange={onChange as (b: FlashcardBlock)  => void} />}
          {block.type === "checklist"  && <ChecklistEditor  block={block} onChange={onChange as (b: ChecklistBlock)  => void} />}
          {block.type === "code"       && <CodeEditor       block={block} onChange={onChange as (b: CodeBlock)       => void} />}
          {block.type === "resource"   && <ResourceEditor   block={block} onChange={onChange as (b: ResourceBlock)   => void} />}
          {block.type === "divider"    && (
            <div className="h-px mx-2 rounded" style={{ background: "#DDE8DA" }} />
          )}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────── Block Palette Modal ─────────────────────────── */
function BlockPalette({ onSelect, onClose }: { onSelect: (t: BlockType) => void; onClose: () => void }) {
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-30"
        onClick={onClose}
      />
      <div
        className="absolute bottom-full mb-2 left-0 right-0 z-40 rounded-2xl overflow-hidden"
        style={{
          background: "#fff",
          border: "1.5px solid #DDE8DA",
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
        }}
      >
        {PALETTE_GROUPS.map((group) => (
          <div key={group.label} style={{ borderBottom: "1px solid #F0F7F0" }}>
            <div
              className="px-4 py-2 text-[10px] font-extrabold uppercase tracking-widest"
              style={{ color: "#B8D4B5" }}
            >
              {group.label}
            </div>
            <div className="grid grid-cols-4 gap-1 px-2 pb-2">
              {group.items.map(({ type, label, icon, desc }) => (
                <button
                  key={type}
                  onClick={() => onSelect(type)}
                  className="flex flex-col items-center gap-1 p-3 rounded-xl text-center transition-all hover:-translate-y-0.5"
                  style={{ background: "transparent" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#F0F7F0"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                >
                  <span className="text-lg leading-none">{icon}</span>
                  <span className="text-xs font-bold" style={{ color: "#1A2E1C" }}>{label}</span>
                  <span className="text-[10px] leading-tight" style={{ color: "#9AB89E" }}>{desc}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/* ─────────────────────────── Main editor ─────────────────────────── */
export default function LessonEditor({
  lesson, courseId, courseTitle,
}: {
  lesson: Record<string, unknown>;
  courseId: string;
  courseTitle: string;
}) {
  const initContent = lesson.content as { blocks?: Block[] } | null;
  const [blocks, setBlocks]     = useState<Block[]>(initContent?.blocks ?? []);
  const [blockKeys, setBlockKeys] = useState<string[]>(() => (initContent?.blocks ?? []).map(() => uid()));

  const [title, setTitle]           = useState(String(lesson.title ?? ""));
  const [lessonType, setLessonType] = useState(String(lesson.lesson_type ?? "text") as typeof LESSON_TYPES[number]);
  const [videoUrl, setVideoUrl]     = useState(String(lesson.video_url ?? ""));
  const [duration, setDuration]     = useState(Number(lesson.duration_mins ?? 0));
  const [status, setStatus]         = useState(String(lesson.status ?? "draft") as typeof STATUSES[number]);
  const [isRequired, setIsRequired] = useState(Boolean(lesson.is_required ?? true));

  const [saving, setSaving]         = useState(false);
  const [saved, setSaved]           = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [showPalette, setShowPalette] = useState(false);
  const [preview, setPreview]       = useState(false);
  const paletteRef                  = useRef<HTMLDivElement>(null);

  function addBlock(type: BlockType) {
    setBlocks((bs) => [...bs, makeBlock[type]()]);
    setBlockKeys((ks) => [...ks, uid()]);
    setShowPalette(false);
  }

  function updateBlock(i: number, b: Block) {
    setBlocks((bs) => bs.map((x, idx) => idx === i ? b : x));
    setSaved(false);
  }

  function deleteBlock(i: number) {
    setBlocks((bs) => bs.filter((_, idx) => idx !== i));
    setBlockKeys((ks) => ks.filter((_, idx) => idx !== i));
    setSaved(false);
  }

  function moveBlock(i: number, dir: -1 | 1) {
    const j = i + dir;
    setBlocks((bs) => { const a = [...bs]; [a[i], a[j]] = [a[j], a[i]]; return a; });
    setBlockKeys((ks) => { const a = [...ks]; [a[i], a[j]] = [a[j], a[i]]; return a; });
    setSaved(false);
  }

  const save = useCallback(async () => {
    setSaving(true); setError(null); setSaved(false);
    const res = await fetch(`/api/admin/lessons/${lesson.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        lesson_type: lessonType,
        video_url: videoUrl || null,
        duration_mins: duration || null,
        status,
        is_required: isRequired,
        content: { blocks },
      }),
    });
    setSaving(false);
    if (res.ok) { setSaved(true); }
    else { const d = await res.json(); setError(d.error ?? "Save failed."); }
  }, [lesson.id, title, lessonType, videoUrl, duration, status, isRequired, blocks]);

  return (
    <div className="flex flex-col h-screen" style={{ fontFamily: "var(--font-sans)" }}>

      {/* ── Top bar ── */}
      <div
        className="flex items-center justify-between px-6 py-3 shrink-0"
        style={{ background: "#fff", borderBottom: "1.5px solid #E8EDE6", boxShadow: "0 1px 4px rgba(42,82,48,0.04)" }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <Link
            href={`/admin/courses/${courseId}`}
            className="flex items-center gap-1.5 text-sm font-medium shrink-0 transition-colors"
            style={{ color: "#9AB89E" }}
          >
            <svg viewBox="0 0 14 14" width="13" height="13" fill="currentColor">
              <path fillRule="evenodd" d="M12 7a.5.5 0 0 1-.5.5H3.207l2.647 2.646a.5.5 0 1 1-.708.708l-3.5-3.5a.5.5 0 0 1 0-.708l3.5-3.5a.5.5 0 1 1 .708.708L3.207 6.5H11.5A.5.5 0 0 1 12 7Z" clipRule="evenodd" />
            </svg>
            {courseTitle}
          </Link>
          <span style={{ color: "#DDE8DA" }}>/</span>
          <input
            className="font-bold text-sm bg-transparent focus:outline-none border-b-2 border-transparent focus:border-[#2A5230] transition-colors min-w-0 w-56"
            style={{ color: "#1A2E1C", fontFamily: "var(--font-head)" }}
            value={title}
            onChange={(e) => { setTitle(e.target.value); setSaved(false); }}
            placeholder="Lesson title"
          />
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {error && <span className="text-xs font-medium" style={{ color: "#DC2626" }}>{error}</span>}
          {saved && (
            <span className="flex items-center gap-1 text-xs font-bold" style={{ color: "#16A34A" }}>
              <svg viewBox="0 0 14 14" width="12" height="12" fill="currentColor">
                <path fillRule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
              </svg>
              Saved
            </span>
          )}

          <button
            onClick={() => setPreview((p) => !p)}
            className="text-xs font-bold px-3 py-1.5 rounded-lg border-2 transition-all"
            style={preview
              ? { background: "#EEF5EE", color: "#2A5230", borderColor: "#2A5230" }
              : { background: "#fff", color: "#7A9878", borderColor: "#DDE8DA" }
            }
          >
            {preview ? "◀ Edit" : "Preview ▶"}
          </button>

          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value as typeof STATUSES[number]); setSaved(false); }}
            className="text-xs border-2 rounded-lg px-2.5 py-1.5 focus:outline-none capitalize transition-colors"
            style={{ borderColor: status === "published" ? "#86EFAC" : "#DDE8DA", color: "#1A2E1C", background: status === "published" ? "#F0FDF4" : "#fff" }}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>

          <button
            onClick={save}
            disabled={saving}
            className="px-5 py-1.5 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
            style={{ background: "linear-gradient(135deg,#2A5230,#1A3820)", color: "#fff", boxShadow: "0 2px 8px rgba(42,82,48,0.25)" }}
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      {/* ── Lesson meta strip ── */}
      <div
        className="flex items-center gap-5 px-6 py-2.5 shrink-0 flex-wrap"
        style={{ background: "#FAFCFA", borderBottom: "1px solid #F0F7F0" }}
      >
        <label className="flex items-center gap-2 text-xs" style={{ color: "#7A9878" }}>
          <span className="font-bold">Type</span>
          <select
            value={lessonType}
            onChange={(e) => { setLessonType(e.target.value as typeof LESSON_TYPES[number]); setSaved(false); }}
            className="text-xs border rounded-lg px-2 py-1 bg-white focus:outline-none capitalize"
            style={{ borderColor: "#DDE8DA", color: "#1A2E1C" }}
          >
            {LESSON_TYPES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
          </select>
        </label>

        <label className="flex items-center gap-2 text-xs" style={{ color: "#7A9878" }}>
          <span className="font-bold">Duration</span>
          <input
            type="number" min={0} max={999}
            value={duration || ""}
            onChange={(e) => { setDuration(Number(e.target.value)); setSaved(false); }}
            className="w-16 text-xs border rounded-lg px-2 py-1 bg-white focus:outline-none"
            style={{ borderColor: "#DDE8DA", color: "#1A2E1C" }}
            placeholder="mins"
          />
        </label>

        {lessonType === "video" && (
          <label className="flex items-center gap-2 text-xs flex-1" style={{ color: "#7A9878" }}>
            <span className="font-bold shrink-0">Video URL</span>
            <input
              value={videoUrl}
              onChange={(e) => { setVideoUrl(e.target.value); setSaved(false); }}
              className="flex-1 text-xs border rounded-lg px-2 py-1 bg-white focus:outline-none"
              style={{ borderColor: "#DDE8DA", color: "#1A2E1C" }}
              placeholder="https://youtube.com/watch?v=…"
            />
          </label>
        )}

        <label className="flex items-center gap-2 text-xs ml-auto" style={{ color: "#7A9878" }}>
          <input
            type="checkbox"
            checked={isRequired}
            onChange={(e) => { setIsRequired(e.target.checked); setSaved(false); }}
            className="accent-[#2A5230] w-3.5 h-3.5"
          />
          <span className="font-medium">Required</span>
        </label>
      </div>

      {/* ── Main content area ── */}
      <div
        className="flex flex-1 min-h-0"
        style={{ borderTop: "none" }}
      >
        {/* ── EDITOR ── */}
        <div
          className="flex flex-col overflow-y-auto"
          style={{ width: preview ? "50%" : "100%", borderRight: preview ? "1.5px solid #DDE8DA" : "none" }}
        >
          <div className="p-6 space-y-3 flex-1">
            {blocks.length === 0 ? (
              <div
                className="rounded-2xl flex flex-col items-center justify-center p-16 text-center"
                style={{ border: "2px dashed #C8DEC8", background: "#FAFCFA" }}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: "#EEF5EE" }}
                >
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#2A5230" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </div>
                <p className="font-semibold mb-1" style={{ color: "#2A5230" }}>No content yet</p>
                <p className="text-sm mb-5" style={{ color: "#9AB89E" }}>Start building your lesson with content blocks</p>
                <button
                  onClick={() => setShowPalette(true)}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold transition-all hover:-translate-y-0.5"
                  style={{ background: "linear-gradient(135deg,#2A5230,#1A3820)", color: "#fff", boxShadow: "0 4px 14px rgba(42,82,48,0.25)" }}
                >
                  + Add First Block
                </button>
              </div>
            ) : (
              <>
                {blocks.map((block, i) => (
                  <BlockItem
                    key={blockKeys[i]}
                    block={block}
                    index={i}
                    total={blocks.length}
                    onChange={(b) => updateBlock(i, b)}
                    onDelete={() => deleteBlock(i)}
                    onMove={(dir) => moveBlock(i, dir)}
                  />
                ))}

                {/* Add block button */}
                <div className="relative" ref={paletteRef}>
                  <button
                    onClick={() => setShowPalette((s) => !s)}
                    className="w-full py-2.5 rounded-xl text-xs font-bold transition-all border-2 border-dashed"
                    style={{
                      borderColor: showPalette ? "#2A5230" : "#C8DEC8",
                      color: showPalette ? "#2A5230" : "#9AB89E",
                      background: showPalette ? "#EEF5EE" : "transparent",
                    }}
                  >
                    + Add Block
                  </button>

                  {showPalette && (
                    <BlockPalette
                      onSelect={(t) => { addBlock(t); setSaved(false); }}
                      onClose={() => setShowPalette(false)}
                    />
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── PREVIEW ── */}
        {preview && (
          <div
            className="flex flex-col overflow-y-auto"
            style={{ width: "50%", background: "#F5F0E8" }}
          >
            <div
              className="px-4 py-2.5 flex items-center gap-2 shrink-0 sticky top-0 z-10"
              style={{ background: "#EDE8DF", borderBottom: "1px solid #D8D0C5" }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: "#4A8A52" }}
              />
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#7A9878" }}>
                Learner Preview
              </span>
            </div>

            <div className="max-w-[660px] mx-auto w-full px-8 py-8">
              {/* Lesson title */}
              <div className="mb-8">
                <h1
                  className="font-extrabold text-2xl leading-tight mb-2"
                  style={{ fontFamily: "var(--font-head)", color: "#1A2E1C" }}
                >
                  {title || "Untitled Lesson"}
                </h1>
                <div className="flex items-center gap-3">
                  {duration > 0 && (
                    <span className="text-xs font-medium" style={{ color: "#9AB89E" }}>
                      ~{duration} min
                    </span>
                  )}
                  {isRequired && (
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ background: "#EEF5EE", color: "#2A5230" }}
                    >
                      Required
                    </span>
                  )}
                </div>
              </div>

              {/* Blocks */}
              <div className="space-y-5">
                {blocks.length === 0 ? (
                  <p className="text-sm italic" style={{ color: "#C0D4C0" }}>
                    No content — add blocks in the editor panel.
                  </p>
                ) : (
                  blocks.map((block, i) => (
                    <BlockPreview key={blockKeys[i]} block={block} />
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
