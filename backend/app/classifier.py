"""Hybrid classifier: explainable rules + calibrated gradient-boosted trees.

Labels
------
INDUSTRIAL_FIRE   – thermal anomaly at an industrial facility (routine process heat or an incident)
GAS_FLARE         – persistent, mostly night-detected, low-variance flare at oil/gas infrastructure
MINING_ACTIVITY   – coal-seam / mine fires, quarries, overburden fires
AGRICULTURAL_BURN – short-lived, daytime, low-FRP fires on cropland in residue-burning season
WILDFIRE          – forest / shrub / grassland fires, multi-day but not persistent
OTHER             – unresolved (e.g. urban waste burning, landfill fires)

Each hotspot also carries `is_persistent` (recurring thermal source) and `is_anomaly`
(FRP spike far above that source's own *robust* baseline → likely industrial fire/explosion
rather than routine operation).

How it is scored
----------------
A single random train/test split would flatter the model: detections of one refinery share
per-source persistence features, and neighbouring districts share a burning season. So three
numbers are reported, all group-aware:

  * cv        – 5-fold GroupKFold by thermal source (no source spans the split)
  * spatial   – leave-one-block-out over ~330 km blocks (train on the rest of India,
                then predict a region the model has never seen)
  * ablation  – rules only / model only / hybrid, on the same hold-out

Probabilities are calibrated (isotonic or Platt, fitted on held-out folds) so that
"82% confident" means the label is right about 82% of the time. Calibration error is
reported before and after, because an operator triages on that number.
"""
from __future__ import annotations

import logging
from typing import Iterable

import joblib
import numpy as np
import pandas as pd
from sklearn.calibration import CalibratedClassifierCV
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix, f1_score
from sklearn.model_selection import GroupKFold, GroupShuffleSplit

from . import config
from .features import FEATURE_COLUMNS, feature_matrix

log = logging.getLogger(__name__)

LABELS = ["INDUSTRIAL_FIRE", "GAS_FLARE", "MINING_ACTIVITY", "AGRICULTURAL_BURN", "WILDFIRE", "OTHER"]
INDUSTRIAL_SITE_TYPES = {"refinery", "steel_plant", "power_plant", "cement_plant", "brick_kiln", "chemical_plant", "industrial"}
ML_MIN_CONFIDENCE = 0.55   # below this the explainable rules decide, and the row says so


def _hgb() -> HistGradientBoostingClassifier:
    return HistGradientBoostingClassifier(max_iter=300, learning_rate=0.06, max_depth=6,
                                          l2_regularization=0.5, random_state=42, class_weight="balanced")


# ------------------------------------------------------------------ rules

