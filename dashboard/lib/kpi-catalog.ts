// KPI Catalog — travel-tech API infrastructure (Nuitée / LiteAPI shape)
//
// Adapted from generic Travel & Tourism KPI catalogs (PlugandPlayBI style)
// to the specific shape of a B2B hotel/flight booking API platform.
// Not a generic OTA / hotelier catalog — this is the API-infrastructure cut.

export type KpiStatus = "live" | "sandbox" | "prod-only" | "standard";

export type Kpi = {
  area: string;
  name: string;
  description: string;
  objective: string;
  formula: string;
  source: string;
  status: KpiStatus;
};

export const KPI_CATEGORIES = [
  "Supply Quality",
  "Pricing & Rate Parity",
  "Booking Funnel",
  "API Customer Health",
  "API Infrastructure",
  "Agentic / MCP",
  "Commercial & Financial",
  "Customer Experience",
  "Compliance & Governance",
  "Travel Industry Standard",
] as const;

export const KPIS: Kpi[] = [
  // ---------- Supply Quality ----------
  { area: "Supply Quality", name: "Content Completeness %", description: "% of 8 key hotel fields populated (description, photos, facilities, geo, address, stars, chain).", objective: "Surface under-enriched supply for content team.", formula: "Σ(populated fields) / 8 × 100", source: "GET /data/hotels", status: "live" },
  { area: "Supply Quality", name: "Description Richness", description: "Hotel description length, HTML stripped.", objective: "Detect cookie-cutter listings.", formula: "len(strip_html(hotelDescription))", source: "GET /data/hotel", status: "live" },
  { area: "Supply Quality", name: "Photo Count", description: "Number of photos per hotel.", objective: "Photo coverage = booking lift.", formula: "len(hotelImages)", source: "GET /data/hotel", status: "sandbox" },
  { area: "Supply Quality", name: "Facility Coverage", description: "Distinct facility IDs per hotel.", objective: "Detect bare-bones listings.", formula: "len(distinct facilityIds)", source: "GET /data/hotels", status: "live" },
  { area: "Supply Quality", name: "Accessibility Coverage", description: "Accessibility attributes per hotel.", objective: "Inclusive-travel signal.", formula: "len(accessibilityAttributes)", source: "GET /data/hotels", status: "live" },
  { area: "Supply Quality", name: "Room-Type Diversity", description: "Distinct room types listed per hotel.", objective: "Inventory variety.", formula: "len(distinct rooms[*].id)", source: "GET /data/hotel", status: "sandbox" },
  { area: "Supply Quality", name: "Sentiment Score", description: "LiteAPI sentiment_analysis per hotel.", objective: "Pre-filter low-quality stays.", formula: "sentiment_analysis.score", source: "GET /data/hotel.sentiment_analysis", status: "sandbox" },
  { area: "Supply Quality", name: "Inventory Freshness", description: "Days since last content update per hotel.", objective: "Stale-content alarm.", formula: "today − sentiment_updated_at", source: "GET /data/hotel", status: "sandbox" },
  { area: "Supply Quality", name: "Cross-Source ID Coverage %", description: "% of hotels with rohId (cross-source match).", objective: "Property-mapping coverage.", formula: "Σ(rohId != null) / total × 100", source: "GET /data/hotel.rohId", status: "sandbox" },
  { area: "Supply Quality", name: "Geo Precision Rate", description: "% of hotels with lat/lon populated.", objective: "Map-search reliability.", formula: "Σ(lat & lon) / total × 100", source: "GET /data/hotels", status: "live" },
  { area: "Supply Quality", name: "Composite Supply Score", description: "Weighted composite of content, reviews, facilities.", objective: "Single rank-boost signal.", formula: "0.6 × content + 0.2 × reviews + 0.2 × facilities", source: "computed", status: "live" },

  // ---------- Pricing & Rate Parity ----------
  { area: "Pricing & Rate Parity", name: "Median Take-Rate %", description: "(SSP − retail) / retail per offer, median per hotel.", objective: "Margin signal.", formula: "median((SSP − retail) / retail × 100)", source: "POST /hotels/rates", status: "live" },
  { area: "Pricing & Rate Parity", name: "Price Spread %", description: "(max − min) / median retail per hotel.", objective: "Pricing-volatility alarm.", formula: "(max − min) / median × 100", source: "POST /hotels/rates", status: "live" },
  { area: "Pricing & Rate Parity", name: "Offers per Hotel", description: "Number of room/board variants priced.", objective: "Availability depth.", formula: "Σ rates returned per hotel", source: "POST /hotels/rates", status: "live" },
  { area: "Pricing & Rate Parity", name: "Board Diversity", description: "Distinct meal-plan boards per hotel (BB / RO / HB / FB / AI).", objective: "Variety for filter UI.", formula: "len(distinct boardName)", source: "POST /hotels/rates", status: "live" },
  { area: "Pricing & Rate Parity", name: "Multi-Supplier Coverage", description: "% of hotels with ≥2 distinct suppliers.", objective: "Rate-parity drift surface.", formula: "Σ(distinct supplierIds ≥ 2) / total × 100", source: "POST /hotels/rates", status: "prod-only" },
  { area: "Pricing & Rate Parity", name: "Rate-Parity Drift bps", description: "Standard deviation of price across suppliers, per hotel.", objective: "Detect supplier undercut/overprice.", formula: "stdev(supplier_price) / median × 10000", source: "POST /hotels/rates", status: "prod-only" },
  { area: "Pricing & Rate Parity", name: "Competitor Undercut %", description: "% of cases where Nuitée price > competitor for same hotel/date.", objective: "Defend customer churn.", formula: "Σ(nuitee > competitor) / matched × 100", source: "scrape + /hotels/rates", status: "prod-only" },
  { area: "Pricing & Rate Parity", name: "Cheapest-Offer Win Rate", description: "% of bookings on lowest available rate per query.", objective: "Pricing engine sanity.", formula: "Σ(book at min rate) / bookings × 100", source: "bookings × rates join", status: "prod-only" },
  { area: "Pricing & Rate Parity", name: "Suggested-Sell-Price Adoption %", description: "% of partners reselling at SSP (vs marking up/down).", objective: "Pricing-discipline signal.", formula: "Σ(partner_resell ≈ SSP) / partner_bookings × 100", source: "partner reseller data", status: "prod-only" },

  // ---------- Booking Funnel ----------
  { area: "Booking Funnel", name: "Search → Shop Rate", description: "% of searches that proceed to rate-shopping.", objective: "Top-of-funnel health.", formula: "shop_events / search_events × 100", source: "events stream", status: "prod-only" },
  { area: "Booking Funnel", name: "Shop → Book Rate", description: "% of rate-shoppers that book.", objective: "Mid-funnel conversion.", formula: "bookings / shop_events × 100", source: "events × bookings", status: "prod-only" },
  { area: "Booking Funnel", name: "Look-to-Book Ratio", description: "Total searches per single booking (lower = better).", objective: "Industry-standard funnel metric.", formula: "search_events / bookings", source: "events stream", status: "prod-only" },
  { area: "Booking Funnel", name: "Confirmation Rate", description: "% of book attempts that confirm.", objective: "Supplier reliability.", formula: "confirmed / total_book_attempts × 100", source: "GET /bookings/list", status: "prod-only" },
  { area: "Booking Funnel", name: "Cancellation Rate", description: "% of confirmed bookings cancelled.", objective: "Refund-cost forecast.", formula: "cancelled / confirmed × 100", source: "GET /bookings/list", status: "prod-only" },
  { area: "Booking Funnel", name: "Refund / Dispute Rate", description: "% of bookings refunded or disputed.", objective: "Operations + chargeback risk.", formula: "(refunded + disputed) / total × 100", source: "GET /bookings/list", status: "prod-only" },
  { area: "Booking Funnel", name: "Booking Lead Time (days)", description: "Days from search to checkin.", objective: "Demand-forecast input.", formula: "median(checkin − created_at)", source: "GET /bookings/list", status: "prod-only" },
  { area: "Booking Funnel", name: "Length-of-Stay (nights)", description: "Distribution of nights per booking.", objective: "Inventory planning + ADR weighting.", formula: "median(checkout − checkin)", source: "GET /bookings/list", status: "prod-only" },
  { area: "Booking Funnel", name: "Repeat-Guest Ratio", description: "% of bookings from guests with prior history.", objective: "Loyalty signal for partners.", formula: "Σ(returning_guest) / total × 100", source: "guests join", status: "prod-only" },

  // ---------- API Customer Health ----------
  { area: "API Customer Health", name: "Customer Concentration (Top-N)", description: "% of GBV from top-N API customers.", objective: "Concentration risk.", formula: "Σ_top_N(GBV) / Σ_total(GBV) × 100", source: "bookings × partner", status: "prod-only" },
  { area: "API Customer Health", name: "Per-Customer GBV", description: "Gross Booking Value per integrated partner.", objective: "Revenue per partner.", formula: "Σ(booking.total_price) per partner_id", source: "GET /bookings/list × partner", status: "prod-only" },
  { area: "API Customer Health", name: "Customer LTV (cohort)", description: "Lifetime value per partner cohort.", objective: "Acquisition payback.", formula: "Σ_cohort(GBV × take_rate)", source: "bookings × cohorts", status: "prod-only" },
  { area: "API Customer Health", name: "Integration Health Score", description: "Composite of error rate, latency, and time-since-last-call.", objective: "Early-warning for at-risk partners.", formula: "0.4 × (1 − err_rate) + 0.3 × latency_z + 0.3 × recency_z", source: "API logs", status: "prod-only" },
  { area: "API Customer Health", name: "Churn Risk Flag", description: "Partner usage trending down 3 months in a row.", objective: "CS team prioritisation.", formula: "monthly_calls(t) < monthly_calls(t−1) × 0.85, 3× in a row", source: "API logs aggregated", status: "prod-only" },
  { area: "API Customer Health", name: "Onboarding Time (days)", description: "Days from signup to first production booking.", objective: "Activation funnel.", formula: "first_booking_at − signup_at", source: "partner records", status: "prod-only" },

  // ---------- API Infrastructure ----------
  { area: "API Infrastructure", name: "API Uptime %", description: "Endpoint availability over period.", objective: "SLA reporting.", formula: "1 − (downtime_seconds / total_seconds)", source: "observability", status: "prod-only" },
  { area: "API Infrastructure", name: "p50 / p95 / p99 Latency (ms)", description: "Latency percentiles per endpoint.", objective: "Performance SLA.", formula: "percentile(response_time, [50, 95, 99])", source: "request traces", status: "prod-only" },
  { area: "API Infrastructure", name: "Error Rate by Endpoint", description: "4xx + 5xx as % of requests, per endpoint.", objective: "Bug surface.", formula: "Σ(status ≥ 400) / Σ(total) × 100", source: "request logs", status: "prod-only" },
  { area: "API Infrastructure", name: "Idempotency Conflicts", description: "Duplicate booking-key collisions.", objective: "Catch retry bugs.", formula: "Σ(409 on /bookings)", source: "request logs", status: "prod-only" },
  { area: "API Infrastructure", name: "Deployment Frequency", description: "Production deployments per week.", objective: "DORA metric — velocity.", formula: "count(prod_deploys) per week", source: "CI/CD", status: "prod-only" },
  { area: "API Infrastructure", name: "Lead Time for Changes", description: "PR-merge to production timestamp.", objective: "DORA metric — flow.", formula: "median(prod_deploy_at − pr_merge_at)", source: "Git × CD", status: "prod-only" },
  { area: "API Infrastructure", name: "Mean Time to Recovery (MTTR)", description: "Time from incident open to resolved.", objective: "DORA metric — resilience.", formula: "median(resolved_at − opened_at)", source: "incident tracker", status: "prod-only" },
  { area: "API Infrastructure", name: "Change Failure Rate", description: "% of deploys that cause an incident.", objective: "DORA metric — quality.", formula: "Σ(deploys → incident) / Σ(deploys) × 100", source: "incidents × deploys", status: "prod-only" },

  // ---------- Agentic / MCP (the differentiator) ----------
  { area: "Agentic / MCP", name: "MCP Tool-Call Success Rate", description: "% of MCP tool calls returning 2xx.", objective: "Agent reliability surface.", formula: "Σ(mcp_status = 200) / Σ(mcp_calls) × 100", source: "MCP server logs", status: "prod-only" },
  { area: "Agentic / MCP", name: "MCP Tool-Call Latency (p95)", description: "p95 latency per MCP tool (search, rates, book, flights).", objective: "Per-tool performance.", formula: "percentile(mcp_response_ms, 95) per tool", source: "MCP middleware", status: "prod-only" },
  { area: "Agentic / MCP", name: "Agent vs Human Funnel", description: "Conversion by traffic source (ChatGPT/Claude/Gemini/human).", objective: "The moat metric.", formula: "bookings / search by source", source: "session-source tag", status: "prod-only" },
  { area: "Agentic / MCP", name: "Agent Intent-to-Book Ratio", description: "% of agent sessions ending in booking.", objective: "Agentic monetisation.", formula: "agent_bookings / agent_sessions × 100", source: "MCP session × bookings", status: "prod-only" },
  { area: "Agentic / MCP", name: "Agent Retry Pattern", description: "Distribution of retries per agent before success.", objective: "Detect MCP friction.", formula: "histogram(retries_to_first_2xx)", source: "MCP middleware", status: "prod-only" },
  { area: "Agentic / MCP", name: "Per-Tool Error Taxonomy", description: "Error code distribution per MCP tool.", objective: "Schema-design feedback loop.", formula: "groupBy(tool, status_code)", source: "MCP logs", status: "prod-only" },
  { area: "Agentic / MCP", name: "Tool-Call Sequence Length", description: "Distinct tools called in a single agent session.", objective: "Workflow complexity signal.", formula: "len(distinct tools per session)", source: "MCP session traces", status: "prod-only" },

  // ---------- Commercial & Financial ----------
  { area: "Commercial & Financial", name: "Gross Booking Value (GBV)", description: "Sum of all bookings × price.", objective: "Headline volume.", formula: "Σ(booking.total_price)", source: "GET /bookings/list", status: "prod-only" },
  { area: "Commercial & Financial", name: "Net Revenue", description: "GBV × effective take-rate.", objective: "Top-line revenue.", formula: "Σ(GBV × take_rate)", source: "bookings × commissions", status: "prod-only" },
  { area: "Commercial & Financial", name: "Effective Take-Rate (system-wide)", description: "Σ commission / Σ GBV.", objective: "Margin health.", formula: "Σ(commission) / Σ(GBV) × 100", source: "bookings", status: "prod-only" },
  { area: "Commercial & Financial", name: "ADR (Average Daily Rate)", description: "Mean nightly rate booked.", objective: "Industry standard.", formula: "Σ(price) / Σ(nights)", source: "bookings", status: "prod-only" },
  { area: "Commercial & Financial", name: "RevPAR proxy", description: "Revenue per available property × night.", objective: "Capacity utilisation signal.", formula: "GBV / (properties × nights_in_period)", source: "bookings + inventory", status: "prod-only" },
  { area: "Commercial & Financial", name: "GBV per Search", description: "Booking value generated per search.", objective: "Top-of-funnel monetisation.", formula: "Σ(GBV) / Σ(searches)", source: "events × bookings", status: "prod-only" },
  { area: "Commercial & Financial", name: "Payout Cadence (days)", description: "Median days from booking to partner payout.", objective: "Cash-flow signal.", formula: "median(payout_at − booking_at)", source: "finance system", status: "prod-only" },

  // ---------- Customer Experience (industry-standard, adapted) ----------
  { area: "Customer Experience", name: "Net Promoter Score (NPS)", description: "Loyalty / referral likelihood.", objective: "Customer-experience benchmark.", formula: "% Promoters (9–10) − % Detractors (0–6)", source: "survey", status: "standard" },
  { area: "Customer Experience", name: "Customer Satisfaction Score (CSAT)", description: "Direct post-stay satisfaction.", objective: "Per-stay quality.", formula: "(satisfied / total) × 100", source: "survey", status: "standard" },
  { area: "Customer Experience", name: "Customer Effort Score (CES)", description: "Ease of completing a booking.", objective: "Friction reduction.", formula: "mean(effort_score 1–7)", source: "in-product survey", status: "standard" },
  { area: "Customer Experience", name: "Review Score Average", description: "Mean review rating across all hotels.", objective: "Catalog quality signal.", formula: "mean(rating)", source: "GET /data/hotels.rating", status: "sandbox" },
  { area: "Customer Experience", name: "Complaint Resolution Time", description: "Median hours to resolve a customer issue.", objective: "Support team SLO.", formula: "median(resolved_at − opened_at)", source: "support tickets", status: "prod-only" },
  { area: "Customer Experience", name: "Personalisation Effectiveness", description: "% of accepted recommendations.", objective: "Recommender lift.", formula: "(accepted / shown) × 100", source: "events", status: "prod-only" },

  // ---------- Compliance & Governance ----------
  { area: "Compliance & Governance", name: "PII Tagging Coverage %", description: "% of tables/columns with PII classification.", objective: "GDPR audit-readiness.", formula: "Σ(tagged) / Σ(total_columns) × 100", source: "data catalog", status: "prod-only" },
  { area: "Compliance & Governance", name: "Data Residency Compliance", description: "% of EU-customer data stored in EU region.", objective: "GDPR Article 44.", formula: "Σ(EU-resident data) / Σ(EU customers) × 100", source: "infra metadata", status: "prod-only" },
  { area: "Compliance & Governance", name: "Right-to-Erasure SLA", description: "Median days to fulfil deletion request.", objective: "GDPR Article 17.", formula: "median(erasure_completed − requested_at)", source: "privacy queue", status: "prod-only" },
  { area: "Compliance & Governance", name: "Access Audit Pass Rate", description: "% of access reviews completed on time.", objective: "SOC2 / ISO27001 control.", formula: "Σ(on-time reviews) / Σ(due reviews) × 100", source: "IAM logs", status: "prod-only" },
  { area: "Compliance & Governance", name: "PCI-Scope Cardinality", description: "Number of systems touching cardholder data.", objective: "Minimise PCI-DSS scope.", formula: "count(systems where stores_card = true)", source: "infra inventory", status: "prod-only" },

  // ---------- Travel Industry Standard ----------
  { area: "Travel Industry Standard", name: "Occupancy Rate %", description: "Booked rooms / available rooms.", objective: "Industry-wide benchmark.", formula: "booked_rooms / available_rooms × 100", source: "PMS data", status: "standard" },
  { area: "Travel Industry Standard", name: "GOPPAR", description: "Gross Operating Profit per Available Room.", objective: "Hotelier P&L metric.", formula: "GOP / available_rooms", source: "PMS + finance", status: "standard" },
  { area: "Travel Industry Standard", name: "On-Time Performance %", description: "Flights/services delivered on time.", objective: "Reliability signal (flights module).", formula: "on_time / total × 100", source: "flights schedules", status: "standard" },
  { area: "Travel Industry Standard", name: "Pre-Travel Engagement", description: "Touchpoints with traveller before checkin.", objective: "Anticipation / upsell.", formula: "mean(touchpoints_pre_travel)", source: "CRM events", status: "standard" },
  { area: "Travel Industry Standard", name: "Post-Travel Engagement %", description: "% travellers engaged after stay.", objective: "Loyalty loop.", formula: "(engaged_post / total) × 100", source: "CRM events", status: "standard" },
  { area: "Travel Industry Standard", name: "Accessibility Compliance Rating", description: "Aggregate accessibility-attribute coverage.", objective: "Inclusive travel.", formula: "mean(accessibility_count / max_attributes)", source: "GET /data/hotels", status: "live" },
];

export const STATUS_META: Record<KpiStatus, { label: string; color: string; description: string }> = {
  live: { label: "LIVE", color: "var(--accent)", description: "Computed live in this demo from the LiteAPI sandbox" },
  sandbox: { label: "SANDBOX-BUILDABLE", color: "var(--accent-blue)", description: "Schema confirmed in sandbox; not yet computed in this demo" },
  "prod-only": { label: "NEEDS PROD", color: "var(--warn)", description: "Requires production API access or telemetry not exposed in sandbox" },
  standard: { label: "INDUSTRY STD", color: "var(--ink-dim)", description: "Industry-standard travel KPI; source varies by deployment" },
};
