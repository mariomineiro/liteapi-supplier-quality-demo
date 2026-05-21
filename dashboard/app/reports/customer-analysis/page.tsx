import { LineChart, HBar, HeatmapCohort } from "@/components/charts";
import KpiCard from "@/components/kpi-card";
import { ltvByTier, churnRiskList, cohortLtvCurve, customerCohortRetention } from "@/lib/sample-data";

export const dynamic = "force-dynamic";

export default function CustomerAnalysis() {
  const tiers = ltvByTier();
  const churn = churnRiskList();
  const ltvCurve = cohortLtvCurve();
  const cohort = customerCohortRetention();
  const totalLtv = tiers.reduce((s, t) => s + t.avgLtv * t.count, 0);
  const totalCustomers = tiers.reduce((s, t) => s + t.count, 0);
  const highRisk = churn.filter(c => c.riskScore > 70).length;

  return (
    <div style={{ maxWidth: 1500 }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 22 }}>Customer Analysis <span className="mono" style={{ fontSize: 11, color: "var(--warn)", marginLeft: 12 }}>· MOCK · production shape</span></h1>
        <div style={{ marginTop: 6, fontSize: 13, color: "var(--ink-dim)", maxWidth: 800 }}>
          LTV by tier · churn risk · cohort retention. Drives CS prioritisation and renewals strategy.
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
        <KpiCard label="Total LTV under mgmt" value={`€${(totalLtv / 1e6).toFixed(0)}M`} accent="live"
          source="bookings × customers · 3-yr horizon" formula="Σ(avgLtv × count) across tiers"
          why="Forward-looking customer value. The denominator behind every retention decision." kpi="Customer LTV (cohort)" />
        <KpiCard label="Active partners" value={totalCustomers.toString()}
          source="partner billing" formula="count(distinct partner_id where active = true)"
          why="Live customer count. Trending up = sales is converting." kpi="Monthly Active Partners (MAP)" />
        <KpiCard label="High-risk partners (>70)" value={highRisk.toString()} accent={highRisk > 0 ? "warn" : "default"}
          source="integration health · usage trend · ticket volume" formula="count(partner where risk_score > 70)"
          why="Partners most likely to churn this quarter. CS team intervenes." kpi="Churn Risk Flag" />
        <KpiCard label="LTV/CAC" value="4.7×" accent="live"
          source="bookings × CAC by acquisition source" formula="ltv_per_partner / cac_per_partner"
          why=">3× = healthy SaaS economics. <1× = burn cash to acquire." kpi="LTV / CAC" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16, marginBottom: 16 }}>
        <div style={{ background: "var(--bg-elev)", border: "1px solid var(--line)", borderRadius: 10, padding: 16 }}>
          <div style={{ fontSize: 13, color: "var(--ink)", fontWeight: 600, marginBottom: 12 }}>LTV by tier</div>
          {tiers.map((t, i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                <span style={{ color: "var(--ink-dim)" }}>{t.tier} <span style={{ color: "var(--ink-faint)" }}>· {t.count} partners</span></span>
                <span className="mono" style={{ color: t.color }}>€{(t.avgLtv / 1e6).toFixed(2)}M avg</span>
              </div>
              <div style={{ height: 10, background: "var(--bg-elev-2)", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ width: `${(t.avgLtv / tiers[0].avgLtv) * 100}%`, height: "100%", background: t.color, opacity: 0.85 }} />
              </div>
            </div>
          ))}
        </div>
        <div style={{ background: "var(--bg-elev)", border: "1px solid var(--line)", borderRadius: 10, padding: 16 }}>
          <div style={{ fontSize: 13, color: "var(--ink)", fontWeight: 600, marginBottom: 12 }}>Cumulative LTV per partner · cohort curve</div>
          <LineChart labels={ltvCurve.months} series={[{ label: "Cumulative LTV (€)", values: ltvCurve.values, color: "var(--accent)" }]}
            yFmt={(v) => `€${v >= 1000 ? `${(v/1000).toFixed(1)}k` : v.toFixed(0)}`} height={180} />
        </div>
      </div>

      <HeatmapCohort title="Cohort retention by signup month" subtitle="% of partners still active at M+N"
        rowLabels={cohort.rowLabels} colLabels={cohort.colLabels} matrix={cohort.matrix} />

      <div style={{ marginTop: 16, background: "var(--bg-elev)", border: "1px solid var(--line)", borderRadius: 10, padding: 16 }}>
        <div style={{ fontSize: 13, color: "var(--ink)", fontWeight: 600, marginBottom: 12 }}>Churn risk · top {churn.length} partners</div>
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 100px 110px 110px 130px 100px", gap: 10, padding: "8px 10px", fontSize: 10, letterSpacing: 1.2, color: "var(--ink-faint)", textTransform: "uppercase", borderBottom: "1px solid var(--line)" }}>
          <div>partner</div><div style={{ textAlign: "right" }}>monthly GBV</div><div style={{ textAlign: "right" }}>integration health</div><div style={{ textAlign: "right" }}>last call</div><div style={{ textAlign: "right" }}>risk score</div><div style={{ textAlign: "right" }}>action</div>
        </div>
        {churn.map((c, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "1.5fr 100px 110px 110px 130px 100px", gap: 10, padding: "8px 10px", fontSize: 13, borderBottom: "1px solid var(--line)", alignItems: "center" }}>
            <div style={{ color: "var(--ink)" }}>{c.name}</div>
            <div className="mono" style={{ color: "var(--ink-dim)", textAlign: "right" }}>€{(c.monthlyGbv / 1e6).toFixed(2)}M</div>
            <div className="mono" style={{ color: c.integrationHealth >= 80 ? "var(--accent)" : "var(--warn)", textAlign: "right" }}>{c.integrationHealth.toFixed(0)}%</div>
            <div className="mono" style={{ color: c.daysSinceLastCall > 14 ? "var(--bad)" : "var(--ink-dim)", textAlign: "right" }}>{c.daysSinceLastCall}d</div>
            <div className="mono" style={{ color: c.riskScore > 70 ? "var(--bad)" : c.riskScore > 50 ? "var(--warn)" : "var(--ink-dim)", textAlign: "right", fontWeight: 700 }}>{c.riskScore.toFixed(0)}</div>
            <div style={{ textAlign: "right", fontSize: 11, color: c.riskScore > 70 ? "var(--bad)" : "var(--ink-faint)" }}>{c.riskScore > 70 ? "INTERVENE" : c.riskScore > 50 ? "monitor" : "ok"}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 16, padding: 14, background: "rgba(255,179,71,0.06)", border: "1px solid rgba(255,179,71,0.3)", borderRadius: 8, fontSize: 12, color: "var(--ink-dim)" }}>
        <strong style={{ color: "var(--warn)" }}>Sample data.</strong> Production joins bookings × partners × support_tickets × API_logs for the risk score. Partner names are generic archetypes.
      </div>
    </div>
  );
}
