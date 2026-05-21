"""Run both agents for a basket of cities. Writes CSVs to ./output/ and JSON
snapshots to ./dashboard/public/data/ that the Next.js dashboard consumes.

Cities chosen to span major EU + MENA hotel markets:
  - Lisbon, Porto, Barcelona, Palma, Paris, London, Dublin, Casablanca
"""
from __future__ import annotations

import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).parent

CITIES = [
    ("PT", "Lisbon"),
    ("PT", "Porto"),
    ("ES", "Barcelona"),
    ("ES", "Palma"),
    ("FR", "Paris"),
    ("GB", "London"),
    ("IE", "Dublin"),
    ("MA", "Casablanca"),
]


def run(cmd: list[str]) -> int:
    print(f"\n$ {' '.join(cmd)}")
    return subprocess.call(cmd, cwd=str(ROOT))


def main() -> int:
    fails = 0
    for country, city in CITIES:
        rc1 = run([sys.executable, "supplier_quality.py", "--country", country, "--city", city, "--limit", "20"])
        rc2 = run([
            sys.executable, "price_competitiveness.py",
            "--country", country, "--city", city, "--limit", "10",
            "--checkin", "2026-06-15", "--checkout", "2026-06-17",
        ])
        if rc1 or rc2:
            fails += 1
            print(f"!! {country}/{city} had failures (rc={rc1},{rc2})")
    print(f"\nDone. {len(CITIES) - fails}/{len(CITIES)} cities ok.")
    return 0 if fails == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
