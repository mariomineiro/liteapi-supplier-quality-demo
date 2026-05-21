import { LineChart, BarChart, Sparkline } from "@/components/charts";
import InfoTip from "@/components/info-tip";
import { gbvAndRevenueTrend, takeRateByMarket, trend } from "@/lib/sample-data";

export const dynamic = "force-dynamic";

export default function Earnings() {
  const tr = gbvAndRevenueTrend(41, 24);
  const tr24w = takeRateByMarket();
  const lastWeekGbv = tr.gbv[tr.gbv.length - 1];
  const lastWeekRev = tr.rev[tr.rev.length - 1];
  const lastTakeRate = (lastWeekRev / lastWeekGbv) * 100;
  const total24wGbv = tr.gbv.reduce((s, v) => s + v, 0);
  const total24wRev = tr.rev.reduce((s, v) => s + v, 0);
  const growthVsYa = 38.4; // synthetic YoY

  return (
    <div style={{ maxWidth: 1500 }}>
      <Header />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
        <Stat label="GBV · 24w trailing" value={`€${(total24wGbv / 1e6).toFixed(1)}M`} sparkline={tr.gbv}
          source="bookings fact" formula="Σ booking.total_price last 24 weeks"
          why="Top-line volume the entire stack feeds into. The board's first chart of any pack." />
        <Stat label="Net Revenue · 24w" value={`€${(total24wRev / 1e6).toFixed(1)}M`} sparkline={tr.rev} accent="ok"
          source="bookings × commissions" formula="Σ(booking_value × take_rate)"
          why="Actually-earned revenue post-commission. Lags GBV by ~30 days due to payout cadence." />
        <Stat label="Effective take-rate (last w)" value={`${lastTakeRate.toFixed(1)}%`} sparkline={tr.rev.map((r, i) => r / tr.gbv[i] * 100)}
          source="bookings" formula="Σ commission / Σ GBV × 100"
          why="System-wide margin. Drift down = price war with supply; drift up = pricing power." />
        <Stat label="YoY growth" value={`+${growthVsYa.toFixed(1)}%`} accent="ok" sparkline={trend(301, 12, 36, 0.04)}
          source="bookings (period over period)" formula="(period / period-1y − 1) × 100"
          why="The narrative line in every investor update." />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16, marginBottom: 16 }}>
        <LineChart title="GBV vs Net Revenue · weekly" subtitle="dual-line, same scale, last 24 weeks"
          labels={tr.labels} series={[
            { label: "GBV", values: tr.gbv, color: "var(--accent-blue)" },
            { label: "Net Revenue", values: tr.rev, color: "var(--accent)" },
          ]}
          yFmt={(v) => `€${(v / 1e6).toFixed(1)}M`} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <BarChart title="Take-rate by market" subtitle="effective commission % per ISO country, last 24w"
          labels={tr24w.map(t => t.market)} values={tr24w.map(t => t.takeRate)} color="var(--accent)" yFmt={(v) => `${v.toFixed(1)}%`} />
        <CommercialBreakdown />
      </div>

      <Disclaimer />
    </div>
  );
}

function CommercialBreakdown() {
  const rows = [
    { label: "Transactional revenue (per-booking)", v: 87.3, color: "var(--accent)" },
    { label: "SaaS-tier platform subscriptions", v: 9.4, color: "var(--accent-blue)" },
    { label: "White-label setup fees", v: 2.1, color: "var(--warn)" },
    { label: "API-call overage / surge", v: 1.2, color: "var(--bad)" },
  ];
  return (
    <div style={{ background: "var(--bg-elev)", border: "1px solid var(--line)", borderRadius: 10, padding: 16 }}>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 13, color: "var(--ink)", fontWeight: 600 }}>Revenue mix · last 24w</div>
        <div style={{ fontSize: 11, color: "var(--ink-faint)", marginTop: 2 }}>%-share of net revenue by stream</div>
      </div>
      {rows.map((r, i) => (
        <div key={i} style={{ marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
            <span style={{ color: "var(--ink-dim)" }}>{r.label}</span>
            <span className="mono" style={{ color: r.color }}>{r.v}%</span>
          </div>
          <div style={{ height: 8, background: "var(--bg-elev-2)", borderRadius: 2, overflow: "hidden" }}>
            <div style={{ width: `${r.v}%`, height: "100%", background: r.color, opacity: 0.85 }} />
          </div>
        </div>
      ))}
      <div style={{ marginTop: 14, fontSize: 11, color: "var(--ink-faint)" }}>
        Healthy: transactional &gt;80%, SaaS-tier growing as % over time = platform stickiness.
      </div>
    </div>
  );
}

function Header() {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
        <h1 style={{ margin: 0, fontSize: 22 }}>Earnings</h1>
        <span className="mono" style={{ fontSize: 11, color: "var(--warn)" }}>· sample data · production shape</span>
      </div>
      <div style={{ marginTop: 6, fontSize: 13, color: "var(--ink-dim)", maxWidth: 760 }}>
        Board-pack view of GBV, net revenue, take-rate trend, and revenue mix. The page the CFO opens every Monday.
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

function Disclaimer() {
  return (
    <div style={{ marginTop: 16, padding: 14, background: "rgba(255,179,71,0.06)", border: "1px solid rgba(255,179,71,0.3)", borderRadius: 8, fontSize: 12, color: "var(--ink-dim)" }}>
      <strong style={{ color: "var(--warn)" }}>Sample data.</strong> All numbers are deterministic synthetic data. Page structure mirrors a production earnings dashboard.
    </div>
  );
}
