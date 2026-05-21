"""
LiteAPI Price-Competitiveness Agent — v0 prototype.

Purpose. Second slice of the Supplier-Quality story. For a basket of hotels
in a city, hit POST /hotels/rates with a common checkin/checkout/occupancy,
then compute per-hotel:
  - rates returned
  - distinct suppliers
  - min / median / max retail rate
  - price spread (max-min as % of median)
  - cheapest supplier id

This is the second half of "data as a product feature":
  supplier_quality.py = content scorecard
  price_competitiveness.py = pricing scorecard
Together they produce a multi-dimensional supply-quality signal that maps
both to the internal Commercial dashboard AND the API rank-boost signal.

Usage:
    python price_competitiveness.py --country PT --city Lisbon --limit 10 \
        --checkin 2026-06-15 --checkout 2026-06-17 --adults 2

API key is read from .env. Never commit the key.
"""

from __future__ import annotations

import argparse
import csv
import json
import os
import sys
import urllib.parse
import urllib.request
from dataclasses import asdict, dataclass
from pathlib import Path
from statistics import median
from typing import Any

ROOT = Path(__file__).parent
ENV_PATH = ROOT / ".env"
OUTPUT_DIR = ROOT / "output"


def load_env() -> dict[str, str]:
    env: dict[str, str] = {}
    if ENV_PATH.exists():
        for raw in ENV_PATH.read_text().splitlines():
            line = raw.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, v = line.split("=", 1)
            env[k.strip()] = v.strip().strip('"').strip("'")
    return env


def fix_double_encoded(s: str | None) -> str:
    if not s:
        return ""
    try:
        return s.encode("latin-1").decode("utf-8")
    except (UnicodeEncodeError, UnicodeDecodeError):
        return s


def http_get(url: str, headers: dict[str, str]) -> Any:
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read())


