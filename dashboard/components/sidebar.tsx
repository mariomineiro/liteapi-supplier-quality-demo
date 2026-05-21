"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

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
      { href: "/commission", label: "Commission", badge: "MOCK" },
      { href: "/property-mapping", label: "Property Mapping", badge: "MOCK" },
      { href: "/supply-coverage-map", label: "Supply Coverage Map", badge: "MOCK" },
      { href: "/price-check", label: "Price Check", badge: "NEW" },
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
      { href: "/reports/ai-recommendations", label: "AI Recommendations", badge: "MOCK" },
      { href: "/reports/earnings", label: "Earnings", locked: true },
      { href: "/reports/distributions", label: "Distributions", badge: "MOCK" },
      { href: "/reports/customer-analysis", label: "Customer Analysis", badge: "MOCK" },
      { href: "/reports/destinations", label: "Destinations", badge: "MOCK" },
    ],
  },
];

const BADGE_DESCRIPTION: Record<string, string> = {
  LIVE: "live data",
  DIFF: "differentiator",
  DICT: "data dictionary",
  MOCK: "mock data",
  NEW: "new",
  VISION: "vision",
};

export default function Sidebar() {
  const path = usePathname();
  const [open, setOpen] = useState(false);

  // Close drawer on route change
  useEffect(() => { setOpen(false); }, [path]);

  // Lock body scroll while drawer is open on mobile
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [open]);

  // Close on Esc
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      {/* Mobile header — hidden on md+ via CSS */}
      <div className="app-mobile-header md:hidden">
        <button
          type="button"
          className="hamburger"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="primary-nav"
          onClick={() => setOpen(v => !v)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            {open ? (
              <>
                <line x1="6" y1="6" x2="18" y2="18" />
                <line x1="6" y1="18" x2="18" y2="6" />
              </>
            ) : (
              <>
                <line x1="4" y1="7" x2="20" y2="7" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="17" x2="20" y2="17" />
              </>
            )}
          </svg>
        </button>
        <span className="app-mobile-header-title">LiteAPI Command</span>
        <span className="mono" style={{ marginLeft: "auto", fontSize: 10, color: "var(--warn)", background: "rgba(255,179,71,0.15)", padding: "2px 6px", borderRadius: 3, fontWeight: 700, letterSpacing: 1 }}>DEMO</span>
      </div>

      <button
        type="button"
        className="sidebar-backdrop"
        data-open={open ? "true" : "false"}
        aria-label="Close menu"
        tabIndex={open ? 0 : -1}
        onClick={() => setOpen(false)}
      />

      <aside
        id="primary-nav"
        className="sidebar"
        data-open={open ? "true" : "false"}
        aria-label="Primary"
      >
        <div style={{ padding: "0 18px 14px", borderBottom: "1px solid var(--line)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span aria-hidden="true" style={{
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

        <nav aria-label="Primary navigation">
          {NAV.map((g, gi) => (
            <div key={gi} style={{ padding: "10px 0 4px" }} role="group" aria-label={g.title}>
              {g.title && (
                <div style={{
                  padding: "8px 18px 4px",
                  fontSize: 10, letterSpacing: 1.2, textTransform: "uppercase",
                  color: "var(--ink-faint)", fontWeight: 600,
                }}>{g.title}</div>
              )}
              {g.items.map((it) => {
                const active = path === it.href;
                if (it.locked) {
                  return (
                    <span
                      key={it.href}
                      className="nav-link"
                      aria-disabled="true"
                      title="Locked — not available in this demo"
                    >
                      <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span aria-hidden="true" style={{ fontSize: 10 }}>🔒</span>
                        <span className="sr-only">Locked: </span>
                        {it.label}
                      </span>
                      {it.badge && <Badge kind={it.badge} />}
                    </span>
                  );
                }
                return (
                  <Link
                    key={it.href}
                    href={it.href}
                    className="nav-link"
                    aria-current={active ? "page" : undefined}
                    onClick={() => setOpen(false)}
                  >
                    <span>{it.label}</span>
                    {it.badge && <Badge kind={it.badge} />}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div style={{
          marginTop: 24, padding: "16px 18px", borderTop: "1px solid var(--line)",
          fontSize: 11, color: "var(--ink-faint)",
        }}>
          <div className="mono" style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span className="pulse" aria-hidden="true" style={{
              display: "inline-block", width: 6, height: 6, borderRadius: "50%",
              background: "var(--accent)",
            }} />
            <span className="sr-only">Status: </span>
            live · LiteAPI sandbox
          </div>
          <div style={{ marginTop: 8 }}>
            <a href="https://github.com/mariomineiro/liteapi-supplier-quality-demo" style={{ color: "var(--ink-dim)", textDecoration: "underline" }}>source</a>
            {" · "}
            <a href="https://liteapi.travel" style={{ color: "var(--ink-dim)", textDecoration: "underline" }}>liteapi.travel</a>
          </div>
        </div>
      </aside>
    </>
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
  const desc = BADGE_DESCRIPTION[kind] ?? kind.toLowerCase();
  return (
    <span
      aria-label={desc}
      title={desc}
      style={{
        fontSize: 9, padding: "2px 6px", borderRadius: 4, letterSpacing: 0.5,
        background: c.bg, color: c.fg, fontWeight: 700,
      }}
    >
      <span aria-hidden="true">{kind}</span>
    </span>
  );
}
