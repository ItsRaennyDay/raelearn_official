"use client";

import { useTransition } from "react";
import { updatePreferences } from "./actions";

interface Prefs {
  email_enrollment: boolean;
  email_updates: boolean;
  email_support: boolean;
}

const PREF_ITEMS = [
  { name: "email_enrollment" as keyof Prefs, label: "Enrollment confirmations", desc: "When you're enrolled in a new course" },
  { name: "email_updates" as keyof Prefs, label: "Course updates", desc: "New lessons, announcements, and changes" },
  { name: "email_support" as keyof Prefs, label: "Support responses", desc: "Replies to your support tickets" },
];

export default function PrefsForm({ prefs }: { prefs: Prefs }) {
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(() => {
      updatePreferences(formData);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 mt-4">
      {PREF_ITEMS.map((item) => (
        <label key={item.name} className="flex items-start gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            name={item.name}
            defaultChecked={prefs[item.name]}
            className="mt-0.5 w-4 h-4 rounded"
            style={{ accentColor: "#2A5230" }}
          />
          <div>
            <div className="text-sm font-medium" style={{ color: "#1A2E1C" }}>{item.label}</div>
            <div className="text-xs" style={{ color: "#9AB89E" }}>{item.desc}</div>
          </div>
        </label>
      ))}
      <button
        type="submit"
        disabled={pending}
        className="w-full sm:w-auto px-5 py-2.5 text-sm font-bold rounded-xl disabled:opacity-60"
        style={{ background: "#2A5230", color: "#fff" }}
      >
        {pending ? "Saving…" : "Save Preferences"}
      </button>
    </form>
  );
}
