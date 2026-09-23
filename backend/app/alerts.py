"""Turn classified hotspots into a ranked operational alert feed.

A control room cannot read 22,000 detections. It can read a page of alerts, ordered by
severity, each one saying what changed and why it matters. Four things are worth waking
someone up for:

  FRP_ANOMALY   a known source is burning far above its own baseline  -> incident candidate
  NEW_SOURCE    a persistent thermal source that was not there before -> new/unlicensed plant
  WENT_DARK     a persistent source has gone quiet                    -> shutdown, or an outage
                                                                         in the detection chain
  UNREGISTERED  persistent industrial-type heat with no mapped facility nearby

Severity is 0-100 so the feed sorts itself. Every alert carries the evidence that produced
it, the same strings the classifier shows on the map.
"""
from __future__ import annotations

import logging
from datetime import date, datetime

import numpy as np
import pandas as pd

from . import config

log = logging.getLogger(__name__)

KINDS = {
    "FRP_ANOMALY": "FRP anomaly at a known source",
    "NEW_SOURCE": "New persistent thermal source",
    "WENT_DARK": "Persistent source went quiet",
    "UNREGISTERED": "Unregistered industrial heat",
}
INDUSTRIAL_LABELS = {"INDUSTRIAL_FIRE", "GAS_FLARE", "MINING_ACTIVITY"}


def _d(v) -> date | None:
    try:
        return pd.to_datetime(v).date()
    except Exception:  # noqa: BLE001
        return None


def _site_name(r) -> str:
    name = r.get("nearest_site_name")
    if name and float(r.get("dist_industrial_km", 999)) <= 3.0:
        return str(name)
    return f"Unmapped source @ {float(r['lat']):.3f}, {float(r['lon']):.3f}"


def build(hotspots: pd.DataFrame, sources: pd.DataFrame, window_end: date | None = None) -> pd.DataFrame:
    """One row per alert, highest severity first."""
    cols = ["id", "kind", "severity", "group_id", "lat", "lon", "label", "confidence", "title", "detail",
            "alert_date", "site_name", "n_days", "frp", "frp_baseline", "hotspot_id"]
    if sources is None or len(sources) == 0:
        return pd.DataFrame(columns=cols)

    if window_end is None:
        window_end = _d(hotspots["acq_date"].max()) if len(hotspots) else date.today()
    by_group = {r["group_id"]: r for _, r in sources.iterrows()}
    rows: list[dict] = []

    # ---- 1. FRP anomalies: keep the worst detection per source per day
    if len(hotspots) and "is_anomaly" in hotspots.columns:
        a = hotspots[hotspots["is_anomaly"] == 1]
        if len(a):
            a = a.sort_values("anomaly_severity", ascending=False).drop_duplicates(["group_id", "acq_date"])
            for _, h in a.iterrows():
                s = by_group.get(h["group_id"])
                if s is None:
                    continue
                base = float(h.get("frp_med") or 0)
                ratio = float(h["frp"]) / max(base, 0.2)
                rows.append({
                    "kind": "FRP_ANOMALY", "severity": round(float(h.get("anomaly_severity") or 0), 1),
                    "group_id": h["group_id"], "lat": float(s["lat"]), "lon": float(s["lon"]),
                    "label": h["label"], "confidence": float(h.get("confidence") or 0),
                    "title": f"{_site_name(s)} burning {ratio:.1f}× its normal",
                    "detail": (f"{float(h['frp']):.1f} MW against a {base:.1f} MW median for this source "
                               f"(robust z = {float(h.get('frp_robust_z') or 0):.1f}). "
                               f"{int(s['n_days'])} active days of history."),
                    "alert_date": str(h["acq_date"]), "site_name": _site_name(s),
                    "n_days": int(s["n_days"]), "frp": round(float(h["frp"]), 2), "frp_baseline": round(base, 2),
                    "hotspot_id": h.get("id"),
                })

    # ---- 2/3/4. Source-level alerts
    for _, s in sources.iterrows():
        first, last = _d(s["first_seen"]), _d(s["last_seen"])
        n_days, label = int(s["n_days"]), str(s["label"])
        dist = float(s.get("dist_industrial_km", 999))
        name = _site_name(s)
        common = {"group_id": s["group_id"], "lat": float(s["lat"]), "lon": float(s["lon"]), "label": label,
                  "confidence": float(s.get("confidence") or 0), "site_name": name, "n_days": n_days,
                  "frp": round(float(s.get("frp_mean") or 0), 2), "frp_baseline": round(float(s.get("frp_mean") or 0), 2),
                  "hotspot_id": None}

        if first and (window_end - first).days <= config.ALERT_NEW_SOURCE_DAYS:
            rows.append({**common, "kind": "NEW_SOURCE",
                         "severity": round(min(95.0, 45 + 3.0 * n_days + 0.4 * float(s.get("frp_mean") or 0)), 1),
                         "title": f"New persistent source: {name}",
                         "detail": (f"First detected {first}, already {n_days} active days at "
                                    f"{float(s.get('frp_mean') or 0):.1f} MW mean FRP. Classified {label}."),
                         "alert_date": str(first)})

        if last:
            quiet = (window_end - last).days
            if quiet >= config.ALERT_SILENT_DAYS and n_days >= config.ANOMALY_MIN_DAYS:
                rows.append({**common, "kind": "WENT_DARK",
                             "severity": round(min(80.0, 28 + 1.6 * quiet + 1.2 * n_days), 1),
                             "title": f"{name} quiet for {quiet} days",
                             "detail": (f"Was active on {n_days} days up to {last}, nothing since. "
                                        f"Shutdown, seasonal stop, or a gap in the detection chain."),
                             "alert_date": str(last)})

        if label in INDUSTRIAL_LABELS and dist > config.UNREGISTERED_MIN_DIST_KM and n_days >= config.ANOMALY_MIN_DAYS:
            rows.append({**common, "kind": "UNREGISTERED",
                         "severity": round(min(85.0, 30 + 1.8 * n_days + 0.5 * float(s.get("frp_mean") or 0)), 1),
                         "title": f"Unmapped industrial heat @ {float(s['lat']):.3f}, {float(s['lon']):.3f}",
                         "detail": (f"{n_days} active days classified {label}, but the nearest mapped facility is "
                                    f"{dist:.1f} km away. Candidate for the national source registry."),
                         "alert_date": str(last or window_end)})

    if not rows:
        return pd.DataFrame(columns=cols)
    out = pd.DataFrame(rows).sort_values("severity", ascending=False).reset_index(drop=True)
    out.insert(0, "id", [f"a{i}" for i in range(len(out))])
    return out[cols]


def summarise(alerts: pd.DataFrame) -> dict:
    if alerts is None or len(alerts) == 0:
        return {"total": 0, "by_kind": {}, "high": 0, "generated_at": datetime.utcnow().isoformat() + "Z"}
    return {
        "total": int(len(alerts)),
        "by_kind": {k: int(v) for k, v in alerts["kind"].value_counts().items()},
        "high": int((alerts["severity"] >= 70).sum()),
        "max_severity": float(np.max(alerts["severity"])),
        "generated_at": datetime.utcnow().isoformat() + "Z",
    }
