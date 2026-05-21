"use client";
import { useEffect, useRef, useState } from "react";

type Step =
  | { kind: "say"; role: "user" | "agent"; text: string }
  | { kind: "tool"; tool: string; ms: number; status?: "ok" | "warn" }
  | { kind: "result"; rows: Record<string, string> };

const SCRIPT: Step[] = [
  { kind: "say", role: "user", text: "Find me a cheaper Lisbon hotel for next weekend, same vibe as my last stay." },
  { kind: "say", role: "agent", text: "Reading your prior stays in Lisbon to find the match..." },
  { kind: "tool", tool: "GET /bookings/list?customer=mario&city=Lisbon", ms: 92 },
  { kind: "say", role: "agent", text: "You stayed at Pestana Vintage (4★, €198/night, river-side). I'll find candidates in the same band with better price-to-quality." },
  { kind: "tool", tool: "POST /search { lat: 38.71, lon: -9.14, radius: 1.5km }", ms: 168 },
  { kind: "tool", tool: "GET /data/hotel × 12", ms: 412, status: "warn" },
  { kind: "tool", tool: "POST /hotels/rates × 12", ms: 348 },
  { kind: "say", role: "agent", text: "Scoring 12 candidates on content × price × your past preferences..." },
  { kind: "tool", tool: "BigQuery · supplier_quality_daily × ranking", ms: 224 },
  { kind: "result", rows: {
    "Best match": "Lumen Hotel & Light Show · 4★",
    "Distance from prev hotel": "0.9 km",
    "Nightly rate": "€156 (you usually pay €198, saving €42/night)",
    "Content score": "98% (vs catalogue median 72%)",
    "Review count": "3,472",
    "Confidence": "0.91",
  }},
  { kind: "say", role: "agent", text: "Want me to hold Lumen with your usual breakfast + late checkout? I'll keep the room until midnight if you say yes." },
];

export default function LiveAgent() {
  const [steps, setSteps] = useState<Step[]>([]);
  const [running, setRunning] = useState(false);
  const [idx, setIdx] = useState(0);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!running) return;
    if (idx >= SCRIPT.length) { setRunning(false); return; }
    const t = setTimeout(() => {
      setSteps(s => [...s, SCRIPT[idx]]);
      setIdx(i => i + 1);
    }, idx === 0 ? 200 : SCRIPT[idx].kind === "tool" ? 350 : 750);
    return () => clearTimeout(t);
  }, [idx, running]);

  useEffect(() => {
    if (scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight;
  }, [steps]);

  const start = () => { setSteps([]); setIdx(0); setRunning(true); };
  const reset = () => { setSteps([]); setIdx(0); setRunning(false); };

  return (
    <div style={{ background: "linear-gradient(135deg, rgba(92,58,175,0.10) 0%, rgba(21,101,192,0.06) 100%)", border: "1px solid var(--brand-dim)", borderRadius: 12, padding: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 13, color: "var(--ink)", fontWeight: 700 }}>🤖 Live agent simulation</div>
          <div style={{ fontSize: 11, color: "var(--ink-faint)", marginTop: 2 }}>Press play. The agent runs a real-ish travel-rebook flow over the LiteAPI MCP surface.</div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={start} disabled={running} style={{
            padding: "6px 16px", borderRadius: 6, fontSize: 12, fontWeight: 600,
            background: running ? "var(--bg-elev-2)" : "var(--brand)", color: "#fff",
            border: "none", cursor: running ? "wait" : "pointer",
          }}>{running ? "running…" : steps.length === 0 ? "▶ run agent" : "▶ run again"}</button>
          {steps.length > 0 && !running && (
            <button onClick={reset} style={{ padding: "6px 12px", borderRadius: 6, fontSize: 12, background: "var(--bg-elev-2)", color: "var(--ink-dim)", border: "1px solid var(--line)", cursor: "pointer" }}>reset</button>
          )}
        </div>
      </div>

      <div ref={scroller} style={{ background: "var(--bg-elev)", border: "1px solid var(--line)", borderRadius: 8, padding: 14, maxHeight: 360, overflowY: "auto", fontSize: 12 }}>
        {steps.length === 0 && (
          <div style={{ color: "var(--ink-faint)", padding: "20px 0", textAlign: "center" }}>
            Click <b style={{ color: "var(--brand-bright)" }}>▶ run agent</b> to simulate an agentic travel booking using the LiteAPI MCP surface.
          </div>
        )}
        {steps.map((s, i) => <StepView key={i} step={s} />)}
        {running && idx < SCRIPT.length && <Thinking />}
      </div>
    </div>
  );
}

function StepView({ step }: { step: Step }) {
  if (step.kind === "say") {
    return (
      <div style={{ padding: "8px 0", borderLeft: `2px solid ${step.role === "user" ? "var(--accent-blue)" : "var(--brand-bright)"}`, paddingLeft: 12, marginBottom: 4 }}>
        <div style={{ fontSize: 10, color: step.role === "user" ? "var(--accent-blue)" : "var(--brand-bright)", letterSpacing: 1, textTransform: "uppercase" }}>{step.role === "user" ? "🧑 you" : "🤖 agent"}</div>
        <div style={{ color: "var(--ink)", lineHeight: 1.5, marginTop: 2 }}>{step.text}</div>
      </div>
    );
  }
  if (step.kind === "tool") {
    return (
      <div className="mono" style={{ padding: "4px 0 4px 12px", fontSize: 11, color: "var(--ink-faint)", display: "flex", gap: 10 }}>
        <span style={{ color: step.status === "warn" ? "var(--warn)" : "var(--accent)" }}>{step.status === "warn" ? "⚠" : "✓"}</span>
        <span style={{ color: "var(--accent-blue)" }}>{step.tool}</span>
        <span>{step.ms}ms</span>
      </div>
    );
  }
  if (step.kind === "result") {
    return (
      <div style={{ marginTop: 10, padding: 12, background: "rgba(7,148,85,0.08)", border: "1px solid var(--accent-dim)", borderRadius: 6 }}>
        <div className="mono" style={{ fontSize: 10, color: "var(--accent)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>result</div>
        {Object.entries(step.rows).map(([k, v]) => (
          <div key={k} style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: 10, padding: "3px 0", fontSize: 12 }}>
            <span style={{ color: "var(--ink-faint)" }}>{k}</span>
            <span className="mono" style={{ color: "var(--ink)" }}>{v}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

function Thinking() {
  return (
    <div className="mono" style={{ padding: "8px 12px", color: "var(--ink-faint)", fontSize: 11 }}>
      <span style={{ animation: "pulse-dot 1s infinite" }}>● ● ●</span> thinking
    </div>
  );
}
