// Server-side loader for the Analytics-derived JSON snapshots
// (parsed from CSVs once at build time via scripts/build-analytics-json.mjs).

import { promises as fs } from "fs";
import path from "path";

const DIR = path.join(process.cwd(), "public", "data", "analytics-json");

export type DailyRow = Record<string, number | string>;
export type Dataset = {
  source: string;
  count: number;
  columns: string[];
  rows: DailyRow[];
};

export const DEPARTMENTS = [
  { slug: "bookings", label: "Bookings & Reservations", file: "travel-bookings-reservations-daily-2022-2024", emoji: "📅", accent: "var(--accent)" },
  { slug: "finance", label: "Finance", file: "travel-finance-daily-2022-2024", emoji: "💰", accent: "var(--accent-blue)" },
  { slug: "customer-experience", label: "Customer Experience", file: "travel-customer-experience-daily-2022-2024", emoji: "💬", accent: "var(--warn)" },
  { slug: "inventory", label: "Inventory Management", file: "travel-inventory-management-daily-2022-2024", emoji: "🏨", accent: "var(--accent)" },
  { slug: "marketing", label: "Marketing", file: "travel-marketing-daily-2022-2024", emoji: "📢", accent: "var(--accent-blue)" },
  { slug: "operations", label: "Operations", file: "travel-operations-daily-2022-2024", emoji: "⚙️", accent: "var(--warn)" },
  { slug: "partners", label: "Partner Management", file: "travel-partner-management-daily-2022-2024", emoji: "🤝", accent: "var(--accent)" },
  { slug: "it-platform", label: "IT & Platform", file: "travel-it-platform-daily-2022-2024", emoji: "🖥️", accent: "var(--accent-blue)" },
] as const;

export type DepartmentSlug = typeof DEPARTMENTS[number]["slug"];

export async function loadDataset(file: string): Promise<Dataset> {
  const raw = await fs.readFile(path.join(DIR, `${file}.json`), "utf-8");
  return JSON.parse(raw);
}

export async function loadDepartment(slug: DepartmentSlug): Promise<{ meta: typeof DEPARTMENTS[number]; data: Dataset }> {
  const dept = DEPARTMENTS.find(d => d.slug === slug);
  if (!dept) throw new Error(`unknown dept: ${slug}`);
  const data = await loadDataset(dept.file);
  return { meta: dept, data };
}

export async function loadFact() {
  return loadDataset("fact-industry-daily-travel-2022-2024");
}

export async function loadAllDepartments() {
  return Promise.all(DEPARTMENTS.map(async d => ({ meta: d, data: await loadDataset(d.file) })));
}

// ─── stats helpers ───────────────────────────────────────────

export function lastN<T>(rows: T[], n: number): T[] {
  return rows.slice(-n);
}

export function sum(rows: DailyRow[], col: string): number {
  return rows.reduce((s, r) => s + (Number(r[col]) || 0), 0);
}

export function mean(rows: DailyRow[], col: string): number {
  if (!rows.length) return 0;
  return sum(rows, col) / rows.length;
}

export function deltaPct(rows: DailyRow[], col: string, n = 30): number {
  if (rows.length < n * 2) return 0;
  const recent = mean(rows.slice(-n), col);
  const prev = mean(rows.slice(-(n * 2), -n), col);
  if (!prev) return 0;
  return ((recent - prev) / prev) * 100;
}

export function series(rows: DailyRow[], col: string, n = 30): number[] {
  return lastN(rows, n).map(r => Number(r[col]) || 0);
}

export function labels(rows: DailyRow[], n = 30): string[] {
  return lastN(rows, n).map(r => String(r["date"] || ""));
}

export function fmtNum(n: number, opts?: { unit?: string; decimals?: number; abbrev?: boolean }): string {
  const decimals = opts?.decimals ?? 0;
  if (opts?.abbrev) {
    if (Math.abs(n) >= 1e9) return `${(n / 1e9).toFixed(1)}B${opts.unit ?? ""}`;
    if (Math.abs(n) >= 1e6) return `${(n / 1e6).toFixed(1)}M${opts.unit ?? ""}`;
    if (Math.abs(n) >= 1e3) return `${(n / 1e3).toFixed(1)}k${opts.unit ?? ""}`;
  }
  return `${n.toFixed(decimals)}${opts?.unit ?? ""}`;
}
