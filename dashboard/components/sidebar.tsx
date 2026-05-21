"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Item = { href: string; label: string; locked?: boolean; badge?: string };
type Group = { title?: string; items: Item[] };

const NAV: Group[] = [
  {
    items: [
      { href: "/", label: "Command Center" },
    ],
  },
  {
    title: "Agentic · MCP (north star)",
    items: [
      { href: "/agentic", label: "Agentic Travel", badge: "VISION" },
      { href: "/mcp/funnel", label: "Agent vs Human Funnel", badge: "DIFF" },
      { href: "/mcp/tool-latency", label: "MCP Tool-call Latency", badge: "DIFF" },
    ],
  },
  {
    title: "Business 360",
    items: [
      { href: "/daily-360", label: "Daily 360° Overview", badge: "LIVE" },
      { href: "/departments", label: "Departments", badge: "LIVE" },
      { href: "/kpi-catalog", label: "KPI Catalog", badge: "DICT" },
      { href: "/data-lineage", label: "Data Lineage", badge: "LIVE" },
      { href: "/health-quality", label: "Health & Quality", badge: "LIVE" },
      { href: "/alerts", label: "Critical Alerts", badge: "LIVE" },
      { href: "/ask", label: "Ask LiteAPI (NLQ)", locked: true },
    ],
  },
  {
    title: "Operations",
    items: [
      { href: "/supply-quality", label: "Supply Quality", badge: "LIVE" },
      { href: "/pricing", label: "Pricing & Take-Rate", badge: "LIVE" },
      { href: "/bookings", label: "Bookings", badge: "MOCK" },
      { href: "/customers", label: "Customers", badge: "MOCK" },
      { href: "/commission", label: "Commission", locked: true },
      { href: "/property-mapping", label: "Property Mapping", locked: true },
      { href: "/supply-coverage-map", label: "Supply Coverage Map", badge: "MOCK" },
      { href: "/price-check", label: "Price Check", locked: true, badge: "NEW" },
      { href: "/direct-connections", label: "Direct Connections", locked: true },
    ],
  },
  {
    title: "Flights",
    items: [
      { href: "/flights/search", label: "Flight Search", locked: true },
      { href: "/flights/bookings", label: "Flight Bookings", locked: true },
    ],
  },
  {
    title: "Payments",
    items: [
      { href: "/earnings", label: "Earnings", badge: "MOCK" },
      { href: "/billing", label: "Billing & Services", locked: true },
    ],
  },
  {
    title: "Analytics · Reports",
    items: [
      { href: "/reports/ai-recommendations", label: "AI Recommendations", locked: true },
      { href: "/reports/earnings", label: "Earnings", locked: true },
      { href: "/reports/distributions", label: "Distributions", locked: true },
      { href: "/reports/customer-analysis", label: "Customer Analysis", locked: true },
      { href: "/reports/destinations", label: "Destinations", badge: "MOCK" },
    ],
  },
];

export default function Sidebar() {
  const path = usePathname();
  return (
    <aside style={{
      width: 250, minHeight: "100vh", background: "var(--bg-elev)",
      borderRight: "1px solid var(--line)", padding: "20px 0",
      position: "sticky", top: 0, alignSelf: "flex-start",
      fontSize: 13, maxHeight: "100vh", overflowY: "auto",
    }}>
      <div style={{ padding: "0 18px 14px", borderBottom: "1px solid var(--line)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{
            display: "inline-block", width: 22, height: 22, borderRadius: 5,
            background: "linear-gradient(135deg, var(--brand) 0%, var(--brand-bright) 100%)",
            color: "#fff", fontSize: 13, fontWeight: 700, textAlign: "center", lineHeight: "22px",
          }}>L</span>
          <div>
            <div style={{ fontWeight: 700, letterSpacing: 0.3, fontSize: 14, color: "var(--ink)" }}>
              LiteAPI Command
            </div>
            <div className="mono" style={{ fontSize: 9, color: "var(--ink-faint)", marginTop: 1, letterSpacing: 1.2 }}>
              <span style={{ color: "var(--warn)", background: "rgba(255,179,71,0.15)", padding: "1px 5px", borderRadius: 3, fontWeight: 700 }}>DEMO</span>
              {" "}· built on the sandbox
            </div>
          </div>
        </div>
      </div>

      {NAV.map((g, gi) => (
        <div key={gi} style={{ padding: "10px 0 4px" }}>
          {g.title && (
            <div style={{
              padding: "8px 18px 4px",
              fontSize: 10, letterSpacing: 1.2, textTransform: "uppercase",
              color: "var(--ink-faint)", fontWeight: 600,
            }}>{g.title}</div>
          )}
          {g.items.map((it) => {
            const active = path === it.href;
            return (
              <Link key={it.href} href={it.href} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "7px 18px", margin: "1px 0",
                color: active ? "var(--brand-bright)" : (it.locked ? "var(--ink-faint)" : "var(--ink-dim)"),
                background: active ? "rgba(92,58,175,0.14)" : "transparent",
                borderLeft: active ? "2px solid var(--brand)" : "2px solid transparent",
                cursor: it.locked ? "not-allowed" : "pointer",
              }}>
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {it.locked && <span style={{ fontSize: 10 }}>🔒</span>}
                  {it.label}
                </span>
                {it.badge && <Badge kind={it.badge} />}
              </Link>
            );
          })}
        </div>
      ))}

      <div style={{
        marginTop: 24, padding: "16px 18px", borderTop: "1px solid var(--line)",
        fontSize: 11, color: "var(--ink-faint)",
      }}>
        <div className="mono" style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span className="pulse" style={{
            display: "inline-block", width: 6, height: 6, borderRadius: "50%",
            background: "var(--accent)",
          }} />
          live · LiteAPI sandbox
        </div>
        <div style={{ marginTop: 8 }}>
          <a href="https://github.com/mariomineiro/liteapi-supplier-quality-demo" style={{ color: "var(--ink-dim)", textDecoration: "underline" }}>source</a>
          {" · "}
          <a href="https://liteapi.travel" style={{ color: "var(--ink-dim)", textDecoration: "underline" }}>liteapi.travel</a>
        </div>
      </div>
    </aside>
  );
}

function Badge({ kind }: { kind: string }) {
  const map: Record<string, { bg: string; fg: string }> = {
    LIVE:   { bg: "rgba(7,148,85,0.18)",   fg: "var(--accent)" },
    DIFF:   { bg: "rgba(92,58,175,0.22)",  fg: "var(--brand-bright)" },
    DICT:   { bg: "rgba(21,101,192,0.18)", fg: "var(--accent-blue)" },
    MOCK:   { bg: "rgba(180,180,180,0.10)", fg: "var(--ink-dim)" },
    NEW:    { bg: "rgba(255,179,71,0.18)", fg: "var(--warn)" },
    VISION: { bg: "linear-gradient(90deg, rgba(92,58,175,0.3), rgba(21,101,192,0.3))", fg: "var(--brand-bright)" },
  };
  const c = map[kind] || map.LIVE;
  return (
    <span style={{
      fontSize: 9, padding: "2px 6px", borderRadius: 4, letterSpacing: 0.5,
      background: c.bg, color: c.fg, fontWeight: 700,
    }}>{kind}</span>
  );
}
