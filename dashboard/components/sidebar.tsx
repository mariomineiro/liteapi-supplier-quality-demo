"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Item = { href: string; label: string; locked?: boolean; badge?: string };
type Group = { title?: string; items: Item[] };

const NAV: Group[] = [
  {
    items: [
      { href: "/", label: "Command Center" },
      { href: "/kpi-catalog", label: "KPI Catalog", badge: "DICT" },
      { href: "/ask", label: "Ask LiteAPI", locked: true },
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
  {
    title: "Agentic · MCP",
    items: [
      { href: "/mcp/tool-latency", label: "Tool-call Latency", badge: "DIFF" },
      { href: "/mcp/funnel", label: "Agent vs Human Funnel", badge: "DIFF" },
    ],
  },
];

export default function Sidebar() {
  const path = usePathname();
  return (
    <aside style={{
      width: 244, minHeight: "100vh", background: "var(--bg-elev)",
      borderRight: "1px solid var(--line)", padding: "20px 0",
      position: "sticky", top: 0, alignSelf: "flex-start",
      fontSize: 13,
    }}>
      <div style={{ padding: "0 18px 14px", borderBottom: "1px solid var(--line)" }}>
        <div style={{ fontWeight: 700, letterSpacing: 0.5, fontSize: 15, color: "var(--ink)" }}>
          <span style={{ color: "var(--accent)" }}>◆</span> LiteAPI Command
        </div>
        <div style={{ fontSize: 11, color: "var(--ink-faint)", marginTop: 4 }} className="mono">
          v0.13 · sandbox · 2050-mode
        </div>
      </div>

      {NAV.map((g, gi) => (
        <div key={gi} style={{ padding: "12px 0 4px" }}>
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
                color: active ? "var(--accent)" : (it.locked ? "var(--ink-faint)" : "var(--ink-dim)"),
                background: active ? "rgba(0,217,163,0.08)" : "transparent",
                borderLeft: active ? "2px solid var(--accent)" : "2px solid transparent",
                cursor: it.locked ? "not-allowed" : "pointer",
              }}>
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {it.locked && <span style={{ fontSize: 10 }}>🔒</span>}
                  {it.label}
                </span>
                {it.badge && (
                  <span style={{
                    fontSize: 9, padding: "2px 6px", borderRadius: 4, letterSpacing: 0.5,
                    background: it.badge === "LIVE" ? "var(--accent-dim)" :
                               it.badge === "DIFF" ? "rgba(77,155,255,0.2)" :
                               it.badge === "DICT" ? "rgba(77,155,255,0.15)" :
                               it.badge === "MOCK" ? "rgba(180,180,180,0.12)" :
                               "rgba(255,179,71,0.2)",
                    color: it.badge === "LIVE" ? "var(--accent)" :
                           it.badge === "DIFF" ? "var(--accent-blue)" :
                           it.badge === "DICT" ? "var(--accent-blue)" :
                           it.badge === "MOCK" ? "var(--ink-dim)" :
                           "var(--warn)",
                    fontWeight: 600,
                  }}>{it.badge}</span>
                )}
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
