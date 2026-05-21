// Parse the Analytics CSVs once at build time and emit compact JSON snapshots
// for the dashboard to load via fetch().
//
// Source CSVs ship with the repo under public/data/analytics/*.csv
// Output JSON goes to public/data/analytics-json/*.json
//
// Run: node scripts/build-analytics-json.mjs

import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, basename } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(fileURLToPath(import.meta.url), "..", "..");
const SRC = join(ROOT, "public", "data", "analytics");
const OUT = join(ROOT, "public", "data", "analytics-json");

if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

function parseCsv(text) {
  // Robust CSV parser: handles quoted fields, commas inside quotes.
  const out = [];
  let row = [];
  let cur = "";
  let inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"' && text[i + 1] === '"') { cur += '"'; i++; continue; }
      if (c === '"') { inQ = false; continue; }
      cur += c; continue;
    }
    if (c === '"') { inQ = true; continue; }
    if (c === ",") { row.push(cur); cur = ""; continue; }
    if (c === "\n") { row.push(cur); out.push(row); row = []; cur = ""; continue; }
    if (c === "\r") continue;
    cur += c;
  }
  if (cur || row.length) { row.push(cur); out.push(row); }
  return out.filter(r => r.length && r.some(c => c !== ""));
}

function toRecords(rows) {
  if (!rows.length) return [];
  const headers = rows[0];
  return rows.slice(1).map(r => {
    const o = {};
    for (let i = 0; i < headers.length; i++) {
      const raw = r[i] ?? "";
      const n = Number(raw);
      o[headers[i]] = raw !== "" && !Number.isNaN(n) ? n : raw;
    }
    return o;
  });
}

const files = readdirSync(SRC).filter(f => f.endsWith(".csv"));
const manifest = [];

for (const f of files) {
  const text = readFileSync(join(SRC, f), "utf8");
  const records = toRecords(parseCsv(text));
  const slug = basename(f, ".csv").replace(/_+/g, "-");
  const out = { source: f, count: records.length, columns: Object.keys(records[0] || {}), rows: records };
  writeFileSync(join(OUT, `${slug}.json`), JSON.stringify(out));
  manifest.push({ slug, source: f, count: records.length, columns: out.columns });
  console.log(`  ${f.padEnd(60)} → ${slug}.json (${records.length} rows, ${out.columns.length} cols)`);
}

writeFileSync(join(OUT, "_manifest.json"), JSON.stringify(manifest, null, 2));
console.log(`\n  manifest: ${manifest.length} files`);
