"use client";
import { useMemo, useState } from "react";
import InfoTip from "./info-tip";

export type Column<T> = {
  key: string;
  label: string;
  width?: number | string;
  align?: "left" | "right";
  source?: string;
  formula?: string;
  why?: string;
  numeric?: boolean;
  render: (row: T, i: number) => React.ReactNode;
  sortValue?: (row: T) => number | string;
};

type Props<T> = {
  rows: T[];
  columns: Column<T>[];
  searchKeys?: (keyof T)[];          // free-text search over these string fields
  rowKey?: (row: T) => string | number;
};

export function FilterableTable<T>({ rows, columns, searchKeys = [], rowKey }: Props<T>) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const filtered = useMemo(() => {
    let r = rows;
    if (query && searchKeys.length) {
      const q = query.toLowerCase();
      r = r.filter(row =>
        searchKeys.some(k => String((row as any)[k] ?? "").toLowerCase().includes(q))
      );
    }
    if (sortKey) {
      const col = columns.find(c => c.key === sortKey);
      if (col) {
        const get = col.sortValue ?? ((row: T) => (row as any)[col.key]);
        r = [...r].sort((a, b) => {
          const va = get(a), vb = get(b);
          if (typeof va === "number" && typeof vb === "number") {
            return sortDir === "asc" ? va - vb : vb - va;
          }
          return sortDir === "asc"
            ? String(va).localeCompare(String(vb))
            : String(vb).localeCompare(String(va));
        });
      }
    }
    return r;
  }, [rows, query, sortKey, sortDir, columns, searchKeys]);

  const gridTemplate = columns.map(c => typeof c.width === "number" ? `${c.width}px` : (c.width || "1fr")).join(" ");

  const onHeaderClick = (k: string) => {
    if (sortKey === k) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortKey(k); setSortDir("desc"); }
  };

  return (
    <div>
      {searchKeys.length > 0 && (
        <div style={{ marginBottom: 12, display: "flex", gap: 10, alignItems: "center" }}>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="filter by name…"
            style={{
              flex: 1, minWidth: 240, background: "var(--bg-elev)", border: "1px solid var(--line)",
              color: "var(--ink)", padding: "7px 12px", borderRadius: 6, fontSize: 13,
            }}
          />
          <span className="mono" style={{ fontSize: 11, color: "var(--ink-faint)" }}>
            {filtered.length}/{rows.length} rows
            {sortKey && ` · sort: ${columns.find(c => c.key === sortKey)?.label} ${sortDir}`}
          </span>
          {sortKey && (
            <button onClick={() => setSortKey(null)} style={{
              fontSize: 11, padding: "4px 10px", border: "1px solid var(--line)",
              background: "transparent", color: "var(--ink-dim)", borderRadius: 4, cursor: "pointer",
            }}>clear sort</button>
          )}
        </div>
      )}

      <div style={{ background: "var(--bg-elev)", border: "1px solid var(--line)", borderRadius: 10, overflow: "hidden" }}>
        <div style={{
          display: "grid", gridTemplateColumns: gridTemplate,
          gap: 8, padding: "10px 14px", fontSize: 10, letterSpacing: 1.2, color: "var(--ink-faint)",
          textTransform: "uppercase", borderBottom: "1px solid var(--line)", background: "var(--bg-elev-2)",
        }}>
          {columns.map(c => (
            <div key={c.key} style={{ display: "flex", alignItems: "center", gap: 4, textAlign: c.align ?? "left", justifyContent: c.align === "right" ? "flex-end" : "flex-start" }}>
              <button
                onClick={() => onHeaderClick(c.key)}
                style={{
                  background: "none", border: "none", color: sortKey === c.key ? "var(--accent)" : "var(--ink-faint)",
                  cursor: "pointer", fontSize: 10, letterSpacing: 1.2, textTransform: "uppercase",
                  padding: 0, fontWeight: 600,
                }}>
                {c.label}{sortKey === c.key && (sortDir === "asc" ? " ↑" : " ↓")}
              </button>
              {(c.source || c.formula || c.why) && (
                <InfoTip source={c.source} formula={c.formula} why={c.why} size={11} />
              )}
            </div>
          ))}
        </div>
        {filtered.length === 0 && (
          <div style={{ padding: 24, textAlign: "center", color: "var(--ink-faint)", fontSize: 12 }}>
            no rows match the filter
          </div>
        )}
        {filtered.map((row, i) => (
          <div key={rowKey ? rowKey(row) : i} style={{
            display: "grid", gridTemplateColumns: gridTemplate,
            gap: 8, padding: "9px 14px", fontSize: 13, borderBottom: "1px solid var(--line)", alignItems: "center",
          }}>
            {columns.map(c => (
              <div key={c.key} style={{ textAlign: c.align ?? "left" }}>{c.render(row, i)}</div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
