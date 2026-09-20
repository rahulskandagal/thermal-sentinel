// Team Fire Orbit — SIH 2026 idea deck in the infographic style of the reference (Lanezy) deck,
// on the official SIH template chrome. Run: node build_fireorbit.js → FireOrbit_SIH26162_ThermalSentinel.pptx
const pptxgen = require('pptxgenjs')
const fs = require('fs')
const path = require('path')

const M = JSON.parse(fs.readFileSync(path.join(__dirname, 'metrics.json'), 'utf8'))
const img = (f) => 'image/png;base64,' + fs.readFileSync(path.join(__dirname, f)).toString('base64')
const LOGO = img('template_assets/sih_logo.png'), BRAIN = img('template_assets/brain_bulb.png')
const DASH = img('dashboard.png'), DETAIL = img('dashboard_detail.png'), PUNJAB = img('ui_punjab.png'), JHARIA = img('ui_jharia.png')

const TEAM = 'Fire Orbit', TEAM_ID = ''
const DEMO = 'https://rahulskandagal.github.io/thermal-sentinel/', REPO = 'https://github.com/rahulskandagal/thermal-sentinel'

// palette (reference look)
const NAVY = '1F3864', FOOT = '0070C0', WHITE = 'FFFFFF', BLACK = '000000', INK = '1F2937', MUTED = '6B7280'
const DARKBOX = '3A3A3A', YEL = 'F2C94C', REDP = 'E53935', GRNP = '43A047', TAN = 'B08D57', GREY = '7A7A7A', HEXC = 'C9A97C'
const ORANGE = 'E8590C', BLUE = '1D4ED8', GREEN = '15803D', RED = 'B91C1C', PURPLE = '6D28D9', TEAL = '0F766E', MAROON = '7B2D26', OLIVE = '6B7A1E', BROWN = '8B5A2B'
const SERIF = 'Times New Roman', SANS = 'Arial', EMOJI = 'Segoe UI Emoji'

const pres = new pptxgen()
pres.layout = 'LAYOUT_16x9'
pres.title = 'Fire Orbit — SIH26162 ThermalSentinel'

let n = 0
function chrome(s, heading, size = 26) {
  n++
  s.background = { color: WHITE }
  s.addShape(pres.shapes.OVAL, { x: 0.2, y: 0.12, w: 1.15, h: 0.62, fill: { color: WHITE }, line: { color: NAVY, width: 1.5 } })
  s.addText(TEAM, { x: 0.2, y: 0.12, w: 1.15, h: 0.62, fontFace: SANS, fontSize: 11, color: NAVY, align: 'center', valign: 'middle', margin: 0, isTextBox: true })
  s.addText(heading, { x: 1.45, y: 0.1, w: 6.4, h: 0.7, fontFace: SERIF, fontSize: size, bold: true, color: NAVY, align: 'center', valign: 'middle', margin: 0, isTextBox: true })
  s.addImage({ data: LOGO, x: 7.95, y: 0.05, w: 1.85, h: 0.87 })
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.3, w: 10, h: 0.325, fill: { color: FOOT }, line: { color: FOOT, width: 0 } })
  s.addText('@SIH Idea submission- Template', { x: 0, y: 5.3, w: 10, h: 0.325, fontFace: SANS, fontSize: 9, color: WHITE, align: 'center', valign: 'middle', margin: 0, isTextBox: true })
  s.addText(String(n), { x: 8.8, y: 5.3, w: 0.9, h: 0.325, fontFace: SANS, fontSize: 9, bold: true, color: WHITE, align: 'right', valign: 'middle', margin: 0, isTextBox: true })
}
const T = (s, t, x, y, w, h, o = {}) => s.addText(t, { x, y, w, h, fontFace: o.font || SANS, fontSize: o.size || 9, color: o.color || INK, bold: !!o.bold, italic: !!o.italic, underline: !!o.underline, align: o.align || 'left', valign: o.valign || 'top', margin: 0, isTextBox: true, ...(o.extra || {}) })
const R = (s, x, y, w, h, fill, o = {}) => s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, fill: { color: fill }, line: { color: o.line || fill, width: o.lw ?? 0 }, rectRadius: o.r ?? 0.08, shadow: o.shadow ? { type: 'outer', color: '000000', blur: 4, offset: 2, angle: 45, opacity: 0.35 } : undefined })
const C = (s, x, y, d, fill, o = {}) => s.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: fill }, line: { color: o.line || fill, width: o.lw ?? 0, dashType: o.dash } })
const E = (s, glyph, x, y, d, size) => s.addText(glyph, { x, y, w: d, h: d, fontFace: EMOJI, fontSize: size, align: 'center', valign: 'middle', margin: 0, isTextBox: true })
function cloud(s, x, y, w, h, label, links) {
  s.addShape(pres.shapes.CLOUD, { x, y, w, h, fill: { color: WHITE }, line: { color: BLACK, width: 2 } })
  s.addText(links.map((l, i) => ({ text: l.text, options: { hyperlink: { url: l.url }, color: '1A0DAB', underline: true, bold: true, breakLine: i < links.length - 1 } })),
    { x: x + w * 0.18, y: y + h * 0.22, w: w * 0.64, h: h * 0.56, fontFace: SANS, fontSize: 11, align: 'center', valign: 'middle', margin: 0, isTextBox: true })
  if (label) T(s, label, x + w + 0.05, y + h * 0.25, 1.3, 0.3, { size: 11, bold: true, color: BLACK })
}
// callout with underlined yellow label (reference style)
function callout(s, x, y, w, h, label, body) {
  R(s, x + 0.05, y + 0.05, w, h, '1A1A1A', { r: 0.12 })
  R(s, x, y, w, h, DARKBOX, { r: 0.12 })
  s.addText([{ text: label + ' ', options: { color: YEL, underline: true, bold: true } }, { text: body, options: { color: WHITE, bold: true } }],
    { x: x + 0.12, y: y + 0.06, w: w - 0.24, h: h - 0.12, fontFace: SERIF, fontSize: 10, valign: 'middle', margin: 0, isTextBox: true })
}
const fmt = (v) => v.toLocaleString('en-IN')

