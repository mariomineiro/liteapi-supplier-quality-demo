import KpiCard from "@/components/kpi-card";
import { loadAllPricing, loadAllQuality } from "@/lib/data";
import Link from "next/link";

export default async function CommandCenter() {
  const quality = await loadAllQuality();
  const pricing = await loadAllPricing();

  const totalHotels = quality.reduce((s, q) => s + q.rows.length, 0);
  const avgContent = (quality.flatMap(q => q.rows).reduce((s, r) => s + r.content_completeness, 0) / Math.max(1, totalHotels)).toFixed(1);
  const allTakeRates = pricing.flatMap(p => p.rows.map(r => r.median_take_rate_pct).filter((x): x is number => x !== null));
  const medianTake = median(allTakeRates).toFixed(1);
  const avgSpread = (pricing.flatMap(p => p.rows.map(r => r.price_spread_pct).filter((x): x is number => x !== null))
    .reduce((s, x) => s + x, 0) / Math.max(1, pricing.flatMap(p => p.rows).length)).toFixed(1);
  const citiesCount = quality.length;

  const cityScores = pricing.map(p => {
    const rates = p.rows.map(r => r.median_take_rate_pct).filter((x): x is number => x !== null);
    const spreads = p.rows.map(r => r.price_spread_pct).filter((x): x is number => x !== null);
    return {
      city: p.meta.city,
      country: p.meta.country,
      medianTake: median(rates),
      maxSpread: spreads.length ? Math.max(...spreads) : 0,
    };
  });

  return (
    <div style={{ maxWidth: 1400 }}>
      <Header />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginTop: 20 }}>
        <KpiCard label="Hotels indexed" value={totalHotels} unit="hotels" hint={`${citiesCount} cities · sandbox key`} accent="live" />
        <KpiCard label="Content completeness" value={`${avgContent}%`} hint="avg across all hotels" accent="live" />
        <KpiCard label="Median take-rate" value={`${medianTake}%`} hint="(SSP – retail) / retail" accent="live" />
        <KpiCard label="Avg price spread" value={`${avgSpread}%`} hint="(max – min) / median, by hotel" accent="warn" />
      </div>

      <div style={{ marginTop: 28 }}>
        <SectionTitle>Operational KPIs · production-only</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
          <LockedKpi label="GBV (Gross Booking Value)" value="—" />
          <LockedKpi label="Confirmation rate" value="—" unit="%" />
          <LockedKpi label="Cancellation rate" value="—" unit="%" />
          <LockedKpi label="API p95 latency" value="—" unit="ms" />
        </div>
      </div>

      <div style={{ marginTop: 28 }}>
        <SectionTitle>City heatmap · pricing health</SectionTitle>
        <div style={{ background: "var(--bg-elev)", border: "1px solid var(--line)", borderRadius: 10, padding: 18 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr", gap: 12, fontSize: 11, color: "var(--ink-faint)", letterSpacing: 1, textTransform: "uppercase", paddingBottom: 10, borderBottom: "1px solid var(--line)" }}>
            <div>city</div><div>median take-rate</div><div>max spread</div><div>signal</div>
          </div>
          {cityScores.map((c) => (
            <div key={c.city} style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr", gap: 12, fontSize: 13, padding: "10px 0", borderBottom: "1px solid var(--line)", alignItems: "center" }}>
              <div style={{ color: "var(--ink)" }}>{c.city} <span style={{ color: "var(--ink-faint)" }}>· {c.country}</span></div>
              <div className="mono" style={{ color: "var(--accent)" }}>{c.medianTake.toFixed(1)}%</div>
              <div className="mono" style={{ color: c.maxSpread > 100 ? "var(--bad)" : c.maxSpread > 50 ? "var(--warn)" : "var(--ink-dim)" }}>{c.maxSpread.toFixed(0)}%</div>
              <div>{c.maxSpread > 100 ? <Pill color="bad">PRICING OUTLIER</Pill> : c.maxSpread > 50 ? <Pill color="warn">WIDE SPREAD</Pill> : <Pill color="ok">HEALTHY</Pill>}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 28, display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 16 }}>
        <div style={{ background: "var(--bg-elev)", border: "1px solid var(--line)", borderRadius: 10, padding: 18 }}>
          <SectionTitle>Pipeline status · supplier_quality_daily / price_competitiveness_daily</SectionTitle>
          <Row label="last refresh" value="2026-05-21 (manual)" />
          <Row label="cities tracked" value="8" />
          <Row label="rows landed" value={`${totalHotels} hotels × 2 tables`} />
          <Row label="next BigQuery sync" value="--:-- (not wired in demo)" />
          <Row label="dbt run status" value="N/A (demo uses JSON snapshots)" />
        </div>
        <div style={{ background: "var(--bg-elev)", border: "1px solid var(--line)", borderRadius: 10, padding: 18 }}>
          <SectionTitle>Agentic MCP signal</SectionTitle>
          <div style={{ fontSize: 13, color: "var(--ink-dim)", lineHeight: 1.6 }}>
            Nuitée&apos;s <a href="https://github.com/liteapi-travel/mcp-server" target="_blank" style={{ color: "var(--accent-blue)", textDecoration: "underline" }}>liteapi-travel/mcp-server</a> is open-source. The KPIs that don&apos;t exist anywhere else in travel-tech are the agentic ones: tool-call latency per endpoint, agent vs human funnel, intent-to-book ratio. That&apos;s the wedge.
          </div>
          <Link href="/mcp/tool-latency" style={{ display: "inline-block", marginTop: 12, fontSize: 12, padding: "6px 12px", border: "1px solid var(--accent-dim)", borderRadius: 6, color: "var(--accent)" }}>see the planned MCP dashboards →</Link>
        </div>
      </div>
    </div>
  );
}

function Header() {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
        <h1 style={{ margin: 0, fontSize: 22, letterSpacing: 0.3 }}>Command Center</h1>
        <span className="mono" style={{ fontSize: 11, color: "var(--ink-faint)" }}>· live sandbox · 8 cities</span>
      </div>
      <div style={{ marginTop: 6, fontSize: 13, color: "var(--ink-dim)", maxWidth: 720 }}>
        An open-source travel-tech KPI console built on LiteAPI&apos;s sandbox + the open-source MCP server.
        The four primary KPIs below are computed live from the API. The rest of the sidebar shows what a
        production data console for a hotel-API business would surface — locked items unlock with prod data + telemetry access.
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--ink-faint)", fontWeight: 600, marginBottom: 12 }}>{children}</div>;
}

