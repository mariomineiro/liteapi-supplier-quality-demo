import { DEPARTMENTS, loadAllDepartments, mean, lastN, series, deltaPct, fmtNum } from "@/lib/analytics";
import { Sparkline } from "@/components/charts";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Departments() {
  const data = await loadAllDepartments();

  return (
    <div style={{ maxWidth: 1500 }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 22 }}>Departments <span className="mono" style={{ fontSize: 11, color: "var(--accent)", marginLeft: 12 }}>· 8 functions · daily KPIs since 2022</span></h1>
        <div style={{ marginTop: 6, fontSize: 13, color: "var(--ink-dim)", maxWidth: 760 }}>
          Every department has its own KPI catalog and daily values back to Jan 2022. Click any card to drill in.
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
        {data.map(({ meta, data: ds }) => {
          const kpiCols = ds.columns.filter(c => c !== "date");
          const topKpi = kpiCols[0];
          const v = mean(lastN(ds.rows, 30), topKpi);
          const delta = deltaPct(ds.rows, topKpi, 30);
          return (
            <Link key={meta.slug} href={`/departments/${meta.slug}`} style={{ background: "var(--bg-elev)", border: "1px solid var(--line)", borderRadius: 10, padding: 20, display: "block" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                <div>
                  <div style={{ fontSize: 20, marginBottom: 6 }}>{meta.emoji} {meta.label}</div>
                  <div style={{ fontSize: 11, color: "var(--ink-faint)", letterSpacing: 1 }}>
                    {kpiCols.length} KPIs · {ds.count.toLocaleString()} daily rows
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="mono" style={{ fontSize: 20, color: meta.accent }}>
                    {fmtNum(v, { decimals: topKpi.toLowerCase().includes("rate") || topKpi.toLowerCase().includes("score") ? 1 : 0, abbrev: !topKpi.toLowerCase().includes("rate") })}
                  </div>
                  <div className="mono" style={{ fontSize: 11, color: delta >= 0 ? "var(--accent)" : "var(--bad)" }}>
                    {delta >= 0 ? "↑" : "↓"} {Math.abs(delta).toFixed(1)}%
                  </div>
                </div>
              </div>
              <div style={{ marginTop: 12 }}>
                <Sparkline values={series(ds.rows, topKpi, 60)} color={meta.accent} width={420} height={40} />
              </div>
              <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 6 }}>
                {kpiCols.slice(0, 6).map(c => (
                  <span key={c} style={{ fontSize: 10, padding: "3px 8px", background: "var(--bg-elev-2)", border: "1px solid var(--line)", borderRadius: 4, color: "var(--ink-dim)" }}>{c}</span>
                ))}
                {kpiCols.length > 6 && <span style={{ fontSize: 10, color: "var(--ink-faint)", padding: "3px 4px" }}>+ {kpiCols.length - 6} more</span>}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