// ================================================================== 1. TITLE PAGE
{
  const s = pres.addSlide(); n++
  s.background = { color: WHITE }
  s.addImage({ data: BRAIN, x: 5.68, y: 0.94, w: 4.32, h: 4.04 })
  s.addImage({ data: LOGO, x: 7.95, y: 0.05, w: 1.85, h: 0.87 })
  T(s, 'SMART INDIA HACKATHON 2026', 0.5, 0.15, 7.4, 0.6, { font: SERIF, size: 28, bold: true, color: NAVY, align: 'center', valign: 'middle' })
  const rows = [['Problem Statement ID – ', 'SIH26162'],
    ['Problem Statement Title- ', 'AI-Based Detection and Classification of Industrial Fires and Persistent Thermal Sources Using NASA FIRMS, OSM & Satellite Data'],
    ['Theme- ', 'Disaster Management'], ['PS Category- ', 'Software'], ['Team ID- ', TEAM_ID], ['Team Name (Registered on portal) - ', TEAM]]
  const runs = []
  rows.forEach(([k, v], i) => { runs.push({ text: k, options: { bullet: true, bold: true } }); runs.push({ text: v, options: { bold: true, breakLine: i < rows.length - 1 } }) })
  s.addText(runs.map((r) => ({ ...r, options: { ...r.options, paraSpaceAfter: 10 } })), { x: 0.3, y: 1.35, w: 5.6, h: 3.7, fontFace: SERIF, fontSize: 13.5, color: BLACK, valign: 'top', margin: 0, isTextBox: true })
  T(s, '1', 9.2, 5.05, 0.5, 0.3, { size: 10, color: MUTED, align: 'right' })
}

