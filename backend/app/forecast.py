"""Forecasting: what is likely to burn in the next week, not just what burned yesterday.

Two questions, two models, both strictly causal — every feature for an origin day `d` is
computed from detections on or before `d`, and the label is what happened in `(d, d+7]`.
Nothing about the future is ever in the inputs, and the test set is always *later in time*
than the training set, because a forecast scored on a random split is not a forecast.

  incident risk   per persistent thermal source: will this site spike far above its own
                  baseline in the next 7 days? Plants run into upset conditions — unstable
                  process heat, extra flaring — before something fails, so the recent rise
                  against a long baseline is the signal.

  outbreak risk   per ~28 km grid cell: will this area see a burst of new fire detections in
                  the next 7 days? Driven by recent local activity, what the neighbouring
                  cells are doing, and where the calendar sits in the residue-burning season.

Both report against the base rate, because "97% accurate" on a rare event means nothing:
AUC, PR-AUC, Brier, and the lift over simply guessing the base rate for everyone.
"""
from __future__ import annotations

import logging
from datetime import timedelta

import numpy as np
import pandas as pd
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.metrics import average_precision_score, brier_score_loss, roc_auc_score

log = logging.getLogger(__name__)

HORIZON = 7          # days ahead the forecast covers
LOOKBACK = 28        # days of history each feature window may see
MIN_HISTORY = 14     # an origin day needs at least this much history behind it
GRID_DEG = 0.25      # ~28 km cells for the outbreak model
OUTBREAK_MIN = 5     # detections in the horizon that count as an outbreak

SITE_TYPES = ["refinery", "steel_plant", "power_plant", "gas_flare", "cement_plant",
              "brick_kiln", "mine", "chemical_plant", "industrial", "none"]


def _hgb():
    return HistGradientBoostingClassifier(max_iter=200, learning_rate=0.06, max_depth=5,
                                          l2_regularization=0.8, random_state=42)


def _slope(v: np.ndarray) -> float:
    """Least-squares trend of a short series; 0 when there is nothing to fit."""
    n = len(v)
    if n < 3 or np.allclose(v, v[0]):
        return 0.0
    x = np.arange(n, dtype=float)
    return float(np.polyfit(x, v, 1)[0])


def _scores(y_true, proba) -> dict:
    y = np.asarray(y_true).astype(int)
    base = float(y.mean())
    out = {"n": int(len(y)), "positives": int(y.sum()), "base_rate": round(base, 4),
           "brier": round(float(brier_score_loss(y, proba)), 4)}
    if 0 < y.sum() < len(y):
        out["auc"] = round(float(roc_auc_score(y, proba)), 4)
        out["pr_auc"] = round(float(average_precision_score(y, proba)), 4)
        # Does ranking by risk actually put the events at the top?
        k = max(1, int(0.10 * len(y)))
        top = np.argsort(-np.asarray(proba))[:k]
        hit = float(y[top].mean())
        out["precision_at_10pct"] = round(hit, 4)
        out["lift_at_10pct"] = round(hit / base, 2) if base > 0 else None
    return out


# ------------------------------------------------------------------ incident risk

def _daily_source_panel(h: pd.DataFrame) -> pd.DataFrame:
    d = h.copy()
    d["acq_date"] = pd.to_datetime(d["acq_date"])
    g = d.groupby(["group_id", "acq_date"])
    daily = g.agg(n_det=("frp", "size"), frp_sum=("frp", "sum"), frp_max=("frp", "max"),
                  frp_med=("frp", "median"), n_night=("is_night", "sum"),
                  n_anom=("is_anomaly", "sum")).reset_index()
    return daily


