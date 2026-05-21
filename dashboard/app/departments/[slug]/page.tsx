import { DEPARTMENTS, loadDepartment, mean, lastN, series, deltaPct, labels, fmtNum, type DepartmentSlug } from "@/lib/analytics";
import { LineChart, BarChart, Sparkline } from "@/components/charts";
import InfoTip from "@/components/info-tip";
import Link from "next/link";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export default async function DepartmentDetail({ params }: Props) {
  const { slug } = await params;
  const dept = DEPARTMENTS.find(d => d.slug === slug);
  if (!dept) return <div style={{ padding: 40, color: "var(--bad)" }}>Department not found. <Link href="/departments" style={{ color: "var(--accent)" }}>Back</Link></div>;
  const { meta, data } = await loadDepartment(slug as DepartmentSlug);

  const kpiCols = data.columns.filter(c => c !== "date");

  return (
    <div style={{ maxWidth: 1500 }}>
      <Link href="/departments" style={{ fontSize: 12, color: "var(--ink-dim)" }}>← all departments</Link>
      <h1 style={{ margin: "8px 0 4px", fontSize: 24 }}>{meta.emoji} {meta.label}</h1>
      <div style={{ fontSize: 12, color: "var(--ink-faint)", marginBottom: 20 }} className="mono">
        {kpiCols.length} KPIs · {data.count.toLocaleString()} daily rows · 2022-01-01 → 2024-11-11
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 22 }}>
        {kpiCols.slice(0, 4).map(col => {
          const v = mean(lastN(data.rows, 30), col);
          const delta = deltaPct(data.rows, col, 30);
          return (
            <div key={col} style={{ background: "var(--bg-elev)", border: "1px solid var(--line)", borderRadius: 10, padding: "14px 18px" }}>
              <div style={{ fontSize: 10, letterSpacing: 1.2, textTransform: "uppercase", color: "var(--ink-faint)", display: "flex", alignItems: "center" }}>
                {col}
                <InfoTip
                  source={`DWH · ${data.source}`}
                  formula={`mean(${col}) over last 30 days`}
                  why={`30-day average. Delta compares to prior 30 days.`}
                  size={11}
                />
              </div>
              <div className="mono" style={{ fontSize: 22, marginTop: 6, color: meta.accent }}>
                {fmtNum(v, { decimals: col.toLowerCase().includes("rate") || col.toLowerCase().includes("score") ? 2 : 0, abbrev: !col.toLowerCase().includes("rate") && !col.toLowerCase().includes("score") })}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
                <Sparkline values={series(data.rows, col, 30)} color={meta.accent} width={90} height={24} />
                <span className="mono" style={{ fontSize: 11, color: delta >= 0 ? "var(--accent)" : "var(--bad)" }}>{delta >= 0 ? "↑" : "↓"} {Math.abs(delta).toFixed(1)}%</span>
              </div>
            </div>
          );
        })}
      </div>

      <LineChart title={`${kpiCols[0]} · last 90 days`} subtitle={`daily values from DWH · ${data.source}`}
        labels={labels(data.rows, 90)}
        series={[{ label: kpiCols[0], values: series(data.rows, kpiCols[0], 90), color: meta.accent }]}
        yFmt={(v) => fmtNum(v, { abbrev: true })} />

      <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {kpiCols.slice(1, 3).map(col => (
          <LineChart key={col} title={col} subtitle="last 90 days"
            labels={labels(data.rows, 90)}
            series={[{ label: col, values: series(data.rows, col, 90), color: meta.accent }]}
            yFmt={(v) => fmtNum(v, { abbrev: true })}
            height={180} />
        ))}
      </div>

      <div style={{ marginTop: 22, background: "var(--bg-elev)", border: "1px solid var(--line)", borderRadius: 10, padding: 16 }}>
        <div style={{ fontSize: 13, color: "var(--ink)", fontWeight: 600, marginBottom: 10 }}>
          All {kpiCols.length} KPIs · 30-day average
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
          {kpiCols.map(col => {
            const v = mean(lastN(data.rows, 30), col);
            const delta = deltaPct(data.rows, col, 30);
            return (
              <div key={col} style={{ display: "grid", gridTemplateColumns: "1fr 120px 80px 60px", gap: 10, padding: "8px 10px", borderBottom: "1px solid var(--line)", fontSize: 12, alignItems: "center" }}>
                <div style={{ color: "var(--ink-dim)" }}>{col}</div>
                <Sparkline values={series(data.rows, col, 30)} color={meta.accent} width={100} height={20} />
                <div className="mono" style={{ color: meta.accent, textAlign: "right" }}>
                  {fmtNum(v, { decimals: col.toLowerCase().includes("rate") || col.toLowerCase().includes("score") ? 2 : 0, abbrev: !col.toLowerCase().includes("rate") })}
                </div>
                <div className="mono" style={{ color: delta >= 0 ? "var(--accent)" : "var(--bad)", textAlign: "right", fontSize: 10 }}>
                  {delta >= 0 ? "↑" : "↓"}{Math.abs(delta).toFixed(1)}%
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  return DEPARTMENTS.map(d => ({ slug: d.slug }));
}
