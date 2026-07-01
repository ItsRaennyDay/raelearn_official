"use client";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="text-sm font-bold px-4 py-2 rounded-xl"
      style={{ background: "#2A5230", color: "#fff" }}
    >
      Download / Print
    </button>
  );
}
