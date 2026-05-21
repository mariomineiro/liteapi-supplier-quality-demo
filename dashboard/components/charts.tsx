// Lightweight pure-SVG chart components. No deps.
// Designed for the dark HUD aesthetic and consistent with the rest of the dashboard.

type Series = { label: string; values: number[]; color?: string };
type Common = { title?: string; subtitle?: string; height?: number };

// ───────────────────────────────────────── Sparkline
export function Sparkline({ values, color = "var(--accent)", height = 36, width = 120 }: { values: number[]; color?: string; height?: number; width?: number }) {
  if (!values.length) return null;
  const min = Math.min(...values), max = Math.max(...values), pad = 2;
  const h = height - pad * 2, w = width - pad * 2;
  const norm = (v: number) => (max === min ? h / 2 : h - ((v - min) / (max - min)) * h);
  const path = values.map((v, i) => `${i === 0 ? "M" : "L"}${pad + (i / (values.length - 1)) * w} ${pad + norm(v)}`).join(" ");
  return (
    <svg width={width} height={height} style={{ display: "block" }}>
      <path d={path} fill="none" stroke={color} strokeWidth={1.5} opacity={0.9} />
      <circle cx={pad + w} cy={pad + norm(values[values.length - 1])} r={2.5} fill={color} />
    </svg>
  );
}

// ───────────────────────────────────────── LineChart (multi-series)
export function LineChart({ labels, series, height = 240, yFmt = (v: number) => v.toFixed(0), title, subtitle }: { labels: string[]; series: Series[]; height?: number; yFmt?: (v: number) => string; } & Common) {
  const PAD_L = 50, PAD_R = 12, PAD_T = 12, PAD_B = 28;
  const all = series.flatMap(s => s.values);
  const min = Math.min(0, ...all), max = Math.max(...all);
  const W = 760, H = height;
  const cw = W - PAD_L - PAD_R, ch = H - PAD_T - PAD_B;
  const xAt = (i: number) => PAD_L + (i / Math.max(1, labels.length - 1)) * cw;
  const yAt = (v: number) => PAD_T + ch - ((v - min) / Math.max(1, max - min)) * ch;
  const yTicks = 4;
  return (
    <ChartFrame title={title} subtitle={subtitle}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: H }}>
        {Array.from({ length: yTicks + 1 }, (_, i) => {
          const v = min + ((max - min) * i) / yTicks;
          return (
            <g key={i}>
              <line x1={PAD_L} x2={W - PAD_R} y1={yAt(v)} y2={yAt(v)} stroke="var(--line)" strokeDasharray="2 4" />
              <text x={PAD_L - 6} y={yAt(v) + 3} fill="var(--ink-faint)" fontSize="10" textAnchor="end" fontFamily="ui-monospace, monospace">{yFmt(v)}</text>
            </g>
          );
        })}
        {labels.map((l, i) => i % Math.ceil(labels.length / 8) === 0 && (
          <text key={i} x={xAt(i)} y={H - 10} fill="var(--ink-faint)" fontSize="10" textAnchor="middle">{l}</text>
        ))}
        {series.map((s, si) => {
          const color = s.color || ["var(--accent)", "var(--accent-blue)", "var(--warn)", "var(--bad)"][si % 4];
          const d = s.values.map((v, i) => `${i === 0 ? "M" : "L"}${xAt(i)} ${yAt(v)}`).join(" ");
          return (
            <g key={si}>
              <path d={d} fill="none" stroke={color} strokeWidth={1.8} />
              {s.values.map((v, i) => <circle key={i} cx={xAt(i)} cy={yAt(v)} r={2} fill={color} />)}
            </g>
          );
        })}
      </svg>
      <Legend series={series} />
    </ChartFrame>
  );
}

// ───────────────────────────────────────── BarChart (vertical)
export function BarChart({ labels, values, height = 220, color = "var(--accent)", yFmt = (v: number) => v.toFixed(0), title, subtitle }: { labels: string[]; values: number[]; height?: number; color?: string; yFmt?: (v: number) => string; } & Common) {
  const PAD_L = 50, PAD_R = 12, PAD_T = 12, PAD_B = 38;
  const max = Math.max(...values, 1);
  const W = 760, H = height;
  const cw = W - PAD_L - PAD_R, ch = H - PAD_T - PAD_B;
  const bw = cw / values.length * 0.7;
  const xAt = (i: number) => PAD_L + (i + 0.5) * (cw / values.length);
  const yAt = (v: number) => PAD_T + ch - (v / max) * ch;
  return (
    <ChartFrame title={title} subtitle={subtitle}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: H }}>
        {[0.25, 0.5, 0.75, 1].map((p, i) => (
          <g key={i}>
            <line x1={PAD_L} x2={W - PAD_R} y1={yAt(max * p)} y2={yAt(max * p)} stroke="var(--line)" strokeDasharray="2 4" />
            <text x={PAD_L - 6} y={yAt(max * p) + 3} fill="var(--ink-faint)" fontSize="10" textAnchor="end" fontFamily="ui-monospace, monospace">{yFmt(max * p)}</text>
          </g>
        ))}
        {values.map((v, i) => (
          <g key={i}>
            <rect x={xAt(i) - bw / 2} y={yAt(v)} width={bw} height={ch - (yAt(v) - PAD_T)} fill={color} opacity={0.85} rx={2} />
            <text x={xAt(i)} y={H - 22} fill="var(--ink-faint)" fontSize="10" textAnchor="middle">{labels[i]}</text>
            <text x={xAt(i)} y={yAt(v) - 4} fill={color} fontSize="9" textAnchor="middle" fontFamily="ui-monospace, monospace">{yFmt(v)}</text>
          </g>
        ))}
      </svg>
    </ChartFrame>
  );
}

