// Deterministic sample data for the mockup pages.
// Seeded so the dashboard looks consistent across reloads but doesn't pretend to be real.

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pickList<T>(rand: () => number, items: T[]): T {
  return items[Math.floor(rand() * items.length)];
}

// ─────────────────────────── Bookings
export function bookingFunnel(seed = 7) {
  const r = mulberry32(seed);
  const searches = 1_240_000 + Math.floor(r() * 200_000);
  const looks = Math.floor(searches * (0.42 + r() * 0.08));
  const shops = Math.floor(looks * (0.28 + r() * 0.06));
  const books = Math.floor(shops * (0.084 + r() * 0.012));
  const confirmed = Math.floor(books * (0.93 + r() * 0.03));
  const fulfilled = Math.floor(confirmed * (0.97 + r() * 0.02));
  return [
    { label: "Searches", value: searches },
    { label: "Look (rate-shopping)", value: looks },
    { label: "Shop (room-detail view)", value: shops },
    { label: "Book attempts", value: books },
    { label: "Confirmed", value: confirmed },
    { label: "Fulfilled (stay completed)", value: fulfilled },
  ];
}

export function bookingsOverTime(seed = 11, weeks = 24) {
  const r = mulberry32(seed);
  const labels: string[] = [];
  const confirmed: number[] = [];
  const cancelled: number[] = [];
  let base = 8400;
  for (let i = 0; i < weeks; i++) {
    base = base * (1 + (r() - 0.45) * 0.06);   // gentle drift
    const c = Math.floor(base);
    const x = Math.floor(c * (0.08 + r() * 0.04));
    confirmed.push(c);
    cancelled.push(x);
    labels.push(`W${i + 1}`);
  }
  return { labels, confirmed, cancelled };
}

export function bookingsByCity(seed = 13) {
  const r = mulberry32(seed);
  const cities = ["Lisbon", "Porto", "London", "Dublin", "Barcelona", "Palma", "Casablanca", "Paris", "Madrid", "Rome", "Berlin", "Amsterdam"];
  return cities.map(c => ({ city: c, bookings: Math.floor(800 + r() * 5400) }));
}

// ─────────────────────────── Customers
export function topCustomersByGbv(seed = 23) {
  const r = mulberry32(seed);
  // Generic API-customer archetypes (no real names)
  const archetypes = [
    "Loyalty Aggregator NA", "Fintech Travel Perk", "Airline Hotel Add-on", "OTA Tier-2 EU",
    "Bank Rewards Portal", "Booking Engine SaaS", "Corporate Travel Co", "Meta-search EU",
    "Cashback Travel App", "Lifestyle Subscription", "Mobile-first Trip Planner", "TMC White-label",
    "Cruise Pre-book", "Airline Loyalty Asia", "Insurance Cross-sell",
  ];
  return archetypes.map(name => ({ name, gbv: 0.6e6 + r() * 11e6 }))
    .sort((a, b) => b.gbv - a.gbv);
}

export function customerCohortRetention(seed = 31) {
  const r = mulberry32(seed);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const rows = months.slice(0, 8).map(m => `'25 ${m}`);
  const cols = ["M+0", "M+1", "M+3", "M+6", "M+9", "M+12"];
  const matrix: (number | null)[][] = rows.map((_, ri) => {
    return cols.map((_, ci) => {
      const monthsForward = [0, 1, 3, 6, 9, 12][ci];
      const cohortAge = rows.length - ri;
      if (monthsForward > cohortAge * 1.5) return null; // not enough time elapsed
      const churnRate = 0.04 + r() * 0.03;
      return Math.max(0, 100 * Math.pow(1 - churnRate, monthsForward));
    });
  });
  return { rowLabels: rows, colLabels: cols, matrix };
}

// ─────────────────────────── Earnings / Commercial
export function gbvAndRevenueTrend(seed = 41, weeks = 24) {
  const r = mulberry32(seed);
  const labels: string[] = [];
  const gbv: number[] = [];
  const rev: number[] = [];
  let base = 2_200_000;
  for (let i = 0; i < weeks; i++) {
    base = base * (1 + 0.012 + (r() - 0.4) * 0.04); // ~5% weekly trend up
    const v = base;
    const takeRate = 0.092 + (r() - 0.5) * 0.012;
    gbv.push(v);
    rev.push(v * takeRate);
    labels.push(`W${i + 1}`);
  }
  return { labels, gbv, rev };
}

