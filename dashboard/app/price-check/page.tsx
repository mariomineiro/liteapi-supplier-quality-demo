import KpiCard from "@/components/kpi-card";
import { rateParitySnapshot } from "@/lib/sample-data";

export const dynamic = "force-dynamic";

export default function PriceCheck() {
  const rows = rateParitySnapshot();
  const undercut = rows.filter(r => r.drift > 2).length;
  const competitive = rows.filter(r => Math.abs(r.drift) <= 2).length;
  const overpriced = rows.filter(r => r.drift > 5).length;
  const avgDrift = rows.reduce((s, r) => s + r.drift, 0) / rows.length;

  return (
    <div style={{ maxWidth: 1500 }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 22 }}>Price Check <span style={{ fontSize: 11, padding: "2px 6px", background: "rgba(255,179,71,0.2)", color: "var(--warn)", borderRadius: 4, marginLeft: 8 }}>NEW</span><span className="mono" style={{ fontSize: 11, color: "var(--warn)", marginLeft: 12 }}>· MOCK · production shape</span></h1>
        <div style={{ marginTop: 6, fontSize: 13, color: "var(--ink-dim)", maxWidth: 800 }}>
          Real-time rate-parity check. Compares LiteAPI offered rates against the same property on 3 competitor sources, per hotel × date. Drift &gt; 2% is the alarm zone.
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
        <KpiCard label="Hotels checked (sample)" value={rows.length.toString()} accent="live"
          source="POST /hotels/rates × scrape" formula="count(hotels with parity sample)"
          why="Sample size for parity. Production runs full inventory continuously." />
        <KpiCard label="Competitive (±2%)" value={`${((competitive / rows.length) * 100).toFixed(0)}%`} accent="live"
          source="LiteAPI vs competitor rates" formula="count(|drift| ≤ 2%) / total × 100"
          why="Healthy. >70% = pricing engine is doing its job." kpi="Competitor Undercut %" />
        <KpiCard label="Overpriced vs market" value={overpriced.toString()} accent={overpriced > 0 ? "warn" : "default"}
          source="rate compare" formula="count(LiteAPI > min(competitors) × 1.05)"
          why="Customers leaving for cheaper source. Highest-priority pricing action." kpi="Competitor Undercut %" />
        <KpiCard label="Avg drift vs market min" value={`${avgDrift > 0 ? "+" : ""}${avgDrift.toFixed(2)}%`} accent={Math.abs(avgDrift) > 2 ? "warn" : "default"}
          source="rate compare" formula="mean((LiteAPI − min_competitor) / min_competitor × 100)"
          why="System-wide signal. Negative = consistently cheapest (good); positive = leaving money on the table or losing bookings." />
      </div>

      <div style={{ background: "var(--bg-elev)", border: "1px solid var(--line)", borderRadius: 10, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.8fr 100px 110px 110px 110px 130px", gap: 10, padding: "10px 16px", fontSize: 10, letterSpacing: 1.2, color: "var(--ink-faint)", textTransform: "uppercase", borderBottom: "1px solid var(--line)", background: "var(--bg-elev-2)" }}>
          <div>hotel</div><div style={{ textAlign: "right" }}>LiteAPI €</div><div style={{ textAlign: "right" }}>comp min</div><div style={{ textAlign: "right" }}>comp max</div><div style={{ textAlign: "right" }}>drift</div><div style={{ textAlign: "right" }}>verdict</div>
        </div>
        {rows.map((r, i) => {
          const verdict = r.drift > 5 ? { label: "OVERPRICED", color: "var(--bad)" } : r.drift > 2 ? { label: "WATCH", color: "var(--warn)" } : r.drift < -2 ? { label: "UNDERCUT", color: "var(--accent)" } : { label: "PARITY", color: "var(--ink-dim)" };
          return (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "1.8fr 100px 110px 110px 110px 130px", gap: 10, padding: "10px 16px", fontSize: 13, borderBottom: "1px solid var(--line)", alignItems: "center" }}>
              <div style={{ color: "var(--ink)" }}>{r.name}</div>
              <div className="mono" style={{ color: "var(--ink)", textAlign: "right" }}>€{r.liteAPI}</div>
              <div className="mono" style={{ color: "var(--ink-dim)", textAlign: "right" }}>€{r.compMin}</div>
              <div className="mono" style={{ color: "var(--ink-dim)", textAlign: "right" }}>€{r.compMax}</div>
              <div className="mono" style={{ color: r.drift > 2 ? "var(--bad)" : r.drift < -2 ? "var(--accent)" : "var(--ink-dim)", textAlign: "right" }}>{r.drift > 0 ? "+" : ""}{r.drift.toFixed(1)}%</div>
              <div style={{ textAlign: "right" }}>
                <span style={{ padding: "2px 8px", borderRadius: 4, background: verdict.color, color: "#0a0a14", fontSize: 10, fontWeight: 700 }} className="mono">{verdict.label}</span>
              </div>
            </div>
          );
        })}
      </div>

      <Disclaimer />
    </div>
  );
}
function Disclaimer() {
  return <div style={{ marginTop: 16, padding: 14, background: "rgba(255,179,71,0.06)", border: "1px solid rgba(255,179,71,0.3)", borderRadius: 8, fontSize: 12, color: "var(--ink-dim)" }}><strong style={{ color: "var(--warn)" }}>Sample data.</strong> Production version polls competitor pricing on a rotating schedule + matches via rohId.</div>;
}
