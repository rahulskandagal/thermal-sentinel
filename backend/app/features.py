"""Feature engineering for thermal-anomaly classification.

Per hotspot we derive:
  * radiometric: frp, brightness, brightness delta, confidence, day/night
  * temporal-persistence (per spatial group over the analysis window):
        n_det, n_days, span_days, max_gap_days, night_frac, frp_mean, frp_cv, frp_z
  * context: distance / type of nearest industrial infrastructure (OSM),
             land cover class (OSM land-use polygons or bundled labels)
  * calendar: month, hour (UTC), Indian crop-residue burning season flag
"""
from __future__ import annotations

import logging

import numpy as np
import pandas as pd
from shapely import STRtree
from shapely.geometry import Point
from sklearn.cluster import DBSCAN
from sklearn.neighbors import BallTree

from . import config

log = logging.getLogger(__name__)
EARTH_R = 6_371_000.0

LANDCOVER_CLASSES = ["cropland", "forest", "shrub_grass", "industrial", "mining", "built", "water", "bare", "unknown"]

FEATURE_COLUMNS = [
    "frp", "brightness", "bright_delta", "confidence", "is_night",
    "n_det", "n_days", "span_days", "max_gap_days", "night_frac", "frp_mean", "frp_cv", "frp_z",
    "active_ratio", "persistence_score",
    "dist_industrial_km", "month", "hour", "burn_season",
] + [f"site_{s}" for s in ["refinery", "steel_plant", "power_plant", "gas_flare", "cement_plant",
                           "brick_kiln", "mine", "chemical_plant", "industrial", "none"]] \
  + [f"lc_{c}" for c in LANDCOVER_CLASSES]


# ------------------------------------------------------------------ basic

