import { Funnel, BarChart, Sparkline } from "@/components/charts";
import InfoTip from "@/components/info-tip";
import { agentVsHumanFunnel, trend } from "@/lib/sample-data";

export const dynamic = "force-dynamic";

export default function McpFunnel() {
  const f = agentVsHumanFunnel();
  const humanConvAll = (f.human[f.human.length - 1] / f.human[0]) * 100;
  const agentConvAll = (f.agent[f.agent.length - 1] / f.agent[0]) * 100;
  const lift = agentConvAll / humanConvAll;

  return (
    <div style={{ maxWidth: 1500 }}>
      <Header />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
        <Stat label="Agent sessions" value={(f.agent[0] / 1000).toFixed(0) + "k"} accent="ok" sparkline={trend(601, 30, 6000, 0.04)}
          source="MCP middleware (session_id × source)" formula="distinct mcp_session_id where source in (agent_*)"
          why="How much agentic traffic the platform sees. Growing fast = agentic-travel thesis confirmed." />
        <Stat label="Human sessions" value={(f.human[0] / 1000).toFixed(0) + "k"} sparkline={trend(602, 30, 27000, 0.005)}
          source="API logs × session_id" formula="distinct session_id where source = human"
          why="Baseline traffic. Growing slower than agent = mix shifting toward AI." />
        <Stat label="Agent end-to-end conv." value={`${agentConvAll.toFixed(2)}%`} accent="ok" sparkline={trend(603, 30, 8, 0.02)}
          source="MCP × bookings join" formula="agent_bookings / agent_sessions × 100"
          why="The moat metric. Agents convert higher than humans because they don't window-shop." />
        <Stat label="Agent lift vs human" value={`${lift.toFixed(2)}×`} accent="ok"
          source="computed" formula="agent_conv / human_conv"
          why="The single best signal to share publicly. 2× lift = pricing power; 3×+ = a moat." />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <Funnel title="Human funnel · search → fulfilled" subtitle="step-to-step conversion in %" steps={f.labels.map((l, i) => ({ label: l, value: f.human[i] }))} />
        <Funnel title="Agent funnel · search → fulfilled" subtitle="same steps, different shape — agents shop less, decide faster" steps={f.labels.map((l, i) => ({ label: l, value: f.agent[i] }))} />
      </div>

      <BarChart title="Step-by-step conversion · agent vs human"
        subtitle="% from previous step · sample data"
        labels={f.labels.slice(1)}
        values={f.labels.slice(1).map((_, i) => (f.agent[i + 1] / f.agent[i]) * 100)}
        color="var(--accent)" yFmt={(v) => `${v.toFixed(1)}%`} />

      <SourceBreakdown />
      <ProofBlock />
      <Disclaimer />
    </div>
  );
}

function SourceBreakdown() {
  const sources = [
    { label: "Anthropic Claude", value: 38, color: "var(--accent)" },
    { label: "OpenAI ChatGPT", value: 32, color: "var(--accent-blue)" },
    { label: "Google Gemini", value: 14, color: "var(--warn)" },
    { label: "Custom MCP integrations", value: 11, color: "var(--bad)" },
    { label: "Other / local LLMs", value: 5, color: "var(--ink-dim)" },
  ];
  return (
    <div style={{ background: "var(--bg-elev)", border: "1px solid var(--line)", borderRadius: 10, padding: 16, marginTop: 16 }}>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 13, color: "var(--ink)", fontWeight: 600 }}>Agent traffic by source · last 30 days</div>
        <div style={{ fontSize: 11, color: "var(--ink-faint)", marginTop: 2 }}>%-share of MCP sessions tagged by agent-id</div>
      </div>
      {sources.map((s, i) => (
        <div key={i} style={{ marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
            <span style={{ color: "var(--ink-dim)" }}>{s.label}</span>
            <span className="mono" style={{ color: s.color }}>{s.value}%</span>
          </div>
          <div style={{ height: 8, background: "var(--bg-elev-2)", borderRadius: 2, overflow: "hidden" }}>
            <div style={{ width: `${s.value}%`, height: "100%", background: s.color, opacity: 0.85 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function ProofBlock() {
  return (
    <div style={{ marginTop: 16, background: "var(--bg-elev)", border: "1px solid var(--accent-dim)", borderRadius: 10, padding: 18 }}>
      <div style={{ fontSize: 13, color: "var(--ink)", fontWeight: 600 }}>
        Why this is the moat metric
        <span style={{ fontSize: 11, padding: "2px 6px", background: "rgba(77,155,255,0.2)", color: "var(--accent-blue)", borderRadius: 4, marginLeft: 6 }}>DIFFERENTIATOR</span>
      </div>
      <div style={{ fontSize: 13, color: "var(--ink-dim)", marginTop: 8, lineHeight: 1.65 }}>
        Agents convert differently from humans: lower window-shopping, faster decisions, retry-on-error patterns.
        Knowing this lets the platform price agent traffic differently and ship API features (deterministic responses, structured errors)
        that lean into agent strengths. The chart above is the single highest-leverage thing a Head of Data here could ship in year one.
      </div>
    </div>
  );
}

function Header() {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
        <h1 style={{ margin: 0, fontSize: 22 }}>Agent vs Human Funnel</h1>
        <span style={{ fontSize: 11, padding: "2px 6px", background: "rgba(77,155,255,0.2)", color: "var(--accent-blue)", borderRadius: 4 }}>DIFFERENTIATOR</span>
        <span className="mono" style={{ fontSize: 11, color: "var(--warn)" }}>· sample data · production shape</span>
      </div>
      <div style={{ marginTop: 6, fontSize: 13, color: "var(--ink-dim)", maxWidth: 800 }}>
        Side-by-side comparison of how agents vs humans move through the booking funnel. The shape, not the
        numbers, is what matters: agents shop less, convert faster, and need different rate-shopping affordances.
      </div>
    </div>
  );
}

function Stat({ label, value, accent, sparkline, source, formula, why }: { label: string; value: string; accent?: "ok" | "warn" | "bad"; sparkline?: number[]; source?: string; formula?: string; why?: string }) {
  const color = accent === "ok" ? "var(--accent)" : accent === "warn" ? "var(--warn)" : accent === "bad" ? "var(--bad)" : "var(--ink)";
  return (
    <div style={{ background: "var(--bg-elev)", border: "1px solid var(--line)", borderRadius: 10, padding: "14px 18px" }}>
      <div style={{ fontSize: 10, letterSpacing: 1.2, textTransform: "uppercase", color: "var(--ink-faint)", display: "flex", alignItems: "center" }}>
        {label}
        {(source || formula || why) && <InfoTip source={source} formula={formula} why={why} size={11} />}
      </div>
      <div className="mono" style={{ fontSize: 22, marginTop: 6, color }}>{value}</div>
      {sparkline && <div style={{ marginTop: 6 }}><Sparkline values={sparkline} color={color} /></div>}
    </div>
  );
}

function Disclaimer() {
  return (
    <div style={{ marginTop: 16, padding: 14, background: "rgba(255,179,71,0.06)", border: "1px solid rgba(255,179,71,0.3)", borderRadius: 8, fontSize: 12, color: "var(--ink-dim)" }}>
      <strong style={{ color: "var(--warn)" }}>Sample data.</strong> Agent/human conversion numbers are synthetic.
      Production version needs a session-source tag at booking time + MCP middleware to attribute sessions to agent vs human.
    </div>
  );
}
