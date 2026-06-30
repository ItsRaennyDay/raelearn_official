"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const LEVELS   = ["beginner", "intermediate", "advanced"] as const;
const PRICE_TYPES = ["free", "paid"] as const;

export default function NewCoursePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
    level: "beginner" as typeof LEVELS[number],
    price_type: "free" as typeof PRICE_TYPES[number],
    price_cents: 0,
    certificate_eligible: false,
  });

  function toSlug(t: string) {
    return t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }

  function set<K extends keyof typeof form>(key: K, val: typeof form[K]) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const res = await fetch("/api/admin/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        price_cents: form.price_type === "free" ? 0 : Number(form.price_cents),
      }),
    });

    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(data.error ?? "Failed to create course.");
      return;
    }

    router.push(`/admin/courses/${data.id}`);
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="font-head font-extrabold text-2xl text-[#2A5230]">New Course</h1>
        <p className="text-sm text-[#7A9878] mt-1">Fill in the basics — you can add lessons after.</p>
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Field label="Course title">
          <input
            required
            value={form.title}
            onChange={(e) => {
              set("title", e.target.value);
              set("slug", toSlug(e.target.value));
            }}
            className={inputCls}
            placeholder="e.g. Nonprofit Operations Basics"
          />
        </Field>

        <Field label="Slug (URL)" hint="Auto-generated, must be unique">
          <input
            required
            pattern="[a-z0-9-]+"
            value={form.slug}
            onChange={(e) => set("slug", e.target.value)}
            className={inputCls}
            placeholder="nonprofit-operations-basics"
          />
        </Field>

        <Field label="Description">
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            className={inputCls}
            placeholder="What will students learn? (shown on course page)"
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Level">
            <select value={form.level} onChange={(e) => set("level", e.target.value as typeof LEVELS[number])} className={inputCls}>
              {LEVELS.map((l) => <option key={l} value={l} className="capitalize">{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
            </select>
          </Field>

          <Field label="Price type">
            <select value={form.price_type} onChange={(e) => set("price_type", e.target.value as typeof PRICE_TYPES[number])} className={inputCls}>
              <option value="free">Free</option>
              <option value="paid">Paid</option>
            </select>
          </Field>
        </div>

        {form.price_type === "paid" && (
          <Field label="Price (USD)">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7A9878] text-sm">$</span>
              <input
                type="number"
                min={1}
                max={9999}
                value={form.price_cents / 100 || ""}
                onChange={(e) => set("price_cents", Math.round(parseFloat(e.target.value || "0") * 100))}
                className={inputCls + " pl-8"}
                placeholder="49"
              />
            </div>
          </Field>
        )}

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.certificate_eligible}
            onChange={(e) => set("certificate_eligible", e.target.checked)}
            className="w-4 h-4 rounded accent-[#2A5230]"
          />
          <span className="text-sm font-medium text-[#2A5230]">Certificate eligible</span>
        </label>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-[#2A5230] text-white font-bold text-sm rounded-xl hover:bg-[#1e3d24] disabled:opacity-50 transition-colors"
          >
            {saving ? "Creating…" : "Create Course →"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 text-[#4A6650] font-medium text-sm rounded-xl border border-[#DDE8DA] hover:border-[#2A5230] transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

const inputCls = "w-full px-4 py-2.5 rounded-xl border border-[#DDE8DA] bg-white text-[#2A5230] text-sm focus:outline-none focus:ring-2 focus:ring-[#2A5230] focus:border-transparent transition";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-[#2A5230] mb-1.5">
        {label}
        {hint && <span className="font-normal text-[#7A9878] ml-2">— {hint}</span>}
      </label>
      {children}
    </div>
  );
}
