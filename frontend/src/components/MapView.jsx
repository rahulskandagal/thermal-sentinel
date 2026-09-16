import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { MapContainer, TileLayer, LayersControl, useMap } from 'react-leaflet'
import L from 'leaflet'
import { LABELS, SITE_COLOR } from '../api.js'

const INDIA_CENTER = [22.5, 80.5]

function labelColor(label) {
  return LABELS[label]?.color || '#9ca3af'
}

/** Imperative canvas layer for many hotspot markers (React per-marker is too slow for 20k+). */
function HotspotLayer({ data, selected, onSelect }) {
  const map = useMap()
  const groupRef = useRef(null)
  useEffect(() => {
    if (groupRef.current) { groupRef.current.remove(); groupRef.current = null }
    if (!data) return
    const renderer = L.canvas({ padding: 0.5 })
    const group = L.layerGroup()
    for (const f of data.features) {
      const p = f.properties
      const [lon, lat] = f.geometry.coordinates
      const isSel = selected?.kind === 'hotspot' && selected.id === p.id
      const r = Math.max(2.5, Math.min(9, 2 + Math.log1p(p.frp) * 1.4))
      const m = L.circleMarker([lat, lon], {
        renderer, radius: isSel ? r + 3 : r,
        color: p.is_anomaly ? '#ffffff' : (isSel ? '#fff' : labelColor(p.label)),
        weight: p.is_anomaly ? 2 : (isSel ? 2 : 0.6),
        fillColor: labelColor(p.label), fillOpacity: p.is_persistent ? 0.85 : 0.55,
      })
      m.on('click', (e) => { L.DomEvent.stopPropagation(e); onSelect('hotspot', p.id) })
      m.bindTooltip(`${LABELS[p.label]?.short || p.label} · ${p.frp} MW · ${p.acq_date}${p.is_anomaly ? ' · ⚠ anomaly' : ''}`,
        { direction: 'top', opacity: 0.9, className: 'ts-tip' })
      group.addLayer(m)
    }
    group.addTo(map)
    groupRef.current = group
    return () => { group.remove() }
  }, [data, selected, map, onSelect])
  return null
}

/** Persistent thermal sources as dashed circles sized by cluster extent. */
function SourceLayer({ data, selected, onSelect }) {
  const map = useMap()
  useEffect(() => {
    if (!data) return
    const group = L.layerGroup()
    for (const f of data.features) {
      const p = f.properties
      const [lon, lat] = f.geometry.coordinates
      const isSel = selected?.kind === 'source' && selected.id === p.group_id
      const c = L.circle([lat, lon], {
        radius: Math.max(400, p.radius_m * 1.6),
        color: isSel ? '#fff' : labelColor(p.label), weight: isSel ? 3 : 1.5, dashArray: '6 4',
        fillColor: labelColor(p.label), fillOpacity: 0.08 + 0.25 * p.persistence_score,
      })
      c.on('click', (e) => { L.DomEvent.stopPropagation(e); onSelect('source', p.group_id) })
      c.bindTooltip(
        `<b>${p.nearest_site_name && p.dist_industrial_km < 3 ? p.nearest_site_name : 'Persistent source'}</b><br/>` +
        `${LABELS[p.label]?.name || p.label}<br/>${p.n_days} active days · score ${p.persistence_score}` +
        (p.n_anomalies ? `<br/>⚠ ${p.n_anomalies} FRP anomalies` : ''),
        { direction: 'top', opacity: 0.92, className: 'ts-tip' })
      group.addLayer(c)
    }
    group.addTo(map)
    return () => { group.remove() }
  }, [data, selected, map, onSelect])
  return null
}

function siteIcon(type) {
  const glyph = { refinery: '⛽', steel_plant: '🏭', power_plant: '⚡', gas_flare: '🔥', mine: '⛏', cement_plant: '🧱',
    brick_kiln: '🧱', chemical_plant: '⚗' }[type] || '🏭'
  return L.divIcon({ className: 'site-icon', html: `<span>${glyph}</span>`, iconSize: [18, 18], iconAnchor: [9, 9] })
}

/** OSM industrial infrastructure (only drawn when zoomed in enough to be useful). */
function SiteLayer({ data }) {
  const map = useMap()
  const [zoom, setZoom] = useState(map.getZoom())
  useEffect(() => {
    const h = () => setZoom(map.getZoom())
    map.on('zoomend', h)
    return () => map.off('zoomend', h)
  }, [map])
  useEffect(() => {
    if (!data) return
    const group = L.layerGroup()
    const showIcons = zoom >= 8
    for (const f of data.features) {
      const p = f.properties
      const [lon, lat] = f.geometry.coordinates
      const m = showIcons
        ? L.marker([lat, lon], { icon: siteIcon(p.site_type), interactive: true })
        : L.circleMarker([lat, lon], { radius: 3, color: SITE_COLOR, weight: 1, fillColor: '#0b1220', fillOpacity: 1 })
      m.bindTooltip(`<b>${p.name}</b><br/>${p.site_type.replace('_', ' ')} · ${p.source.toUpperCase()}`,
        { direction: 'top', opacity: 0.92, className: 'ts-tip' })
      group.addLayer(m)
    }
    group.addTo(map)
    return () => { group.remove() }
  }, [data, map, zoom])
  return null
}

function FlyTo({ target }) {
  const map = useMap()
  useEffect(() => {
    if (target) map.flyTo([target.lat, target.lng], Math.max(map.getZoom(), target.zoom || 11), { duration: 0.8 })
  }, [target, map])
  return null
}

function BboxBridge({ apiRef }) {
  const map = useMap()
  useImperativeHandle(apiRef, () => ({
    getBbox: () => {
      const b = map.getBounds()
      return [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()].map((v) => +v.toFixed(3))
    },
  }), [map])
  return null
}

function Legend() {
  return (
    <div className="legend">
      {Object.entries(LABELS).map(([k, v]) => (
        <div key={k} className="legend-row"><span className="legend-dot" style={{ background: v.color }} />{v.name}</div>
      ))}
      <div className="legend-row"><span className="legend-dot legend-ring" />FRP anomaly at persistent source</div>
      <div className="legend-row"><span className="legend-dot legend-dash" />Persistent source (≥8 active days)</div>
      <div className="legend-row"><span className="legend-dot" style={{ background: SITE_COLOR }} />OSM industrial site</div>
    </div>
  )
}

const MapView = forwardRef(function MapView({ hotspots, sources, sites, selected, onSelect, flyTo }, ref) {
  return (
    <MapContainer center={INDIA_CENTER} zoom={5} minZoom={4} preferCanvas className="map" zoomControl={false}>
      <LayersControl position="topright">
        <LayersControl.BaseLayer checked name="Dark">
          <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
            maxNativeZoom={16} attribution="Tiles &copy; Esri — Esri, DeLorme, NAVTEQ" />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer name="Satellite (Esri)">
          <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution="Tiles &copy; Esri — Source: Esri, Maxar, Earthstar Geographics" />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer name="OpenStreetMap">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' />
        </LayersControl.BaseLayer>
      </LayersControl>
      <SourceLayer data={sources} selected={selected} onSelect={onSelect} />
      <HotspotLayer data={hotspots} selected={selected} onSelect={onSelect} />
      <SiteLayer data={sites} />
      <FlyTo target={flyTo} />
      <BboxBridge apiRef={ref} />
      <Legend />
    </MapContainer>
  )
})

export default MapView
