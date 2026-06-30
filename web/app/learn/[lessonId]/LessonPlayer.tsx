"use client";

import React, { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { markLessonComplete, saveVideoProgress } from "./actions";

/* ─── Types ─── */
interface SidebarLesson {
  id: string; title: string; lesson_type: string;
  duration_mins: number | null; sort_order: number; module_id: string;
}
interface Module { id: string; title: string; sort_order: number; lessons: SidebarLesson[] }
interface LessonData {
  id: string; title: string; lesson_type: string; video_url: string | null;
  duration_mins: number | null; sort_order: number; module_id: string;
}
interface ResourceBlock { type: "resource"; title: string; url: string; description?: string; fileType: string }
type ContentBlock = Record<string, unknown> & { type: string }

interface Props {
  lesson: LessonData;
  course: { id: string; title: string; slug: string };
  modules: Module[];
  initialCompleted: boolean;
  prevLesson: { id: string; title: string } | null;
  nextLesson: { id: string; title: string } | null;
  moduleTitle: string;
  moduleIndex: number;
  lessonIndex: number;
  totalLessons: number;
  completedLessonIds: string[];
  contentBlocks: ContentBlock[];
  resourceBlocks: ResourceBlock[];
  checklistItems: string[];
  background: string;
}

type Tab = "resources" | "checklist";

/* ─── Background styles ─── */
const BG_STYLES: Record<string, React.CSSProperties> = {
  warm:   { background: "#F5F0E8" },
  white:  { background: "#FFFFFF" },
  graph:  { backgroundColor: "#FAFAFA", backgroundImage: "linear-gradient(rgba(100,150,100,0.15) 1px,transparent 1px),linear-gradient(90deg,rgba(100,150,100,0.15) 1px,transparent 1px)", backgroundSize: "24px 24px" },
  lined:  { backgroundColor: "#FEFEF9", backgroundImage: "linear-gradient(rgba(80,130,90,0.13) 1px,transparent 1px)", backgroundSize: "100% 36px", backgroundPosition: "0 35px" },
  dots:   { backgroundColor: "#F8F8F5", backgroundImage: "radial-gradient(circle,rgba(80,110,80,0.22) 1px,transparent 1px)", backgroundSize: "20px 20px" },
  sage:   { background: "#EEF5EE" },
  forest: { background: "#1A2E1C" },
};

/* ─── File type icons / colors ─── */
const FILE_META: Record<string, { color: string; bg: string; label: string }> = {
  pdf:   { color: "#DC2626", bg: "#FEF2F2", label: "PDF" },
  doc:   { color: "#2563EB", bg: "#EFF6FF", label: "DOC" },
  sheet: { color: "#16A34A", bg: "#F0FDF4", label: "XLS" },
  link:  { color: "#2A5230", bg: "#EEF5EE", label: "Link" },
  zip:   { color: "#EA580C", bg: "#FFF7ED", label: "ZIP" },
  other: { color: "#6B7280", bg: "#F3F4F6", label: "File" },
};

/* ─── Lesson type icons ─── */
function LessonIcon({ type, size = 12 }: { type: string; size?: number }) {
  if (type === "video") return (
    <svg viewBox="0 0 14 14" width={size} height={size} fill="currentColor"><polygon points="3,2 11,7 3,12" /></svg>
  );
  if (type === "quiz") return (
    <svg viewBox="0 0 14 14" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="7" cy="7" r="5" /><path d="M7 9V7M7 5h.01" /></svg>
  );
  return (
    <svg viewBox="0 0 14 14" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M2 4h10M2 7h10M2 10h6" /></svg>
  );
}

/* ─── Embed helper ─── */
function toEmbed(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com")) { const v = u.searchParams.get("v"); return v ? `https://www.youtube.com/embed/${v}` : null; }
    if (u.hostname.includes("youtu.be")) return `https://www.youtube.com/embed${u.pathname}`;
    if (u.hostname.includes("vimeo.com")) { const id = u.pathname.split("/").filter(Boolean).pop(); return id ? `https://player.vimeo.com/video/${id}` : null; }
  } catch { /* ignore */ }
  return null;
}

function renderRich(text: string): React.ReactNode {
  if (!text) return text;
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("*")  && part.endsWith("*")  && part.length > 2)  return <em key={i}>{part.slice(1, -1)}</em>;
    return part;
  });
}

