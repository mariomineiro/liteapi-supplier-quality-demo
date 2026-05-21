"use client";
import { FilterableTable, type Column } from "@/components/filterable-table";
import type { QualityRow } from "@/lib/data";

const columns: Column<QualityRow>[] = [
  { key: "rank", label: "#", width: 36, sortValue: () => 0, render: (_r, i) => <span className="mono" style={{ color: "var(--ink-faint)" }}>{i + 1}</span> },
  {
    key: "name", label: "hotel", width: "1.8fr",
    source: "GET /data/hotels.name + .chain",
    why: "The supply unit. Click sort to group by name; use search to find a specific hotel.",
    render: (r) => <span style={{ color: "var(--ink)" }}>{r.name}<span style={{ color: "var(--ink-faint)" }}>{r.chain ? `  ·  ${r.chain}` : ""}</span></span>,
    sortValue: (r) => r.name,
  },
  {
    key: "stars", label: "stars", width: 60,
    source: "GET /data/hotels.stars",
    formula: "stars rating (0-5)",
    why: "Independent star rating. Not always populated by the supplier — gaps here = content opportunity.",
    render: (r) => <span className="mono" style={{ color: "var(--ink-dim)" }}>{r.stars ?? "—"}</span>,
    sortValue: (r) => r.stars ?? -1,
  },
  {
    key: "content_completeness", label: "content %", width: 90, align: "right",
    source: "GET /data/hotels (8 key fields)",
    formula: "Σ(populated fields) / 8 × 100",
    why: "% of 8 key fields populated (description, photos, geo, address, facilities, stars, chain, thumbnail). Below 50% = listing too thin to surface.",
    render: (r) => <span className="mono" style={{ color: r.content_completeness >= 80 ? "var(--accent)" : r.content_completeness >= 50 ? "var(--warn)" : "var(--bad)" }}>{r.content_completeness}%</span>,
    sortValue: (r) => r.content_completeness,
  },
  {
    key: "description_chars", label: "desc chars", width: 90, align: "right",
    source: "GET /data/hotels.hotelDescription",
    formula: "len(strip_html(hotelDescription))",
    why: "Character count of the cleaned description. Very short = boilerplate. Very long = unfocused. Sweet spot 400-1500.",
    render: (r) => <span className="mono" style={{ color: "var(--ink-dim)" }}>{r.description_chars}</span>,
    sortValue: (r) => r.description_chars,
  },
  {
    key: "facility_count", label: "facilities", width: 80, align: "right",
    source: "GET /data/hotels.facilityIds",
    formula: "len(distinct facilityIds)",
    why: "How many facility codes apply (wifi, pool, parking, etc). More = more filter dimensions for search UIs.",
    render: (r) => <span className="mono" style={{ color: "var(--ink-dim)" }}>{r.facility_count}</span>,
    sortValue: (r) => r.facility_count,
  },
  {
    key: "review_count", label: "reviews", width: 80, align: "right",
    source: "GET /data/hotels.reviewCount",
    formula: "reviewCount (raw)",
    why: "Volume of reviews backing the rating. Low review counts make the rating unreliable.",
    render: (r) => <span className="mono" style={{ color: "var(--ink-dim)" }}>{r.review_count.toLocaleString()}</span>,
    sortValue: (r) => r.review_count,
  },
  {
    key: "has_geo", label: "geo", width: 50, align: "right",
    source: "GET /data/hotels (latitude, longitude)",
    formula: "lat != null AND lon != null",
    why: "Hotels without coordinates can't be placed on a map. Hard fail for map-search UIs.",
    render: (r) => <span className="mono" style={{ color: r.has_geo ? "var(--accent)" : "var(--bad)" }}>{r.has_geo ? "✓" : "✗"}</span>,
    sortValue: (r) => (r.has_geo ? 1 : 0),
  },
  {
    key: "overall_quality_score", label: "overall", width: 90, align: "right",
    source: "computed",
    formula: "0.6 × content + 0.2 × review_depth + 0.2 × facilities",
    why: "Composite score (0-100) used as a rank-boost signal in the API. Top decile = surface higher; bottom decile = de-rank or enrich.",
    render: (r) => <span className="mono" style={{ fontWeight: 700, color: "var(--accent)" }}>{r.overall_quality_score}%</span>,
    sortValue: (r) => r.overall_quality_score,
  },
];

export default function QualityTable({ rows }: { rows: QualityRow[] }) {
  return <FilterableTable rows={rows} columns={columns} searchKeys={["name", "chain"]} rowKey={(r) => r.hotel_id} />;
}
