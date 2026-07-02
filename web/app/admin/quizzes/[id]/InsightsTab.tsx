const STATUS_META: Record<string, { label: string; bg: string; text: string }> = {
  passed:    { label: "Passed",    bg: "#EEF5EE", text: "#2A7A4A" },
  failed:    { label: "Failed",    bg: "#FFF0F0", text: "#AA2222" },
  submitted: { label: "Submitted", bg: "#F3F3F3", text: "#666" },
};

interface Taker {
  name: string;
  email: string;
  score: number | null;
  status: string;
  attemptedAt: string;
}

interface QuestionStat {
  question_text: string;
  correctPct: number;
  totalAnswered: number;
}

export default function InsightsTab({
  totalAttempts, uniqueTakers, passedCount, failedCount, avgScore, questionStats, takers,
}: {
  totalAttempts: number;
  uniqueTakers: number;
  passedCount: number;
  failedCount: number;
  avgScore: number;
  questionStats: QuestionStat[];
  takers: Taker[];
}) {
  const passRate = totalAttempts > 0 ? Math.round((passedCount / totalAttempts) * 100) : 0;

  const stats = [
    { label: "Total Attempts", value: totalAttempts, color: "#2A5230" },
    { label: "Unique Takers", value: uniqueTakers, color: "#2A5230" },
    { label: "Pass Rate", value: `${passRate}%`, color: passRate >= 70 ? "#2A7A4A" : "#8A6020" },
    { label: "Avg Score", value: `${avgScore}%`, color: "#2A5230" },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl p-4" style={{ background: "var(--admin-card-bg)", border: "1px solid var(--admin-border-mid)" }}>
            <div className="text-2xl font-extrabold" style={{ fontFamily: "var(--font-head)", color: s.color }}>{s.value}</div>
            <div className="text-[11px] font-bold uppercase tracking-wide mt-1" style={{ color: "var(--admin-text-muted)" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {totalAttempts === 0 ? (
        <div className="rounded-2xl py-14 text-center text-sm" style={{ color: "var(--admin-text-dim)", background: "var(--admin-table-head-bg)", border: "1px dashed #DDE8DA" }}>
          No attempts yet — insights will appear once learners start taking this quiz.
        </div>
      ) : (
        <>
          {/* Per-question difficulty */}
          {questionStats.length > 0 && (
            <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--admin-border-mid)" }}>
              <div className="px-5 py-3 text-[11px] font-extrabold uppercase tracking-wide" style={{ background: "var(--admin-table-head-bg)", color: "var(--admin-text-muted)" }}>
                Question Performance
              </div>
              <div className="divide-y" style={{ borderColor: "var(--admin-table-row-border)" }}>
                {questionStats.map((q, i) => (
                  <div key={i} className="px-5 py-3.5 flex items-center gap-4" style={{ background: "var(--admin-card-bg)" }}>
                    <span className="text-[13px] flex-1 truncate" style={{ color: "var(--admin-text-primary)" }}>
                      {i + 1}. {q.question_text}
                    </span>
                    <div className="w-32 h-2 rounded-full overflow-hidden shrink-0" style={{ background: "#EEF5EE" }}>
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${q.correctPct}%`,
                          background: q.correctPct >= 70 ? "#4A8A52" : q.correctPct >= 40 ? "#E8A03A" : "#CC4444",
                        }}
                      />
                    </div>
                    <span className="text-[12.5px] font-bold w-10 text-right shrink-0" style={{ color: "var(--admin-text-muted)" }}>
                      {q.correctPct}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Takers table */}
          <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--admin-border-mid)" }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--admin-border)", background: "var(--admin-table-head-bg)" }}>
                  <th className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: "var(--admin-text-muted)" }}>Learner</th>
                  <th className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: "var(--admin-text-muted)" }}>Score</th>
                  <th className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: "var(--admin-text-muted)" }}>Status</th>
                  <th className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: "var(--admin-text-muted)" }}>Attempted</th>
                </tr>
              </thead>
              <tbody>
                {takers.map((t, i) => {
                  const sm = STATUS_META[t.status] ?? STATUS_META.submitted;
                  return (
                    <tr key={i} style={{ borderBottom: "1px solid var(--admin-table-row-border)", background: "var(--admin-card-bg)" }}>
                      <td className="px-5 py-3">
                        <div className="font-medium" style={{ color: "var(--admin-text-primary)" }}>{t.name}</div>
                        <div className="text-xs mt-0.5" style={{ color: "var(--admin-text-dim)" }}>{t.email}</div>
                      </td>
                      <td className="px-5 py-3 font-bold" style={{ color: "var(--admin-text-muted)" }}>
                        {t.score ?? "—"}{t.score !== null ? "%" : ""}
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full" style={{ background: sm.bg, color: sm.text }}>
                          {sm.label}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-[12.5px]" style={{ color: "var(--admin-text-muted)" }}>
                        {new Date(t.attemptedAt).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
