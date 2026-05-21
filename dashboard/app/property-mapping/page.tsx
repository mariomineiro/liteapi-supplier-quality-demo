import { HBar } from "@/components/charts";
import KpiCard from "@/components/kpi-card";
import { propertyMappingStats } from "@/lib/sample-data";

export const dynamic = "force-dynamic";

export default function PropertyMapping() {
  const s = propertyMappingStats();
  const matchedPct = (s.matched / s.total) * 100;
  const dupePct = (s.duplicates / s.total) * 100;

  return (
    <div style={{ maxWidth: 1500 }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 22 }}>Property Mapping <span className="mono" style={{ fontSize: 11, color: "var(--warn)", marginLeft: 12 }}>· MOCK · production shape</span></h1>
        <div style={{ marginTop: 6, fontSize: 13, color: "var(--ink-dim)", maxWidth: 800 }}>
          Cross-source hotel-ID reconciliation. <code className="mono" style={{ color: "var(--accent-blue)" }}>rohId</code> matches LiteAPI properties to competitor inventory across 5+ suppliers; gaps surface as supply-acquisition or pricing opportunities.
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
        <KpiCard label="Properties in catalog" value={`${(s.total / 1e6).toFixed(2)}M`} accent="live"
          source="GET /data/hotels (full catalog)" formula="count(distinct hotel_id)"
          why="Total inventory under management. Production version pulls the full ~3.2M catalog." kpi="Cross-Source ID Coverage %" />
        <KpiCard label="Mapped to competitors" value={`${matchedPct.toFixed(1)}%`} accent="live"
          source="rohId matching" formula="matched / total × 100"
          why="% of properties with at least one cross-source match. Higher = better pricing intelligence." kpi="Cross-Source ID Coverage %" />
        <KpiCard label="Duplicates detected" value={s.duplicates.toLocaleString()} accent={dupePct > 1 ? "warn" : "default"}
          source="fuzzy match · geo + name" formula="count(suspected duplicates)"
          why="Same physical hotel appearing twice. Each dupe costs supplier-trust signals." />
        <KpiCard label="Unmapped" value={s.unmapped.toLocaleString()} accent="warn"
          source="rohId · LiteAPI canonical" formula="count(no cross-source match found)"
          why="Properties only LiteAPI sees. Could be exclusive supply (good) or untapped competitive intelligence." />
      </div>

      <div style={{ background: "var(--bg-elev)", border: "1px solid var(--line)", borderRadius: 10, padding: 16, marginBottom: 16 }}>
        <div style={{ fontSize: 13, color: "var(--ink)", fontWeight: 600, marginBottom: 12 }}>Coverage by source · property counts</div>
        <HBar labels={s.sources.map(x => x.source)} values={s.sources.map(x => x.count)} maxBars={5} valueFmt={(v) => `${(v / 1e6).toFixed(2)}M`} color="var(--accent-blue)" />
      </div>

      <Disclaimer />
    </div>
  );
}
function Disclaimer() {
  return <div style={{ marginTop: 16, padding: 14, background: "rgba(255,179,71,0.06)", border: "1px solid rgba(255,179,71,0.3)", borderRadius: 8, fontSize: 12, color: "var(--ink-dim)" }}><strong style={{ color: "var(--warn)" }}>Sample data.</strong> Production version runs a nightly fuzzy-match job across LiteAPI + HotelBeds + EAN + WebBeds + TBO catalogues, with rohId as the bridge key.</div>;
}
