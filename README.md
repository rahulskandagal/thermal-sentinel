# ThermalSentinel

**SIH 2026 · PS SIH26162 · NTRO — AI-Based Detection and Classification of Industrial Fires and
Persistent Thermal Sources Using NASA FIRMS, OSM & Satellite Data**

NASA FIRMS tells you *where* the ground is hot. ThermalSentinel tells you *what* is hot and *whether it
should be*: it classifies every VIIRS/MODIS thermal anomaly as an industrial fire / process heat, gas
flare, mining or coal-seam fire, agricultural residue burning, wildfire, or other; it tracks
**persistent thermal sources** over time; and it flags **FRP anomalies** at those sources — the
signature of an industrial fire or explosion rather than routine operation. Everything is served as
GeoJSON through a REST API and shown on an interactive GIS dashboard.

```
NASA FIRMS (VIIRS 375 m / MODIS 1 km) ─┐
OpenStreetMap / Overpass ──────────────┤   ingest → spatial clustering (DBSCAN) → temporal persistence
  industrial=*, man_made=flare|works,  ├─► → OSM context (nearest facility, land cover) → hybrid
  power=plant, landuse=quarry|farmland │     classifier (explainable rules + gradient-boosted trees)
Sentinel-2 / Worldview deep links ─────┘   → SQLite/GeoJSON → FastAPI → React + Leaflet dashboard
```

## Quick start (Windows, ~2 minutes)

```powershell
.\run.ps1
```

That creates a Python venv, installs dependencies, starts the API on http://127.0.0.1:8000 (docs at
`/docs`) and the dashboard on http://localhost:5173. On first start the backend generates the bundled
demo archive (22 k VIIRS-format detections, Mar–May 2025, over real Indian industrial belts), trains the
model (~7 s) and classifies everything. No internet or API key is needed for the demo.

Manual start:

```bash
# backend
cd backend
python -m venv .venv && .venv\Scripts\activate      # Linux/macOS: source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# frontend (second terminal)
cd frontend
npm install
npm run dev
```

## Going live with NASA FIRMS

1. Get a free MAP_KEY (instant): https://firms.modaps.eosdis.nasa.gov/api/map_key/
2. `copy backend\.env.example backend\.env` and set `FIRMS_MAP_KEY=...`
3. Restart the backend, click **Run pipeline** in the dashboard → *Live NASA FIRMS*, pick an area preset
   or the current map view, choose days back (NRT keeps ~2 months; use `VIIRS_SNPP_SP` for archives).

The pipeline downloads the hotspots in 10-day chunks, then queries Overpass **only around the cells
where hotspots occurred** (not all of India) for industrial infrastructure and land-use polygons, and
caches the responses in `backend/data/cache/`. You can also drop a FIRMS archive CSV and choose
*FIRMS archive CSV* as the source. Add hand-curated facilities to `backend/data/curated_sites.geojson`
(same schema as `demo_sites.geojson`) and they are merged with OSM.

## How the classification works

| Signal | Feature(s) | Why it matters |
|---|---|---|
| Radiometry | FRP, I-4/I-5 brightness, Δbrightness, FIRMS confidence, day/night | flares are small & steady, wildfires hot & variable |
| Persistence (per DBSCAN cluster, 90-day window) | active days, span, max gap, detections, night fraction, FRP mean / CV / z-score, persistence score | factories recur for months; crop burns last a day |
| Infrastructure (OSM) | distance to nearest facility, facility type (refinery, steel, power, flare, cement, brick kiln, mine, chemical) | places the anomaly on a known industrial asset |
| Land cover (OSM land-use) | cropland / forest / shrub-grass / industrial / mining / built / water | separates agricultural burning and wildfires |
| Calendar | month, hour, Indian residue-burning season (Oct–Nov, Apr–May) | seasonality prior |

Two classifiers vote: a transparent **rule engine** (every decision returns human-readable reasons shown
in the UI) and a **HistGradientBoosting** model trained on the labelled archive with a *group-aware*
split (all detections of one source stay on one side, so persistence features cannot leak). The ML label
is used when its probability ≥ 0.55, otherwise the rules; agreement raises confidence.

`GET /api/model` returns accuracy, per-class F1, confusion matrix and feature importance. On the demo
archive: ML 99.8 %, rules-only 98.4 % (synthetic data is clean — real-world numbers will be lower; the
architecture is designed so labelled real events can be added to `true_label` and the model retrained).

**Persistent source** = ≥ 8 distinct active days and ≥ 14-day span within the window.
**FRP anomaly** = detection at a persistent source with FRP ≥ 2.5× the source mean and z ≥ 3.

## API

| Endpoint | Purpose |
|---|---|
| `POST /api/ingest` | run pipeline: `{source: demo|firms|csv, bbox, days, use_osm}` (background job) |
| `GET /api/status` | job state, last run metadata |
| `GET /api/hotspots?bbox&labels&date_from&date_to&persistent&anomaly&min_conf` | classified detections (GeoJSON) |
| `GET /api/hotspots/{id}` | full record + reasons + source time series + imagery links |
| `GET /api/sources` / `/api/sources/{group_id}` | persistent thermal sources (GeoJSON) |
| `GET /api/sites` | industrial infrastructure used as context |
| `GET /api/stats`, `GET /api/model` | dashboard KPIs, model metrics |
| `GET /api/export/hotspots.geojson`, `/api/export/sources.geojson` | GIS export (QGIS/ArcGIS) |

## Repository layout

```
backend/app/firms.py      FIRMS area API client, VIIRS/MODIS normalisation
backend/app/osm.py        Overpass queries (around hotspot cells), tag → site type / land cover
backend/app/features.py   DBSCAN clustering, persistence statistics, context features
backend/app/classifier.py rule engine + gradient boosting, anomaly flag, metrics
backend/app/pipeline.py   orchestration; builds persistent-source table
backend/app/demo.py       physically-motivated demo archive generator (labelled)
backend/app/db.py         SQLite storage & queries
backend/app/main.py       FastAPI
frontend/src/             React + Leaflet dashboard (canvas rendering for 40 k+ points)
docs/                     SIH idea deck & notes
```

## Roadmap after the hackathon

* Sentinel-2 SWIR (B12/B11) chip classifier on top of each persistent source (CNN) — imagery links are
  already wired; Copernicus Data Space offers free API access.
* ESA WorldCover 10 m raster instead of OSM land-use polygons where OSM is sparse.
* Landsat-8/9 TIRS + VIIRS Nightfire (VNF) for flare temperature / methane-flaring estimates.
* PostGIS + tile server for national-scale multi-year archives; alerting (email/SMS) on FRP anomalies.
