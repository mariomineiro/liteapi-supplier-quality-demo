import Paywall from "@/components/paywall";
export default function AIRecs() {
  return (
    <div style={{ maxWidth: 1400 }}>
      <h1 style={{ margin: 0, fontSize: 22 }}>AI Recommendations</h1>
      <p style={{ color: "var(--ink-dim)", fontSize: 13, marginTop: 6 }}>Auto-generated next-actions: suppliers to boost, hotels to enrich, pricing leaks to chase.</p>
      <div style={{ marginTop: 18 }}>
        <Paywall title="AI Recommendations" description="LLM agent reads the joined supplier-quality × pricing × bookings tables nightly and ships a ranked next-actions list to Slack: which suppliers to push up the ranking, which hotels need content enrichment, which markets have a pricing leak. The agentic loop you already open-sourced — just turned inward." />
      </div>
    </div>
  );
}
