"use client";
import { useState } from "react";
import { Sparkline } from "@/components/charts";
import InfoTip from "@/components/info-tip";

type AgentMsg = { role: "user" | "agent"; text: string; tools?: { tool: string; ms: number; status: "ok" | "warn" }[]; result?: any };

const SAMPLE_CONVERSATIONS: { title: string; msgs: AgentMsg[] }[] = [
  {
    title: "Find a cheaper flight than what I had booked",
    msgs: [
      { role: "user", text: "I had a 6h connection in Madrid on my LIS→JFK ticket. Find me something better, cheaper if possible, same Sep 14 outbound." },
      { role: "agent", text: "Reading your prior booking via /bookings, pulling 12 alt routes via /flights, cross-checking prices against /hotels/rates impact on layover.",
        tools: [
          { tool: "/bookings/{id}", ms: 92, status: "ok" },
          { tool: "/flights/search", ms: 314, status: "ok" },
          { tool: "/flights/compare", ms: 278, status: "ok" },
        ]},
      { role: "agent", text: "Best 3 options found. TAP via LIS→LIS-EWR direct (10h25m, €642) saves €112 and 4h vs your current routing. Want me to rebook? I'll keep your seat selection and meal preference.",
        result: { saved: "€112", time: "−4h", confidence: 0.94 } },
    ],
  },
  {
    title: "Hotel within walking distance of Westminster, sea-view-equivalent in London, my usual price range",
    msgs: [
      { role: "user", text: "Westminster area, walking distance to the office, view if possible, around what I usually spend." },
      { role: "agent", text: "Pulling your last 6 London stays, median €218/n. Searching radius 800m from Westminster Abbey via /search + scoring against /data/hotel content (river-view tags).",
        tools: [
          { tool: "/bookings/list?customer=mario&city=London", ms: 67, status: "ok" },
          { tool: "/search", ms: 156, status: "ok" },
          { tool: "/data/hotel × 14", ms: 422, status: "warn" },
          { tool: "/hotels/rates × 14", ms: 489, status: "warn" },
        ]},
      { role: "agent", text: "3 candidates ranked by your stay history + content quality + price spread. Park Plaza Westminster Bridge (€224, 4-min walk, Thames-side rooms confirmed via photo 47/64). Want it?",
        result: { matches: 3, top: "Park Plaza Westminster Bridge · €224 · 0.98 score", confidence: 0.91 } },
    ],
  },
  {
    title: "Why are bookings down 8% this week in Barcelona?",
    msgs: [
      { role: "user", text: "Booking volume dropped 8% in Barcelona vs last week. Help me figure out why before standup." },
      { role: "agent", text: "Hitting fact_bookings, dim_hotel, fact_rates for Barcelona for last 14d. Cross-checking supplier health + competitor scrape + holiday calendar.",
        tools: [
          { tool: "BigQuery · fact_bookings", ms: 612, status: "ok" },
          { tool: "BigQuery · fact_rates", ms: 488, status: "ok" },
          { tool: "BigQuery · dim_hotel", ms: 134, status: "ok" },
          { tool: "scrape · competitor", ms: 1124, status: "warn" },
        ]},
      { role: "agent", text: "Found it. Competitor undercut by 14% on 23 mid-segment hotels Wed–Fri (89% of the gap). Inventory and supplier health are fine. Rate-parity team got pinged.",
        result: { rootCause: "competitor undercut · 23 hotels · 89% of gap explained", confidence: 0.88 } },
    ],
  },
];

export default function AgenticTravel() {
  const [active, setActive] = useState(0);
  const conv = SAMPLE_CONVERSATIONS[active];

  return (
    <div style={{ maxWidth: 1500 }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
          <h1 style={{ margin: 0, fontSize: 22 }}>Agentic Travel</h1>
          <span style={{ fontSize: 11, padding: "3px 8px", background: "rgba(77,155,255,0.2)", color: "var(--accent-blue)", borderRadius: 4 }}>NORTH-STAR VIEW</span>
        </div>
        <div style={{ marginTop: 6, fontSize: 13, color: "var(--ink-dim)", maxWidth: 800 }}>
          Most future bookings won&apos;t come from a human typing into a search box. They&apos;ll come from an agent acting on a person&apos;s
          instructions: &quot;find me a cheaper flight with my params&quot;, &quot;rebook this with a shorter layover&quot;, &quot;hotel like my last one&quot;.
          That&apos;s why LiteAPI open-sourced an MCP server before anyone else. This page is the data view of that world.
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 22 }}>
        <Stat label="Agent share of bookings (proj.)" value="22%" accent="ok" sparkline={[4, 6, 8, 10, 13, 17, 22]}
          source="MCP traces × bookings" formula="agent_bookings / total_bookings × 100"
          why="The metric that defines the next 5 years. Today 22% is plausible projection given MCP adoption curves; in 2 years it&apos;s the headline." />
        <Stat label="Agent intent → book" value="14.6%" accent="ok" sparkline={[7, 8, 9, 11, 12, 13.5, 14.6]}
          source="MCP session × bookings" formula="agent_bookings / agent_search_sessions × 100"
          why="Agents convert higher than humans (humans 8.2%) because they don't window-shop." />
        <Stat label="Avg agent session length" value="3.4 tools"
          source="MCP middleware" formula="mean(distinct mcp_tools per session)"
          why="Agentic workflows chain tools. Longer = richer use of the API surface." />
        <Stat label="Top agent · source" value="Anthropic · Claude" accent="ok"
          source="MCP session metadata" formula="argmax(session_count) by agent_id"
          why="Where the traffic comes from. Knowing the mix lets you co-design API features with the leading agent stack." />
      </div>

      <div style={{ background: "var(--bg-elev)", border: "1px solid var(--line)", borderRadius: 10, padding: 18, marginBottom: 18 }}>
        <div style={{ fontSize: 11, letterSpacing: 1.2, color: "var(--ink-faint)", textTransform: "uppercase", marginBottom: 12 }}>Sample agentic flows · pick one</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {SAMPLE_CONVERSATIONS.map((c, i) => (
            <button key={i} onClick={() => setActive(i)} style={{
              padding: "8px 14px", borderRadius: 999, fontSize: 12,
              background: i === active ? "rgba(0,217,163,0.12)" : "var(--bg-elev-2)",
              border: `1px solid ${i === active ? "var(--accent-dim)" : "var(--line)"}`,
              color: i === active ? "var(--accent)" : "var(--ink-dim)",
              cursor: "pointer",
            }}>
              {c.title}
            </button>
          ))}
        </div>
      </div>

      <Conversation msgs={conv.msgs} />

      <ApiSurface />
    </div>
  );
}

