// SIH 2026 Idea PPT in the OFFICIAL template format (headings & pointers unchanged).
//   node build_sih_template.js            → SIH26162_ThermalSentinel_Idea_6slides.pptx (portal version, ≤ 6 slides)
//   node build_sih_template.js extended   → SIH26162_ThermalSentinel_Idea_extended.pptx (for presenting)
const pptxgen = require('pptxgenjs')
const fs = require('fs')
const path = require('path')

const EXTENDED = process.argv.includes('extended')
const M = JSON.parse(fs.readFileSync(path.join(__dirname, 'metrics.json'), 'utf8'))
const img = (f) => 'image/png;base64,' + fs.readFileSync(path.join(__dirname, f)).toString('base64')

// Template look: white slides, dark heading, "Team <name>" top-left, footer + page number.
const INK = '1F2937', MUTED = '6B7280', LINE = 'D1D5DB', SOFT = 'F3F4F6', WHITE = 'FFFFFF'
const ORANGE = 'E8590C', BLUE = '1D4ED8', GREEN = '15803D', RED = 'B91C1C', PURPLE = '6D28D9', YELLOW = 'B45309', NAVY = '0F172A'
const FONT = 'Calibri', HEAD = 'Calibri'
const TEAM = 'FireOrbit'

const pres = new pptxgen()
pres.layout = 'LAYOUT_16x9'
pres.title = 'SIH 2026 Idea — SIH26162 ThermalSentinel'

let n = 0
function frame(s, heading) {
  n++
  s.background = { color: WHITE }
  s.addText([{ text: 'Team\n', options: { fontSize: 9, color: MUTED } }, { text: TEAM, options: { fontSize: 10, bold: true, color: INK } }],
    { x: 0.3, y: 0.15, w: 1.6, h: 0.55, fontFace: FONT, valign: 'top', margin: 0, isTextBox: true })
  s.addText(heading, { x: 1.9, y: 0.15, w: 6.2, h: 0.5, fontFace: HEAD, fontSize: 22, bold: true, color: INK, align: 'center', valign: 'middle', margin: 0, isTextBox: true })
  s.addText('@SIH Idea submission- Template', { x: 0.3, y: 5.3, w: 4, h: 0.22, fontFace: FONT, fontSize: 8, color: MUTED, margin: 0, isTextBox: true })
  s.addText(String(n), { x: 9.2, y: 5.3, w: 0.5, h: 0.22, fontFace: FONT, fontSize: 9, color: MUTED, align: 'right', margin: 0, isTextBox: true })
}
function box(s, x, y, w, h, o = {}) {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, fill: { color: o.fill || WHITE }, line: { color: o.line || LINE, width: 0.75 }, rectRadius: 0.05 })
}
function txt(s, t, x, y, w, h, o = {}) {
  s.addText(t, { x, y, w, h, fontFace: FONT, fontSize: o.size || 10, color: o.color || INK, bold: !!o.bold, italic: !!o.italic, align: o.align || 'left', valign: o.valign || 'top', margin: 0, isTextBox: true })
}
function bl(s, items, x, y, w, h, size = 9.5, gap = 2) {
  s.addText(items.map((t, i) => ({ text: t, options: { bullet: { indent: 10 }, breakLine: i < items.length - 1, paraSpaceAfter: gap } })),
    { x, y, w, h, fontFace: FONT, fontSize: size, color: INK, valign: 'top', margin: 1, isTextBox: true })
}
function pointer(s, t, x, y, w, color = INK) {
  txt(s, '➤ ' + t, x, y, w, 0.25, { size: 10.5, bold: true, color })
}
function arrow(s, x, y, w) {
  s.addShape(pres.shapes.LINE, { x, y, w, h: 0, line: { color: '9CA3AF', width: 1.5, endArrowType: 'triangle' } })
}
const fmt = (v) => v.toLocaleString('en-IN')

