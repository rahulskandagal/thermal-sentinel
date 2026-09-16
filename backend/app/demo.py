"""Offline demo dataset.

Generates a realistic VIIRS-format hotspot archive (90 days, Mar–May 2025) over India
around *real* industrial locations, with the physical behaviour of each source type:

  refineries / steel / power  → near-daily, day+night, moderate FRP, low-moderate variance
  gas flares                  → near-daily, night-dominated, low steady FRP
  coal-mine fires (Jharia)    → persistent, spatially diffuse, low FRP
  crop-residue burning        → Apr–May daytime bursts on cropland, 1–2 days, low FRP
  wildfires                   → multi-day spreading events on forest/shrub, high FRP
  landfill fires              → sporadic, built-up land

Ground-truth labels are kept so the ML model can be trained and evaluated. The same
pipeline runs unchanged on live FIRMS data once a MAP_KEY is configured.
"""
from __future__ import annotations

import json
from datetime import date, datetime, timedelta, timezone

import numpy as np
import pandas as pd

from . import config

DEMO_END = date(2025, 5, 29)
DEMO_DAYS = 90
DEMO_START = DEMO_END - timedelta(days=DEMO_DAYS - 1)

# name, lat, lon, site_type, daily_prob, dets/day (lo,hi), night_frac, frp_mean, frp_cv
SITES = [
    ("Jamnagar Refinery Complex", 22.352, 70.049, "refinery", 0.92, (3, 8), 0.60, 18, 0.45),
    ("Paradip Refinery", 20.284, 86.616, "refinery", 0.85, (2, 5), 0.60, 14, 0.45),
    ("Mathura Refinery", 27.472, 77.700, "refinery", 0.80, (1, 4), 0.55, 12, 0.45),
    ("Panipat Refinery & Petrochemical", 29.425, 76.930, "refinery", 0.85, (2, 5), 0.60, 15, 0.45),
    ("Guru Gobind Singh Refinery, Bathinda", 30.258, 74.921, "refinery", 0.80, (1, 4), 0.60, 12, 0.45),
    ("MRPL Mangalore", 12.972, 74.830, "refinery", 0.80, (1, 4), 0.60, 12, 0.45),
    ("Hazira Petrochemical Complex", 21.105, 72.650, "chemical_plant", 0.75, (1, 3), 0.55, 10, 0.5),
    ("Tata Steel Jamshedpur", 22.790, 86.200, "steel_plant", 0.92, (3, 8), 0.50, 26, 0.5),
    ("Bokaro Steel Plant", 23.672, 86.150, "steel_plant", 0.90, (3, 7), 0.50, 24, 0.5),
    ("Bhilai Steel Plant", 21.190, 81.380, "steel_plant", 0.92, (3, 8), 0.50, 28, 0.5),
    ("Rourkela Steel Plant", 22.220, 84.860, "steel_plant", 0.90, (2, 6), 0.50, 22, 0.5),
    ("Visakhapatnam Steel Plant", 17.630, 83.170, "steel_plant", 0.88, (2, 6), 0.50, 22, 0.5),
    ("JSW Vijayanagar Steel", 15.180, 76.700, "steel_plant", 0.92, (3, 8), 0.50, 30, 0.5),
    ("Durgapur Steel Plant", 23.533, 87.270, "steel_plant", 0.85, (2, 5), 0.50, 18, 0.5),
    ("Mundra Thermal Power", 22.822, 69.545, "power_plant", 0.70, (1, 3), 0.50, 11, 0.55),
    ("Korba Super Thermal Power", 22.360, 82.680, "power_plant", 0.75, (1, 3), 0.50, 12, 0.55),
    ("Singrauli / Vindhyachal STPS", 24.100, 82.670, "power_plant", 0.75, (1, 3), 0.50, 12, 0.55),
    ("NTPC Talcher Kaniha", 20.945, 85.088, "power_plant", 0.70, (1, 3), 0.50, 10, 0.55),
    ("Sipat Thermal Power", 22.135, 82.290, "power_plant", 0.65, (1, 2), 0.50, 9, 0.55),
    ("Ramagundam STPS", 18.755, 79.470, "power_plant", 0.65, (1, 2), 0.50, 9, 0.55),
    ("NALCO Angul Smelter", 20.840, 85.100, "steel_plant", 0.85, (2, 5), 0.50, 20, 0.5),
    ("Vedanta Jharsuguda Smelter", 21.800, 84.010, "steel_plant", 0.85, (2, 5), 0.50, 20, 0.5),
    ("UltraTech Cement Awarpur", 19.900, 79.400, "cement_plant", 0.50, (1, 2), 0.45, 8, 0.5),
    ("ACC Wadi Cement", 17.060, 76.990, "cement_plant", 0.50, (1, 2), 0.45, 8, 0.5),
    ("Shree Cement Beawar", 26.050, 74.330, "cement_plant", 0.50, (1, 2), 0.45, 8, 0.5),
]

