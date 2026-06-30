"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";

/* ── Block types ── */
type BlockType = "text" | "heading" | "video" | "callout" | "quiz" | "checklist" | "code" | "divider";

interface TextBlock     { type: "text";      text: string }
interface HeadingBlock  { type: "heading";   text: string; level: 1|2|3 }
interface VideoBlock    { type: "video";     url: string; title?: string; caption?: string }
interface CalloutBlock  { type: "callout";   variant: "tip"|"warning"|"info"|"note"; text: string }
interface QuizBlock     { type: "quiz";      question: string; options: string[]; correct: number; explanation?: string }
interface ChecklistBlock{ type: "checklist"; items: string[] }
interface CodeBlock     { type: "code";      code: string; language?: string }
interface DividerBlock  { type: "divider" }

type Block = TextBlock | HeadingBlock | VideoBlock | CalloutBlock | QuizBlock | ChecklistBlock | CodeBlock | DividerBlock;

const LESSON_TYPES = ["text", "video", "quiz", "assignment"] as const;
const STATUSES     = ["draft", "published"] as const;
const inputCls = "w-full px-3.5 py-2.5 rounded-xl border border-[#DDE8DA] bg-white text-[#2A5230] text-sm focus:outline-none focus:ring-2 focus:ring-[#2A5230] transition";

function uid() { return Math.random().toString(36).slice(2); }

/* ── Default block factories ── */
const defaultBlock: Record<BlockType, () => Block> = {
  text:      () => ({ type: "text", text: "" }),
  heading:   () => ({ type: "heading", text: "", level: 2 }),
  video:     () => ({ type: "video", url: "", title: "" }),
  callout:   () => ({ type: "callout", variant: "tip", text: "" }),
  quiz:      () => ({ type: "quiz", question: "", options: ["", "", "", ""], correct: 0, explanation: "" }),
  checklist: () => ({ type: "checklist", items: [""] }),
  code:      () => ({ type: "code", code: "", language: "text" }),
  divider:   () => ({ type: "divider" }),
};

/* ── Block palette ── */
const BLOCK_PALETTE: { type: BlockType; label: string; icon: string; desc: string }[] = [
  { type: "text",      label: "Text",     icon: "📝", desc: "Paragraph or prose" },
  { type: "heading",   label: "Heading",  icon: "H", desc: "Section heading" },
  { type: "video",     label: "Video",    icon: "▶", desc: "YouTube or Vimeo" },
  { type: "callout",   label: "Callout",  icon: "💡", desc: "Tip, warning, or note" },
  { type: "quiz",      label: "Quiz",     icon: "✓", desc: "Multiple choice question" },
  { type: "checklist", label: "Checklist",icon: "☑", desc: "Action items" },
  { type: "code",      label: "Code",     icon: "</>", desc: "Code block" },
  { type: "divider",   label: "Divider",  icon: "—", desc: "Visual separator" },
];

/* ── Block editor components ── */
function TextEditor({ block, onChange }: { block: TextBlock; onChange: (b: TextBlock) => void }) {
  return (
    <textarea
      className="w-full min-h-[100px] resize-y bg-transparent text-[#2A5230] text-sm leading-relaxed focus:outline-none placeholder:text-[#A0B8A0]"
      value={block.text}
      onChange={(e) => onChange({ ...block, text: e.target.value })}
      placeholder="Write your lesson content here…"
    />
  );
}

function HeadingEditor({ block, onChange }: { block: HeadingBlock; onChange: (b: HeadingBlock) => void }) {
  return (
    <div className="flex items-center gap-3">
      <select
        value={block.level}
        onChange={(e) => onChange({ ...block, level: Number(e.target.value) as 1|2|3 })}
        className="text-xs border border-[#DDE8DA] rounded-lg px-2 py-1 text-[#7A9878] focus:outline-none"
      >
        <option value={1}>H1</option>
        <option value={2}>H2</option>
        <option value={3}>H3</option>
      </select>
      <input
        className="flex-1 bg-transparent text-[#2A5230] font-bold text-lg focus:outline-none placeholder:text-[#A0B8A0]"
        value={block.text}
        onChange={(e) => onChange({ ...block, text: e.target.value })}
        placeholder="Section heading…"
      />
    </div>
  );
}