def build_incident_panel(h: pd.DataFrame, sources: pd.DataFrame) -> pd.DataFrame:
    """One row per (persistent source, origin day) with causal features and a future label."""
    if sources is None or len(sources) == 0 or len(h) == 0:
        return pd.DataFrame()
    daily = _daily_source_panel(h[h["group_id"].isin(set(sources["group_id"]))])
    if len(daily) == 0:
        return pd.DataFrame()
    all_days = pd.date_range(daily["acq_date"].min(), daily["acq_date"].max(), freq="D")
    static = sources.set_index("group_id")
    rows = []

    for gid, s in daily.groupby("group_id"):
        s = s.set_index("acq_date").reindex(all_days).fillna(0.0)
        det, fmax, fsum = s["n_det"].to_numpy(), s["frp_max"].to_numpy(), s["frp_sum"].to_numpy()
        night, anom = s["n_night"].to_numpy(), (s["n_anom"].to_numpy() > 0).astype(int)
        ctx = static.loc[gid] if gid in static.index else None
        n = len(all_days)

        for i in range(MIN_HISTORY, n - HORIZON):
            past28 = slice(max(0, i - LOOKBACK + 1), i + 1)
            past7 = slice(max(0, i - 6), i + 1)
            f28, f7 = fmax[past28], fmax[past7]
            active28 = f28[det[past28] > 0]
            base = float(np.median(active28)) if len(active28) else 0.0
            mad = float(np.median(np.abs(active28 - base))) if len(active28) else 0.0
            recent = float(np.max(f7)) if len(f7) else 0.0
            mean7 = float(np.mean(f7[det[past7] > 0])) if (det[past7] > 0).any() else 0.0
            since = i - np.max(np.nonzero(det[: i + 1])[0]) if det[: i + 1].any() else LOOKBACK

            future = anom[i + 1: i + 1 + HORIZON]
            rows.append({
                "group_id": gid, "origin": all_days[i],
                "active_days_28": float((det[past28] > 0).sum()),
                "active_days_7": float((det[past7] > 0).sum()),
                "det_7": float(det[past7].sum()),
                "frp_base_28": round(base, 3),
                "frp_mad_28": round(mad, 3),
                "frp_max_7": round(recent, 3),
                # the core precursor: how far above its own normal the site has been running
                "ratio_recent_base": round(recent / max(base, 0.2), 3),
                "ratio_mean7_base": round(mean7 / max(base, 0.2), 3),
                "robust_z_7": round((recent - base) / max(1.4826 * mad, 0.5), 3),
                "trend_frp_14": round(_slope(fmax[max(0, i - 13): i + 1]), 4),
                "trend_det_14": round(_slope(det[max(0, i - 13): i + 1].astype(float)), 4),
                "cv_28": round(float(np.std(f28) / max(np.mean(f28), 0.2)), 3),
                "night_frac_28": round(float(night[past28].sum() / max(det[past28].sum(), 1)), 3),
                "frp_sum_7": round(float(fsum[past7].sum()), 2),
                "days_since_detection": float(since),
                "anom_days_28": float(anom[past28].sum()),          # past only, never future
                "anom_days_7": float(anom[past7].sum()),
                "dist_industrial_km": float(ctx["dist_industrial_km"]) if ctx is not None else 999.0,
                "persistence_score": float(ctx["persistence_score"]) if ctx is not None else 0.0,
                "site_type": str(ctx["nearest_site_type"]) if ctx is not None else "none",
                "doy": float(all_days[i].dayofyear),
                "burn_season": float(all_days[i].month in (10, 11, 4, 5)),
                "y": int(future.sum() > 0),
            })
    return pd.DataFrame(rows)


def _matrix(panel: pd.DataFrame, numeric: list[str]) -> pd.DataFrame:
    X = panel[numeric].astype(float).copy()
    if "site_type" in panel.columns:
        for t in SITE_TYPES:
            X[f"site_{t}"] = (panel["site_type"] == t).astype(int)
    return X


INCIDENT_NUMERIC = ["active_days_28", "active_days_7", "det_7", "frp_base_28", "frp_mad_28", "frp_max_7",
                    "ratio_recent_base", "ratio_mean7_base", "robust_z_7", "trend_frp_14", "trend_det_14",
                    "cv_28", "night_frac_28", "frp_sum_7", "days_since_detection", "anom_days_28",
                    "anom_days_7", "dist_industrial_km", "persistence_score", "doy", "burn_season"]


