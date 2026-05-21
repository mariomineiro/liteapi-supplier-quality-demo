import type { Metadata, Viewport } from "next";
import "./globals.css";
import Sidebar from "@/components/sidebar";

export const metadata: Metadata = {
  title: "LiteAPI Command Center · Travel-Tech KPI Demo",
  description: "Open-source KPI console built on the LiteAPI sandbox + open-source MCP server. Travel-tech data wedge demo.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0F0624",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a href="#main-content" className="skip-link">Skip to main content</a>
        <div className="hud-bg" aria-hidden="true" />
        <div className="app-shell">
          <Sidebar />
          <main id="main-content" className="app-main" tabIndex={-1}>
            <DemoBanner />
            <div className="app-content">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}

function DemoBanner() {
  return (
    <div className="demo-banner">
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <span style={{
          background: "var(--warn)", color: "#1a0f00",
          fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 4, letterSpacing: 1,
        }}>DEMO</span>
        <span>Independent demo built on LiteAPI&apos;s public sandbox and open-source MCP server. Not affiliated with Nuitée.</span>
      </div>
      <div className="mono demo-banner-source" style={{ fontSize: 11, color: "var(--ink-faint)" }}>
        <a href="https://github.com/mariomineiro/liteapi-supplier-quality-demo" style={{ color: "var(--accent-blue)" }}>source</a>
      </div>
    </div>
  );
}