// ================================================================== 1. TITLE PAGE
{
  const s = pres.addSlide(); n++
  s.background = { color: WHITE }
  txt(s, 'SMART INDIA HACKATHON 2026', 0.5, 0.35, 9, 0.5, { size: 26, bold: true, align: 'center', color: INK })
  txt(s, 'TITLE PAGE', 0.5, 0.85, 9, 0.35, { size: 14, bold: true, align: 'center', color: MUTED })
  const rows = [
    ['Problem Statement ID', 'SIH26162'],
    ['Problem Statement Title', 'AI-Based Detection and Classification of Industrial Fires and Persistent Thermal Sources Using NASA FIRMS, OSM & Satellite Data'],
    ['Theme', 'Disaster Management'],
    ['PS Category', 'Software'],
    ['Team ID', '<TEAM ID>'],
    ['Team Name (Registered on portal)', TEAM],
  ]
  s.addText(rows.map(([k, v], i) => ([{ text: k + ' - ', options: { bold: true, breakLine: false } }, { text: v, options: { bold: false, breakLine: i < rows.length - 1 } }])).flat()
    .map((r) => ({ ...r, options: { ...r.options, bullet: r.options.bold ? { indent: 12 } : undefined, paraSpaceAfter: 6 } })),
    { x: 0.6, y: 1.45, w: 5.4, h: 3.0, fontFace: FONT, fontSize: 11.5, color: INK, valign: 'top', margin: 0, isTextBox: true })
  box(s, 0.6, 4.45, 5.4, 0.75, { fill: SOFT, line: SOFT })
  s.addText([{ text: 'IDEA TITLE:  ', options: { bold: true, color: ORANGE } }, { text: 'ThermalSentinel — an AI + GIS system that classifies every NASA FIRMS hotspot (industrial fire, gas flare, mine fire, crop burning, wildfire) and alerts only on abnormal industrial heat.', options: { color: INK } }],
    { x: 0.75, y: 4.45, w: 5.1, h: 0.75, fontFace: FONT, fontSize: 10.5, valign: 'middle', margin: 0, isTextBox: true })
  s.addImage({ data: img('dashboard.png'), x: 6.3, y: 1.5, w: 3.4, h: 1.91 })
  s.addImage({ data: img('dashboard_detail.png'), x: 6.3, y: 3.5, w: 7.7, h: 4.33, sizing: { type: 'crop', x: 4.3, y: 0.3, w: 3.4, h: 1.91 } })
  txt(s, 'Working prototype (screenshots)', 6.3, 5.42, 3.4, 0.2, { size: 8, color: MUTED, italic: true, align: 'center' })
}

// ================================================================== 2. PROPOSED SOLUTION
{
  const s = pres.addSlide()
  frame(s, 'IDEA TITLE / PROPOSED SOLUTION')
  txt(s, 'ThermalSentinel — AI classification of industrial fires & persistent thermal sources on a GIS map', 0.3, 0.68, 9.4, 0.3, { size: 11.5, bold: true, color: ORANGE, align: 'center' })

  // Problem
  box(s, 0.3, 1.05, 3.0, 2.35)
  pointer(s, 'The problem', 0.4, 1.1, 2.8, RED)
  bl(s, ['NASA FIRMS gives thousands of "hot pixels" over India daily — location, brightness, FRP only.',
    'A refinery flare, steel plant, coal-seam fire, stubble burn and forest fire look IDENTICAL.',
    'Disaster managers cannot prioritise; a real plant fire hides among thousands of routine hotspots.',
    'No registry exists of persistent thermal sources or undeclared industrial activity.'], 0.4, 1.38, 2.8, 2.0, 9)

  // Solution (detailed)
  box(s, 3.4, 1.05, 3.4, 2.35)
  pointer(s, 'Detailed explanation of the proposed solution', 3.5, 1.1, 3.2, BLUE)
  bl(s, ['Ingest VIIRS/MODIS hotspots from the FIRMS API (NRT + archive).',
    'Cluster detections into thermal SOURCES (DBSCAN) and track each over 90 days → persistence score.',
    'Add context from OpenStreetMap: nearest refinery / steel / power / flare / kiln / mine + land cover.',
    'Hybrid classifier (explainable rules + gradient-boosted trees) → 6 classes with confidence & reasons.',
    'FRP-anomaly detector: a known source burning ≥ 2.5× its own baseline → incident alert.',
    'Results stored in a spatial DB and served as GeoJSON to a Leaflet GIS dashboard; export to QGIS.'], 3.5, 1.38, 3.2, 2.0, 8.5)

  // How it addresses + innovation
  box(s, 6.9, 1.05, 2.8, 2.35)
  pointer(s, 'How it addresses the problem', 7.0, 1.1, 2.6, GREEN)
  bl(s, ['Industrial fires are SEGREGATED from forest fires, crop burning, flares and mine fires — the PS requirement.',
    'Only abnormal industrial heat raises an alert → 99 % fewer hotspots to triage.',
    'Every result is a map overlay + stored record (GIS requirement).'], 7.0, 1.38, 2.6, 2.0, 8.5)

  // Innovation & comparison
  box(s, 0.3, 3.5, 3.4, 1.7)
  pointer(s, 'Innovation and uniqueness', 0.4, 3.55, 3.2, PURPLE)
  bl(s, ['First to fuse temporal persistence + OSM infrastructure + physical signature in ONE explainable classifier.',
    'Baseline-relative anomaly alerts distinguish "refinery operating" from "refinery on fire".',
    'Detects UNREGISTERED sources: persistent heat where no facility is mapped.',
    'Zero data cost — all open sources; runs offline or live with one API key.'], 0.4, 3.83, 3.2, 1.35, 8.5)

  const H = (t) => ({ text: t, options: { bold: true, color: WHITE, fill: { color: NAVY }, align: 'center', fontSize: 8.5 } })
  const Y = { text: '✔', options: { color: GREEN, bold: true, align: 'center' } }, N = { text: '✖', options: { color: RED, bold: true, align: 'center' } }, P = { text: '◐', options: { color: YELLOW, bold: true, align: 'center' } }
  const cmp = [[{ text: 'Comparison', options: { bold: true, color: WHITE, fill: { color: NAVY }, fontSize: 8.5 } }, H('FIRMS map'), H('Fire dashboards'), H('ThermalSentinel')],
    ['Shows hotspots on a map', Y, Y, Y],
    ['Tells WHAT is burning (6 classes)', N, N, Y],
    ['Industrial vs wildfire vs crop burn', N, P, Y],
    ['Persistent-source registry + history', N, N, Y],
    ['Incident alert vs own baseline', N, N, Y],
    ['Explains every decision', N, N, Y]]
    .map((r, i) => r.map((c) => (typeof c === 'string' ? { text: c, options: { fill: { color: i % 2 ? SOFT : WHITE } } } : { text: c.text, options: { ...c.options, fill: c.options.fill || { color: i % 2 ? SOFT : WHITE } } })))
  s.addTable(cmp, { x: 3.8, y: 3.5, w: 5.9, colW: [2.6, 1.1, 1.1, 1.1], fontFace: FONT, fontSize: 8.5, color: INK, border: { type: 'solid', color: LINE, pt: 0.5 }, rowH: 0.235, margin: 0.03 })
}

