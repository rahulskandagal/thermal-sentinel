"""OpenStreetMap (Overpass) access: industrial infrastructure + land-cover polygons.

Rather than downloading all of India, we ask Overpass only for features *around* the
locations where hotspots actually occurred (Overpass `around:` with a coordinate list),
chunked so each query stays small. Responses are cached on disk.
"""
from __future__ import annotations

import hashlib
import json
import logging
import time
from typing import Iterable

import requests
from shapely.geometry import Point, Polygon, shape

from . import config

log = logging.getLogger(__name__)
CACHE_DIR = config.DATA_DIR / "cache"
CACHE_DIR.mkdir(parents=True, exist_ok=True)

SITE_TYPES = ["refinery", "steel_plant", "power_plant", "gas_flare", "cement_plant",
              "brick_kiln", "mine", "chemical_plant", "industrial"]

# ---------------------------------------------------------------- tag interpretation

def classify_site_tags(tags: dict) -> str | None:
    """Map OSM tags -> coarse thermal-relevant site type (None = not a site of interest)."""
    t = {k: str(v).lower() for k, v in tags.items()}
    ind = t.get("industrial", "")
    product = t.get("product", "")
    man_made = t.get("man_made", "")
    name = t.get("name", "")

    if man_made == "flare" or "flare" in name:
        return "gas_flare"
    if ind in ("refinery", "oil", "gas", "petrochemical") or product in ("petroleum", "oil", "fuel", "lng") \
            or "refiner" in name or "petrochem" in name:
        return "refinery"
    if ind in ("steel", "metal", "foundry", "aluminium", "smelter") or product in ("steel", "iron", "aluminium", "copper", "zinc") \
            or "steel" in name or "smelter" in name or "sponge iron" in name:
        return "steel_plant"
    if t.get("power") == "plant" or t.get("power") == "generator" and t.get("generator:source") in ("coal", "gas", "oil"):
        return "power_plant"
    if ind in ("cement",) or product == "cement" or "cement" in name:
        return "cement_plant"
    if ind in ("brickyard", "brick", "kiln") or man_made == "kiln" or "brick" in name:
        return "brick_kiln"
    if t.get("landuse") == "quarry" or ind in ("mine", "mining", "coal") or man_made in ("mineshaft", "adit") \
            or "colliery" in name or "mine" in name.split():
        return "mine"
    if ind in ("chemical", "fertilizer", "fertiliser", "pharmaceutical") or product in ("chemical", "fertilizer", "urea"):
        return "chemical_plant"
    if t.get("landuse") == "industrial" or man_made == "works" or man_made == "chimney" or ind:
        return "industrial"
    return None


def classify_landcover_tags(tags: dict) -> str | None:
    t = {k: str(v).lower() for k, v in tags.items()}
    lu, nat = t.get("landuse", ""), t.get("natural", "")
    if lu in ("farmland", "farmyard", "orchard", "vineyard", "paddy", "plant_nursery") or t.get("crop"):
        return "cropland"
    if lu == "forest" or nat == "wood":
        return "forest"
    if nat in ("scrub", "heath", "grassland", "fell", "moor") or lu in ("meadow", "grass", "greenfield"):
        return "shrub_grass"
    if lu == "quarry" or t.get("industrial") in ("mine", "mining", "coal"):
        return "mining"
    if lu == "industrial" or t.get("man_made") == "works" or t.get("power") == "plant" or lu == "landfill":
        return "industrial"
    if lu in ("residential", "commercial", "retail", "construction", "railway", "military"):
        return "built"
    if nat == "water" or lu in ("reservoir", "basin", "salt_pond") or t.get("waterway"):
        return "water"
    if nat in ("wetland", "beach", "sand", "bare_rock", "scree"):
        return "bare"
    return None


# ---------------------------------------------------------------- overpass plumbing

def _cache_path(key: str):
    return CACHE_DIR / f"overpass_{hashlib.sha1(key.encode()).hexdigest()[:16]}.json"


