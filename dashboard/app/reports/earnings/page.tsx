import Paywall from "@/components/paywall";
export default function EarningsReport() {
  return (
    <div style={{ maxWidth: 1400 }}>
      <h1 style={{ margin: 0, fontSize: 22 }}>Earnings Report</h1>
      <div style={{ marginTop: 18 }}>
        <Paywall title="Earnings Report" description="Board-pack earnings: GBV / net rev / take-rate by quarter, with cohort analysis and forecasting. Drill-down by API customer, market, supplier." />
      </div>
    </div>
  );
}
