"""Hybrid classifier: explainable rules + gradient-boosted trees.

Labels
------
INDUSTRIAL_FIRE   – thermal anomaly at an industrial facility (routine process heat or an incident)
GAS_FLARE         – persistent, mostly night-detected, low-variance flare at oil/gas infrastructure
MINING_ACTIVITY   – coal-seam / mine fires, quarries, overburden fires
AGRICULTURAL_BURN – short-lived, daytime, low-FRP fires on cropland in residue-burning season
WILDFIRE          – forest / shrub / grassland fires, multi-day but not persistent
OTHER             – unresolved (e.g. urban waste burning, landfill fires)

Each hotspot also carries `is_persistent` (recurring thermal source) and `is_anomaly`
(FRP spike far above that source's own baseline → likely industrial fire/explosion rather
than routine operation).
"""
from __future__ import annotations

import logging
from typing import Iterable

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.model_selection import GroupShuffleSplit

from . import config
from .features import FEATURE_COLUMNS, feature_matrix

log = logging.getLogger(__name__)

LABELS = ["INDUSTRIAL_FIRE", "GAS_FLARE", "MINING_ACTIVITY", "AGRICULTURAL_BURN", "WILDFIRE", "OTHER"]
INDUSTRIAL_SITE_TYPES = {"refinery", "steel_plant", "power_plant", "cement_plant", "brick_kiln", "chemical_plant", "industrial"}


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
    out = pd.DataFrame(res, columns=["rule_label", "rule_conf", "reasons"], index=df.index)
    return out


# ------------------------------------------------------------------ ML model

class ThermalClassifier:
    def __init__(self):
        self.model: HistGradientBoostingClassifier | None = None
        self.metrics: dict = {}

    # -- training
    def train(self, df: pd.DataFrame, labels: Iterable[str]) -> dict:
        X = feature_matrix(df)
        y = pd.Series(list(labels), index=df.index)
        # Group-aware split: all detections of one thermal source stay on the same side,
        # otherwise per-source persistence features leak labels into the test set.
        groups = df["group_id"] if "group_id" in df.columns else pd.Series(range(len(df)), index=df.index)
        tr_idx, te_idx = next(GroupShuffleSplit(n_splits=1, test_size=0.25, random_state=42).split(X, y, groups))
        Xtr, Xte, ytr, yte = X.iloc[tr_idx], X.iloc[te_idx], y.iloc[tr_idx], y.iloc[te_idx]
        m = HistGradientBoostingClassifier(max_iter=300, learning_rate=0.06, max_depth=6,
                                           l2_regularization=0.5, random_state=42, class_weight="balanced")
        m.fit(Xtr, ytr)
        pred = m.predict(Xte)
        classes = list(m.classes_)
        self.model = m
        rule_pred = rule_classify(df.iloc[te_idx])["rule_label"]
        # permutation importance proxy: mean |Δprob| when a feature is shuffled on a sample
        imp = self._importance(m, Xte.sample(min(1500, len(Xte)), random_state=1))
        self.metrics = {
            "accuracy": round(float(accuracy_score(yte, pred)), 4),
            "rules_only_accuracy": round(float(accuracy_score(yte, rule_pred)), 4),
            "split": "group-aware (by thermal source), 75/25",
            "n_train": int(len(Xtr)), "n_test": int(len(Xte)),
            "classes": classes,
            "confusion_matrix": confusion_matrix(yte, pred, labels=classes).tolist(),
            "report": classification_report(yte, pred, labels=classes, output_dict=True, zero_division=0),
            "feature_importance": imp,
        }
        log.info("Model trained: accuracy=%.3f on %d test rows", self.metrics["accuracy"], len(Xte))
        return self.metrics

    @staticmethod
    def _importance(m, X: pd.DataFrame) -> list[dict]:
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
        """Returns label, confidence, method, reasons, is_anomaly for each row."""
        rules = rule_classify(df)
        out = pd.DataFrame(index=df.index)
        if self.model is not None and len(df):
            proba = self.model.predict_proba(feature_matrix(df))
            classes = np.array(self.model.classes_)
            ml_label = classes[proba.argmax(axis=1)]
            ml_conf = proba.max(axis=1)
            use_ml = ml_conf >= 0.55
            out["label"] = np.where(use_ml, ml_label, rules["rule_label"])
            out["confidence"] = np.where(use_ml, ml_conf, rules["rule_conf"]).round(3)
            out["method"] = np.where(use_ml, "ml+rules", "rules")
            agree = ml_label == rules["rule_label"].to_numpy()
            out["confidence"] = np.where(agree, np.minimum(1.0, out["confidence"] + 0.05), out["confidence"] * 0.9).round(3)
        else:
            out["label"] = rules["rule_label"]
            out["confidence"] = rules["rule_conf"]
            out["method"] = "rules"
        out["reasons"] = rules["reasons"]
        # Anomaly: a persistent source whose FRP jumps far above its own baseline
        frp_z = pd.to_numeric(df.get("frp_z", 0), errors="coerce").fillna(0)
        frp = pd.to_numeric(df.get("frp", 0), errors="coerce").fillna(0)
        frp_mean = pd.to_numeric(df.get("frp_mean", 0), errors="coerce").fillna(0)
        persistent = pd.to_numeric(df.get("is_persistent", 0), errors="coerce").fillna(0) == 1
        out["is_anomaly"] = (persistent & (frp_z >= 3.0) & (frp >= 2.5 * frp_mean)).astype(int)
        return out