/* ─── Block renderer ─── */
function RenderBlock({ block, isDark }: { block: ContentBlock; isDark: boolean }) {
  const textColor = isDark ? "#E8F5E9" : "#1A2E1C";
  const mutedColor = isDark ? "#7DAA82" : "#6B7280";

  if (block.type === "paragraph") {
    return <p className="text-[15px] leading-[1.85] whitespace-pre-wrap" style={{ color: isDark ? "#C8DCC8" : "#374151" }}>{renderRich(String(block.text ?? ""))}</p>;
  }

  if (block.type === "heading") {
    const lvl = Number(block.level ?? 2);
    const Tag = `h${Math.max(1, Math.min(4, lvl))}` as "h1"|"h2"|"h3"|"h4";
    const sizes = ["","text-2xl font-extrabold","text-xl font-bold","text-lg font-semibold","text-base font-semibold"];
    return <Tag className={sizes[lvl] ?? sizes[2]} style={{ fontFamily: "var(--font-head)", color: textColor }}>{String(block.text ?? "")}</Tag>;
  }

  if (block.type === "quote") {
    return (
      <blockquote className="pl-5 py-3 rounded-r-2xl" style={{ borderLeft: "4px solid #2A5230", background: isDark ? "rgba(42,82,48,0.3)" : "#F5FAF5" }}>
        <p className="text-[15px] italic leading-relaxed" style={{ color: isDark ? "#A8D4AC" : "#2A5230" }}>{String(block.text ?? "")}</p>
        {!!block.attribution && <p className="text-xs font-semibold mt-2" style={{ color: mutedColor }}>{String(block.attribution)}</p>}
      </blockquote>
    );
  }

  if (block.type === "callout") {
    const colors: Record<string, { icon: string; color: string; bg: string; border: string }> = {
      tip:     { icon: "💡", color: "#166534", bg: "#F0FDF4", border: "#86EFAC" },
      warning: { icon: "⚠️", color: "#92400E", bg: "#FFFBEB", border: "#FCD34D" },
      info:    { icon: "ℹ️", color: "#1E40AF", bg: "#EFF6FF", border: "#93C5FD" },
      note:    { icon: "📌", color: "#374151", bg: "#F9FAFB", border: "#D1D5DB" },
    };
    const m = colors[String(block.variant ?? "tip")] ?? colors.tip;
    return (
      <div className="flex gap-3 px-4 py-4 rounded-xl" style={{ background: m.bg, borderLeft: `4px solid ${m.border}` }}>
        <span>{m.icon}</span>
        <div>
          {!!block.title && <p className="font-bold text-sm mb-1" style={{ color: m.color }}>{String(block.title)}</p>}
          <p className="text-sm leading-relaxed" style={{ color: m.color }}>{renderRich(String(block.text ?? ""))}</p>
        </div>
      </div>
    );
  }

  if (block.type === "video") {
    const embed = toEmbed(String(block.url ?? ""));
    return (
      <div>
        {!!block.title && <p className="font-semibold text-sm mb-2" style={{ color: textColor }}>{String(block.title)}</p>}
        {embed ? (
          <div className="relative w-full rounded-2xl overflow-hidden" style={{ paddingBottom: "56.25%", background: "#0D1F0E" }}>
            <iframe src={embed} className="absolute inset-0 w-full h-full" allow="autoplay; fullscreen" allowFullScreen />
          </div>
        ) : (
          <div className="rounded-xl p-10 text-center text-sm" style={{ background: "#EEF5EE", color: "#9AB89E" }}>Invalid video URL</div>
        )}
        {!!block.caption && <p className="text-xs text-center mt-2" style={{ color: mutedColor }}>{String(block.caption)}</p>}
      </div>
    );
  }

  if (block.type === "quiz") {
    return <InlineQuiz block={block} isDark={isDark} />;
  }

  if (block.type === "flashcard") {
    return <InlineFlashcard block={block} />;
  }

  if (block.type === "checklist") {
    const items = (block.items as { text: string }[] | undefined) ?? [];
    return <InlineChecklist items={items.map(i => i.text)} />;
  }

  if (block.type === "code") {
    return (
      <div className="rounded-xl overflow-hidden" style={{ background: "#0D1F0E" }}>
        {!!block.language && block.language !== "text" && (
          <div className="px-4 py-1 text-[10px] font-bold uppercase tracking-widest" style={{ background: "#1A3820", color: "#7DAA82" }}>{String(block.language)}</div>
        )}
        <pre className="px-4 py-4 text-sm overflow-x-auto" style={{ fontFamily: "monospace", color: "#A8D4AC", lineHeight: 1.65 }}>{String(block.code ?? "")}</pre>
      </div>
    );
  }

  if (block.type === "divider") {
    return <div className="flex items-center gap-3 py-1"><div className="flex-1 h-px" style={{ background: isDark ? "rgba(255,255,255,0.12)" : "#E5E7EB" }} /><span style={{ color: isDark ? "rgba(255,255,255,0.2)" : "#D1D5DB", fontSize: 12 }}>§</span><div className="flex-1 h-px" style={{ background: isDark ? "rgba(255,255,255,0.12)" : "#E5E7EB" }} /></div>;
  }

  if (block.type === "bulletlist") {
    const items = (block.items as string[] | undefined) ?? [];
    const style = String(block.style ?? "disc");
    const CHARS: Record<string, string> = { disc: "•", circle: "○", square: "▪", arrow: "→", check: "✓", dash: "—", star: "★", number: "" };
    const char = CHARS[style] ?? "•";
    return (
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2.5 text-[15px] leading-relaxed" style={{ color: isDark ? "#C8DCC8" : "#374151" }}>
            <span className="shrink-0 font-bold mt-0.5" style={{ color: "#2A5230", fontFamily: "monospace", minWidth: 18, textAlign: "center" }}>
              {style === "number" ? `${i + 1}.` : char}
            </span>
            <span>{renderRich(item)}</span>
          </li>
        ))}
      </ul>
    );
  }

  if (block.type === "table") {
    const headers = (block.headers as string[] | undefined) ?? [];
    const rows = (block.rows as string[][] | undefined) ?? [];
    return (
      <div className="overflow-x-auto rounded-xl border" style={{ borderColor: isDark ? "rgba(255,255,255,0.12)" : "#DDE8DA" }}>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr style={{ background: isDark ? "rgba(42,82,48,0.4)" : "#EEF5EE" }}>
              {headers.map((h, c) => (
                <th key={c} className="px-4 py-2.5 text-left text-xs font-bold" style={{ color: "#2A5230", borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "#DDE8DA"}`, borderRight: c < headers.length - 1 ? `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "#DDE8DA"}` : undefined }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, r) => (
              <tr key={r} style={{ background: r % 2 === 0 ? (isDark ? "rgba(255,255,255,0.03)" : "#FAFCFA") : "transparent" }}>
                {row.map((cell, c) => (
                  <td key={c} className="px-4 py-2.5" style={{ color: isDark ? "#C8DCC8" : "#374151", borderBottom: r < rows.length - 1 ? `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#F0F7F0"}` : undefined, borderRight: c < row.length - 1 ? `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#F0F7F0"}` : undefined }}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return null;
}

function InlineQuiz({ block, isDark }: { block: ContentBlock; isDark: boolean }) {
  const qtype = String(block.quizType ?? "multiple_choice");
  const opts = (block.options as string[] | undefined) ?? [];
  const correct = Number(block.correct ?? 0);
  const correctMulti = (block.correctMulti as number[] | undefined) ?? [];
  const pairs = (block.pairs as { a: string; b: string }[] | undefined) ?? [];
  const cards = (block.cards as { text: string; correct: boolean }[] | undefined) ?? [];
  const graded = Boolean(block.graded);

  const [selectedSingle, setSelectedSingle] = useState<number | null>(null);
  const [selectedMulti, setSelectedMulti] = useState<number[]>([]);
  const [matchSel, setMatchSel] = useState<{ side: "a" | "b"; idx: number } | null>(null);
  const [matched, setMatched] = useState<Record<number, number>>({});
  const [pickedCard, setPickedCard] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const bdr = isDark ? "rgba(42,82,48,0.5)" : "#DDE8DA";
  const headBg = isDark ? "rgba(42,82,48,0.4)" : "#EEF5EE";

  function handleMatchClick(side: "a" | "b", idx: number) {
    if (submitted) return;
    if (!matchSel) { setMatchSel({ side, idx }); return; }
    if (matchSel.side === side) { setMatchSel({ side, idx }); return; }
    const aIdx = matchSel.side === "a" ? matchSel.idx : idx;
    const bIdx = matchSel.side === "b" ? matchSel.idx : idx;
    setMatched((m) => ({ ...m, [aIdx]: bIdx }));
    setMatchSel(null);
  }

  const isCheckboxes = qtype === "checkboxes";
  const canSubmit = qtype === "match"
    ? Object.keys(matched).length >= pairs.length
    : isCheckboxes ? selectedMulti.length > 0 : selectedSingle !== null;

  function checkCorrect(): boolean {
    if (isCheckboxes) return [...selectedMulti].sort().join(",") === [...correctMulti].sort().join(",");
    return selectedSingle === correct;
  }
  const isCorrect = submitted && (qtype === "match" || qtype === "pickacard" ? true : checkCorrect());

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: `1.5px solid ${bdr}`, background: isDark ? "rgba(42,82,48,0.2)" : "#FAFCFA" }}>
      <div className="px-5 py-3 flex items-center justify-between" style={{ background: headBg, borderBottom: `1px solid ${bdr}` }}>
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-extrabold" style={{ background: "#2A5230", color: "#fff" }}>Q</span>
          <span className="text-xs font-bold uppercase tracking-wide" style={{ color: "#2A5230" }}>Knowledge Check</span>
        </div>
        {graded && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "#FEF3C7", color: "#92400E" }}>Graded</span>}
      </div>
      <div className="px-5 py-4">
        <p className="font-semibold text-[15px] mb-4 leading-snug" style={{ color: isDark ? "#E8F5E9" : "#1A2E1C" }}>{String(block.question ?? "")}</p>

        {/* Match */}
        {qtype === "match" && (
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "#7A9878" }}>Column A</div>
              {pairs.map((p, i) => (
                <button key={i} onClick={() => handleMatchClick("a", i)} className="w-full text-left px-3 py-2 rounded-xl text-sm border-2 transition-all"
                  style={{ borderColor: matchSel?.side === "a" && matchSel.idx === i ? "#2A5230" : (i in matched) ? "#86EFAC" : "#DDE8DA", background: matchSel?.side === "a" && matchSel.idx === i ? "#EEF5EE" : (i in matched) ? "#F0FDF4" : "#fff", color: "#1A2E1C" }}>
                  {p.a}
                </button>
              ))}
            </div>
            <div className="space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "#B8965A" }}>Column B</div>
              {pairs.map((p, i) => (
                <button key={i} onClick={() => handleMatchClick("b", i)} className="w-full text-left px-3 py-2 rounded-xl text-sm border-2 transition-all"
                  style={{ borderColor: matchSel?.side === "b" && matchSel.idx === i ? "#C48A3A" : Object.values(matched).includes(i) ? "#86EFAC" : "#DDE8DA", background: matchSel?.side === "b" && matchSel.idx === i ? "#FFF8E8" : Object.values(matched).includes(i) ? "#F0FDF4" : "#fff", color: "#1A2E1C" }}>
                  {p.b}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Pick a card */}
        {qtype === "pickacard" && (
          <div className="grid grid-cols-2 gap-3 mb-4">
            {cards.map((card, i) => (
              <button key={i} onClick={() => { if (!submitted) { setPickedCard(i); setSubmitted(true); } }}
                className="rounded-xl p-4 text-center border-2 min-h-[70px] flex items-center justify-center transition-all"
                style={{ borderColor: pickedCard === i ? (card.correct ? "#86EFAC" : "#FECACA") : "#DDE8DA", background: pickedCard === i ? (card.correct ? "#F0FDF4" : "#FEF2F2") : "#fff", color: pickedCard === i ? (card.correct ? "#166534" : "#DC2626") : "#1A2E1C" }}>
                {pickedCard === i ? <span className="font-bold text-sm">{card.text}</span> : <span className="text-2xl">?</span>}
              </button>
            ))}
          </div>
        )}

        {/* Multiple choice / Radio / Checkboxes */}
        {(qtype === "multiple_choice" || qtype === "radio" || qtype === "checkboxes") && (
          <div className="space-y-2 mb-4">
            {opts.map((opt, i) => {
              const isSel = isCheckboxes ? selectedMulti.includes(i) : selectedSingle === i;
              const isRight = isCheckboxes ? correctMulti.includes(i) : i === correct;
              let bg = isDark ? "rgba(255,255,255,0.06)" : "#fff";
              let border = isDark ? "rgba(255,255,255,0.1)" : "#DDE8DA";
              let color = isDark ? "#C8DCC8" : "#1A2E1C";
              if (submitted) {
                if (isRight)      { bg = "#F0FDF4"; border = "#86EFAC"; color = "#166534"; }
                else if (isSel)   { bg = "#FEF2F2"; border = "#FECACA"; color = "#DC2626"; }
              } else if (isSel) { bg = "#EEF5EE"; border = "#2A5230"; color = "#1A2E1C"; }
              return (
                <button key={i} onClick={() => {
                  if (submitted) return;
                  if (isCheckboxes) setSelectedMulti((s) => s.includes(i) ? s.filter((x) => x !== i) : [...s, i]);
                  else setSelectedSingle(i);
                }} disabled={submitted}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left text-sm font-medium transition-all"
                  style={{ background: bg, borderColor: border, color }}>
                  <span className={`w-5 h-5 border-2 shrink-0 flex items-center justify-center text-[10px] ${isCheckboxes ? "rounded" : "rounded-full"}`}
                    style={{ borderColor: (isSel || (submitted && isRight)) ? "#2A5230" : "#DDE8DA", background: (isSel || (submitted && isRight)) ? "#2A5230" : "transparent", color: "#fff" }}>
                    {submitted && isRight && "✓"}{submitted && isSel && !isRight && "✗"}
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>
        )}

        {!submitted && qtype !== "pickacard" && (
          <button onClick={() => canSubmit && setSubmitted(true)} disabled={!canSubmit}
            className="px-5 py-2 rounded-xl text-sm font-bold disabled:opacity-40"
            style={{ background: "#2A5230", color: "#fff" }}>Check Answer</button>
        )}
        {submitted && qtype !== "pickacard" && (
          <div className="px-4 py-3 rounded-xl text-sm mt-2"
            style={{ background: isCorrect ? "#F0FDF4" : "#FEF2F2", border: `1px solid ${isCorrect ? "#86EFAC" : "#FECACA"}`, color: isCorrect ? "#166534" : "#DC2626" }}>
            <span className="font-bold">{isCorrect ? "Correct!" : "Not quite."}</span>
            {!!block.explanation && <span className="ml-2">{String(block.explanation)}</span>}
          </div>
        )}
        {submitted && qtype === "pickacard" && pickedCard !== null && (
          <div className="px-4 py-3 rounded-xl text-sm mt-2 font-semibold"
            style={{ background: cards[pickedCard]?.correct ? "#F0FDF4" : "#FEF2F2", color: cards[pickedCard]?.correct ? "#166534" : "#DC2626" }}>
            {cards[pickedCard]?.correct ? "Correct pick!" : "Wrong card."}
          </div>
        )}
      </div>
    </div>
  );
}

function FlipCardPlayer({ front, back, hint }: { front: string; back: string; hint?: string }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <div className="flex flex-col gap-2">
      {/* Fixed height container — prevents face collision during 3D flip */}
      <div
        className="cursor-pointer select-none"
        style={{ perspective: "1000px", height: 180 }}
        onClick={() => setFlipped(f => !f)}
      >
        <div style={{ position: "relative", width: "100%", height: "100%", transformStyle: "preserve-3d", transition: "transform 0.5s cubic-bezier(0.4,0,0.2,1)", transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}>
          <div className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center p-6 text-center overflow-auto" style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", background: "linear-gradient(135deg,#EEF5EE,#E0EEE0)", border: "2px solid #B8D4B5" }}>
            <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#7A9878" }}>Question</div>
            <p className="font-semibold text-base leading-snug" style={{ color: "#1A2E1C" }}>{front}</p>
            {!!hint && <p className="mt-2 text-xs italic" style={{ color: "#9AB89E" }}>Hint: {hint}</p>}
            <div className="mt-3 text-xs" style={{ color: "#B8D4B5" }}>Click to flip →</div>
          </div>
          <div className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center p-6 text-center overflow-auto" style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: "rotateY(180deg)", background: "linear-gradient(135deg,#FFF8E8,#F5EED8)", border: "2px solid #E8D8B0" }}>
            <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#B8965A" }}>Answer</div>
            <p className="text-base leading-relaxed" style={{ color: "#1A2E1C" }}>{back}</p>
            <div className="mt-3 text-xs" style={{ color: "#E8D8B0" }}>← Click to flip back</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InlineFlashcard({ block }: { block: ContentBlock }) {
  const rawCards = Array.isArray(block.cards)
    ? (block.cards as { front: unknown; back: unknown; hint?: unknown }[])
    : [{ front: block.front, back: block.back, hint: block.hint }];
  const columns = typeof block.columns === "number" ? Math.min(4, Math.max(1, Math.round(block.columns))) : 1;
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: 16 }}>
      {rawCards.map((card, i) => (
        <FlipCardPlayer
          key={i}
          front={String(card.front ?? "")}
          back={String(card.back ?? "")}
          hint={card.hint ? String(card.hint) : undefined}
        />
      ))}
    </div>
  );
}

function InlineChecklist({ items }: { items: string[] }) {
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <label key={i} className="flex items-start gap-3 cursor-pointer group">
          <div className="w-5 h-5 rounded border-2 mt-0.5 flex items-center justify-center shrink-0 transition-colors"
            style={{ borderColor: checked[i] ? "#2A5230" : "#B8D4B5", background: checked[i] ? "#2A5230" : "white" }}
            onClick={() => setChecked(p => ({ ...p, [i]: !p[i] }))}>
            {checked[i] && <svg viewBox="0 0 10 10" width="9" height="9" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M2 5l2 2 4-4" /></svg>}
          </div>
          <input type="checkbox" className="sr-only" checked={!!checked[i]} onChange={() => setChecked(p => ({ ...p, [i]: !p[i] }))} />
          <span className="text-sm leading-relaxed" style={{ color: checked[i] ? "#9AB89E" : "#374151", textDecoration: checked[i] ? "line-through" : "none" }}>{renderRich(item)}</span>
        </label>
      ))}
    </div>
  );
}

