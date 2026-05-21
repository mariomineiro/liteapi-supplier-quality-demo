import KpiCard from "@/components/kpi-card";
import { distributionMatrix } from "@/lib/sample-data";

export const dynamic = "force-dynamic";

export default function Distributions() {
  const { channels, suppliers, matrix } = distributionMatrix();
  const totals = channels.map((_, ci) => matrix[ci].reduce((s, v) => s + v, 0));
  const grand = totals.reduce((s, v) => s + v, 0);
  const max = Math.max(...matrix.flat());

  return (
    <div style={{ maxWidth: 1500 }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 22 }}>Distributions <span className="mono" style={{ fontSize: 11, color: "var(--warn)", marginLeft: 12 }}>· MOCK · production shape</span></h1>
        <div style={{ marginTop: 6, fontSize: 13, color: "var(--ink-dim)", maxWidth: 800 }}>
          Channel-mix matrix: which partner archetypes ship which suppliers. Spots under-utilised supply lanes and overconcentration patterns.
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
        <KpiCard label="Total bookings · 30d" value={grand.toLocaleString()} accent="live"
          source="bookings × channel × supplier" formula="Σ bookings grouped by (channel, supplier)"
          why="Aggregate flow through the platform." />
        <KpiCard label="Active channels" value={channels.length.toString()} source="distinct channels" formula="count(distinct partner_segment)" why="More = healthy distribution mix." />
        <KpiCard label="Active suppliers" value={suppliers.length.toString()} source="distinct suppliers" formula="count(distinct supplier_id)" why="Supply-side diversity." />
        <KpiCard label="Mix concentration (HHI)" value="1840" accent="warn"
          source="channel × supplier shares" formula="Σ(share²) across cells"
          why="Single-number concentration. >1800 = concentrated; <1000 = well-distributed." kpi="Customer Concentration (HHI)" />
      </div>

      <div style={{ background: "var(--bg-elev)", border: "1px solid var(--line)", borderRadius: 10, padding: 16 }}>
        <div style={{ fontSize: 13, color: "var(--ink)", fontWeight: 600, marginBottom: 12 }}>Bookings matrix · channel × supplier</div>
        <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 12 }}>
          <thead>
            <tr>
              <th style={{ padding: "8px 10px", textAlign: "left", color: "var(--ink-faint)", textTransform: "uppercase", fontSize: 10, letterSpacing: 1 }}>channel \ supplier</th>
              {suppliers.map(s => <th key={s} style={{ padding: "8px 10px", textAlign: "center", color: "var(--ink-faint)", textTransform: "uppercase", fontSize: 10, letterSpacing: 1 }}>{s}</th>)}
              <th style={{ padding: "8px 10px", textAlign: "right", color: "var(--ink-faint)", textTransform: "uppercase", fontSize: 10, letterSpacing: 1 }}>total</th>
            </tr>
          </thead>
          <tbody>
            {channels.map((c, ci) => (
              <tr key={c}>
                <td style={{ padding: "6px 10px", color: "var(--ink-dim)", whiteSpace: "nowrap" }}>{c}</td>
                {matrix[ci].map((v, si) => {
                  const intensity = v / max;
                  return (
                    <td key={si} style={{ padding: 4 }}>
                      <div className="mono" style={{
                        height: 32, borderRadius: 3, display: "flex", alignItems: "center", justifyContent: "center",
                        background: `rgba(92,58,175,${0.15 + intensity * 0.7})`,
                        color: intensity > 0.5 ? "#fff" : "var(--ink)", fontSize: 11, fontWeight: 600,
                      }}>{v.toLocaleString()}</div>
                    </td>
                  );
                })}
                <td className="mono" style={{ padding: "6px 10px", color: "var(--accent)", textAlign: "right" }}>{totals[ci].toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Disclaimer />
    </div>
  );
}
function Disclaimer() {
  return <div style={{ marginTop: 16, padding: 14, background: "rgba(255,179,71,0.06)", border: "1px solid rgba(255,179,71,0.3)", borderRadius: 8, fontSize: 12, color: "var(--ink-dim)" }}><strong style={{ color: "var(--warn)" }}>Sample data.</strong> Production matrix joins bookings × partner_segment × supplier_id from the bookings fact table.</div>;
}
