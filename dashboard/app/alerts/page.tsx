import { DEPARTMENTS, loadAllDepartments, deltaPct, mean, lastN } from "@/lib/analytics";
import Link from "next/link";

export const dynamic = "force-dynamic";

type Alert = { severity: "P0" | "P1" | "P2" | "P3"; dept: string; kpi: string; msg: string; href: string };

export default async function Alerts() {
  const data = await loadAllDepartments();
  const alerts: Alert[] = [];

  for (const { meta, data: ds } of data) {
    const kpiCols = ds.columns.filter(c => c !== "date");
    for (const col of kpiCols) {
      const delta = deltaPct(ds.rows, col, 14);
      const isRate = col.toLowerCase().includes("rate") || col.toLowerCase().includes("score");
      const big = isRate ? Math.abs(delta) > 8 : Math.abs(delta) > 12;
      if (!big) continue;
      const sev: Alert["severity"] = Math.abs(delta) > 25 ? "P0" : Math.abs(delta) > 15 ? "P1" : "P2";
      alerts.push({
        severity: sev,
        dept: meta.label,
        kpi: col,
        msg: `${col} ${delta > 0 ? "up" : "down"} ${Math.abs(delta).toFixed(1)}% vs prior 14d`,
        href: `/departments/${meta.slug}`,
      });
    }
  }

  alerts.sort((a, b) => a.severity.localeCompare(b.severity));
  const top12 = alerts.slice(0, 12);

  const p0 = alerts.filter(a => a.severity === "P0").length;
  const p1 = alerts.filter(a => a.severity === "P1").length;
  const p2 = alerts.filter(a => a.severity === "P2").length;

  return (
    <div style={{ maxWidth: 1500 }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 22 }}>Critical Alerts <span className="mono" style={{ fontSize: 11, color: "var(--bad)", marginLeft: 12 }}>· {alerts.length} active · auto-scored from KPI drift</span></h1>
        <div style={{ marginTop: 6, fontSize: 13, color: "var(--ink-dim)", maxWidth: 760 }}>
          Auto-generated from 14-day vs prior-14-day drift across every department KPI. Click any row to drill into the source.
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 22 }}>
        <SevCard label="P0 · critical" count={p0} color="var(--bad)" />
        <SevCard label="P1 · high" count={p1} color="var(--warn)" />
        <SevCard label="P2 · medium" count={p2} color="var(--accent-blue)" />
        <SevCard label="resolved 7d" count={11} color="var(--accent)" />
      </div>

      <div style={{ background: "var(--bg-elev)", border: "1px solid var(--line)", borderRadius: 10, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "70px 1.4fr 1.4fr 1fr 80px", gap: 10, padding: "10px 16px", fontSize: 10, letterSpacing: 1.2, textTransform: "uppercase", color: "var(--ink-faint)", background: "var(--bg-elev-2)", borderBottom: "1px solid var(--line)" }}>
          <div>sev</div><div>department</div><div>KPI</div><div>signal</div><div style={{ textAlign: "right" }}>drill</div>
        </div>
        {top12.map((a, i) => (
          <Link key={i} href={a.href} style={{ display: "grid", gridTemplateColumns: "70px 1.4fr 1.4fr 1fr 80px", gap: 10, padding: "10px 16px", fontSize: 13, borderBottom: "1px solid var(--line)", alignItems: "center" }}>
            <div><SevBadge severity={a.severity} /></div>
            <div style={{ color: "var(--ink)" }}>{a.dept}</div>
            <div className="mono" style={{ color: "var(--accent-blue)", fontSize: 12 }}>{a.kpi}</div>
            <div style={{ color: "var(--ink-dim)", fontSize: 12 }}>{a.msg}</div>
            <div style={{ textAlign: "right", color: "var(--accent)", fontSize: 12 }}>→</div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function SevCard({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div style={{ background: "var(--bg-elev)", border: `1px solid var(--line)`, borderLeft: `3px solid ${color}`, borderRadius: 10, padding: "14px 18px" }}>
      <div style={{ fontSize: 10, letterSpacing: 1.2, textTransform: "uppercase", color: "var(--ink-faint)" }}>{label}</div>
      <div className="mono" style={{ fontSize: 28, color, marginTop: 6 }}>{count}</div>
    </div>
  );
}

function SevBadge({ severity }: { severity: "P0" | "P1" | "P2" | "P3" }) {
  const map: Record<string, string> = { P0: "var(--bad)", P1: "var(--warn)", P2: "var(--accent-blue)", P3: "var(--ink-dim)" };
  return <span style={{ padding: "3px 8px", borderRadius: 4, background: map[severity], color: "#02110b", fontSize: 11, fontWeight: 700 }} className="mono">{severity}</span>;
}
