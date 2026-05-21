import { promises as fs } from "fs";
import path from "path";

export type QualityRow = {
  hotel_id: string;
  name: string;
  chain: string;
  stars: number | null;
  rating: number | null;
  review_count: number;
  description_chars: number;
  has_main_photo: boolean;
  has_thumbnail: boolean;
  has_geo: boolean;
  has_address: boolean;
  facility_count: number;
  accessibility_count: number;
  content_completeness: number;
  review_depth_signal: number;
  overall_quality_score: number;
};

export type PricingRow = {
  hotel_id: string;
  hotel_name: string;
  offers_returned: number;
  distinct_suppliers: number;
  distinct_boards: number;
  min_retail: number | null;
  median_retail: number | null;
  max_retail: number | null;
  price_spread_pct: number | null;
  median_ssp: number | null;
  median_take_rate_pct: number | null;
  competitiveness_score: number;
};

export type Snapshot<T> = {
  meta: {
    city: string;
    country: string;
    sample_size: number;
    generated_at: string;
    currency?: string;
    checkin?: string;
    checkout?: string;
    adults?: number;
  };
  rows: T[];
};

const DATA_DIR = path.join(process.cwd(), "public", "data");

export async function loadQuality(citySlug: string): Promise<Snapshot<QualityRow>> {
  const raw = await fs.readFile(path.join(DATA_DIR, `quality-${citySlug}.json`), "utf8");
  return JSON.parse(raw);
}

export async function loadPricing(citySlug: string): Promise<Snapshot<PricingRow>> {
  const raw = await fs.readFile(path.join(DATA_DIR, `pricing-${citySlug}.json`), "utf8");
  return JSON.parse(raw);
}

export const ALL_CITIES = [
  "pt-lisbon", "pt-porto", "gb-london", "ie-dublin",
  "es-barcelona", "es-palma", "ma-casablanca", "fr-paris",
];

export async function loadAllQuality(): Promise<Snapshot<QualityRow>[]> {
  return Promise.all(ALL_CITIES.map(loadQuality));
}

export async function loadAllPricing(): Promise<Snapshot<PricingRow>[]> {
  return Promise.all(ALL_CITIES.map(loadPricing));
}
