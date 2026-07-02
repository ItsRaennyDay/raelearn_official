"use client";

interface Note {
  id: string;
  note: string;
  created_at: string;
  author: { full_name?: string; email?: string } | null;
}

interface Props {
  userId: string;
  notes: Note[];
  addNote: (formData: FormData) => Promise<void>;
  deleteNote: (formData: FormData) => Promise<void>;
}

export default function NotesTab({ userId, notes, addNote, deleteNote }: Props) {
  return (
    <div className="space-y-5">
      <form
        action={addNote}
        className="rounded-2xl p-5"
        style={{ background: "var(--admin-card-bg)", border: "1.5px solid var(--admin-border)" }}
      >
        <input type="hidden" name="userId" value={userId} />
        <label className="text-xs font-semibold" style={{ color: "var(--admin-text-muted)" }}>Add a note</label>
        <textarea
          name="note"
          required
          rows={3}
          placeholder="Internal note about this user — only visible to admins…"
          className="w-full mt-2 px-4 py-3 text-sm rounded-xl border outline-none resize-y"
          style={{ borderColor: "var(--admin-border-mid)", background: "var(--admin-table-head-bg)", color: "var(--admin-text-primary)" }}
        />
        <button type="submit" className="mt-3 px-5 py-2 text-sm font-bold rounded-xl" style={{ background: "#2A5230", color: "#fff" }}>
          Add Note
        </button>
      </form>

      <div className="rounded-2xl overflow-hidden" style={{ background: "var(--admin-card-bg)", border: "1.5px solid var(--admin-border)" }}>
        {notes.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm" style={{ color: "var(--admin-text-dim)" }}>No notes yet.</div>
        ) : (
          <div className="divide-y" style={{ borderColor: "var(--admin-table-row-border)" }}>
            {notes.map((n) => (
              <div key={n.id} className="px-5 py-4 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm whitespace-pre-wrap" style={{ color: "var(--admin-text-primary)" }}>{n.note}</p>
                  <div className="text-xs mt-1.5" style={{ color: "var(--admin-text-dim)" }}>
                    {n.author?.full_name || n.author?.email || "Admin"} · {new Date(n.created_at).toLocaleString()}
                  </div>
                </div>
                <form
                  action={deleteNote}
                  onSubmit={(e) => { if (!confirm("Delete this note?")) e.preventDefault(); }}
                >
                  <input type="hidden" name="noteId" value={n.id} />
                  <input type="hidden" name="userId" value={userId} />
                  <button type="submit" className="text-xs font-bold px-2.5 py-1 rounded-lg shrink-0" style={{ background: "#FFF0F0", color: "#AA2222" }}>
                    Delete
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