function VideoEditor({ block, onChange }: { block: VideoBlock; onChange: (b: VideoBlock) => void }) {
  return (
    <div className="space-y-2">
      <input
        className="w-full text-sm text-[#2A5230] bg-transparent border-b border-[#DDE8DA] pb-1.5 focus:outline-none placeholder:text-[#A0B8A0]"
        value={block.url}
        onChange={(e) => onChange({ ...block, url: e.target.value })}
        placeholder="YouTube or Vimeo URL…"
      />
      <input
        className="w-full text-xs text-[#7A9878] bg-transparent focus:outline-none placeholder:text-[#C0D4C0]"
        value={block.title ?? ""}
        onChange={(e) => onChange({ ...block, title: e.target.value })}
        placeholder="Video title (optional)"
      />
      <input
        className="w-full text-xs text-[#7A9878] bg-transparent focus:outline-none placeholder:text-[#C0D4C0]"
        value={block.caption ?? ""}
        onChange={(e) => onChange({ ...block, caption: e.target.value })}
        placeholder="Caption (optional)"
      />
    </div>
  );
}

const calloutColors: Record<string, string> = {
  tip:     "bg-green-50 border-green-300",
  warning: "bg-yellow-50 border-yellow-300",
  info:    "bg-blue-50 border-blue-300",
  note:    "bg-gray-50 border-gray-300",
};

function CalloutEditor({ block, onChange }: { block: CalloutBlock; onChange: (b: CalloutBlock) => void }) {
  return (
    <div className={`rounded-xl border-l-4 p-3 ${calloutColors[block.variant]}`}>
      <div className="flex gap-2 mb-2">
        {(["tip","warning","info","note"] as const).map((v) => (
          <button
            key={v}
            onClick={() => onChange({ ...block, variant: v })}
            className={`text-xs px-2 py-0.5 rounded-full font-bold capitalize transition-colors ${block.variant === v ? "bg-[#2A5230] text-white" : "text-[#7A9878] hover:text-[#2A5230]"}`}
          >
            {v}
          </button>
        ))}
      </div>
      <textarea
        className="w-full bg-transparent text-sm text-[#2A5230] focus:outline-none resize-none placeholder:text-[#A0B8A0]"
        rows={2}
        value={block.text}
        onChange={(e) => onChange({ ...block, text: e.target.value })}
        placeholder="Callout content…"
      />
    </div>
  );
}

function QuizEditor({ block, onChange }: { block: QuizBlock; onChange: (b: QuizBlock) => void }) {
  function setOption(i: number, val: string) {
    const opts = [...block.options]; opts[i] = val;
    onChange({ ...block, options: opts });
  }
  function addOption() {
    onChange({ ...block, options: [...block.options, ""] });
  }
  function removeOption(i: number) {
    const opts = block.options.filter((_, idx) => idx !== i);
    onChange({ ...block, options: opts, correct: Math.min(block.correct, opts.length - 1) });
  }

  return (
    <div className="space-y-3">
      <input
        className="w-full font-semibold text-sm text-[#2A5230] bg-transparent border-b border-[#DDE8DA] pb-2 focus:outline-none placeholder:text-[#A0B8A0]"
        value={block.question}
        onChange={(e) => onChange({ ...block, question: e.target.value })}
        placeholder="Quiz question…"
      />
      <div className="space-y-2">
        {block.options.map((opt, i) => (
          <div key={i} className="flex items-center gap-2">
            <button
              onClick={() => onChange({ ...block, correct: i })}
              className={`w-5 h-5 rounded-full border-2 shrink-0 transition-colors ${block.correct === i ? "border-[#2A5230] bg-[#2A5230]" : "border-[#DDE8DA] hover:border-[#2A5230]"}`}
              title="Mark as correct"
            />
            <input
              className="flex-1 text-sm text-[#2A5230] bg-transparent focus:outline-none border-b border-[#F0F7F0] pb-1 placeholder:text-[#A0B8A0]"
              value={opt}
              onChange={(e) => setOption(i, e.target.value)}
              placeholder={`Option ${i + 1}`}
            />
            {block.options.length > 2 && (
              <button onClick={() => removeOption(i)} className="text-red-300 hover:text-red-500 text-xs transition-colors">✕</button>
            )}
          </div>
        ))}
      </div>
      <button onClick={addOption} className="text-xs text-[#5A8C5E] hover:text-[#2A5230] transition-colors">+ Add option</button>
      <input
        className="w-full text-xs text-[#7A9878] bg-transparent focus:outline-none placeholder:text-[#C0D4C0] border-t border-[#F0F7F0] pt-2"
        value={block.explanation ?? ""}
        onChange={(e) => onChange({ ...block, explanation: e.target.value })}
        placeholder="Explanation shown after answer (optional)"
      />
    </div>
  );
}

