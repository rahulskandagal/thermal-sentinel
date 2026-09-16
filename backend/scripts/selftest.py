"""Quick self-test: run demo pipeline, print model metrics, and check FIRMS CSV parsing."""
import io
import json
import logging
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import pandas as pd  # noqa: E402

from app import config, db, firms, pipeline  # noqa: E402

logging.basicConfig(level=logging.WARNING)

if config.MODEL_PATH.exists():
    config.MODEL_PATH.unlink()
db.init()
meta = pipeline.run("demo")
print("run:", json.dumps(meta))
mm = db.get_meta("model_metrics")
print("ML acc", mm["accuracy"], "| rules-only acc", mm["rules_only_accuracy"], "|", mm["split"])
print("per-class F1", {k: round(v["f1-score"], 3) for k, v in mm["report"].items() if k in mm["classes"]})
print("top features", [f["feature"] for f in mm["feature_importance"][:8]])
s = db.stats()
print("by_label", s["by_label"], "| acc vs truth", s["label_accuracy_vs_truth"], "| sources", s["n_persistent_sources"],
      "| anomalies", s["totals"]["anomalies"])
print("top sources:", [(t["nearest_site_name"], t["label"], t["n_days"]) for t in s["top_sources"][:5]])

sample = """latitude,longitude,bright_ti4,scan,track,acq_date,acq_time,satellite,instrument,confidence,version,bright_ti5,frp,daynight
22.3521,70.0492,345.2,0.39,0.36,2025-04-21,0806,N,VIIRS,n,2.0NRT,301.5,18.4,D
23.7401,86.4201,312.7,0.42,0.38,2025-04-21,2031,1,VIIRS,l,2.0NRT,290.1,4.2,N"""
print("FIRMS parse:", firms.normalise_firms_df(pd.read_csv(io.StringIO(sample))).to_dict("records"))
modis = """latitude,longitude,brightness,scan,track,acq_date,acq_time,satellite,instrument,confidence,version,bright_t31,frp,daynight
22.3521,70.0492,325.2,1.1,1.0,2025-04-21,0806,Terra,MODIS,85,6.1NRT,301.5,28.4,D"""
print("MODIS parse:", firms.normalise_firms_df(pd.read_csv(io.StringIO(modis))).to_dict("records"))
