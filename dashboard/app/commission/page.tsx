import { LineChart, HBar } from "@/components/charts";
import InfoTip from "@/components/info-tip";
import { commissionByPartner, commissionTrend, trend } from "@/lib/sample-data";
import KpiCard from "@/components/kpi-card";

export const dynamic = "force-dynamic";

export default function Commission() {
  const partners = commissionByPartner();
  const tr = commissionTrend();
  const totalCommission = partners.reduce((s, p) => s + p.commission, 0);
  const avgTakeRate = partners.reduce((s, p) => s + p.takeRate, 0) / partners.length;
  const top3Share = (partners.slice(0, 3).reduce((s, p) => s + p.commission, 0) / totalCommission) * 100;

  return (
    <div style={{ maxWidth: 1500 }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 22 }}>Commission <span className="mono" style={{ fontSize: 11, color: "var(--warn)", marginLeft: 12 }}>· MOCK · production shape</span></h1>
        <div style={{ marginTop: 6, fontSize: 13, color: "var(--ink-dim)", maxWidth: 760 }}>
          Effective commission by partner, by market, over time. Catches margin leakage and per-partner take-rate drift.
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
        <KpiCard label="Commission · 12-month" value={`€${(totalCommission / 1e6).toFixed(1)}M`} accent="live"
          source="bookings × take_rate" formula="Σ(booking_total × take_rate) per partner, last 12m"
          why="Aggregate margin signal across all partners. Drift down = pricing pressure." kpi="Take-Rate per Booking" />
        <KpiCard label="Avg take-rate %" value={`${avgTakeRate.toFixed(1)}%`}
          source="bookings × commissions" formula="Σ commission / Σ GBV × 100"
          why="System-wide take-rate. Below 8% = renegotiate supplier terms." kpi="Effective Take-Rate (system-wide)" />
        <KpiCard label="Top-3 commission share" value={`${top3Share.toFixed(0)}%`} accent={top3Share > 50 ? "warn" : "default"}
          source="partner aggregation" formula="Σ_top3(commission) / Σ_total(commission)"
          why="If 50%+ of commission is from 3 partners, you're concentrated. Diversification = strategic priority." kpi="Customer Concentration (HHI)" />
        <KpiCard label="At-risk partners" value="4" accent="warn"
          source="commission trend by partner" formula="count(partner where 30d_commission < prior_30d × 0.8)"
          why="Partners showing 20%+ commission drop in last 30d. CS team triage." kpi="Churn Risk Flag" />
      </div>

      <LineChart title="Commission · weekly" subtitle="last 24 weeks · sample data"
        labels={tr.labels} series={[{ label: "Commission (€)", values: tr.values, color: "var(--accent)" }]}
        yFmt={(v) => `€${(v/1000).toFixed(0)}k`} />

      <div style={{ marginTop: 16, background: "var(--bg-elev)", border: "1px solid var(--line)", borderRadius: 10, padding: 16 }}>
        <div style={{ fontSize: 13, color: "var(--ink)", fontWeight: 600, marginBottom: 12 }}>Top partners by commission · 12-month</div>
        <HBar labels={partners.map(p => p.name)} values={partners.map(p => p.commission)} maxBars={10} valueFmt={(v) => `€${(v/1000).toFixed(0)}k`} color="var(--accent)" />
      </div>

      <Disclaimer />
    </div>
  );
}
function Disclaimer() {
  return (
    <div style={{ marginTop: 16, padding: 14, background: "rgba(255,179,71,0.06)", border: "1px solid rgba(255,179,71,0.3)", borderRadius: 8, fontSize: 12, color: "var(--ink-dim)" }}>
      <strong style={{ color: "var(--warn)" }}>Sample data.</strong> Synthetic partner archetypes · production version joins bookings × partner × commission.
    </div>
  );
}