// ================================================================== 2. IDEA / PROPOSED SOLUTION
{
  const s = pres.addSlide()
  chrome(s, 'ThermalSentinel: AI That Knows What Is Burning —\nand Whether It Should Be', 17)

  // left callouts
  callout(s, 0.2, 0.98, 3.05, 1.08, 'Real-world issue:', 'NASA FIRMS reports thousands of hot pixels over India every day — a refinery flare, a steel plant, a coal-seam fire, a stubble burn and a forest fire all look identical.')
  callout(s, 0.2, 2.14, 3.05, 1.0, 'Why important:', 'A genuine plant fire hides among routine industrial heat; responders cannot prioritise, and no registry of persistent thermal sources exists for security agencies.')
  callout(s, 0.2, 3.22, 3.05, 1.0, 'Solution:', 'AI classifies every hotspot into 6 classes, tracks each source for 90 days and alerts only when a known site burns far above its own normal.')
  cloud(s, 0.15, 4.3, 1.75, 0.95, null, [{ text: 'Live Demo', url: DEMO }, { text: 'GitHub', url: REPO }])
  T(s, 'Prototype', 2.05, 4.32, 1.2, 0.28, { size: 12, bold: true, color: BLACK })
  s.addShape(pres.shapes.LINE, { x: 1.95, y: 4.62, w: 0.55, h: 0.12, flipV: true, line: { color: BLACK, width: 2, endArrowType: 'triangle' } })
  T(s, 'working today — click to open', 2.05, 4.78, 1.25, 0.4, { size: 8, italic: true, color: INK })

  // centre: stepped pyramid inside a faint triangle
  s.addShape(pres.shapes.ISOSCELES_TRIANGLE, { x: 3.4, y: 0.98, w: 3.5, h: 4.27, fill: { color: 'FFF3E0' }, line: { color: 'F59E0B', width: 3, dashType: 'dash' } })
  const tiers = [
    ['CORE INNOVATION', '🔔 Baseline-relative incident alerts\nFRP ≥ 2.5× site normal & z ≥ 3', NAVY, 1.35, 0.9],
    ['PRIMARY FUNCTIONS', '🤖 6-class AI classification   |   📒 Persistent-source registry (90-day)', '1E5AA8', 2.2, 0.85],
    ['CONTEXT & EVIDENCE', '🏭 OSM facilities  ·  🌾 Land cover  ·  🛰️ Sentinel-2 verification  ·  📅 India burn seasons', '2E7D32', 2.85, 0.85],
    ['MONITORING & OUTPUT', '🗺️ GIS dashboard  ·  🔗 GeoJSON API  ·  🔔 Webhook / SMS alerts  ·  👤 Analyst loop  ·  📤 QGIS export', '1B6EA8', 3.42, 0.9],
  ]
  // seat the tiers on the triangle base (bottom-up)
  const geo = [[3.4, 0.8], [2.8, 0.72], [2.15, 0.72], [1.5, 0.72]]
  let by = 5.2
  const placed = []
  geo.forEach(([w, hh]) => { by -= hh; placed.push([w, hh, by]); by -= 0.08 })
  placed.reverse().forEach(([w, hh, y], i) => {
    const [h, d, c] = tiers[i]
    const x = 5.15 - w / 2
    R(s, x, y, w, hh, c, { r: 0.06 })
    T(s, h, x, y + 0.04, w, 0.18, { size: 7.5, bold: true, color: 'FFE082', align: 'center' })
    T(s, d, x + 0.05, y + 0.22, w - 0.1, hh - 0.26, { size: 7, color: WHITE, align: 'center', valign: 'middle', font: SANS })
  })
  E(s, '🔥', 4.9, 1.2, 0.5, 18)

  // right: risk ↔ solution
  T(s, 'Risk', 7.05, 0.98, 1.2, 0.28, { size: 13, bold: true, color: ORANGE, align: 'center' })
  T(s, 'v', 8.25, 1.0, 0.3, 0.25, { size: 10, bold: true, color: MUTED, align: 'center' })
  T(s, 'Solution', 8.55, 0.98, 1.2, 0.28, { size: 13, bold: true, color: GREEN, align: 'center' })
  const pairs = [['Identical hotspots, no meaning', '6-class AI: industrial · flare · mine · crop · wildfire'],
    ['Real fires hidden in routine heat', 'Alert only when FRP ≫ the site\'s own baseline'],
    ['No memory of persistent sources', '90-day source tracking & registry'],
    ['Black-box AI mistrusted', 'Every label carries plain reasons']]
  pairs.forEach(([a, b], i) => {
    const y = 1.32 + i * 0.7
    R(s, 7.0, y, 1.3, 0.5, REDP, { r: 0.1, shadow: true })
    T(s, a, 7.05, y, 1.2, 0.5, { size: 7.5, bold: true, color: WHITE, align: 'center', valign: 'middle', font: SERIF })
    s.addShape(pres.shapes.LEFT_RIGHT_ARROW, { x: 8.33, y: y + 0.13, w: 0.32, h: 0.24, fill: { color: 'F5D28A' }, line: { color: 'B8860B', width: 0.75 } })
    R(s, 8.68, y, 1.1, 0.5, GRNP, { r: 0.1, shadow: true })
    T(s, b, 8.72, y, 1.02, 0.5, { size: 7, bold: true, color: WHITE, align: 'center', valign: 'middle', font: SERIF })
  })
  s.addImage({ data: DASH, x: 7.0, y: 4.15, w: 2.78, h: 0.95, sizing: { type: 'crop', x: 0, y: 0.15, w: 2.78, h: 0.95 } })
  T(s, 'real prototype — GIS dashboard', 7.0, 5.1, 2.78, 0.16, { size: 6.5, italic: true, color: MUTED, align: 'right' })
}

