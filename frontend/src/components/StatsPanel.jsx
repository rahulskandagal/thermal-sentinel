import { useMemo } from 'react'
import { LABELS, LABEL_KEYS } from '../api.js'

function Timeline({ byDay }) {
  const { days, max } = useMemo(() => {
    const m = new Map()
    for (const r of byDay || []) {
      if (!m.has(r.acq_date)) m.set(r.acq_date, {})
      m.get(r.acq_date)[r.label] = r.c
    }
    const days = [...m.entries()].sort(([a], [b]) => (a < b ? -1 : 1))
    const max = Math.max(1, ...days.map(([, v]) => Object.values(v).reduce((a, b) => a + b, 0)))
    return { days, max }
  }, [byDay])
  if (!days.length) return null
  const W = 300, H = 70, bw = W / days.length
  return (
    <div className="timeline">
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} preserveAspectRatio="none">
        {days.map(([d, v], i) => {
          let y = H
          return LABEL_KEYS.map((k) => {
            const h = ((v[k] || 0) / max) * (H - 4)
            y -= h
            return h > 0 ? <rect key={k} x={i * bw} y={y} width={Math.max(bw - 0.4, 0.6)} height={h} fill={LABELS[k].color}><title>{d} · {LABELS[k].short}: {v[k]}</title></rect> : null
          })
        })}
      </svg>
      <div className="timeline-axis"><span>{days[0][0]}</span><span>detections / day</span><span>{days[days.length - 1][0]}</span></div>
    </div>
  )
}

export default function StatsPanel({ stats, onSelectSource }) {
  if (!stats) return <section className="panel"><h3>Overview</h3><p className="hint">Waiting for data…</p></section>
  const t = stats.totals
  const ind = (stats.by_label.INDUSTRIAL_FIRE || 0) + (stats.by_label.GAS_FLARE || 0) + (stats.by_label.MINING_ACTIVITY || 0)
  const share = t.total ? Math.round((ind / t.total) * 100) : 0
  return (
    <section className="panel">
      <h3>Overview <span className="hint">{t.date_from} → {t.date_to}</span></h3>
      <div className="kpis">
        <div className="kpi"><div className="kpi-v">{t.total.toLocaleString()}</div><div className="kpi-l">FIRMS detections</div></div>
        <div className="kpi"><div className="kpi-v">{stats.n_persistent_sources}</div><div className="kpi-l">persistent sources</div></div>
        <div className="kpi"><div className="kpi-v">{share}%</div><div className="kpi-l">industrial / flare / mining</div></div>
        <div className="kpi kpi-warn"><div className="kpi-v">{t.anomalies}</div><div className="kpi-l">FRP anomalies (incident candidates)</div></div>
      </div>
      <Timeline byDay={stats.by_day} />
      {stats.label_accuracy_vs_truth != null && (
        <p className="hint">Demo archive ground-truth agreement: <b>{(stats.label_accuracy_vs_truth * 100).toFixed(1)}%</b></p>
      )}
      <h3>Top persistent sources</h3>
      <ol className="top-sources">
        {stats.top_sources.map((s) => (
          <li key={s.group_id} onClick={() => onSelectSource(s.group_id, s.lat, s.lon)}>
            <span className="legend-dot" style={{ background: LABELS[s.label]?.color }} />
            <span className="ts-name">{s.dist_industrial_km < 3 && s.nearest_site_name ? s.nearest_site_name : `Unlisted source @ ${s.lat.toFixed(2)}, ${s.lon.toFixed(2)}`}</span>
            <span className="ts-meta">{s.n_days}d · {s.frp_mean} MW{s.n_anomalies ? ` · ⚠${s.n_anomalies}` : ''}</span>
          </li>
        ))}
      </ol>
    </section>
  )
}