def rule_classify_row(r: pd.Series) -> tuple[str, float, list[str]]:
    reasons: list[str] = []
    dist = float(r.get("dist_industrial_km", 999))
    st = str(r.get("nearest_site_type", "none"))
    lc = str(r.get("landcover", "unknown"))
    persistent = int(r.get("is_persistent", 0)) == 1
    n_days = int(r.get("n_days", 1))
    night_frac = float(r.get("night_frac", 0))
    frp = float(r.get("frp", 0))
    frp_cv = float(r.get("frp_cv", 0))
    burn_season = int(r.get("burn_season", 0)) == 1
    is_night = int(r.get("is_night", 0)) == 1
    neigh_5km = float(r.get("neighbours_5km", 0))
    n_sites_5km = float(r.get("n_sites_5km", 0))
    near_industry = dist * 1000 <= config.INDUSTRIAL_RADIUS_M
    near_mine = dist * 1000 <= config.MINING_RADIUS_M and st == "mine"

    if persistent:
        reasons.append(f"persistent source: {n_days} active days, span {r.get('span_days', 0):.0f} d")

    # 1. Gas flares: persistent, night-dominated, steady FRP, at oil/gas infra
    if (st == "gas_flare" and near_industry) or \
       (persistent and night_frac >= 0.6 and frp_cv <= 0.9 and st in ("gas_flare", "refinery") and dist <= 5):
        reasons += [f"{night_frac:.0%} night detections", f"steady FRP (cv={frp_cv:.2f})", f"{dist:.1f} km from {st}"]
        return "GAS_FLARE", 0.9, reasons

    # 2. Industrial facility
    if near_industry and st in INDUSTRIAL_SITE_TYPES:
        reasons.append(f"{dist * 1000:.0f} m from OSM {st.replace('_', ' ')}")
        if lc == "industrial":
            reasons.append("land cover: industrial")
        if n_sites_5km >= 3:
            reasons.append(f"{n_sites_5km:.0f} mapped facilities within 5 km (industrial estate)")
        return "INDUSTRIAL_FIRE", 0.88 if persistent else 0.75, reasons
    if lc == "industrial" and persistent:
        reasons.append("persistent on industrial land cover (site not in OSM)")
        return "INDUSTRIAL_FIRE", 0.7, reasons

    # 3. Mining / coal fires
    if near_mine or lc == "mining":
        reasons.append(f"{dist:.1f} km from mine/quarry" if near_mine else "land cover: mining")
        if persistent:
            reasons.append("long-lived, consistent with coal-seam fire")
        return "MINING_ACTIVITY", 0.85 if persistent else 0.7, reasons

    # 4. Agricultural residue burning
    if lc == "cropland" and not persistent:
        conf = 0.6
        reasons.append("land cover: cropland")
        if burn_season:
            conf += 0.2
            reasons.append("residue-burning season (Oct–Nov / Apr–May)")
        if not is_night:
            conf += 0.05
            reasons.append("daytime detection")
        if frp < 25:
            conf += 0.05
            reasons.append(f"low FRP ({frp:.1f} MW)")
        if neigh_5km >= 20:
            conf += 0.03
            reasons.append(f"{neigh_5km:.0f} other fires within 5 km (field-scale burning)")
        if n_days <= 2:
            reasons.append("short-lived (≤2 days)")
        return "AGRICULTURAL_BURN", min(conf, 0.92), reasons

    # 5. Wildfire
    if lc in ("forest", "shrub_grass") and not persistent:
        reasons.append(f"land cover: {lc.replace('_', '/')}")
        if n_days >= 2:
            reasons.append(f"burned over {n_days} days")
        if frp >= 30:
            reasons.append(f"high FRP ({frp:.0f} MW)")
        return "WILDFIRE", 0.8 if dist > 3 else 0.65, reasons

    # 6. Fallbacks
    if persistent:
        if night_frac >= 0.7 and frp_cv <= 0.8:
            reasons += ["persistent, night-dominated, steady → flare-like"]
            return "GAS_FLARE", 0.55, reasons
        reasons.append("persistent source with no OSM industrial context (candidate unregistered facility)")
        return "INDUSTRIAL_FIRE", 0.5, reasons
    if lc == "built":
        reasons.append("built-up land: likely waste/landfill burning")
        return "OTHER", 0.5, reasons
    if burn_season and not is_night and frp < 20 and lc == "unknown":
        reasons.append("season + low daytime FRP; land cover unknown")
        return "AGRICULTURAL_BURN", 0.45, reasons
    reasons.append("no strong contextual evidence")
    return ("WILDFIRE", 0.4, reasons) if lc == "unknown" and frp >= 20 else ("OTHER", 0.4, reasons)


def rule_classify(df: pd.DataFrame) -> pd.DataFrame:
    res = [rule_classify_row(r) for _, r in df.iterrows()]
    return pd.DataFrame(res, columns=["rule_label", "rule_conf", "reasons"], index=df.index)


# ------------------------------------------------------------------ scoring helpers