// ================================================================== (extended) COMPARISON
if (EXTENDED) {
  const s = pres.addSlide()
  frame(s, 'COMPARISON WITH EXISTING SOLUTIONS')
  const H = (t) => ({ text: t, options: { bold: true, color: WHITE, fill: { color: NAVY }, align: 'center', fontSize: 8.5, valign: 'middle' } })
  const Y = () => ({ text: '✔', options: { color: GREEN, bold: true, align: 'center' } })
  const N = () => ({ text: '✖', options: { color: RED, bold: true, align: 'center' } })
  const P = (t) => ({ text: t || '◐', options: { color: YELLOW, bold: !t, align: 'center', fontSize: t ? 7.5 : 8.5 } })
  const body = [
    ['Primary purpose', P('hotspot map'), P('forest / land fires'), P('wildfire danger & burnt area'), P('flare & industrial catalogue'), P('industrial fire intelligence')],
    ['Detects thermal anomalies', Y(), Y(), Y(), Y(), Y()],
    ['Classifies WHAT is burning (6 classes)', N(), N(), N(), P('flares only'), Y()],
    ['Separates industrial fire from wildfire / crop burn', N(), N(), N(), P(), Y()],
    ['Registry of persistent sources with history', N(), N(), N(), P('annual, global'), Y()],
    ['Incident alert vs source\'s own baseline', N(), N(), N(), N(), Y()],
    ['Uses OSM infrastructure + land-cover context', N(), P('land cover'), P('land cover'), N(), Y()],
    ['Explains every decision (reasons)', N(), N(), N(), N(), Y()],
    ['Near-real-time (≤ 3 h latency)', Y(), Y(), P('daily'), N(), Y()],
    ['India-specific priors (crop-residue seasons, kiln belts)', N(), N(), N(), N(), Y()],
    ['Open GeoJSON API / GIS export', P(), P(), P(), P('CSV'), Y()],
    ['Free & open data / self-hostable', Y(), Y(), Y(), Y(), Y()],
  ]
  const rows = [[{ text: 'Capability', options: { bold: true, color: WHITE, fill: { color: NAVY }, fontSize: 8.5, valign: 'middle' } },
    H('NASA FIRMS map'), H('Global Forest Watch Fires'), H('Copernicus EFFIS / GWIS'), H('VIIRS Nightfire (VNF) / research'), H('ThermalSentinel (FireOrbit)')]]
  body.forEach((r, i) => {
    const bg = { color: i % 2 ? SOFT : WHITE }
    rows.push(r.map((c, j) => typeof c === 'string' ? { text: c, options: { fill: bg } } : { text: c.text, options: { ...c.options, fill: j === 5 ? { color: 'ECFDF5' } : bg } }))
  })
  s.addTable(rows, { x: 0.3, y: 0.75, w: 9.4, colW: [3.0, 1.15, 1.3, 1.35, 1.35, 1.25], fontFace: FONT, fontSize: 8.5, color: INK, border: { type: 'solid', color: LINE, pt: 0.5 }, rowH: 0.27, margin: 0.03 })
  box(s, 0.3, 4.35, 4.6, 0.85, { fill: SOFT, line: SOFT })
  txt(s, 'Versus published research', 0.42, 4.4, 4.4, 0.22, { size: 9.5, bold: true, color: ORANGE })
  txt(s, 'Elvidge et al. (VIIRS Nightfire) catalogue flares globally; Liu et al. (2018) find industrial heat sources from Nightfire time-series. Both are offline, global, single-class studies. We add OSM context, six-class discrimination, per-source baselines with operational alerts, and a live GIS — for India.', 0.42, 4.62, 4.4, 0.58, { size: 8, color: INK })
  box(s, 5.1, 4.35, 4.6, 0.85, { fill: 'ECFDF5', line: 'ECFDF5' })
  txt(s, 'Bottom line', 5.22, 4.4, 4.4, 0.22, { size: 9.5, bold: true, color: GREEN })
  txt(s, 'Existing tools answer "where is it hot?". ThermalSentinel answers "what is it, is it normal, and should someone respond?" — the gap NTRO\'s problem statement describes.', 5.22, 4.62, 4.4, 0.58, { size: 8, color: INK })
}