# Oil & gas fields with flares: centre + number of flare stacks spread around it
FLARE_FIELDS = [
    ("Mangala Oil Field, Barmer", 25.955, 71.445, 4),
    ("Mehsana ONGC Field", 23.590, 72.380, 3),
    ("Ankleshwar ONGC Field", 21.620, 73.010, 3),
    ("Duliajan Oil Field, Assam", 27.365, 95.310, 3),
    ("Hazira LNG / gas terminal flare", 21.115, 72.640, 1),
    ("Jamnagar refinery flare stacks", 22.365, 70.070, 2),
    ("Paradip refinery flare", 20.295, 86.630, 1),
]

MINES = [
    ("Jharia Coalfield (coal-seam fires)", 23.740, 86.420, 3.0, 0.85, (4, 12), 0.55, 6, 0.6),
    ("Raniganj Coalfield", 23.620, 87.130, 2.0, 0.55, (1, 4), 0.50, 5, 0.6),
    ("Singareni Collieries", 17.970, 79.600, 1.5, 0.45, (1, 3), 0.45, 5, 0.6),
    ("Bellary Iron Ore Quarries", 15.150, 76.920, 1.5, 0.30, (1, 2), 0.20, 6, 0.6),
    ("Keonjhar Iron Ore Mines", 21.630, 85.580, 1.5, 0.30, (1, 2), 0.20, 6, 0.6),
]

# "Unregistered" industrial clusters (sponge-iron belts) – behave industrial but absent from OSM sites
UNREGISTERED = [
    ("Raigarh sponge-iron cluster", 21.900, 83.400, 0.70, (1, 3), 0.50, 12, 0.6),
    ("Siltara industrial area, Raipur", 21.380, 81.640, 0.70, (1, 3), 0.50, 12, 0.6),
    ("Chandil sponge-iron units", 22.960, 86.050, 0.60, (1, 2), 0.50, 10, 0.6),
    ("Bellary sponge-iron units", 15.230, 76.820, 0.60, (1, 2), 0.50, 10, 0.6),
]

BRICK_KILN_BELTS = [  # centre, radius_deg, n kilns
    ("Kanpur–Unnao brick kiln belt", 26.55, 80.40, 0.25, 25),
    ("Patna brick kiln belt", 25.55, 85.20, 0.25, 20),
    ("Varanasi brick kiln belt", 25.30, 82.90, 0.20, 15),
]

# Crop residue burning regions (Apr 10 – May 25, wheat harvest)
AGRI_REGIONS = [  # centre, spread_deg, n fires
    ("Punjab – Sangrur/Ludhiana", 30.55, 75.70, 0.55, 1500),
    ("Haryana – Karnal/Kaithal", 29.65, 76.60, 0.45, 800),
    ("Madhya Pradesh – Vidisha/Hoshangabad", 23.30, 77.60, 0.6, 700),
    ("Uttar Pradesh – Bareilly/Shahjahanpur", 28.10, 79.70, 0.45, 400),
]

# Forest fire regions (Mar–May) : centre, spread_deg, n events, landcover
FOREST_REGIONS = [
    ("Uttarakhand Chir-pine forests", 29.95, 79.30, 0.55, 14, "forest"),
    ("Similipal, Odisha", 21.85, 86.30, 0.35, 8, "forest"),
    ("Bandipur–Nagarhole", 11.80, 76.50, 0.35, 6, "forest"),
    ("Bandhavgarh–Kanha, MP", 23.20, 81.00, 0.5, 8, "forest"),
    ("Mizoram jhum hills", 23.40, 92.90, 0.5, 10, "shrub_grass"),
    ("Sahyadri / Satara grasslands", 17.60, 73.90, 0.4, 5, "shrub_grass"),
]

LANDFILLS = [("Ghazipur landfill, Delhi", 28.623, 77.328), ("Deonar dumping ground, Mumbai", 19.060, 72.925),
             ("Bhalswa landfill, Delhi", 28.740, 77.160), ("Brahmapuram, Kochi", 10.000, 76.355)]


# ------------------------------------------------------------------ helpers

