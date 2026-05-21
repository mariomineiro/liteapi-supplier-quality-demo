"use client";
import Link from "next/link";
import { useState } from "react";

type Props = {
  source?: string;
  formula?: string;
  why?: string;
  kpi?: string;        // KPI name → link to /kpi-catalog?q=<kpi>
  size?: number;
};

export default function InfoTip({ source, formula, why, kpi, size = 13 }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <span
      style={{ position: "relative", display: "inline-flex", marginLeft: 6, cursor: "help", zIndex: 100 }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onClick={(e) => { e.preventDefault(); setOpen(v => !v); }}
    >
      <span style={{
        width: size, height: size, borderRadius: "50%",
        background: "rgba(21,101,192,0.18)",
        border: "1px solid rgba(21,101,192,0.55)",
        color: "var(--accent-blue)",
        fontSize: size - 4, fontWeight: 700,
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        lineHeight: 1, fontFamily: "Georgia, serif", fontStyle: "italic",
      }}>i</span>

      {open && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "absolute", bottom: "calc(100% + 8px)", left: 0,
            zIndex: 9999, width: 320,
            background: "var(--bg-elev-2)",
            border: "1px solid var(--line-bright)",
            borderRadius: 8, padding: "12px 14px",
            boxShadow: "0 14px 40px rgba(0,0,0,0.6)",
            fontSize: 12, lineHeight: 1.55, color: "var(--ink)",
            textAlign: "left",
          }}>
          {source && (
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 9, letterSpacing: 1.2, color: "var(--ink-faint)", textTransform: "uppercase", fontWeight: 600 }}>Source</div>
              <div className="mono" style={{ color: "var(--accent-blue)", fontSize: 11, wordBreak: "break-word" }}>{source}</div>
            </div>
          )}
          {formula && (
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 9, letterSpacing: 1.2, color: "var(--ink-faint)", textTransform: "uppercase", fontWeight: 600 }}>Formula</div>
              <div className="mono" style={{ color: "var(--accent)", fontSize: 11, wordBreak: "break-word" }}>{formula}</div>
            </div>
          )}
          {why && (
            <div style={{ marginBottom: kpi ? 8 : 0 }}>
              <div style={{ fontSize: 9, letterSpacing: 1.2, color: "var(--ink-faint)", textTransform: "uppercase", fontWeight: 600 }}>Why it matters</div>
              <div style={{ color: "var(--ink-dim)", fontSize: 11 }}>{why}</div>
            </div>
          )}
          {kpi && (
            <Link
              href={`/kpi-catalog?q=${encodeURIComponent(kpi)}`}
              style={{
                display: "block",
                marginTop: 6, padding: "6px 8px",
                background: "rgba(92,58,175,0.18)",
                border: "1px solid rgba(92,58,175,0.5)",
                borderRadius: 4,
                fontSize: 11, color: "var(--brand-bright)",
                textAlign: "center",
                textDecoration: "none",
              }}
              onClick={(e) => { e.stopPropagation(); setOpen(false); }}
            >
              → see &ldquo;{kpi}&rdquo; in KPI Catalog
            </Link>
          )}
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
