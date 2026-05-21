import Paywall from "@/components/paywall";
export default function SupplyCoverageMap() {
  return (
    <div style={{ maxWidth: 1400 }}>
      <h1 style={{ margin: 0, fontSize: 22 }}>Supply Coverage Map</h1>
      <p style={{ color: "var(--ink-dim)", fontSize: 13, marginTop: 6 }}>Geo heatmap of inventory density × pricing health.</p>
      <div style={{ marginTop: 18 }}>
        <Paywall title="Supply coverage map" description="Choropleth across 249 countries from /data/countries × /data/hotels, weighted by booking volume and content-completeness score. Surfaces white-space markets for supply acquisition." />
      </div>
    </div>
  );
}