// ================================================================== 3. TECHNICAL APPROACH
{
  const s = pres.addSlide()
  chrome(s, 'TECHNICAL APPROACH')
  // left: circular methodology
  T(s, 'METHODOLOGY & PROCESS OF\nIMPLEMENTATION', 0.2, 0.95, 3.4, 0.55, { size: 12.5, bold: true, color: MAROON, align: 'center' })
  const cx = 1.9, cy = 2.95, r = 0.72
  C(s, cx - r, cy - r, 2 * r, WHITE, { line: '9CA3AF', lw: 1.5, dash: 'dash' })
  const nodes = [['🛰️', 'Ingest', 'FIRMS data', BLUE, -90], ['🔗', 'Cluster', 'DBSCAN sources', ORANGE, -30], ['⏱️', 'Persist', '90-day baseline', PURPLE, 30],
    ['🗺️', 'Context', 'OSM + land use', GREEN, 90], ['🤖', 'Classify', 'rules + GBM', RED, 150], ['📡', 'Serve', 'GIS · alerts', TEAL, 210]]
  nodes.forEach(([g, t, d, c, deg]) => {
    const a = deg * Math.PI / 180, nx = cx + r * Math.cos(a), ny = cy + r * Math.sin(a)
    C(s, nx - 0.23, ny - 0.23, 0.46, c)
    E(s, g, nx - 0.23, ny - 0.23, 0.46, 13)
    const side = Math.cos(a) > 0.3 ? 'left' : Math.cos(a) < -0.3 ? 'right' : 'center'
    let bx, bw, ly
    if (side === 'left') { bx = nx + 0.3; bw = 3.6 - bx; ly = ny - 0.2 }
    else if (side === 'right') { bx = 0.2; bw = nx - 0.3 - 0.2; ly = ny - 0.2 }
    else { bx = nx - 0.7; bw = 1.4; ly = Math.sin(a) < 0 ? ny - 0.68 : ny + 0.27 }
    T(s, t, bx, ly, bw, 0.2, { size: 8.5, bold: true, color: c, align: side })
    T(s, d, bx, ly + 0.18, bw, 0.2, { size: 6.5, color: MUTED, align: side })
  })
  E(s, '🔥', cx - 0.3, cy - 0.3, 0.6, 22)
  cloud(s, 0.15, 4.42, 1.6, 0.83, null, [{ text: 'Report', url: REPO + '#readme' }, { text: 'GitHub', url: REPO }])
  T(s, 'Detailed\nReport', 2.35, 4.5, 1.2, 0.5, { size: 11, bold: true, color: BLACK })
  s.addShape(pres.shapes.LINE, { x: 1.8, y: 4.72, w: 0.5, h: 0.1, flipV: true, line: { color: BLACK, width: 2, endArrowType: 'triangle' } })

  // centre: data-flow diagram + real screenshot
  R(s, 3.75, 0.98, 3.1, 1.95, 'F8FAFC', { line: '1F2937', lw: 1.5, r: 0.03 })
  const flow = [['🛰️', 'VIIRS 375 m\nMODIS 1 km', BLUE], ['📥', 'NASA FIRMS API\n≤ 3 h latency', ORANGE], ['⚙️', 'ThermalSentinel\nengine', RED], ['🗺️', 'GIS · registry\n⚠ alerts', GREEN]]
  flow.forEach(([g, t, c], i) => {
    const x = 3.85 + i * 0.76
    C(s, x + 0.08, 1.1, 0.5, c)
    E(s, g, x + 0.08, 1.1, 0.5, 14)
    T(s, t, x - 0.06, 1.66, 0.8, 0.5, { size: 5.8, color: INK, align: 'center' })
    if (i < 3) s.addShape(pres.shapes.LINE, { x: x + 0.6, y: 1.35, w: 0.14, h: 0, line: { color: '6B7280', width: 1.5, endArrowType: 'triangle' } })
  })
  R(s, 3.85, 2.2, 2.9, 0.66, 'EFF6FF', { line: 'BFDBFE', lw: 0.75, r: 0.04 })
  s.addText([{ text: 'AI core: ', options: { bold: true, color: BLUE } }, { text: '34 features · haversine DBSCAN 750 m · per-source FRP μ/σ · OSM facility type + distance · land cover · India burn-season priors → explainable rules + gradient-boosted trees; anomaly when FRP ≥ 2.5 μ and z ≥ 3.', options: { color: INK } }],
    { x: 3.92, y: 2.2, w: 2.78, h: 0.66, fontFace: SANS, fontSize: 6.5, valign: 'middle', margin: 0, isTextBox: true })
  s.addImage({ data: DASH, x: 3.75, y: 3.05, w: 3.1, h: 1.74 })
  T(s, 'Working prototype: 22,179 detections · 114 persistent sources · 138 alerts · GeoJSON export', 3.75, 4.82, 3.1, 0.4, { size: 6.5, color: MUTED, italic: true, align: 'center' })

  // right: technologies used
  T(s, 'TECHNOLOGIES USED', 7.0, 0.95, 2.8, 0.35, { size: 13, bold: true, color: MAROON, align: 'center' })
  const tech = [['🛰️', 'Data', 'NASA FIRMS (VIIRS 375 m, MODIS), OpenStreetMap Overpass, Copernicus Sentinel-2, NASA Worldview', OLIVE],
    ['🤖', 'AI / ML', 'Python · scikit-learn (DBSCAN, HistGradientBoosting) · rule engine · shapely STRtree', BROWN],
    ['🗄️', 'Backend', 'FastAPI REST (GeoJSON) · SQLite → PostGIS · OGC-standard exports', MAROON],
    ['🗺️', 'Frontend', 'React 18 + Vite · Leaflet canvas renderer (40 k+ points) · deep-link views', PURPLE],
    ['☁️', 'Deployment', 'GitHub Pages demo · one Linux VM / NIC cloud / air-gapped server · Docker-ready', TEAL]]
  tech.forEach(([g, t, d, c], i) => {
    const y = 1.38 + i * 0.78
    R(s, 7.25, y, 2.55, 0.66, c, { r: 0.2, shadow: true })
    C(s, 6.98, y + 0.08, 0.5, WHITE, { line: c, lw: 1.5 })
    E(s, g, 6.98, y + 0.08, 0.5, 13)
    T(s, t, 7.55, y + 0.05, 2.2, 0.22, { size: 9.5, bold: true, color: 'FFE082' })
    T(s, d, 7.55, y + 0.27, 2.2, 0.38, { size: 6.5, color: WHITE })
  })
}