// ================================================================== 3. TECHNICAL APPROACH
{
  const s = pres.addSlide()
  frame(s, 'TECHNICAL APPROACH')
  pointer(s, 'Technologies to be used', 0.3, 0.7, 4, BLUE)
  const tech = [['Data', 'NASA FIRMS Area API (VIIRS 375 m, MODIS), OpenStreetMap Overpass, Copernicus Sentinel-2 / NASA Worldview'],
    ['Backend / ML', 'Python 3, FastAPI, pandas, NumPy, scikit-learn (DBSCAN, HistGradientBoosting), shapely'],
    ['Storage / GIS', 'SQLite → PostGIS, GeoJSON API, QGIS / ArcGIS export'],
    ['Frontend', 'React 18, Vite, Leaflet (canvas), GitHub Pages / any VM']]
  tech.forEach(([k, v], i) => {
    s.addText([{ text: k + ': ', options: { bold: true, color: ORANGE } }, { text: v, options: { color: INK } }],
      { x: 0.35, y: 0.97 + i * 0.23, w: 9.3, h: 0.23, fontFace: FONT, fontSize: 8.5, margin: 0, valign: 'top', isTextBox: true })
  })

  pointer(s, 'Methodology and process for implementation (flow chart)', 0.3, 1.95, 6, BLUE)
  const flow = [['1  Ingest', 'FIRMS hotspots\n10-day chunks,\nnormalise, de-dup', ORANGE],
    ['2  Cluster', 'Haversine DBSCAN\n750 m → thermal\nsources', BLUE],
    ['3  Persistence', 'active days, span,\nnight %, FRP mean\n/ CV / z-score', PURPLE],
    ['4  OSM context', 'nearest facility\ntype + distance,\nland cover (PIP)', GREEN],
    ['5  Classify', 'rules + GBM vote\n→ 6 classes,\nconfidence, reasons', RED],
    ['6  Serve', 'SQLite → GeoJSON\nAPI → Leaflet GIS\ndashboard, export', NAVY]]
  flow.forEach(([t, d, c], i) => {
    const x = 0.3 + i * 1.6
    box(s, x, 2.25, 1.45, 0.88, { line: c })
    s.addShape(pres.shapes.RECTANGLE, { x, y: 2.25, w: 1.45, h: 0.26, fill: { color: c }, line: { color: c, width: 0 } })
    txt(s, t, x + 0.05, 2.25, 1.35, 0.26, { size: 9, bold: true, color: WHITE, valign: 'middle' })
    txt(s, d, x + 0.07, 2.54, 1.33, 0.58, { size: 7.5, color: INK })
    if (i < 5) arrow(s, x + 1.45, 2.69, 0.15)
  })
  // anomaly branch
  s.addShape(pres.shapes.LINE, { x: 7.42, y: 3.13, w: 0, h: 0.17, line: { color: RED, width: 1.5, endArrowType: 'triangle' } })
  box(s, 6.15, 3.3, 2.55, 0.36, { fill: 'FEF2F2', line: RED })
  txt(s, '⚠ Anomaly: FRP ≥ 2.5× source baseline & z ≥ 3 → incident alert', 6.22, 3.3, 2.45, 0.36, { size: 7.5, bold: true, color: RED, valign: 'middle' })
  txt(s, 'Inputs: NASA FIRMS (thermal anomalies) · OSM (infrastructure & land use) · Sentinel-2 / Worldview (visual verification)', 0.3, 3.2, 5.8, 0.25, { size: 8, color: MUTED, italic: true })

  pointer(s, 'Working prototype (real screenshots)', 0.3, 3.72, 4, BLUE)
  s.addImage({ data: img('dashboard.png'), x: 0.3, y: 4.0, w: 2.3, h: 1.29 })
  s.addImage({ data: img('dashboard_detail.png'), x: 2.7, y: 4.0, w: 4.4, h: 2.47, sizing: { type: 'crop', x: 2.45, y: 0.17, w: 1.6, h: 1.29 } })
  bl(s, [`${fmt(M.totals[0])} FIRMS detections classified in ~7 s · ${M.n_sources} persistent sources · ${M.totals[2]} incident candidates`,
    `Hybrid accuracy ${(M.acc * 100).toFixed(1)} % on labelled archive (group-aware split); rules-only ${(M.rules * 100).toFixed(1)} %`,
    'Live demo: https://rahulskandagal.github.io/thermal-sentinel/  ·  code: github.com/rahulskandagal/thermal-sentinel'], 4.45, 4.0, 5.25, 1.3, 8.5, 2)
}

