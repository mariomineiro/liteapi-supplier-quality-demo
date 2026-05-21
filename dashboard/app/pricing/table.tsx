"use client";
import { FilterableTable, type Column } from "@/components/filterable-table";
import type { PricingRow } from "@/lib/data";

export default function PricingTable({ rows, currency }: { rows: PricingRow[]; currency: string }) {
  const columns: Column<PricingRow>[] = [
    { key: "rank", label: "#", width: 36, render: (_r, i) => <span className="mono" style={{ color: "var(--ink-faint)" }}>{i + 1}</span> },
    {
      key: "hotel_name", label: "hotel", width: "1.8fr",
      source: "POST /hotels/rates response.hotelId × /data/hotels.name",
      why: "Resolved hotel name. Click to sort alphabetically; use search to find one.",
      render: (r) => <span style={{ color: "var(--ink)" }}>{r.hotel_name}</span>,
      sortValue: (r) => r.hotel_name,
    },
    {
      key: "offers_returned", label: "offers", width: 70, align: "right",
      source: "POST /hotels/rates.roomTypes[]",
      formula: "count(roomTypes returned)",
      why: "Number of room+board variants the API returned. Higher = better inventory coverage.",
      render: (r) => <span className="mono" style={{ color: "var(--ink-dim)" }}>{r.offers_returned}</span>,
      sortValue: (r) => r.offers_returned,
    },
    {
      key: "distinct_boards", label: "boards", width: 70, align: "right",
      source: "POST /hotels/rates.roomTypes[].rates[].boardName",
      formula: "count(distinct boardName)",
      why: "Distinct meal-plan options (BB, Room Only, HB, FB, AI). More = more filterable in downstream UIs.",
      render: (r) => <span className="mono" style={{ color: "var(--ink-dim)" }}>{r.distinct_boards}</span>,
      sortValue: (r) => r.distinct_boards,
    },
    {
      key: "min_retail", label: `min ${currency}`, width: 90, align: "right",
      source: "POST /hotels/rates.roomTypes[].offerRetailRate.amount",
      formula: "min(retail across all offers)",
      why: "Cheapest available offer for this hotel × date range. The headline price users see on a sort-by-low.",
      render: (r) => <span className="mono" style={{ color: "var(--ink-dim)" }}>{r.min_retail?.toFixed(0) ?? "—"}</span>,
      sortValue: (r) => r.min_retail ?? 0,
    },
    {
      key: "median_retail", label: `median ${currency}`, width: 100, align: "right",
      source: "POST /hotels/rates",
      formula: "median(retail across all offers)",
      why: "Typical price. Stable baseline to compare against min/max.",
      render: (r) => <span className="mono" style={{ color: "var(--ink)" }}>{r.median_retail?.toFixed(0) ?? "—"}</span>,
      sortValue: (r) => r.median_retail ?? 0,
    },
    {
      key: "max_retail", label: `max ${currency}`, width: 90, align: "right",
      source: "POST /hotels/rates",
      formula: "max(retail across all offers)",
      why: "Most expensive available offer. Premium suites or last-minute scarcity rates show here.",
      render: (r) => <span className="mono" style={{ color: "var(--ink-dim)" }}>{r.max_retail?.toFixed(0) ?? "—"}</span>,
      sortValue: (r) => r.max_retail ?? 0,
    },
    {
      key: "price_spread_pct", label: "spread %", width: 80, align: "right",
      source: "computed from /hotels/rates",
      formula: "(max − min) / median × 100",
      why: "Volatility within a single hotel's offer set. >50% = wide; >100% = a suite-vs-base mismatch or stale rate.",
      render: (r) => <span className="mono" style={{ color: (r.price_spread_pct ?? 0) > 100 ? "var(--bad)" : (r.price_spread_pct ?? 0) > 50 ? "var(--warn)" : "var(--ink-dim)" }}>{r.price_spread_pct?.toFixed(1) ?? "—"}%</span>,
      sortValue: (r) => r.price_spread_pct ?? 0,
    },
    {
      key: "median_take_rate_pct", label: "take %", width: 80, align: "right",
      source: "computed from /hotels/rates",
      formula: "median((SSP − retail) / retail × 100)",
      why: "Implied margin if partners resell at SuggestedSellingPrice. Higher = more pricing room; lower = thin margin.",
      render: (r) => <span className="mono" style={{ color: "var(--accent)" }}>{r.median_take_rate_pct?.toFixed(1) ?? "—"}%</span>,
      sortValue: (r) => r.median_take_rate_pct ?? 0,
    },
    {
      key: "competitiveness_score", label: "score", width: 80, align: "right",
      source: "computed",
      formula: "0.25 × diversity + 0.25 × variant + 0.25 × take_rate + 0.25 × spread_health",
      why: "Composite 0-100. Used to surface healthy supply higher in the API's ranking response.",
      render: (r) => <span className="mono" style={{ fontWeight: 700, color: "var(--accent)" }}>{r.competitiveness_score}</span>,
      sortValue: (r) => r.competitiveness_score,
    },
  ];

  return <FilterableTable rows={rows} columns={columns} searchKeys={["hotel_name"]} rowKey={(r) => r.hotel_id} />;
}