// ================================================================== 4. FEASIBILITY AND VIABILITY
{
  const s = pres.addSlide()
  chrome(s, 'FEASIBILITY AND VIABILITY')
  const cards = [
    ['FEASIBILITY ANALYSIS', TAN, '★★★★½', [['Working prototype:', '22 k detections classified in 7 s on a laptop; public demo live on GitHub Pages.'],
      ['Open data only:', 'FIRMS key issued instantly, OSM Overpass, Copernicus — ₹0 licences, no procurement.'],
      ['Light footprint:', 'FastAPI + SQLite + React on one VM, NIC cloud or an air-gapped NTRO server.'],
      ['Live in one switch:', 'one env variable moves the same pipeline from archive to near-real-time FIRMS.']]],
    ['VIABILITY', GREY, '✔', [['Proven signals:', 'persistence + OSM context + physics separate the classes — 99.9 % hybrid / 98.4 % rules on the labelled 90-day archive.'],
      ['Trusted by design:', 'every label shows reasons; analysts confirm or override and their labels retrain the model.'],
      ['Scales:', 'OSM queried only around hotspot cells; PostGIS + tiles path for national, multi-year archives.'],
      ['Risks handled:', 'OSM gaps → curated list + WorldCover; clouds → 90-day, 3-satellite window; false alarms → baseline-relative thresholds.']]],
    ['BUSINESS & DEPLOYMENT', TAN, '💼', [['Government:', 'SDMA control rooms, NTRO source registry, CPCB fire attribution — ≈ ₹3–5 k / month per deployment.'],
      ['Industry & insurers:', 'site-monitoring subscriptions and verified incident evidence for claims and compliance.'],
      ['Integration:', 'GeoJSON layers for Bhuvan / NDEM, QGIS, ArcGIS — no new GIS needed.'],
      ['Roadmap:', '4-week live pilot + validation on real incidents → finale: alerts, Sentinel-2 chip CNN → agency SOP.']]],
  ]
  cards.forEach(([h, fill, sym, items], i) => {
    const x = 0.25 + i * 3.2
    R(s, x + 0.04, 1.02, 3.05, 3.42, '5C4A32', { r: 0.03 })
    R(s, x, 0.98, 3.05, 3.42, fill, { r: 0.03 })
    // pin
    s.addShape(pres.shapes.LINE, { x: x + 2.72, y: 1.0, w: 0.12, h: 0.3, line: { color: '4B5563', width: 1.5 } })
    C(s, x + 2.66, 0.86, 0.24, i === 1 ? 'B91C1C' : 'DC2626', { line: '7F1D1D', lw: 0.75 })
    T(s, h, x + 0.1, 1.06, 2.85, 0.3, { size: 12.5, bold: true, color: WHITE, align: 'center', font: SERIF })
    T(s, sym, x + 0.1, 1.36, 2.85, 0.3, { size: sym.length > 2 ? 14 : 18, bold: true, color: 'FFF3C4', align: 'center', font: sym === '💼' ? EMOJI : SANS })
    let y = 1.72
    items.forEach(([k, v]) => {
      s.addText([{ text: k + ' ', options: { bold: true, underline: true, color: 'FFF7E6' } }, { text: v, options: { bold: true, color: WHITE } }],
        { x: x + 0.14, y, w: 2.78, h: 0.64, fontFace: SERIF, fontSize: 9, valign: 'top', margin: 0, isTextBox: true })
      y += 0.68
    })
  })
  // orbit / roadmap strip
  R(s, 0.25, 4.5, 9.5, 0.72, '0F172A', { r: 0.04 })
  s.addShape(pres.shapes.LINE, { x: 0.7, y: 4.86, w: 8.6, h: 0, line: { color: '64748B', width: 1, dashType: 'dash' } })
  const ms = [['✔ Idea + prototype', 'done · live demo', '2BB673'], ['Next 4 weeks', 'live FIRMS pilot · validation', 'FB923C'], ['Grand finale', 'PostGIS · alerts · Sentinel-2 CNN', '38BDF8'], ['Deployment', 'Bhuvan / NDEM · SDMA SOP', 'C4B5FD']]
  ms.forEach(([t, d, c], i) => {
    const x = 0.9 + i * 2.25
    C(s, x, 4.78, 0.16, c)
    T(s, t, x + 0.22, 4.56, 2.0, 0.2, { size: 8, bold: true, color: c })
    T(s, d, x + 0.22, 4.93, 2.0, 0.22, { size: 7, color: 'CBD5E1' })
  })
  E(s, '🛰️', 9.2, 4.62, 0.45, 16)
}

