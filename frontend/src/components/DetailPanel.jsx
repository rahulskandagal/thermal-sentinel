import { LABELS } from '../api.js'

function Sparkline({ series }) {
  if (!series?.length) return null
  const W = 320, H = 64
  const max = Math.max(1, ...series.map((d) => d.frp_sum))
  const bw = W / series.length
  return (
    <div className="spark">
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} preserveAspectRatio="none">
        {series.map((d, i) => {
          const h = (d.frp_sum / max) * (H - 2)
          const nightShare = d.n ? d.n_night / d.n : 0
          return <rect key={d.acq_date} x={i * bw} y={H - h} width={Math.max(bw - 0.6, 0.8)} height={h}
            fill={nightShare > 0.5 ? '#8b9cff' : '#ffb454'}><title>{d.acq_date}: {d.n} det · ΣFRP {d.frp_sum.toFixed(1)} MW · {d.n_night} night</title></rect>
        })}
      </svg>
      <div className="timeline-axis"><span>{series[0].acq_date}</span><span>ΣFRP per active day (blue = night-dominated)</span><span>{series[series.length - 1].acq_date}</span></div>
    </div>
  )
}

function Row({ k, v }) {
  return v == null || v === '' ? null : <div className="kv"><span>{k}</span><b>{v}</b></div>
}

export default function DetailPanel({ detail: d, onClose }) {
  const isHot = d.kind === 'hotspot'
  const label = LABELS[d.label] || { name: d.label, color: '#9ca3af' }
  const lat = isHot ? d.latitude : d.lat, lon = isHot ? d.longitude : d.lon
  const siteName = d.dist_industrial_km < 10 ? d.nearest_site_name : null
  return (
    <aside className="detail">
      <button className="close" onClick={onClose}>✕</button>
      <div className="detail-head">
        <span className="badge" style={{ background: label.color }}>{label.name}</span>
        {d.is_persistent === 1 || !isHot ? <span className="badge badge-outline">persistent source</span> : null}
        {d.is_anomaly === 1 && <span className="badge badge-warn">⚠ FRP anomaly</span>}
        {d.n_anomalies > 0 && <span className="badge badge-warn">⚠ {d.n_anomalies} anomalies</span>}
      </div>
      <h2>{isHot ? `Detection ${d.id}` : (siteName && d.dist_industrial_km < 3 ? siteName : 'Persistent thermal source')}</h2>
      <div className="coords">{lat.toFixed(4)}°N, {lon.toFixed(4)}°E · {isHot ? `${d.acq_datetime.replace('T', ' ').replace('Z', ' UTC')} · ${d.satellite === 'N' ? 'Suomi-NPP' : d.satellite === '1' ? 'NOAA-20' : d.satellite} ${d.instrument}` : `${d.first_seen} → ${d.last_seen}`}</div>

      <div className="conf-bar" title="classifier confidence">
        <div style={{ width: `${Math.round(d.confidence * 100)}%`, background: label.color }} />
        <span>{Math.round(d.confidence * 100)}% confidence{isHot ? ` · ${d.method}` : ''}</span>
      </div>

      {isHot && d.reasons?.length > 0 && (
        <>
          <h4>Why this class</h4>
          <ul className="reasons">{d.reasons.map((r, i) => <li key={i}>{r}</li>)}</ul>
        </>
      )}

      <h4>Thermal signature</h4>
      <div className="kv-grid">
        {isHot && <Row k="FRP" v={`${d.frp} MW`} />}
        {isHot && <Row k="Brightness (I-4 / I-5)" v={`${d.brightness} / ${d.brightness_2 ?? '–'} K`} />}
        {isHot && <Row k="Day / night" v={d.daynight === 'N' ? 'Night' : 'Day'} />}
        {isHot && <Row k="FIRMS confidence" v={d.confidence_obs != null ? `${Math.round(d.confidence_obs * 100)}%` : null} />}
        <Row k="Mean FRP at source" v={`${(+d.frp_mean).toFixed(1)} MW`} />
        {!isHot && <Row k="Max FRP" v={`${d.frp_max} MW`} />}
        {isHot && <Row k="FRP z-score vs source" v={(+d.frp_z).toFixed(2)} />}
      </div>

      <h4>Persistence</h4>
      <div className="kv-grid">
        <Row k="Active days" v={d.n_days} />
        <Row k="Detections" v={d.n_det} />
        <Row k="Span" v={`${Math.round(d.span_days)} d`} />
        <Row k="Night fraction" v={`${Math.round(d.night_frac * 100)}%`} />
        <Row k="Persistence score" v={(+d.persistence_score).toFixed(2)} />
        {isHot && <Row k="Max gap" v={`${d.max_gap_days} d`} />}
      </div>

      <h4>Context</h4>
      <div className="kv-grid">
        <Row k="Land cover" v={d.landcover} />
        <Row k="Nearest industry" v={siteName ? `${siteName} (${d.nearest_site_type?.replace('_', ' ')})` : 'none within 10 km'} />
        <Row k="Distance" v={d.dist_industrial_km < 900 ? `${(d.dist_industrial_km * 1000).toFixed(0)} m` : null} />
        {d.true_label && <Row k="Demo ground truth" v={<span style={{ color: d.true_label === d.label ? '#4ade80' : '#ff6b6b' }}>{LABELS[d.true_label]?.name || d.true_label}</span>} />}
      </div>

      <h4>Source activity timeline</h4>
      <Sparkline series={d.timeseries} />

      <h4>Verify with imagery</h4>
      <div className="links">
        <a href={d.links.sentinel_eo_browser} target="_blank" rel="noreferrer">Sentinel-2 SWIR (EO Browser)</a>
        <a href={d.links.nasa_worldview} target="_blank" rel="noreferrer">NASA Worldview</a>
        <a href={d.links.firms_map} target="_blank" rel="noreferrer">FIRMS map</a>
        <a href={d.links.osm} target="_blank" rel="noreferrer">OpenStreetMap</a>
        <a href={d.links.google_earth} target="_blank" rel="noreferrer">Google Earth</a>
      </div>
    </aside>
  )
}
