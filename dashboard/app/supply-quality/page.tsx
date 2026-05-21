import CitySwitcher from "@/components/city-switcher";
import { loadQuality } from "@/lib/data";

// Dynamic so the ?city= switcher re-renders the server component on click
export const dynamic = "force-dynamic";

type SearchProps = { searchParams: Promise<{ city?: string }> };

export default async function SupplyQuality({ searchParams }: SearchProps) {
  const { city = "pt-lisbon" } = await searchParams;
  const snap = await loadQuality(city);
  const top = snap.rows[0];
  const bottom = snap.rows[snap.rows.length - 1];
  const avgContent = (snap.rows.reduce((s, r) => s + r.content_completeness, 0) / snap.rows.length).toFixed(1);
  const avgFacilities = (snap.rows.reduce((s, r) => s + r.facility_count, 0) / snap.rows.length).toFixed(0);

  return (
    <div style={{ maxWidth: 1400 }}>
      <h1 style={{ margin: 0, fontSize: 22 }}>Supply Quality <span style={{ fontSize: 12, color: "var(--ink-faint)" }} className="mono">· live · {snap.meta.city}, {snap.meta.country} · n={snap.meta.sample_size}</span></h1>
      <p style={{ color: "var(--ink-dim)", fontSize: 13, marginTop: 6, maxWidth: 760 }}>
        Per-hotel content scorecard computed from <code className="mono" style={{ color: "var(--accent-blue)" }}>GET /data/hotels</code> on the live LiteAPI sandbox. Composite = 60% content completeness + 20% review depth + 20% facility richness.
      </p>

      <CitySwitcher basePath="/supply-quality" />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 22 }}>
        <Stat label="hotels" value={snap.rows.length.toString()} />
        <Stat label="avg content %" value={`${avgContent}%`} accent />
        <Stat label="avg facilities / hotel" value={avgFacilities} />
        <Stat label="best vs worst gap" value={`${(top.overall_quality_score - bottom.overall_quality_score).toFixed(1)} pts`} />
      </div>

      <Table rows={snap.rows} />
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div style={{ background: "var(--bg-elev)", border: "1px solid var(--line)", borderRadius: 10, padding: "14px 18px" }}>
      <div style={{ fontSize: 10, letterSpacing: 1.2, textTransform: "uppercase", color: "var(--ink-faint)" }}>{label}</div>
      <div className="mono" style={{ fontSize: 22, marginTop: 6, color: accent ? "var(--accent)" : "var(--ink)" }}>{value}</div>
    </div>
  );
}

function Table({ rows }: { rows: any[] }) {
  return (
    <div style={{ background: "var(--bg-elev)", border: "1px solid var(--line)", borderRadius: 10, overflow: "hidden" }}>
      <div style={{
        display: "grid", gridTemplateColumns: "40px 1.7fr 80px 80px 90px 90px 90px 90px 90px",
        gap: 8, padding: "10px 14px", fontSize: 10, letterSpacing: 1.2, color: "var(--ink-faint)", textTransform: "uppercase", borderBottom: "1px solid var(--line)",
      }}>
        <div>#</div><div>hotel</div><div>stars</div><div>content</div><div>desc chars</div><div>facilities</div><div>reviews</div><div>geo</div><div className="mono" style={{ textAlign: "right" }}>overall</div>
      </div>
      {rows.map((r, i) => (
        <div key={r.hotel_id || i} style={{
          display: "grid", gridTemplateColumns: "40px 1.7fr 80px 80px 90px 90px 90px 90px 90px",
          gap: 8, padding: "9px 14px", fontSize: 13, borderBottom: "1px solid var(--line)", alignItems: "center",
        }}>
          <div className="mono" style={{ color: "var(--ink-faint)" }}>{i + 1}</div>
          <div style={{ color: "var(--ink)" }}>{r.name}<span style={{ color: "var(--ink-faint)" }}>{r.chain ? `  ·  ${r.chain}` : ""}</span></div>
          <div className="mono" style={{ color: "var(--ink-dim)" }}>{r.stars ?? "—"}</div>
          <div className="mono" style={{ color: r.content_completeness >= 80 ? "var(--accent)" : r.content_completeness >= 50 ? "var(--warn)" : "var(--bad)" }}>{r.content_completeness}%</div>
          <div className="mono" style={{ color: "var(--ink-dim)" }}>{r.description_chars}</div>
          <div className="mono" style={{ color: "var(--ink-dim)" }}>{r.facility_count}</div>
          <div className="mono" style={{ color: "var(--ink-dim)" }}>{r.review_count.toLocaleString()}</div>
          <div className="mono" style={{ color: r.has_geo ? "var(--accent)" : "var(--bad)" }}>{r.has_geo ? "✓" : "✗"}</div>
          <div className="mono" style={{ textAlign: "right", fontWeight: 700, color: "var(--accent)" }}>{r.overall_quality_score}%</div>
        </div>
      ))}
    </div>
  );
}
