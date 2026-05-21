import Paywall from "@/components/paywall";
export default function FlightsSearch() {
  return (
    <div style={{ maxWidth: 1400 }}>
      <h1 style={{ margin: 0, fontSize: 22 }}>Flight Search</h1>
      <p style={{ color: "var(--ink-dim)", fontSize: 13, marginTop: 6 }}>LiteAPI flights module · search volume, conversion, top routes.</p>
      <div style={{ marginTop: 18 }}>
        <Paywall title="Flights search analytics" description="LiteAPI added flights to the MCP server in April 2026 (see openapi-schemas/flights.json). Same KPI shape as hotels: per-route quality, price spread, supplier diversity. Symmetric pipeline." />
      </div>
    </div>
  );
}