function LockedKpi({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div style={{ background: "var(--bg-elev)", border: "1px dashed var(--line-bright)", borderRadius: 10, padding: "16px 18px", position: "relative", opacity: 0.5 }}>
      <div style={{ fontSize: 10, letterSpacing: 1.2, textTransform: "uppercase", color: "var(--ink-faint)", fontWeight: 600 }}>
        🔒 {label}
      </div>
      <div className="mono" style={{ marginTop: 8, fontSize: 28, color: "var(--ink-faint)" }}>
        {value}{unit && <span style={{ fontSize: 14, marginLeft: 4 }}>{unit}</span>}
      </div>
      <div style={{ marginTop: 6, fontSize: 10, color: "var(--ink-faint)" }}>needs prod access</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 13, borderBottom: "1px solid var(--line)" }}>
      <span style={{ color: "var(--ink-faint)" }}>{label}</span>
      <span className="mono" style={{ color: "var(--ink)" }}>{value}</span>
    </div>
  );
}

function Pill({ color, children }: { color: "ok" | "warn" | "bad"; children: React.ReactNode }) {
  const map = { ok: ["var(--accent)", "rgba(0,217,163,0.12)"], warn: ["var(--warn)", "rgba(255,179,71,0.12)"], bad: ["var(--bad)", "rgba(255,92,124,0.12)"] };
  const [fg, bg] = map[color];
  return <span style={{ background: bg, color: fg, padding: "3px 9px", borderRadius: 5, fontSize: 10, letterSpacing: 0.8, fontWeight: 600 }}>{children}</span>;
}

function median(xs: number[]): number {
  if (!xs.length) return 0;
  const sorted = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}
