"""SQLite storage for classified hotspots, persistent sources and industrial sites."""
from __future__ import annotations

import json
import sqlite3
from contextlib import contextmanager

import pandas as pd

from . import config

HOTSPOT_COLS = [
    "id", "latitude", "longitude", "acq_datetime", "acq_date", "satellite", "instrument", "brightness", "brightness_2",
    "frp", "confidence_obs", "daynight", "is_night", "month", "hour", "local_hour", "cell_id", "group_id",
    "spatial_block", "n_det", "n_days", "span_days", "max_gap_days", "night_frac", "frp_mean", "frp_cv", "frp_z",
    "frp_med", "frp_mad", "frp_robust_z", "frp_ratio_base", "dets_per_active_day", "source_spread_m",
    "active_ratio", "persistence_score", "is_persistent", "dist_industrial_km", "dist_site_2nd_km", "n_sites_5km",
    "neighbours_1km", "neighbours_5km", "nearest_site_id", "nearest_site_type", "nearest_site_name", "landcover",
    "label", "confidence", "method", "rules_agree", "reasons", "is_anomaly", "anomaly_severity", "true_label",
]


@contextmanager
def connect():
    con = sqlite3.connect(config.DB_PATH)
    con.row_factory = sqlite3.Row
    try:
        yield con
        con.commit()
    finally:
        con.close()


def init():
    with connect() as con:
        con.executescript("""
        CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT);
        -- Analyst corrections outlive a pipeline run: they are training data, not results.
        CREATE TABLE IF NOT EXISTS feedback (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            hotspot_id  TEXT,
            group_id    TEXT,
            label       TEXT NOT NULL,
            verdict     TEXT NOT NULL,          -- confirm | correct
            note        TEXT,
            analyst     TEXT,
            created_at  TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_fb_group ON feedback(group_id);
        """)


def save_run(hotspots: pd.DataFrame, sites: list[dict], sources: pd.DataFrame, meta: dict,
             alerts_df: pd.DataFrame | None = None):
    h = hotspots.copy()
    for c in HOTSPOT_COLS:
        if c not in h.columns:
            h[c] = None
    h = h[HOTSPOT_COLS]
    h["acq_datetime"] = pd.to_datetime(h["acq_datetime"], utc=True).dt.strftime("%Y-%m-%dT%H:%M:%SZ")
    h["acq_date"] = h["acq_date"].astype(str)
    h["reasons"] = h["reasons"].apply(lambda r: json.dumps(list(r) if isinstance(r, (list, tuple)) else []))
    s = pd.DataFrame(sites) if sites else pd.DataFrame(columns=["id", "lat", "lon", "name", "site_type", "source", "tags"])
    if len(s):
        s["tags"] = s["tags"].apply(json.dumps)
    with connect() as con:
        h.to_sql("hotspots", con, if_exists="replace", index=False)
        s.to_sql("sites", con, if_exists="replace", index=False)
        sources.to_sql("sources", con, if_exists="replace", index=False)
        a = alerts_df if alerts_df is not None else pd.DataFrame(columns=["id", "kind", "severity"])
        a.to_sql("alerts", con, if_exists="replace", index=False)
        con.executescript("""
        CREATE INDEX IF NOT EXISTS idx_h_ll ON hotspots(latitude, longitude);
        CREATE INDEX IF NOT EXISTS idx_h_date ON hotspots(acq_date);
        CREATE INDEX IF NOT EXISTS idx_h_label ON hotspots(label);
        CREATE INDEX IF NOT EXISTS idx_h_group ON hotspots(group_id);
        """)
        con.execute("INSERT OR REPLACE INTO meta(key, value) VALUES('last_run', ?)", (json.dumps(meta),))


def set_meta(key: str, value):
    with connect() as con:
        con.execute("INSERT OR REPLACE INTO meta(key, value) VALUES(?, ?)", (key, json.dumps(value)))


def get_meta(key: str):
    with connect() as con:
        r = con.execute("SELECT value FROM meta WHERE key=?", (key,)).fetchone()
        return json.loads(r["value"]) if r else None


def has_data() -> bool:
    with connect() as con:
        r = con.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='hotspots'").fetchone()
        if not r:
            return False
        return con.execute("SELECT COUNT(*) c FROM hotspots").fetchone()["c"] > 0


def _rows(cur) -> list[dict]:
    out = []
    for r in cur.fetchall():
        d = dict(r)
        if "reasons" in d and isinstance(d["reasons"], str):
            d["reasons"] = json.loads(d["reasons"])
        if "tags" in d and isinstance(d["tags"], str):
            d["tags"] = json.loads(d["tags"])
        out.append(d)
    return out


def query_hotspots(bbox=None, labels=None, date_from=None, date_to=None, persistent=None, anomaly=None,
                   min_conf=0.0, limit=20000) -> list[dict]:
    sql, args = "SELECT * FROM hotspots WHERE confidence >= ?", [min_conf]
    if bbox:
        sql += " AND longitude BETWEEN ? AND ? AND latitude BETWEEN ? AND ?"
        args += [bbox[0], bbox[2], bbox[1], bbox[3]]
    if labels:
        sql += f" AND label IN ({','.join('?' * len(labels))})"
        args += list(labels)
    if date_from:
        sql += " AND acq_date >= ?"
        args.append(str(date_from))
    if date_to:
        sql += " AND acq_date <= ?"
        args.append(str(date_to))
    if persistent is not None:
        sql += " AND is_persistent = ?"
        args.append(int(persistent))
    if anomaly is not None:
        sql += " AND is_anomaly = ?"
        args.append(int(anomaly))
    sql += " ORDER BY acq_datetime DESC LIMIT ?"
    args.append(int(limit))
    with connect() as con:
        return _rows(con.execute(sql, args))