// ================================================================== (extended) IMPLEMENTATION
if (EXTENDED) {
  const s = pres.addSlide()
  frame(s, 'IMPLEMENTATION & WORKING PROTOTYPE')
  s.addImage({ data: img('dashboard.png'), x: 0.3, y: 0.75, w: 5.6, h: 3.15 })
  txt(s, 'GIS dashboard: coloured detections by class, dashed footprints = persistent sources, OSM facility icons, class/date/confidence filters, per-day timeline, GeoJSON export.', 0.3, 3.92, 5.6, 0.45, { size: 8.5, color: MUTED, italic: true })
  s.addImage({ data: img('dashboard_detail.png'), x: 6.1, y: 0.75, w: 8.2, h: 4.61, sizing: { type: 'crop', x: 4.6, y: 0.32, w: 3.6, h: 3.15 } })
  txt(s, 'Detail drawer for Jamnagar refinery: class + confidence, 86 active days, 59 % night, FRP baseline 19 MW with a 207 MW spike flagged as incident; one-click Sentinel-2 / Worldview verification.', 6.1, 3.92, 3.6, 0.6, { size: 8.5, color: MUTED, italic: true })
  const steps = ['Ingest → normalise VIIRS & MODIS to one schema', 'DBSCAN clusters → per-source persistence statistics', 'Overpass around hotspot cells → facility + land cover', 'Rule engine + GBM → label, confidence, reasons, anomaly flag', 'SQLite + FastAPI GeoJSON → React/Leaflet; GitHub Pages static demo']
  steps.forEach((t, i) => {
    box(s, 0.3 + i * 1.9, 4.55, 1.8, 0.65, { fill: SOFT, line: SOFT })
    txt(s, `${i + 1}. ${t}`, 0.37 + i * 1.9, 4.58, 1.68, 0.6, { size: 8, color: INK })
  })
}

