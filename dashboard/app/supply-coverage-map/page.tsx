import { HBar, BarChart } from "@/components/charts";
import InfoTip from "@/components/info-tip";
import { supplyCoverageByCountry } from "@/lib/sample-data";

export const dynamic = "force-dynamic";

export default function SupplyCoverageMap() {
  const data = supplyCoverageByCountry();
  const total = data.reduce((s, d) => s + d.hotels, 0);
  const top3 = data.slice(0, 3).reduce((s, d) => s + d.hotels, 0);
  const concentration = (top3 / total) * 100;

  return (
    <div style={{ maxWidth: 1500 }}>
      <Header />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
        <Stat label="Countries with supply" value="249" source="GET /data/countries" formula="count(distinct country_code)" why="Reference set. LiteAPI catalogs every country code; not all have inventory." />
        <Stat label="Total properties indexed" value={`${(total / 1000).toFixed(0)}k`} source="GET /data/hotels (aggregated)" formula="Σ hotels per country" why="Catalog size. Production version pulls the full ~3M property count." />
        <Stat label="Top-3 country concentration" value={`${concentration.toFixed(0)}%`} accent={concentration > 60 ? "warn" : "ok"} source="computed" formula="Σ_top3(hotels) / Σ_total(hotels) × 100" why="If 60% of supply lives in 3 countries, expansion ROI lives elsewhere." />
        <Stat label="Avg properties / market" value={`${Math.floor(total / data.length).toLocaleString()}`} source="computed" formula="Σ hotels / count(countries)" why="Inventory density baseline. Below-average markets are growth opportunities or genuinely low-demand." />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 16, marginBottom: 16 }}>
        <Card title="Supply coverage by country" subtitle="properties indexed, top 12 markets · sample">
          <HBar labels={data.map(d => d.country)} values={data.map(d => d.hotels)} maxBars={12} valueFmt={(v) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v.toFixed(0)} />
        </Card>
        <Card title="EMEA snapshot" subtitle="hotels per EMEA market · sample">
          <BarChart labels={data.slice(0, 8).map(d => d.country.slice(0, 3).toUpperCase())} values={data.slice(0, 8).map(d => d.hotels)} color="var(--accent-blue)" yFmt={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v.toFixed(0)} />
        </Card>
      </div>

      <MapPlaceholder />
      <Disclaimer />
    </div>
  );
}

function MapPlaceholder() {
  return (
    <div style={{ background: "var(--bg-elev)", border: "1px solid var(--line)", borderRadius: 10, padding: 16, marginTop: 16, position: "relative", overflow: "hidden" }}>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 13, color: "var(--ink)", fontWeight: 600 }}>Geographic heatmap</div>
        <div style={{ fontSize: 11, color: "var(--ink-faint)", marginTop: 2 }}>choropleth · density × content-completeness × bookings</div>
      </div>
      <div style={{ height: 200, background: "linear-gradient(135deg, var(--bg-elev-2) 25%, transparent 25%, transparent 50%, var(--bg-elev-2) 50%, var(--bg-elev-2) 75%, transparent 75%, transparent)", backgroundSize: "12px 12px", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ink-faint)", fontSize: 12 }}>
        choropleth map (mapbox / d3-geo) — requires production tile credentials
      </div>
    </div>
  );
}

function Header() {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
        <h1 style={{ margin: 0, fontSize: 22 }}>Supply Coverage Map</h1>
        <span className="mono" style={{ fontSize: 11, color: "var(--warn)" }}>· sample data · production shape</span>
      </div>
      <div style={{ marginTop: 6, fontSize: 13, color: "var(--ink-dim)", maxWidth: 760 }}>
        Inventory density across markets. Where catalogue depth thins out is where supply acquisition has the biggest ROI.
      </div>
    </div>
  );
}

function Stat({ label, value, accent, source, formula, why }: { label: string; value: string; accent?: "ok" | "warn"; source?: string; formula?: string; why?: string }) {
  const color = accent === "ok" ? "var(--accent)" : accent === "warn" ? "var(--warn)" : "var(--ink)";
  return (
    <div style={{ background: "var(--bg-elev)", border: "1px solid var(--line)", borderRadius: 10, padding: "14px 18px" }}>
      <div style={{ fontSize: 10, letterSpacing: 1.2, textTransform: "uppercase", color: "var(--ink-faint)", display: "flex", alignItems: "center" }}>
        {label}
        {(source || formula || why) && <InfoTip source={source} formula={formula} why={why} size={11} />}
      </div>
      <div className="mono" style={{ fontSize: 22, marginTop: 6, color }}>{value}</div>
    </div>
  );
}

function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "var(--bg-elev)", border: "1px solid var(--line)", borderRadius: 10, padding: 16 }}>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 13, color: "var(--ink)", fontWeight: 600 }}>{title}</div>
        {subtitle && <div style={{ fontSize: 11, color: "var(--ink-faint)", marginTop: 2 }}>{subtitle}</div>}
      </div>
      {children}
    </div>
  );
}

function Disclaimer() {
  return (
    <div style={{ marginTop: 16, padding: 14, background: "rgba(255,179,71,0.06)", border: "1px solid rgba(255,179,71,0.3)", borderRadius: 8, fontSize: 12, color: "var(--ink-dim)" }}>
      <strong style={{ color: "var(--warn)" }}>Sample data.</strong> Country-level counts are synthetic. Production version aggregates the live /data/hotels endpoint across all 249 countries with a nightly job.
    </div>
  );
}
