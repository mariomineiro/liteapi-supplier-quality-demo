import { HBar, BarChart } from "@/components/charts";
import InfoTip from "@/components/info-tip";
import { topDestinationsByGbv, trend } from "@/lib/sample-data";

export const dynamic = "force-dynamic";

export default function Destinations() {
  const dest = topDestinationsByGbv();
  const totalGbv = dest.reduce((s, d) => s + d.gbv, 0);

  return (
    <div style={{ maxWidth: 1500 }}>
      <Header />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
        <Stat label="Destinations tracked" value="1,847" source="GET /data/cities aggregated" formula="count(distinct city_id)" why="Catalog size. Production version covers every city LiteAPI has any inventory in." />
        <Stat label="Total GBV (top 12)" value={`€${(totalGbv / 1e6).toFixed(1)}M`} accent="ok" source="bookings × destinations" formula="Σ booking.total_price grouped by city" why="Where bookings concentrate. Top-12 typically captures >40% of GBV." />
        <Stat label="Top-3 share of GBV" value={`${((dest.slice(0,3).reduce((s,d)=>s+d.gbv,0)/totalGbv)*100).toFixed(1)}%`} accent="warn" source="computed" formula="Σ_top3(GBV) / Σ_all(GBV) × 100" why="Concentration in top markets. Diversifying GBV across more destinations reduces seasonality risk." />
        <Stat label="Median GBV / destination" value="€720k" source="computed" formula="median(GBV per destination)" why="Long-tail marker. Most cities sit far below the top — that's where rank-boost matters most." />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card title="Top destinations by GBV" subtitle="last 24 weeks · sample">
          <HBar labels={dest.map(d => d.destination)} values={dest.map(d => d.gbv)} maxBars={12} valueFmt={(v) => `€${(v / 1e6).toFixed(1)}M`} />
        </Card>
        <Card title="Seasonality · top 4 destinations" subtitle="weekly GBV trend, 24w · sample">
          <BarChart labels={["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]} values={trend(401, 12, 100, 0.18)} color="var(--accent-blue)" yFmt={(v) => `${v.toFixed(0)}`} />
        </Card>
      </div>

      <Disclaimer />
    </div>
  );
}

function Header() {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
        <h1 style={{ margin: 0, fontSize: 22 }}>Destinations</h1>
        <span className="mono" style={{ fontSize: 11, color: "var(--warn)" }}>· sample data · production shape</span>
      </div>
      <div style={{ marginTop: 6, fontSize: 13, color: "var(--ink-dim)", maxWidth: 760 }}>
        Top destinations by GBV, seasonality patterns, and concentration. Identifies where supply acquisition is highest-leverage.
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
      <strong style={{ color: "var(--warn)" }}>Sample data.</strong> Destination GBV values are synthetic. Production view joins bookings × city dimension with seasonal forecasting overlay.
    </div>
  );
}