def overpass(query: str, cache: bool = True) -> dict:
    p = _cache_path(query)
    if cache and p.exists():
        return json.loads(p.read_text(encoding="utf-8"))
    for attempt in range(3):
        try:
            r = requests.post(config.OVERPASS_URL, data={"data": query}, timeout=240)
            if r.status_code == 200:
                data = r.json()
                if cache:
                    p.write_text(json.dumps(data), encoding="utf-8")
                return data
            log.warning("Overpass %s: %s", r.status_code, r.text[:200])
        except requests.RequestException as e:  # noqa: PERF203
            log.warning("Overpass error: %s", e)
        time.sleep(5 * (attempt + 1))
    return {"elements": []}


def _around_clause(points: Iterable[tuple[float, float]], radius_m: float) -> str:
    coords = ",".join(f"{lat:.4f},{lon:.4f}" for lat, lon in points)
    return f"(around:{radius_m:.0f},{coords})"


def _chunked(seq, n):
    seq = list(seq)
    for i in range(0, len(seq), n):
        yield seq[i:i + n]


# ---------------------------------------------------------------- public API

def fetch_sites_near(points: list[tuple[float, float]], radius_m: float = 4000, chunk: int = 150) -> list[dict]:
    """Industrial infrastructure within radius of any of the given (lat, lon) points."""
    sites: dict[str, dict] = {}
    for grp in _chunked(points, chunk):
        a = _around_clause(grp, radius_m)
        q = f"""[out:json][timeout:180];
(
  nwr["landuse"="industrial"]{a};
  nwr["man_made"~"^(works|flare|chimney|kiln|mineshaft|adit)$"]{a};
  nwr["power"="plant"]{a};
  nwr["landuse"="quarry"]{a};
  nwr["industrial"]{a};
  nwr["landuse"="landfill"]{a};
);
out center tags;"""
        for el in overpass(q).get("elements", []):
            tags = el.get("tags", {})
            st = classify_site_tags(tags)
            if not st:
                continue
            lat = el.get("lat") or el.get("center", {}).get("lat")
            lon = el.get("lon") or el.get("center", {}).get("lon")
            if lat is None:
                continue
            sid = f"{el['type'][0]}{el['id']}"
            sites[sid] = {
                "id": sid, "lat": float(lat), "lon": float(lon),
                "name": tags.get("name") or tags.get("operator") or st.replace("_", " ").title(),
                "site_type": st, "source": "osm", "tags": tags,
            }
    log.info("OSM: %d industrial features near %d points", len(sites), len(points))
    return list(sites.values())


def fetch_landcover_near(points: list[tuple[float, float]], radius_m: float = 1200, chunk: int = 120) -> list[tuple[Polygon, str]]:
    """Land-use/land-cover polygons around the points (shapely polygons + class)."""
    polys: list[tuple[Polygon, str]] = []
    seen = set()
    for grp in _chunked(points, chunk):
        a = _around_clause(grp, radius_m)
        q = f"""[out:json][timeout:180];
(
  way["landuse"]{a};
  way["natural"~"^(wood|scrub|heath|grassland|water|wetland|sand|bare_rock)$"]{a};
);
out geom;"""
        for el in overpass(q).get("elements", []):
            if el["id"] in seen or el.get("type") != "way":
                continue
            seen.add(el["id"])
            lc = classify_landcover_tags(el.get("tags", {}))
            geom = el.get("geometry")
            if not lc or not geom or len(geom) < 4:
                continue
            ring = [(g["lon"], g["lat"]) for g in geom]
            if ring[0] != ring[-1]:
                ring.append(ring[0])
            try:
                poly = Polygon(ring)
                if poly.is_valid and poly.area > 0:
                    polys.append((poly, lc))
            except Exception:  # noqa: BLE001
                continue
    log.info("OSM: %d land-cover polygons near %d points", len(polys), len(points))
    return polys


def load_geojson_sites(path) -> list[dict]:
    """Bundled demo/curated site list (GeoJSON points or polygons)."""
    gj = json.loads(open(path, encoding="utf-8").read())
    out = []
    for i, f in enumerate(gj["features"]):
        g = shape(f["geometry"])
        c = g.centroid if not isinstance(g, Point) else g
        p = f.get("properties", {})
        out.append({
            "id": p.get("id", f"demo{i}"), "lat": c.y, "lon": c.x,
            "name": p.get("name", "Industrial site"),
            "site_type": p.get("site_type") or classify_site_tags(p) or "industrial",
            "source": p.get("source", "curated"), "tags": p,
        })
    return out
