"use client";

import { useTransition } from "react";
import { changePassword } from "./actions";

export default function PasswordForm() {
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(() => {
      changePassword(formData);
    });
  }

  const fields = [
    { name: "current", label: "Current password", placeholder: "Your current password" },
    { name: "password", label: "New password", placeholder: "At least 8 characters" },
    { name: "confirm", label: "Confirm new password", placeholder: "Repeat new password" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-3 mt-4">
      {fields.map((f) => (
        <div key={f.name}>
          <label htmlFor={`pw-${f.name}`} className="text-xs font-semibold block mb-1" style={{ color: "#7A9878" }}>
            {f.label}
          </label>
          <input
            id={`pw-${f.name}`}
            name={f.name}
            type="password"
            required
            placeholder={f.placeholder}
            className="w-full px-4 py-2.5 text-sm rounded-xl border outline-none"
            style={{ borderColor: "#DDE8DA", background: "#FAFCFA", color: "#1A2E1C" }}
          />
        </div>
      ))}
      <button
        type="submit"
        disabled={pending}
        className="w-full sm:w-auto px-5 py-2.5 text-sm font-bold rounded-xl disabled:opacity-60"
        style={{ background: "#2A5230", color: "#fff" }}
      >
        {pending ? "Updating…" : "Update Password"}
      </button>
    </form>
  );
}
