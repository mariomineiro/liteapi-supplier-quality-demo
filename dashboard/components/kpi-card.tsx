import InfoTip from "./info-tip";

type Props = {
  label: string;
  value: string | number;
  unit?: string;
  delta?: { value: string; positive?: boolean };
  hint?: string;
  accent?: "default" | "live" | "warn" | "bad";
  source?: string;
  formula?: string;
  why?: string;
  kpi?: string;
};

const accentMap = {
  default: "var(--ink)",
  live: "var(--accent)",
  warn: "var(--warn)",
  bad: "var(--bad)",
};

export default function KpiCard({ label, value, unit, delta, hint, accent = "default", source, formula, why, kpi }: Props) {
  return (
    <div style={{
      background: "var(--bg-elev)", border: "1px solid var(--line)",
      borderRadius: 10, padding: "16px 18px", position: "relative",
    }}>
      <div style={{
        fontSize: 10, letterSpacing: 1.2, textTransform: "uppercase",
        color: "var(--ink-faint)", fontWeight: 600, display: "flex", alignItems: "center", gap: 6,
      }}>
        {accent === "live" && <span className="pulse" style={{
          display: "inline-block", width: 5, height: 5, borderRadius: "50%", background: "var(--accent)",
        }} />}
        {label}
        {(source || formula || why || kpi) && <InfoTip source={source} formula={formula} why={why} kpi={kpi} />}
      </div>
      <div style={{
        marginTop: 8, fontSize: 28, fontWeight: 700,
        color: accentMap[accent], lineHeight: 1.1,
      }} className="mono">
        {value}
        {unit && <span style={{ fontSize: 14, marginLeft: 4, color: "var(--ink-dim)", fontWeight: 400 }}>{unit}</span>}
      </div>
      {delta && (
        <div style={{
          marginTop: 6, fontSize: 11,
          color: delta.positive ? "var(--accent)" : "var(--bad)",
        }} className="mono">
          {delta.positive ? "↑" : "↓"} {delta.value}
        </div>
      )}
      {hint && (
        <div style={{ marginTop: 10, fontSize: 11, color: "var(--ink-faint)" }}>{hint}</div>
      )}
    </div>
  );
}
