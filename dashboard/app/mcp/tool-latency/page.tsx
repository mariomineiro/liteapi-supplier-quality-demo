import { LineChart, HBar, BarChart, Sparkline } from "@/components/charts";
import InfoTip from "@/components/info-tip";
import { mcpLatencyOverTime, mcpToolSuccess, trend } from "@/lib/sample-data";

export const dynamic = "force-dynamic";

export default function ToolLatency() {
  const lat = mcpLatencyOverTime();
  const success = mcpToolSuccess();
  const overallSuccess = success.reduce((s, t) => s + t.success, 0) / success.length;

  return (
    <div style={{ maxWidth: 1500 }}>
      <Header />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
        <Stat label="MCP tool-call success" value={`${overallSuccess.toFixed(2)}%`} accent="ok" sparkline={trend(501, 30, 98.5, 0.005)}
          source="MCP middleware (fork of liteapi-travel/mcp-server)" formula="Σ(2xx) / Σ(calls) × 100"
          why="Single number for agent reliability. Below 99% = some tool is broken; investigate per-tool below." />
        <Stat label="p50 latency · /search" value="108ms" sparkline={trend(502, 30, 110, 0.02)}
          source="MCP middleware timings" formula="percentile(response_ms, 50) per tool"
          why="Median user-facing latency. Acceptable: <200ms. Above = agent feels sluggish." />
        <Stat label="p95 latency · /hotels/rates" value="412ms" accent="warn" sparkline={trend(503, 30, 380, 0.03)}
          source="MCP middleware timings" formula="percentile(response_ms, 95) per tool"
          why="The tail. Rate lookups are the slowest — fan-out across suppliers. >500ms = agent retries." />
        <Stat label="Tool-call sequence length" value="3.4" sparkline={trend(504, 30, 3.3, 0.02)}
          source="MCP session traces" formula="mean(distinct tools per session)"
          why="How many tools an agent calls per session. Trending up = richer agent workflows. Watch for spikes (retry loops)." />
      </div>

      <LineChart title="MCP endpoint latency · last 30 days (p95)"
        subtitle="four busiest tools · timing middleware in a fork of liteapi-travel/mcp-server"
        labels={lat.labels} series={lat.series} yFmt={(v) => `${v.toFixed(0)}ms`} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
        <Card title="Success rate per MCP tool" subtitle="last 7 days, sorted worst-first">
          <HBar labels={success.map(s => s.tool)} values={success.map(s => s.success)} maxBars={10} valueFmt={(v) => `${v.toFixed(2)}%`} color="var(--accent)" />
        </Card>
        <Card title="p95 latency per MCP tool" subtitle="last 7 days, sorted slowest-first">
          <HBar
            labels={["/hotels/rates","/flights","/bookings","/search","/static","/loyalty","/vouchers","/supplyCustomization"]}
            values={[412, 318, 224, 168, 142, 96, 74, 58]}
            maxBars={8}
            valueFmt={(v) => `${v.toFixed(0)}ms`}
            color="var(--accent-blue)"
          />
        </Card>
      </div>

      <ProofBlock />
      <Disclaimer />
    </div>
  );
}

function ProofBlock() {
  return (
    <div style={{ marginTop: 16, background: "var(--bg-elev)", border: "1px solid var(--accent-dim)", borderRadius: 10, padding: 18 }}>
      <div style={{ fontSize: 13, color: "var(--ink)", fontWeight: 600 }}>
        Why this is a differentiator <span style={{ fontSize: 11, padding: "2px 6px", background: "rgba(77,155,255,0.2)", color: "var(--accent-blue)", borderRadius: 4, marginLeft: 6 }}>OPEN-SOURCE WEDGE</span>
      </div>
      <div style={{ fontSize: 13, color: "var(--ink-dim)", marginTop: 8, lineHeight: 1.65 }}>
        No competitor publishes per-tool MCP latency, because no competitor open-sourced an MCP server.
        Forking <code className="mono" style={{ color: "var(--accent-blue)" }}>liteapi-travel/mcp-server</code> and
        adding a 30-line timing middleware lets you expose these dashboards publicly at, say,
        <code className="mono" style={{ color: "var(--accent-blue)" }}> mcp-status.liteapi.travel</code> —
        instant developer-trust signal + recruiting flywheel.
      </div>
    </div>
  );
}

function Header() {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
        <h1 style={{ margin: 0, fontSize: 22 }}>MCP Tool-call Latency</h1>
        <span style={{ fontSize: 11, padding: "2px 6px", background: "rgba(77,155,255,0.2)", color: "var(--accent-blue)", borderRadius: 4 }}>DIFFERENTIATOR</span>
        <span className="mono" style={{ fontSize: 11, color: "var(--warn)" }}>· sample data · production shape</span>
      </div>
      <div style={{ marginTop: 6, fontSize: 13, color: "var(--ink-dim)", maxWidth: 800 }}>
        p50 / p95 / p99 latency per MCP endpoint (search · rates · book · static · vouchers · loyalty · flights).
        Shape comes from the open-source <code className="mono" style={{ color: "var(--accent-blue)" }}>liteapi-travel/mcp-server</code>;
        timings here are simulated for the demo.
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

function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "var(--bg-elev)", border: "1px solid var(--line)", borderRadius: 10, padding: 16 }}>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 13, color: "var(--ink)", fontWeight: 600 }}>{title}</div>
        {subtitle && <div style={{ fontSize: 11, color: "var(--ink-faint)", marginTop: 2 }}>{subtitle}</div>}
      </div>
      {children}
    </div>
  );
}

function Disclaimer() {
  return (
    <div style={{ marginTop: 16, padding: 14, background: "rgba(255,179,71,0.06)", border: "1px solid rgba(255,179,71,0.3)", borderRadius: 8, fontSize: 12, color: "var(--ink-dim)" }}>
      <strong style={{ color: "var(--warn)" }}>Sample data.</strong> Latency and success-rate numbers are deterministic synthetic data.
      Production version: fork the MCP server, add timing middleware, land timings into BigQuery via Vercel Edge logs (~2 days of work).
    </div>
  );
}