// ───────────────────────────────────────── HBar — horizontal bars
export function HBar({ labels, values, color = "var(--accent)", maxBars = 12, valueFmt = (v: number) => v.toFixed(0) }: { labels: string[]; values: number[]; color?: string; maxBars?: number; valueFmt?: (v: number) => string }) {
  const pairs = labels.map((l, i) => ({ l, v: values[i] })).sort((a, b) => b.v - a.v).slice(0, maxBars);
  const max = Math.max(...pairs.map(p => p.v), 1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {pairs.map((p, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "150px 1fr 60px", gap: 10, alignItems: "center", fontSize: 12 }}>
          <div style={{ color: "var(--ink-dim)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.l}</div>
          <div style={{ height: 14, background: "var(--bg-elev-2)", borderRadius: 3, overflow: "hidden" }}>
            <div style={{ width: `${(p.v / max) * 100}%`, height: "100%", background: color, opacity: 0.85, borderRadius: 3 }} />
          </div>
          <div className="mono" style={{ color: "var(--ink)", textAlign: "right" }}>{valueFmt(p.v)}</div>
        </div>
      ))}
    </div>
  );
}

// ───────────────────────────────────────── Funnel
export function Funnel({ steps, title, subtitle }: { steps: { label: string; value: number }[] } & Common) {
  const top = steps[0]?.value || 1;
  return (
    <ChartFrame title={title} subtitle={subtitle}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "8px 0" }}>
        {steps.map((s, i) => {
          const pct = (s.value / top) * 100;
          const fromPrev = i > 0 ? (s.value / steps[i - 1].value) * 100 : 100;
          return (
            <div key={i}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                <span style={{ color: "var(--ink-dim)" }}>{s.label}</span>
                <span className="mono" style={{ color: "var(--ink)" }}>
                  {s.value.toLocaleString()}{" "}
                  <span style={{ color: i === 0 ? "var(--ink-faint)" : (fromPrev > 60 ? "var(--accent)" : fromPrev > 30 ? "var(--warn)" : "var(--bad)") }}>
                    {i === 0 ? "" : `(${fromPrev.toFixed(1)}%)`}
                  </span>
                </span>
              </div>
              <div style={{ height: 28, background: "var(--bg-elev-2)", borderRadius: 4, overflow: "hidden", position: "relative" }}>
                <div style={{ width: `${pct}%`, height: "100%", background: "linear-gradient(90deg, var(--accent-dim), var(--accent))", borderRadius: 4 }} />
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", paddingLeft: 10, fontSize: 11, color: "var(--ink)", fontWeight: 600 }} className="mono">
                  {pct.toFixed(1)}% of top
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </ChartFrame>
  );
}

// ───────────────────────────────────────── Heatmap (cohort grid)
export function HeatmapCohort({ rowLabels, colLabels, matrix, title, subtitle, valueFmt = (v: number) => `${v.toFixed(0)}%` }: { rowLabels: string[]; colLabels: string[]; matrix: (number | null)[][]; valueFmt?: (v: number) => string } & Common) {
  const all = matrix.flat().filter((v): v is number => v !== null);
  const max = Math.max(...all, 1);
  return (
    <ChartFrame title={title} subtitle={subtitle}>
      <div style={{ overflow: "auto" }}>
        <table style={{ borderCollapse: "collapse", fontSize: 11 }}>
          <thead>
            <tr>
              <th style={{ padding: "6px 8px", color: "var(--ink-faint)", fontWeight: 600, textAlign: "left", letterSpacing: 1.2, textTransform: "uppercase", fontSize: 10 }}>Cohort</th>
              {colLabels.map(c => <th key={c} style={{ padding: "6px 8px", color: "var(--ink-faint)", fontWeight: 600, textAlign: "center", letterSpacing: 1.2, textTransform: "uppercase", fontSize: 10 }}>{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {rowLabels.map((r, ri) => (
              <tr key={ri}>
                <td style={{ padding: "4px 8px", color: "var(--ink-dim)", whiteSpace: "nowrap" }}>{r}</td>
                {matrix[ri].map((v, ci) => {
                  if (v === null) return <td key={ci} style={{ padding: 4 }}><div style={{ width: 50, height: 28, background: "var(--bg-elev-2)", borderRadius: 3, opacity: 0.3 }} /></td>;
                  const intensity = v / max;
                  return (
                    <td key={ci} style={{ padding: 4 }}>
                      <div className="mono" style={{
                        width: 50, height: 28, borderRadius: 3,
                        background: `rgba(0, 217, 163, ${0.12 + intensity * 0.75})`,
                        color: intensity > 0.55 ? "#02110b" : "var(--ink)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 11, fontWeight: 600,
                      }}>{valueFmt(v)}</div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ChartFrame>
  );
}

// ───────────────────────────────────────── helpers
function ChartFrame({ title, subtitle, children }: { title?: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "var(--bg-elev)", border: "1px solid var(--line)", borderRadius: 10, padding: 16 }}>
      {(title || subtitle) && (
        <div style={{ marginBottom: 8 }}>
          {title && <div style={{ fontSize: 13, color: "var(--ink)", fontWeight: 600 }}>{title}</div>}
          {subtitle && <div style={{ fontSize: 11, color: "var(--ink-faint)", marginTop: 2 }}>{subtitle}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

function Legend({ series }: { series: Series[] }) {
  return (
    <div style={{ display: "flex", gap: 14, marginTop: 8, fontSize: 11, color: "var(--ink-dim)", flexWrap: "wrap" }}>
      {series.map((s, i) => {
        const color = s.color || ["var(--accent)", "var(--accent-blue)", "var(--warn)", "var(--bad)"][i % 4];
        return (
          <span key={i} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: color }} />
            {s.label}
          </span>
        );
      })}
    </div>
  );
}
