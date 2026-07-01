"use client";

import { useState, useEffect } from "react";

interface A11ySetting {
  key: string;
  label: string;
  desc: string;
  cls: string;
}

const SETTINGS: A11ySetting[] = [
  { key: "a11y_large_text", label: "Large text", desc: "Increase base font size throughout the site", cls: "a11y-large-text" },
  { key: "a11y_high_contrast", label: "High contrast", desc: "Stronger color contrast for readability", cls: "a11y-high-contrast" },
  { key: "a11y_reduced_motion", label: "Reduce motion", desc: "Minimize animations and transitions", cls: "a11y-reduced-motion" },
];

export default function AccessibilityForm() {
  const [values, setValues] = useState<Record<string, boolean>>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const loaded: Record<string, boolean> = {};
    for (const s of SETTINGS) {
      const stored = localStorage.getItem(s.key) === "1";
      loaded[s.key] = stored;
      document.documentElement.classList.toggle(s.cls, stored);
    }
    setValues(loaded);
    setMounted(true);
  }, []);

  function toggle(setting: A11ySetting, checked: boolean) {
    setValues((prev) => ({ ...prev, [setting.key]: checked }));
    localStorage.setItem(setting.key, checked ? "1" : "0");
    document.documentElement.classList.toggle(setting.cls, checked);
  }

  if (!mounted) return null;

  return (
    <div className="space-y-3 mt-4">
      {SETTINGS.map((s) => (
        <label key={s.key} className="flex items-start gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={values[s.key] ?? false}
            onChange={(e) => toggle(s, e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded"
            style={{ accentColor: "#2A5230" }}
          />
          <div>
            <div className="text-sm font-medium" style={{ color: "#1A2E1C" }}>{s.label}</div>
            <div className="text-xs" style={{ color: "#9AB89E" }}>{s.desc}</div>
          </div>
        </label>
      ))}
      <p className="text-xs pt-1" style={{ color: "#C8C8C8" }}>These settings are saved on this device only.</p>
    </div>
  );
}
