import { TemplateSettings, DEFAULT_SETTINGS } from "@/lib/certificate-types";

interface Props {
  settings?: Partial<TemplateSettings>;
  learnerName?: string;
  courseTitle?: string;
  certNumber?: string;
  issuedAt?: string;
}

const NAME_FONT_SIZE: Record<string, number> = { xl: 28, "2xl": 36, "3xl": 44, "4xl": 56 };

export default function CertificatePreview({
  settings: partial = {},
  learnerName = "Learner Full Name",
  courseTitle = "Course Title Here",
  certNumber = "RL-2025-A1B2C3D4",
  issuedAt,
}: Props) {
  const s: TemplateSettings = { ...DEFAULT_SETTINGS, ...partial };

  const dateStr = new Date(issuedAt ?? Date.now()).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });

  const bg = s.bgGradient
    ? `linear-gradient(135deg, ${s.bgColor} 0%, ${s.bgGradientTo} 100%)`
    : s.bgColor;

  const serifFamily = "Georgia, 'Times New Roman', serif";
  const sansFamily = "var(--font-head, system-ui), sans-serif";
  const titleFamily = s.titleFont === "serif" ? serifFamily : sansFamily;
  const nameFontSize = NAME_FONT_SIZE[s.nameFontSize] ?? 44;

  const outerBorder: React.CSSProperties =
    s.borderStyle === "thin"   ? { border: `2px solid ${s.borderColor}` } :
    s.borderStyle === "double" ? { border: `5px double ${s.borderColor}` } :
    s.borderStyle === "ornate" ? { border: `2px solid ${s.borderColor}` } :
    {};

  return (
    <div
      style={{
        width: 900,
        minHeight: 636,
        background: bg,
        position: "relative",
        display: "flex",
        flexDirection: "column",
        fontFamily: sansFamily,
        boxSizing: "border-box",
        ...outerBorder,
      }}
    >
      {/* Ornate inner frame */}
      {s.borderStyle === "ornate" && (
        <>
          <div style={{ position: "absolute", inset: 10, border: `1px solid ${s.borderColor}44`, pointerEvents: "none" }} />
          {/* Corner brackets */}
          {(["top-left","top-right","bottom-left","bottom-right"] as const).map((pos) => {
            const isTop = pos.startsWith("top");
            const isLeft = pos.endsWith("left");
            return (
              <div key={pos} style={{
                position: "absolute",
                width: 28,
                height: 28,
                top: isTop ? 6 : undefined,
                bottom: isTop ? undefined : 6,
                left: isLeft ? 6 : undefined,
                right: isLeft ? undefined : 6,
                borderTop: isTop ? `2.5px solid ${s.borderColor}` : undefined,
                borderBottom: !isTop ? `2.5px solid ${s.borderColor}` : undefined,
                borderLeft: isLeft ? `2.5px solid ${s.borderColor}` : undefined,
                borderRight: !isLeft ? `2.5px solid ${s.borderColor}` : undefined,
              }} />
            );
          })}
        </>
      )}

      {/* Top accent bar */}
      {s.showAccentBars && (
        <div style={{
          height: 8,
          background: `linear-gradient(90deg, ${s.accentColor}, ${s.accentColor}BB)`,
          flexShrink: 0,
        }} />
      )}

      {/* Main content */}
      <div style={{ flex: 1, padding: "32px 56px 24px", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
          <div style={{
            fontFamily: sansFamily,
            fontWeight: 900,
            fontSize: 17,
            color: s.accentColor,
            letterSpacing: 1.5,
            textTransform: "uppercase",
          }}>
            {s.schoolName}
          </div>
          {s.showCertNumber && (
            <div style={{ fontSize: 10, color: "#9AB89E", fontFamily: "monospace", letterSpacing: 1, paddingTop: 2 }}>
              No. {certNumber}
            </div>
          )}
        </div>

        {/* Center block */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
          {/* Title */}
          <div style={{
            fontFamily: titleFamily,
            fontSize: 30,
            fontWeight: 700,
            color: s.titleColor,
            letterSpacing: 3,
            textTransform: "uppercase",
            marginBottom: 10,
          }}>
            {s.titleText}
          </div>

          {/* Ornamental divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 26, width: 260 }}>
            <div style={{ flex: 1, height: 1, background: `${s.accentColor}40` }} />
            <svg width="14" height="14" viewBox="0 0 14 14">
              <path d="M7 1 L8.5 5.5 L13 7 L8.5 8.5 L7 13 L5.5 8.5 L1 7 L5.5 5.5 Z"
                fill={s.accentColor} opacity="0.7" />
            </svg>
            <div style={{ flex: 1, height: 1, background: `${s.accentColor}40` }} />
          </div>

          {/* Body intro */}
          <div style={{
            fontSize: 13,
            color: "#7A9878",
            fontStyle: "italic",
            fontFamily: titleFamily,
            marginBottom: 14,
          }}>
            {s.bodyIntro}
          </div>

          {/* Learner name */}
          <div style={{
            fontFamily: titleFamily,
            fontSize: nameFontSize,
            fontWeight: 700,
            color: s.nameColor,
            marginBottom: 14,
            lineHeight: 1.1,
          }}>
            {learnerName}
          </div>

          {/* Completion text */}
          <div style={{
            fontSize: 13,
            color: "#7A9878",
            fontStyle: "italic",
            fontFamily: titleFamily,
            marginBottom: 10,
          }}>
            {s.bodyCompletion}
          </div>

          {/* Course title */}
          <div style={{
            fontSize: 18,
            fontWeight: 700,
            color: s.titleColor,
            fontFamily: titleFamily,
          }}>
            {courseTitle}
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 28, paddingTop: 16 }}>
          {s.showDate ? (
            <div>
              <div style={{ fontSize: 9, color: "#B8D4B5", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 3 }}>
                Date Issued
              </div>
              <div style={{ fontSize: 12, color: s.titleColor, fontFamily: titleFamily }}>
                {dateStr}
              </div>
            </div>
          ) : <div />}

          {s.showSignature ? (
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: s.titleColor, fontFamily: titleFamily }}>
                {s.signatureName}
              </div>
              <div style={{
                borderTop: `1.5px solid ${s.accentColor}40`,
                paddingTop: 5,
                marginTop: 2,
                fontSize: 9,
                color: "#9AB89E",
                textTransform: "uppercase",
                letterSpacing: 1,
              }}>
                {s.signatureTitle}
              </div>
            </div>
          ) : <div />}
        </div>
      </div>

      {/* Bottom accent bar */}
      {s.showAccentBars && (
        <div style={{
          height: 8,
          background: `linear-gradient(90deg, ${s.accentColor}BB, ${s.accentColor})`,
          flexShrink: 0,
        }} />
      )}
    </div>
  );
}