# ------------------------------------------------------------------ outbreak risk

OUTBREAK_NUMERIC = ["det_3", "det_7", "det_14", "det_28", "active_days_14", "frp_sum_7", "frp_max_7",
                    "neigh_det_7", "neigh_det_28", "trend_det_14", "night_frac_14", "doy", "burn_season",
                    "crop_frac_28", "forest_frac_28"]


def build_outbreak_panel(h: pd.DataFrame) -> pd.DataFrame:
    """One row per (grid cell, origin day): does this area burst into fire next week?"""
    if len(h) == 0:
        return pd.DataFrame()
    d = h.copy()
    d["acq_date"] = pd.to_datetime(d["acq_date"])
    d["cy"] = np.floor(d["latitude"] / GRID_DEG).astype(int)
    d["cx"] = np.floor(d["longitude"] / GRID_DEG).astype(int)
    d["is_crop"] = (d["landcover"] == "cropland").astype(int)
    d["is_forest"] = d["landcover"].isin(["forest", "shrub_grass"]).astype(int)

    daily = d.groupby(["cy", "cx", "acq_date"]).agg(
        n_det=("frp", "size"), frp_sum=("frp", "sum"), frp_max=("frp", "max"),
        n_night=("is_night", "sum"), n_crop=("is_crop", "sum"), n_forest=("is_forest", "sum")).reset_index()
    all_days = pd.date_range(daily["acq_date"].min(), daily["acq_date"].max(), freq="D")
    day_index = {d_: i for i, d_ in enumerate(all_days)}
    n = len(all_days)

    # dense per-cell series, plus a neighbourhood sum over the 8 surrounding cells
    cells = {}
    for (cy, cx), s in daily.groupby(["cy", "cx"]):
        arr = np.zeros((6, n))
        idx = s["acq_date"].map(day_index).to_numpy()
        arr[0, idx] = s["n_det"]
        arr[1, idx] = s["frp_sum"]
        arr[2, idx] = s["frp_max"]
        arr[3, idx] = s["n_night"]
        arr[4, idx] = s["n_crop"]
        arr[5, idx] = s["n_forest"]
        cells[(cy, cx)] = arr

    rows = []
    for (cy, cx), a in cells.items():
        det, fsum, fmax, night, crop, forest = a
        neigh = np.zeros(n)
        for dy in (-1, 0, 1):
            for dx in (-1, 0, 1):
                if dy or dx:
                    nb = cells.get((cy + dy, cx + dx))
                    if nb is not None:
                        neigh += nb[0]
        for i in range(MIN_HISTORY, n - HORIZON):
            p3, p7, p14, p28 = (slice(max(0, i - k + 1), i + 1) for k in (3, 7, 14, 28))
            if det[p28].sum() == 0 and neigh[p28].sum() == 0:
                continue                      # nothing has ever happened here; not a candidate
            rows.append({
                "cy": cy, "cx": cx, "origin": all_days[i],
                "lat": round((cy + 0.5) * GRID_DEG, 4), "lon": round((cx + 0.5) * GRID_DEG, 4),
                "det_3": float(det[p3].sum()), "det_7": float(det[p7].sum()),
                "det_14": float(det[p14].sum()), "det_28": float(det[p28].sum()),
                "active_days_14": float((det[p14] > 0).sum()),
                "frp_sum_7": round(float(fsum[p7].sum()), 2), "frp_max_7": round(float(fmax[p7].max()), 2),
                "neigh_det_7": float(neigh[p7].sum()), "neigh_det_28": float(neigh[p28].sum()),
                "trend_det_14": round(_slope(det[p14].astype(float)), 4),
                "night_frac_14": round(float(night[p14].sum() / max(det[p14].sum(), 1)), 3),
                "crop_frac_28": round(float(crop[p28].sum() / max(det[p28].sum(), 1)), 3),
                "forest_frac_28": round(float(forest[p28].sum() / max(det[p28].sum(), 1)), 3),
                "doy": float(all_days[i].dayofyear),
                "burn_season": float(all_days[i].month in (10, 11, 4, 5)),
                "y": int(det[i + 1: i + 1 + HORIZON].sum() >= OUTBREAK_MIN),
            })
    return pd.DataFrame(rows)