def get_hotspot(hid: str) -> dict | None:
    with connect() as con:
        rows = _rows(con.execute("SELECT * FROM hotspots WHERE id=?", (hid,)))
        return rows[0] if rows else None


def get_group_timeseries(group_id: str) -> list[dict]:
    with connect() as con:
        return _rows(con.execute(
            "SELECT acq_date, COUNT(*) n, SUM(frp) frp_sum, MAX(frp) frp_max, SUM(is_night) n_night "
            "FROM hotspots WHERE group_id=? GROUP BY acq_date ORDER BY acq_date", (group_id,)))


def get_sources(bbox=None, labels=None, min_days=0) -> list[dict]:
    sql, args = "SELECT * FROM sources WHERE n_days >= ?", [min_days]
    if bbox:
        sql += " AND lon BETWEEN ? AND ? AND lat BETWEEN ? AND ?"
        args += [bbox[0], bbox[2], bbox[1], bbox[3]]
    if labels:
        sql += f" AND label IN ({','.join('?' * len(labels))})"
        args += list(labels)
    sql += " ORDER BY persistence_score DESC"
    with connect() as con:
        return _rows(con.execute(sql, args))


def get_alerts(kinds=None, min_severity: float = 0.0, limit: int = 500) -> list[dict]:
    with connect() as con:
        if not con.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='alerts'").fetchone():
            return []
        sql, args = "SELECT * FROM alerts WHERE severity >= ?", [min_severity]
        if kinds:
            sql += f" AND kind IN ({','.join('?' * len(kinds))})"
            args += list(kinds)
        sql += " ORDER BY severity DESC LIMIT ?"
        args.append(int(limit))
        return _rows(con.execute(sql, args))


# ------------------------------------------------------------------ analyst feedback

def add_feedback(label: str, verdict: str, hotspot_id=None, group_id=None, note=None, analyst=None) -> dict:
    from datetime import datetime
    row = (hotspot_id, group_id, label, verdict, note, analyst or "analyst",
           datetime.utcnow().isoformat(timespec="seconds") + "Z")
    with connect() as con:
        cur = con.execute("INSERT INTO feedback(hotspot_id, group_id, label, verdict, note, analyst, created_at) "
                          "VALUES(?,?,?,?,?,?,?)", row)
        return {"id": cur.lastrowid, "hotspot_id": row[0], "group_id": row[1], "label": label,
                "verdict": verdict, "note": note, "analyst": row[5], "created_at": row[6]}


def get_feedback(limit: int = 1000) -> list[dict]:
    with connect() as con:
        return _rows(con.execute("SELECT * FROM feedback ORDER BY id DESC LIMIT ?", (int(limit),)))


def feedback_labels() -> dict:
    """group_id -> most recent analyst label, used to override training labels on retrain."""
    with connect() as con:
        rows = con.execute("SELECT group_id, label FROM feedback WHERE group_id IS NOT NULL "
                           "AND verdict='correct' ORDER BY id").fetchall()
    return {r["group_id"]: r["label"] for r in rows}


def get_sites(bbox=None) -> list[dict]:
    sql, args = "SELECT * FROM sites", []
    if bbox:
        sql += " WHERE lon BETWEEN ? AND ? AND lat BETWEEN ? AND ?"
        args += [bbox[0], bbox[2], bbox[1], bbox[3]]
    with connect() as con:
        return _rows(con.execute(sql, args))


def stats() -> dict:
    with connect() as con:
        by_label = {r["label"]: r["c"] for r in con.execute("SELECT label, COUNT(*) c FROM hotspots GROUP BY label")}
        by_day = _rows(con.execute(
            "SELECT acq_date, label, COUNT(*) c FROM hotspots GROUP BY acq_date, label ORDER BY acq_date"))
        totals = dict(con.execute(
            "SELECT COUNT(*) total, SUM(is_persistent) persistent, SUM(is_anomaly) anomalies, "
            "COUNT(DISTINCT group_id) groups, MIN(acq_date) date_from, MAX(acq_date) date_to FROM hotspots").fetchone())
        n_sources = con.execute("SELECT COUNT(*) c FROM sources").fetchone()["c"]
        n_sites = con.execute("SELECT COUNT(*) c FROM sites").fetchone()["c"]
        top = _rows(con.execute("SELECT * FROM sources ORDER BY persistence_score DESC, n_det DESC LIMIT 10"))
        acc = None
        r = con.execute("SELECT COUNT(*) c, SUM(label = true_label) ok FROM hotspots WHERE true_label IS NOT NULL").fetchone()
        if r and r["c"]:
            acc = round(r["ok"] / r["c"], 4)
        alerts = {}
        if con.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='alerts'").fetchone():
            alerts = {r["kind"]: r["c"] for r in con.execute("SELECT kind, COUNT(*) c FROM alerts GROUP BY kind")}
        n_feedback = con.execute("SELECT COUNT(*) c FROM feedback").fetchone()["c"]
    return {"totals": totals, "by_label": by_label, "by_day": by_day, "n_persistent_sources": n_sources,
            "n_sites": n_sites, "top_sources": top, "label_accuracy_vs_truth": acc,
            "alerts_by_kind": alerts, "n_alerts": sum(alerts.values()), "n_feedback": n_feedback}
