import { DEPARTMENTS } from "@/lib/analytics";

export default function DataLineage() {
  return (
    <div style={{ maxWidth: 1500 }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 22 }}>Data Lineage <span className="mono" style={{ fontSize: 11, color: "var(--accent)", marginLeft: 12 }}>· source → fact → mart → portal</span></h1>
        <div style={{ marginTop: 6, fontSize: 13, color: "var(--ink-dim)", maxWidth: 800 }}>
          Every KPI on this portal traces back to its source. Click a column header to follow the chain.
        </div>
      </div>

      <Stage label="1 · Sources" caption="raw signals · 8 systems · streaming + batch" colour="var(--ink-dim)">
        <SourceGrid items={[
          { name: "LiteAPI REST", desc: "/data/hotels · /hotels/rates · /bookings · /data/hotel", tag: "EXTERNAL API" },
          { name: "LiteAPI MCP", desc: "open-source mcp-server · session-tagged calls", tag: "EXTERNAL API" },
          { name: "Stripe webhooks", desc: "billing.* events for partner SaaS-tier", tag: "WEBHOOK" },
          { name: "Partner CRM", desc: "Salesforce sync · partner_id, contract_terms", tag: "BATCH" },
          { name: "Booking events", desc: "Kafka · search → shop → book → confirm", tag: "STREAM" },
          { name: "Support tickets", desc: "Zendesk JSON dump · NPS/CSAT scoring", tag: "BATCH" },
          { name: "Infra logs", desc: "Cloudflare + Vercel + API logs", tag: "STREAM" },
          { name: "Marketing", desc: "GA4 · Adwords · LinkedIn campaign API", tag: "BATCH" },
        ]} />
      </Stage>

      <Arrow />

      <Stage label="2 · Landing (raw)" caption="bronze layer · DWH · partitioned by ingest date" colour="var(--accent-blue)">
        <SourceGrid items={[
          { name: "raw_bookings", desc: "Kafka → BigQuery via Cloud Composer · 5min lag", tag: "bronze" },
          { name: "raw_hotels_snapshot", desc: "Daily snapshot from /data/hotels · 3M rows", tag: "bronze" },
          { name: "raw_rates_history", desc: "Hourly rates poll · price-parity ground truth", tag: "bronze" },
          { name: "raw_partner_events", desc: "All partner-side activity · session-tagged", tag: "bronze" },
          { name: "raw_mcp_traces", desc: "MCP middleware logs · tool, latency, status", tag: "bronze" },
          { name: "raw_tickets", desc: "Zendesk daily dump · ticket lifecycle", tag: "bronze" },
        ]} />
      </Stage>

      <Arrow />

      <Stage label="3 · Curated (silver) — dbt models" caption="cleaned · typed · partitioned · documented · tested" colour="var(--warn)">
        <SourceGrid items={[
          { name: "dim_hotel", desc: "Master hotel dim · joins LiteAPI + cross-source rohId", tag: "dbt" },
          { name: "dim_partner", desc: "API customer dim · concentration buckets", tag: "dbt" },
          { name: "fact_bookings", desc: "1 row per booking · price, commission, status", tag: "dbt" },
          { name: "fact_rates", desc: "1 row per rate quote · supplier, board, price", tag: "dbt" },
          { name: "fact_mcp_calls", desc: "1 row per MCP tool call · tool, latency_ms, status", tag: "dbt" },
          { name: "fact_industry_daily", desc: "agg fact · revenue/sessions/users/events per day", tag: "dbt" },
        ]} />
      </Stage>

      <Arrow />

      <Stage label="4 · Marts (gold)" caption="department-shaped · what dashboards consume" colour="var(--accent)">
        <SourceGrid items={DEPARTMENTS.map(d => ({
          name: d.file.replace(/-/g, "_") + ".csv",
          desc: `${d.label} · daily values · 11 cols`,
          tag: "mart · gold",
        }))} />
      </Stage>

      <Arrow />

      <Stage label="5 · Portal · what you see now" caption="Next.js dashboard · this site" colour="var(--accent-blue)">
        <SourceGrid items={[
          { name: "Command Center", desc: "Live KPIs from LiteAPI sandbox + 8-dept rollup", tag: "/" },
          { name: "Daily 360° Overview", desc: "fact_industry_daily_travel · all 8 departments", tag: "/daily-360" },
          { name: "Departments", desc: "one mart per department · drill-in to all KPIs", tag: "/departments" },
          { name: "KPI Catalog", desc: "98 KPIs · 13 categories · formula + source per row", tag: "/kpi-catalog" },
          { name: "Supply Quality / Pricing", desc: "live LiteAPI · per-city · sortable + filterable", tag: "/supply-quality" },
          { name: "MCP Funnel & Latency", desc: "agentic differentiator · mocked, prod-ready", tag: "/mcp/*" },
        ]} />
      </Stage>

      <div style={{ marginTop: 24, padding: 16, background: "var(--bg-elev)", border: "1px solid var(--line)", borderRadius: 10, fontSize: 12, color: "var(--ink-dim)", lineHeight: 1.7 }}>
        <strong style={{ color: "var(--ink)" }}>Read the chain:</strong> a number you see on the portal came from a curated dbt model
        that read from a typed landing table that ingested raw events from a named source system. Every link is documented and tested
        on the production stack; here we ship the JSON snapshots compiled at build time.
      </div>
    </div>
  );
}

function Stage({ label, caption, colour, children }: { label: string; caption: string; colour: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "var(--bg-elev)", border: `1px solid var(--line)`, borderLeft: `3px solid ${colour}`, borderRadius: 10, padding: 16, marginBottom: 4 }}>
      <div style={{ fontSize: 11, letterSpacing: 1.4, textTransform: "uppercase", fontWeight: 700, color: colour }}>{label}</div>
      <div style={{ fontSize: 12, color: "var(--ink-faint)", marginTop: 2, marginBottom: 12 }}>{caption}</div>
      {children}
    </div>
  );
}

function Arrow() {
  return (
    <div style={{ textAlign: "center", padding: "6px 0", color: "var(--ink-faint)", fontSize: 16 }}>↓</div>
  );
}

function SourceGrid({ items }: { items: { name: string; desc: string; tag: string }[] }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
      {items.map((it, i) => (
        <div key={i} style={{ background: "var(--bg-elev-2)", border: "1px solid var(--line)", borderRadius: 6, padding: "10px 12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
            <div className="mono" style={{ color: "var(--ink)", fontSize: 12, fontWeight: 600 }}>{it.name}</div>
            <div style={{ fontSize: 9, letterSpacing: 0.6, color: "var(--ink-faint)", textTransform: "uppercase", fontFamily: "monospace" }}>{it.tag}</div>
          </div>
          <div style={{ fontSize: 11, color: "var(--ink-dim)", marginTop: 4, lineHeight: 1.4 }}>{it.desc}</div>
        </div>
      ))}
    </div>
  );
}