# ------------------------------------------------------------------ fit + predict

def _fit_and_score(panel: pd.DataFrame, numeric: list[str], name: str, test_frac: float = 0.3):
    """Train on the earlier days, test on the later ones. Never the other way round."""
    if len(panel) == 0 or panel["y"].nunique() < 2:
        log.warning("%s forecast: not enough signal to train", name)
        return None, {"trained": False, "reason": "not enough labelled history"}
    origins = np.sort(panel["origin"].unique())
    cut = origins[max(1, int(len(origins) * (1 - test_frac)))]
    tr, te = panel[panel["origin"] < cut], panel[panel["origin"] >= cut]
    if tr["y"].nunique() < 2 or len(te) == 0:
        return None, {"trained": False, "reason": "no positives before the cutoff"}

    Xtr, Xte = _matrix(tr, numeric), _matrix(te, numeric)
    m = _hgb().fit(Xtr, tr["y"])
    metrics = {
        "trained": True,
        "scheme": f"time split — train on origins before {pd.Timestamp(cut).date()}, test on or after",
        "horizon_days": HORIZON, "lookback_days": LOOKBACK,
        "train": _scores(tr["y"], m.predict_proba(Xtr)[:, 1]),
        "test": _scores(te["y"], m.predict_proba(Xte)[:, 1]),
    }
    if te["y"].nunique() < 2:
        metrics["test"]["note"] = "no positive cases after the cutoff"
    # refit on everything so the live risk scores use all available history
    full = _hgb().fit(_matrix(panel, numeric), panel["y"])
    metrics["feature_importance"] = _importance(full, _matrix(panel, numeric).sample(
        min(1200, len(panel)), random_state=3))
    return full, metrics


def _importance(m, X: pd.DataFrame) -> list[dict]:
    base = m.predict_proba(X)[:, 1]
    rng = np.random.default_rng(0)
    rows = []
    for c in X.columns:
        Xs = X.copy()
        Xs[c] = rng.permutation(Xs[c].to_numpy())
        rows.append({"feature": c, "importance": round(float(np.abs(m.predict_proba(Xs)[:, 1] - base).mean()), 5)})
    rows.sort(key=lambda r: -r["importance"])
    return rows[:10]


def _source_drivers(row: pd.Series) -> list[str]:
    """Plain-language reasons, so a risk score is never just a number."""
    out = []
    if row.get("ratio_recent_base", 0) >= 1.6:
        out.append(f"running {row['ratio_recent_base']:.1f}× its own baseline in the last week")
    if row.get("robust_z_7", 0) >= 2:
        out.append(f"recent peak {row['robust_z_7']:.1f} robust z above normal")
    if row.get("trend_frp_14", 0) > 0.05:
        out.append("FRP trending up over the last fortnight")
    if row.get("anom_days_28", 0) > 0:
        out.append(f"{int(row['anom_days_28'])} anomaly days already in the last month")
    if row.get("cv_28", 0) >= 1.0:
        out.append(f"unstable output (cv {row['cv_28']:.2f})")
    if row.get("active_days_7", 0) >= 6:
        out.append("burning on every pass this week")
    if not out and row.get("active_days_28", 0) >= 12:
        out.append(f"active {int(row['active_days_28'])} of the last 28 days at a steady "
                   f"{row.get('frp_base_28', 0):.0f} MW")
    return out or ["no precursor in the last week; risk carried by this site's longer history"]


