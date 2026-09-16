import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { api, IS_STATIC, LABEL_KEYS } from './api.js'
import MapView from './components/MapView.jsx'
import FilterPanel from './components/FilterPanel.jsx'
import StatsPanel from './components/StatsPanel.jsx'
import DetailPanel from './components/DetailPanel.jsx'
import IngestDialog from './components/IngestDialog.jsx'

const DEFAULT_FILTERS = {
  labels: new Set(LABEL_KEYS),
  dateFrom: '', dateTo: '',
  persistentOnly: false, anomalyOnly: false, minConf: 0,
  showHotspots: true, showSources: true, showSites: true,
}

export default function App() {
  const [status, setStatus] = useState(null)
  const [stats, setStats] = useState(null)
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [hotspots, setHotspots] = useState(null)
  const [sources, setSources] = useState(null)
  const [sites, setSites] = useState(null)
  const [selected, setSelected] = useState(null)     // { kind: 'hotspot'|'source', id }
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showIngest, setShowIngest] = useState(false)
  const [flyTo, setFlyTo] = useState(null)
  const mapRef = useRef(null)
  // Deep links: ?lat=22.35&lng=70.05&z=12&source=c12  (or &hotspot=h123)
  const urlInit = useRef(new URLSearchParams(window.location.search))

  // ---- status polling (pipeline job)
  const refreshStatus = useCallback(async () => {
    try {
      const s = await api.status()
      setStatus(s)
      return s
    } catch (e) {
      setError(String(e.message || e))
      return null
    }
  }, [])

  useEffect(() => {
    let alive = true
    const tick = async () => {
      const s = await refreshStatus()
      if (!alive) return
      if (s && s.job.running) setTimeout(tick, 2000)
    }
    tick()
    return () => { alive = false }
  }, [refreshStatus])

  // ---- reload everything once data exists / after a run finishes
  const runKey = status?.last_run?.run_at
  useEffect(() => {
    if (!status?.has_data || status.job.running) return
    let alive = true
    setLoading(true)
    Promise.all([api.stats(), api.sites()])
      .then(([st, si]) => {
        if (!alive) return
        setStats(st)
        setSites(si)
        setFilters((f) => ({ ...f, dateFrom: f.dateFrom || st.totals.date_from, dateTo: f.dateTo || st.totals.date_to }))
      })
      .catch((e) => setError(String(e.message || e)))
      .finally(() => alive && setLoading(false))
    return () => { alive = false }
  }, [status?.has_data, status?.job?.running, runKey])

  // ---- hotspots + sources follow filters
  useEffect(() => {
    if (!stats) return
    let alive = true
    setLoading(true)
    const labels = [...filters.labels].join(',')
    Promise.all([
      api.hotspots({
        labels: labels || 'NONE', date_from: filters.dateFrom, date_to: filters.dateTo,
        persistent: filters.persistentOnly ? true : undefined, anomaly: filters.anomalyOnly ? true : undefined,
        min_conf: filters.minConf, limit: 40000,
      }),
      api.sources({ labels: labels || 'NONE' }),
    ])
      .then(([h, s]) => { if (alive) { setHotspots(h); setSources(s) } })
      .catch((e) => setError(String(e.message || e)))
      .finally(() => alive && setLoading(false))
    return () => { alive = false }
  }, [stats, filters.labels, filters.dateFrom, filters.dateTo, filters.persistentOnly, filters.anomalyOnly, filters.minConf])

  // ---- detail fetch
  useEffect(() => {
    if (!selected) { setDetail(null); return }
    let alive = true
    const p = selected.kind === 'hotspot' ? api.hotspot(selected.id) : api.source(selected.id)
    p.then((d) => alive && setDetail({ kind: selected.kind, ...d })).catch((e) => setError(String(e.message || e)))
    return () => { alive = false }
  }, [selected])

  // apply deep link once data is loaded
  useEffect(() => {
    if (!stats) return
    const q = urlInit.current
    if (!q) return
    urlInit.current = null
    const lat = parseFloat(q.get('lat')), lng = parseFloat(q.get('lng')), z = parseInt(q.get('z') || '11', 10)
    if (!Number.isNaN(lat) && !Number.isNaN(lng)) setFlyTo({ lat, lng, zoom: z, t: Date.now() })
    if (q.get('source')) setSelected({ kind: 'source', id: q.get('source') })
    else if (q.get('hotspot')) setSelected({ kind: 'hotspot', id: q.get('hotspot') })
  }, [stats])

  const onSelect = useCallback((kind, id, latlng) => {
    setSelected({ kind, id })
    if (latlng) setFlyTo({ ...latlng, zoom: 12, t: Date.now() })
  }, [])

  const startIngest = async (body) => {
    setError(null)
    try {
      await api.ingest(body)
      setShowIngest(false)
      setSelected(null)
      setTimeout(refreshStatus, 300)
      const poll = async () => {
        const s = await refreshStatus()
        if (s && s.job.running) setTimeout(poll, 2000)
      }
      setTimeout(poll, 2000)
    } catch (e) {
      setError(String(e.message || e))
    }
  }

  const counts = useMemo(() => stats?.by_label || {}, [stats])
  const job = status?.job
  const mode = status?.last_run?.source

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">◉</span>
          <div>
            <div className="brand-title">ThermalSentinel</div>
            <div className="brand-sub">AI classification of industrial fires &amp; persistent thermal sources · NASA FIRMS × OSM × Sentinel</div>
          </div>
        </div>
        <div className="topbar-right">
          {job?.running && <span className="pill pill-busy">● {job.status}…</span>}
          {!job?.running && mode && (
            <span className={`pill ${mode === 'demo' ? 'pill-demo' : 'pill-live'}`}>
              {mode === 'demo' ? `${IS_STATIC ? 'STATIC ' : ''}DEMO ARCHIVE · Mar–May 2025` : `LIVE FIRMS · last ${status.last_run.days} d`}
            </span>
          )}
          {status && !IS_STATIC && (
            <span className="pill pill-muted" title="Set FIRMS_MAP_KEY in backend/.env to enable live ingestion">
              FIRMS key: {status.firms_key_configured ? 'configured' : 'not set'}
            </span>
          )}
          {IS_STATIC && (
            <a className="pill pill-muted" href="https://github.com/rahulskandagal/thermal-sentinel" target="_blank" rel="noreferrer"
              style={{ textDecoration: 'none' }} title="Static demo hosted on GitHub Pages — clone the repo to run the full pipeline with live NASA FIRMS data">
              ⌥ GitHub · run locally for live FIRMS
            </a>
          )}
          <button className="btn btn-primary" onClick={() => setShowIngest(true)} disabled={job?.running || IS_STATIC}
            title={IS_STATIC ? 'Needs the Python backend — clone the repo to run live ingestion' : undefined}>Run pipeline</button>
        </div>
      </header>

      <aside className="sidebar">
        <StatsPanel stats={stats} onSelectSource={(gid, lat, lon) => onSelect('source', gid, { lat, lng: lon })} />
        <FilterPanel filters={filters} setFilters={setFilters} counts={counts} stats={stats} />
      </aside>

      <main className="map-wrap">
        <MapView
          ref={mapRef}
          hotspots={filters.showHotspots ? hotspots : null}
          sources={filters.showSources ? sources : null}
          sites={filters.showSites ? sites : null}
          selected={selected}
          onSelect={onSelect}
          flyTo={flyTo}
        />
        {loading && <div className="loading-badge">loading…</div>}
        {error && <div className="error-badge" onClick={() => setError(null)}>{error} ✕</div>}
        {hotspots && (
          <div className="map-count">
            {hotspots.features.length.toLocaleString()} detections · {sources?.features.length ?? 0} persistent sources · {sites?.features.length ?? 0} OSM industrial sites
          </div>
        )}
      </main>

      {detail && <DetailPanel detail={detail} onClose={() => setSelected(null)} />}

      {showIngest && (
        <IngestDialog
          status={status}
          getBbox={() => mapRef.current?.getBbox?.()}
          onClose={() => setShowIngest(false)}
          onRun={startIngest}
        />
      )}
    </div>
  )
}
