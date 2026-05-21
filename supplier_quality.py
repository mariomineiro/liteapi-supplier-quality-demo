"""
LiteAPI Supplier-Quality Agent — v0 prototype.

Pulls a sample of hotels from the live LiteAPI for a city, computes per-hotel
supplier-quality signals (content completeness, description richness, photo
presence, review depth, facility count, geo precision), ranks them, and emits
a CSV that *would* land in BigQuery as `supplier_quality_daily` in a real
deployment. The same loop solves the internal scorecard (Commercial / Supply
teams) and a rank-boost signal that ships back into the API.

Usage:
    python supplier_quality.py --country PT --city Lisbon --limit 25

API key is read from .env (LITEAPI_KEY=...). Never commit the key.
"""

from __future__ import annotations

import argparse
import csv
import os
import re
import sys
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any

import urllib.request
import urllib.parse
import json

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
    """LiteAPI returns UTF-8 bytes shown as Latin-1 (e.g. Melià for Meliá). Repair."""
    if not s:
        return ""
    try:
        return s.encode("latin-1").decode("utf-8")
    except (UnicodeEncodeError, UnicodeDecodeError):
        return s


def strip_html(s: str) -> str:
    return re.sub(r"<[^>]+>", " ", s or "")


def fetch_hotels(api_key: str, country: str, city: str, limit: int) -> list[dict[str, Any]]:
    qs = urllib.parse.urlencode({"countryCode": country, "cityName": city, "limit": limit})
    url = f"https://api.liteapi.travel/v3.0/data/hotels?{qs}"
    req = urllib.request.Request(url, headers={"X-API-Key": api_key, "Accept": "application/json"})
    with urllib.request.urlopen(req, timeout=30) as resp:
        payload = json.loads(resp.read())
    return payload.get("data", [])


@dataclass
class HotelQuality:
    hotel_id: str
    name: str
    chain: str
    stars: float | None
    rating: float | None
    review_count: int
    description_chars: int
    has_main_photo: bool
    has_thumbnail: bool
    has_geo: bool
    has_address: bool
    facility_count: int
    accessibility_count: int
    # composite signals (0-100 each)
    content_completeness: float
    review_depth_signal: float
    overall_quality_score: float


def score_hotel(h: dict[str, Any]) -> HotelQuality:
    name = fix_double_encoded(h.get("name") or "")
    chain = fix_double_encoded(h.get("chain") or "")
    description = strip_html(fix_double_encoded(h.get("hotelDescription") or ""))
    description_chars = len(description.strip())

    facility_ids = h.get("facilityIds") or []
    accessibility = h.get("accessibilityAttributes") or []
    review_count = int(h.get("reviewCount") or 0)
    stars = h.get("stars")
    rating = h.get("rating")

    has_main_photo = bool(h.get("main_photo"))
    has_thumbnail = bool(h.get("thumbnail"))
    has_geo = (h.get("latitude") is not None and h.get("longitude") is not None)
    has_address = bool(h.get("address"))

    # ----- composite signals -----
    # content completeness: % of 8 key fields populated
    field_flags = [
        description_chars > 200,
        has_main_photo,
        has_thumbnail,
        has_geo,
        has_address,
        bool(facility_ids),
        stars is not None,
        chain != "",
    ]
    content_completeness = round(100.0 * sum(field_flags) / len(field_flags), 1)

    # review depth: capped log-ish curve (saturates at 500 reviews)
    review_depth_signal = round(min(100.0, (review_count / 5.0)), 1) if review_count else 0.0

    # overall = content (60%) + review depth (20%) + facility richness (20%)
    facility_richness = min(100.0, len(facility_ids) * 4)
    overall = round(0.6 * content_completeness + 0.2 * review_depth_signal + 0.2 * facility_richness, 1)

    return HotelQuality(
        hotel_id=str(h.get("id") or ""),
        name=name[:60],
        chain=chain[:30],
        stars=stars,
        rating=rating,
        review_count=review_count,
        description_chars=description_chars,
        has_main_photo=has_main_photo,
        has_thumbnail=has_thumbnail,
        has_geo=has_geo,
        has_address=has_address,
        facility_count=len(facility_ids),
        accessibility_count=len(accessibility),
        content_completeness=content_completeness,
        review_depth_signal=review_depth_signal,
        overall_quality_score=overall,
    )


def print_table(rows: list[HotelQuality]) -> None:
    rows = sorted(rows, key=lambda r: r.overall_quality_score, reverse=True)
    print(f"{'rank':>4}  {'overall':>7}  {'content':>7}  {'reviews':>7}  {'facilities':>10}  {'stars':>5}  hotel")
    print("-" * 110)
    for i, r in enumerate(rows, 1):
        stars_s = f"{r.stars:.1f}" if isinstance(r.stars, (int, float)) else "  -"
        name = r.name + (f" / {r.chain}" if r.chain else "")
        print(
            f"{i:>4}  {r.overall_quality_score:>6.1f}%  {r.content_completeness:>6.1f}%  "
            f"{r.review_count:>7}  {r.facility_count:>10}  {stars_s:>5}  {name}"
        )


def write_csv(rows: list[HotelQuality], path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    rows = sorted(rows, key=lambda r: r.overall_quality_score, reverse=True)
    with path.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=list(asdict(rows[0]).keys()))
        w.writeheader()
        for r in rows:
            w.writerow(asdict(r))


def write_json(rows: list[HotelQuality], path: Path, meta: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    rows_sorted = sorted(rows, key=lambda r: r.overall_quality_score, reverse=True)
    payload = {
        "meta": meta,
        "rows": [asdict(r) for r in rows_sorted],
    }
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--country", default="PT", help="ISO country code (default PT)")
    parser.add_argument("--city", default="Lisbon", help="City name (default Lisbon)")
    parser.add_argument("--limit", type=int, default=20, help="Max hotels to fetch (default 20)")
    args = parser.parse_args()

    env = load_env()
    api_key = env.get("LITEAPI_KEY") or os.environ.get("LITEAPI_KEY")
    if not api_key:
        print("ERROR: LITEAPI_KEY not found in .env or environment", file=sys.stderr)
        return 2

    print(f"\n=== LiteAPI Supplier-Quality Agent ===")
    print(f"city: {args.city} ({args.country}) | sample size: {args.limit}\n")

    hotels = fetch_hotels(api_key, args.country, args.city, args.limit)
    if not hotels:
        print("No hotels returned from API.")
        return 1

    scored = [score_hotel(h) for h in hotels]
    print_table(scored)

    slug = f"{args.country.lower()}-{args.city.lower().replace(' ', '-')}"
    csv_path = OUTPUT_DIR / f"supplier_quality_{slug}.csv"
    write_csv(scored, csv_path)
    json_path = Path(__file__).parent / "dashboard" / "public" / "data" / f"quality-{slug}.json"
    write_json(scored, json_path, {
        "city": args.city, "country": args.country,
        "sample_size": len(scored), "generated_at": __import__("datetime").datetime.utcnow().isoformat() + "Z",
    })
    print(f"\nCSV  -> {csv_path}")
    print(f"JSON -> {json_path}")
    print(f"(in a real deployment this lands in BigQuery as supplier_quality_daily)\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
