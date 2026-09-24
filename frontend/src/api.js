import { staticApi } from './staticApi.js'

const BASE = import.meta.env.VITE_API_BASE || ''
// VITE_STATIC=1 (GitHub Pages build) → serve everything from pre-exported JSON, no backend.
export const IS_STATIC = import.meta.env.VITE_STATIC === '1'

async function get(path, params = {}) {
  const qs = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&')
  let r
  try {
    r = await fetch(`${BASE}${path}${qs ? `?${qs}` : ''}`)
  } catch {
    throw new Error('Backend API not reachable — start it with: uvicorn app.main:app --port 8000 (in backend/)')
  }
  if (r.status === 500 || r.status === 502 || r.status === 504) {
    const body = await r.text()
    if (!body || body.includes('ECONNREFUSED') || body.includes('socket hang up')) {
      throw new Error('Backend API not running on :8000 — start it with: uvicorn app.main:app --port 8000 (in backend/)')
    }
    throw new Error(`${path}: ${r.status} ${body}`)
  }
  if (!r.ok) throw new Error(`${path}: ${r.status} ${await r.text()}`)
  return r.json()
}

async function post(path, body) {
  const r = await fetch(`${BASE}${path}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body || {}),
  })
  if (!r.ok) throw new Error((await r.json().catch(() => ({}))).detail || r.statusText)
  return r.json()
}

const liveApi = {
  status: () => get('/api/status'),
  stats: () => get('/api/stats'),
  model: () => get('/api/model'),
  hotspots: (p) => get('/api/hotspots', p),
  hotspot: (id) => get(`/api/hotspots/${id}`),
  sources: (p) => get('/api/sources', p),
  source: (id) => get(`/api/sources/${id}`),
  sites: (p) => get('/api/sites', p),
  alerts: (p) => get('/api/alerts', p),
  async forecast(p) {
    const [f, g] = await Promise.all([get('/api/forecast', p), get('/api/forecast/grid', p)])
    return { ...f, grid: g.features.map((x) => ({ ...x.properties, lon: x.geometry.coordinates[0], lat: x.geometry.coordinates[1] })) }
  },
  feedback: () => get('/api/feedback'),
  sendFeedback: (body) => post('/api/feedback', body),
  retrain: () => post('/api/retrain'),
  ingest: (body) => post('/api/ingest', body),
  exportUrl: (kind, p = {}) => {
    const qs = new URLSearchParams(p).toString()
    const ext = kind === 'alerts' || kind === 'registry' ? 'csv' : 'geojson'
    return `${BASE}/api/export/${kind}.${ext}${qs ? `?${qs}` : ''}`
  },
}

export const api = IS_STATIC ? staticApi : liveApi

export const LABELS = {
  INDUSTRIAL_FIRE: { name: 'Industrial fire / process heat', color: '#ff7a1a', short: 'Industrial' },
  GAS_FLARE: { name: 'Gas flare', color: '#ffd23f', short: 'Gas flare' },
  MINING_ACTIVITY: { name: 'Mining / coal-seam fire', color: '#c084fc', short: 'Mining' },
  AGRICULTURAL_BURN: { name: 'Agricultural residue burning', color: '#4ade80', short: 'Agri burn' },
  WILDFIRE: { name: 'Wildfire (forest / shrub)', color: '#ff3b3b', short: 'Wildfire' },
  OTHER: { name: 'Other / urban waste', color: '#9ca3af', short: 'Other' },
}
export const LABEL_KEYS = Object.keys(LABELS)
export const SITE_COLOR = '#22d3ee'