def http_post(url: str, body: dict[str, Any], headers: dict[str, str]) -> Any:
    data = json.dumps(body).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data,
        headers={**headers, "Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=60) as resp:
        return json.loads(resp.read())


def fetch_hotels(api_key: str, country: str, city: str, limit: int) -> list[dict[str, Any]]:
    qs = urllib.parse.urlencode({"countryCode": country, "cityName": city, "limit": limit})
    url = f"https://api.liteapi.travel/v3.0/data/hotels?{qs}"
    return http_get(url, {"X-API-Key": api_key, "Accept": "application/json"}).get("data", [])


def fetch_rates(api_key: str, hotel_ids: list[str], checkin: str, checkout: str, adults: int, currency: str, nationality: str) -> list[dict[str, Any]]:
    url = "https://api.liteapi.travel/v3.0/hotels/rates"
    body = {
        "hotelIds": hotel_ids,
        "occupancies": [{"adults": adults}],
        "currency": currency,
        "guestNationality": nationality,
        "checkin": checkin,
        "checkout": checkout,
    }
    return http_post(url, body, {"X-API-Key": api_key}).get("data", [])


@dataclass
class PriceSignal:
    hotel_id: str
    hotel_name: str
    offers_returned: int          # number of room/board variants priced
    distinct_suppliers: int        # multi-supplier signal (rate-parity in prod)
    distinct_boards: int           # board diversity (Room Only, BB, HB...)
    min_retail: float | None       # cheapest offer (you pay the partner)
    median_retail: float | None
    max_retail: float | None
    price_spread_pct: float | None # (max-min)/median * 100
    median_ssp: float | None       # suggested-selling-price (what partner resells at)
    median_take_rate_pct: float | None  # (SSP - retail)/retail — margin signal
    competitiveness_score: float   # composite 0-100


def _amount(node: Any) -> float | None:
    """Pull a numeric .amount from {amount, currency} dicts (or first item of list)."""
    if node is None:
        return None
    if isinstance(node, list) and node:
        node = node[0]
    if isinstance(node, dict):
        v = node.get("amount")
        return float(v) if v is not None else None
    return None


def score_pricing(hotel_payload: dict[str, Any], hotel_name: str) -> PriceSignal:
    room_types = hotel_payload.get("roomTypes") or []
    retails: list[float] = []
    ssps: list[float] = []
    take_rates: list[float] = []
    suppliers: set[str] = set()
    boards: set[str] = set()

    for rt in room_types:
        retail = _amount(rt.get("offerRetailRate"))
        ssp = _amount(rt.get("suggestedSellingPrice"))
        if retail is not None:
            retails.append(retail)
            if ssp and retail > 0:
                ssps.append(ssp)
                take_rates.append((ssp - retail) / retail * 100.0)
        supplier_id = str(rt.get("supplierId") or rt.get("supplier") or "")
        if supplier_id:
            suppliers.add(supplier_id)
        # board diversity lives on the rate variants under this roomType
        for rate in rt.get("rates") or []:
            board = rate.get("boardName") or rate.get("boardType")
            if board:
                boards.add(board)

    if not retails:
        return PriceSignal(
            hotel_id=hotel_payload.get("hotelId", ""),
            hotel_name=hotel_name,
            offers_returned=0, distinct_suppliers=0, distinct_boards=0,
            min_retail=None, median_retail=None, max_retail=None,
            price_spread_pct=None, median_ssp=None, median_take_rate_pct=None,
            competitiveness_score=0.0,
        )

    p_min, p_med, p_max = min(retails), median(retails), max(retails)
    spread_pct = round(100.0 * (p_max - p_min) / p_med, 1) if p_med else 0.0
    med_ssp = round(median(ssps), 2) if ssps else None
    med_take = round(median(take_rates), 1) if take_rates else None

    # Composite competitiveness (0-100):
    #   25% — supplier diversity (multi-supplier signal — flat in sandbox, real in prod)
    #   25% — offers / board diversity (more variants = better coverage)
    #   25% — take-rate (higher margin = better commercial signal, capped)
    #   25% — inverse spread (tighter spread = healthier pricing)
    diversity_signal = min(100.0, len(suppliers) * 25.0)
    variant_signal = min(100.0, (len(retails) + len(boards)) * 5.0)
    take_signal = min(100.0, (med_take or 0.0) * 10.0)  # 10% take-rate → 100 score
    spread_health = max(0.0, 100.0 - spread_pct)
    composite = round(
        0.25 * diversity_signal + 0.25 * variant_signal +
        0.25 * take_signal + 0.25 * spread_health, 1
    )

    return PriceSignal(
        hotel_id=hotel_payload.get("hotelId", ""),
        hotel_name=hotel_name,
        offers_returned=len(retails),
        distinct_suppliers=len(suppliers),
        distinct_boards=len(boards),
        min_retail=round(p_min, 2),
        median_retail=round(p_med, 2),
        max_retail=round(p_max, 2),
        price_spread_pct=spread_pct,
        median_ssp=med_ssp,
        median_take_rate_pct=med_take,
        competitiveness_score=composite,
    )


def print_table(rows: list[PriceSignal], currency: str) -> None:
    rows = sorted(rows, key=lambda r: r.competitiveness_score, reverse=True)
    print(f"{'#':>3}  {'score':>6}  {'offers':>6}  {'boards':>6}  {'supp':>4}  {'min':>7}  {'med':>7}  {'max':>7}  {'sprd%':>6}  {'take%':>6}  hotel")
    print("-" * 120)
    for i, r in enumerate(rows, 1):
        def f(x): return f"{x:>7.2f}" if isinstance(x, (int, float)) else "      -"
        spread = f"{r.price_spread_pct:>5.1f}%" if r.price_spread_pct is not None else "     -"
        take = f"{r.median_take_rate_pct:>5.1f}%" if r.median_take_rate_pct is not None else "     -"
        print(
            f"{i:>3}  {r.competitiveness_score:>5.1f}%  {r.offers_returned:>6}  "
            f"{r.distinct_boards:>6}  {r.distinct_suppliers:>4}  "
            f"{f(r.min_retail)}  {f(r.median_retail)}  {f(r.max_retail)}  "
            f"{spread:>6}  {take:>6}  {r.hotel_name[:40]}"
        )
    print(f"\n(retail prices in {currency} for the date range / occupancy above; take% = (SSP - retail)/retail)")
    print("(supp=1 across the board is expected in sandbox — single supplier `nuitee`. In prod this column reveals rate parity drift.)")


def write_csv(rows: list[PriceSignal], path: Path) -> None:
    if not rows:
        return
    path.parent.mkdir(parents=True, exist_ok=True)
    rows = sorted(rows, key=lambda r: r.competitiveness_score, reverse=True)
    with path.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=list(asdict(rows[0]).keys()))
        w.writeheader()
        for r in rows:
            w.writerow(asdict(r))