function ChecklistEditor({ block, onChange }: { block: ChecklistBlock; onChange: (b: ChecklistBlock) => void }) {
  function setItem(i: number, val: string) {
    const items = [...block.items]; items[i] = val; onChange({ ...block, items });
  }
  function addItem() { onChange({ ...block, items: [...block.items, ""] }); }
  function removeItem(i: number) { onChange({ ...block, items: block.items.filter((_, idx) => idx !== i) }); }

  return (
    <div className="space-y-2">
      {block.items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-4 h-4 rounded border-2 border-[#B8D4B5] shrink-0" />
          <input
            className="flex-1 text-sm text-[#2A5230] bg-transparent focus:outline-none placeholder:text-[#A0B8A0]"
            value={item}
            onChange={(e) => setItem(i, e.target.value)}
            placeholder={`Action item ${i + 1}`}
          />
          {block.items.length > 1 && (
            <button onClick={() => removeItem(i)} className="text-red-300 hover:text-red-500 text-xs transition-colors">✕</button>
          )}
        </div>
      ))}
      <button onClick={addItem} className="text-xs text-[#5A8C5E] hover:text-[#2A5230] transition-colors">+ Add item</button>
    </div>
  );
}

function CodeEditor({ block, onChange }: { block: CodeBlock; onChange: (b: CodeBlock) => void }) {
  return (
    <div className="space-y-2">
      <input
        className="text-xs text-[#7A9878] bg-transparent focus:outline-none placeholder:text-[#C0D4C0]"
        value={block.language ?? ""}
        onChange={(e) => onChange({ ...block, language: e.target.value })}
        placeholder="Language (e.g. javascript, python)"
      />
      <textarea
        rows={6}
        className="w-full font-mono text-sm bg-[#1A2E1C] text-[#C8DEC8] rounded-xl p-4 focus:outline-none resize-y"
        value={block.code}
        onChange={(e) => onChange({ ...block, code: e.target.value })}
        placeholder="// Your code here"
      />
    </div>
  );
}