def _grid_drivers(row: pd.Series) -> list[str]:
    out = []
    if row.get("det_7", 0) >= 5:
        out.append(f"{int(row['det_7'])} detections here in the last week")
    if row.get("neigh_det_7", 0) >= 10:
        out.append(f"{int(row['neigh_det_7'])} more in the surrounding cells")
    if row.get("trend_det_14", 0) > 0.1:
        out.append("activity climbing over the fortnight")
    if row.get("burn_season", 0) and row.get("crop_frac_28", 0) >= 0.4:
        out.append("cropland in residue-burning season")
    elif row.get("forest_frac_28", 0) >= 0.4:
        out.append("forest and scrub in the dry season")
    if not out and row.get("det_28", 0) > 0:
        out.append(f"{int(row['det_28'])} detections in the last month, nothing recent")
    return out or ["quiet cell next to active ones"]


def run(h: pd.DataFrame, sources: pd.DataFrame) -> tuple[pd.DataFrame, pd.DataFrame, dict]:
    """Returns (source risk, grid risk, metrics)."""
    inc_panel = build_incident_panel(h, sources)
    out_panel = build_outbreak_panel(h)
    inc_model, inc_metrics = _fit_and_score(inc_panel, INCIDENT_NUMERIC, "incident")
    out_model, out_metrics = _fit_and_score(out_panel, OUTBREAK_NUMERIC, "outbreak")

    inc_risk = pd.DataFrame()
    if inc_model is not None and len(inc_panel):
        last = inc_panel[inc_panel["origin"] == inc_panel["origin"].max()].copy()
        last["risk"] = inc_model.predict_proba(_matrix(last, INCIDENT_NUMERIC))[:, 1].round(4)
        static = sources.set_index("group_id")
        last["lat"] = last["group_id"].map(static["lat"])
        last["lon"] = last["group_id"].map(static["lon"])
        last["label"] = last["group_id"].map(static["label"])
        last["site_name"] = last["group_id"].map(static["nearest_site_name"])
        last["drivers"] = [_source_drivers(r) for _, r in last.iterrows()]
        last["horizon_to"] = str((last["origin"].max() + timedelta(days=HORIZON)).date())
        last["origin"] = last["origin"].dt.strftime("%Y-%m-%d")
        inc_risk = last.sort_values("risk", ascending=False).reset_index(drop=True)[
            ["group_id", "origin", "horizon_to", "risk", "lat", "lon", "label", "site_name", "site_type",
             "ratio_recent_base", "robust_z_7", "trend_frp_14", "anom_days_28", "active_days_7",
             "frp_base_28", "frp_max_7", "drivers"]]

    out_risk = pd.DataFrame()
    if out_model is not None and len(out_panel):
        last = out_panel[out_panel["origin"] == out_panel["origin"].max()].copy()
        last["risk"] = out_model.predict_proba(_matrix(last, OUTBREAK_NUMERIC))[:, 1].round(4)
        last["drivers"] = [_grid_drivers(r) for _, r in last.iterrows()]
        last["horizon_to"] = str((last["origin"].max() + timedelta(days=HORIZON)).date())
        last["origin"] = last["origin"].dt.strftime("%Y-%m-%d")
        out_risk = last.sort_values("risk", ascending=False).reset_index(drop=True)[
            ["cy", "cx", "lat", "lon", "origin", "horizon_to", "risk", "det_7", "det_28", "neigh_det_7",
             "crop_frac_28", "forest_frac_28", "burn_season", "drivers"]]
        out_risk["cell_deg"] = GRID_DEG

    metrics = {"horizon_days": HORIZON, "grid_deg": GRID_DEG, "outbreak_min_detections": OUTBREAK_MIN,
               "incident": inc_metrics, "outbreak": out_metrics,
               "n_source_rows": int(len(inc_panel)), "n_grid_rows": int(len(out_panel))}
    return inc_risk, out_risk, metrics
