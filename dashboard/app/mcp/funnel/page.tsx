import Paywall from "@/components/paywall";
export default function McpFunnel() {
  return (
    <div style={{ maxWidth: 1400 }}>
      <h1 style={{ margin: 0, fontSize: 22 }}>Agent vs Human Funnel <span style={{ fontSize: 11, padding: "2px 6px", background: "rgba(77,155,255,0.2)", color: "var(--accent-blue)", borderRadius: 4, marginLeft: 8 }}>DIFFERENTIATOR</span></h1>
      <p style={{ color: "var(--ink-dim)", fontSize: 13, marginTop: 6, maxWidth: 760 }}>
        Search → look → shop → book conversion, segmented by traffic source: ChatGPT · Claude · Gemini · raw API · human browser.
      </p>
      <div style={{ marginTop: 18 }}>
        <Paywall
          title="Agent vs Human Funnel"
          description="The single most-valuable KPI for an agentic-travel API. Agents convert differently than humans (lower window-shopping, faster decisions, retry-on-error patterns). Knowing this lets a travel-API platform price agent traffic differently and ship API features that lean into agent strengths. Needs a session-source tag on bookings + MCP middleware."
        />
      </div>
    </div>
  );
}
