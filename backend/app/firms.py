"""NASA FIRMS client.

Area API docs: https://firms.modaps.eosdis.nasa.gov/api/area/
    /api/area/csv/{MAP_KEY}/{SOURCE}/{west,south,east,north}/{DAY_RANGE<=10}/{YYYY-MM-DD}

Both VIIRS (375 m) and MODIS (1 km) products are normalised to one schema:
    latitude, longitude, acq_datetime (UTC), satellite, instrument,
    brightness (K), brightness_2 (K), frp (MW), confidence (0..1), daynight (D/N)
"""
from __future__ import annotations

import io
import logging
from datetime import date, datetime, timedelta
from typing import Iterable

import numpy as np
import pandas as pd
import requests

from . import config

log = logging.getLogger(__name__)

FIRMS_BASE = "https://firms.modaps.eosdis.nasa.gov/api/area/csv"

COMMON_COLUMNS = [
    "latitude", "longitude", "acq_datetime", "satellite", "instrument",
    "brightness", "brightness_2", "frp", "confidence", "daynight", "scan", "track",
]

_CONF_TEXT = {"l": 0.3, "low": 0.3, "n": 0.6, "nominal": 0.6, "h": 0.9, "high": 0.9}


def _parse_confidence(v) -> float:
    if pd.isna(v):
        return 0.5
    s = str(v).strip().lower()
    if s in _CONF_TEXT:
        return _CONF_TEXT[s]
    try:
        f = float(s)
        return f / 100.0 if f > 1.0 else f
    except ValueError:
        return 0.5


def normalise_firms_df(df: pd.DataFrame) -> pd.DataFrame:
    """Map raw FIRMS CSV columns (VIIRS or MODIS) to the common schema."""
    if df.empty:
        return pd.DataFrame(columns=COMMON_COLUMNS)
    def col(name, default):
        return df[name] if name in df.columns else pd.Series([default] * len(df), index=df.index)

    d = pd.DataFrame(index=df.index)
    d["latitude"] = df["latitude"].astype(float)
    d["longitude"] = df["longitude"].astype(float)
    t = df["acq_time"].astype(int).astype(str).str.zfill(4)
    d["acq_datetime"] = pd.to_datetime(df["acq_date"].astype(str) + " " + t.str[:2] + ":" + t.str[2:], utc=True)
    d["satellite"] = col("satellite", "unknown").astype(str)
    d["instrument"] = col("instrument", "VIIRS").astype(str)
    if "bright_ti4" in df.columns:          # VIIRS
        d["brightness"] = df["bright_ti4"].astype(float)
        d["brightness_2"] = pd.to_numeric(col("bright_ti5", np.nan), errors="coerce")
    else:                                   # MODIS
        d["brightness"] = df["brightness"].astype(float)
        d["brightness_2"] = pd.to_numeric(col("bright_t31", np.nan), errors="coerce")
    d["frp"] = pd.to_numeric(col("frp", 0.0), errors="coerce").fillna(0.0)
    d["confidence"] = col("confidence", "n").map(_parse_confidence)
    d["daynight"] = col("daynight", "D").astype(str).str.upper().str[0]
    d["scan"] = pd.to_numeric(col("scan", 0.375), errors="coerce").fillna(0.375)
    d["track"] = pd.to_numeric(col("track", 0.375), errors="coerce").fillna(0.375)
    return d[COMMON_COLUMNS].reset_index(drop=True)


def _chunks(start: date, end: date) -> Iterable[tuple[date, int]]:
    """Yield (start_date, n_days) windows of at most 10 days (FIRMS limit)."""
    cur = start
    while cur <= end:
        n = min(10, (end - cur).days + 1)
        yield cur, n
        cur = cur + timedelta(days=n)


def fetch_area(bbox: tuple[float, float, float, float], days: int, end: date | None = None,
               sources: list[str] | None = None, map_key: str | None = None) -> pd.DataFrame:
    """Download `days` of hotspots ending at `end` (default: today) for the bbox."""
    map_key = map_key or config.FIRMS_MAP_KEY
    if not map_key:
        raise RuntimeError("FIRMS_MAP_KEY is not set (backend/.env). Get one free at "
                           "https://firms.modaps.eosdis.nasa.gov/api/map_key/")
    sources = sources or config.FIRMS_SOURCES
    end = end or datetime.utcnow().date()
    start = end - timedelta(days=days - 1)
    area = ",".join(f"{v:.4f}" for v in bbox)
    frames = []
    for src in sources:
        for chunk_start, n in _chunks(start, end):
            url = f"{FIRMS_BASE}/{map_key}/{src}/{area}/{n}/{chunk_start.isoformat()}"
            log.info("FIRMS GET %s", url.replace(map_key, "***"))
            r = requests.get(url, timeout=120)
            if r.status_code != 200 or r.text.startswith("Invalid"):
                log.warning("FIRMS request failed (%s): %s", r.status_code, r.text[:200])
                continue
            df = pd.read_csv(io.StringIO(r.text))
            if len(df):
                frames.append(normalise_firms_df(df))
    if not frames:
        return pd.DataFrame(columns=COMMON_COLUMNS)
    out = pd.concat(frames, ignore_index=True)
    # NOAA-20 / SNPP overlap -> drop duplicate observations of the same pixel/minute
    out = out.drop_duplicates(subset=["latitude", "longitude", "acq_datetime"]).reset_index(drop=True)
    return out


def load_csv(path) -> pd.DataFrame:
    """Load a raw FIRMS CSV export (from the FIRMS archive download tool) from disk."""
    return normalise_firms_df(pd.read_csv(path))
