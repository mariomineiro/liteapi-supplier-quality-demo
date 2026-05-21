import Paywall from "@/components/paywall";
export default function ToolLatency() {
  return (
    <div style={{ maxWidth: 1400 }}>
      <h1 style={{ margin: 0, fontSize: 22 }}>MCP Tool-call Latency <span style={{ fontSize: 11, padding: "2px 6px", background: "rgba(77,155,255,0.2)", color: "var(--accent-blue)", borderRadius: 4, marginLeft: 8 }}>DIFFERENTIATOR</span></h1>
      <p style={{ color: "var(--ink-dim)", fontSize: 13, marginTop: 6, maxWidth: 760 }}>
        p50 / p95 / p99 latency per MCP endpoint (search · rates · book · static · vouchers · loyalty · flights). No competitor has this telemetry because no competitor open-sourced an MCP server.
      </p>
      <div style={{ marginTop: 18 }}>
        <Paywall
          title="MCP Tool-call Latency"
          description="Fork liteapi-travel/mcp-server, add a 30-line timing middleware. Land timings into BigQuery via Vercel Edge logs. Expose as a Grafana board for the platform team and as a public-facing developer dashboard at mcp-status.liteapi.travel. Two weeks of work, recruiting-flywheel asset for years."
        />
      </div>
    </div>
  );
}
