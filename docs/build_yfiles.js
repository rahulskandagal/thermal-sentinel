// ThermalSentinel (SIH26162) in the "Y_FILES" SIH 2026 PPT format:
//  1 Title page (official SIH template)
//  2 CORE SOLUTION OVERVIEW — navy header, 3 columns, operational process-flow band
//  3 TECHNICAL APPROACH — blueprint flow diagram + tech-stack panel + metric cards
//  4 FEASIBILITY AND VIABILITY — 2x2 cards + stats strip + tag panel + metric cards
//  5 IMPACT & BENEFITS — monospace console panel (who benefits / before→after / key impacts / value chain)
//  6 RESEARCH FOUNDATIONS & ACADEMIC REFERENCES — dark tech panels 01/02/03 + hexagon chain
// Run: node build_yfiles.js → FireOrbit_SIH26162_ThermalSentinel_YFormat.pptx
const pptxgen = require('pptxgenjs')
const fs = require('fs')
const path = require('path')

const M = JSON.parse(fs.readFileSync(path.join(__dirname, 'metrics.json'), 'utf8'))
const img = (f) => 'image/png;base64,' + fs.readFileSync(path.join(__dirname, f)).toString('base64')
const LOGO = img('template_assets/sih_logo.png'), BRAIN = img('template_assets/brain_bulb.png')
const DASH = img('dashboard.png'), DETAIL = img('dashboard_detail.png')

const TEAM = 'FIRE ORBIT', TEAM_ID = ''
const DEMO = 'https://rahulskandagal.github.io/thermal-sentinel/', REPO = 'https://github.com/rahulskandagal/thermal-sentinel'

// palette from the reference format
const NAVY = '1F3864', HDR = '2E4C7E', HDR2 = '8D9DC0', WHITE = 'FFFFFF', BLACK = '000000'
const INK = '1A1A1A', MUT = '6B7280', LINE = 'BFC8DA', PANEL = 'EDF0F7', CARD = 'F2F2F2', SOFT = 'F7F9FC'
const BLUE = '1F6FB2', BLUE2 = '2E86C1', PURP = '7A5FA8', TEAL = '0F766E', GREEN = '15803D', RED = 'B91C1C', ORANGE = 'E8590C', AMBER = 'B45409'
const DARK = '06120F', DARK2 = '0C2119', NEON = '7BE7C7', NEON2 = 'A7F3D0', DGRID = '14332A'
const SERIF = 'Times New Roman', SANS = 'Arial', MONO = 'Consolas', EMOJI = 'Segoe UI Emoji'

const pres = new pptxgen()
pres.layout = 'LAYOUT_16x9'
pres.title = 'ThermalSentinel — SIH26162 (Fire Orbit)'

// ---------- helpers
const T = (s, t, x, y, w, h, o = {}) => s.addText(t, { x, y, w, h, fontFace: o.font || SANS, fontSize: o.size || 9, color: o.color || INK, bold: !!o.bold, italic: !!o.italic, underline: !!o.underline, align: o.align || 'left', valign: o.valign || 'top', margin: 0, isTextBox: true, ...(o.shrink ? { fit: 'shrink' } : {}) })
const R = (s, x, y, w, h, fill, o = {}) => s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, fill: fill ? { color: fill } : { type: 'none' }, line: { color: o.line || fill || LINE, width: o.lw ?? 1 }, rectRadius: o.r ?? 0.06 })
const RECT = (s, x, y, w, h, fill, o = {}) => s.addShape(pres.shapes.RECTANGLE, { x, y, w, h, fill: fill ? { color: fill } : { type: 'none' }, line: { color: o.line || fill || LINE, width: o.lw ?? 0 } })
const ARROW = (s, x, y, w, h, color = '404040') => s.addShape(pres.shapes.LINE, { x, y, w, h, line: { color, width: 1.25, endArrowType: 'triangle' } })
const bl = (s, items, x, y, w, h, size = 9, gap = 3, color = INK, bullet = true) =>
  s.addText(items.map((t, i) => ({ text: t, options: { bullet: bullet ? { indent: 10 } : false, breakLine: i < items.length - 1, paraSpaceAfter: gap } })),
    { x, y, w, h, fontFace: SANS, fontSize: size, color, valign: 'top', margin: 1, isTextBox: true })
const fmt = (v) => v.toLocaleString('en-IN')

let n = 0
// header used on slides 3-5 of the reference (team oval + serif title + SIH logo + blue footer bar)
function head(s, title, size = 26) {
  n++
  s.background = { color: WHITE }
  s.addShape(pres.shapes.OVAL, { x: 0.22, y: 0.12, w: 1.0, h: 0.56, fill: { color: WHITE }, line: { color: PURP, width: 1.25 } })
  T(s, TEAM, 0.22, 0.12, 1.0, 0.56, { size: 8.5, bold: true, color: INK, align: 'center', valign: 'middle' })
  T(s, title, 1.35, 0.1, 6.6, 0.6, { font: SERIF, size, bold: true, color: BLACK, align: 'center', valign: 'middle' })
  s.addImage({ data: LOGO, x: 8.05, y: 0.04, w: 1.75, h: 0.82 })
  RECT(s, 0.15, 0.74, 9.7, 0.015, '3C3C3C')
  RECT(s, 0, 5.32, 10, 0.3, '1F6FB2')
  T(s, String(n), 9.1, 5.32, 0.6, 0.3, { size: 9, bold: true, color: WHITE, align: 'right', valign: 'middle' })
}

