"use client";

import { useRef } from "react";

export default function DeleteBundleButton({
  id,
  title,
  deleteAction,
}: {
  id: string;
  title: string;
  deleteAction: (formData: FormData) => Promise<void>;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={deleteAction}
      onSubmit={(e) => {
        if (!confirm(`Delete "${title}"?`)) e.preventDefault();
      }}
      className="shrink-0"
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="text-xs font-bold px-2.5 py-1.5 rounded-lg"
        style={{ color: "#AA2222", background: "#FFF0F0" }}
      >
        Delete
      </button>
    </form>
  );
}
