"""Export the classified results as static JSON so the dashboard can run with no backend
(GitHub Pages demo). Output: frontend/public/data/

  status.json, stats.json, model.json, alerts.json, sites.geojson, sources.geojson,
  hotspots.json   (columnar: {columns:[...], rows:[[...], ...]} to keep it small)
  timeseries.json ({group_id: [[acq_date, n, frp_sum, frp_max, n_night], ...]})
  alerts.csv, registry.csv  (the same downloads the live API serves)
"""
import csv
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from app import alerts, db  # noqa: E402

OUT = Path(__file__).resolve().parents[2] / "frontend" / "public" / "data"
OUT.mkdir(parents=True, exist_ok=True)

COLS = ["id", "latitude", "longitude", "acq_datetime", "acq_date", "satellite", "instrument", "brightness", "brightness_2",
        "frp", "confidence_obs", "daynight", "is_night", "group_id", "n_det", "n_days", "span_days", "max_gap_days",
        "night_frac", "frp_mean", "frp_cv", "frp_z", "frp_med", "frp_robust_z", "persistence_score", "is_persistent",
        "dist_industrial_km", "n_sites_5km", "neighbours_5km", "nearest_site_type", "nearest_site_name", "landcover",
        "label", "confidence", "method", "rules_agree", "reasons", "is_anomaly", "anomaly_severity", "true_label"]
ROUND = {"latitude": 5, "longitude": 5, "brightness": 1, "brightness_2": 1, "frp": 2, "confidence_obs": 2, "span_days": 1,
         "night_frac": 3, "frp_mean": 2, "frp_cv": 3, "frp_z": 2, "frp_med": 2, "frp_robust_z": 2,
         "persistence_score": 3, "dist_industrial_km": 3, "confidence": 3, "anomaly_severity": 1}
ALERT_CSV_COLS = ["id", "kind", "severity", "alert_date", "site_name", "label", "confidence", "lat", "lon",
                  "frp", "frp_baseline", "n_days", "title", "detail"]
REGISTRY_CSV_COLS = ["group_id", "lat", "lon", "label", "confidence", "nearest_site_name", "nearest_site_type",
                     "dist_industrial_km", "landcover", "n_det", "n_days", "span_days", "night_frac", "frp_mean",
                     "frp_med", "frp_max", "persistence_score", "first_seen", "last_seen", "n_anomalies", "radius_m"]


def _fc(rows, lat="latitude", lon="longitude"):
    return {"type": "FeatureCollection", "features": [
        {"type": "Feature", "geometry": {"type": "Point", "coordinates": [r[lon], r[lat]]},
         "properties": {k: v for k, v in r.items() if k not in (lat, lon)}} for r in rows]}


def dump(name, obj):
    p = OUT / name
    p.write_text(json.dumps(obj, separators=(",", ":"), default=str), encoding="utf-8")
    print(f"{name:18s} {p.stat().st_size / 1024:8.0f} KB")


hot = db.query_hotspots(limit=1_000_000)
rows = []
for h in hot:
    r = []
    for c in COLS:
        v = h.get(c)
        if c in ROUND and isinstance(v, float):
            v = round(v, ROUND[c])
        r.append(v)
    rows.append(r)
dump("hotspots.json", {"columns": COLS, "rows": rows})

with db.connect() as con:
    ts = {}
    for r in con.execute("SELECT group_id, acq_date, COUNT(*) n, ROUND(SUM(frp),2) s, ROUND(MAX(frp),2) m, SUM(is_night) nn "
                         "FROM hotspots GROUP BY group_id, acq_date ORDER BY group_id, acq_date"):
        ts.setdefault(r[0], []).append([r[1], r[2], r[3], r[4], r[5]])
dump("timeseries.json", ts)

def dump_csv(name, rows, cols):
    p = OUT / name
    with p.open("w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=cols, extrasaction="ignore", lineterminator="\n")
        w.writeheader()
        for r in rows:
            w.writerow({c: r.get(c) for c in cols})
    print(f"{name:18s} {p.stat().st_size / 1024:8.0f} KB")


srcs = db.get_sources()
alert_rows = db.get_alerts(limit=5000)
dump("sources.geojson", _fc(srcs, lat="lat", lon="lon"))
dump("sites.geojson", _fc(db.get_sites(), lat="lat", lon="lon"))
dump("stats.json", db.stats())
dump("model.json", db.get_meta("model_metrics") or {})
dump("alerts.json", {"kinds": alerts.KINDS, "count": len(alert_rows), "alerts": alert_rows})
src_risk, grid_risk = db.get_risk("source", limit=2000), db.get_risk("grid", limit=20000)
dump("forecast.json", {"metrics": db.get_meta("forecast_metrics") or {}, "count": len(src_risk),
                       "sources": src_risk, "grid": grid_risk})
dump_csv("alerts.csv", alert_rows, ALERT_CSV_COLS)
dump_csv("registry.csv", srcs, REGISTRY_CSV_COLS)
dump("status.json", {"job": {"running": False, "status": "idle", "error": None, "meta": None},
                     "last_run": db.get_meta("last_run"), "firms_key_configured": False, "has_data": True, "static": True})
print("done ->", OUT)