// ================================================================== 1. TITLE PAGE
{
  const s = pres.addSlide(); n++
  s.background = { color: WHITE }
  s.addImage({ data: BRAIN, x: 5.68, y: 0.94, w: 4.32, h: 4.04 })
  s.addImage({ data: LOGO, x: 7.95, y: 0.05, w: 1.85, h: 0.87 })
  T(s, 'SMART INDIA HACKATHON 2026', 0.5, 0.15, 7.4, 0.6, { font: SERIF, size: 28, bold: true, color: NAVY, align: 'center', valign: 'middle' })
  const rows = [['Problem Statement ID – ', 'SIH26162'],
    ['Problem Statement Title- ', 'AI-Based Detection and Classification of Industrial Fires and Persistent Thermal Sources Using NASA FIRMS, OSM & Satellite Data'],
    ['Theme- ', 'Disaster Management'], ['PS Category- ', 'Software'], ['Team ID- ', TEAM_ID], ['Team Name (Registered on portal) - ', 'Fire Orbit']]
  const runs = []
  rows.forEach(([k, v], i) => { runs.push({ text: k, options: { bullet: true, bold: true } }); runs.push({ text: v, options: { bold: true, breakLine: i < rows.length - 1 } }) })
  s.addText(runs.map((r) => ({ ...r, options: { ...r.options, paraSpaceAfter: 10 } })), { x: 0.3, y: 1.35, w: 5.6, h: 3.7, fontFace: SERIF, fontSize: 13.5, color: BLACK, valign: 'top', margin: 0, isTextBox: true })
  T(s, 'Organisation: National Technical Research Organisation (NTRO)', 0.3, 4.8, 5.6, 0.3, { font: SERIF, size: 11, italic: true, color: MUT })
}

