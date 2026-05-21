import CitySwitcher from "@/components/city-switcher";
import PricingTable from "./table";
import { loadPricing } from "@/lib/data";
import InfoTip from "@/components/info-tip";

export const dynamic = "force-dynamic";

type SearchProps = { searchParams: Promise<{ city?: string }> };

export default async function Pricing({ searchParams }: SearchProps) {
  const { city = "pt-lisbon" } = await searchParams;
  const snap = await loadPricing(city);
  const avgTake = (snap.rows.reduce((s, r) => s + (r.median_take_rate_pct ?? 0), 0) / snap.rows.length).toFixed(1);
  const avgSpread = (snap.rows.reduce((s, r) => s + (r.price_spread_pct ?? 0), 0) / snap.rows.length).toFixed(1);
  const outliers = snap.rows.filter(r => (r.price_spread_pct ?? 0) > 100).length;

  return (
    <div style={{ maxWidth: 1500 }}>
      <h1 style={{ margin: 0, fontSize: 22 }}>
        Pricing &amp; Take-Rate
        <span style={{ fontSize: 12, color: "var(--ink-faint)", marginLeft: 12 }} className="mono">
          · live · {snap.meta.city}, {snap.meta.country} · {snap.meta.checkin} → {snap.meta.checkout}
        </span>
      </h1>
      <p style={{ color: "var(--ink-dim)", fontSize: 13, marginTop: 6, maxWidth: 800 }}>
        Per-hotel pricing scorecard computed live from <code className="mono" style={{ color: "var(--accent-blue)" }}>POST /hotels/rates</code>.
        Composite = 25% supplier diversity + 25% offer/board variety + 25% take-rate signal + 25% inverse-spread health.
      </p>

      <CitySwitcher basePath="/pricing" />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 22 }}>
        <Stat
          label="hotels priced"
          value={snap.rows.length.toString()}
          source="POST /hotels/rates"
          formula="count(hotels with ≥1 offer)"
          why="Hotels in the basket that returned available offers for the date range. Empty = no rooms or rate connector down."
        />
        <Stat
          label="avg take-rate %"
          value={`${avgTake}%`}
          accent
          source="POST /hotels/rates"
          formula="mean((SSP − retail) / retail × 100)"
          why="(SuggestedSellingPrice − retail) / retail. The implied margin if partners resell at SSP. <10% = pricing too aggressive."
        />
        <Stat
          label="avg price spread %"
          value={`${avgSpread}%`}
          source="POST /hotels/rates"
          formula="mean((max − min) / median × 100)"
          why="Volatility between cheapest and most expensive offer on the same property. >100% = at least one outlier offer, worth investigating."
        />
        <Stat
          label="pricing outliers"
          value={outliers.toString()}
          warn={outliers > 0}
          source="POST /hotels/rates"
          formula="count(hotels where spread > 100%)"
          why="Hotels with offers >2× their median. Likely either a mis-categorised suite, a stale rate, or supplier error."
        />
      </div>

      <PricingTable rows={snap.rows} currency={snap.meta.currency ?? "EUR"} />

      <div style={{ marginTop: 16, fontSize: 12, color: "var(--ink-faint)" }}>
        Note: distinct-supplier count is 1 across all rows because sandbox returns a single supplier (<span className="mono">nuitee</span>).
        In production the same loop reveals multi-supplier rate-parity drift.
      </div>
    </div>
  );
}

function Stat({ label, value, accent, warn, source, formula, why }: {
  label: string; value: string; accent?: boolean; warn?: boolean;
  source?: string; formula?: string; why?: string;
}) {
  return (
    <div style={{ background: "var(--bg-elev)", border: "1px solid var(--line)", borderRadius: 10, padding: "14px 18px" }}>
      <div style={{ fontSize: 10, letterSpacing: 1.2, textTransform: "uppercase", color: "var(--ink-faint)", display: "flex", alignItems: "center" }}>
        {label}
        {(source || formula || why) && <InfoTip source={source} formula={formula} why={why} size={11} />}
      </div>
      <div className="mono" style={{ fontSize: 22, marginTop: 6, color: warn ? "var(--warn)" : accent ? "var(--accent)" : "var(--ink)" }}>{value}</div>
    </div>
  );
}
