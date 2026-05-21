import { Funnel, BarChart, LineChart, Sparkline } from "@/components/charts";
import InfoTip from "@/components/info-tip";
import { bookingFunnel, bookingsOverTime, bookingsByCity, trend } from "@/lib/sample-data";

export const dynamic = "force-dynamic";

export default function Bookings() {
  const funnel = bookingFunnel();
  const trend30 = trend(101, 30, 7800, 0.04);
  const byCity = bookingsByCity();
  const over = bookingsOverTime(11, 24);

  const totalConfirmed = over.confirmed.reduce((a, b) => a + b, 0);
  const totalCancelled = over.cancelled.reduce((a, b) => a + b, 0);
  const cancelRate = (totalCancelled / totalConfirmed) * 100;

  return (
    <div style={{ maxWidth: 1500 }}>
      <Header />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
        <Stat label="Confirmed bookings (24w)" value={totalConfirmed.toLocaleString()} sparkline={trend30}
          source="bookings fact table (sample)" formula="Σ confirmed bookings, last 24 weeks"
          why="Headline volume — the number Finance and CS open with every Monday." />
        <Stat label="Cancellation rate" value={`${cancelRate.toFixed(1)}%`} accent="warn" sparkline={trend(102, 30, 12, 0.08)}
          source="bookings × cancellations" formula="cancelled / confirmed × 100"
          why="Cancellations have direct refund cost. >12% = investigate by supplier / region / channel." />
        <Stat label="Confirmation rate" value="94.8%" accent="ok" sparkline={trend(103, 30, 95, 0.01)}
          source="bookings.status" formula="confirmed / attempted × 100"
          why="Supplier reliability signal. Below 95% means certain rate connectors are failing at book-time." />
        <Stat label="Avg booking value" value="€289" sparkline={trend(104, 30, 285, 0.02)}
          source="bookings.total_price" formula="Σ price / Σ bookings"
          why="ADR proxy. Drift down = customers booking cheaper inventory or shorter stays." />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 16, marginBottom: 16 }}>
        <Funnel title="Search → Book funnel · last 30 days" subtitle="conversion at each step; rate to previous step in parentheses" steps={funnel} />
        <BarChart title="Bookings by city · last 24w" subtitle="ranked by total confirmed" labels={byCity.slice(0, 8).map(c => c.city)} values={byCity.slice(0, 8).map(c => c.bookings)} color="var(--accent-blue)" yFmt={(v) => v >= 1000 ? `${(v/1000).toFixed(1)}k` : v.toFixed(0)} />
      </div>

      <LineChart title="Confirmed vs cancelled · weekly" subtitle="last 24 weeks · same scale to spot drift" labels={over.labels} series={[
        { label: "Confirmed", values: over.confirmed, color: "var(--accent)" },
        { label: "Cancelled", values: over.cancelled, color: "var(--bad)" },
      ]} yFmt={(v) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v.toFixed(0)} />

      <Disclaimer />
    </div>
  );
}

function Header() {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
        <h1 style={{ margin: 0, fontSize: 22 }}>Bookings</h1>
        <span className="mono" style={{ fontSize: 11, color: "var(--warn)" }}>· sample data · production shape</span>
      </div>
      <div style={{ marginTop: 6, fontSize: 13, color: "var(--ink-dim)", maxWidth: 760 }}>
        End-to-end booking funnel, weekly trend, and geographic split. In production these are joined from
        the bookings fact table; here the shape is shown with deterministic sample data.
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
      <strong style={{ color: "var(--warn)" }}>Sample data.</strong> Numbers here are deterministic synthetic data shaped like a real bookings funnel.
      The page structure, KPI definitions, and chart layouts are what a production version would show — only the values are simulated.
    </div>
  );
}
