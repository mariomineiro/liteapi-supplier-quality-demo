import Paywall from "@/components/paywall";

export default function Customers() {
  return (
    <div style={{ maxWidth: 1400 }}>
      <h1 style={{ margin: 0, fontSize: 22 }}>Customers</h1>
      <p style={{ color: "var(--ink-dim)", fontSize: 13, marginTop: 6 }}>
        API customers (Hopper, Expedia, Priceline, Google, Uber, ...) · concentration · LTV cohorts.
      </p>
      <div style={{ marginTop: 18 }}>
        <Paywall
          title="Customer analytics"
          description="Maps every API customer to their GBV, take-rate, monthly cohort, churn risk, and integration health. Pulls from /bookings + /partners (prod-only). Concentration risk (top-N as % of revenue) is the headline KPI for any API business."
        />
      </div>
    </div>
  );
}
