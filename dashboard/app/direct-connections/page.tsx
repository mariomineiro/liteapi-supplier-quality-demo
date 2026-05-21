import Paywall from "@/components/paywall";
export default function DirectConnections() {
  return (
    <div style={{ maxWidth: 1400 }}>
      <h1 style={{ margin: 0, fontSize: 22 }}>Direct Connections</h1>
      <p style={{ color: "var(--ink-dim)", fontSize: 13, marginTop: 6 }}>Hotel-direct supplier integrations (not via aggregators).</p>
      <div style={{ marginTop: 18 }}>
        <Paywall title="Direct connections" description="Surface which hotels are supplied direct vs via aggregator. Direct = better margin + faster updates. KPI: % of inventory direct, by market." />
      </div>
    </div>
  );
}
