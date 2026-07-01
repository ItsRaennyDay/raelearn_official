"use client";
import { useState, useEffect, useRef, useTransition } from "react";
import CertificatePreview from "../../CertificatePreview";
import { TemplateSettings, DEFAULT_SETTINGS } from "@/lib/certificate-types";
import { upsertTemplate, deleteTemplate, assignTemplateToCourse } from "../actions";

interface Course {
  id: string;
  title: string;
  certificate_template_id: string | null;
}

interface Props {
  id?: string;
  initialName?: string;
  initialSettings?: Partial<TemplateSettings>;
  courses?: Course[];
  savedParam?: boolean;
}

const THEMES = [
  { name: "Forest", accent: "#2A5230", title: "#1A2E1C", bg: "#FFFFFF", border: "#2A5230" },
  { name: "Navy",   accent: "#1A3A6A", title: "#0F2040", bg: "#FFFFFF", border: "#1A3A6A" },
  { name: "Gold",   accent: "#8A6020", title: "#5A3A10", bg: "#FFFBF0", border: "#C8A040" },
  { name: "Rose",   accent: "#8A2040", title: "#5A1028", bg: "#FFFFFF", border: "#C84060" },
  { name: "Slate",  accent: "#334155", title: "#1E293B", bg: "#F8FAFC", border: "#64748B" },
];

// ── Primitives ────────────────────────────────────────────────────────────────

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: "1.5px solid #E8EDE6", background: "#fff" }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-2.5"
        style={{ background: "#FAFCFA" }}
      >
        <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "#7A9878" }}>{title}</span>
        <span style={{ color: "#9AB89E", fontSize: 14, lineHeight: 1 }}>{open ? "−" : "+"}</span>
      </button>
      {open && <div className="px-4 pb-4 pt-3 space-y-3">{children}</div>}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-[11px] shrink-0 w-[108px]" style={{ color: "#4A6650" }}>{label}</label>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

function ColorPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative w-8 h-8 rounded-lg overflow-hidden shrink-0 cursor-pointer" style={{ border: "1.5px solid #DDE8DA" }}>
        <input type="color" value={value} onChange={e => onChange(e.target.value)}
          className="absolute inset-0 w-[200%] h-[200%] -translate-x-1/4 -translate-y-1/4 cursor-pointer border-0 p-0" />
      </div>
      <input
        type="text" value={value} maxLength={7}
        onChange={e => /^#[0-9A-Fa-f]{0,6}$/.test(e.target.value) && onChange(e.target.value)}
        className="flex-1 px-2 py-1 text-[11px] rounded-lg border outline-none font-mono"
        style={{ borderColor: "#DDE8DA", color: "#1A2E1C", background: "#FAFCFA" }}
      />
    </div>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!value)}
      className="relative flex-shrink-0 w-9 h-5 rounded-full transition-colors duration-150"
      style={{ background: value ? "#2A5230" : "#D1D5DB" }}
    >
      <span className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-150"
        style={{ left: value ? "calc(100% - 18px)" : 2 }} />
    </button>
  );
}

function TxtInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full px-2.5 py-1.5 text-[11px] rounded-lg border outline-none"
      style={{ borderColor: "#DDE8DA", color: "#1A2E1C", background: "#FAFCFA" }} />
  );
}

