import Paywall from "@/components/paywall";
export default function Destinations() {
  return (
    <div style={{ maxWidth: 1400 }}>
      <h1 style={{ margin: 0, fontSize: 22 }}>Destinations</h1>
      <div style={{ marginTop: 18 }}>
        <Paywall title="Destinations analytics" description="Top-N destinations by search volume, booking volume, GBV. Seasonality forecasting. Surface white-space markets where supply is thin vs demand is high." />
      </div>
    </div>
  );
}
