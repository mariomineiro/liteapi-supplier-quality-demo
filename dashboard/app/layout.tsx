import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/sidebar";

export const metadata: Metadata = {
  title: "LiteAPI Command Center · Travel-Tech KPI Demo",
  description: "Open-source KPI console built on the LiteAPI sandbox + open-source MCP server. Travel-tech data wedge demo.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <div className="hud-bg" />
        <div style={{ position: "relative", display: "flex", minHeight: "100vh", zIndex: 1 }}>
          <Sidebar />
          <main style={{ flex: 1, display: "flex", flexDirection: "column", overflowX: "hidden" }}>
            <DemoBanner />
            <div style={{ padding: "20px 36px 36px", flex: 1 }}>
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
    <div style={{
      background: "linear-gradient(90deg, rgba(92,58,175,0.18) 0%, rgba(21,101,192,0.12) 100%)",
      borderBottom: "1px solid var(--line)",
      padding: "8px 36px", fontSize: 12, color: "var(--ink-dim)",
      display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{
          background: "var(--warn)", color: "#1a0f00",
          fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 4, letterSpacing: 1,
        }}>DEMO</span>
        <span>Independent demo built on LiteAPI&apos;s public sandbox and open-source MCP server. Not affiliated with Nuitée.</span>
      </div>
      <div className="mono" style={{ fontSize: 11, color: "var(--ink-faint)" }}>
        <a href="https://github.com/mariomineiro/liteapi-supplier-quality-demo" style={{ color: "var(--accent-blue)" }}>source</a>
      </div>
    </div>
  );
}
