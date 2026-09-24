import { useMemo, useState } from 'react'
import { LABELS } from '../api.js'

const pct = (v) => (v == null ? '–' : `${(v * 100).toFixed(1)}%`)
const riskClass = (r) => (r >= 0.5 ? 'sev-high' : r >= 0.2 ? 'sev-mid' : 'sev-low')

function Scores({ m, title, unit }) {
  if (!m?.trained) {
    return (
      <>
        <h4>{title}</h4>
        <p className="hint">Not trained — {m?.reason || 'no history yet'}.</p>
      </>
    )
  }
  const t = m.test
  return (
    <>
      <h4>{title}</h4>
      <table className="mini-table">
        <tbody>
          <tr><td>AUC (later days, never trained on)</td><td>{t.auc ?? '–'}</td></tr>
          <tr><td>PR-AUC</td><td>{t.pr_auc ?? '–'}</td></tr>
          <tr><td>Base rate of the event</td><td>{pct(t.base_rate)}</td></tr>
          <tr className="row-hi"><td>Precision in the top 10% by risk</td><td>{pct(t.precision_at_10pct)}</td></tr>
          <tr><td>Lift over guessing the base rate</td><td>{t.lift_at_10pct ? `${t.lift_at_10pct}×` : '–'}</td></tr>
          <tr><td>{unit} scored / events</td><td>{t.n?.toLocaleString()} / {t.positives}</td></tr>
        </tbody>
      </table>
      <p className="hint">{m.scheme}. {t.note ? `Note: ${t.note}.` : ''}</p>
    </>
  )
}

export default function ForecastPanel({ forecast, onSelectSource, showRisk, setShowRisk }) {
  const [minRisk, setMinRisk] = useState(0)
  const sources = forecast?.sources || []
  const grid = forecast?.grid || []
  const m = forecast?.metrics || {}

  const shown = useMemo(() => sources.filter((s) => s.risk >= minRisk).slice(0, 40), [sources, minRisk])
  const topCells = useMemo(() => grid.filter((c) => c.risk >= Math.max(minRisk, 0.2)).slice(0, 12), [grid, minRisk])

  if (!forecast) return <section className="panel"><h3>Forecast</h3><p className="hint">Waiting for data…</p></section>
  const horizon = m.horizon_days || 7
  const to = sources[0]?.horizon_to || grid[0]?.horizon_to

  return (
    <section className="panel">
      <h3><span>Forecast</span> <span className="hint">next {horizon} days{to ? ` → ${to}` : ''}</span></h3>
      <p className="hint">
        Everything else on this dashboard describes what already burned. This asks what burns next:
        which known sites are heading for a spike, and which areas are about to light up. Both are
        trained only on days before the ones they are scored on.
      </p>

      <label className="toggles">
        <input type="checkbox" checked={showRisk} onChange={(e) => setShowRisk(e.target.checked)} />
        Show the area risk layer on the map
      </label>

      <label className="slider">
        Min risk <b>{Math.round(minRisk * 100)}%</b>
        <input type="range" min="0" max="0.9" step="0.05" value={minRisk} onChange={(e) => setMinRisk(+e.target.value)} />
      </label>

      <h4>Sites most likely to spike</h4>
      <ol className="alert-list">
        {shown.map((s) => (
          <li key={s.group_id} className={riskClass(s.risk)} onClick={() => onSelectSource(s.group_id, s.lat, s.lon)}>
            <div className="alert-top">
              <span className="sev">{Math.round(s.risk * 100)}</span>
              <span className="kind">risk</span>
              <span className="legend-dot" style={{ background: LABELS[s.label]?.color }} title={LABELS[s.label]?.name} />
              <span className="alert-date">{s.active_days_7 ? `${s.active_days_7}/7 days active` : 'quiet'}</span>
            </div>
            <div className="alert-title">{s.site_name && s.site_name !== 'null' ? s.site_name : `Source @ ${s.lat?.toFixed(2)}, ${s.lon?.toFixed(2)}`}</div>
            <div className="alert-detail">{(s.drivers || []).join(' · ')}</div>
          </li>
        ))}
        {!shown.length && <li className="hint" style={{ cursor: 'default' }}>No site above this risk.</li>}
      </ol>

      {topCells.length > 0 && (
        <>
          <h4>Areas most likely to light up</h4>
          <ol className="alert-list">
            {topCells.map((c) => (
              <li key={`${c.cy}_${c.cx}`} className={riskClass(c.risk)}>
                <div className="alert-top">
                  <span className="sev">{Math.round(c.risk * 100)}</span>
                  <span className="kind">area risk</span>
                  <span className="alert-date">{c.lat?.toFixed(2)}, {c.lon?.toFixed(2)}</span>
                </div>
                <div className="alert-detail">{(c.drivers || []).join(' · ')}</div>
              </li>
            ))}
          </ol>
        </>
      )}

      <Scores m={m.incident} title="Does the site forecast work?" unit="Source-days" />
      <Scores m={m.outbreak} title="Does the area forecast work?" unit="Cell-days" />

      {m.incident?.feature_importance?.length > 0 && (
        <>
          <h4>What drives the site forecast</h4>
          <ol className="feat-list">
            {m.incident.feature_importance.slice(0, 8).map((f) => (
              <li key={f.feature}>
                <span>{f.feature}</span>
                <i style={{ width: `${(f.importance / (m.incident.feature_importance[0].importance || 1)) * 100}%` }} />
              </li>
            ))}
          </ol>
        </>
      )}
      <p className="hint">
        The demo archive simulates the upset period that precedes an industrial incident — a week of
        elevated, erratic FRP. That assumption is stated in the code; on live FIRMS the same features
        are computed from real observations.
      </p>
    </section>
  )
}
