// Static (no-backend) implementation of the API used for the GitHub Pages demo.
// Reads the JSON exported by backend/scripts/export_static.py from /data/ and
// filters client-side, mirroring the FastAPI endpoints.
const BASE = import.meta.env.BASE_URL || '/'
const cache = {}

async function load(name) {
  if (!cache[name]) {
    cache[name] = fetch(`${BASE}data/${name}`).then((r) => {
      if (!r.ok) throw new Error(`static data missing: ${name}`)
      return r.json()
    })
  }
  return cache[name]
}

async function hotspotRows() {
  if (!cache._rows) {
    const { columns, rows } = await load('hotspots.json')
    cache._rows = rows.map((r) => Object.fromEntries(columns.map((c, i) => [c, r[i]])))
    cache._byId = new Map(cache._rows.map((h) => [h.id, h]))
  }
  return cache._rows
}

function fc(rows, lat = 'latitude', lon = 'longitude') {
  return { type: 'FeatureCollection', features: rows.map((r) => {
    const { [lat]: la, [lon]: lo, ...props } = r
    return { type: 'Feature', geometry: { type: 'Point', coordinates: [lo, la] }, properties: props }
  }) }
}

function links(lat, lon, day) {
  return {
    sentinel_eo_browser: `https://apps.sentinel-hub.com/eo-browser/?zoom=13&lat=${lat}&lng=${lon}&themeId=DEFAULT-THEME&datasetId=S2L2A&fromTime=${day}T00:00:00.000Z&toTime=${day}T23:59:59.999Z&layerId=8-SWIR`,
    nasa_worldview: `https://worldview.earthdata.nasa.gov/?v=${lon - 0.3},${lat - 0.2},${lon + 0.3},${lat + 0.2}&t=${day}&l=VIIRS_NOAA20_Thermal_Anomalies_375m_All,VIIRS_SNPP_CorrectedReflectance_TrueColor`,
    firms_map: `https://firms.modaps.eosdis.nasa.gov/map/#d:${day};@${lon},${lat},12z`,
    osm: `https://www.openstreetmap.org/#map=15/${lat}/${lon}`,
    google_earth: `https://earth.google.com/web/@${lat},${lon},500a,3000d,35y,0h,0t,0r`,
  }
}

async function timeseries(groupId) {
  const ts = await load('timeseries.json')
  return (ts[groupId] || []).map(([acq_date, n, frp_sum, frp_max, n_night]) => ({ acq_date, n, frp_sum, frp_max, n_night }))
}

export const staticApi = {
  isStatic: true,
  status: () => load('status.json'),
  stats: () => load('stats.json'),
  model: () => load('model.json'),
  sites: () => load('sites.geojson'),
  async hotspots(p = {}) {
    const rows = await hotspotRows()
    const labels = p.labels ? new Set(String(p.labels).split(',')) : null
    const minConf = +(p.min_conf || 0)
    const out = []
    for (const h of rows) {
      if (labels && !labels.has(h.label)) continue
      if (h.confidence < minConf) continue
      if (p.date_from && h.acq_date < p.date_from) continue
      if (p.date_to && h.acq_date > p.date_to) continue
      if (p.persistent === true && h.is_persistent !== 1) continue
      if (p.anomaly === true && h.is_anomaly !== 1) continue
      out.push(h)
      if (p.limit && out.length >= p.limit) break
    }
    return fc(out)
  },
  async hotspot(id) {
    await hotspotRows()
    const h = cache._byId.get(id)
    if (!h) throw new Error('not found')
    return { ...h, timeseries: await timeseries(h.group_id), links: links(h.latitude, h.longitude, h.acq_date) }
  },
  async sources(p = {}) {
    const s = await load('sources.geojson')
    const labels = p.labels ? new Set(String(p.labels).split(',')) : null
    return { ...s, features: s.features.filter((f) => !labels || labels.has(f.properties.label)) }
  },
  async source(groupId) {
    const s = await load('sources.geojson')
    const f = s.features.find((x) => x.properties.group_id === groupId)
    if (!f) throw new Error('not found')
    const [lon, lat] = f.geometry.coordinates
    return { ...f.properties, lat, lon, timeseries: await timeseries(groupId), links: links(lat, lon, f.properties.last_seen) }
  },
  ingest: async () => { throw new Error('Pipeline runs need the Python backend — clone the repo to run live FIRMS ingestion.') },
  exportUrl: (kind) => `${BASE}data/${kind === 'sources' ? 'sources.geojson' : 'hotspots.json'}`,
}
