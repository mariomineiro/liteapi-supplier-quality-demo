import CitySwitcher from "@/components/city-switcher";
import QualityTable from "./table";
import { loadQuality } from "@/lib/data";
import InfoTip from "@/components/info-tip";

export const dynamic = "force-dynamic";

type SearchProps = { searchParams: Promise<{ city?: string }> };

export default async function SupplyQuality({ searchParams }: SearchProps) {
  const { city = "pt-lisbon" } = await searchParams;
  const snap = await loadQuality(city);
  const top = snap.rows[0];
  const bottom = snap.rows[snap.rows.length - 1];
  const avgContent = (snap.rows.reduce((s, r) => s + r.content_completeness, 0) / snap.rows.length).toFixed(1);
  const avgFacilities = (snap.rows.reduce((s, r) => s + r.facility_count, 0) / snap.rows.length).toFixed(0);

  return (
    <div style={{ maxWidth: 1500 }}>
      <h1 style={{ margin: 0, fontSize: 22 }}>
        Supply Quality
        <span style={{ fontSize: 12, color: "var(--ink-faint)", marginLeft: 12 }} className="mono">
          · live · {snap.meta.city}, {snap.meta.country} · n={snap.meta.sample_size}
        </span>
      </h1>
      <p style={{ color: "var(--ink-dim)", fontSize: 13, marginTop: 6, maxWidth: 800 }}>
        Per-hotel content scorecard computed live from <code className="mono" style={{ color: "var(--accent-blue)" }}>GET /data/hotels</code>.
        Composite = 60% content completeness + 20% review depth + 20% facility richness.
      </p>

      <CitySwitcher basePath="/supply-quality" />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 22 }}>
        <Stat
          label="hotels in sample"
          value={snap.rows.length.toString()}
          source="GET /data/hotels?countryCode=&cityName="
          formula="count(rows)"
          why="Sample size baseline for the scorecard. Larger samples make outliers more meaningful."
        />
        <Stat
          label="avg content %"
          value={`${avgContent}%`}
          accent
          source="GET /data/hotels"
          formula="mean(content_completeness)"
          why="Reflects how well-enriched the catalog is for this market. <80% means Content team should prioritise this market."
        />
        <Stat
          label="avg facilities / hotel"
          value={avgFacilities}
          source="GET /data/hotels.facilityIds"
          formula="mean(len(facilityIds))"
          why="More facilities = more filter dimensions for downstream search UIs. Low values mean limited filterability."
        />
        <Stat
          label="best vs worst gap"
          value={`${(top.overall_quality_score - bottom.overall_quality_score).toFixed(1)} pts`}
          source="computed"
          formula="max(score) − min(score)"
          why="A wide gap means the catalog has uneven quality. Worth deduping or deprioritising the bottom tail."
        />
      </div>

      <QualityTable rows={snap.rows} />
    </div>
  );
}

function Stat({ label, value, accent, source, formula, why }: {
  label: string; value: string; accent?: boolean;
  source?: string; formula?: string; why?: string;
}) {
  return (
    <div style={{ background: "var(--bg-elev)", border: "1px solid var(--line)", borderRadius: 10, padding: "14px 18px" }}>
      <div style={{ fontSize: 10, letterSpacing: 1.2, textTransform: "uppercase", color: "var(--ink-faint)", display: "flex", alignItems: "center" }}>
        {label}
        {(source || formula || why) && <InfoTip source={source} formula={formula} why={why} size={11} />}
      </div>
      <div className="mono" style={{ fontSize: 22, marginTop: 6, color: accent ? "var(--accent)" : "var(--ink)" }}>{value}</div>
    </div>
  );
}
