import Paywall from "@/components/paywall";
export default function CustomerAnalysis() {
  return (
    <div style={{ maxWidth: 1400 }}>
      <h1 style={{ margin: 0, fontSize: 22 }}>Customer Analysis</h1>
      <div style={{ marginTop: 18 }}>
        <Paywall title="Customer Analysis" description="Cohort retention, LTV, churn risk per API customer. Integration health score (error rate, latency p95, time-since-last-call). Early-warning system for at-risk customers." />
      </div>
    </div>
  );
}