// ================================================================== 2. CORE SOLUTION OVERVIEW
{
  const s = pres.addSlide(); n++
  s.background = { color: SOFT }
  // navy header bar
  R(s, 0.25, 0.18, 9.5, 0.82, HDR, { line: '1B3763', lw: 1, r: 0.04 })
  T(s, 'THERMALSENTINEL — CORE SOLUTION OVERVIEW', 0.45, 0.24, 8.0, 0.36, { size: 19, bold: true, color: WHITE, align: 'center' })
  T(s, 'NASA FIRMS shows where the ground is hot; ThermalSentinel says what is burning and whether it is abnormal — classifying every thermal anomaly and alerting only on real industrial incidents.',
    0.45, 0.6, 8.0, 0.34, { size: 9.5, color: 'DCE6F7', align: 'center' })
  R(s, 8.52, 0.24, 1.16, 0.52, WHITE, { line: WHITE, lw: 0, r: 0.05 })
  s.addImage({ data: LOGO, x: 8.58, y: 0.27, w: 1.04, h: 0.47 })

  const colY = 1.1, colH = 3.05
  const cols = [
    ['OUR SOLUTION', 0.25, 3.0],
    ['HOW IT WORKS & ARCHITECTURE', 3.4, 3.0],
    ['UNIQUE DIFFERENTIATORS', 6.55, 3.2],
  ]
  cols.forEach(([title, x, w]) => {
    R(s, x, colY, w, 0.46, HDR2, { line: '7B8BB0', lw: 1, r: 0.03 })
    T(s, '[' + title + ']', x + 0.05, colY, w - 0.1, 0.46, { size: 11, bold: true, color: '17233D', align: 'center', valign: 'middle' })
  })
  // col 1
  R(s, 0.35, 1.64, 2.8, 2.45, WHITE, { line: LINE, lw: 1, r: 0.03 })
  bl(s, ['NASA FIRMS reports thousands of hot pixels over India every day — a refinery flare, a steel plant, a coal-seam fire, a stubble burn and a forest fire look identical.',
    'ThermalSentinel classifies every detection into 6 classes with a confidence and plain-language reasons.',
    'It tracks each thermal SOURCE for 90 days and builds a persistent-source registry.',
    'It alerts only when a known site burns far above its own baseline — a real incident, not routine heat.',
    'Output is a GIS map layer + GeoJSON API: the PS asks for segregation of industrial fires and GIS storage/visualisation; both are live today.'], 0.45, 1.72, 2.62, 2.3, 8.2, 3)
  // col 2
  R(s, 3.5, 1.64, 2.8, 2.45, WHITE, { line: LINE, lw: 1, r: 0.03 })
  const arch = [['INGEST', 'FIRMS VIIRS 375 m + MODIS (NRT ≤ 3 h + archive), both sensors normalised, passes de-duplicated', ORANGE],
    ['CLUSTER', 'Haversine DBSCAN 750 m groups pixel-jittered detections into thermal sources (22 k → 4.4 k)', BLUE],
    ['PERSISTENCE', '90-day history per source: active days, span, night %, FRP mean / CV / z-score', PURP],
    ['CONTEXT', 'OpenStreetMap facility type + distance and land cover (STRtree point-in-polygon)', GREEN],
    ['CLASSIFY', 'Explainable rules + gradient-boosted trees on 34 features; FRP-anomaly detector', RED],
    ['SERVE', 'SQLite → FastAPI GeoJSON → React/Leaflet GIS dashboard; QGIS / ArcGIS export', TEAL]]
  arch.forEach(([k, v, c], i) => {
    const y = 1.72 + i * 0.4
    RECT(s, 3.58, y + 0.02, 0.05, 0.34, c)
    s.addText([{ text: k + ': ', options: { bold: true, color: c } }, { text: v, options: { color: INK } }],
      { x: 3.68, y, w: 2.55, h: 0.38, fontFace: SANS, fontSize: 7.6, valign: 'top', margin: 0, isTextBox: true })
  })
  // col 3
  const feats = [['Source-level persistence fingerprint', 'classify the source over 90 days, not a single pixel'],
    ['Baseline-relative incident alerts', 'FRP ≥ 2.5× the site\'s own normal & z ≥ 3 → 0.6 % of data'],
    ['OSM infrastructure + land-cover fusion', 'facility type, distance and land use as model features'],
    ['Explainable hybrid AI', 'every label carries human-readable reasons — auditable']]
  feats.forEach(([t, d], i) => {
    const y = 1.66 + i * 0.62
    R(s, 6.65, y, 3.0, 0.56, WHITE, { line: LINE, lw: 1, r: 0.03 })
    T(s, '✦ ' + t, 6.75, y + 0.05, 2.8, 0.2, { size: 8.5, bold: true, color: NAVY })
    T(s, d, 6.75, y + 0.24, 2.8, 0.28, { size: 7.5, color: MUT })
  })

  // process flow band
  R(s, 0.25, 4.22, 9.5, 1.03, PANEL, { line: HDR2, lw: 1, r: 0.03 })
  RECT(s, 0.25, 4.22, 9.5, 0.28, HDR2)
  T(s, '[OPERATIONAL PROCESS FLOW & PROTOTYPE WORKFLOW]', 0.25, 4.22, 9.5, 0.28, { size: 10, bold: true, color: '17233D', align: 'center', valign: 'middle' })
  const steps = [['STEP 1: DATA CAPTURE', 'FIRMS API pulled in 10-day chunks; 22,179 detections in the 90-day archive'],
    ['STEP 2: SOURCE CONTEXT', 'DBSCAN clusters + OSM facilities & land cover around hotspot cells'],
    ['STEP 3: ANALYSIS & AI', '34 features → rules + GBM vote → class, confidence, reasons'],
    ['STEP 4: ACTIONABLE OUTPUT', '138 incident candidates (0.6 %) on the GIS map with FRP evidence'],
    ['STEP 5: VALIDATION', 'Sentinel-2 SWIR / Worldview verification; analyst override retrains']]
  steps.forEach(([t, d], i) => {
    const x = 0.35 + i * 1.88
    R(s, x, 4.56, 1.7, 0.26, WHITE, { line: '4A5A80', lw: 1, r: 0.02 })
    T(s, '[' + t + ']', x + 0.03, 4.56, 1.64, 0.26, { size: 6.6, bold: true, color: INK, align: 'center', valign: 'middle' })
    R(s, x, 4.86, 1.7, 0.33, WHITE, { line: LINE, lw: 1, r: 0.02 })
    T(s, d, x + 0.05, 4.88, 1.6, 0.3, { size: 5.8, color: MUT, align: 'center' })
    if (i < 4) ARROW(s, x + 1.72, 4.69, 0.14, 0)
  })
}

