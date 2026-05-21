import { aiRecommendations } from "@/lib/sample-data";
import KpiCard from "@/components/kpi-card";

export const dynamic = "force-dynamic";

export default function AIRecs() {
  const recs = aiRecommendations();
  const byP = (p: string) => recs.filter(r => r.priority === p).length;

  return (
    <div style={{ maxWidth: 1500 }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 22 }}>AI Recommendations <span className="mono" style={{ fontSize: 11, color: "var(--brand-bright)", marginLeft: 12 }}>· nightly agent output</span></h1>
        <div style={{ marginTop: 6, fontSize: 13, color: "var(--ink-dim)", maxWidth: 800 }}>
          An LLM agent reads the joined supply × pricing × bookings × MCP tables every night and ships a ranked next-actions list. The same agentic loop you already open-sourced — turned inward on your own data.
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
        <KpiCard label="P1 actions" value={byP("P1").toString()} accent="warn"
          source="agent run · nightly" formula="count(recommendation where priority = P1)"
          why="Critical: act this week. Compound impact if delayed." />
        <KpiCard label="P2 actions" value={byP("P2").toString()}
          source="agent run · nightly" formula="count(recommendation where priority = P2)"
          why="This sprint. Material upside but not bleeding." />
        <KpiCard label="P3 actions" value={byP("P3").toString()}
          source="agent run · nightly" formula="count(recommendation where priority = P3)"
          why="Backlog. Nice-to-have, surfaced for awareness." />
        <KpiCard label="Avg confidence" value={`${(recs.reduce((s, r) => s + r.confidence, 0) / recs.length * 100).toFixed(0)}%`} accent="live"
          source="agent reasoning trace" formula="mean(per-recommendation confidence score)"
          why="How sure the agent is. Below 70% = treat as a flag, not an action." />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {recs.map(r => (
          <div key={r.id} style={{ background: "var(--bg-elev)", border: "1px solid var(--line)", borderLeft: `3px solid ${r.priority === "P1" ? "var(--warn)" : r.priority === "P2" ? "var(--accent-blue)" : "var(--ink-dim)"}`, borderRadius: 10, padding: 16 }}>
            <div style={{ display: "flex", alignItems: "start", gap: 12, marginBottom: 8 }}>
              <span style={{ padding: "3px 10px", borderRadius: 4, background: r.priority === "P1" ? "var(--warn)" : r.priority === "P2" ? "var(--accent-blue)" : "var(--ink-dim)", color: "#0a0a14", fontSize: 11, fontWeight: 700 }} className="mono">{r.priority}</span>
              <span style={{ padding: "3px 10px", borderRadius: 4, background: "var(--bg-elev-2)", border: "1px solid var(--line)", color: "var(--ink-dim)", fontSize: 11 }}>{r.category}</span>
              <span style={{ fontSize: 11, color: "var(--ink-faint)", marginLeft: "auto" }} className="mono">confidence {(r.confidence * 100).toFixed(0)}%</span>
            </div>
            <div style={{ fontSize: 15, color: "var(--ink)", fontWeight: 600, marginBottom: 6 }}>{r.title}</div>
            <div style={{ fontSize: 13, color: "var(--ink-dim)", marginBottom: 10, lineHeight: 1.5 }}>{r.detail}</div>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 12 }}>
              <div><span style={{ color: "var(--ink-faint)" }}>Action: </span><span style={{ color: "var(--accent-blue)" }}>{r.action}</span></div>
              <div><span style={{ color: "var(--ink-faint)" }}>Impact: </span><span style={{ color: "var(--accent)" }}>{r.impact}</span></div>
            </div>
          </div>
        ))}
      </div>

      <Disclaimer />
    </div>
  );
}
function Disclaimer() {
  return <div style={{ marginTop: 16, padding: 14, background: "rgba(255,179,71,0.06)", border: "1px solid rgba(255,179,71,0.3)", borderRadius: 8, fontSize: 12, color: "var(--ink-dim)" }}><strong style={{ color: "var(--warn)" }}>Sample recommendations.</strong> In production: nightly LLM run over BigQuery marts. Ships to Slack + this dashboard with confidence + impact estimate per row.</div>;
}
