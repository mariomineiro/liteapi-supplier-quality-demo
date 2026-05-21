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
          <main style={{ flex: 1, padding: "28px 36px", overflowX: "hidden" }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