// ================================================================== 3. TECHNICAL APPROACH
{
  const s = pres.addSlide()
  head(s, 'TECHNICAL APPROACH')
  // left blueprint panel
  R(s, 0.18, 0.85, 6.55, 4.35, WHITE, { line: '8A8A8A', lw: 1, r: 0.03 })
  const bb = (x, y, w, h, label, sub, c = BLUE2, fs = 8) => {
    R(s, x, y, w, h, WHITE, { line: c, lw: 1.75, r: 0.08 })
    if (label) T(s, label, x + 0.04, y + 0.04, w - 0.08, 0.22, { size: fs, bold: true, color: INK, align: 'center' })
    if (sub) T(s, sub, x + 0.06, y + 0.24, w - 0.12, h - 0.28, { size: 6.4, color: MUT, align: 'center' })
  }
  // column 1: inputs
  bb(0.35, 1.0, 1.75, 0.55, '[INPUT] NASA FIRMS', 'VIIRS 375 m · MODIS 1 km', BLUE2, 7.5)
  ARROW(s, 1.22, 1.55, 0, 0.22)
  bb(0.35, 1.8, 1.75, 1.35, '[DATA INGESTION]', '', BLUE2, 7.5)
  R(s, 0.45, 2.08, 1.55, 0.36, SOFT, { line: BLUE2, lw: 1, r: 0.1 })
  T(s, 'Area API · 10-day chunks', 0.48, 2.12, 1.49, 0.28, { size: 6, color: INK, align: 'center' })
  ARROW(s, 1.22, 2.46, 0, 0.16)
  R(s, 0.45, 2.64, 1.55, 0.42, SOFT, { line: BLUE2, lw: 1, r: 0.1 })
  T(s, 'Normalise VIIRS + MODIS\nde-duplicate passes', 0.48, 2.68, 1.49, 0.34, { size: 6, color: INK, align: 'center' })
  ARROW(s, 1.22, 3.15, 0, 0.2)
  bb(0.35, 3.38, 1.75, 1.6, 'CONTEXT LAYERS', '', BLUE2, 7.5)
  ;['OSM facilities (Overpass)', 'Land-cover polygons', 'Sentinel-2 / Worldview links'].forEach((t, i) => {
    R(s, 0.45, 3.66 + i * 0.42, 1.55, 0.34, SOFT, { line: BLUE2, lw: 1, r: 0.16 })
    T(s, t, 0.48, 3.72 + i * 0.42, 1.49, 0.24, { size: 6, color: INK, align: 'center' })
  })
  ARROW(s, 2.1, 1.28, 0.28, 0)
  // column 2: core
  bb(2.4, 1.0, 2.05, 0.62, '', '', BLUE2)
  ;['Cluster', 'Persist', 'Score'].forEach((t, i) => {
    R(s, 2.47 + i * 0.65, 1.07, 0.6, 0.48, SOFT, { line: BLUE2, lw: 1, r: 0.06 })
    T(s, t, 2.47 + i * 0.65, 1.07, 0.6, 0.48, { size: 6.5, bold: true, color: INK, align: 'center', valign: 'middle' })
  })
  ARROW(s, 3.42, 1.62, 0, 0.22)
  bb(2.4, 1.87, 2.05, 1.12, '[CORE PROCESSING]', '', BLUE2, 8)
  R(s, 2.5, 2.16, 1.85, 0.75, SOFT, { line: BLUE2, lw: 1, r: 0.06 })
  T(s, 'DBSCAN 750 m → thermal sources\n90-day stats: active days, span,\nnight %, FRP μ / CV / z-score\n→ persistence score', 2.53, 2.2, 1.79, 0.68, { size: 6.2, color: INK, align: 'center' })
  ARROW(s, 3.42, 2.99, 0, 0.2)
  bb(2.4, 3.22, 2.05, 0.85, '[FEATURE MATRIX]', '34 features: radiometry · persistence ·\nOSM context · land cover · season priors', BLUE2, 8)
  ARROW(s, 3.42, 4.07, 0, 0.18)
  bb(2.4, 4.27, 2.05, 0.62, '[VALIDATION]', 'group-aware split · analyst override → retrain', BLUE2, 8)
  ARROW(s, 4.45, 1.28, 0.25, 0)
  // column 3: AI + outputs
  bb(4.72, 1.0, 1.85, 0.72, '[STAGE 2A] RULE ENGINE', 'persistent ∧ night ≥60 % ∧ steady FRP\n→ GAS FLARE  (auditable priors)', BLUE2, 7.5)
  ARROW(s, 5.64, 1.72, 0, 0.16)
  bb(4.72, 1.9, 1.85, 0.66, '[STAGE 2B] GBM MODEL', 'HistGradientBoosting · 6 classes\nprobability ≥ 0.55 wins', BLUE2, 7.5)
  ARROW(s, 5.64, 2.56, 0, 0.16)
  bb(4.72, 2.74, 1.85, 0.84, '[STAGE 3: AI / ML OUTPUT]', 'class · confidence · reasons\nindustrial · flare · mining ·\nagri · wildfire · other', BLUE2, 7.5)
  ARROW(s, 5.64, 3.58, 0, 0.16)
  bb(4.72, 3.76, 1.85, 0.62, '⚠ ANOMALY ALERT', 'FRP ≥ 2.5 μ and z ≥ 3\n→ incident candidate', RED, 7.5)
  ARROW(s, 5.64, 4.38, 0, 0.16)
  bb(4.72, 4.56, 1.85, 0.5, '[STAGE 5] GIS SERVE', 'GeoJSON API · dashboard · QGIS', TEAL, 7.5)

  // right: tech stack tag
  R(s, 6.85, 0.85, 3.0, 2.72, 'DDE4F2', { line: 'B9C6E0', lw: 1, r: 0.03 })
  T(s, '[TECH STACK TAG]', 6.85, 0.88, 3.0, 0.26, { size: 11, bold: true, color: INK, align: 'center' })
  const stack = [['DATA INGESTION & GEOSPATIAL', ['NASA FIRMS Area API (VIIRS/MODIS)', 'OpenStreetMap Overpass · shapely STRtree']],
    ['BACKEND & DATABASE', ['Python 3 · FastAPI (GeoJSON REST)', 'SQLite → PostGIS-ready schema']],
    ['FRONTEND & GIS INTERFACE', ['React 18 + Vite · Leaflet canvas (40 k+ pts)', 'QGIS / ArcGIS export · GitHub Pages demo']],
    ['INTELLIGENCE & MODELING', ['scikit-learn: DBSCAN, HistGradientBoosting', 'Rule engine + FRP-anomaly detector']]]
  stack.forEach(([h, items], i) => {
    const y = 1.18 + i * 0.6
    T(s, '[' + h + ']', 6.95, y, 2.8, 0.18, { size: 7.6, bold: true, color: INK })
    items.forEach((it, j) => {
      T(s, '• ' + it, 6.98, y + 0.2 + j * 0.17, 2.78, 0.17, { size: 6.4, color: '243044' })
      RECT(s, 6.98, y + 0.36 + j * 0.17, 2.72, 0.006, '9AA8C4')
    })
  })
  // metric cards
  const cards = [['🗄️', '[Dataset Metric]', '22,179 detections', 'classified in ~7 s', BLUE2],
    ['🕒', '[Temporal Metric]', '90-day window', 'rolling baseline per source', PURP],
    ['📍', '[Spatial Metric]', '750 m / 1.5 km', 'cluster radius · facility match', PURP],
    ['📋', '[Review Metric]', '138 alerts', 'analyst verification step', PURP]]
  cards.forEach(([ic, tag, big, desc, c], i) => {
    const x = 6.85 + (i % 2) * 1.55, y = 3.66 + Math.floor(i / 2) * 0.8
    R(s, x, y, 1.45, 0.72, WHITE, { line: c, lw: 1.5, r: 0.04 })
    s.addText(ic, { x: x + 0.04, y: y + 0.04, w: 0.26, h: 0.26, fontFace: EMOJI, fontSize: 11, align: 'center', valign: 'middle', margin: 0, isTextBox: true })
    T(s, tag, x + 0.32, y + 0.04, 1.1, 0.26, { size: 6.2, bold: true, color: INK })
    T(s, big, x + 0.06, y + 0.31, 1.33, 0.18, { size: 8, bold: true, color: INK })
    T(s, desc, x + 0.06, y + 0.49, 1.33, 0.2, { size: 6, color: MUT })
  })
}

