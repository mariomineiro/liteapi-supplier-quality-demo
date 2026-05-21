type Props = {
  title: string;
  description: string;
  preview?: React.ReactNode;
};

export default function Paywall({ title, description, preview }: Props) {
  return (
    <div style={{ position: "relative", minHeight: 480 }}>
      {/* faded preview */}
      <div style={{ filter: "blur(4px) saturate(0.6) brightness(0.7)", pointerEvents: "none", opacity: 0.6 }}>
        {preview ?? <DefaultMock />}
      </div>

      {/* overlay */}
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "linear-gradient(180deg, rgba(10,13,20,0.3) 0%, rgba(10,13,20,0.85) 60%)",
      }}>
        <div style={{
          background: "var(--bg-elev)", border: "1px solid var(--line-bright)",
          borderRadius: 14, padding: "32px 40px", maxWidth: 520, textAlign: "center",
          boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
        }}>
          <div style={{ fontSize: 24, marginBottom: 12 }}>🔒</div>
          <h2 style={{ margin: 0, fontSize: 20, color: "var(--ink)" }}>{title}</h2>
          <p style={{ color: "var(--ink-dim)", marginTop: 12, lineHeight: 1.6, fontSize: 13 }}>
            {description}
          </p>
          <div style={{
            marginTop: 20, padding: "8px 14px", display: "inline-block",
            background: "rgba(0,217,163,0.1)", border: "1px solid var(--accent-dim)",
            borderRadius: 8, fontSize: 11, color: "var(--accent)", letterSpacing: 0.5,
          }} className="mono">
            UNLOCKS WITH PRODUCTION ACCESS
          </div>
          <div style={{ marginTop: 16, fontSize: 11, color: "var(--ink-faint)" }} className="mono">
            scoped data · GDPR-safe · production-only KPI
          </div>
        </div>
      </div>
    </div>
  );
}

function DefaultMock() {
  // generic shimmer grid behind the paywall
  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} style={{
            height: 100, background: "var(--bg-elev)", border: "1px solid var(--line)",
            borderRadius: 10, padding: 16,
          }}>
            <div style={{ width: "60%", height: 10, background: "var(--line-bright)", borderRadius: 4 }} />
            <div style={{ width: "40%", height: 22, background: "var(--line-bright)", borderRadius: 4, marginTop: 14 }} />
          </div>
        ))}
      </div>
      <div style={{
        height: 280, background: "var(--bg-elev)", border: "1px solid var(--line)",
        borderRadius: 10, padding: 16,
      }}>
        <div style={{ width: "30%", height: 14, background: "var(--line-bright)", borderRadius: 4 }} />
        <div style={{ marginTop: 24, display: "flex", alignItems: "flex-end", gap: 6, height: 200 }}>
          {[60, 80, 45, 95, 70, 88, 55, 92, 78, 65, 84, 70].map((h, i) => (
            <div key={i} style={{
              flex: 1, height: `${h}%`, background: "var(--line-bright)", borderRadius: "4px 4px 0 0",
            }} />
          ))}
        </div>
      </div>
    </div>
  );
}