/* ── Preview renderer ── */
function BlockPreview({ block }: { block: Block }) {
  if (block.type === "text") return <p className="text-[#2A5230] text-[15px] leading-[1.75] whitespace-pre-wrap">{block.text || <span className="text-[#C0D4C0] italic">Empty text block</span>}</p>;

  if (block.type === "heading") {
    const Tag = `h${block.level}` as "h1"|"h2"|"h3";
    const cls = block.level === 1 ? "text-2xl font-extrabold" : block.level === 2 ? "text-xl font-bold" : "text-lg font-semibold";
    return <Tag className={`${cls} text-[#2A5230] font-head`}>{block.text || <span className="text-[#C0D4C0] italic">Heading</span>}</Tag>;
  }

  if (block.type === "video") {
    const embedUrl = getEmbedUrl(block.url);
    return (
      <div>
        {block.title && <p className="font-semibold text-[#2A5230] mb-2 text-sm">{block.title}</p>}
        {embedUrl ? (
          <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
            <iframe src={embedUrl} className="absolute inset-0 w-full h-full rounded-xl" allow="autoplay; fullscreen" allowFullScreen title={block.title} />
          </div>
        ) : (
          <div className="bg-[#F0F7F0] border-2 border-dashed border-[#DDE8DA] rounded-xl p-8 text-center text-[#7A9878] text-sm">
            {block.url ? "Invalid video URL" : "Paste a YouTube or Vimeo URL to preview"}
          </div>
        )}
        {block.caption && <p className="text-xs text-[#7A9878] mt-2 text-center">{block.caption}</p>}
      </div>
    );
  }

  if (block.type === "callout") {
    const meta: Record<string, { icon: string; border: string; bg: string; text: string }> = {
      tip:     { icon: "💡", border: "border-green-400",  bg: "bg-green-50",  text: "text-green-900" },
      warning: { icon: "⚠️", border: "border-yellow-400", bg: "bg-yellow-50", text: "text-yellow-900" },
      info:    { icon: "ℹ️", border: "border-blue-400",   bg: "bg-blue-50",   text: "text-blue-900" },
      note:    { icon: "📌", border: "border-gray-400",   bg: "bg-gray-50",   text: "text-gray-800" },
    };
    const m = meta[block.variant];
    return (
      <div className={`flex gap-3 ${m.bg} border-l-4 ${m.border} rounded-r-xl px-4 py-3`}>
        <span className="text-base shrink-0 mt-0.5">{m.icon}</span>
        <p className={`text-sm leading-relaxed ${m.text}`}>{block.text || "Callout text"}</p>
      </div>
    );
  }

  if (block.type === "quiz") {
    return (
      <div className="bg-[#F5F0E8] border border-[#DDE8DA] rounded-xl p-5">
        <p className="font-bold text-[#2A5230] mb-4 text-sm">{block.question || "Quiz question"}</p>
        <div className="space-y-2">
          {block.options.map((opt, i) => (
            <div key={i} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border-2 cursor-pointer transition-colors ${i === block.correct ? "border-[#2A5230] bg-white" : "border-[#DDE8DA] bg-white hover:border-[#B8D4B5]"}`}>
              <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${i === block.correct ? "border-[#2A5230] bg-[#2A5230]" : "border-[#DDE8DA]"}`}>
                {i === block.correct && <span className="w-2 h-2 rounded-full bg-white" />}
              </span>
              <span className="text-sm text-[#2A5230]">{opt || `Option ${i + 1}`}</span>
            </div>
          ))}
        </div>
        {block.explanation && <p className="text-xs text-[#5A8C5E] mt-3 italic">{block.explanation}</p>}
      </div>
    );
  }

  if (block.type === "checklist") {
    return (
      <div className="space-y-2">
        {block.items.map((item, i) => (
          <div key={i} className="flex items-start gap-3">
            <span className="w-5 h-5 rounded border-2 border-[#B8D4B5] shrink-0 mt-0.5 flex items-center justify-center" />
            <span className="text-sm text-[#2A5230] leading-relaxed">{item || `Item ${i + 1}`}</span>
          </div>
        ))}
      </div>
    );
  }

  if (block.type === "code") {
    return (
      <div className="bg-[#1A2E1C] rounded-xl overflow-hidden">
        {block.language && <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-wide text-[#7DAA82] border-b border-white/10">{block.language}</div>}
        <pre className="p-4 text-sm font-mono text-[#C8DEC8] overflow-x-auto whitespace-pre">{block.code || "// code"}</pre>
      </div>
    );
  }

  if (block.type === "divider") {
    return <div className="flex items-center gap-3"><div className="flex-1 h-px bg-[#DDE8DA]" /><span className="text-[#A0B8A0] text-xs">§</span><div className="flex-1 h-px bg-[#DDE8DA]" /></div>;
  }

  return null;
}

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
  } catch { /* invalid URL */ }
  return null;
}