/* ─── Main component ─── */
export default function LessonPlayer({
  lesson, course, modules, initialCompleted,
  prevLesson, nextLesson, moduleTitle, moduleIndex, lessonIndex, totalLessons,
  completedLessonIds, contentBlocks, resourceBlocks, checklistItems, background,
}: Props) {
  const router = useRouter();
  const [leftOpen, setLeftOpen] = useState(true);
  const [tab, setTab] = useState<Tab>("resources");
  const [completed, setCompleted] = useState(initialCompleted);
  const [markingDone, setMarkingDone] = useState(false);
  const [checklistDone, setChecklistDone] = useState<Record<number, boolean>>({});
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    modules.forEach(m => { init[m.id] = m.lessons.some(l => l.id === lesson.id); });
    return init;
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sessionStartRef = useRef(Date.now());

  const allLessonsFlat = modules.flatMap(m => m.lessons);
  const totalAllLessons = allLessonsFlat.length;
  const totalCompleted = completedLessonIds.length + (completed && !completedLessonIds.includes(lesson.id) ? 1 : 0);
  const progressPct = totalAllLessons > 0 ? Math.round((totalCompleted / totalAllLessons) * 100) : 0;
  const currentFlatIdx = allLessonsFlat.findIndex(l => l.id === lesson.id);

  const isDark = background === "forest";
  const bgStyle = BG_STYLES[background] ?? BG_STYLES.warm;

  const handleMarkComplete = useCallback(async () => {
    if (completed || markingDone) return;
    setMarkingDone(true);
    const result = await markLessonComplete(lesson.id, course.id);
    setMarkingDone(false);
    if (!result?.error) { setCompleted(true); router.refresh(); }
  }, [completed, markingDone, lesson.id, course.id, router]);

  const scheduleSave = useCallback(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      const v = videoRef.current;
      if (!v) return;
      const spent = Math.floor((Date.now() - sessionStartRef.current) / 1000);
      await saveVideoProgress(lesson.id, course.id, v.currentTime, spent);
    }, 5000);
  }, [lesson.id, course.id]);

  // Right panel: resources
  const allResources = resourceBlocks;
  // Right panel: checklist items from admin
  const adminChecklist = checklistItems;

  return (
    <div className="flex flex-col" style={{ height: "100vh", overflow: "hidden", fontFamily: "var(--font-sans)", background: "#F0F4F0" }}>

      {/* ─── Top bar ─── */}
      <header className="sticky top-0 z-40 flex items-center gap-3 px-5 h-14" style={{ background: "#fff", borderBottom: "1px solid #DDE8DA", boxShadow: "0 1px 6px rgba(42,82,48,0.07)" }}>
        <Link href={`/dashboard/my-courses/${course.slug}`} className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: "#2A5230" }}>
          <svg viewBox="0 0 14 14" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 11L5 7l4-4" /></svg>
          Course
        </Link>
        <div className="w-px h-4 shrink-0" style={{ background: "#DDE8DA" }} />
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#9AB89E" }}>Module {moduleIndex + 1} · Lesson {lessonIndex + 1}</div>
          <div className="text-sm font-bold truncate" style={{ color: "#1A2E1C" }}>{lesson.title}</div>
        </div>
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <div className="w-36 h-1.5 rounded-full overflow-hidden" style={{ background: "#EEF5EE" }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${progressPct}%`, background: "linear-gradient(90deg,#4ADE80,#2A5230)" }} />
          </div>
          <span className="text-xs font-bold" style={{ color: "#2A5230" }}>{progressPct}%</span>
        </div>
        <Link href="/dashboard" className="text-xs font-semibold px-3 py-1.5 rounded-lg shrink-0" style={{ background: "#EEF5EE", color: "#2A5230" }}>Exit</Link>
      </header>

      {/* ─── Body ─── */}
      <div className="flex flex-1 min-h-0 overflow-hidden" style={{ position: "relative" }}>

        {/* ─── Left sidebar ─── */}
        <aside className="shrink-0 flex flex-col overflow-hidden transition-all duration-300"
          style={{ width: leftOpen ? 280 : 0, minWidth: leftOpen ? 280 : 0, background: "#fff", borderRight: "1px solid #DDE8DA" }}>
          <div className="flex-1 overflow-y-auto min-w-[280px]">
            {/* Sidebar header */}
            <div className="flex items-center justify-between px-4 pt-4 pb-3" style={{ borderBottom: "1px solid #EEF5EE" }}>
              <div className="flex-1 min-w-0">
                <Link href={`/dashboard/my-courses/${course.slug}`} className="flex items-center gap-1 text-xs font-semibold mb-1" style={{ color: "#4A7A4E" }}>
                  <svg viewBox="0 0 12 12" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M8 10L4 6l4-4" /></svg>
                  Back to course
                </Link>
                <div className="font-bold text-sm truncate" style={{ color: "#1A2E1C" }}>{course.title}</div>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "#EEF5EE" }}>
                    <div className="h-full rounded-full" style={{ width: `${progressPct}%`, background: "#4A7A4E" }} />
                  </div>
                  <span className="text-[10px] font-bold shrink-0" style={{ color: "#4A7A4E" }}>{progressPct}%</span>
                </div>
              </div>
              <button onClick={() => setLeftOpen(false)} className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ml-2 transition-colors" style={{ background: "#EEF5EE", color: "#9AB89E" }}>
                <svg viewBox="0 0 12 12" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M8 2L4 6l4 4" /></svg>
              </button>
            </div>

            {/* Module list */}
            <div className="py-2 px-2 space-y-1">
              {modules.map((mod, mi) => {
                const modDone = mod.lessons.filter(l => completedLessonIds.includes(l.id) || (l.id === lesson.id && completed)).length;
                const modTotal = mod.lessons.length;
                const isExpanded = expandedModules[mod.id];
                return (
                  <div key={mod.id}>
                    <button onClick={() => setExpandedModules(p => ({ ...p, [mod.id]: !p[mod.id] }))}
                      className="w-full flex items-center gap-2.5 px-2 py-2.5 rounded-xl text-left transition-colors"
                      style={{ background: isExpanded ? "#EEF5EE" : "transparent" }}>
                      <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-extrabold"
                        style={{ background: modDone === modTotal && modTotal > 0 ? "#2A5230" : "#EEF5EE", color: modDone === modTotal && modTotal > 0 ? "#fff" : "#4A7A4E", fontFamily: "var(--font-head)" }}>
                        {modDone === modTotal && modTotal > 0
                          ? <svg viewBox="0 0 10 10" width="9" height="9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M2 5l2 2 4-4" /></svg>
                          : mi + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold truncate" style={{ color: "#1A2E1C" }}>{mod.title}</div>
                      </div>
                      <span className="text-[10px] font-bold shrink-0" style={{ color: modDone > 0 ? "#4A7A4E" : "#C8DEC8" }}>{modDone}/{modTotal}</span>
                      <svg viewBox="0 0 10 10" width="8" height="8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="shrink-0 transition-transform" style={{ color: "#C8DEC8", transform: isExpanded ? "rotate(90deg)" : "none" }}>
                        <path d="M3 2l4 3-4 3" />
                      </svg>
                    </button>

                    {isExpanded && (
                      <div className="ml-3 mt-0.5 space-y-0.5">
                        {mod.lessons.map((l, li) => {
                          const isDone = completedLessonIds.includes(l.id) || (l.id === lesson.id && completed);
                          const isCurrent = l.id === lesson.id;
                          return (
                            <Link key={l.id} href={`/learn/${l.id}`}
                              className="flex items-center gap-2 px-2.5 py-2 rounded-lg transition-colors"
                              style={{ background: isCurrent ? "#EEF5EE" : "transparent" }}>
                              <span style={{ color: isDone ? "#2A5230" : isCurrent ? "#4A7A4E" : "#C8DEC8", flexShrink: 0 }}>
                                {isDone
                                  ? <svg viewBox="0 0 14 14" width="14" height="14" fill="none"><circle cx="7" cy="7" r="6" fill="#2A5230" /><path d="M4.5 7l2 2 3-3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                  : <LessonIcon type={l.lesson_type} size={12} />}
                              </span>
                              <span className="text-xs flex-1 truncate" style={{ color: isCurrent ? "#1A2E1C" : "#4A5E4C", fontWeight: isCurrent ? 600 : 400 }}>
                                {li + 1}. {l.title}
                              </span>
                              {l.duration_mins && <span className="text-[10px] shrink-0" style={{ color: "#B8D4B5" }}>{l.duration_mins}m</span>}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Toggle pill */}
        {!leftOpen && (
          <button onClick={() => setLeftOpen(true)}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-30 flex items-center justify-center w-5 h-10 rounded-r-xl"
            style={{ background: "#2A5230", color: "#fff" }}>
            <svg viewBox="0 0 10 10" width="8" height="8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 2l4 3-4 3" /></svg>
          </button>
        )}

        {/* ─── Main content ─── */}
        <main className="flex-1 min-w-0 overflow-y-auto pb-20">
          {/* Header band */}
          <div className="px-8 py-8 relative overflow-hidden" style={{ background: "linear-gradient(135deg,#2A5230 0%,#1A3820 60%,#0D1A0E 100%)" }}>
            <div className="relative z-10 max-w-2xl">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.55)" }}>{moduleTitle}</span>
                {!completed && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(74,222,128,0.2)", color: "#4ADE80" }}>In progress</span>}
                {completed  && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(74,222,128,0.3)", color: "#4ADE80" }}>Completed</span>}
              </div>
              <h1 className="text-2xl font-extrabold mb-4 leading-tight text-white" style={{ fontFamily: "var(--font-head)" }}>{lesson.title}</h1>
              <div className="flex items-center gap-4 flex-wrap">
                <span className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: "rgba(255,255,255,0.65)" }}>
                  <LessonIcon type={lesson.lesson_type} size={11} />
                  {lesson.lesson_type === "video" ? "Video" : "Reading"}
                  {lesson.duration_mins && ` · ${lesson.duration_mins} min`}
                </span>
                <span className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.45)" }}>
                  Lesson {lessonIndex + 1} of {totalLessons}
                </span>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-56 h-56 rounded-full opacity-10" style={{ background: "#4ADE80", transform: "translate(30%,-30%)" }} />
            <div className="absolute bottom-0 right-20 w-36 h-36 rounded-full opacity-10" style={{ background: "#2A5230", transform: "translateY(50%)" }} />
          </div>

          {/* Content area */}
          <div className="min-h-64 pb-12" style={bgStyle}>
            <div className="max-w-2xl mx-auto px-8 py-8 space-y-6">
              {/* Video player (top-level, from lesson.video_url) */}
              {lesson.video_url && (
                <div>
                  <div className="relative w-full rounded-2xl overflow-hidden" style={{ aspectRatio: "16/9", background: "#0D1F0E", boxShadow: "0 8px 24px rgba(0,0,0,0.2)" }}>
                    {toEmbed(lesson.video_url) ? (
                      <iframe src={toEmbed(lesson.video_url)!} className="absolute inset-0 w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                    ) : (
                      <video ref={videoRef} src={lesson.video_url} controls className="absolute inset-0 w-full h-full" onTimeUpdate={scheduleSave} />
                    )}
                  </div>
                </div>
              )}

              {/* Content blocks */}
              {contentBlocks.length === 0 && !lesson.video_url && (
                <div className="text-center py-16" style={{ color: "#C8DEC8" }}>
                  <svg viewBox="0 0 48 48" width="40" height="40" className="mx-auto mb-3 opacity-40" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 6h24a2 2 0 0 1 2 2v32a2 2 0 0 1-2 2H12a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" /><path d="M16 16h16M16 22h16M16 28h10" />
                  </svg>
                  <p className="text-sm">Content coming soon.</p>
                </div>
              )}

              {contentBlocks.map((block, i) => (
                <RenderBlock key={i} block={block} isDark={isDark} />
              ))}
            </div>
          </div>
        </main>

        {/* ─── Right panel ─── */}
        <aside className="w-72 shrink-0 flex flex-col overflow-hidden" style={{ background: "#fff", borderLeft: "1px solid #DDE8DA" }}>
          {/* Progress widget */}
          <div className="px-5 pt-5 pb-4" style={{ borderBottom: "1px solid #EEF5EE" }}>
            <div className="flex items-center gap-3">
              <div className="relative w-14 h-14 shrink-0">
                <svg viewBox="0 0 48 48" className="w-full h-full -rotate-90">
                  <circle cx="24" cy="24" r="20" fill="none" stroke="#EEF5EE" strokeWidth="4" />
                  <circle cx="24" cy="24" r="20" fill="none" stroke="#2A5230" strokeWidth="4"
                    strokeDasharray={`${2 * Math.PI * 20}`}
                    strokeDashoffset={`${2 * Math.PI * 20 * (1 - progressPct / 100)}`}
                    strokeLinecap="round" className="transition-all duration-500" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-[11px] font-extrabold" style={{ color: "#2A5230" }}>{progressPct}%</div>
              </div>
              <div>
                <div className="text-sm font-bold" style={{ color: "#1A2E1C" }}>Course Progress</div>
                <div className="text-xs mt-0.5" style={{ color: "#9AB89E" }}>{totalCompleted} of {totalAllLessons} lessons complete</div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex" style={{ borderBottom: "1px solid #EEF5EE" }}>
            {(["resources", "checklist"] as Tab[]).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className="flex-1 py-2.5 text-xs font-bold capitalize transition-colors"
                style={{ color: tab === t ? "#2A5230" : "#9AB89E", borderBottom: tab === t ? "2px solid #2A5230" : "2px solid transparent" }}>
                {t}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {/* Resources */}
            {tab === "resources" && (
              <div className="space-y-2.5">
                {allResources.length === 0 ? (
                  <p className="text-xs text-center py-8" style={{ color: "#C8DEC8" }}>No resources for this lesson.</p>
                ) : (
                  allResources.map((r, i) => {
                    const m = FILE_META[r.fileType] ?? FILE_META.other;
                    return (
                      <a key={i} href={r.url || "#"} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-xl transition-all hover:-translate-y-0.5"
                        style={{ background: "#FAFCFA", border: "1.5px solid #EEF5EE", textDecoration: "none" }}>
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold" style={{ background: m.bg, color: m.color }}>{m.label}</div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold truncate" style={{ color: "#1A2E1C" }}>{r.title}</div>
                          {r.description && <div className="text-[10px] mt-0.5 truncate" style={{ color: "#9AB89E" }}>{r.description}</div>}
                        </div>
                        <svg viewBox="0 0 14 14" width="12" height="12" fill="none" stroke="#4A7A4E" strokeWidth="1.5" strokeLinecap="round" className="shrink-0">
                          <path d="M7 3v6M4 6l3 3 3-3M2 11h10" />
                        </svg>
                      </a>
                    );
                  })
                )}

                {/* Next lesson preview */}
                {nextLesson && (
                  <div className="mt-4 pt-4" style={{ borderTop: "1px solid #EEF5EE" }}>
                    <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: "#B8D4B5" }}>Up Next</div>
                    <Link href={`/learn/${nextLesson.id}`}
                      className="flex items-center gap-2.5 p-3 rounded-xl transition-colors"
                      style={{ background: "#EEF5EE", border: "1px solid #DDE8DA" }}>
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: "#2A5230" }}>
                        <svg viewBox="0 0 10 10" width="8" height="8" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M3 2l4 3-4 3" /></svg>
                      </div>
                      <span className="text-xs font-semibold truncate" style={{ color: "#1A2E1C" }}>{nextLesson.title}</span>
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Checklist */}
            {tab === "checklist" && (
              <div className="space-y-2">
                <div className="text-xs font-semibold mb-3" style={{ color: "#9AB89E" }}>Lesson Checklist</div>
                {adminChecklist.length === 0 ? (
                  <p className="text-xs text-center py-8" style={{ color: "#C8DEC8" }}>No checklist for this lesson.</p>
                ) : (
                  adminChecklist.map((item, i) => (
                    <label key={i} className="flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-colors"
                      style={{ background: checklistDone[i] ? "#EEF5EE" : "#FAFCFA", border: `1px solid ${checklistDone[i] ? "#B8D4B5" : "#EEF5EE"}` }}>
                      <div className="w-4 h-4 rounded flex items-center justify-center shrink-0 mt-0.5 transition-colors"
                        style={{ background: checklistDone[i] ? "#2A5230" : "#fff", border: `1.5px solid ${checklistDone[i] ? "#2A5230" : "#C8DEC8"}` }}>
                        {checklistDone[i] && <svg viewBox="0 0 10 10" width="8" height="8" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"><path d="M2 5l2 2 4-4" /></svg>}
                      </div>
                      <input type="checkbox" className="sr-only" checked={!!checklistDone[i]} onChange={() => setChecklistDone(p => ({ ...p, [i]: !p[i] }))} />
                      <span className="text-xs" style={{ color: checklistDone[i] ? "#7A9878" : "#1A2E1C" }}>{item}</span>
                    </label>
                  ))
                )}
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* ─── Bottom nav ─── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 flex items-center gap-3 px-6 h-16"
        style={{ background: "#fff", borderTop: "1px solid #DDE8DA", boxShadow: "0 -4px 16px rgba(42,82,48,0.06)" }}>
        {prevLesson ? (
          <Link href={`/learn/${prevLesson.id}`}
            className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl"
            style={{ background: "#EEF5EE", color: "#2A5230" }}>
            <svg viewBox="0 0 12 12" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M8 10L4 6l4-4" /></svg>
            Previous
          </Link>
        ) : <div />}

        <div className="flex-1 text-center text-xs" style={{ color: "#9AB89E" }}>
          Lesson {currentFlatIdx + 1} of {totalAllLessons}
        </div>

        {completed ? (
          nextLesson ? (
            <Link href={`/learn/${nextLesson.id}`}
              className="flex items-center gap-1.5 text-sm font-bold px-5 py-2.5 rounded-xl"
              style={{ background: "linear-gradient(135deg,#2A5230,#1A3820)", color: "#fff" }}>
              Next Lesson
              <svg viewBox="0 0 12 12" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 2l4 4-4 4" /></svg>
            </Link>
          ) : (
            <Link href={`/dashboard/my-courses/${course.slug}`}
              className="flex items-center gap-1.5 text-sm font-bold px-5 py-2.5 rounded-xl"
              style={{ background: "#22c55e", color: "#fff" }}>
              Course Complete!
              <svg viewBox="0 0 12 12" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M2 6l3 3 5-5" /></svg>
            </Link>
          )
        ) : (
          <button onClick={handleMarkComplete} disabled={markingDone}
            className="flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-xl transition-all disabled:opacity-50"
            style={{ background: "linear-gradient(135deg,#2A5230,#1A3820)", color: "#fff", boxShadow: "0 4px 14px rgba(42,82,48,0.3)" }}>
            {markingDone ? (
              <><svg className="animate-spin" viewBox="0 0 12 12" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="6" cy="6" r="4" strokeOpacity="0.3" /><path d="M6 2a4 4 0 0 1 4 4" /></svg> Saving…</>
            ) : (
              <><svg viewBox="0 0 12 12" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M2 6l3 3 5-5" /></svg> Mark as Complete</>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
