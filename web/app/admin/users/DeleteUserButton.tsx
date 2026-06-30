"use client";

export default function DeleteUserButton({
  userId,
  email,
  action,
}: {
  userId: string;
  email: string;
  action: (fd: FormData) => Promise<void>;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(`Delete ${email}?\n\nThis permanently removes their account and cannot be undone.`)) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="userId" value={userId} />
      <button
        type="submit"
        className="text-xs font-bold px-3 py-1 rounded-lg"
        style={{ background: "#FFF0F0", color: "#AA2222" }}
      >
        Delete
      </button>
    </form>
  );
}
