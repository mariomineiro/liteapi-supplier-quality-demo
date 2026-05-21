"use client";
import { useState } from "react";

type Props = {
  source?: string;     // where the data comes from
  formula?: string;    // how it's calculated
  why?: string;        // why it matters / business decision it informs
  size?: number;
};

export default function InfoTip({ source, formula, why, size = 13 }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <span
      style={{ position: "relative", display: "inline-flex", marginLeft: 6, cursor: "help" }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onClick={(e) => { e.preventDefault(); setOpen(v => !v); }}
    >
      <span style={{
        width: size, height: size, borderRadius: "50%",
        background: "rgba(77,155,255,0.15)",
        border: "1px solid rgba(77,155,255,0.5)",
        color: "var(--accent-blue)",
        fontSize: size - 4, fontWeight: 700,
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        lineHeight: 1, fontFamily: "Georgia, serif", fontStyle: "italic",
      }}>i</span>

      {open && (
        <div style={{
          position: "absolute", bottom: "calc(100% + 8px)", left: 0,
          zIndex: 50, width: 320,
          background: "var(--bg-elev-2)",
          border: "1px solid var(--line-bright)",
          borderRadius: 8, padding: "12px 14px",
          boxShadow: "0 14px 40px rgba(0,0,0,0.5)",
          fontSize: 12, lineHeight: 1.55, color: "var(--ink)",
          textAlign: "left",
        }}>
          {source && (
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 9, letterSpacing: 1.2, color: "var(--ink-faint)", textTransform: "uppercase", fontWeight: 600 }}>Source</div>
              <div className="mono" style={{ color: "var(--accent-blue)", fontSize: 11 }}>{source}</div>
            </div>
          )}
          {formula && (
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 9, letterSpacing: 1.2, color: "var(--ink-faint)", textTransform: "uppercase", fontWeight: 600 }}>Formula</div>
              <div className="mono" style={{ color: "var(--accent)", fontSize: 11 }}>{formula}</div>
            </div>
          )}
          {why && (
            <div>
              <div style={{ fontSize: 9, letterSpacing: 1.2, color: "var(--ink-faint)", textTransform: "uppercase", fontWeight: 600 }}>Why it matters</div>
              <div style={{ color: "var(--ink-dim)", fontSize: 11 }}>{why}</div>
            </div>
          )}
          {/* little arrow */}
          <div style={{
            position: "absolute", top: "100%", left: 6,
            width: 0, height: 0,
            borderLeft: "6px solid transparent",
            borderRight: "6px solid transparent",
            borderTop: "6px solid var(--line-bright)",
          }} />
        </div>
      )}
    </span>
  );
}