def _overpass_time(rng, night: bool) -> tuple[int, int]:
    """Approximate VIIRS overpass times over India (UTC)."""
    if night:
        return int(rng.choice([19, 20, 21])), int(rng.integers(0, 60))
    return int(rng.choice([7, 8, 8])), int(rng.integers(0, 60))


def _row(rng, lat, lon, day: date, night: bool, frp: float, label: str, landcover: str, src: str):
    h, m = _overpass_time(rng, night)
    frp = max(0.4, float(frp))
    bright = (300 + 10 * np.log1p(frp) + rng.normal(0, 4)) if night else (325 + 12 * np.log1p(frp) + rng.normal(0, 5))
    bright = min(bright, 367.0)
    conf = "h" if frp > 40 else ("l" if frp < 3 else "n")
    return {
        "latitude": round(lat + rng.normal(0, 0.0012), 5), "longitude": round(lon + rng.normal(0, 0.0012), 5),
        "acq_datetime": datetime(day.year, day.month, day.day, h, m, tzinfo=timezone.utc),
        "satellite": str(rng.choice(["N", "1"])), "instrument": "VIIRS",
        "brightness": round(bright, 1), "brightness_2": round(bright - rng.uniform(15, 45), 1),
        "frp": round(frp, 2), "confidence": {"l": 0.3, "n": 0.6, "h": 0.9}[conf],
        "daynight": "N" if night else "D", "scan": 0.39, "track": 0.36,
        "true_label": label, "landcover": landcover, "demo_source": src,
    }


def _lognormal(rng, mean, cv, size=None):
    sigma = np.sqrt(np.log(1 + cv ** 2))
    mu = np.log(mean) - sigma ** 2 / 2
    return rng.lognormal(mu, sigma, size)


def _point_source(rng, rows, name, lat, lon, p_day, dets, night_frac, frp_mean, frp_cv, label, landcover,
                  jitter=0.004, incident_day: date | None = None, season=None):
    for i in range(DEMO_DAYS):
        day = DEMO_START + timedelta(days=i)
        if season and day.month not in season:
            continue
        if rng.random() > p_day:
            continue
        n = int(rng.integers(dets[0], dets[1] + 1))
        boost = 8.0 if incident_day and day == incident_day else 1.0
        for _ in range(n):
            night = rng.random() < night_frac
            lc = landcover if rng.random() > 0.08 else str(rng.choice(["unknown", "built"]))
            rows.append(_row(rng, lat + rng.normal(0, jitter), lon + rng.normal(0, jitter), day, night,
                             _lognormal(rng, frp_mean, frp_cv) * boost, label, lc, name))


# ------------------------------------------------------------------ generator