// ================================================================== 4. FEASIBILITY AND VIABILITY
{
  const s = pres.addSlide()
  head(s, 'FEASIBILITY AND VIABILITY')
  R(s, 0.18, 0.85, 6.55, 4.35, WHITE, { line: '8A8A8A', lw: 1, r: 0.03 })
  const quad = [
    ['[TECHNICAL FEASIBILITY]', 0.32, 0.98, ['NASA FIRMS (free MAP_KEY)', 'OSM / Overpass context', 'Sentinel-2 & NASA Worldview', 'Software-only · one VM', 'Incremental 10-day ingest'], '✓'],
    ['[OPERATIONAL VIABILITY]', 3.42, 0.98, ['Disaster-management fit', 'Analyst confirm / override', 'Alert prioritisation (0.6 %)', 'GIS investigation workflow', 'Human-in-the-loop verification'], '✓'],
    ['[CHALLENGES & MITIGATION]', 0.32, 2.62, ['Thermal ≠ fire → persistence + context', 'Persistent heat → own-baseline alerts', 'Cloud / data gaps → 90-day, 3 satellites', 'Few ML labels → rules prior + feedback'], '•'],
    ['[SCALABILITY & COST]', 3.42, 2.62, ['Open data — ₹0 licences', 'Software-first, Docker-ready', 'Incremental processing', 'Multi-region / national potential', 'Modular, PostGIS-ready'], '•'],
  ]
  quad.forEach(([title, x, y, items, mark]) => {
    R(s, x, y, 3.0, 1.5, CARD, { line: '9A9A9A', lw: 1.25, r: 0.06 })
    T(s, title, x + 0.1, y + 0.07, 2.8, 0.24, { size: 10.5, bold: true, color: BLACK })
    bl(s, items.map((t) => (mark === '✓' ? '✓  ' : '') + t), x + 0.12, y + 0.35, 2.76, 1.1, 7.8, 2.5, INK, mark !== '✓')
  })
  // stats strip
  const stats = [['22,179', 'DETECTIONS'], ['90 DAYS', 'BASELINE'], ['1.5 KM', 'OSM CONTEXT'], ['HUMAN-LOOP', 'VERIFICATION']]
  stats.forEach(([a, b], i) => {
    const x = 0.32 + i * 1.56
    T(s, a, x, 4.24, 1.5, 0.24, { size: 11, bold: true, color: BLACK, align: 'center' })
    T(s, b, x, 4.48, 1.5, 0.2, { size: 8.5, color: '3A3A3A', align: 'center' })
  })
  T(s, 'Prototype runs today: whole 90-day archive classified in ~7 s on a laptop · public demo on GitHub Pages · one env variable switches to live NASA FIRMS.',
    0.32, 4.78, 6.2, 0.36, { size: 7.4, italic: true, color: MUT, align: 'center' })

  // right tag panel
  R(s, 6.85, 0.85, 3.0, 2.72, 'DDE4F2', { line: 'B9C6E0', lw: 1, r: 0.03 })
  T(s, '[FEASIBILITY & VIABILITY TAG]', 6.85, 0.88, 3.0, 0.24, { size: 9.5, bold: true, color: INK, align: 'center' })
  const tags = [['Feasibility key points', ['All data free & open; no procurement', 'End-to-end prototype already working']],
    ['Viability key points', ['₹0 data cost; ~₹3–5 k/month single VM', 'GeoJSON plugs into NTRO / Bhuvan GIS']],
    ['Risk & Challenges', ['Simulated archive is cleaner than reality', 'OSM gaps; clouds; false alarms']],
    ['Mitigation & Future Work', ['Validate on documented incidents; retrain', 'Sentinel-2 chip CNN; ESA WorldCover']]]
  tags.forEach(([h, items], i) => {
    const y = 1.16 + i * 0.6
    T(s, '[' + h + ']', 6.95, y, 2.8, 0.18, { size: 7.6, bold: true, color: INK })
    items.forEach((it, j) => {
      T(s, '• ' + it, 6.98, y + 0.2 + j * 0.17, 2.78, 0.17, { size: 6.4, color: '243044' })
      RECT(s, 6.98, y + 0.36 + j * 0.17, 2.72, 0.006, '9AA8C4')
    })
  })
  const cards = [['🗄️', '[Critical Risk Highlight]', 'Thermal ≠ fire', 'persistence + OSM context resolve it', BLUE2],
    ['⚙️', '[Operational Viability]', '~7 s / 90 days', 'seconds of compute per national run', PURP],
    ['📈', '[Scalability Factor]', 'India-wide', 'around-cell OSM queries + cache', PURP],
    ['💰', '[Cost Optimization]', '₹0 data', 'open sources; one VM deployment', PURP]]
  cards.forEach(([ic, tag, big, desc, c], i) => {
    const x = 6.85 + (i % 2) * 1.55, y = 3.66 + Math.floor(i / 2) * 0.8
    R(s, x, y, 1.45, 0.72, WHITE, { line: c, lw: 1.5, r: 0.04 })
    s.addText(ic, { x: x + 0.04, y: y + 0.04, w: 0.26, h: 0.26, fontFace: EMOJI, fontSize: 11, align: 'center', valign: 'middle', margin: 0, isTextBox: true })
    T(s, tag, x + 0.32, y + 0.03, 1.1, 0.28, { size: 6, bold: true, color: INK })
    T(s, big, x + 0.06, y + 0.32, 1.33, 0.18, { size: 8, bold: true, color: INK })
    T(s, desc, x + 0.06, y + 0.5, 1.33, 0.2, { size: 5.8, color: MUT })
  })
}