def expected_calibration_error(y_true, proba, classes, n_bins: int = 10) -> float:
    """Mean gap between stated confidence and observed accuracy, weighted by bin size."""
    classes = np.asarray(classes)
    conf = proba.max(axis=1)
    pred = classes[proba.argmax(axis=1)]
    correct = (pred == np.asarray(y_true)).astype(float)
    edges = np.linspace(0.0, 1.0, n_bins + 1)
    ece = 0.0
    for lo, hi in zip(edges[:-1], edges[1:]):
        m = (conf > lo) & (conf <= hi)
        if m.sum():
            ece += (m.sum() / len(conf)) * abs(correct[m].mean() - conf[m].mean())
    return float(ece)


def brier_score(y_true, proba, classes) -> float:
    classes = np.asarray(classes)
    onehot = (np.asarray(y_true)[:, None] == classes[None, :]).astype(float)
    return float(((proba - onehot) ** 2).sum(axis=1).mean())


def reliability_curve(y_true, proba, classes, n_bins: int = 10) -> list[dict]:
    classes = np.asarray(classes)
    conf = proba.max(axis=1)
    correct = (classes[proba.argmax(axis=1)] == np.asarray(y_true)).astype(float)
    edges = np.linspace(0.0, 1.0, n_bins + 1)
    out = []
    for lo, hi in zip(edges[:-1], edges[1:]):
        m = (conf > lo) & (conf <= hi)
        if m.sum():
            out.append({"bin": round((lo + hi) / 2, 3), "n": int(m.sum()),
                        "confidence": round(float(conf[m].mean()), 4),
                        "accuracy": round(float(correct[m].mean()), 4)})
    return out


# ------------------------------------------------------------------ ML model

