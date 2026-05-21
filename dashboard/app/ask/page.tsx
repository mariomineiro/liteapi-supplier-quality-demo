import Paywall from "@/components/paywall";
export default function AskLiteAPI() {
  return (
    <div style={{ maxWidth: 1400 }}>
      <h1 style={{ margin: 0, fontSize: 22 }}>Ask LiteAPI</h1>
      <p style={{ color: "var(--ink-dim)", fontSize: 13, marginTop: 6 }}>Natural-language interface over the full data warehouse (bookings, supply, pricing, customers).</p>
      <div style={{ marginTop: 18 }}>
        <Paywall
          title="Ask LiteAPI · NLQ"
          description="LLM-backed NLQ over the BigQuery warehouse. 'Which markets had >50% price spread last week?' returns the answer + the dbt-grade SQL + a saved view in two clicks. The agentic surface I'd build on top of the data org, not as a side-project."
        />
      </div>
    </div>
  );
}
