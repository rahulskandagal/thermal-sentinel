import { api, LABELS, LABEL_KEYS } from '../api.js'

export default function FilterPanel({ filters, setFilters, counts, stats }) {
  const set = (patch) => setFilters((f) => ({ ...f, ...patch }))
  const toggleLabel = (k) => {
    const next = new Set(filters.labels)
    next.has(k) ? next.delete(k) : next.add(k)
    set({ labels: next })
  }
  const only = (k) => set({ labels: new Set([k]) })
  const all = () => set({ labels: new Set(LABEL_KEYS) })
  const min = stats?.totals?.date_from, max = stats?.totals?.date_to

  return (
    <section className="panel">
      <h3>Filters <button className="link" onClick={all}>all classes</button></h3>
      <div className="class-list">
        {LABEL_KEYS.map((k) => (
          <label key={k} className={`class-row ${filters.labels.has(k) ? '' : 'off'}`}>
            <input type="checkbox" checked={filters.labels.has(k)} onChange={() => toggleLabel(k)} />
            <span className="legend-dot" style={{ background: LABELS[k].color }} />
            <span className="class-name">{LABELS[k].name}</span>
            <span className="class-count">{(counts[k] || 0).toLocaleString()}</span>
            <button className="link only" onClick={(e) => { e.preventDefault(); only(k) }}>only</button>
          </label>
        ))}
      </div>

      <div className="field-row">
        <label>From <input type="date" min={min} max={max} value={filters.dateFrom} onChange={(e) => set({ dateFrom: e.target.value })} /></label>
        <label>To <input type="date" min={min} max={max} value={filters.dateTo} onChange={(e) => set({ dateTo: e.target.value })} /></label>
      </div>

      <label className="slider">
        Min classifier confidence <b>{Math.round(filters.minConf * 100)}%</b>
        <input type="range" min="0" max="0.95" step="0.05" value={filters.minConf} onChange={(e) => set({ minConf: +e.target.value })} />
      </label>

      <div className="toggles">
        <label><input type="checkbox" checked={filters.persistentOnly} onChange={(e) => set({ persistentOnly: e.target.checked })} /> Persistent sources only</label>
        <label><input type="checkbox" checked={filters.anomalyOnly} onChange={(e) => set({ anomalyOnly: e.target.checked })} /> ⚠ FRP anomalies only</label>
      </div>

      <h3>Layers</h3>
      <div className="toggles">
        <label><input type="checkbox" checked={filters.showHotspots} onChange={(e) => set({ showHotspots: e.target.checked })} /> Hotspot detections</label>
        <label><input type="checkbox" checked={filters.showSources} onChange={(e) => set({ showSources: e.target.checked })} /> Persistent source footprints</label>
        <label><input type="checkbox" checked={filters.showSites} onChange={(e) => set({ showSites: e.target.checked })} /> OSM industrial infrastructure</label>
      </div>

      <h3>Export</h3>
      <div className="export-row">
        <a className="btn" href={api.exportUrl('hotspots', { labels: [...filters.labels].join(',') })} download>{api.isStatic ? 'Hotspots .json' : 'Hotspots .geojson'}</a>
        <a className="btn" href={api.exportUrl('sources')} download>Sources .geojson</a>
        <a className="btn" href={api.exportUrl('registry')} download>Source registry .csv</a>
        <a className="btn" href={api.exportUrl('alerts')} download>Alerts .csv</a>
      </div>
      <p className="hint">GeoJSON loads straight into QGIS / ArcGIS / Google Earth; the CSVs drop into a shift log or a
        spreadsheet. API docs at <code>/docs</code>.</p>
    </section>
  )
}