class ThermalClassifier:
    def __init__(self):
        self.model = None                      # calibrated estimator used for inference
        self.metrics: dict = {}

    # -- training
    def train(self, df: pd.DataFrame, labels: Iterable[str]) -> dict:
        X = feature_matrix(df)
        y = pd.Series(list(labels), index=df.index).astype(str)
        # Group-aware everywhere: all detections of one thermal source stay together,
        # otherwise per-source persistence features leak the label across the split.
        groups = df["group_id"] if "group_id" in df.columns else pd.Series(df.index.astype(str), index=df.index)
        blocks = df["spatial_block"] if "spatial_block" in df.columns else groups

        cv = self._cross_validate(X, y, groups)
        spatial = self._spatial_holdout(X, y, blocks)

        # Headline hold-out, and the set the calibration numbers are measured on
        tr_idx, te_idx = next(GroupShuffleSplit(n_splits=1, test_size=0.25, random_state=42).split(X, y, groups))
        Xtr, Xte, ytr, yte = X.iloc[tr_idx], X.iloc[te_idx], y.iloc[tr_idx], y.iloc[te_idx]
        gtr = groups.iloc[tr_idx]

        raw = _hgb().fit(Xtr, ytr)
        calibrated, method = self._calibrate(Xtr, ytr, gtr)
        classes = list(calibrated.classes_)
        proba_raw = raw.predict_proba(Xte)[:, [list(raw.classes_).index(c) for c in classes]]
        proba_cal = calibrated.predict_proba(Xte)
        pred = np.array(classes)[proba_cal.argmax(axis=1)]
        self.model = calibrated

        rule_pred = rule_classify(df.iloc[te_idx])["rule_label"]
        hybrid_pred = self._blend(pred, proba_cal.max(axis=1), rule_pred.to_numpy())
        imp = self._importance(calibrated, Xte.sample(min(1500, len(Xte)), random_state=1))

        self.metrics = {
            "accuracy": round(float(accuracy_score(yte, hybrid_pred)), 4),
            "macro_f1": round(float(f1_score(yte, hybrid_pred, average="macro", zero_division=0)), 4),
            "split": "group-aware (by thermal source), 75/25 hold-out",
            "n_train": int(len(Xtr)), "n_test": int(len(Xte)), "n_features": len(FEATURE_COLUMNS),
            "classes": classes,
            "cv": cv,
            "spatial_holdout": spatial,
            "stress_test": self._stress_test(calibrated, df.iloc[te_idx], yte),
            "ablation": {
                "rules_only": _score(yte, rule_pred),
                "model_only": _score(yte, pred),
                "hybrid": _score(yte, hybrid_pred),
            },
            "calibration": {
                "method": method,
                "ece_before": round(expected_calibration_error(yte, proba_raw, classes), 4),
                "ece_after": round(expected_calibration_error(yte, proba_cal, classes), 4),
                "brier_before": round(brier_score(yte, proba_raw, classes), 4),
                "brier_after": round(brier_score(yte, proba_cal, classes), 4),
                "curve": reliability_curve(yte, proba_cal, classes),
            },
            "confusion_matrix": confusion_matrix(yte, hybrid_pred, labels=classes).tolist(),
            "report": classification_report(yte, hybrid_pred, labels=classes, output_dict=True, zero_division=0),
            "feature_importance": imp,
            # kept so anything still reading the old key keeps working
            "rules_only_accuracy": round(float(accuracy_score(yte, rule_pred)), 4),
        }
        log.info("Model trained: hybrid acc=%.4f | CV %.4f±%.4f | spatial %s | ECE %.4f→%.4f",
                 self.metrics["accuracy"], cv["accuracy_mean"], cv["accuracy_std"],
                 spatial["accuracy_mean"], self.metrics["calibration"]["ece_before"],
                 self.metrics["calibration"]["ece_after"])
        return self.metrics

    @staticmethod
    def _calibrate(X: pd.DataFrame, y: pd.Series, groups: pd.Series):
        """Fit isotonic, Platt and no calibration; keep whichever is actually best calibrated.

        Calibration is not free: when a model is already sharp and well calibrated, squeezing
        it through a sigmoid makes the probabilities worse. So the choice is measured on a
        group-held-out slice of the training data rather than assumed from class counts.
        """
        n_splits = int(min(3, max(2, groups.nunique())))
        try:
            fit_idx, val_idx = next(GroupShuffleSplit(n_splits=1, test_size=0.25, random_state=7)
                                    .split(X, y, groups))
        except ValueError:
            fit_idx, val_idx = np.arange(len(X)), np.arange(len(X))
        Xf, yf, gf = X.iloc[fit_idx], y.iloc[fit_idx], groups.iloc[fit_idx]
        Xv, yv = X.iloc[val_idx], y.iloc[val_idx]

        candidates = []
        plain = _hgb().fit(Xf, yf)
        candidates.append(("none", plain, expected_calibration_error(yv, plain.predict_proba(Xv), plain.classes_)))
        for method in ("isotonic", "sigmoid"):
            try:
                folds = list(GroupKFold(n_splits=n_splits).split(Xf, yf, gf))
                m = CalibratedClassifierCV(_hgb(), method=method, cv=folds, ensemble=True).fit(Xf, yf)
                candidates.append((method, m, expected_calibration_error(yv, m.predict_proba(Xv), m.classes_)))
            except Exception as e:  # noqa: BLE001 - tiny or degenerate class counts
                log.warning("%s calibration unavailable (%s)", method, e)

        method, _, ece = min(candidates, key=lambda c: c[2])
        log.info("calibration candidates: %s -> %s", {c[0]: round(c[2], 4) for c in candidates}, method)
        if method == "none":
            return _hgb().fit(X, y), "none (already calibrated)"
        folds = list(GroupKFold(n_splits=n_splits).split(X, y, groups))
        return CalibratedClassifierCV(_hgb(), method=method, cv=folds, ensemble=True).fit(X, y), method

    @staticmethod
    def _blend(ml_label, ml_conf, rule_label):
        """Below ML_MIN_CONFIDENCE the explainable rules take over."""
        return np.where(ml_conf >= ML_MIN_CONFIDENCE, ml_label, rule_label)

    def _cross_validate(self, X: pd.DataFrame, y: pd.Series, groups: pd.Series, n_splits: int = 5) -> dict:
        n_splits = int(min(n_splits, max(2, groups.nunique())))
        accs, f1s, folds = [], [], []
        for k, (tr, te) in enumerate(GroupKFold(n_splits=n_splits).split(X, y, groups)):
            m = _hgb().fit(X.iloc[tr], y.iloc[tr])
            p = m.predict(X.iloc[te])
            accs.append(accuracy_score(y.iloc[te], p))
            f1s.append(f1_score(y.iloc[te], p, average="macro", zero_division=0))
            folds.append({"fold": k + 1, "n_test": int(len(te)), "accuracy": round(float(accs[-1]), 4),
                          "macro_f1": round(float(f1s[-1]), 4)})
        return {"scheme": f"GroupKFold by thermal source, {n_splits} folds",
                "accuracy_mean": round(float(np.mean(accs)), 4), "accuracy_std": round(float(np.std(accs)), 4),
                "macro_f1_mean": round(float(np.mean(f1s)), 4), "macro_f1_std": round(float(np.std(f1s)), 4),
                "folds": folds}

    def _stress_test(self, model, df_test: pd.DataFrame, y_test: pd.Series, rates=(0.25, 0.5)) -> dict:
        """Accuracy when the context is missing, which is the honest question about this data.

        OSM coverage across India is uneven: land use is unmapped in large areas and plenty of
        plants are absent entirely. Blanking land cover and the nearest facility for a share of
        the test set says how much of the accuracy is real signal and how much is a tidy archive.
        """
        classes = np.array(model.classes_)
        rows = []
        for rate in rates:
            d = df_test.copy()
            rng = np.random.default_rng(11)
            blind = rng.random(len(d)) < rate
            d.loc[blind, "landcover"] = "unknown"
            d.loc[blind, "nearest_site_type"] = "none"
            d.loc[blind, "dist_industrial_km"] = 999.0
            d.loc[blind, "n_sites_5km"] = 0
            proba = model.predict_proba(feature_matrix(d))
            ml = classes[proba.argmax(axis=1)]
            pred = self._blend(ml, proba.max(axis=1), rule_classify(d)["rule_label"].to_numpy())
            rows.append({"context_missing": rate, **_score(y_test, pred)})
        return {"scheme": "land cover and nearest facility blanked for a share of the test set",
                "levels": rows}

    def _spatial_holdout(self, X: pd.DataFrame, y: pd.Series, blocks: pd.Series, max_blocks: int = 6) -> dict:
        """Train on the rest of the country, predict one ~330 km block never seen before."""
        order = blocks.value_counts()
        keep = [b for b in order.index if order[b] >= 200][:max_blocks]
        rows = []
        for b in keep:
            te = (blocks == b).to_numpy()
            if y[te].nunique() < 2 or y[~te].nunique() < 2:
                continue
            m = _hgb().fit(X[~te], y[~te])
            p = m.predict(X[te])
            rows.append({"block": str(b), "n_test": int(te.sum()),
                         "accuracy": round(float(accuracy_score(y[te], p)), 4),
                         "macro_f1": round(float(f1_score(y[te], p, average="macro", zero_division=0)), 4)})
        if not rows:
            return {"scheme": "leave-one-block-out (~330 km)", "blocks": [], "accuracy_mean": None}
        return {"scheme": "leave-one-block-out (~330 km), train on the rest of India",
                "accuracy_mean": round(float(np.mean([r["accuracy"] for r in rows])), 4),
                "accuracy_min": round(float(np.min([r["accuracy"] for r in rows])), 4),
                "macro_f1_mean": round(float(np.mean([r["macro_f1"] for r in rows])), 4),
                "blocks": rows}

    @staticmethod
    def _importance(m, X: pd.DataFrame) -> list[dict]:
        """Permutation importance proxy: mean |Δprob| when one feature is shuffled."""
        base = m.predict_proba(X)
        rng = np.random.default_rng(0)
        rows = []
        for c in X.columns:
            Xs = X.copy()
            Xs[c] = rng.permutation(Xs[c].to_numpy())
            delta = float(np.abs(m.predict_proba(Xs) - base).mean())
            rows.append({"feature": c, "importance": round(delta, 5)})
        rows.sort(key=lambda r: -r["importance"])
        return rows[:15]

    # -- persistence
    def save(self, path=config.MODEL_PATH):
        joblib.dump({"model": self.model, "metrics": self.metrics, "features": FEATURE_COLUMNS}, path)

    def load(self, path=config.MODEL_PATH) -> bool:
        try:
            blob = joblib.load(path)
            if blob.get("features") != FEATURE_COLUMNS:
                return False
            self.model, self.metrics = blob["model"], blob["metrics"]
            return True
        except Exception:  # noqa: BLE001
            return False

    # -- inference
    def predict(self, df: pd.DataFrame) -> pd.DataFrame:
        """Returns label, confidence, method, reasons, rules_agree, is_anomaly per row."""
        rules = rule_classify(df)
        out = pd.DataFrame(index=df.index)
        if self.model is not None and len(df):
            proba = self.model.predict_proba(feature_matrix(df))
            classes = np.array(self.model.classes_)
            ml_label = classes[proba.argmax(axis=1)]
            ml_conf = proba.max(axis=1)
            use_ml = ml_conf >= ML_MIN_CONFIDENCE
            out["label"] = np.where(use_ml, ml_label, rules["rule_label"])
            # The calibrated probability is reported as-is. An operator triages on this
            # number, so it is never nudged; whether the rules agree is its own column.
            out["confidence"] = np.where(use_ml, ml_conf, rules["rule_conf"]).round(3)
            out["method"] = np.where(use_ml, "model (calibrated)", "rules")
            out["rules_agree"] = (ml_label == rules["rule_label"].to_numpy()).astype(int)
        else:
            out["label"] = rules["rule_label"]
            out["confidence"] = rules["rule_conf"]
            out["method"] = "rules"
            out["rules_agree"] = 1
        out["reasons"] = rules["reasons"]
        return pd.concat([out, anomaly_flags(df)], axis=1)