// ================================================================== 4. FEASIBILITY AND VIABILITY
{
  const s = pres.addSlide()
  frame(s, 'FEASIBILITY AND VIABILITY')
  box(s, 0.3, 0.75, 3.05, 3.45)
  pointer(s, 'Analysis of the feasibility of the idea', 0.4, 0.8, 2.9, GREEN)
  bl(s, ['All inputs are free & open: FIRMS MAP_KEY (instant), OSM Overpass, Copernicus Sentinel-2, NASA Worldview.',
    'Working end-to-end prototype already exists: 22 k detections → classified in 7 s on a laptop; model trains in seconds.',
    'Same pipeline switches to live FIRMS with one env variable; Overpass is queried only around hotspot cells → India-wide in minutes.',
    'Lightweight stack (SQLite / FastAPI / React) → one VM, NIC cloud or an air-gapped NTRO server.',
    'Explainable rules let analysts audit and tune; ML improves as labelled incidents accumulate.',
    'Static demo already live on GitHub Pages.'], 0.4, 1.1, 2.85, 3.05, 9.5)
  box(s, 3.45, 0.75, 3.05, 3.45)
  pointer(s, 'Potential challenges and risks', 3.55, 0.8, 2.9, RED)
  bl(s, ['Incomplete OSM coverage of Indian industry (small kilns, sponge-iron units).',
    'Cloud cover & 375 m pixel offsets between passes.',
    'Few labelled real incidents for supervised ML; synthetic archive is cleaner than reality.',
    'Overpass rate limits when scaling to national, multi-year archives.',
    'False alarms from legitimate process changes (furnace restart, flaring during maintenance).',
    'Sub-pixel sources (small flares) below VIIRS detection threshold.'], 3.55, 1.1, 2.85, 3.05, 9.5)
  box(s, 6.6, 0.75, 3.1, 3.45)
  pointer(s, 'Strategies for overcoming these challenges', 6.7, 0.8, 2.95, BLUE)
  bl(s, ['Persistence signature detects unregistered sources even with no OSM facility; curated facility list merged with OSM; Sentinel-2 chip verification.',
    '90-day window + 4 passes/day from 3 VIIRS satellites; DBSCAN grouping absorbs pixel jitter.',
    'Rules as strong prior; validate on documented incidents (news / PESO / CPCB); analyst feedback loop → retrain.',
    'Around-cell queries + disk cache; self-hosted Overpass or ESA WorldCover raster for scale.',
    'Baseline-relative thresholds + analyst override; confidence shown on every alert.',
    'Add VIIRS Nightfire (VNF) for flare temperature; Landsat TIRS for small sources.'], 6.7, 1.1, 2.9, 3.05, 9.5)

  // viability strip
  box(s, 0.3, 4.32, 9.4, 0.88, { fill: NAVY, line: NAVY })
  txt(s, 'VIABILITY', 0.45, 4.38, 2, 0.22, { size: 9, bold: true, color: 'FBBF24' })
  const via = [['₹ 0', 'data licensing — all open sources'], ['1 VM', 'or air-gapped server; SQLite → PostGIS when scaling'], ['~7 s', 'to classify a 90-day national archive'], ['1 env var', 'switches offline archive → live NASA FIRMS'], ['Open', 'GeoJSON / API — plugs into any GIS NTRO runs']]
  via.forEach(([v, l], i) => {
    const x = 0.45 + i * 1.86
    txt(s, v, x, 4.6, 1.8, 0.3, { size: 15, bold: true, color: 'FB923C' })
    txt(s, l, x, 4.9, 1.75, 0.3, { size: 7.5, color: 'E5E7EB' })
  })
}

