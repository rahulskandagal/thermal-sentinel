"""Feature engineering for thermal-anomaly classification.

Per hotspot we derive:
  * radiometric: frp, brightness, brightness delta, confidence, day/night
  * temporal-persistence (per spatial group over the analysis window):
        n_det, n_days, span_days, max_gap_days, night_frac, frp_mean, frp_cv, frp_z,
        plus a *robust* baseline (median / MAD) that one FRP spike cannot inflate
  * context: distance / type of nearest industrial infrastructure (OSM), distance to the
             second-nearest site, number of sites within 5 km,
             land cover class (OSM land-use polygons or bundled labels),
             density of neighbouring detections at 1 km and 5 km
  * calendar: month, local solar hour, Indian crop-residue burning season flag
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

NUMERIC_FEATURES = [
    "frp", "brightness", "bright_delta", "confidence", "is_night",
    "n_det", "n_days", "span_days", "max_gap_days", "night_frac", "frp_mean", "frp_cv", "frp_z",
    "active_ratio", "persistence_score",
    "frp_med", "frp_mad", "frp_robust_z", "frp_ratio_base", "dets_per_active_day", "source_spread_m",
    "dist_industrial_km", "dist_site_2nd_km", "n_sites_5km", "neighbours_1km", "neighbours_5km",
    "month", "hour", "local_hour", "burn_season",
]

FEATURE_COLUMNS = NUMERIC_FEATURES \
  + [f"site_{s}" for s in ["refinery", "steel_plant", "power_plant", "gas_flare", "cement_plant",
                           "brick_kiln", "mine", "chemical_plant", "industrial", "none"]] \
  + [f"lc_{c}" for c in LANDCOVER_CLASSES]


# ------------------------------------------------------------------ basic

def add_basic(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    ts = pd.to_datetime(df["acq_datetime"], utc=True)
    df["acq_datetime"] = ts
    df["acq_date"] = ts.dt.date
    df["hour"] = ts.dt.hour + ts.dt.minute / 60.0
    # India spans 68°E-97°E, so UTC hour alone mixes up overpass times across the country.
    # Local solar hour makes "daytime crop burn" vs "night flare" comparable east to west.
    df["local_hour"] = (df["hour"] + df["longitude"] / 15.0) % 24.0
    df["month"] = ts.dt.month
    df["is_night"] = (df["daynight"].astype(str).str.upper().str[0] == "N").astype(int)
    df["bright_delta"] = (df["brightness"] - df["brightness_2"]).fillna(0.0)
    # Kharif stubble burning (Oct-Nov) and Rabi residue burning (Apr-May) in North India
    df["burn_season"] = df["month"].isin([10, 11, 4, 5]).astype(int)
    df["cell_id"] = (np.floor(df["latitude"] / config.CELL_DEG).astype(int).astype(str) + "_" +
                     np.floor(df["longitude"] / config.CELL_DEG).astype(int).astype(str))
    # ~330 km blocks, used only to hold out whole regions when scoring the model
    df["spatial_block"] = (np.floor(df["latitude"] / config.EVAL_BLOCK_DEG).astype(int).astype(str) + "/" +
                           np.floor(df["longitude"] / config.EVAL_BLOCK_DEG).astype(int).astype(str))
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
                  "frp_z", "active_ratio", "persistence_score", "is_persistent",
                  "frp_med", "frp_mad", "frp_robust_z", "frp_ratio_base", "dets_per_active_day", "source_spread_m"]:
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

    # Robust baseline. mean/std are pulled up by the very spike we are trying to detect
    # (a 200 MW explosion at an 18 MW refinery raises the mean and hides itself); the
    # median and MAD barely move, so frp_robust_z is what the anomaly rule actually uses.
    df["frp_med"] = g["frp"].transform("median")
    df["frp_mad"] = g["frp"].transform(lambda s: (s - s.median()).abs().median())
    scale = (1.4826 * df["frp_mad"]).clip(lower=0.5)
    df["frp_robust_z"] = ((df["frp"] - df["frp_med"]) / scale).clip(-10, 50)
    df["frp_ratio_base"] = (df["frp"] / df["frp_med"].clip(lower=0.2)).clip(upper=100)
    df["dets_per_active_day"] = df["n_det"] / df["n_days"].clip(lower=1)

    # How spread out the source is: a refinery stack is a point, a coal-seam fire is a field
    lat0 = g["latitude"].transform("mean")
    lon0 = g["longitude"].transform("mean")
    dx = (df["longitude"] - lon0) * 111_320.0 * np.cos(np.radians(df["latitude"]))
    dy = (df["latitude"] - lat0) * 110_540.0
    dist_c = np.sqrt(dx ** 2 + dy ** 2)
    df["source_spread_m"] = dist_c.groupby(df["group_id"]).transform(lambda s: s.quantile(0.9)).round(1)

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
        df["dist_site_2nd_km"] = 999.0
        df["n_sites_5km"] = 0
        df["nearest_site_id"] = None
        df["nearest_site_type"] = "none"
        df["nearest_site_name"] = None
        return df
    s = pd.DataFrame(sites)
    tree = BallTree(np.radians(s[["lat", "lon"]].to_numpy()), metric="haversine")
    pts = np.radians(df[["latitude", "longitude"]].to_numpy())
    k = min(2, len(s))
    d, i = tree.query(pts, k=k)
    df["dist_industrial_km"] = (d[:, 0] * EARTH_R / 1000.0).round(3)
    # An isolated stack and one unit inside a dense industrial estate look the same from
    # the nearest-site distance alone; the 2nd-nearest site and the 5 km count separate them.
    df["dist_site_2nd_km"] = (d[:, 1] * EARTH_R / 1000.0).round(3) if k > 1 else 999.0
    df["n_sites_5km"] = tree.query_radius(pts, r=5000.0 / EARTH_R, count_only=True)
    df["nearest_site_id"] = s["id"].to_numpy()[i[:, 0]]
    df["nearest_site_type"] = s["site_type"].to_numpy()[i[:, 0]]
    df["nearest_site_name"] = s["name"].to_numpy()[i[:, 0]]
    # Beyond ~10 km the "nearest site" is not meaningful context
    far = df["dist_industrial_km"] > 10.0
    df.loc[far, ["nearest_site_type"]] = "none"
    return df


def add_density(df: pd.DataFrame) -> pd.DataFrame:
    """How crowded the neighbourhood is. Residue burning comes in dense sheets of fires
    across a district; a plant or a flare is a lone dot. Counted over the whole window."""
    df = df.copy()
    if len(df) == 0:
        df["neighbours_1km"] = []
        df["neighbours_5km"] = []
        return df
    pts = np.radians(df[["latitude", "longitude"]].to_numpy())
    tree = BallTree(pts, metric="haversine")
    df["neighbours_1km"] = tree.query_radius(pts, r=1000.0 / EARTH_R, count_only=True) - 1
    df["neighbours_5km"] = tree.query_radius(pts, r=5000.0 / EARTH_R, count_only=True) - 1
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
    for c in NUMERIC_FEATURES:
        X[c] = pd.to_numeric(df[c], errors="coerce").fillna(0.0) if c in df.columns else 0.0
    st = df["nearest_site_type"].fillna("none")
    for s in ["refinery", "steel_plant", "power_plant", "gas_flare", "cement_plant", "brick_kiln", "mine",
              "chemical_plant", "industrial", "none"]:
        X[f"site_{s}"] = (st == s).astype(int)
    lc = df["landcover"].fillna("unknown")
    for c in LANDCOVER_CLASSES:
        X[f"lc_{c}"] = (lc == c).astype(int)
    return X[FEATURE_COLUMNS]