// ================================================================== 5. IMPACT AND BENEFITS
{
  const s = pres.addSlide()
  chrome(s, 'IMPACT AND BENEFITS')
  // wheel
  const cx = 2.75, cy = 3.1, r = 1.3
  C(s, cx - r, cy - r, 2 * r, WHITE, { line: '9CA3AF', lw: 1.5, dash: 'dash' })
  C(s, cx - 0.52, cy - 0.52, 1.04, WHITE, { line: '1F2937', lw: 2 })
  s.addShape(pres.shapes.LINE, { x: cx, y: cy - 0.45, w: 0, h: 0.9, line: { color: '1F2937', width: 1.5 } })
  T(s, 'IMPACTS', cx - 0.5, cy - 0.12, 0.48, 0.24, { size: 6.5, bold: true, color: TAN, align: 'center', valign: 'middle' })
  T(s, 'BENEFITS', cx + 0.02, cy - 0.12, 0.5, 0.24, { size: 6.5, bold: true, color: '1E5AA8', align: 'center', valign: 'middle' })
  const left = [['Faster response', 'Alerts only on abnormal industrial heat — the right plant, sooner.'], ['99 % less triage', 'Only 138 of 22,179 detections reach an operator.'],
    ['National registry', 'Persistent thermal sources with 90-day history for NTRO.'], ['Standing watch', 'Coal-seam fires & gas flares (Jharia, Barmer) monitored daily.']]
  const right = [['Safety', 'Communities near refineries, steel & chemical plants warned earlier.'], ['Economic', '₹0 data, one VM; losses cut by early detection.'],
    ['Environmental', 'Stubble burning vs industry attribution; flaring & coal-fire inventories.'], ['Strategic', 'Explainable, sovereign, Bhuvan / NDEM-ready.']]
  const angles = [-62, -21, 21, 62]
  left.forEach(([t, d], i) => {
    const a = (180 - angles[i]) * Math.PI / 180, nx = cx + r * Math.cos(a), ny = cy + r * Math.sin(a)
    C(s, nx - 0.19, ny - 0.19, 0.38, 'D9C7A6', { line: '8B7355', lw: 1 })
    T(s, String(i + 1), nx - 0.19, ny - 0.19, 0.38, 0.38, { size: 10, bold: true, color: '3B2F1E', align: 'center', valign: 'middle' })
    T(s, t, 0.15, ny - 0.3, nx - 0.45, 0.22, { size: 9.5, bold: true, underline: true, color: '1E5AA8', align: 'right', font: SERIF })
    T(s, d, 0.15, ny - 0.08, nx - 0.45, 0.42, { size: 7, bold: true, color: INK, align: 'right', font: SERIF })
  })
  right.forEach(([t, d], i) => {
    const a = angles[i] * Math.PI / 180, nx = cx + r * Math.cos(a), ny = cy + r * Math.sin(a)
    C(s, nx - 0.19, ny - 0.19, 0.38, '1E5AA8')
    T(s, String(i + 1), nx - 0.19, ny - 0.19, 0.38, 0.38, { size: 10, bold: true, color: WHITE, align: 'center', valign: 'middle' })
    T(s, t, nx + 0.3, ny - 0.3, 5.5 - nx - 0.3, 0.22, { size: 9.5, bold: true, underline: true, color: MUTED, font: SERIF })
    T(s, d, nx + 0.3, ny - 0.08, 5.5 - nx - 0.3, 0.42, { size: 7, bold: true, color: INK, font: SERIF })
  })
  // divider
  s.addShape(pres.shapes.RECTANGLE, { x: 5.62, y: 0.98, w: 0.08, h: 4.25, fill: { color: '4B5563' }, line: { color: '4B5563', width: 0 } })
  // chart
  T(s, 'Control-room workload — FIRMS today vs with ThermalSentinel', 5.85, 0.98, 3.9, 0.25, { size: 8.5, bold: true, color: NAVY, align: 'center' })
  s.addChart(pres.charts.BAR, [
    { name: 'FIRMS today', labels: ['Hotspots an operator must review (%)', 'Industrial vs natural separated (%)', 'Sources with history / baseline (%)', 'Decisions with reasons (%)'], values: [100, 0, 0, 0] },
    { name: 'With ThermalSentinel', labels: ['Hotspots an operator must review (%)', 'Industrial vs natural separated (%)', 'Sources with history / baseline (%)', 'Decisions with reasons (%)'], values: [0.6, 99.9, 100, 100] },
  ], { x: 5.8, y: 1.22, w: 3.95, h: 2.05, barDir: 'bar', barGrouping: 'clustered', chartColors: ['9CA3AF', '1D4ED8'], showValue: true, dataLabelPosition: 'outEnd', dataLabelFontSize: 7, dataLabelFormatCode: '0.0',
    valAxisMaxVal: 100, valAxisMinVal: 0, valAxisLabelFontSize: 7, catAxisLabelFontSize: 7, catAxisOrientation: 'maxMin', valGridLine: { color: 'E5E7EB', size: 0.5 }, catGridLine: { style: 'none' },
    showLegend: true, legendPos: 'b', legendFontSize: 7 })
  T(s, 'Measured on the labelled 90-day archive (22,179 detections).', 5.85, 3.27, 3.9, 0.18, { size: 6, color: MUTED, italic: true, align: 'center' })
  // photos
  T(s, 'From hot pixels to actionable alerts  →', 5.85, 3.55, 3.9, 0.25, { size: 10.5, bold: true, color: NAVY, align: 'center' })
  s.addImage({ data: PUNJAB, x: 5.85, y: 3.85, w: 1.9, h: 1.07 })
  s.addImage({ data: DETAIL, x: 7.85, y: 3.85, w: 5.0, h: 2.81, sizing: { type: 'crop', x: 3.05, y: 0.2, w: 1.9, h: 1.07 } })
  T(s, 'crop-burn season, Punjab (green = agri)', 5.85, 4.95, 1.9, 0.18, { size: 6, color: MUTED, italic: true, align: 'center' })
  T(s, 'Jamnagar: 86 active days · ⚠ 207 MW spike', 7.85, 4.95, 1.9, 0.18, { size: 6, color: MUTED, italic: true, align: 'center' })
}