def write_json(rows: list[PriceSignal], path: Path, meta: dict[str, Any]) -> None:
    if not rows:
        return
    path.parent.mkdir(parents=True, exist_ok=True)
    rows_sorted = sorted(rows, key=lambda r: r.competitiveness_score, reverse=True)
    payload = {"meta": meta, "rows": [asdict(r) for r in rows_sorted]}
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--country", default="PT")
    parser.add_argument("--city", default="Lisbon")
    parser.add_argument("--limit", type=int, default=10)
    parser.add_argument("--checkin", default="2026-06-15")
    parser.add_argument("--checkout", default="2026-06-17")
    parser.add_argument("--adults", type=int, default=2)
    parser.add_argument("--currency", default="EUR")
    parser.add_argument("--nationality", default="PT")
    args = parser.parse_args()

    env = load_env()
    api_key = env.get("LITEAPI_KEY") or os.environ.get("LITEAPI_KEY")
    if not api_key:
        print("ERROR: LITEAPI_KEY not found in .env", file=sys.stderr)
        return 2

    print(f"\n=== LiteAPI Price-Competitiveness Agent ===")
    print(f"city: {args.city} ({args.country})  |  dates: {args.checkin} -> {args.checkout}  |  pax: {args.adults}  |  basket: {args.limit}\n")

    hotels = fetch_hotels(api_key, args.country, args.city, args.limit)
    if not hotels:
        print("No hotels in directory.")
        return 1

    id_to_name = {h["id"]: fix_double_encoded(h.get("name") or "") for h in hotels}
    hotel_ids = list(id_to_name.keys())
    print(f"fetched {len(hotel_ids)} hotels from directory; querying rates for all...\n")

    rates_payload = fetch_rates(api_key, hotel_ids, args.checkin, args.checkout, args.adults, args.currency, args.nationality)
    print(f"rates returned for {len(rates_payload)} hotels  ({len(hotel_ids) - len(rates_payload)} with zero availability)\n")

    signals = [score_pricing(p, id_to_name.get(p.get("hotelId", ""), "?")) for p in rates_payload]
    if not signals:
        print("No priceable hotels in the basket for these dates.")
        return 1

    print_table(signals, args.currency)
    slug = f"{args.country.lower()}-{args.city.lower().replace(' ', '-')}"
    csv_path = OUTPUT_DIR / f"price_competitiveness_{slug}.csv"
    write_csv(signals, csv_path)
    json_path = Path(__file__).parent / "dashboard" / "public" / "data" / f"pricing-{slug}.json"
    write_json(signals, json_path, {
        "city": args.city, "country": args.country, "currency": args.currency,
        "checkin": args.checkin, "checkout": args.checkout, "adults": args.adults,
        "sample_size": len(signals),
        "generated_at": __import__("datetime").datetime.utcnow().isoformat() + "Z",
    })
    print(f"\nCSV  -> {csv_path}")
    print(f"JSON -> {json_path}")
    print(f"(in production: lands in BigQuery as price_competitiveness_daily; joined with supplier_quality_daily on hotel_id)\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
