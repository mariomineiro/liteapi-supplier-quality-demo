import CitySwitcher from "@/components/city-switcher";
import { loadPricing } from "@/lib/data";

export const dynamic = "force-dynamic";

type SearchProps = { searchParams: Promise<{ city?: string }> };

export default async function Pricing({ searchParams }: SearchProps) {
  const { city = "pt-lisbon" } = await searchParams;
  const snap = await loadPricing(city);
  const avgTake = (snap.rows.reduce((s, r) => s + (r.median_take_rate_pct ?? 0), 0) / snap.rows.length).toFixed(1);
  const avgSpread = (snap.rows.reduce((s, r) => s + (r.price_spread_pct ?? 0), 0) / snap.rows.length).toFixed(1);
  const outliers = snap.rows.filter(r => (r.price_spread_pct ?? 0) > 100).length;

  return (
    <div style={{ maxWidth: 1400 }}>
      <h1 style={{ margin: 0, fontSize: 22 }}>Pricing &amp; Take-Rate <span style={{ fontSize: 12, color: "var(--ink-faint)" }} className="mono">· live · {snap.meta.city}, {snap.meta.country} · {snap.meta.checkin} → {snap.meta.checkout}</span></h1>
      <p style={{ color: "var(--ink-dim)", fontSize: 13, marginTop: 6, maxWidth: 760 }}>
        Per-hotel pricing scorecard computed from <code className="mono" style={{ color: "var(--accent-blue)" }}>POST /hotels/rates</code>. Composite = 25% supplier diversity + 25% offer/board variety + 25% take-rate signal + 25% inverse-spread health.
      </p>

      <CitySwitcher basePath="/pricing" />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 22 }}>
        <Stat label="hotels priced" value={snap.rows.length.toString()} />
        <Stat label="avg take-rate %" value={`${avgTake}%`} accent />
        <Stat label="avg price spread %" value={`${avgSpread}%`} />
        <Stat label="pricing outliers (>100% spread)" value={outliers.toString()} warn={outliers > 0} />
      </div>

      <Table rows={snap.rows} currency={snap.meta.currency ?? "EUR"} />

      <div style={{ marginTop: 16, fontSize: 12, color: "var(--ink-faint)" }}>
        Note: distinct-supplier count is 1 across all rows because sandbox returns a single supplier (<span className="mono">nuitee</span>). In production the same loop reveals multi-supplier rate-parity drift.
      </div>
    </div>
  );
}

function Stat({ label, value, accent, warn }: { label: string; value: string; accent?: boolean; warn?: boolean }) {
  return (
    <div style={{ background: "var(--bg-elev)", border: "1px solid var(--line)", borderRadius: 10, padding: "14px 18px" }}>
      <div style={{ fontSize: 10, letterSpacing: 1.2, textTransform: "uppercase", color: "var(--ink-faint)" }}>{label}</div>
      <div className="mono" style={{ fontSize: 22, marginTop: 6, color: warn ? "var(--warn)" : accent ? "var(--accent)" : "var(--ink)" }}>{value}</div>
    </div>
  );
}

function Table({ rows, currency }: { rows: any[]; currency: string }) {
  return (
    <div style={{ background: "var(--bg-elev)", border: "1px solid var(--line)", borderRadius: 10, overflow: "hidden" }}>
      <div style={{
        display: "grid", gridTemplateColumns: "40px 1.7fr 70px 70px 100px 100px 100px 90px 90px 90px",
        gap: 6, padding: "10px 14px", fontSize: 10, letterSpacing: 1.2, color: "var(--ink-faint)", textTransform: "uppercase", borderBottom: "1px solid var(--line)",
      }}>
        <div>#</div><div>hotel</div><div>offers</div><div>boards</div><div>min {currency}</div><div>median {currency}</div><div>max {currency}</div><div>spread %</div><div>take %</div><div style={{ textAlign: "right" }}>score</div>
      </div>
      {rows.map((r, i) => (
        <div key={r.hotel_id || i} style={{
          display: "grid", gridTemplateColumns: "40px 1.7fr 70px 70px 100px 100px 100px 90px 90px 90px",
          gap: 6, padding: "9px 14px", fontSize: 13, borderBottom: "1px solid var(--line)", alignItems: "center",
        }}>
          <div className="mono" style={{ color: "var(--ink-faint)" }}>{i + 1}</div>
          <div style={{ color: "var(--ink)" }}>{r.hotel_name}</div>
          <div className="mono" style={{ color: "var(--ink-dim)" }}>{r.offers_returned}</div>
          <div className="mono" style={{ color: "var(--ink-dim)" }}>{r.distinct_boards}</div>
          <div className="mono" style={{ color: "var(--ink-dim)" }}>{r.min_retail?.toFixed(0) ?? "—"}</div>
          <div className="mono" style={{ color: "var(--ink)" }}>{r.median_retail?.toFixed(0) ?? "—"}</div>
          <div className="mono" style={{ color: "var(--ink-dim)" }}>{r.max_retail?.toFixed(0) ?? "—"}</div>
          <div className="mono" style={{ color: (r.price_spread_pct ?? 0) > 100 ? "var(--bad)" : (r.price_spread_pct ?? 0) > 50 ? "var(--warn)" : "var(--ink-dim)" }}>{r.price_spread_pct?.toFixed(1) ?? "—"}%</div>
          <div className="mono" style={{ color: "var(--accent)" }}>{r.median_take_rate_pct?.toFixed(1) ?? "—"}%</div>
          <div className="mono" style={{ textAlign: "right", fontWeight: 700, color: "var(--accent)" }}>{r.competitiveness_score}</div>
        </div>
      ))}
    </div>
  );
}