// ================================================================== 6. RESEARCH AND REFERENCES
{
  const s = pres.addSlide()
  chrome(s, 'RESEARCH AND REFERENCES')
  const refs = [['hotspot data source', 'NASA FIRMS:\nActive-fire\nArea API', 'https://firms.modaps.eosdis.nasa.gov/api/area/'],
    ['375 m sensor science', 'Schroeder 2014:\nVIIRS 375 m\nfire product', 'https://doi.org/10.1016/j.rse.2013.12.008'],
    ['flare signatures', 'Elvidge 2013:\nVIIRS\nNightfire', 'https://doi.org/10.3390/rs5094423'],
    ['industrial heat', 'Liu 2018:\nIndustrial heat\nsources (RSE)', 'https://www.sciencedirect.com/journal/remote-sensing-of-environment'],
    ['context data', 'OpenStreetMap:\nOverpass API\n& tags', 'https://wiki.openstreetmap.org/wiki/Overpass_API'],
    ['visual verification', 'Copernicus:\nSentinel-2 SWIR\nWorldCover', 'https://dataspace.copernicus.eu'],
    ['seasonal priors', 'ICAR-CREAMS /\nCPCB: residue\nburning', 'https://creams.iari.res.in']]
  s.addShape(pres.shapes.LINE, { x: 0.3, y: 1.18, w: 9.4, h: 0, line: { color: 'C9A97C', width: 1, dashType: 'dash', endArrowType: 'triangle' } })
  refs.forEach(([cap, t, url], i) => {
    const x = 0.3 + i * 1.35
    T(s, cap, x - 0.05, 0.95, 1.4, 0.2, { size: 6.5, color: MUTED, align: 'center' })
    s.addShape(pres.shapes.HEXAGON, { x, y: 1.28, w: 1.28, h: 1.35, fill: { color: HEXC }, line: { color: HEXC, width: 0 } })
    T(s, t, x + 0.08, 1.38, 1.12, 0.8, { size: 7.5, bold: true, color: '1F2937', align: 'center', valign: 'middle' })
    s.addText([{ text: 'LINK', options: { hyperlink: { url }, color: '1A0DAB', underline: true, bold: true } }], { x: x + 0.14, y: 2.2, w: 1.0, h: 0.3, fontFace: SANS, fontSize: 9, align: 'center', margin: 0, isTextBox: true })
  })
  s.addShape(pres.shapes.LINE, { x: 0.3, y: 2.72, w: 9.4, h: 0, line: { color: 'C9A97C', width: 1, dashType: 'dash', endArrowType: 'triangle' } })
  // UI/UX strip
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 2.85, w: 10, h: 2.45, fill: { color: 'E5E7EB' }, line: { color: 'E5E7EB', width: 0 } })
  T(s, 'UI / UX — working prototype (live link below)', 0.3, 2.88, 6, 0.22, { size: 9, bold: true, color: NAVY })
  T(s, 'all-India classification  ·  Punjab crop-burn season  ·  Jharia coal-seam fires', 3.5, 2.88, 6.2, 0.22, { size: 7.5, italic: true, color: MUTED, align: 'right' })
  s.addImage({ data: DASH, x: 0.3, y: 3.12, w: 3.05, h: 1.62, sizing: { type: 'crop', x: 0, y: 0.05, w: 3.05, h: 1.62 } })
  s.addImage({ data: PUNJAB, x: 3.48, y: 3.12, w: 3.05, h: 1.62, sizing: { type: 'crop', x: 0, y: 0.05, w: 3.05, h: 1.62 } })
  s.addImage({ data: JHARIA, x: 6.66, y: 3.12, w: 3.05, h: 1.62, sizing: { type: 'crop', x: 0, y: 0.05, w: 3.05, h: 1.62 } })
  R(s, 0.3, 4.8, 9.4, 0.42, WHITE, { line: NAVY, lw: 1 })
  s.addText([{ text: 'Working prototype:  ', options: { bold: true, color: NAVY } }, { text: DEMO, options: { hyperlink: { url: DEMO }, color: '1A0DAB', underline: true } },
    { text: '     Source code:  ', options: { bold: true, color: NAVY } }, { text: REPO, options: { hyperlink: { url: REPO }, color: '1A0DAB', underline: true } }],
    { x: 0.4, y: 4.8, w: 9.2, h: 0.42, fontFace: SANS, fontSize: 9, align: 'center', valign: 'middle', margin: 0, isTextBox: true })
}

const out = path.join(__dirname, 'FireOrbit_SIH26162_ThermalSentinel.pptx')
pres.writeFile({ fileName: out }).then(() => console.log('wrote', out, `(${n} slides)`))