// ================================================================== 5. IMPACT AND BENEFITS (+ report)
{
  const s = pres.addSlide()
  frame(s, 'IMPACT AND BENEFITS')
  box(s, 0.3, 0.75, 4.6, 2.3)
  pointer(s, 'Potential impact on the target audience', 0.4, 0.8, 4.4, BLUE)
  bl(s, ['Disaster management (NDMA / SDMAs / fire services): alerts only on abnormal industrial heat → faster, correctly-targeted response to plant fires & explosions.',
    'NTRO & security agencies: a national registry of persistent thermal sources with activity history; detects undeclared industrial activity; change detection (shutdowns, restarts, surges).',
    'CPCB / MoEFCC: attribute district fires to stubble burning vs industry; flaring inventories.',
    'Insurers & industry: verified incident records; compliance evidence.'], 0.4, 1.1, 4.4, 1.9, 9.5)
  box(s, 5.0, 0.75, 4.7, 2.3)
  pointer(s, 'Benefits of the solution', 5.1, 0.8, 4.5, GREEN)
  bl(s, ['Social: earlier warning for communities near refineries, steel plants, chemical complexes; better use of fire-service capacity.',
    'Economic: 99 % fewer hotspots to triage; ₹0 data licensing; reduced losses through early detection; runs on one VM.',
    'Environmental: separates agricultural burning from industrial emissions; flaring and coal-fire monitoring for climate reporting.',
    'Strategic: open, explainable, auditable — deployable on sovereign / air-gapped infrastructure.'], 5.1, 1.1, 4.5, 1.9, 9.5)

  // Report panel
  box(s, 0.3, 3.15, 9.4, 2.05, { fill: NAVY, line: NAVY })
  txt(s, 'REPORT — results of the working prototype (90-day labelled archive over real Indian sites)', 0.45, 3.2, 9.1, 0.28, { size: 10.5, bold: true, color: 'FBBF24' })
  const tiles = [[fmt(M.totals[0]), 'FIRMS detections classified in ~7 s'], [String(M.n_sources), 'persistent sources registered'], [String(M.totals[2]), 'incident candidates (0.6 % of detections)'],
    [`${(M.acc * 100).toFixed(1)} %`, 'hybrid accuracy (group-aware test split)'], [`${(M.rules * 100).toFixed(1)} %`, 'rules-only accuracy (explainable baseline)'], ['6', 'classes: industrial, flare, mining, agri, wildfire, other']]
  tiles.forEach(([v, l], i) => {
    const x = 0.45 + (i % 3) * 3.05, y = 3.52 + Math.floor(i / 3) * 0.82
    txt(s, v, x, y, 1.1, 0.45, { size: 20, bold: true, color: 'FB923C', valign: 'middle' })
    txt(s, l, x + 1.15, y, 1.85, 0.45, { size: 8.5, color: 'E5E7EB', valign: 'middle' })
  })
  txt(s, 'Example alerts found: Bhilai Steel 414 MW vs 32 MW baseline · Jamnagar 207 MW vs 19 MW · Tata Steel 101 MW vs 26 MW.  Note: archive is physically simulated and labelled; real-world accuracy will be lower — validation on real incidents is the next-round goal.',
    0.45, 4.82, 9.1, 0.35, { size: 7.5, color: 'CBD5E1', italic: true })
}

// ================================================================== (extended) REPORT with charts
if (EXTENDED) {
  const s = pres.addSlide()
  frame(s, 'REPORT — EVALUATION OF THE PROTOTYPE')
  const cls = M.classes.filter((c) => c !== 'OTHER')
  const names = { AGRICULTURAL_BURN: 'Agricultural burn', GAS_FLARE: 'Gas flare', INDUSTRIAL_FIRE: 'Industrial fire', MINING_ACTIVITY: 'Mining / coal fire', WILDFIRE: 'Wildfire' }
  box(s, 0.3, 0.75, 4.6, 2.9)
  txt(s, 'Per-class F1 score (held-out sources)', 0.45, 0.82, 4.3, 0.25, { size: 10, bold: true })
  s.addChart(pres.charts.BAR, [{ name: 'F1', labels: cls.map((c) => names[c]), values: cls.map((c) => +(M.f1[c] * 100).toFixed(1)) }], {
    x: 0.4, y: 1.05, w: 4.4, h: 2.55, barDir: 'bar', chartColors: [GREEN, YELLOW, ORANGE, PURPLE, RED], showValue: true, dataLabelPosition: 'inEnd', dataLabelColor: WHITE, dataLabelFontSize: 8,
    dataLabelFormatCode: '0.0"%"', valAxisMinVal: 90, valAxisMaxVal: 100, catAxisOrientation: 'maxMin', valAxisLabelFontSize: 8, catAxisLabelFontSize: 8, valGridLine: { color: 'E5E7EB', size: 0.5 }, catGridLine: { style: 'none' }, showLegend: false })
  box(s, 5.1, 0.75, 4.6, 2.9)
  txt(s, 'What drives the decision (permutation importance)', 5.25, 0.82, 4.3, 0.25, { size: 10, bold: true })
  const nice = { lc_cropland: 'land cover: cropland', lc_industrial: 'land cover: industrial', night_frac: 'night fraction', site_mine: 'near mine/quarry', site_gas_flare: 'near gas flare', lc_unknown: 'land cover unknown', dist_industrial_km: 'distance to industry', frp_mean: 'source mean FRP' }
  const imp = M.imp.slice(0, 8)
  s.addChart(pres.charts.BAR, [{ name: 'imp', labels: imp.map((r) => nice[r.feature] || r.feature), values: imp.map((r) => +(r.importance * 100).toFixed(2)) }], {
    x: 5.2, y: 1.05, w: 4.4, h: 2.55, barDir: 'bar', chartColors: [BLUE], showValue: true, dataLabelPosition: 'outEnd', dataLabelFontSize: 8, dataLabelFormatCode: '0.0', catAxisOrientation: 'maxMin',
    valAxisHidden: true, valGridLine: { style: 'none' }, catGridLine: { style: 'none' }, catAxisLabelFontSize: 8, showLegend: false })
  const H = (t, a = 'left') => ({ text: t, options: { bold: true, color: WHITE, fill: { color: NAVY }, align: a } })
  const rows = [[H('Persistent source'), H('Class'), H('Days', 'right'), H('Mean FRP', 'right'), H('Night', 'right'), H('Alerts', 'right')]]
  M.top.slice(0, 6).forEach(([name, lab, days, frp, an, nf], i) => {
    const bg = { color: i % 2 ? SOFT : WHITE }
    rows.push([{ text: name.replace(/ – flare \d/, ' (flare)').replace('Bellary Iron Ore Quarries', 'Bellary sponge-iron units'), options: { fill: bg } }, { text: names[lab] || lab, options: { fill: bg } },
      { text: String(days), options: { align: 'right', fill: bg } }, { text: `${frp.toFixed(1)} MW`, options: { align: 'right', fill: bg } }, { text: `${Math.round(nf * 100)} %`, options: { align: 'right', fill: bg } }, { text: an ? String(an) : '–', options: { align: 'right', color: an ? RED : MUTED, bold: !!an, fill: bg } }])
  })
  s.addTable(rows, { x: 0.3, y: 3.8, w: 9.4, colW: [3.4, 1.9, 0.9, 1.2, 1.0, 1.0], fontFace: FONT, fontSize: 8.5, color: INK, border: { type: 'solid', color: LINE, pt: 0.5 }, rowH: 0.2, margin: 0.03 })
}

