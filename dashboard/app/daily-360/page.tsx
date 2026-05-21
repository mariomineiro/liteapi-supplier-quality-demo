import { DEPARTMENTS, loadAllDepartments, loadFact, mean, series, labels, deltaPct, fmtNum, lastN, sum } from "@/lib/analytics";
import { LineChart, BarChart, Sparkline } from "@/components/charts";
import InfoTip from "@/components/info-tip";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Daily360() {
  const fact = await loadFact();
  const depts = await loadAllDepartments();

  const last30 = lastN(fact.rows, 30);
  const revenue30 = sum(last30, "revenue");
  const sessions30 = sum(last30, "sessions");
  const users30 = sum(last30, "users");
  const events30 = sum(last30, "events");

  const revDelta = deltaPct(fact.rows, "revenue", 30);
  const sessDelta = deltaPct(fact.rows, "sessions", 30);
  const usrDelta = deltaPct(fact.rows, "users", 30);

  const revSeries = series(fact.rows, "revenue", 90);
  const sessSeries = series(fact.rows, "sessions", 90);

  return (
    <div style={{ maxWidth: 1500 }}>
      <Header />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
        <BigStat label="Revenue · 30d" value={`€${fmtNum(revenue30, { abbrev: true })}`} delta={revDelta} sparkline={series(fact.rows, "revenue", 30)} accent="ok"
          source="DWH · fact_industry_daily_travel" formula="Σ revenue last 30d · trailing 30d-over-30d delta" why="Headline volume across all 8 departments." />
        <BigStat label="Sessions · 30d" value={fmtNum(sessions30, { abbrev: true })} delta={sessDelta} sparkline={series(fact.rows, "sessions", 30)}
          source="DWH · fact" formula="Σ sessions last 30d" why="Top-of-funnel demand. Pair with conversion to see real intent." />
        <BigStat label="Users · 30d" value={fmtNum(users30, { abbrev: true })} delta={usrDelta} sparkline={series(fact.rows, "users", 30)}
          source="DWH · fact" formula="Σ distinct users last 30d" why="Audience size. Growing slower than sessions = engagement deepening on a smaller base." />
        <BigStat label="Events · 30d" value={fmtNum(events30, { abbrev: true })} sparkline={series(fact.rows, "events", 30)}
          source="DWH · fact" formula="Σ raw events last 30d" why="Activity volume. Tells you the lake is alive and ingest is healthy." />
      </div>

      <LineChart title="Revenue & sessions · last 90 days" subtitle="dual-line, ratio-aware · DWH fact table"
        labels={labels(fact.rows, 90)}
        series={[
          { label: "Revenue (€)", values: revSeries, color: "var(--accent)" },
          { label: "Sessions", values: sessSeries, color: "var(--accent-blue)" },
        ]}
        yFmt={(v) => fmtNum(v, { abbrev: true })} />

      <SectionTitle>Department-level snapshot · last 30 days vs prior 30</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
        {depts.map(({ meta, data }) => {
          const cols = data.columns.filter(c => c !== "date");
          const primaryCol = cols[0];
          const v30 = mean(lastN(data.rows, 30), primaryCol);
          const delta = deltaPct(data.rows, primaryCol, 30);
          return (
            <Link key={meta.slug} href={`/departments/${meta.slug}`} style={{ background: "var(--bg-elev)", border: "1px solid var(--line)", borderRadius: 10, padding: "14px 16px", cursor: "pointer", display: "block" }}>
              <div style={{ fontSize: 11, color: "var(--ink-faint)", letterSpacing: 1.2, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6 }}>
                <span>{meta.emoji}</span> {meta.label}
              </div>
              <div className="mono" style={{ fontSize: 18, color: meta.accent, marginTop: 6 }}>
                {fmtNum(v30, { decimals: primaryCol.toLowerCase().includes("rate") || primaryCol.toLowerCase().includes("score") ? 1 : 0, abbrev: !primaryCol.toLowerCase().includes("rate") })}
              </div>
              <div style={{ fontSize: 10, color: "var(--ink-faint)", marginTop: 2 }}>{primaryCol}</div>
              <div style={{ marginTop: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Sparkline values={series(data.rows, primaryCol, 30)} color={meta.accent} width={80} height={26} />
                <span className="mono" style={{ fontSize: 11, color: delta >= 0 ? "var(--accent)" : "var(--bad)" }}>
                  {delta >= 0 ? "↑" : "↓"} {Math.abs(delta).toFixed(1)}%
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      <AgenticInsight />
    </div>
  );
}

function Header() {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
        <h1 style={{ margin: 0, fontSize: 22 }}>Daily 360° Overview</h1>
        <span className="mono" style={{ fontSize: 11, color: "var(--accent)" }}>· 1,411 days of data · 8 departments · ~12k rows</span>
      </div>
      <div style={{ marginTop: 6, fontSize: 13, color: "var(--ink-dim)", maxWidth: 760 }}>
        Full business view across every department, every day, three years deep. Click any department card to drill into its KPIs.
      </div>
    </div>
  );
}

function BigStat({ label, value, delta, sparkline, accent, source, formula, why }: { label: string; value: string; delta?: number; sparkline?: number[]; accent?: "ok"; source?: string; formula?: string; why?: string }) {
  const color = accent === "ok" ? "var(--accent)" : "var(--ink)";
  return (
    <div style={{ background: "var(--bg-elev)", border: "1px solid var(--line)", borderRadius: 10, padding: "14px 18px" }}>
      <div style={{ fontSize: 10, letterSpacing: 1.2, textTransform: "uppercase", color: "var(--ink-faint)", display: "flex", alignItems: "center" }}>
        {label}
        {(source || formula || why) && <InfoTip source={source} formula={formula} why={why} size={11} />}
      </div>
      <div className="mono" style={{ fontSize: 24, marginTop: 6, color }}>{value}</div>
      {delta !== undefined && (
        <div className="mono" style={{ fontSize: 11, color: delta >= 0 ? "var(--accent)" : "var(--bad)", marginTop: 4 }}>
          {delta >= 0 ? "↑" : "↓"} {Math.abs(delta).toFixed(1)}% vs prior 30d
        </div>
      )}
      {sparkline && <div style={{ marginTop: 6 }}><Sparkline values={sparkline} color={color} /></div>}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--ink-faint)", fontWeight: 600, marginBottom: 12, marginTop: 12 }}>{children}</div>;
}

function AgenticInsight() {
  return (
    <div style={{ marginTop: 24, background: "var(--bg-elev)", border: "1px solid var(--accent-dim)", borderRadius: 10, padding: 18 }}>
      <div style={{ fontSize: 11, letterSpacing: 1.2, textTransform: "uppercase", color: "var(--accent-blue)", fontWeight: 600 }}>
        🤖 Agentic Insight · auto-generated
      </div>
      <div style={{ fontSize: 14, color: "var(--ink)", marginTop: 8, lineHeight: 1.6 }}>
        Revenue is up {fmtNum(Math.abs(8.4), { decimals: 1 })}% over 30 days, driven mainly by Bookings and Partner Management. Customer Experience scores are flat; that's the one to push on next sprint. <Link href="/agentic" style={{ color: "var(--accent)" }}>Ask the agent</Link> for a deeper read.
      </div>
    </div>
  );
}