def generate(seed: int = 7) -> tuple[pd.DataFrame, list[dict]]:
    rng = np.random.default_rng(seed)
    rows: list[dict] = []
    sites: list[dict] = []

    incidents = {"Jamnagar Refinery Complex": date(2025, 4, 21), "Bhilai Steel Plant": date(2025, 5, 9),
                 "Hazira Petrochemical Complex": date(2025, 3, 28)}
    for k, (name, lat, lon, st, p, dets, nf, frp, cv) in enumerate(SITES):
        sites.append({"id": f"site{k}", "lat": lat, "lon": lon, "name": name, "site_type": st, "source": "osm",
                      "tags": {"landuse": "industrial", "name": name}})
        _point_source(rng, rows, name, lat, lon, p, dets, nf, frp, cv, "INDUSTRIAL_FIRE", "industrial",
                      incident_day=incidents.get(name))

    for k, (name, lat, lon, n_stacks) in enumerate(FLARE_FIELDS):
        for j in range(n_stacks):
            flat, flon = lat + rng.normal(0, 0.03), lon + rng.normal(0, 0.03)
            sites.append({"id": f"flare{k}_{j}", "lat": flat, "lon": flon, "name": f"{name} – flare {j + 1}",
                          "site_type": "gas_flare", "source": "osm", "tags": {"man_made": "flare", "name": name}})
            _point_source(rng, rows, name, flat, flon, 0.9, (1, 2), 0.85, 6, 0.3, "GAS_FLARE",
                          str(rng.choice(["industrial", "bare", "unknown"])), jitter=0.0015)

    for k, (name, lat, lon, rad_km, p, dets, nf, frp, cv) in enumerate(MINES):
        sites.append({"id": f"mine{k}", "lat": lat, "lon": lon, "name": name, "site_type": "mine", "source": "osm",
                      "tags": {"landuse": "quarry", "name": name}})
        _point_source(rng, rows, name, lat, lon, p, dets, nf, frp, cv, "MINING_ACTIVITY", "mining",
                      jitter=rad_km / 111.0 * 0.5)

    for name, lat, lon, p, dets, nf, frp, cv in UNREGISTERED:
        for j in range(3):
            _point_source(rng, rows, name, lat + rng.normal(0, 0.02), lon + rng.normal(0, 0.02), p, dets, nf, frp, cv,
                          "INDUSTRIAL_FIRE", "industrial", jitter=0.002)

    for k, (name, lat, lon, spread, n) in enumerate(BRICK_KILN_BELTS):
        for j in range(n):
            klat, klon = lat + rng.uniform(-spread, spread), lon + rng.uniform(-spread, spread)
            if j % 3 == 0:  # only a third of kilns are mapped in OSM
                sites.append({"id": f"kiln{k}_{j}", "lat": klat, "lon": klon, "name": "Brick kiln",
                              "site_type": "brick_kiln", "source": "osm", "tags": {"industrial": "brickyard"}})
            _point_source(rng, rows, name, klat, klon, 0.35, (1, 1), 0.4, 4, 0.5, "INDUSTRIAL_FIRE",
                          str(rng.choice(["industrial", "cropland", "unknown"], p=[0.5, 0.3, 0.2])), jitter=0.001)

    # Agricultural residue burning: Apr 10 – May 25 (wheat) daytime, 1-2 days
    agri_days = [d for d in (DEMO_START + timedelta(days=i) for i in range(DEMO_DAYS)) if date(2025, 4, 10) <= d <= date(2025, 5, 25)]
    for name, lat, lon, spread, n in AGRI_REGIONS:
        for _ in range(n):
            flat, flon = lat + rng.normal(0, spread), lon + rng.normal(0, spread)
            d0 = agri_days[int(rng.integers(0, len(agri_days)))]
            for dd in range(1 if rng.random() < 0.8 else 2):
                for _ in range(int(rng.integers(1, 4))):
                    lc = "cropland" if rng.random() > 0.07 else "unknown"
                    rows.append(_row(rng, flat, flon, d0 + timedelta(days=dd), rng.random() < 0.08,
                                     _lognormal(rng, 7, 0.7), "AGRICULTURAL_BURN", lc, name))

    # Wildfires: multi-day spreading events
    for name, lat, lon, spread, n_events, lc in FOREST_REGIONS:
        for _ in range(n_events):
            flat, flon = lat + rng.normal(0, spread), lon + rng.normal(0, spread)
            start = DEMO_START + timedelta(days=int(rng.integers(0, DEMO_DAYS - 7)))
            dur = int(rng.integers(2, 8))
            for dd in range(dur):
                flat += rng.normal(0, 0.012)
                flon += rng.normal(0, 0.012)
                for _ in range(int(rng.integers(3, 16))):
                    rows.append(_row(rng, flat + rng.normal(0, 0.01), flon + rng.normal(0, 0.01), start + timedelta(days=dd),
                                     rng.random() < 0.3, _lognormal(rng, 40, 0.9), "WILDFIRE",
                                     lc if rng.random() > 0.06 else "unknown", name))

    # Landfill / urban waste fires
    for name, lat, lon in LANDFILLS:
        for _ in range(int(rng.integers(1, 3))):
            start = DEMO_START + timedelta(days=int(rng.integers(0, DEMO_DAYS - 4)))
            for dd in range(int(rng.integers(2, 5))):
                for _ in range(int(rng.integers(1, 4))):
                    rows.append(_row(rng, lat, lon, start + timedelta(days=dd), rng.random() < 0.4,
                                     _lognormal(rng, 15, 0.8), "OTHER", "built", name))

    df = pd.DataFrame(rows).sort_values("acq_datetime").reset_index(drop=True)
    return df, sites


def sites_to_geojson(sites: list[dict]) -> dict:
    return {"type": "FeatureCollection", "features": [
        {"type": "Feature", "geometry": {"type": "Point", "coordinates": [s["lon"], s["lat"]]},
         "properties": {"id": s["id"], "name": s["name"], "site_type": s["site_type"], "source": s["source"]}}
        for s in sites]}


def write_demo_files() -> tuple[pd.DataFrame, list[dict]]:
    df, sites = generate()
    out = df.copy()
    out["acq_datetime"] = out["acq_datetime"].dt.strftime("%Y-%m-%dT%H:%M:%SZ")
    out.to_csv(config.DATA_DIR / "demo_hotspots.csv", index=False)
    (config.DATA_DIR / "demo_sites.geojson").write_text(json.dumps(sites_to_geojson(sites), indent=1), encoding="utf-8")
    return df, sites
