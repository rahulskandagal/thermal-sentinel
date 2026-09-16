const BASE = import.meta.env.VITE_API_BASE || ''

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

export const api = {
  status: () => get('/api/status'),
  stats: () => get('/api/stats'),
  model: () => get('/api/model'),
  hotspots: (p) => get('/api/hotspots', p),
  hotspot: (id) => get(`/api/hotspots/${id}`),
  sources: (p) => get('/api/sources', p),
  source: (id) => get(`/api/sources/${id}`),
  sites: (p) => get('/api/sites', p),
  ingest: async (body) => {
    const r = await fetch(`${BASE}/api/ingest`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    })
    if (!r.ok) throw new Error((await r.json()).detail || r.statusText)
    return r.json()
  },
  exportUrl: (kind, p = {}) => {
    const qs = new URLSearchParams(p).toString()
    return `${BASE}/api/export/${kind}.geojson${qs ? `?${qs}` : ''}`
  },
}

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
