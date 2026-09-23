"""Runtime configuration (env vars, paths, tunables)."""
from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

DATA_DIR = Path(os.getenv("DATA_DIR", BASE_DIR / "data"))
DATA_DIR.mkdir(parents=True, exist_ok=True)
DB_PATH = Path(os.getenv("DB_PATH", DATA_DIR / "thermal.sqlite"))
MODEL_PATH = DATA_DIR / "classifier.joblib"

# NASA FIRMS MAP_KEY -> https://firms.modaps.eosdis.nasa.gov/api/map_key/
FIRMS_MAP_KEY = os.getenv("FIRMS_MAP_KEY", "").strip()
FIRMS_SOURCES = [s.strip() for s in os.getenv("FIRMS_SOURCES", "VIIRS_SNPP_NRT,VIIRS_NOAA20_NRT").split(",") if s.strip()]
OVERPASS_URL = os.getenv("OVERPASS_URL", "https://overpass-api.de/api/interpreter")

# India bounding box: west, south, east, north
DEFAULT_BBOX = tuple(float(x) for x in os.getenv("DEFAULT_BBOX", "68.0,6.5,97.5,37.5").split(","))
DEFAULT_DAYS = int(os.getenv("DEFAULT_DAYS", "90"))

# --- Tunables for persistence / classification ---------------------------------
CELL_DEG = 0.005                 # ~550 m grid used for per-location temporal statistics
CLUSTER_EPS_M = 750.0            # DBSCAN neighbourhood radius (metres)
CLUSTER_MIN_SAMPLES = 3
PERSISTENT_MIN_DAYS = 8          # distinct detection days in the window
PERSISTENT_MIN_SPAN_DAYS = 14    # first->last detection span
INDUSTRIAL_RADIUS_M = 1500.0     # hotspot is "at" an industrial site within this
MINING_RADIUS_M = 2500.0
EVAL_BLOCK_DEG = 3.0             # ~330 km blocks, held out whole when scoring the model

# --- Anomaly detection (FRP far above a source's own robust baseline) -----------
ANOMALY_ROBUST_Z = 4.0           # (frp - median) / (1.4826 * MAD) for that source
ANOMALY_RATIO = 2.5              # frp / median for that source
ANOMALY_MIN_DAYS = 6             # need this much history before a baseline means anything
ANOMALY_MIN_FRP = 8.0            # ignore spikes that are still small in absolute terms

# --- Alerting -------------------------------------------------------------------
ALERT_SILENT_DAYS = 10           # a persistent source quiet this long has "gone dark"
ALERT_NEW_SOURCE_DAYS = 21       # first seen this recently = newly appeared source
UNREGISTERED_MIN_DIST_KM = 3.0   # persistent industrial heat this far from any mapped site
