"""End-to-end pipeline: ingest → context enrichment → persistence → classification → store."""
from __future__ import annotations

import logging
import time
from datetime import date, datetime

import numpy as np
import pandas as pd

from . import alerts as alerts_mod
from . import config, db, demo, firms, forecast, osm
from .classifier import ThermalClassifier
from .features import add_basic, add_clusters, add_density, add_landcover, add_nearest_site, add_persistence

log = logging.getLogger(__name__)

_clf = ThermalClassifier()


def get_classifier() -> ThermalClassifier:
    """Load the trained model, or train it from the labelled demo archive on first use."""
    if _clf.model is None and not _clf.load():
        log.info("No saved model – training on demo archive")
        train_model()
    return _clf


def train_model(use_feedback: bool = True) -> dict:
    """(Re)train on the labelled archive, with any analyst corrections taking precedence.

    An analyst who relabels a source is the best label available for that source, so their
    verdict overwrites the archive label for every detection in that group before fitting.
    """
    df, sites = demo.generate()
    feats = enrich(df, sites, window_days=demo.DEMO_DAYS, landcover_polys=[])
    labels = feats["true_label"].astype(str)
    n_override = 0
    if use_feedback:
        corrections = db.feedback_labels()
        if corrections:
            mask = feats["group_id"].isin(corrections)
            labels = labels.mask(mask, feats["group_id"].map(corrections))
            n_override = int(mask.sum())
            log.info("Applying %d analyst corrections over %d sources", n_override, len(corrections))
    _clf.train(feats, labels)
    _clf.metrics["analyst_labels_applied"] = n_override
    _clf.save()
    db.set_meta("model_metrics", _clf.metrics)
    return _clf.metrics


def enrich(df: pd.DataFrame, sites: list[dict], window_days: int, landcover_polys) -> pd.DataFrame:
    df = add_basic(df)
    df = add_clusters(df)
    df = add_persistence(df, window_days)
    df = add_density(df)
    df = add_nearest_site(df, sites)
    df = add_landcover(df, landcover_polys)
    return df


def _representative_points(df: pd.DataFrame, deg: float, cap: int) -> list[tuple[float, float]]:
    g = df.groupby([np.floor(df["latitude"] / deg), np.floor(df["longitude"] / deg)])
    pts = g[["latitude", "longitude"]].mean().to_numpy().tolist()
    if len(pts) > cap:
        log.warning("Capping OSM context points %d -> %d (increase cap or shrink bbox)", len(pts), cap)
        pts = pts[:cap]
    return [(float(a), float(b)) for a, b in pts]


def build_sources(h: pd.DataFrame) -> pd.DataFrame:
    """One row per persistent thermal source (spatial group)."""
    p = h[h["is_persistent"] == 1]
    if len(p) == 0:
        return pd.DataFrame(columns=["group_id", "lat", "lon", "n_det", "n_days", "span_days", "night_frac", "frp_mean",
                                     "frp_med", "frp_max", "persistence_score", "label", "confidence", "nearest_site_name",
                                     "nearest_site_type", "dist_industrial_km", "landcover", "first_seen", "last_seen",
                                     "n_anomalies", "max_anomaly_severity", "radius_m"])
    rows = []
    for gid, g in p.groupby("group_id"):
        lat, lon = g["latitude"].mean(), g["longitude"].mean()
        d = np.sqrt(((g["latitude"] - lat) * 111_000) ** 2 + ((g["longitude"] - lon) * 111_000 * np.cos(np.radians(lat))) ** 2)
        label = g["label"].mode().iloc[0]
        rows.append({
            "group_id": gid, "lat": round(lat, 5), "lon": round(lon, 5),
            "n_det": int(len(g)), "n_days": int(g["n_days"].iloc[0]), "span_days": float(g["span_days"].iloc[0]),
            "night_frac": round(float(g["night_frac"].iloc[0]), 3), "frp_mean": round(float(g["frp"].mean()), 2),
            "frp_med": round(float(g["frp"].median()), 2),
            "frp_max": round(float(g["frp"].max()), 2), "persistence_score": float(g["persistence_score"].iloc[0]),
            "label": label, "confidence": round(float(g.loc[g["label"] == label, "confidence"].mean()), 3),
            "nearest_site_name": g["nearest_site_name"].iloc[0], "nearest_site_type": g["nearest_site_type"].iloc[0],
            "dist_industrial_km": float(g["dist_industrial_km"].min()),
            "landcover": g["landcover"].mode().iloc[0],
            "first_seen": str(g["acq_date"].min()), "last_seen": str(g["acq_date"].max()),
            "n_anomalies": int(g["is_anomaly"].sum()),
            "max_anomaly_severity": round(float(g["anomaly_severity"].max()) if "anomaly_severity" in g else 0.0, 1),
            "radius_m": int(max(200, np.percentile(d, 90))),
        })
    return pd.DataFrame(rows).sort_values("persistence_score", ascending=False).reset_index(drop=True)


