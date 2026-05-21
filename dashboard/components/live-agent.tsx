"use client";
import { useEffect, useRef, useState } from "react";

type Step =
  | { kind: "say"; role: "user" | "agent"; text: string }
  | { kind: "tool"; tool: string; ms: number; status?: "ok" | "warn" }
  | { kind: "result"; rows: Record<string, string>; bookable?: { id: string; name: string; price: string; link: string; saving: string } };

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
  {
    kind: "result",
    rows: {
      "Best match": "Lumen Hotel & Light Show · 4★",
      "Distance from prev hotel": "0.9 km",
      "Nightly rate": "€156 (you usually pay €198, saving €42/night)",
      "Content score": "98% (vs catalogue median 72%)",
      "Review count": "3,472",
      "Confidence": "0.91",
    },
    bookable: {
      id: "lp6xy219",
      name: "Lumen Hotel & The Lisbon Light Show",
      price: "€156/night",
      link: "https://www.lumenhotel.pt/",
      saving: "€42/night",
    },
  },
  { kind: "say", role: "agent", text: "Want me to hold Lumen with your usual breakfast + late checkout? I'll keep the room until midnight if you say yes." },
];

const BOOK_STEPS: Step[] = [
  { kind: "say", role: "user", text: "Yes, book it." },
  { kind: "tool", tool: "POST /bookings (idempotency-key: agent-1739...)", ms: 412 },
  { kind: "tool", tool: "POST /loyalty/apply { tier: silver }", ms: 88 },
  { kind: "say", role: "agent", text: "Booked. Confirmation BX-A3F19. Breakfast + late checkout requested. What's next — should I also look at the flight?" },
];

const SKIP_STEPS: Step[] = [
  { kind: "say", role: "user", text: "Not quite — widen the radius and try the 5★ band." },
  { kind: "tool", tool: "POST /search { lat: 38.71, lon: -9.14, radius: 3km, stars: 5 }", ms: 198 },
  { kind: "tool", tool: "POST /hotels/rates × 8", ms: 311 },
  { kind: "say", role: "agent", text: "8 more candidates. Top is Corpo Santo Lisbon Historical (5★, €264/n, 8 min walk from your usual area). Worth a look?" },
];

