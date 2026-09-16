"""ThermalSentinel API – FastAPI service exposing classified FIRMS hotspots as GeoJSON."""
from __future__ import annotations

import logging
import threading
from datetime import date
from typing import Optional

from fastapi import BackgroundTasks, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from . import config, db, pipeline

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
log = logging.getLogger("thermalsentinel")

app = FastAPI(title="ThermalSentinel API", version="0.1.0",
              description="AI-based detection & classification of industrial fires and persistent thermal sources "
                          "from NASA FIRMS, OpenStreetMap and satellite data.")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

_job = {"running": False, "status": "idle", "error": None, "meta": None}


def _parse_bbox(bbox: Optional[str]):
    if not bbox:
        return None
    try:
        w, s, e, n = (float(x) for x in bbox.split(","))
        return (w, s, e, n)
    except ValueError:
        raise HTTPException(400, "bbox must be 'west,south,east,north'")


def _parse_labels(labels: Optional[str]):
    return [x.strip().upper() for x in labels.split(",") if x.strip()] if labels else None


def _fc(rows: list[dict], lat="latitude", lon="longitude") -> dict:
    return {"type": "FeatureCollection", "features": [
        {"type": "Feature", "geometry": {"type": "Point", "coordinates": [r[lon], r[lat]]},
         "properties": {k: v for k, v in r.items() if k not in (lat, lon)}} for r in rows]}


@app.on_event("startup")
def _startup():
    db.init()
    if not db.has_data():
        log.info("Empty database – running demo pipeline")
        _run_job("demo", None, None, None, None, True)


def _run_job(source, bbox, days, end, csv_path, use_osm):
    _job.update(running=True, status=f"running ({source})", error=None)
    try:
        meta = pipeline.run(source=source, bbox=bbox, days=days, end=end, csv_path=csv_path, use_osm=use_osm)
        _job.update(status="done", meta=meta)
    except Exception as e:  # noqa: BLE001
        log.exception("pipeline failed")
        _job.update(status="failed", error=str(e))
    finally:
        _job["running"] = False


# ------------------------------------------------------------------ ingest / status

class IngestRequest(BaseModel):
    source: str = Field("demo", description="demo | firms | csv")
    bbox: Optional[list[float]] = Field(None, description="[west, south, east, north]")
    days: Optional[int] = Field(None, ge=1, le=365)
    end: Optional[date] = None
    csv_path: Optional[str] = None
    use_osm: bool = True


@app.post("/api/ingest")
def ingest(req: IngestRequest, bg: BackgroundTasks):
    if _job["running"]:
        raise HTTPException(409, "A pipeline run is already in progress")
    if req.source == "firms" and not config.FIRMS_MAP_KEY:
        raise HTTPException(400, "FIRMS_MAP_KEY not configured in backend/.env")
    if req.source == "csv" and not req.csv_path:
        raise HTTPException(400, "csv_path required for source=csv")
    t = threading.Thread(target=_run_job, args=(req.source, req.bbox, req.days, req.end, req.csv_path, req.use_osm), daemon=True)
    t.start()
    return {"started": True, "source": req.source}


@app.get("/api/status")
def status():
    return {"job": _job, "last_run": db.get_meta("last_run"), "firms_key_configured": bool(config.FIRMS_MAP_KEY),
            "has_data": db.has_data()}


@app.get("/api/health")
def health():
    return {"ok": True}


# ------------------------------------------------------------------ data

@app.get("/api/hotspots")
def hotspots(bbox: Optional[str] = None, labels: Optional[str] = None, date_from: Optional[date] = None,
             date_to: Optional[date] = None, persistent: Optional[bool] = None, anomaly: Optional[bool] = None,
             min_conf: float = Query(0.0, ge=0, le=1), limit: int = Query(20000, le=100000)):
    rows = db.query_hotspots(_parse_bbox(bbox), _parse_labels(labels), date_from, date_to, persistent, anomaly, min_conf, limit)
    return JSONResponse(_fc(rows))


@app.get("/api/hotspots/{hid}")
def hotspot(hid: str):
    r = db.get_hotspot(hid)
    if not r:
        raise HTTPException(404, "not found")
    r["timeseries"] = db.get_group_timeseries(r["group_id"])
    r["links"] = _imagery_links(r["latitude"], r["longitude"], r["acq_date"])
    return r


@app.get("/api/sources")
def sources(bbox: Optional[str] = None, labels: Optional[str] = None, min_days: int = 0):
    rows = db.get_sources(_parse_bbox(bbox), _parse_labels(labels), min_days)
    return JSONResponse(_fc(rows, lat="lat", lon="lon"))


@app.get("/api/sources/{group_id}")
def source_detail(group_id: str):
    rows = db.get_sources()
    m = [r for r in rows if r["group_id"] == group_id]
    if not m:
        raise HTTPException(404, "not found")
    r = m[0]
    r["timeseries"] = db.get_group_timeseries(group_id)
    r["links"] = _imagery_links(r["lat"], r["lon"], r["last_seen"])
    return r


@app.get("/api/sites")
def sites(bbox: Optional[str] = None):
    return JSONResponse(_fc(db.get_sites(_parse_bbox(bbox)), lat="lat", lon="lon"))


@app.get("/api/stats")
def stats():
    return db.stats()


@app.get("/api/model")
def model():
    m = db.get_meta("model_metrics") or pipeline.get_classifier().metrics
    return m or {"status": "model not trained yet"}


@app.get("/api/export/hotspots.geojson")
def export_hotspots(labels: Optional[str] = None, persistent: Optional[bool] = None):
    rows = db.query_hotspots(labels=_parse_labels(labels), persistent=persistent, limit=200000)
    return JSONResponse(_fc(rows), headers={"Content-Disposition": "attachment; filename=hotspots.geojson"})


@app.get("/api/export/sources.geojson")
def export_sources():
    return JSONResponse(_fc(db.get_sources(), lat="lat", lon="lon"),
                        headers={"Content-Disposition": "attachment; filename=persistent_sources.geojson"})


def _imagery_links(lat: float, lon: float, day: str) -> dict:
    """Deep links to free satellite imagery viewers for visual verification."""
    return {
        "sentinel_eo_browser": f"https://apps.sentinel-hub.com/eo-browser/?zoom=13&lat={lat}&lng={lon}&themeId=DEFAULT-THEME&datasetId=S2L2A&fromTime={day}T00:00:00.000Z&toTime={day}T23:59:59.999Z&layerId=8-SWIR",
        "nasa_worldview": f"https://worldview.earthdata.nasa.gov/?v={lon - 0.3},{lat - 0.2},{lon + 0.3},{lat + 0.2}&t={day}&l=VIIRS_NOAA20_Thermal_Anomalies_375m_All,VIIRS_SNPP_CorrectedReflectance_TrueColor",
        "firms_map": f"https://firms.modaps.eosdis.nasa.gov/map/#d:{day};@{lon},{lat},12z",
        "osm": f"https://www.openstreetmap.org/#map=15/{lat}/{lon}",
        "google_earth": f"https://earth.google.com/web/@{lat},{lon},500a,3000d,35y,0h,0t,0r",
    }
