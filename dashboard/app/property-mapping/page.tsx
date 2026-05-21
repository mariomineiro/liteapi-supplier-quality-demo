import Paywall from "@/components/paywall";
export default function PropertyMapping() {
  return (
    <div style={{ maxWidth: 1400 }}>
      <h1 style={{ margin: 0, fontSize: 22 }}>Property Mapping</h1>
      <p style={{ color: "var(--ink-dim)", fontSize: 13, marginTop: 6 }}>Cross-supplier hotel-ID reconciliation. <code className="mono">rohId</code> matching, dupe detection, supplier coverage gaps.</p>
      <div style={{ marginTop: 18 }}>
        <Paywall title="Property mapping" description="Reconcile LiteAPI hotelId, rohId, and competitor IDs (HotelBeds, Expedia EAN, etc.). Detect duplicates, coverage gaps, supplier-overlap percentage per market." />
      </div>
    </div>
  );
}