function Sel<T extends string>({
  value, onChange, options,
}: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[] }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value as T)}
      className="w-full px-2.5 py-1.5 text-[11px] rounded-lg border outline-none"
      style={{ borderColor: "#DDE8DA", color: "#1A2E1C", background: "#FAFCFA" }}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function TemplateEditor({ id, initialName = "", initialSettings = {}, courses = [], savedParam = false }: Props) {
  const [name, setName] = useState(initialName || "New Template");
  const [s, setS] = useState<TemplateSettings>({ ...DEFAULT_SETTINGS, ...initialSettings });
  const [dirty, setDirty] = useState(false);
  const [showSaved, setShowSaved] = useState(savedParam);
  const [isPending, startTransition] = useTransition();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.72);

  // Responsive preview scaling
  useEffect(() => {
    const el = previewRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setScale(entry.contentRect.width / 900);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  function set<K extends keyof TemplateSettings>(key: K, val: TemplateSettings[K]) {
    setS(prev => ({ ...prev, [key]: val }));
    setDirty(true);
    setShowSaved(false);
  }

  function applyTheme(t: typeof THEMES[0]) {
    setS(prev => ({ ...prev, accentColor: t.accent, titleColor: t.title, bgColor: t.bg, borderColor: t.border, nameColor: t.accent }));
    setDirty(true);
    setShowSaved(false);
  }

  return (
    <div className="flex gap-5 h-full min-h-0 pb-4">

      {/* ── Left controls panel ── */}
      <div className="w-72 shrink-0 overflow-y-auto space-y-2.5 pr-1" style={{ scrollbarWidth: "thin" }}>

        {/* Name */}
        <div className="rounded-xl p-3" style={{ border: "1.5px solid #E8EDE6", background: "#fff" }}>
          <label className="text-[11px] font-bold uppercase tracking-wider block mb-1.5" style={{ color: "#7A9878" }}>Template Name</label>
          <input value={name} onChange={e => { setName(e.target.value); setDirty(true); setShowSaved(false); }}
            className="w-full px-3 py-2 text-sm font-semibold rounded-lg border outline-none"
            style={{ borderColor: "#DDE8DA", color: "#1A2E1C", background: "#FAFCFA" }}
            placeholder="e.g. Classic Green" />
        </div>

        {/* Quick themes */}
        <SectionCard title="Quick Themes">
          <div className="flex flex-wrap gap-1.5">
            {THEMES.map(t => (
              <button key={t.name} type="button" onClick={() => applyTheme(t)}
                className="px-3 py-1 text-[11px] font-bold rounded-full transition-opacity hover:opacity-90"
                style={{ background: t.accent, color: "#fff" }}>
                {t.name}
              </button>
            ))}
          </div>
        </SectionCard>

        {/* Background */}
        <SectionCard title="Background">
          <Field label="Color"><ColorPicker value={s.bgColor} onChange={v => set("bgColor", v)} /></Field>
          <Field label="Gradient">
            <div className="flex items-center gap-2">
              <Toggle value={s.bgGradient} onChange={v => set("bgGradient", v)} />
              <span className="text-[10px]" style={{ color: "#9AB89E" }}>blend to a second color</span>
            </div>
          </Field>
          {s.bgGradient && (
            <Field label="Gradient to"><ColorPicker value={s.bgGradientTo} onChange={v => set("bgGradientTo", v)} /></Field>
          )}
        </SectionCard>

        {/* Border */}
        <SectionCard title="Border">
          <Field label="Style">
            <Sel value={s.borderStyle} onChange={v => set("borderStyle", v)} options={[
              { value: "none",   label: "None" },
              { value: "thin",   label: "Thin line" },
              { value: "double", label: "Double line" },
              { value: "ornate", label: "Ornate corners" },
            ]} />
          </Field>
          {s.borderStyle !== "none" && (
            <Field label="Color"><ColorPicker value={s.borderColor} onChange={v => set("borderColor", v)} /></Field>
          )}
        </SectionCard>

        {/* Accent bars */}
        <SectionCard title="Accent Bars">
          <Field label="Show bars"><Toggle value={s.showAccentBars} onChange={v => set("showAccentBars", v)} /></Field>
          {s.showAccentBars && (
            <Field label="Color"><ColorPicker value={s.accentColor} onChange={v => set("accentColor", v)} /></Field>
          )}
        </SectionCard>

        {/* Header */}
        <SectionCard title="Header">
          <Field label="School name"><TxtInput value={s.schoolName} onChange={v => set("schoolName", v)} placeholder="RaeLearn" /></Field>
        </SectionCard>

        {/* Title */}
        <SectionCard title="Certificate Title">
          <Field label="Title text"><TxtInput value={s.titleText} onChange={v => set("titleText", v)} placeholder="Certificate of Completion" /></Field>
          <Field label="Color"><ColorPicker value={s.titleColor} onChange={v => set("titleColor", v)} /></Field>
          <Field label="Font">
            <Sel value={s.titleFont} onChange={v => set("titleFont", v)} options={[
              { value: "serif", label: "Serif — elegant" },
              { value: "sans",  label: "Sans-serif — modern" },
            ]} />
          </Field>
        </SectionCard>

        {/* Body text */}
        <SectionCard title="Body Text">
          <Field label="Intro line"><TxtInput value={s.bodyIntro} onChange={v => set("bodyIntro", v)} placeholder="This certifies that" /></Field>
          <Field label="Completion"><TxtInput value={s.bodyCompletion} onChange={v => set("bodyCompletion", v)} placeholder="has successfully completed" /></Field>
        </SectionCard>

        {/* Learner name */}
        <SectionCard title="Learner Name">
          <Field label="Color"><ColorPicker value={s.nameColor} onChange={v => set("nameColor", v)} /></Field>
          <Field label="Size">
            <Sel value={s.nameFontSize} onChange={v => set("nameFontSize", v)} options={[
              { value: "xl",  label: "Small (28px)" },
              { value: "2xl", label: "Medium (36px)" },
              { value: "3xl", label: "Large (44px)" },
              { value: "4xl", label: "Extra Large (56px)" },
            ]} />
          </Field>
        </SectionCard>

        {/* Footer */}
        <SectionCard title="Footer">
          <Field label="Show date"><Toggle value={s.showDate} onChange={v => set("showDate", v)} /></Field>
          <Field label="Show cert #"><Toggle value={s.showCertNumber} onChange={v => set("showCertNumber", v)} /></Field>
          <Field label="Signature"><Toggle value={s.showSignature} onChange={v => set("showSignature", v)} /></Field>
          {s.showSignature && <>
            <Field label="Signer name"><TxtInput value={s.signatureName} onChange={v => set("signatureName", v)} /></Field>
            <Field label="Signer title"><TxtInput value={s.signatureTitle} onChange={v => set("signatureTitle", v)} /></Field>
          </>}
        </SectionCard>

        {/* Course assignment */}
        {id && courses.length > 0 && (
          <SectionCard title="Assign to Courses">
            <p className="text-[10px] mb-1" style={{ color: "#9AB89E" }}>Only certificate-eligible courses are shown.</p>
            <div className="space-y-2">
              {courses.map(c => {
                const isAssigned = c.certificate_template_id === id;
                return (
                  <form key={c.id} action={assignTemplateToCourse} className="flex items-center gap-2">
                    <input type="hidden" name="courseId" value={c.id} />
                    <input type="hidden" name="templateId" value={isAssigned ? "" : id} />
                    <span className="flex-1 text-[11px] truncate" style={{ color: "#4A6650" }}>{c.title}</span>
                    <button type="submit"
                      className="text-[11px] px-2.5 py-1 rounded-lg font-bold shrink-0 transition-colors"
                      style={{
                        background: isAssigned ? "#EEF5EE" : "#F5F5F5",
                        color: isAssigned ? "#2A5230" : "#7A7A7A",
                        border: `1px solid ${isAssigned ? "#C8DEC8" : "#E0E0E0"}`,
                      }}>
                      {isAssigned ? "✓ Assigned" : "Assign"}
                    </button>
                  </form>
                );
              })}
            </div>
          </SectionCard>
        )}

        {/* Delete */}
        {id && (
          <div className="rounded-xl p-3" style={{ border: "1.5px solid #FFE0E0", background: "#FFF8F8" }}>
            <div className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: "#AA2222" }}>Danger Zone</div>
            {!showDeleteConfirm ? (
              <button type="button" onClick={() => setShowDeleteConfirm(true)}
                className="text-xs px-3 py-1.5 rounded-lg font-semibold"
                style={{ background: "#FFF0F0", color: "#AA2222", border: "1px solid #FFCCCC" }}>
                Delete Template
              </button>
            ) : (
              <div className="space-y-2">
                <p className="text-[11px]" style={{ color: "#AA2222" }}>This cannot be undone. Courses using this template will lose it.</p>
                <div className="flex gap-2">
                  <form action={deleteTemplate}>
                    <input type="hidden" name="id" value={id} />
                    <button type="submit" className="text-xs px-3 py-1.5 rounded-lg font-bold"
                      style={{ background: "#AA2222", color: "#fff" }}>
                      Yes, delete
                    </button>
                  </form>
                  <button type="button" onClick={() => setShowDeleteConfirm(false)}
                    className="text-xs px-3 py-1.5 rounded-lg font-semibold"
                    style={{ background: "#F5F5F5", color: "#666" }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Right preview panel ── */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0">

        {/* Top bar */}
        <div className="flex items-center justify-between mb-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: "#9AB89E" }}>Live preview</span>
            {dirty && <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: "#FFF3DC", color: "#8A6020" }}>Unsaved</span>}
            {showSaved && !dirty && (
              <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: "#EEF5EE", color: "#2A5230" }}>✓ Saved</span>
            )}
          </div>
          <form action={upsertTemplate}>
            <input type="hidden" name="id" value={id ?? ""} />
            <input type="hidden" name="name" value={name} />
            <input type="hidden" name="settings" value={JSON.stringify(s)} />
            <button type="submit" disabled={isPending}
              className="px-5 py-2 text-sm font-bold rounded-xl transition-opacity"
              style={{ background: "#2A5230", color: "#fff", opacity: isPending ? 0.6 : 1 }}>
              {isPending ? "Saving…" : id ? "Save Changes" : "Create Template"}
            </button>
          </form>
        </div>

        {/* Certificate preview */}
        <div className="flex-1 rounded-2xl flex items-start justify-center p-6 overflow-auto"
          style={{ background: "#EAEEE9", border: "1.5px dashed #C8DEC8" }}>
          <div ref={previewRef} style={{ width: "100%", maxWidth: 900 }}>
            <div style={{
              width: 900,
              height: 636,
              transformOrigin: "top left",
              transform: `scale(${scale})`,
              marginBottom: `calc(${636 * scale}px - 636px)`,
            }}>
              <CertificatePreview
                settings={s}
                learnerName="Trishia Raymundo"
                courseTitle="VA Operations Fundamentals"
                certNumber="RL-2025-A1B2C3D4"
                issuedAt={new Date().toISOString()}
              />
            </div>
          </div>
        </div>

        {/* Scale note */}
        <p className="text-[10px] text-center mt-2 shrink-0" style={{ color: "#B8D4B5" }}>
          Preview at {Math.round(scale * 100)}% scale · Actual certificate is 900 × 636 px
        </p>
      </div>
    </div>
  );
}
