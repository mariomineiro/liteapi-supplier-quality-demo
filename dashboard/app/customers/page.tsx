import { HBar, HeatmapCohort, Sparkline } from "@/components/charts";
import InfoTip from "@/components/info-tip";
import { topCustomersByGbv, customerCohortRetention, trend } from "@/lib/sample-data";

export const dynamic = "force-dynamic";

export default function Customers() {
  const top = topCustomersByGbv();
  const cohort = customerCohortRetention();

  const totalGbv = top.reduce((s, c) => s + c.gbv, 0);
  const top5Gbv = top.slice(0, 5).reduce((s, c) => s + c.gbv, 0);
  const concentration = (top5Gbv / totalGbv) * 100;
  // HHI on share-of-GBV percentages, capped 10000
  const hhi = top.reduce((s, c) => { const sh = (c.gbv / totalGbv) * 100; return s + sh * sh; }, 0);

  return (
    <div style={{ maxWidth: 1500 }}>
      <Header />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
        <Stat label="Monthly active partners" value="143" sparkline={trend(201, 24, 130, 0.012)}
          source="partner billing × bookings" formula="distinct partner_id with ≥1 booking in month"
          why="True usage signal. Vanity 'total signed' < MAP for revenue forecasting." />
        <Stat label="Top-5 concentration" value={`${concentration.toFixed(1)}%`} accent={concentration > 50 ? "warn" : "ok"}
          source="bookings × partners" formula="Σ_top5(GBV) / Σ_total(GBV) × 100"
          why="Concentration risk. >50% = one customer leaving is an existential event. Investors ask this in week 1." />
        <Stat label="HHI" value={hhi.toFixed(0)} sparkline={trend(203, 24, 1200, 0.005)}
          source="bookings × partners" formula="Σ(partner_share_pct²)"
          why="Herfindahl-Hirschman Index. >1800 = concentrated. <1000 = fragmented. Single-number alternative to top-5." />
        <Stat label="Logo churn (YoY)" value="7.4%" accent="ok" sparkline={trend(204, 24, 8, 0.05)}
          source="partner activity" formula="lost_partners / partners_y-1 × 100"
          why="Counts disappearance, not revenue loss. Pair with NRR for the full retention story." />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <Card title="Top API customers by GBV (12-month)" subtitle="archetype labels — no real customer names in sample">
          <HBar labels={top.slice(0, 10).map(c => c.name)} values={top.slice(0, 10).map(c => c.gbv)} maxBars={10} valueFmt={(v) => `€${(v / 1e6).toFixed(1)}M`} />
        </Card>
        <HeatmapCohort
          title="Cohort retention by signup month"
          subtitle="% of partners still active at M+N"
          rowLabels={cohort.rowLabels}
          colLabels={cohort.colLabels}
          matrix={cohort.matrix}
        />
      </div>

      <Disclaimer />
    </div>
  );
}

function Header() {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
        <h1 style={{ margin: 0, fontSize: 22 }}>Customers</h1>
        <span className="mono" style={{ fontSize: 11, color: "var(--warn)" }}>· sample data · production shape</span>
      </div>
      <div style={{ marginTop: 6, fontSize: 13, color: "var(--ink-dim)", maxWidth: 760 }}>
        API customer health: concentration risk, top-N GBV, churn, and cohort retention. The metrics any
        board pack for a B2B API platform opens with.
      </div>
    </div>
  );
}

function Stat({ label, value, accent, sparkline, source, formula, why }: { label: string; value: string; accent?: "ok" | "warn" | "bad"; sparkline?: number[]; source?: string; formula?: string; why?: string }) {
  const color = accent === "ok" ? "var(--accent)" : accent === "warn" ? "var(--warn)" : accent === "bad" ? "var(--bad)" : "var(--ink)";
  return (
    <div style={{ background: "var(--bg-elev)", border: "1px solid var(--line)", borderRadius: 10, padding: "14px 18px" }}>
      <div style={{ fontSize: 10, letterSpacing: 1.2, textTransform: "uppercase", color: "var(--ink-faint)", display: "flex", alignItems: "center" }}>
        {label}
        {(source || formula || why) && <InfoTip source={source} formula={formula} why={why} size={11} />}
      </div>
      <div className="mono" style={{ fontSize: 22, marginTop: 6, color }}>{value}</div>
      {sparkline && <div style={{ marginTop: 6 }}><Sparkline values={sparkline} color={color} /></div>}
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
      <strong style={{ color: "var(--warn)" }}>Sample data.</strong> API-customer names are generic archetypes — no real customer data was used.
      Page structure mirrors a production customer-analytics view; numbers are deterministic synthetic data.
    </div>
  );
}