/* ── Block wrapper in editor ── */
function BlockItem({
  block, index, total,
  onChange, onDelete, onMove,
}: {
  block: Block; index: number; total: number;
  onChange: (b: Block) => void;
  onDelete: () => void;
  onMove: (dir: -1 | 1) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const label = BLOCK_PALETTE.find((p) => p.type === block.type);

  return (
    <div className="group relative bg-white border border-[#DDE8DA] rounded-2xl overflow-hidden hover:border-[#B8D4B5] transition-colors">
      {/* Block handle / header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#FAFCFA] border-b border-[#F0F7F0]">
        <div className="flex items-center gap-2">
          <span className="text-sm">{label?.icon}</span>
          <span className="text-xs font-bold text-[#7A9878] uppercase tracking-wide">{label?.label}</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => onMove(-1)} disabled={index === 0} className="p-1 text-[#A0B8A0] hover:text-[#2A5230] disabled:opacity-30 transition-colors">↑</button>
          <button onClick={() => onMove(1)} disabled={index === total - 1} className="p-1 text-[#A0B8A0] hover:text-[#2A5230] disabled:opacity-30 transition-colors">↓</button>
          <button onClick={() => setCollapsed((c) => !c)} className="p-1 text-[#A0B8A0] hover:text-[#2A5230] transition-colors">{collapsed ? "▸" : "▾"}</button>
          <button onClick={onDelete} className="p-1 text-red-300 hover:text-red-500 transition-colors ml-1">✕</button>
        </div>
      </div>

      {/* Block editor body */}
      {!collapsed && (
        <div className="px-4 py-4">
          {block.type === "text"      && <TextEditor      block={block} onChange={onChange as (b: TextBlock) => void} />}
          {block.type === "heading"   && <HeadingEditor   block={block} onChange={onChange as (b: HeadingBlock) => void} />}
          {block.type === "video"     && <VideoEditor     block={block} onChange={onChange as (b: VideoBlock) => void} />}
          {block.type === "callout"   && <CalloutEditor   block={block} onChange={onChange as (b: CalloutBlock) => void} />}
          {block.type === "quiz"      && <QuizEditor      block={block} onChange={onChange as (b: QuizBlock) => void} />}
          {block.type === "checklist" && <ChecklistEditor block={block} onChange={onChange as (b: ChecklistBlock) => void} />}
          {block.type === "code"      && <CodeEditor      block={block} onChange={onChange as (b: CodeBlock) => void} />}
          {block.type === "divider"   && <div className="h-px bg-[#DDE8DA] mx-2" />}
        </div>
      )}
    </div>
  );
}

/* ── Main component ── */
export default function LessonEditor({
  lesson,
  courseId,
  courseTitle,
}: {
  lesson: Record<string, unknown>;
  courseId: string;
  courseTitle: string;
}) {
  const initContent = lesson.content as { blocks?: Block[] } | null;
  const [blocks, setBlocks] = useState<Block[]>(initContent?.blocks ?? []);
  const [blockKeys, setBlockKeys] = useState<string[]>(() => (initContent?.blocks ?? []).map(() => uid()));

  const [title, setTitle]         = useState(String(lesson.title ?? ""));
  const [lessonType, setLessonType] = useState(String(lesson.lesson_type ?? "text") as typeof LESSON_TYPES[number]);
  const [videoUrl, setVideoUrl]   = useState(String(lesson.video_url ?? ""));
  const [duration, setDuration]   = useState(Number(lesson.duration_mins ?? 0));
  const [status, setStatus]       = useState(String(lesson.status ?? "draft") as typeof STATUSES[number]);
  const [isRequired, setIsRequired] = useState(Boolean(lesson.is_required ?? true));

  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [showPalette, setShowPalette] = useState(false);
  const [preview, setPreview]     = useState(false);
  const paletteRef = useRef<HTMLDivElement>(null);

  function addBlock(type: BlockType) {
    const b = defaultBlock[type]();
    setBlocks((bs) => [...bs, b]);
    setBlockKeys((ks) => [...ks, uid()]);
    setShowPalette(false);
  }

  function updateBlock(i: number, b: Block) {
    setBlocks((bs) => bs.map((x, idx) => (idx === i ? b : x)));
  }

  function deleteBlock(i: number) {
    setBlocks((bs) => bs.filter((_, idx) => idx !== i));
    setBlockKeys((ks) => ks.filter((_, idx) => idx !== i));
  }

  function moveBlock(i: number, dir: -1 | 1) {
    const j = i + dir;
    setBlocks((bs) => {
      const a = [...bs]; [a[i], a[j]] = [a[j], a[i]]; return a;
    });
    setBlockKeys((ks) => {
      const a = [...ks]; [a[i], a[j]] = [a[j], a[i]]; return a;
    });
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
    if (res.ok) setSaved(true);
    else { const d = await res.json(); setError(d.error ?? "Save failed."); }
  }, [lesson.id, title, lessonType, videoUrl, duration, status, isRequired, blocks]);

  return (
    <div className="flex flex-col flex-1 min-h-0" style={{ fontFamily: "var(--font-sans)" }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3.5 bg-white border-b border-[#DDE8DA] shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <Link href={`/admin/courses/${courseId}`} className="text-[#7A9878] hover:text-[#2A5230] text-sm shrink-0 transition-colors">
            ← {courseTitle}
          </Link>
          <span className="text-[#DDE8DA] shrink-0">/</span>
          <input
            className="font-head font-bold text-[#2A5230] text-sm bg-transparent focus:outline-none border-b border-transparent focus:border-[#B8D4B5] transition-colors min-w-0 w-64"
            value={title}
            onChange={(e) => { setTitle(e.target.value); setSaved(false); }}
            placeholder="Lesson title"
          />
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {error && <span className="text-xs text-red-500">{error}</span>}
          {saved && <span className="text-xs text-green-600">Saved ✓</span>}

          <button
            onClick={() => setPreview((p) => !p)}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors ${preview ? "bg-[#2A5230] text-white border-[#2A5230]" : "text-[#4A6650] border-[#DDE8DA] hover:border-[#2A5230]"}`}
          >
            {preview ? "◀ Edit" : "Preview ▶"}
          </button>

          <div className="flex items-center gap-2">
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value as typeof STATUSES[number]); setSaved(false); }}
              className="text-xs border border-[#DDE8DA] rounded-lg px-2.5 py-1.5 text-[#4A6650] focus:outline-none focus:border-[#2A5230] capitalize"
            >
              {STATUSES.map((s) => <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>

            <button
              onClick={save}
              disabled={saving}
              className="px-4 py-1.5 bg-[#2A5230] text-white text-xs font-bold rounded-lg hover:bg-[#1e3d24] disabled:opacity-50 transition-colors"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      </div>

      {/* Lesson meta strip */}
      <div className="flex items-center gap-4 px-6 py-2.5 bg-[#FAFCFA] border-b border-[#F0F7F0] shrink-0">
        <label className="flex items-center gap-2 text-xs text-[#7A9878]">
          Type
          <select
            value={lessonType}
            onChange={(e) => { setLessonType(e.target.value as typeof LESSON_TYPES[number]); setSaved(false); }}
            className="text-xs border border-[#DDE8DA] rounded-lg px-2 py-1 text-[#4A6650] bg-white focus:outline-none capitalize"
          >
            {LESSON_TYPES.map((t) => <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
          </select>
        </label>
        <label className="flex items-center gap-2 text-xs text-[#7A9878]">
          Duration (mins)
          <input
            type="number" min={0} max={999}
            value={duration || ""}
            onChange={(e) => { setDuration(Number(e.target.value)); setSaved(false); }}
            className="w-16 text-xs border border-[#DDE8DA] rounded-lg px-2 py-1 text-[#4A6650] bg-white focus:outline-none"
            placeholder="—"
          />
        </label>
        {lessonType === "video" && (
          <label className="flex items-center gap-2 text-xs text-[#7A9878] flex-1">
            Video URL
            <input
              value={videoUrl}
              onChange={(e) => { setVideoUrl(e.target.value); setSaved(false); }}
              className="flex-1 text-xs border border-[#DDE8DA] rounded-lg px-2 py-1 text-[#4A6650] bg-white focus:outline-none"
              placeholder="https://youtube.com/watch?v=…"
            />
          </label>
        )}
        <label className="flex items-center gap-2 text-xs text-[#7A9878] ml-auto">
          <input type="checkbox" checked={isRequired} onChange={(e) => { setIsRequired(e.target.checked); setSaved(false); }} className="accent-[#2A5230]" />
          Required
        </label>
      </div>

      {/* Split view */}
      <div className={`flex flex-1 min-h-0 overflow-hidden ${preview ? "divide-x divide-[#DDE8DA]" : ""}`}>

        {/* ── EDITOR PANEL ── */}
        <div className={`flex flex-col ${preview ? "w-1/2" : "w-full"} overflow-y-auto`}>
          <div className="p-6 space-y-3 flex-1">
            {blocks.length === 0 && (
              <div className="border-2 border-dashed border-[#DDE8DA] rounded-2xl p-12 text-center">
                <p className="text-[#A0B8A0] text-sm mb-4">No content blocks yet.</p>
                <button
                  onClick={() => setShowPalette(true)}
                  className="px-5 py-2.5 bg-[#2A5230] text-white text-sm font-bold rounded-xl hover:bg-[#1e3d24] transition-colors"
                >
                  + Add First Block
                </button>
              </div>
            )}

            {blocks.map((block, i) => (
              <BlockItem
                key={blockKeys[i]}
                block={block}
                index={i}
                total={blocks.length}
                onChange={(b) => { updateBlock(i, b); setSaved(false); }}
                onDelete={() => { deleteBlock(i); setSaved(false); }}
                onMove={(dir) => { moveBlock(i, dir); setSaved(false); }}
              />
            ))}

            {blocks.length > 0 && (
              <div className="relative" ref={paletteRef}>
                <button
                  onClick={() => setShowPalette((s) => !s)}
                  className="w-full py-2 border-2 border-dashed border-[#DDE8DA] rounded-xl text-xs font-bold text-[#A0B8A0] hover:border-[#B8D4B5] hover:text-[#5A8C5E] transition-colors"
                >
                  + Add Block
                </button>

                {showPalette && (
                  <div className="absolute bottom-full mb-2 left-0 right-0 bg-white border border-[#DDE8DA] rounded-2xl shadow-xl p-3 z-20 grid grid-cols-4 gap-2">
                    {BLOCK_PALETTE.map(({ type, label, icon, desc }) => (
                      <button
                        key={type}
                        onClick={() => addBlock(type)}
                        className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-[#F0F7F0] text-center transition-colors group"
                      >
                        <span className="text-xl">{icon}</span>
                        <span className="text-xs font-bold text-[#2A5230]">{label}</span>
                        <span className="text-[10px] text-[#A0B8A0] group-hover:text-[#7A9878] leading-tight">{desc}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── PREVIEW PANEL ── */}
        {preview && (
          <div className="w-1/2 overflow-y-auto bg-[#F5F0E8]">
            <div className="max-w-[680px] mx-auto px-8 py-8">
              {/* Lesson header preview */}
              <div className="mb-8">
                <span className="text-xs font-bold text-[#5A8C5E] uppercase tracking-wide">Lesson Preview</span>
                <h1 className="font-head font-extrabold text-2xl text-[#2A5230] mt-2 leading-tight">
                  {title || "Untitled Lesson"}
                </h1>
                {duration > 0 && <p className="text-sm text-[#7A9878] mt-1">~{duration} min read</p>}
              </div>

              {/* Blocks */}
              <div className="space-y-6">
                {blocks.length === 0 ? (
                  <p className="text-[#A0B8A0] text-sm italic">No content yet — add blocks in the editor.</p>
                ) : (
                  blocks.map((block, i) => <BlockPreview key={blockKeys[i]} block={block} />)
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
