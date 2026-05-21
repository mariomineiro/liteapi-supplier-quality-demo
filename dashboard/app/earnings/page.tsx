import Paywall from "@/components/paywall";
export default function Earnings() {
  return (
    <div style={{ maxWidth: 1400 }}>
      <h1 style={{ margin: 0, fontSize: 22 }}>Earnings</h1>
      <p style={{ color: "var(--ink-dim)", fontSize: 13, marginTop: 6 }}>GBV · net revenue · take-rate trend · payout cadence.</p>
      <div style={{ marginTop: 18 }}>
        <Paywall title="Earnings" description="Headline financial KPIs: GBV, net revenue, effective take-rate, payout schedule, currency exposure. Joins bookings × commission × FX. The number Finance signs off on every month." />
      </div>
    </div>
  );
}