def add_basic(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    ts = pd.to_datetime(df["acq_datetime"], utc=True)
    df["acq_datetime"] = ts
    df["acq_date"] = ts.dt.date
    df["hour"] = ts.dt.hour + ts.dt.minute / 60.0
    df["month"] = ts.dt.month
    df["is_night"] = (df["daynight"].astype(str).str.upper().str[0] == "N").astype(int)
    df["bright_delta"] = (df["brightness"] - df["brightness_2"]).fillna(0.0)
    # Kharif stubble burning (Oct-Nov) and Rabi residue burning (Apr-May) in North India
    df["burn_season"] = df["month"].isin([10, 11, 4, 5]).astype(int)
    df["cell_id"] = (np.floor(df["latitude"] / config.CELL_DEG).astype(int).astype(str) + "_" +
                     np.floor(df["longitude"] / config.CELL_DEG).astype(int).astype(str))
    return df


# ------------------------------------------------------------------ clustering

def add_clusters(df: pd.DataFrame) -> pd.DataFrame:
    """Spatial DBSCAN (haversine) → group_id. Noise points fall back to their grid cell."""
    df = df.copy()
    if len(df) == 0:
        df["group_id"] = []
        return df
    coords = np.radians(df[["latitude", "longitude"]].to_numpy())
    labels = DBSCAN(eps=config.CLUSTER_EPS_M / EARTH_R, min_samples=config.CLUSTER_MIN_SAMPLES,
                    metric="haversine", algorithm="ball_tree").fit_predict(coords)
    df["cluster_label"] = labels
    df["group_id"] = np.where(labels >= 0, "c" + pd.Series(labels).astype(str).to_numpy(),
                              "cell:" + df["cell_id"].to_numpy())
    return df


# ------------------------------------------------------------------ persistence

def add_persistence(df: pd.DataFrame, window_days: int) -> pd.DataFrame:
    df = df.copy()
    if len(df) == 0:
        for c in ["n_det", "n_days", "span_days", "max_gap_days", "night_frac", "frp_mean", "frp_cv",
                  "frp_z", "active_ratio", "persistence_score", "is_persistent"]:
            df[c] = []
        return df

    g = df.groupby("group_id")
    df["n_det"] = g["frp"].transform("size")
    df["n_days"] = g["acq_date"].transform("nunique")
    first = g["acq_datetime"].transform("min")
    last = g["acq_datetime"].transform("max")
    df["span_days"] = ((last - first).dt.total_seconds() / 86400.0).round(2)
    df["night_frac"] = g["is_night"].transform("mean")
    df["frp_mean"] = g["frp"].transform("mean")
    frp_std = g["frp"].transform("std").fillna(0.0)
    df["frp_cv"] = (frp_std / df["frp_mean"].clip(lower=0.1)).clip(upper=5.0)
    df["frp_z"] = ((df["frp"] - df["frp_mean"]) / frp_std.clip(lower=1.0)).clip(-5, 10)

    # max gap between distinct active days per group
    def _max_gap(s: pd.Series) -> float:
        d = np.sort(pd.to_datetime(s.unique()).values.astype("datetime64[D]").astype(int))
        return float(np.diff(d).max()) if len(d) > 1 else 0.0
    gaps = g["acq_date"].agg(_max_gap)
    df["max_gap_days"] = df["group_id"].map(gaps)

    df["active_ratio"] = (df["n_days"] / max(window_days, 1)).clip(upper=1.0)
    days_score = (df["n_days"] / 20.0).clip(upper=1.0)
    span_score = (df["span_days"] / 30.0).clip(upper=1.0)
    regularity = 1.0 - (df["max_gap_days"] / 15.0).clip(upper=1.0)
    df["persistence_score"] = (0.45 * days_score + 0.35 * span_score + 0.20 * regularity).round(3)
    df["is_persistent"] = ((df["n_days"] >= config.PERSISTENT_MIN_DAYS) &
                           (df["span_days"] >= config.PERSISTENT_MIN_SPAN_DAYS)).astype(int)
    return df


# ------------------------------------------------------------------ context

def add_nearest_site(df: pd.DataFrame, sites: list[dict]) -> pd.DataFrame:
    df = df.copy()
    if not sites or len(df) == 0:
        df["dist_industrial_km"] = 999.0
        df["nearest_site_id"] = None
        df["nearest_site_type"] = "none"
        df["nearest_site_name"] = None
        return df
    s = pd.DataFrame(sites)
    tree = BallTree(np.radians(s[["lat", "lon"]].to_numpy()), metric="haversine")
    d, i = tree.query(np.radians(df[["latitude", "longitude"]].to_numpy()), k=1)
    df["dist_industrial_km"] = (d[:, 0] * EARTH_R / 1000.0).round(3)
    df["nearest_site_id"] = s["id"].to_numpy()[i[:, 0]]
    df["nearest_site_type"] = s["site_type"].to_numpy()[i[:, 0]]
    df["nearest_site_name"] = s["name"].to_numpy()[i[:, 0]]
    # Beyond ~10 km the "nearest site" is not meaningful context
    far = df["dist_industrial_km"] > 10.0
    df.loc[far, ["nearest_site_type"]] = "none"
    return df


def add_landcover(df: pd.DataFrame, polys: list[tuple], default: str = "unknown") -> pd.DataFrame:
    """Point-in-polygon land cover; falls back to nearest polygon within 300 m."""
    df = df.copy()
    if "landcover" in df.columns and polys == []:
        df["landcover"] = df["landcover"].fillna(default)
        return df
    if not polys:
        df["landcover"] = default
        return df
    geoms = [p for p, _ in polys]
    classes = [c for _, c in polys]
    tree = STRtree(geoms)
    pts = [Point(lon, lat) for lat, lon in zip(df["latitude"], df["longitude"])]
    out = []
    for pt in pts:
        idx = tree.query(pt, predicate="within")
        if len(idx):
            out.append(classes[idx[0]])
            continue
        near = tree.query_nearest(pt, max_distance=0.003, return_distance=False)
        out.append(classes[near[0]] if len(near) else default)
    df["landcover"] = out
    return df


# ------------------------------------------------------------------ matrix

def feature_matrix(df: pd.DataFrame) -> pd.DataFrame:
    X = pd.DataFrame(index=df.index)
    for c in ["frp", "brightness", "bright_delta", "confidence", "is_night", "n_det", "n_days", "span_days",
              "max_gap_days", "night_frac", "frp_mean", "frp_cv", "frp_z", "active_ratio", "persistence_score",
              "dist_industrial_km", "month", "hour", "burn_season"]:
        X[c] = pd.to_numeric(df[c], errors="coerce").fillna(0.0)
    st = df["nearest_site_type"].fillna("none")
    for s in ["refinery", "steel_plant", "power_plant", "gas_flare", "cement_plant", "brick_kiln", "mine",
              "chemical_plant", "industrial", "none"]:
        X[f"site_{s}"] = (st == s).astype(int)
    lc = df["landcover"].fillna("unknown")
    for c in LANDCOVER_CLASSES:
        X[f"lc_{c}"] = (lc == c).astype(int)
    return X[FEATURE_COLUMNS]
