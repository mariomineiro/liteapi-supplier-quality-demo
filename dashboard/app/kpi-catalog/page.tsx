"use client";
import { useMemo, useState } from "react";
import { KPIS, KPI_CATEGORIES, STATUS_META, type Kpi, type KpiStatus } from "@/lib/kpi-catalog";

export default function KpiCatalog() {
  const [category, setCategory] = useState<string>("All");
  const [status, setStatus] = useState<KpiStatus | "All">("All");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return KPIS.filter(k => {
      if (category !== "All" && k.area !== category) return false;
      if (status !== "All" && k.status !== status) return false;
      if (query && !`${k.name} ${k.description} ${k.formula}`.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [category, status, query]);

  const countsByArea = useMemo(() => {
    const m: Record<string, number> = {};
    KPIS.forEach(k => { m[k.area] = (m[k.area] || 0) + 1; });
    return m;
  }, []);

  const countsByStatus = useMemo(() => {
    const m: Record<string, number> = {};
    KPIS.forEach(k => { m[k.status] = (m[k.status] || 0) + 1; });
    return m;
  }, []);

  return (
    <div style={{ maxWidth: 1500 }}>
      <Header total={KPIS.length} categories={KPI_CATEGORIES.length} shown={filtered.length} />

      <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
        {(Object.keys(STATUS_META) as KpiStatus[]).map(s => (
          <StatusCard key={s} status={s} count={countsByStatus[s] || 0} active={status === s} onClick={() => setStatus(status === s ? "All" : s)} />
        ))}
      </div>

      <div style={{ marginTop: 22, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="search KPIs, formulas, descriptions…"
          style={{
            flex: 1, minWidth: 280, background: "var(--bg-elev)", border: "1px solid var(--line)",
            color: "var(--ink)", padding: "8px 12px", borderRadius: 6, fontSize: 13,
          }}
        />
        <select value={category} onChange={e => setCategory(e.target.value)} style={{
          background: "var(--bg-elev)", border: "1px solid var(--line)", color: "var(--ink)",
          padding: "8px 12px", borderRadius: 6, fontSize: 13,
        }}>
          <option value="All">All categories ({KPIS.length})</option>
          {KPI_CATEGORIES.map(c => (
            <option key={c} value={c}>{c} ({countsByArea[c] || 0})</option>
          ))}
        </select>
      </div>

      <div style={{ marginTop: 16, background: "var(--bg-elev)", border: "1px solid var(--line)", borderRadius: 10, overflow: "hidden" }}>
        <div style={{
          display: "grid", gridTemplateColumns: "180px 240px 1.4fr 200px 1.1fr 130px",
          gap: 10, padding: "12px 16px", fontSize: 10, letterSpacing: 1.2, color: "var(--ink-faint)",
          textTransform: "uppercase", borderBottom: "1px solid var(--line)", background: "var(--bg-elev-2)",
        }}>
          <div>business area</div><div>KPI name</div><div>description</div><div>objective</div><div>formula</div><div>status</div>
        </div>
        {filtered.length === 0 && (
          <div style={{ padding: 32, textAlign: "center", color: "var(--ink-faint)" }}>
            no KPIs match this filter
          </div>
        )}
        {filtered.map((k, i) => <Row key={i} k={k} />)}
      </div>

      <div style={{ marginTop: 24, padding: 18, background: "var(--bg-elev)", border: "1px solid var(--line)", borderRadius: 10, fontSize: 12, color: "var(--ink-dim)", lineHeight: 1.7 }}>
        <strong style={{ color: "var(--ink)" }}>How to read this catalog.</strong> Each row maps one KPI to its source endpoint
        and flags how computable it is today.{" "}
        <span style={{ color: "var(--accent)" }}>LIVE</span> = already computed in this demo from the sandbox.{" "}
        <span style={{ color: "var(--accent-blue)" }}>SANDBOX-BUILDABLE</span> = schema confirmed but not yet wired.{" "}
        <span style={{ color: "var(--warn)" }}>NEEDS PROD</span> = requires production API access or telemetry not exposed in sandbox.{" "}
        <span style={{ color: "var(--ink-dim)" }}>INDUSTRY STD</span> = standard travel KPI; source varies.
        Categories are scoped to a B2B travel-API infrastructure business — not a generic OTA / hotelier catalog.
      </div>
    </div>
  );
}

function Header({ total, categories, shown }: { total: number; categories: number; shown: number }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
        <h1 style={{ margin: 0, fontSize: 22 }}>KPI Catalog</h1>
        <span className="mono" style={{ fontSize: 11, color: "var(--ink-faint)" }}>
          · {total} KPIs · {categories} categories · {shown} shown
        </span>
      </div>
      <div style={{ marginTop: 6, fontSize: 13, color: "var(--ink-dim)", maxWidth: 760 }}>
        Comprehensive map of the KPIs a data org at a B2B travel-API platform would track. Scoped to the actual shape
        of the business (supply, pricing, booking funnel, API customer health, infrastructure, agentic / MCP, GDPR),
        not a generic OTA or hotelier catalog. Each row is filterable; each formula is concrete enough to land in dbt.
      </div>
    </div>
  );
}

function StatusCard({ status, count, active, onClick }: { status: KpiStatus; count: number; active: boolean; onClick: () => void }) {
  const meta = STATUS_META[status];
  return (
    <button onClick={onClick} style={{
      textAlign: "left", padding: "12px 14px", borderRadius: 8, cursor: "pointer",
      background: active ? "rgba(0,217,163,0.08)" : "var(--bg-elev)",
      border: `1px solid ${active ? meta.color : "var(--line)"}`,
      color: "var(--ink)",
    }}>
      <div style={{ fontSize: 10, letterSpacing: 1.2, color: meta.color, fontWeight: 700 }}>{meta.label}</div>
      <div className="mono" style={{ fontSize: 22, marginTop: 4, color: meta.color }}>{count}</div>
      <div style={{ fontSize: 11, color: "var(--ink-faint)", marginTop: 2 }}>{meta.description}</div>
    </button>
  );
}

function Row({ k }: { k: Kpi }) {
  const meta = STATUS_META[k.status];
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "180px 240px 1.4fr 200px 1.1fr 130px",
      gap: 10, padding: "12px 16px", fontSize: 13, borderBottom: "1px solid var(--line)", alignItems: "start",
    }}>
      <div style={{ color: "var(--ink-dim)", fontSize: 12 }}>{k.area}</div>
      <div style={{ color: "var(--accent-blue)", fontWeight: 500 }}>{k.name}</div>
      <div style={{ color: "var(--ink)", lineHeight: 1.5 }}>{k.description}</div>
      <div style={{ color: "var(--ink-dim)", fontSize: 12, lineHeight: 1.5 }}>{k.objective}</div>
      <div className="mono" style={{ color: "var(--accent)", fontSize: 12, lineHeight: 1.5, wordBreak: "break-word" }}>{k.formula}</div>
      <div>
        <span style={{
          fontSize: 10, padding: "3px 7px", borderRadius: 4, letterSpacing: 0.6,
          color: meta.color, background: "rgba(0,0,0,0.2)", border: `1px solid ${meta.color}`,
          display: "inline-block", fontWeight: 600,
        }}>{meta.label}</span>
        <div style={{ marginTop: 4, fontSize: 10, color: "var(--ink-faint)", fontFamily: "monospace" }}>{k.source}</div>
      </div>
    </div>
  );
}