// ================================================================== 6. RESEARCH AND REFERENCES
{
  const s = pres.addSlide()
  frame(s, 'RESEARCH AND REFERENCES')
  pointer(s, 'Details / Links of the reference and research work', 0.3, 0.72, 6, BLUE)
  const refs = [
    ['NASA FIRMS — Fire Information for Resource Management System; Area API & VIIRS 375 m active-fire product (VNP14IMG / VJ114IMG)', 'https://firms.modaps.eosdis.nasa.gov/api/area/'],
    ['Schroeder, W. et al. (2014). The New VIIRS 375 m active fire detection data product. Remote Sensing of Environment, 143, 85–96.', 'https://doi.org/10.1016/j.rse.2013.12.008'],
    ['Elvidge, C. D. et al. (2013). VIIRS Nightfire: Satellite Pyrometry at Night. Remote Sensing, 5(9), 4423–4449 — basis for gas-flare signatures.', 'https://doi.org/10.3390/rs5094423'],
    ['Liu, Y. et al. (2018). Identifying industrial heat sources using time-series of the VIIRS Nightfire product. Remote Sensing of Environment, 204.', 'https://www.sciencedirect.com/journal/remote-sensing-of-environment'],
    ['OpenStreetMap Overpass API & tagging: landuse=industrial, man_made=flare|works, power=plant, landuse=quarry|farmland|forest', 'https://wiki.openstreetmap.org/wiki/Overpass_API'],
    ['Copernicus Data Space — Sentinel-2 L2A SWIR (B11/B12) for hotspot verification; ESA WorldCover 10 m land cover', 'https://dataspace.copernicus.eu · https://esa-worldcover.org'],
    ['ICAR-IARI CREAMS / CPCB — crop-residue burning bulletins (Oct–Nov, Apr–May seasonality used as a prior)', 'https://creams.iari.res.in'],
    ['Ester, M. et al. (1996). DBSCAN. KDD-96 · scikit-learn HistGradientBoostingClassifier documentation', 'https://scikit-learn.org'],
    ['Our prototype — live demo & source code', 'https://rahulskandagal.github.io/thermal-sentinel/ · https://github.com/rahulskandagal/thermal-sentinel'],
  ]
  refs.forEach(([t, u], i) => {
    const y = 1.05 + i * 0.46
    txt(s, `${i + 1}.`, 0.35, y, 0.3, 0.25, { size: 9, bold: true, color: ORANGE })
    txt(s, t, 0.65, y, 9.0, 0.25, { size: 9, color: INK })
    txt(s, u, 0.65, y + 0.21, 9.0, 0.2, { size: 8, color: BLUE })
  })
}

const out = path.join(__dirname, EXTENDED ? 'SIH26162_ThermalSentinel_Idea_extended.pptx' : 'SIH26162_ThermalSentinel_Idea_6slides.pptx')
pres.writeFile({ fileName: out }).then(() => console.log('wrote', out, `(${n} slides)`))