function Conversation({ msgs }: { msgs: AgentMsg[] }) {
  return (
    <div style={{ background: "var(--bg-elev)", border: "1px solid var(--line)", borderRadius: 10, padding: 18, marginBottom: 18 }}>
      <div style={{ fontSize: 11, letterSpacing: 1.2, color: "var(--ink-faint)", textTransform: "uppercase", marginBottom: 12 }}>Agent trace</div>
      {msgs.map((m, i) => (
        <div key={i} style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, color: m.role === "user" ? "var(--accent-blue)" : "var(--accent)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>
            {m.role === "user" ? "🧑 User" : "🤖 Agent"}
          </div>
          <div style={{ fontSize: 13, color: "var(--ink)", lineHeight: 1.6, paddingLeft: 14, borderLeft: `2px solid ${m.role === "user" ? "var(--accent-blue)" : "var(--accent)"}` }}>
            {m.text}
          </div>
          {m.tools && (
            <div style={{ marginTop: 8, marginLeft: 14, fontSize: 11, color: "var(--ink-faint)" }}>
              <div style={{ fontSize: 10, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>MCP tool calls</div>
              {m.tools.map((t, ti) => (
                <div key={ti} className="mono" style={{ display: "flex", gap: 10, padding: "3px 0" }}>
                  <span style={{ color: t.status === "ok" ? "var(--accent)" : "var(--warn)" }}>{t.status === "ok" ? "✓" : "⚠"}</span>
                  <span style={{ color: "var(--accent-blue)" }}>{t.tool}</span>
                  <span style={{ color: "var(--ink-faint)" }}>{t.ms}ms</span>
                </div>
              ))}
            </div>
          )}
          {m.result && (
            <div style={{ marginTop: 8, marginLeft: 14, padding: 10, background: "rgba(0,217,163,0.06)", border: "1px solid var(--accent-dim)", borderRadius: 6, fontSize: 12, color: "var(--ink)" }}>
              <span className="mono" style={{ color: "var(--accent)", fontSize: 11 }}>RESULT</span>
              {Object.entries(m.result).map(([k, v]) => (
                <div key={k} className="mono" style={{ fontSize: 12, color: "var(--ink-dim)", marginTop: 4 }}><span style={{ color: "var(--ink-faint)" }}>{k}:</span> <span style={{ color: "var(--ink)" }}>{String(v)}</span></div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function Stat({ label, value, accent, sparkline, source, formula, why }: { label: string; value: string; accent?: "ok"; sparkline?: number[]; source?: string; formula?: string; why?: string }) {
  const color = accent === "ok" ? "var(--accent)" : "var(--ink)";
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

function ApiSurface() {
  const tools = [
    { name: "/search", role: "Find inventory by location, dates, occupancy", agentic: true },
    { name: "/data/hotel", role: "Read enriched property detail · photos, sentiment, room types", agentic: true },
    { name: "/hotels/rates", role: "Get live rates with supplier, board, take-rate", agentic: true },
    { name: "/bookings", role: "Create + retrieve · idempotent · supports retry-on-failure", agentic: true },
    { name: "/flights/search", role: "Air inventory · added to MCP in April 2026", agentic: true },
    { name: "/vouchers", role: "Apply discounts · respect partner-side promo rules", agentic: true },
    { name: "/loyalty", role: "Loyalty program lookup · respect tier-specific rates", agentic: true },
    { name: "/static", role: "Reference data · countries, currencies, board codes", agentic: false },
  ];
  return (
    <div style={{ background: "var(--bg-elev)", border: "1px solid var(--line)", borderRadius: 10, padding: 18 }}>
      <div style={{ fontSize: 13, color: "var(--ink)", fontWeight: 600, marginBottom: 4 }}>Why the MCP server is the differentiator</div>
      <div style={{ fontSize: 12, color: "var(--ink-dim)", marginBottom: 14 }}>
        Each tool in <code className="mono" style={{ color: "var(--accent-blue)" }}>liteapi-travel/mcp-server</code> maps the REST API into something an agent can call deterministically.
        The shape — search → enrich → price → book — is exactly how an autonomous travel agent thinks. No competitor exposes this.
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
        {tools.map((t, i) => (
          <div key={i} style={{ display: "flex", gap: 10, padding: "8px 12px", background: "var(--bg-elev-2)", borderRadius: 6, alignItems: "center" }}>
            <span style={{ fontSize: 14 }}>{t.agentic ? "🤖" : "📚"}</span>
            <div>
              <div className="mono" style={{ fontSize: 12, color: "var(--accent-blue)" }}>{t.name}</div>
              <div style={{ fontSize: 11, color: "var(--ink-dim)", marginTop: 2 }}>{t.role}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