// ================================================================== 5. IMPACT & BENEFITS (console style)
{
  const s = pres.addSlide()
  head(s, 'IMPACT AND BENEFITS')
  R(s, 0.18, 0.85, 9.64, 4.35, 'F4F4F5', { line: 'D4D4D8', lw: 1, r: 0.06 })
  const frame = (x, y, w, h) => {
    // ascii-style frame corners
    RECT(s, x, y, w, 0.012, '3F3F46'); RECT(s, x, y + h, w, 0.012, '3F3F46')
    RECT(s, x, y, 0.012, h, '3F3F46'); RECT(s, x + w, y, 0.012, h, '3F3F46')
  }
  frame(0.42, 1.0, 9.16, 1.55)
  RECT(s, 5.0, 1.0, 0.012, 1.55, '3F3F46')
  T(s, 'WHO BENEFITS', 0.5, 1.06, 4.4, 0.24, { font: MONO, size: 11, color: INK, align: 'center' })
  T(s, 'BEFORE  →  THERMALSENTINEL', 5.1, 1.06, 4.4, 0.24, { font: MONO, size: 11, color: INK, align: 'center' })
  const who = [['🏭', 'Industrial safety & plant operators'], ['🚨', 'NDMA / SDMA · fire services'], ['🛰️', 'NTRO & geospatial analysts'], ['🏛️', 'CPCB / MoEFCC · state boards'], ['🌱', 'Environment & climate reporting']]
  who.forEach(([ic, t], i) => {
    s.addText(ic, { x: 0.62, y: 1.38 + i * 0.22, w: 0.24, h: 0.2, fontFace: EMOJI, fontSize: 9, margin: 0, isTextBox: true })
    T(s, t, 0.92, 1.38 + i * 0.22, 3.9, 0.2, { font: MONO, size: 8.5, color: INK })
  })
  const before = [['Thermal points', 'Classified context'], ['Manual screening', 'Ranked priority'], ['Limited context', 'OSM + imagery evidence'], ['Unclear priority', 'Baseline-relative risk'], ['Observation only', 'Verifiable record']]
  before.forEach(([a, b], i) => {
    T(s, a, 5.15, 1.38 + i * 0.22, 1.9, 0.2, { font: MONO, size: 8.5, color: MUT, align: 'right' })
    T(s, '→', 7.12, 1.38 + i * 0.22, 0.22, 0.2, { font: MONO, size: 8.5, color: ORANGE, align: 'center' })
    T(s, b, 7.4, 1.38 + i * 0.22, 2.1, 0.2, { font: MONO, size: 8.5, bold: true, color: INK })
  })

  frame(0.42, 2.7, 9.16, 1.46)
  T(s, 'KEY IMPACTS', 0.42, 2.76, 9.16, 0.24, { font: MONO, size: 11, color: INK, align: 'center' })
  const impacts = [['🛡️', 'SAFETY', '99 % fewer hotspots to triage — 138 of 22,179 reach an operator'],
    ['🌱', 'ENVIRONMENT', 'Stubble burning separated from industrial emissions & flaring'],
    ['🚨', 'RESPONSE', 'Abnormal industrial heat flagged with facility name and FRP evidence'],
    ['⚙️', 'OPS', 'Explainable labels; analyst override feeds back into the model']]
  impacts.forEach(([ic, t, d], i) => {
    const x = 0.55 + i * 2.28
    s.addText(ic, { x, y: 3.02, w: 0.26, h: 0.24, fontFace: EMOJI, fontSize: 11, margin: 0, isTextBox: true })
    T(s, t, x + 0.3, 3.02, 1.8, 0.24, { font: MONO, size: 9.5, bold: true, color: INK })
    T(s, d, x, 3.3, 2.1, 0.5, { font: MONO, size: 7.2, color: MUT })
  })
  // evidence line inside the KEY IMPACTS panel
  T(s, 'EVIDENCE  |  22,179 detections classified in ~7 s  ·  114 persistent sources  ·  138 incident candidates  ·  hybrid 99.9 % vs rules-only 98.4 %',
    0.55, 3.72, 8.9, 0.2, { font: MONO, size: 7.6, color: INK, align: 'center' })
  T(s, 'live GIS prototype: ' + DEMO, 0.55, 3.94, 8.9, 0.2, { font: MONO, size: 7.2, color: MUT, align: 'center' })

  frame(0.42, 4.35, 9.16, 0.75)
  T(s, 'THERMALSENTINEL VALUE CHAIN', 0.42, 4.4, 9.16, 0.22, { font: MONO, size: 10, color: INK, align: 'center' })
  T(s, 'DETECT  →  CLUSTER  →  CONTEXTUALIZE  →  CLASSIFY  →  BASELINE  →  ALERT  →  VERIFY',
    0.42, 4.72, 9.16, 0.26, { font: MONO, size: 10.5, bold: true, color: NAVY, align: 'center' })

}

