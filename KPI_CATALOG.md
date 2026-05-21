# LiteAPI — KPI Catalog (Head-of-Data lens)

> Mapped from the live LiteAPI sandbox (`api.liteapi.travel/v3.0`) + the open-source MCP server (`github.com/liteapi-travel/mcp-server`).

A travel-tech API infrastructure business has a **dual data mandate**: internal BI as the operating layer + product data as a feature in the API itself. This catalog maps every KPI a data org would track at a hotel-booking API business to its source endpoint, and flags what's buildable **now** (sandbox) vs **needs production access**.

---

## Mandate 1 — Internal BI (operating layer for the company)

| KPI | Source | Status |
|---|---|---|
| Gross Booking Value (GBV) | `GET /bookings/list` → `price` aggregated | needs prod (sandbox = 1 booking) |
| Net Revenue | `commission` per booking | needs prod |
| Take-rate (effective) | `(SSP - retail) / retail` per offer | **buildable now** — see `price_competitiveness.py` |
| Confirmation rate | `bookings.status == confirmed / total` | needs prod |
| Cancellation rate | `bookings.status == cancelled / total` | needs prod |
| Refund / dispute rate | `bookings.status == refunded` | needs prod |
| Customer concentration (Top-N % of GBV) | bookings grouped by client / partner | needs prod |
| LTV per customer cohort | bookings over time per client | needs prod |
| Booking lead time (days from search to checkin) | `bookings.created_at` vs `checkin` | needs prod |
| Length of stay (nights distribution) | `bookings.checkout - checkin` | partial — sandbox has 1 |
| API uptime / latency p50–p99 | infra/observability layer | not in REST — needs ops integration |
| Error rate (4xx / 5xx) per endpoint | infra | needs ops |

---

## Mandate 2 — Product data (feature embedded in the API)

| KPI | Source | Status |
|---|---|---|
| **Supplier-quality score (composite)** | `GET /data/hotels` + `GET /data/hotel` | **buildable now** — see `supplier_quality.py` |
| Content completeness % (8 key fields) | `GET /data/hotels` | **built** |
| Description richness (chars stripped of HTML) | `GET /data/hotel.hotelDescription` | **built** |
| Photo richness (count, main-photo present) | `GET /data/hotel.hotelImages` | **built — Meliá has 64 photos** |
| Sentiment per hotel | `GET /data/hotel.sentiment_analysis` | buildable next — schema confirmed |
| Room-type diversity per hotel | `GET /data/hotel.rooms` (7 types for Meliá) | buildable next |
| Facility / accessibility coverage | `GET /data/hotels.facilityIds + accessibilityAttributes` | **built** |
| **Price spread per hotel (max-min/median)** | `POST /hotels/rates` → aggregate retail | **buildable now** — see `price_competitiveness.py` |
| **Median take-rate per hotel** | `POST /hotels/rates` → (SSP - retail)/retail | **built — varies 7% to 49% in Lisbon sample** |
| **Multi-supplier rate-parity drift** | `POST /hotels/rates.roomTypes[].supplierId` | structure ready — sandbox is single-supplier; needs prod |
| Board / occupancy variant coverage | `POST /hotels/rates.roomTypes[].rates[].boardName` | **built** |
| Inventory freshness (last-seen timestamps) | `data/hotel.deletedAt`, `sentiment_updated_at` | buildable next |
| Win rate per supplier (conversion) | rates × bookings join | needs prod bookings volume |
| Conversion lift per supplier | A/B over rank position × supplier | needs prod telemetry |
| Geo coverage gaps | `/data/countries` × `/data/hotels?countryCode=X` | buildable now (light) |

---

## Mandate 3 — Agentic-specific (Nuitée's differentiator)

| KPI | Source | Status |
|---|---|---|
| MCP tool-call success rate per endpoint | `liteapi-travel/mcp-server` logs + Vercel | needs MCP infra access |
| Agent vs human booking funnel | `bookings.source` tag (if exists) | needs prod schema |
| Agent intent-to-book ratio | search → rates → book funnel by session | needs telemetry |
| Tool-call latency by endpoint (`search`, `book`, `rates`, `flights`) | MCP server middleware | buildable — fork the open-source repo, add timing middleware |
| Agent retry / failure patterns | MCP logs by status code | needs MCP infra |
| Per-tool error taxonomy | MCP schemas (9 of them: search/booking/flights/static/prices/vouchers/loyalty/analytics/supplyCustomization) | buildable — inspect open-source schemas |

The agentic KPIs are the differentiator — **no competitor has them yet** because no competitor open-sourced an MCP server. This is the wedge to publish externally (recruiting flywheel + product shaping).

---

## API surface map (what each LiteAPI endpoint exposes)

Probed against sandbox `sand_***` on 2026-05-21:

| Endpoint | Method | Sandbox status | KPI value |
|---|---|---|---|
| `/data/countries` | GET | works, 249 countries | reference dim |
| `/data/hotels?countryCode=X&cityName=Y` | GET | works, returns directory | inventory size, completeness scorecard |
| `/data/hotel?hotelId=X` | GET | works — rich (64 photos, 7 rooms, sentiment, policies, contacts) | deep supplier-quality |
| `/hotels/rates` | POST | works, returns 9 roomTypes per hotel with offers + SSP + commission | pricing, take-rate, board diversity |
| `/bookings/list` | GET | works — 1 sandbox booking | funnel (in prod) |
| `/analytics/*` | GET | 404 in sandbox | needs prod for first-party telemetry |
| `/flights/*` | — | not probed | symmetric pattern to hotels (April 2026 commits show flights schema added to MCP) |

---

## What this proves about a 90-day plan

The first two scripts in this repo already compute:

- A **content-completeness scorecard** ranking 15 Lisbon hotels by 8 quality signals
- A **pricing-competitiveness scorecard** ranking the same 10 by take-rate, spread, board diversity, supplier diversity

That's 30 days of "shape the wedge" work compressed into one afternoon's prototype on the sandbox. In production with real bookings + multi-supplier data, the same loop maps to:

1. Internal Commercial scorecard (which suppliers to push, which to deprioritise)
2. API rank-boost signal (better-quality hotels surface higher → conversion lift)
3. Pricing intelligence (where take-rate is leaking, where competitors are undercutting)
4. Agentic-booking telemetry (how agents convert vs humans — the moat metric)

The strategic value isn't any single KPI. It's that the **same data pipeline** serves the internal team AND ships as a product feature. One build, two payoffs.
