"""Self-test: run the demo pipeline, print the model's honest scores, check FIRMS parsing.

Doubles as the CI gate — it exits non-zero if the pipeline degrades below the thresholds at
the bottom, so a bad change cannot quietly ship to the public demo.
"""
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
cv, sp, ab, cal = mm["cv"], mm["spatial_holdout"], mm["ablation"], mm["calibration"]
print(f"\nfeatures            {mm['n_features']}")
print(f"hold-out (hybrid)   acc {mm['accuracy']:.4f}  macro-F1 {mm['macro_f1']:.4f}   [{mm['split']}]")
print(f"cross-validation    acc {cv['accuracy_mean']:.4f} +/- {cv['accuracy_std']:.4f}  "
      f"macro-F1 {cv['macro_f1_mean']:.4f}   [{cv['scheme']}]")
if sp.get("accuracy_mean") is not None:
    print(f"unseen region       acc {sp['accuracy_mean']:.4f} (worst block {sp['accuracy_min']:.4f}) "
          f"over {len(sp['blocks'])} blocks")
print(f"ablation            rules {ab['rules_only']['accuracy']:.4f} | model {ab['model_only']['accuracy']:.4f} "
      f"| hybrid {ab['hybrid']['accuracy']:.4f}")
print(f"calibration ({cal['method']:8s}) ECE {cal['ece_before']:.4f} -> {cal['ece_after']:.4f}   "
      f"Brier {cal['brier_before']:.4f} -> {cal['brier_after']:.4f}")
print("per-class F1       ", {k: round(v["f1-score"], 3) for k, v in mm["report"].items() if k in mm["classes"]})
print("top features       ", [f["feature"] for f in mm["feature_importance"][:8]])

s = db.stats()
print("\nby_label", s["by_label"])
print("agreement vs archive truth", s["label_accuracy_vs_truth"], "| sources", s["n_persistent_sources"],
      "| FRP anomalies", s["totals"]["anomalies"])
print("alerts", s["n_alerts"], s["alerts_by_kind"])
for a in db.get_alerts(limit=6):
    print(f"  [{a['severity']:5.1f}] {a['kind']:12s} {a['title']}")
print("top sources:", [(t["nearest_site_name"], t["label"], t["n_days"]) for t in s["top_sources"][:5]])

# --- analyst feedback loop -----------------------------------------------------
gid = s["top_sources"][0]["group_id"]
db.add_feedback("GAS_FLARE", "correct", group_id=gid, note="selftest", analyst="ci")
assert db.feedback_labels().get(gid) == "GAS_FLARE", "feedback not stored"
print("feedback loop      ", len(db.get_feedback()), "entries,", len(db.feedback_labels()), "corrections pending")

# --- FIRMS / MODIS CSV parsing -------------------------------------------------
sample = """latitude,longitude,bright_ti4,scan,track,acq_date,acq_time,satellite,instrument,confidence,version,bright_ti5,frp,daynight
22.3521,70.0492,345.2,0.39,0.36,2025-04-21,0806,N,VIIRS,n,2.0NRT,301.5,18.4,D
23.7401,86.4201,312.7,0.42,0.38,2025-04-21,2031,1,VIIRS,l,2.0NRT,290.1,4.2,N"""
print("\nFIRMS parse:", firms.normalise_firms_df(pd.read_csv(io.StringIO(sample))).to_dict("records"))
modis = """latitude,longitude,brightness,scan,track,acq_date,acq_time,satellite,instrument,confidence,version,bright_t31,frp,daynight
22.3521,70.0492,325.2,1.1,1.0,2025-04-21,0806,Terra,MODIS,85,6.1NRT,301.5,28.4,D"""
print("MODIS parse:", firms.normalise_firms_df(pd.read_csv(io.StringIO(modis))).to_dict("records"))

# --- CI gate -------------------------------------------------------------------
checks = [
    ("cross-validated accuracy >= 0.90", cv["accuracy_mean"] >= 0.90),
    ("unseen-region accuracy >= 0.80", (sp.get("accuracy_mean") or 1.0) >= 0.80),
    ("hybrid no worse than rules alone", ab["hybrid"]["accuracy"] >= ab["rules_only"]["accuracy"] - 1e-9),
    ("calibration improved or already tight", cal["ece_after"] <= max(cal["ece_before"], 0.05) + 1e-9),
    ("persistent sources found", s["n_persistent_sources"] > 0),
    ("alerts generated", s["n_alerts"] > 0),
    ("every alert kind present", set(s["alerts_by_kind"]) >= {"FRP_ANOMALY", "NEW_SOURCE", "WENT_DARK", "UNREGISTERED"}),
]
print()
bad = 0
for name, ok in checks:
    print(("  PASS  " if ok else "  FAIL  ") + name)
    bad += not ok
sys.exit(1 if bad else 0)
