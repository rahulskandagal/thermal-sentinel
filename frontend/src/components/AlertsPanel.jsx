import { useMemo, useState } from 'react'
import { api, LABELS } from '../api.js'

const KIND_STYLE = {
  FRP_ANOMALY: { tag: 'anomaly', label: 'FRP anomaly' },
  NEW_SOURCE: { tag: 'new', label: 'New source' },
  WENT_DARK: { tag: 'dark', label: 'Went quiet' },
  UNREGISTERED: { tag: 'unreg', label: 'Unregistered' },
}

function severityClass(s) {
  return s >= 70 ? 'sev-high' : s >= 45 ? 'sev-mid' : 'sev-low'
}

export default function AlertsPanel({ alerts, onSelectSource, filters, setFilters }) {
  const [kind, setKind] = useState('ALL')
  const [minSev, setMinSev] = useState(0)

  const counts = useMemo(() => {
    const c = {}
    for (const a of alerts || []) c[a.kind] = (c[a.kind] || 0) + 1
    return c
  }, [alerts])

  const shown = useMemo(
    () => (alerts || []).filter((a) => (kind === 'ALL' || a.kind === kind) && a.severity >= minSev),
    [alerts, kind, minSev],
  )

  if (!alerts) return <section className="panel"><h3>Alerts</h3><p className="hint">Waiting for data…</p></section>

  return (
    <section className="panel">
      <h3>
        Alerts <span className="hint">{shown.length} of {alerts.length}</span>
        <a className="link" href={api.exportUrl('alerts')} download style={{ marginLeft: 'auto' }}>.csv</a>
      </h3>
      <p className="hint">
        22,179 detections are not an operator&apos;s worklist. These are the four things worth a look:
        a known source burning above its own baseline, a source that just appeared, one that went quiet,
        and industrial heat with no facility mapped near it.
      </p>

      <div className="chips">
        <button className={`chip ${kind === 'ALL' ? 'on' : ''}`} onClick={() => setKind('ALL')}>All {alerts.length}</button>
        {Object.entries(KIND_STYLE).map(([k, v]) => (
          <button key={k} className={`chip chip-${v.tag} ${kind === k ? 'on' : ''}`} onClick={() => setKind(k)}>
            {v.label} {counts[k] || 0}
          </button>
        ))}
      </div>

      <label className="slider">
        Min severity <b>{minSev}</b>
        <input type="range" min="0" max="90" step="5" value={minSev} onChange={(e) => setMinSev(+e.target.value)} />
      </label>

      <ol className="alert-list">
        {shown.slice(0, 60).map((a) => (
          <li key={a.id} className={severityClass(a.severity)} onClick={() => onSelectSource(a.group_id, a.lat, a.lon)}>
            <div className="alert-top">
              <span className="sev">{Math.round(a.severity)}</span>
              <span className={`kind kind-${KIND_STYLE[a.kind]?.tag}`}>{KIND_STYLE[a.kind]?.label || a.kind}</span>
              <span className="legend-dot" style={{ background: LABELS[a.label]?.color }} title={LABELS[a.label]?.name} />
              <span className="alert-date">{a.alert_date}</span>
            </div>
            <div className="alert-title">{a.title}</div>
            <div className="alert-detail">{a.detail}</div>
          </li>
        ))}
        {!shown.length && <li className="hint" style={{ cursor: 'default' }}>Nothing at this severity.</li>}
      </ol>

      {filters && (
        <label className="toggles">
          <input type="checkbox" checked={filters.anomalyOnly}
            onChange={(e) => setFilters((f) => ({ ...f, anomalyOnly: e.target.checked }))} />
          Show only anomaly detections on the map
        </label>
      )}
    </section>
  )
}
