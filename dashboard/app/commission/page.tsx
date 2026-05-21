import Paywall from "@/components/paywall";
export default function Commission() {
  return (
    <div style={{ maxWidth: 1400 }}>
      <h1 style={{ margin: 0, fontSize: 22 }}>Commission</h1>
      <p style={{ color: "var(--ink-dim)", fontSize: 13, marginTop: 6 }}>Effective commission by supplier, by market, by customer.</p>
      <div style={{ marginTop: 18 }}>
        <Paywall title="Commission analytics" description="Per-rate commission tracking joined to bookings. Surfaces leakage by supplier, board type, customer integration. Needs prod /bookings + /rates history." />
      </div>
    </div>
  );
}