def run(source: str = "demo", bbox=None, days: int | None = None, end: date | None = None, csv_path: str | None = None,
        use_osm: bool = True, osm_point_cap: int = 3000) -> dict:
    t0 = time.time()
    bbox = tuple(bbox) if bbox else config.DEFAULT_BBOX
    days = days or config.DEFAULT_DAYS
    landcover_polys: list = []

    if source == "demo":
        raw, sites = demo.write_demo_files()
        days = demo.DEMO_DAYS
    else:
        if source == "csv":
            raw = firms.load_csv(csv_path)
        else:
            raw = firms.fetch_area(bbox, days, end)
        raw = raw[(raw["longitude"].between(bbox[0], bbox[2])) & (raw["latitude"].between(bbox[1], bbox[3]))].reset_index(drop=True)
        if len(raw) == 0:
            raise RuntimeError("No hotspots returned for that area/date range")
        sites: list[dict] = []
        if use_osm:
            site_pts = _representative_points(raw, 0.05, osm_point_cap)
            sites = osm.fetch_sites_near(site_pts, radius_m=5000)
            lc_pts = _representative_points(raw, 0.02, osm_point_cap)
            landcover_polys = osm.fetch_landcover_near(lc_pts, radius_m=1500)
        curated = config.DATA_DIR / "curated_sites.geojson"
        if curated.exists():
            sites += osm.load_geojson_sites(curated)

    log.info("%d raw hotspots, %d sites", len(raw), len(sites))
    df = enrich(raw, sites, window_days=days, landcover_polys=landcover_polys)
    df = df.rename(columns={"confidence": "confidence_obs"})

    clf = get_classifier()
    # classifier expects `confidence` = observation confidence feature
    pred = clf.predict(df.rename(columns={"confidence_obs": "confidence"}))
    df = pd.concat([df, pred], axis=1)
    df["id"] = [f"h{i}" for i in range(len(df))]
    if "true_label" not in df.columns:
        df["true_label"] = None

    sources = build_sources(df)
    alerts = alerts_mod.build(df, sources)
    source_risk, grid_risk, fc_metrics = forecast.run(df, sources)
    meta = {
        "source": source, "bbox": list(bbox), "days": days, "n_hotspots": int(len(df)), "n_sites": len(sites),
        "n_persistent_sources": int(len(sources)), "n_landcover_polys": len(landcover_polys),
        "n_alerts": int(len(alerts)), "alerts": alerts_mod.summarise(alerts),
        "forecast": {"horizon_days": fc_metrics["horizon_days"], "n_sources_scored": int(len(source_risk)),
                     "n_cells_scored": int(len(grid_risk)),
                     "high_risk_sources": int((source_risk["risk"] >= 0.5).sum()) if len(source_risk) else 0},
        "run_at": datetime.utcnow().isoformat() + "Z", "seconds": round(time.time() - t0, 1),
        "date_from": str(df["acq_date"].min()), "date_to": str(df["acq_date"].max()),
    }
    db.save_run(df, sites, sources, meta, alerts_df=alerts, source_risk=source_risk, grid_risk=grid_risk)
    db.set_meta("forecast_metrics", fc_metrics)
    if clf.metrics:
        db.set_meta("model_metrics", clf.metrics)
    log.info("Pipeline done: %s", meta)
    return meta
