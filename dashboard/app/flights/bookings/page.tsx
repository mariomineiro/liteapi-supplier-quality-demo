import Paywall from "@/components/paywall";
export default function FlightsBookings() {
  return (
    <div style={{ maxWidth: 1400 }}>
      <h1 style={{ margin: 0, fontSize: 22 }}>Flight Bookings</h1>
      <div style={{ marginTop: 18 }}>
        <Paywall title="Flights booking analytics" description="Confirmation rate, cancellation rate, ancillary attach rate (seats, bags). Same dashboard logic as hotel bookings; joins flights + hotels for true trip-level LTV." />
      </div>
    </div>
  );
}
