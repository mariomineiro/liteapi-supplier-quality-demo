# LiteAPI Supplier-Quality Demo

Open-source prototype computing supply, pricing and content KPIs over the [LiteAPI](https://liteapi.travel/) public sandbox. Two Python agents + a 70+ KPI catalog + a Next.js dashboard inspired by the LiteAPI portal layout.

No external dependencies for the Python agents (stdlib only). All numbers are live calls against the public sandbox.

---

## What's in here

| File | What it does |
|---|---|
| `supplier_quality.py` | Pulls hotels from `GET /data/hotels`, computes per-hotel quality score (content completeness, photos, facilities, reviews), ranks them, writes CSV + JSON. |
| `price_competitiveness.py` | For the same basket, hits `POST /hotels/rates`, computes per-hotel pricing scorecard (offer count, board diversity, price spread, **median take-rate %**), ranks them. |
| `generate_all_data.py` | Runs both agents across 8 cities (Lisbon, Porto, London, Dublin, Barcelona, Palma, Casablanca, Paris). |
| `KPI_CATALOG.md` | The strategic map: 35+ KPIs across internal-BI, product-data and agentic-MCP, each mapped to its source endpoint, each flagged sandbox-buildable vs needs-prod. |
| `dashboard/` | Next.js 16 dashboard. Sidebar mirrors LiteAPI's portal. Live pages on real sandbox data; rest are locked mockups. |
| `dashboard/public/data/*.json` | Pre-generated snapshots (8 cities × 2 metrics). |

## Run it

```bash
# 1. Drop your sandbox key into .env  (free at https://dashboard.liteapi.travel)
echo 'LITEAPI_KEY=sand_***' > .env

# 2. Content-quality scorecard
python supplier_quality.py --country PT --city Lisbon --limit 20

# 3. Pricing scorecard
python price_competitiveness.py --country PT --city Lisbon --limit 10 \
    --checkin 2026-06-15 --checkout 2026-06-17 --adults 2

# 4. Multi-city refresh (8 cities)
python generate_all_data.py

# 5. Dashboard
cd dashboard
npm install
npm run dev   # http://localhost:3000
```

## Sample output

### supplier_quality.py

```
rank  overall  content  reviews  facilities  stars  hotel
   1   100.0%   100.0%    11357        60    4.0  Meliá Lisboa Aeroporto
   2   100.0%   100.0%     3472        80    4.0  Lumen Hotel & The Lisbon Light Show
   ...
  15    99.2%   100.0%    10965        24    3.0  Hotel Roma  ← outlier: only 24 facilities
```

### price_competitiveness.py

```
  #   score  offers  boards  supp     min      med      max   sprd%   take%  hotel
  1   76.9%     200       2     1  545.08   629.44   654.09   17.3%   30.3%  Hotel Mundial
  ...
 10   56.2%      63       2     1  933.72  1529.39  2730.63  117.5%   49.3%  Corpo Santo  ← pricing outlier
```

## How it's structured

A single data pipeline serves two surfaces — an internal scorecard and an API-side rank-boost signal:

```
LiteAPI MCP / REST   →   per-hotel quality + pricing signals
       │
       ▼
BigQuery (supplier_quality_daily, price_competitiveness_daily)
       │
   joined on hotel_id, refreshed via Cloud Composer DAG
       │
       ├───── Internal scorecard for Commercial / Supply teams
       │        (kill spreadsheet chaos, source-of-truth)
       │
       └───── Rank-boost signal that ships back into the API
                 (data as a product feature, not back-office)
```

The full KPI map is in the dashboard at `/kpi-catalog` (70+ KPIs across business, operating, infrastructure and agentic categories) and in [`KPI_CATALOG.md`](./KPI_CATALOG.md).

## License

MIT. Use freely. The LiteAPI sandbox key in `.env` is yours to provision.
