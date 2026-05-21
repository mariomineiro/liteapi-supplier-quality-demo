import Paywall from "@/components/paywall";

export default function Bookings() {
  return (
    <div style={{ maxWidth: 1400 }}>
      <h1 style={{ margin: 0, fontSize: 22 }}>Bookings</h1>
      <p style={{ color: "var(--ink-dim)", fontSize: 13, marginTop: 6 }}>
        Booking funnel · conversion · refund / dispute rates · LOS distribution · booking lead time.
      </p>
      <div style={{ marginTop: 18 }}>
        <Paywall
          title="Bookings dashboard"
          description="Requires production access to /bookings/list with real customer volume. The sandbox returns a single Steve Doe test booking. With prod data this surfaces GBV, confirmation rate, cancellation rate, refund rate, average LOS, booking lead time, and per-customer concentration."
        />
      </div>
    </div>
  );
}