export function takeRateByMarket(seed = 47) {
  const r = mulberry32(seed);
  const markets = ["PT", "ES", "FR", "IT", "DE", "GB", "IE", "MA", "NL", "BE"];
  return markets.map(m => ({ market: m, takeRate: 6 + r() * 18 }));
}

// ─────────────────────────── Supply Coverage
export function supplyCoverageByCountry(seed = 53) {
  const r = mulberry32(seed);
  const data = [
    { country: "Spain", hotels: 0 },
    { country: "France", hotels: 0 },
    { country: "Italy", hotels: 0 },
    { country: "United Kingdom", hotels: 0 },
    { country: "Portugal", hotels: 0 },
    { country: "Germany", hotels: 0 },
    { country: "Ireland", hotels: 0 },
    { country: "Morocco", hotels: 0 },
    { country: "Netherlands", hotels: 0 },
    { country: "Greece", hotels: 0 },
    { country: "Switzerland", hotels: 0 },
    { country: "Austria", hotels: 0 },
  ];
  return data.map(d => ({ ...d, hotels: Math.floor(2_000 + r() * 38_000) }))
    .sort((a, b) => b.hotels - a.hotels);
}

// ─────────────────────────── Destinations
export function topDestinationsByGbv(seed = 59) {
  const r = mulberry32(seed);
  const dests = ["London, GB", "Paris, FR", "Barcelona, ES", "Rome, IT", "Madrid, ES", "Amsterdam, NL", "Lisbon, PT", "Berlin, DE", "Dubai, AE", "New York, US", "Bangkok, TH", "Tokyo, JP"];
  return dests.map(d => ({ destination: d, gbv: 0.4e6 + r() * 8e6 }))
    .sort((a, b) => b.gbv - a.gbv);
}

// ─────────────────────────── MCP / Agentic
export function mcpLatencyOverTime(seed = 61, points = 30) {
  const r = mulberry32(seed);
  const labels = Array.from({ length: points }, (_, i) => `D${i + 1}`);
  const make = (base: number, variance: number) =>
    labels.map(() => Math.max(10, base + (r() - 0.5) * variance));
  return {
    labels,
    series: [
      { label: "/search", values: make(110, 60), color: "var(--accent)" },
      { label: "/hotels/rates", values: make(380, 180), color: "var(--accent-blue)" },
      { label: "/bookings", values: make(220, 80), color: "var(--warn)" },
      { label: "/flights", values: make(290, 140), color: "var(--bad)" },
    ],
  };
}

export function mcpToolSuccess(seed = 67) {
  const r = mulberry32(seed);
  const tools = ["/search", "/hotels/rates", "/bookings", "/static", "/vouchers", "/loyalty", "/flights", "/supplyCustomization"];
  return tools.map(t => ({ tool: t, success: 96 + r() * 3.8 })).sort((a, b) => a.success - b.success);
}

export function agentVsHumanFunnel(seed = 71) {
  const r = mulberry32(seed);
  const make = (top: number, conv: number[]) => {
    let v = top;
    return conv.map(c => { v = Math.floor(v * c); return v; });
  };
  const human = make(820_000, [1, 0.46, 0.32, 0.082, 0.94, 0.97]);
  const agent = make(180_000, [1, 0.71, 0.58, 0.146, 0.91, 0.96]);
  const labels = ["Searches", "Look", "Shop", "Book attempt", "Confirmed", "Fulfilled"];
  return { labels, human, agent };
}

// ─────────────────────────── Sparkline helpers
export function trend(seed: number, n = 20, base = 100, drift = 0.05): number[] {
  const r = mulberry32(seed);
  const out: number[] = [];
  let v = base;
  for (let i = 0; i < n; i++) {
    v = v * (1 + drift * 0.3 + (r() - 0.5) * drift);
    out.push(v);
  }
  return out;
}