export default function LiveAgent() {
  const [steps, setSteps] = useState<Step[]>([]);
  const [running, setRunning] = useState(false);
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<"initial" | "decision" | "booked" | "skipped">("initial");
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!running) return;
    if (idx >= SCRIPT.length) {
      setRunning(false);
      setPhase("decision");
      return;
    }
    const cur = SCRIPT[idx];
    const delay = idx === 0 ? 200 : cur.kind === "tool" ? 350 : cur.kind === "result" ? 600 : 750;
    const t = setTimeout(() => {
      setSteps(s => [...s, cur]);
      setIdx(i => i + 1);
    }, delay);
    return () => clearTimeout(t);
  }, [idx, running]);

  useEffect(() => {
    if (scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight;
  }, [steps]);

  const start = () => { setSteps([]); setIdx(0); setRunning(true); setPhase("initial"); };
  const reset = () => { setSteps([]); setIdx(0); setRunning(false); setPhase("initial"); };

  const onBook = () => {
    setPhase("booked");
    appendSequence(BOOK_STEPS);
  };
  const onSkip = () => {
    setPhase("skipped");
    appendSequence(SKIP_STEPS);
  };

  function appendSequence(seq: Step[]) {
    seq.forEach((s, i) => {
      setTimeout(() => setSteps(prev => [...prev, s]), 350 + i * 600);
    });
  }

  // ── KPIs computed from the run
  const toolSteps = steps.filter((s): s is Extract<Step, { kind: "tool" }> => s.kind === "tool");
  const toolCount = toolSteps.length;
  const totalLatency = toolSteps.reduce((s, t) => s + t.ms, 0);
  const result = steps.find((s): s is Extract<Step, { kind: "result" }> => s.kind === "result");
  const confidence = result ? Number(result.rows["Confidence"]) : 0;
  const saving = result?.bookable?.saving ?? "—";

  return (
    <div style={{ background: "linear-gradient(135deg, rgba(92,58,175,0.10) 0%, rgba(21,101,192,0.06) 100%)", border: "1px solid var(--brand-dim)", borderRadius: 12, padding: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 13, color: "var(--ink)", fontWeight: 700 }}>🤖 Live agent simulation</div>
          <div style={{ fontSize: 11, color: "var(--ink-faint)", marginTop: 2 }}>Press play. The agent runs a real-ish travel-rebook flow over the LiteAPI MCP surface. Watch the KPIs accrue at the bottom.</div>
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

      <div ref={scroller} style={{ background: "var(--bg-elev)", border: "1px solid var(--line)", borderRadius: 8, padding: 14, maxHeight: 420, overflowY: "auto", fontSize: 12 }}>
        {steps.length === 0 && (
          <div style={{ padding: "32px 0", textAlign: "center" }}>
            <div style={{ color: "var(--ink-faint)", marginBottom: 14, fontSize: 13 }}>
              Simulate an agentic travel booking flow on top of the LiteAPI MCP surface.
            </div>
            <button onClick={start} disabled={running} style={{
              padding: "10px 24px", borderRadius: 8, fontSize: 14, fontWeight: 700,
              background: running ? "var(--bg-elev-2)" : "var(--brand)",
              color: "#fff", border: "none",
              cursor: running ? "wait" : "pointer",
              boxShadow: "0 4px 16px rgba(92,58,175,0.4)",
            }}>{running ? "running…" : "▶ run agent"}</button>
          </div>
        )}
        {steps.map((s, i) => <StepView key={i} step={s} />)}
        {running && idx < SCRIPT.length && <Thinking />}

        {phase === "decision" && (
          <div style={{ marginTop: 14, padding: 12, background: "rgba(92,58,175,0.10)", border: "1px solid var(--brand-dim)", borderRadius: 6 }}>
            <div className="mono" style={{ fontSize: 10, color: "var(--brand-bright)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>your move</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button onClick={onBook} style={{ padding: "8px 18px", borderRadius: 6, fontSize: 12, fontWeight: 600, background: "var(--accent)", color: "#001a0f", border: "none", cursor: "pointer" }}>✓ Book it</button>
              <button onClick={onSkip} style={{ padding: "8px 18px", borderRadius: 6, fontSize: 12, fontWeight: 600, background: "var(--bg-elev-2)", color: "var(--ink-dim)", border: "1px solid var(--line)", cursor: "pointer" }}>↻ Try different params</button>
            </div>
          </div>
        )}

        {phase === "booked" && steps.length > SCRIPT.length + 2 && (
          <div style={{ marginTop: 14, padding: 12, background: "rgba(7,148,85,0.08)", border: "1px solid var(--accent-dim)", borderRadius: 6 }}>
            <div className="mono" style={{ fontSize: 10, color: "var(--accent)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>what&apos;s next</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <NextChip label="✈️ Find flight LIS → JFK" />
              <NextChip label="🏷️ Watch this hotel for a cheaper rate" />
              <NextChip label="📅 Add to calendar + Google Maps" />
              <NextChip label="🤝 Check loyalty program eligibility" />
            </div>
          </div>
        )}

        {phase === "skipped" && steps.length > SCRIPT.length + 2 && (
          <div style={{ marginTop: 14, padding: 12, background: "rgba(21,101,192,0.08)", border: "1px solid var(--accent-blue)", borderRadius: 6 }}>
            <div className="mono" style={{ fontSize: 10, color: "var(--accent-blue)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>refine further</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <NextChip label="🌊 Sea-view only" />
              <NextChip label="🧘 Spa on premises" />
              <NextChip label="👶 Family-friendly" />
              <NextChip label="🐶 Pet-friendly" />
              <NextChip label="🚆 Walking distance to metro" />
            </div>
          </div>
        )}
      </div>

      {/* ── KPI strip below the conversation ── */}
      {steps.length > 0 && (
        <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
          <Kpi label="Tool calls" value={toolCount.toString()} />
          <Kpi label="Total latency" value={`${totalLatency}ms`} accent={totalLatency > 1500 ? "warn" : "ok"} />
          <Kpi label="Confidence" value={confidence ? `${(confidence * 100).toFixed(0)}%` : "—"} accent={confidence >= 0.85 ? "ok" : undefined} />
          <Kpi label="Saving / night" value={saving} accent={saving !== "—" ? "ok" : undefined} />
          <Kpi label="Outcome" value={phase === "booked" ? "✓ Booked" : phase === "skipped" ? "↻ Refining" : phase === "decision" ? "awaiting" : "running"} accent={phase === "booked" ? "ok" : undefined} />
        </div>
      )}

      {result?.bookable && (
        <div style={{ marginTop: 14, padding: 12, background: "var(--bg-elev)", border: "1px solid var(--line-bright)", borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, color: "var(--ink-faint)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>Surfaced result</div>
            <div style={{ fontSize: 13, color: "var(--ink)" }}>
              <a href={result.bookable.link} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent-blue)", textDecoration: "underline" }}>{result.bookable.name} ↗</a>
              <span style={{ color: "var(--ink-faint)" }}> · {result.bookable.price} · saving {result.bookable.saving}</span>
            </div>
          </div>
          <a href={result.bookable.link} target="_blank" rel="noopener noreferrer" style={{ padding: "8px 14px", borderRadius: 6, background: "var(--brand)", color: "#fff", fontSize: 12, fontWeight: 600 }}>open hotel ↗</a>
        </div>
      )}
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
      <span className="pulse">● ● ●</span> thinking
    </div>
  );
}

function Kpi({ label, value, accent }: { label: string; value: string; accent?: "ok" | "warn" | "bad" }) {
  const color = accent === "ok" ? "var(--accent)" : accent === "warn" ? "var(--warn)" : accent === "bad" ? "var(--bad)" : "var(--ink)";
  return (
    <div style={{ background: "var(--bg-elev)", border: "1px solid var(--line)", borderRadius: 8, padding: "10px 12px" }}>
      <div style={{ fontSize: 9, color: "var(--ink-faint)", letterSpacing: 1.2, textTransform: "uppercase", fontWeight: 600 }}>{label}</div>
      <div className="mono" style={{ fontSize: 16, color, marginTop: 4, fontWeight: 600 }}>{value}</div>
    </div>
  );
}

function NextChip({ label }: { label: string }) {
  return (
    <button style={{
      padding: "6px 12px", fontSize: 11, background: "var(--bg-elev)",
      border: "1px solid var(--line)", borderRadius: 999,
      color: "var(--ink-dim)", cursor: "pointer",
    }} onClick={(e) => { e.preventDefault(); /* sample */ }}>
      {label}
    </button>
  );
}