// ================================================================== 6. RESEARCH FOUNDATIONS (dark)
{
  const s = pres.addSlide(); n++
  s.background = { color: DARK }
  // faint circuit grid
  for (let i = 0; i < 11; i++) RECT(s, 0, 0.5 * i, 10, 0.006, DGRID)
  for (let i = 0; i < 21; i++) RECT(s, 0.5 * i, 0, 0.006, 5.63, DGRID)
  s.addImage({ data: LOGO, x: 0.2, y: 0.12, w: 1.5, h: 0.7 })
  T(s, 'RESEARCH FOUNDATIONS & ACADEMIC REFERENCES', 1.72, 0.14, 8.1, 0.34, { size: 17, bold: true, color: WHITE, align: 'center' })
  T(s, 'Core Academic Studies & Validated Data — ThermalSentinel (SIH26162)', 1.72, 0.5, 8.1, 0.24, { size: 10, color: NEON, align: 'center' })

  const panel = (x, y, w, h, num, title) => {
    R(s, x, y, w, h, DARK2, { line: NEON, lw: 1.25, r: 0.04 })
    RECT(s, x + 0.08, y + 0.07, 0.42, 0.28, '10352A')
    T(s, num, x + 0.08, y + 0.07, 0.42, 0.28, { size: 12, bold: true, color: WHITE, align: 'center', valign: 'middle' })
    RECT(s, x + 0.56, y + 0.09, 0.012, 0.24, NEON)
    T(s, title, x + 0.64, y + 0.07, w - 0.7, 0.28, { size: 10.5, bold: true, color: WHITE, valign: 'middle' })
  }
  panel(0.25, 0.95, 4.72, 1.5, '01', 'FOUNDATIONAL ACADEMIC RESEARCH')
  const refs1 = [['Schroeder, W. et al. (2014)', 'The New VIIRS 375 m active fire detection data product — Remote Sensing of Environment 143, 85–96', 'doi.org/10.1016/j.rse.2013.12.008'],
    ['Elvidge, C. D. et al. (2013)', 'VIIRS Nightfire: satellite pyrometry at night — Remote Sensing 5(9) — basis for gas-flare signatures', 'doi.org/10.3390/rs5094423'],
    ['Ester, M. et al. (1996)', 'DBSCAN density-based clustering (KDD-96) — source grouping method', 'scikit-learn.org']]
  refs1.forEach(([a, t, l], i) => {
    const y = 1.32 + i * 0.36
    T(s, '●', 0.36, y, 0.14, 0.16, { size: 7, color: NEON })
    s.addText([{ text: a + ' | ', options: { bold: true, color: WHITE } }, { text: t + '  ', options: { color: 'C9D8D2' } }, { text: l, options: { color: NEON2, underline: true } }],
      { x: 0.52, y, w: 4.35, h: 0.34, fontFace: SANS, fontSize: 6.6, valign: 'top', margin: 0, isTextBox: true })
  })
  panel(5.05, 0.95, 4.72, 1.5, '02', 'APPLIED STUDIES & METHODOLOGIES')
  const refs2 = [['Liu, Y. et al. (2018)', 'Identifying industrial heat sources from VIIRS Nightfire time-series — Remote Sensing of Environment 204', 'sciencedirect.com'],
    ['ICAR-IARI CREAMS / CPCB', 'Crop-residue burning bulletins — Oct–Nov & Apr–May seasonality used as a classifier prior', 'creams.iari.res.in'],
    ['NTRO PS SIH26162', 'Segregate industrial fires from forest & natural fires; GIS storage and map-overlay visualisation', 'sih.gov.in']]
  refs2.forEach(([a, t, l], i) => {
    const y = 1.32 + i * 0.36
    T(s, '●', 5.16, y, 0.14, 0.16, { size: 7, color: NEON })
    s.addText([{ text: a + ' | ', options: { bold: true, color: WHITE } }, { text: t + '  ', options: { color: 'C9D8D2' } }, { text: l, options: { color: NEON2, underline: true } }],
      { x: 5.32, y, w: 4.35, h: 0.34, fontFace: SANS, fontSize: 6.6, valign: 'top', margin: 0, isTextBox: true })
  })
  panel(0.25, 2.55, 9.52, 1.12, '03', 'DATA SOURCES & APIs')
  const ds = [['NASA FIRMS Area API', 'VIIRS 375 m (S-NPP / NOAA-20 / 21) + MODIS 1 km · NRT ≤ 3 h and archive', 'firms.modaps.eosdis.nasa.gov'],
    ['OpenStreetMap Overpass', 'industrial=* · man_made=flare|works · power=plant · landuse=quarry|farmland|forest', 'wiki.openstreetmap.org'],
    ['Copernicus Sentinel-2 / Worldview', 'SWIR B11/B12 chips for visual verification; ESA WorldCover 10 m land cover', 'dataspace.copernicus.eu']]
  ds.forEach(([a, t, l], i) => {
    const x = 0.4 + i * 3.15
    T(s, a, x, 2.92, 3.0, 0.2, { size: 8.5, bold: true, color: WHITE })
    T(s, t, x, 3.12, 3.0, 0.32, { size: 6.3, color: 'C9D8D2' })
    T(s, l, x, 3.44, 3.0, 0.16, { size: 6.3, color: NEON2, underline: true })
  })
  R(s, 0.25, 3.77, 9.52, 1.42, DARK2, { line: NEON, lw: 1.25, r: 0.04 })
  T(s, 'CORE PROJECT RESEARCH INSIGHT', 0.42, 3.85, 4.3, 0.26, { size: 11, bold: true, color: WHITE })
  T(s, 'State-of-the-art systems detect raw thermal anomalies — FIRMS publishes the pixel, not its meaning. ThermalSentinel adds the interpretation layer: it groups pixels into sources, learns each source\'s normal, fuses OSM infrastructure and land cover, and raises an alert only when a known industrial site burns abnormally.',
    0.42, 4.1, 4.3, 0.8, { size: 7.4, color: 'C9D8D2' })
  T(s, 'Validated on a labelled 90-day archive: ' + fmt(M.totals[0]) + ' detections · ' + M.n_sources + ' persistent sources · ' + M.totals[2] + ' incident candidates · hybrid ' + (M.acc * 100).toFixed(1) + ' % vs rules-only ' + (M.rules * 100).toFixed(1) + ' % (group-aware split).',
    0.42, 4.9, 9.1, 0.22, { size: 7, italic: true, color: NEON2 })
  const chain = ['OBSERVE', 'CONTEXTUALIZE', 'CLASSIFY', 'BASELINE', 'PRIORITIZE', 'VERIFY']
  chain.forEach((t, i) => {
    const x = 4.92 + i * 0.8
    s.addShape(pres.shapes.HEXAGON, { x, y: 4.2, w: 0.78, h: 0.5, fill: { color: DARK }, line: { color: NEON, width: 1 } })
    T(s, t, x, 4.2, 0.78, 0.5, { size: 5.4, bold: true, color: WHITE, align: 'center', valign: 'middle' })
    if (i < 5) ARROW(s, x + 0.755, 4.45, 0.04, 0, NEON)
  })
  s.addText([{ text: 'Working prototype: ', options: { bold: true, color: WHITE } }, { text: DEMO, options: { hyperlink: { url: DEMO }, color: NEON2, underline: true } },
    { text: '    Source: ', options: { bold: true, color: WHITE } }, { text: REPO, options: { hyperlink: { url: REPO }, color: NEON2, underline: true } }],
    { x: 0.25, y: 5.22, w: 9.52, h: 0.3, fontFace: SANS, fontSize: 8, align: 'center', valign: 'middle', margin: 0, isTextBox: true })
}

const out = path.join(__dirname, 'FireOrbit_SIH26162_ThermalSentinel_YFormat.pptx')
pres.writeFile({ fileName: out }).then(() => console.log('wrote', out, `(${n} slides)`))