def _score(y_true, pred) -> dict:
    return {"accuracy": round(float(accuracy_score(y_true, pred)), 4),
            "macro_f1": round(float(f1_score(y_true, pred, average="macro", zero_division=0)), 4)}


def anomaly_flags(df: pd.DataFrame) -> pd.DataFrame:
    """A persistent source burning far above its own robust baseline.

    The baseline is that source's median/MAD, not mean/std: a large enough spike drags the
    mean up far enough to mask itself, and that spike is exactly the event worth an alert.
    """
    def col(name, default=0.0):
        return pd.to_numeric(df[name], errors="coerce").fillna(default) if name in df.columns \
            else pd.Series(default, index=df.index, dtype=float)

    frp = col("frp")
    med = col("frp_med")
    rz = col("frp_robust_z")
    n_days = col("n_days")
    persistent = col("is_persistent") == 1

    hit = (persistent & (n_days >= config.ANOMALY_MIN_DAYS) & (rz >= config.ANOMALY_ROBUST_Z) &
           (frp >= config.ANOMALY_RATIO * med.clip(lower=0.2)) & (frp >= config.ANOMALY_MIN_FRP))
    ratio = (frp / med.clip(lower=0.2)).clip(upper=100)
    # 0-100 so alerts can be ranked rather than merely listed
    severity = (28 * np.log1p(ratio.where(hit, 0)) + 2.2 * rz.where(hit, 0).clip(upper=20) +
                9 * np.log1p(frp.where(hit, 0))).clip(0, 100)
    return pd.DataFrame({"is_anomaly": hit.astype(int), "anomaly_severity": severity.round(1)}, index=df.index)
