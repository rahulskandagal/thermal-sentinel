// ThermalSentinel - SIH26162 idea deck (Team Fire Orbit), clean build.
// No emoji, no em-dashes, no generator metadata; document properties set to the team.
// Run: node build_fireorbit_clean.js -> FireOrbit_SIH26162_ThermalSentinel.pptx
const pptxgen = require('pptxgenjs')
const fs = require('fs')
const path = require('path')

const M = JSON.parse(fs.readFileSync(path.join(__dirname, 'metrics.json'), 'utf8'))
const img = (f) => 'image/png;base64,' + fs.readFileSync(path.join(__dirname, f)).toString('base64')
const LOGO = img('template_assets/sih_logo.png'), BRAIN = img('template_assets/brain_bulb.png')
const DASH = img('dashboard.png'), DETAIL = img('dashboard_detail.png'), PUNJAB = img('ui_punjab.png'), JHARIA = img('ui_jharia.png')

const TEAM = 'Fire Orbit', TEAM_ID = ''
const DEMO = 'https://rahulskandagal.github.io/thermal-sentinel/', REPO = 'https://github.com/rahulskandagal/thermal-sentinel'

const NAVY = '1F3864', FOOT = '0070C0', WHITE = 'FFFFFF', BLACK = '000000', INK = '1F2937', MUTED = '6B7280'
const DARKBOX = '3A3A3A', YEL = 'F2C94C', REDP = 'E53935', GRNP = '43A047', TAN = 'B08D57', GREY = '7A7A7A', HEXC = 'C9A97C'
const ORANGE = 'E8590C', BLUE = '1D4ED8', GREEN = '15803D', RED = 'B91C1C', PURPLE = '6D28D9', TEAL = '0F766E', MAROON = '7B2D26', OLIVE = '6B7A1E', BROWN = '8B5A2B'
const SERIF = 'Times New Roman', SANS = 'Arial'

const pres = new pptxgen()
pres.layout = 'LAYOUT_16x9'
// document properties: identify the team, not the tool
pres.title = 'SIH26162 ThermalSentinel - Team Fire Orbit'
pres.subject = 'Smart India Hackathon 2026 idea submission, problem statement SIH26162 (NTRO)'
pres.author = 'Team Fire Orbit'
pres.company = 'Team Fire Orbit'
pres.revision = '1'

let n = 0
function chrome(s, heading, size = 26) {
  n++
  s.background = { color: WHITE }
  s.addShape(pres.shapes.OVAL, { x: 0.2, y: 0.12, w: 1.15, h: 0.62, fill: { color: WHITE }, line: { color: NAVY, width: 1.5 } })
  s.addText(TEAM, { x: 0.2, y: 0.12, w: 1.15, h: 0.62, fontFace: SANS, fontSize: 11, color: NAVY, align: 'center', valign: 'middle', margin: 0, isTextBox: true })
  s.addText(heading, { x: 1.45, y: 0.1, w: 6.4, h: 0.7, fontFace: SERIF, fontSize: size, bold: true, color: NAVY, align: 'center', valign: 'middle', margin: 0, isTextBox: true })
  s.addImage({ data: LOGO, x: 7.95, y: 0.05, w: 1.85, h: 0.87 })
  // page number only, no template band at the bottom
  s.addText(String(n), { x: 9.0, y: 5.26, w: 0.7, h: 0.28, fontFace: SANS, fontSize: 10, bold: true, color: MUTED, align: 'right', valign: 'middle', margin: 0, isTextBox: true })
}
const T = (s, t, x, y, w, h, o = {}) => s.addText(t, { x, y, w, h, fontFace: o.font || SANS, fontSize: o.size || 9, color: o.color || INK, bold: !!o.bold, italic: !!o.italic, underline: !!o.underline, align: o.align || 'left', valign: o.valign || 'top', margin: 0, isTextBox: true })
const R = (s, x, y, w, h, fill, o = {}) => s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, fill: { color: fill }, line: { color: o.line || fill, width: o.lw ?? 0 }, rectRadius: o.r ?? 0.08, shadow: o.shadow ? { type: 'outer', color: '000000', blur: 4, offset: 2, angle: 45, opacity: 0.35 } : undefined })
const C = (s, x, y, d, fill, o = {}) => s.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: fill }, line: { color: o.line || fill, width: o.lw ?? 0, dashType: o.dash } })
// numbered marker used instead of icon art
const NUM = (s, x, y, d, fill, label, color = WHITE) => { C(s, x, y, d, fill); T(s, String(label), x, y, d, d, { size: d > 0.4 ? 12 : 9, bold: true, color, align: 'center', valign: 'middle' }) }
function cloud(s, x, y, w, h, lines) {
  s.addShape(pres.shapes.CLOUD, { x, y, w, h, fill: { color: WHITE }, line: { color: BLACK, width: 2 } })
  s.addText(lines.map((l, i) => ({ text: typeof l === 'string' ? l : l.text, options: { color: '1A0DAB', bold: true, underline: typeof l !== 'string', hyperlink: typeof l === 'string' ? undefined : { url: l.url }, breakLine: i < lines.length - 1 } })),
    { x: x + w * 0.16, y: y + h * 0.2, w: w * 0.68, h: h * 0.6, fontFace: SANS, fontSize: 10, align: 'center', valign: 'middle', margin: 0, isTextBox: true })
}
function callout(s, x, y, w, h, label, body, size = 9.5) {
  R(s, x + 0.05, y + 0.05, w, h, '1A1A1A', { r: 0.12 })
  R(s, x, y, w, h, DARKBOX, { r: 0.12 })
  s.addText([{ text: label + ' ', options: { color: YEL, underline: true, bold: true } }, { text: body, options: { color: WHITE, bold: true } }],
    { x: x + 0.12, y: y + 0.06, w: w - 0.24, h: h - 0.12, fontFace: SERIF, fontSize: size, valign: 'middle', margin: 0, isTextBox: true })
}
const fmt = (v) => v.toLocaleString('en-IN')

// ================================================================== 1. TITLE PAGE
{
  const s = pres.addSlide(); n++
  s.background = { color: WHITE }
  s.addImage({ data: BRAIN, x: 5.68, y: 0.94, w: 4.32, h: 4.04 })
  s.addImage({ data: LOGO, x: 7.95, y: 0.05, w: 1.85, h: 0.87 })
  T(s, 'SMART INDIA HACKATHON 2026', 0.5, 0.15, 7.4, 0.6, { font: SERIF, size: 28, bold: true, color: NAVY, align: 'center', valign: 'middle' })
  const rows = [['Problem Statement ID - ', 'SIH26162'],
    ['Problem Statement Title- ', 'AI-Based Detection and Classification of Industrial Fires and Persistent Thermal Sources Using NASA FIRMS, OSM & Satellite Data'],
    ['Theme- ', 'Disaster Management'], ['PS Category- ', 'Software'], ['Team ID- ', TEAM_ID], ['Team Name (Registered on portal) - ', TEAM]]
  const runs = []
  rows.forEach(([k, v], i) => { runs.push({ text: k, options: { bullet: true, bold: true } }); runs.push({ text: v, options: { bold: true, breakLine: i < rows.length - 1 } }) })
  s.addText(runs.map((r) => ({ ...r, options: { ...r.options, paraSpaceAfter: 10 } })), { x: 0.3, y: 1.35, w: 5.6, h: 3.7, fontFace: SERIF, fontSize: 13.5, color: BLACK, valign: 'top', margin: 0, isTextBox: true })
  T(s, 'Organisation: National Technical Research Organisation (NTRO)', 0.3, 4.8, 5.6, 0.3, { font: SERIF, size: 11, italic: true, color: MUTED })
  T(s, '1', 9.0, 5.26, 0.7, 0.28, { size: 10, bold: true, color: MUTED, align: 'right', valign: 'middle' })
}

// ================================================================== 2. PROPOSED SOLUTION
{
  const s = pres.addSlide()
  chrome(s, 'ThermalSentinel: Classifying Every Satellite Hotspot\nand Alerting Only on Abnormal Industrial Heat', 16)

  callout(s, 0.2, 0.98, 3.05, 1.1, 'Real-world issue:', 'NASA FIRMS reports thousands of hot pixels over India every day. A refinery flare, a steel plant, a coal-seam fire, a stubble burn and a forest fire all look identical in that feed.')
  callout(s, 0.2, 2.16, 3.05, 1.02, 'Why it matters:', 'A genuine plant fire hides among routine industrial heat, so responders cannot prioritise, and no registry of persistent thermal sources exists for security agencies.')
  callout(s, 0.2, 3.26, 3.05, 0.98, 'Our solution:', 'Classify every hotspot into 6 classes, track each source for 90 days, and raise an alert only when a known site burns far above its own normal level.')
  cloud(s, 0.15, 4.3, 1.75, 0.95, [{ text: 'Live Demo', url: DEMO }, { text: 'GitHub', url: REPO }])
  T(s, 'Prototype', 2.05, 4.32, 1.2, 0.28, { size: 12, bold: true, color: BLACK })
  s.addShape(pres.shapes.LINE, { x: 1.95, y: 4.62, w: 0.55, h: 0.12, flipV: true, line: { color: BLACK, width: 2, endArrowType: 'triangle' } })
  T(s, 'running today, click to open', 2.05, 4.78, 1.25, 0.4, { size: 8, italic: true, color: INK })

  s.addShape(pres.shapes.ISOSCELES_TRIANGLE, { x: 3.4, y: 0.98, w: 3.5, h: 4.27, fill: { color: 'FFF3E0' }, line: { color: 'F59E0B', width: 3, dashType: 'dash' } })
  const tiers = [
    ['CORE INNOVATION', 'Baseline-relative incident alerts: FRP at least 2.5 times the site normal and z-score at least 3', NAVY],
    ['PRIMARY FUNCTIONS', 'Six-class AI classification and a 90-day persistent-source registry', '1E5AA8'],
    ['CONTEXT AND EVIDENCE', 'OSM facilities, land cover, Sentinel-2 verification, Indian burn-season priors', '2E7D32'],
    ['MONITORING AND OUTPUT', 'GIS dashboard, GeoJSON API, webhook and SMS alerts, analyst loop, QGIS export', '1B6EA8'],
  ]
  const geo = [[3.4, 0.8], [2.8, 0.72], [2.15, 0.72], [1.5, 0.72]]
  let by = 5.2
  const placed = []
  geo.forEach(([w, hh]) => { by -= hh; placed.push([w, hh, by]); by -= 0.08 })
  placed.reverse().forEach(([w, hh, y], i) => {
    const [h, d, c] = tiers[i]
    R(s, 5.15 - w / 2, y, w, hh, c, { r: 0.06 })
    T(s, h, 5.15 - w / 2, y + 0.04, w, 0.18, { size: 7.5, bold: true, color: 'FFE082', align: 'center' })
    T(s, d, 5.15 - w / 2 + 0.05, y + 0.22, w - 0.1, hh - 0.26, { size: 7, color: WHITE, align: 'center', valign: 'middle' })
  })

  T(s, 'Risk', 7.05, 0.98, 1.2, 0.28, { size: 13, bold: true, color: ORANGE, align: 'center' })
  T(s, 'vs', 8.25, 1.0, 0.3, 0.25, { size: 10, bold: true, color: MUTED, align: 'center' })
  T(s, 'Solution', 8.55, 0.98, 1.2, 0.28, { size: 13, bold: true, color: GREEN, align: 'center' })
  const pairs = [['Identical hotspots carry no meaning', 'Six-class AI: industrial, flare, mine, crop, wildfire'],
    ['Real fires hidden in routine heat', 'Alert only when FRP exceeds the site baseline'],
    ['No memory of persistent sources', '90-day source tracking and registry'],
    ['Black-box AI is not trusted', 'Every label carries plain reasons']]
  pairs.forEach(([a, b], i) => {
    const y = 1.32 + i * 0.7
    R(s, 7.0, y, 1.3, 0.5, REDP, { r: 0.1, shadow: true })
    T(s, a, 7.05, y, 1.2, 0.5, { size: 7.5, bold: true, color: WHITE, align: 'center', valign: 'middle', font: SERIF })
    s.addShape(pres.shapes.LEFT_RIGHT_ARROW, { x: 8.33, y: y + 0.13, w: 0.32, h: 0.24, fill: { color: 'F5D28A' }, line: { color: 'B8860B', width: 0.75 } })
    R(s, 8.68, y, 1.1, 0.5, GRNP, { r: 0.1, shadow: true })
    T(s, b, 8.72, y, 1.02, 0.5, { size: 7, bold: true, color: WHITE, align: 'center', valign: 'middle', font: SERIF })
  })
  s.addImage({ data: DASH, x: 7.0, y: 4.15, w: 2.78, h: 1.0, sizing: { type: 'crop', x: 0, y: 0.12, w: 2.78, h: 1.0 } })
  T(s, 'Prototype GIS dashboard', 7.0, 5.18, 2.78, 0.18, { size: 6.5, italic: true, color: MUTED, align: 'right' })
}

// ================================================================== 3. TECHNICAL APPROACH
{
  const s = pres.addSlide()
  chrome(s, 'TECHNICAL APPROACH')
  T(s, 'METHODOLOGY AND PROCESS OF\nIMPLEMENTATION', 0.2, 0.95, 3.4, 0.55, { size: 12.5, bold: true, color: MAROON, align: 'center' })
  const cx = 1.9, cy = 2.95, r = 0.72
  C(s, cx - r, cy - r, 2 * r, WHITE, { line: '9CA3AF', lw: 1.5, dash: 'dash' })
  const nodes = [['Ingest', 'FIRMS data', BLUE, -90], ['Cluster', 'DBSCAN sources', ORANGE, -30], ['Persist', '90-day baseline', PURPLE, 30],
    ['Context', 'OSM and land use', GREEN, 90], ['Classify', 'rules and GBM', RED, 150], ['Serve', 'GIS and alerts', TEAL, 210]]
  nodes.forEach(([t, d, c, deg], i) => {
    const a = deg * Math.PI / 180, nx = cx + r * Math.cos(a), ny = cy + r * Math.sin(a)
    NUM(s, nx - 0.21, ny - 0.21, 0.42, c, i + 1)
    const side = Math.cos(a) > 0.3 ? 'left' : Math.cos(a) < -0.3 ? 'right' : 'center'
    let bx, bw, ly
    if (side === 'left') { bx = nx + 0.28; bw = 3.6 - bx; ly = ny - 0.2 }
    else if (side === 'right') { bx = 0.2; bw = nx - 0.28 - 0.2; ly = ny - 0.2 }
    else { bx = nx - 0.7; bw = 1.4; ly = Math.sin(a) < 0 ? ny - 0.66 : ny + 0.25 }
    T(s, t, bx, ly, bw, 0.2, { size: 8.5, bold: true, color: c, align: side })
    T(s, d, bx, ly + 0.18, bw, 0.2, { size: 6.5, color: MUTED, align: side })
  })
  cloud(s, 0.15, 4.42, 1.6, 0.83, [{ text: 'Report', url: REPO + '#readme' }, { text: 'GitHub', url: REPO }])
  T(s, 'Detailed\nReport', 2.35, 4.5, 1.2, 0.5, { size: 11, bold: true, color: BLACK })
  s.addShape(pres.shapes.LINE, { x: 1.8, y: 4.72, w: 0.5, h: 0.1, flipV: true, line: { color: BLACK, width: 2, endArrowType: 'triangle' } })

  R(s, 3.75, 0.98, 3.1, 1.95, 'F8FAFC', { line: '1F2937', lw: 1.5, r: 0.03 })
  const flow = [['VIIRS 375 m,\nMODIS 1 km', BLUE], ['NASA FIRMS API,\nunder 3 h latency', ORANGE], ['ThermalSentinel\nengine', RED], ['GIS, registry,\nalerts', GREEN]]
  flow.forEach(([t, c], i) => {
    const x = 3.85 + i * 0.76
    NUM(s, x + 0.14, 1.12, 0.42, c, i + 1)
    T(s, t, x - 0.06, 1.62, 0.8, 0.5, { size: 5.8, color: INK, align: 'center' })
    if (i < 3) s.addShape(pres.shapes.LINE, { x: x + 0.6, y: 1.33, w: 0.14, h: 0, line: { color: '6B7280', width: 1.5, endArrowType: 'triangle' } })
  })
  R(s, 3.85, 2.2, 2.9, 0.66, 'EFF6FF', { line: 'BFDBFE', lw: 0.75, r: 0.04 })
  s.addText([{ text: 'AI core: ', options: { bold: true, color: BLUE } }, { text: '34 features, haversine DBSCAN at 750 m, per-source FRP mean and standard deviation, OSM facility type and distance, land cover, Indian burn-season priors. Explainable rules vote with gradient-boosted trees; an anomaly is raised when FRP reaches 2.5 times the source mean and z-score 3.', options: { color: INK } }],
    { x: 3.92, y: 2.2, w: 2.78, h: 0.66, fontFace: SANS, fontSize: 6.3, valign: 'middle', margin: 0, isTextBox: true })
  s.addImage({ data: DASH, x: 3.75, y: 3.02, w: 3.1, h: 1.74 })
  T(s, 'Prototype: 22,179 detections classified, 114 persistent sources, 138 incident alerts, GeoJSON export', 3.75, 4.82, 3.1, 0.36, { size: 6.5, color: MUTED, italic: true, align: 'center' })

  T(s, 'TECHNOLOGIES USED', 7.0, 0.95, 2.8, 0.35, { size: 13, bold: true, color: MAROON, align: 'center' })
  const tech = [['Data', 'NASA FIRMS (VIIRS 375 m, MODIS), OpenStreetMap Overpass, Copernicus Sentinel-2, NASA Worldview', OLIVE],
    ['AI and ML', 'Python, scikit-learn (DBSCAN, HistGradientBoosting), rule engine, shapely STRtree', BROWN],
    ['Backend', 'FastAPI REST with GeoJSON, SQLite moving to PostGIS, OGC-standard exports', MAROON],
    ['Frontend', 'React 18 with Vite, Leaflet canvas renderer for 40,000+ points, deep-link views', PURPLE],
    ['Deployment', 'GitHub Pages demo, single Linux VM, NIC cloud or air-gapped server, Docker-ready', TEAL]]
  tech.forEach(([t, d, c], i) => {
    const y = 1.38 + i * 0.78
    R(s, 7.25, y, 2.55, 0.66, c, { r: 0.2, shadow: true })
    NUM(s, 6.98, y + 0.12, 0.42, WHITE, i + 1, c)
    s.addShape(pres.shapes.OVAL, { x: 6.98, y: y + 0.12, w: 0.42, h: 0.42, fill: { type: 'none' }, line: { color: c, width: 1.5 } })
    T(s, t, 7.55, y + 0.05, 2.2, 0.22, { size: 9.5, bold: true, color: 'FFE082' })
    T(s, d, 7.55, y + 0.27, 2.2, 0.38, { size: 6.5, color: WHITE })
  })
}

// ================================================================== 4. FEASIBILITY AND VIABILITY
{
  const s = pres.addSlide()
  chrome(s, 'FEASIBILITY AND VIABILITY')
  const cards = [
    ['FEASIBILITY ANALYSIS', TAN, [['Working prototype:', 'the full 90-day archive of 22,179 detections is classified in about 7 seconds on a laptop, and the demo is public.'],
      ['Open data only:', 'the FIRMS key is issued instantly, OSM Overpass and Copernicus are free. No licences, no procurement.'],
      ['Light footprint:', 'FastAPI, SQLite and React run on a single VM, NIC cloud or an air-gapped NTRO server.'],
      ['One switch to live:', 'a single environment variable moves the same pipeline from the archive to near-real-time FIRMS.']]],
    ['VIABILITY', GREY, [['Signals that work:', 'persistence, OSM context and physical signature separate the classes. Accuracy on the labelled 90-day archive is 99.9 % hybrid and 98.4 % rules-only.'],
      ['Designed for trust:', 'every label shows its reasons. Analysts confirm or override, and their labels retrain the model.'],
      ['Scales:', 'OSM is queried only around hotspot cells, with a PostGIS and tile path for national, multi-year archives.'],
      ['Risks handled:', 'OSM gaps use a curated list and WorldCover, clouds are covered by a 90-day window across 3 satellites, false alarms by baseline-relative thresholds.']]],
    ['BUSINESS AND DEPLOYMENT', TAN, [['Government:', 'SDMA control rooms, an NTRO source registry and CPCB fire attribution, at roughly Rs 3,000 to 5,000 per month per deployment.'],
      ['Industry and insurers:', 'site-monitoring subscriptions and verified incident evidence for claims and compliance.'],
      ['Integration:', 'GeoJSON layers for Bhuvan, NDEM, QGIS and ArcGIS. No new GIS is required.'],
      ['Roadmap:', 'a 4-week live pilot with validation on real incidents, then alerting and a Sentinel-2 chip classifier, then an agency SOP.']]],
  ]
  cards.forEach(([h, fill, items], i) => {
    const x = 0.25 + i * 3.2
    R(s, x + 0.04, 1.02, 3.05, 3.42, '5C4A32', { r: 0.03 })
    R(s, x, 0.98, 3.05, 3.42, fill, { r: 0.03 })
    s.addShape(pres.shapes.LINE, { x: x + 2.72, y: 1.0, w: 0.12, h: 0.3, line: { color: '4B5563', width: 1.5 } })
    C(s, x + 2.66, 0.86, 0.24, i === 1 ? 'B91C1C' : 'DC2626', { line: '7F1D1D', lw: 0.75 })
    T(s, h, x + 0.1, 1.08, 2.85, 0.3, { size: 12.5, bold: true, color: WHITE, align: 'center', font: SERIF })
    let y = 1.5
    items.forEach(([k, v]) => {
      s.addText([{ text: k + ' ', options: { bold: true, underline: true, color: 'FFF7E6' } }, { text: v, options: { bold: true, color: WHITE } }],
        { x: x + 0.14, y, w: 2.78, h: 0.7, fontFace: SERIF, fontSize: 8.8, valign: 'top', margin: 0, isTextBox: true })
      y += 0.72
    })
  })
  R(s, 0.25, 4.5, 9.5, 0.72, '0F172A', { r: 0.04 })
  s.addShape(pres.shapes.LINE, { x: 0.7, y: 4.86, w: 8.6, h: 0, line: { color: '64748B', width: 1, dashType: 'dash' } })
  const ms = [['Idea and prototype', 'done, public demo live', '2BB673'], ['Next 4 weeks', 'live FIRMS pilot, validation', 'FB923C'], ['Grand finale', 'alerting, Sentinel-2 classifier', '38BDF8'], ['Deployment', 'Bhuvan and NDEM, SDMA SOP', 'C4B5FD']]
  ms.forEach(([t, d, c], i) => {
    const x = 0.9 + i * 2.25
    C(s, x, 4.78, 0.16, c)
    T(s, t, x + 0.22, 4.56, 2.0, 0.2, { size: 8, bold: true, color: c })
    T(s, d, x + 0.22, 4.93, 2.0, 0.22, { size: 7, color: 'CBD5E1' })
  })
}

// ================================================================== 5. IMPACT AND BENEFITS
{
  const s = pres.addSlide()
  chrome(s, 'IMPACT AND BENEFITS')
  const cx = 3.15, cy = 3.1, r = 1.12
  C(s, cx - r, cy - r, 2 * r, WHITE, { line: '9CA3AF', lw: 1.5, dash: 'dash' })
  C(s, cx - 0.52, cy - 0.52, 1.04, WHITE, { line: '1F2937', lw: 2 })
  s.addShape(pres.shapes.LINE, { x: cx, y: cy - 0.45, w: 0, h: 0.9, line: { color: '1F2937', width: 1.5 } })
  T(s, 'IMPACTS', cx - 0.5, cy - 0.12, 0.48, 0.24, { size: 6.5, bold: true, color: TAN, align: 'center', valign: 'middle' })
  T(s, 'BENEFITS', cx + 0.02, cy - 0.12, 0.5, 0.24, { size: 6.5, bold: true, color: '1E5AA8', align: 'center', valign: 'middle' })
  const left = [['Faster response', 'Alerts only on abnormal industrial heat.'],
    ['99 % less triage', 'Only 138 of 22,179 reach an operator.'],
    ['Source registry', '90 days of activity history per site.'],
    ['Standing watch', 'Jharia and Barmer watched daily.']]
  const right = [['Safety', 'Communities near refineries and chemical plants warned earlier.'],
    ['Economic', 'No data cost, one VM, losses cut by early detection.'],
    ['Environmental', 'Stubble burning separated from industrial emissions and flaring.'],
    ['Strategic', 'Explainable, sovereign, ready for Bhuvan or NDEM.']]
  const angles = [-62, -21, 21, 62]
  left.forEach(([t, d], i) => {
    const a = (180 - angles[i]) * Math.PI / 180, nx = cx + r * Math.cos(a), ny = cy + r * Math.sin(a)
    NUM(s, nx - 0.19, ny - 0.19, 0.38, 'D9C7A6', i + 1, '3B2F1E')
    s.addShape(pres.shapes.OVAL, { x: nx - 0.19, y: ny - 0.19, w: 0.38, h: 0.38, fill: { type: 'none' }, line: { color: '8B7355', width: 1 } })
    T(s, t, 0.12, ny - 0.28, nx - 0.44, 0.2, { size: 9, bold: true, underline: true, color: '1E5AA8', align: 'right', font: SERIF })
    T(s, d, 0.12, ny - 0.07, nx - 0.44, 0.34, { size: 6.8, bold: true, color: INK, align: 'right', font: SERIF })
  })
  right.forEach(([t, d], i) => {
    const a = angles[i] * Math.PI / 180, nx = cx + r * Math.cos(a), ny = cy + r * Math.sin(a)
    NUM(s, nx - 0.19, ny - 0.19, 0.38, '1E5AA8', i + 1)
    T(s, t, nx + 0.3, ny - 0.28, 5.5 - nx - 0.3, 0.2, { size: 9, bold: true, underline: true, color: MUTED, font: SERIF })
    T(s, d, nx + 0.3, ny - 0.07, 5.5 - nx - 0.3, 0.34, { size: 6.8, bold: true, color: INK, font: SERIF })
  })
  s.addShape(pres.shapes.RECTANGLE, { x: 5.62, y: 0.98, w: 0.08, h: 4.25, fill: { color: '4B5563' }, line: { color: '4B5563', width: 0 } })
  T(s, 'Control-room workload: FIRMS today versus ThermalSentinel', 5.85, 0.98, 3.9, 0.25, { size: 8.5, bold: true, color: NAVY, align: 'center' })
  const cats = ['Hotspots an operator must review (%)', 'Industrial vs natural separated (%)', 'Sources with history or baseline (%)', 'Decisions with stated reasons (%)']
  s.addChart(pres.charts.BAR, [
    { name: 'FIRMS today', labels: cats, values: [100, 0, 0, 0] },
    { name: 'With ThermalSentinel', labels: cats, values: [0.6, 99.9, 100, 100] },
  ], { x: 5.8, y: 1.22, w: 3.95, h: 2.05, barDir: 'bar', barGrouping: 'clustered', chartColors: ['9CA3AF', '1D4ED8'], showValue: true, dataLabelPosition: 'outEnd', dataLabelFontSize: 7, dataLabelFormatCode: '0.0',
    valAxisMaxVal: 100, valAxisMinVal: 0, valAxisLabelFontSize: 7, catAxisLabelFontSize: 7, catAxisOrientation: 'maxMin', valGridLine: { color: 'E5E7EB', size: 0.5 }, catGridLine: { style: 'none' },
    showLegend: true, legendPos: 'b', legendFontSize: 7 })
  T(s, 'Measured on the labelled 90-day archive of 22,179 detections.', 5.85, 3.27, 3.9, 0.18, { size: 6, color: MUTED, italic: true, align: 'center' })
  T(s, 'From hot pixels to actionable alerts', 5.85, 3.55, 3.9, 0.25, { size: 10, bold: true, color: NAVY, align: 'center' })
  s.addImage({ data: PUNJAB, x: 5.85, y: 3.85, w: 1.9, h: 1.07 })
  s.addImage({ data: DETAIL, x: 7.85, y: 3.85, w: 5.0, h: 2.81, sizing: { type: 'crop', x: 3.05, y: 0.2, w: 1.9, h: 1.07 } })
  T(s, 'crop-burn season, Punjab', 5.85, 4.95, 1.9, 0.18, { size: 6, color: MUTED, italic: true, align: 'center' })
  T(s, 'Jamnagar: 86 active days, 207 MW spike', 7.85, 4.95, 1.9, 0.18, { size: 6, color: MUTED, italic: true, align: 'center' })
}

// ================================================================== 6. RESEARCH AND REFERENCES
{
  const s = pres.addSlide()
  chrome(s, 'RESEARCH AND REFERENCES')
  const refs = [['policy and problem', 'NTRO\nPS SIH26162\nSIH 2026', 'https://sih.gov.in'],
    ['hotspot data source', 'NASA FIRMS\nActive-fire\nArea API', 'https://firms.modaps.eosdis.nasa.gov/api/area/'],
    ['sensor science', 'Schroeder 2014\nVIIRS 375 m\nfire product', 'https://doi.org/10.1016/j.rse.2013.12.008'],
    ['flare signatures', 'Elvidge 2013\nVIIRS\nNightfire', 'https://doi.org/10.3390/rs5094423'],
    ['industrial heat', 'Liu 2018\nIndustrial heat\nsources (RSE)', 'https://www.sciencedirect.com/journal/remote-sensing-of-environment'],
    ['context data', 'OpenStreetMap\nOverpass API\nand tags', 'https://wiki.openstreetmap.org/wiki/Overpass_API'],
    ['verification', 'Copernicus\nSentinel-2 SWIR\nWorldCover', 'https://dataspace.copernicus.eu']]
  s.addShape(pres.shapes.LINE, { x: 0.3, y: 1.18, w: 9.4, h: 0, line: { color: 'C9A97C', width: 1, dashType: 'dash', endArrowType: 'triangle' } })
  refs.forEach(([cap, t, url], i) => {
    const x = 0.3 + i * 1.35
    T(s, cap, x - 0.05, 0.95, 1.4, 0.2, { size: 6.5, color: MUTED, align: 'center' })
    s.addShape(pres.shapes.HEXAGON, { x, y: 1.28, w: 1.28, h: 1.35, fill: { color: HEXC }, line: { color: HEXC, width: 0 } })
    T(s, t, x + 0.08, 1.38, 1.12, 0.8, { size: 7.5, bold: true, color: '1F2937', align: 'center', valign: 'middle' })
    s.addText([{ text: 'LINK', options: { hyperlink: { url }, color: '1A0DAB', underline: true, bold: true } }], { x: x + 0.14, y: 2.2, w: 1.0, h: 0.3, fontFace: SANS, fontSize: 9, align: 'center', margin: 0, isTextBox: true })
  })
  s.addShape(pres.shapes.LINE, { x: 0.3, y: 2.72, w: 9.4, h: 0, line: { color: 'C9A97C', width: 1, dashType: 'dash', endArrowType: 'triangle' } })
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 2.85, w: 10, h: 2.45, fill: { color: 'E5E7EB' }, line: { color: 'E5E7EB', width: 0 } })
  T(s, 'Working prototype screens', 0.3, 2.88, 6, 0.22, { size: 9, bold: true, color: NAVY })
  T(s, 'all-India classification, Punjab crop-burn season, Jharia coal-seam fires', 3.5, 2.88, 6.2, 0.22, { size: 7.5, italic: true, color: MUTED, align: 'right' })
  s.addImage({ data: DASH, x: 0.3, y: 3.12, w: 3.05, h: 1.62, sizing: { type: 'crop', x: 0, y: 0.05, w: 3.05, h: 1.62 } })
  s.addImage({ data: PUNJAB, x: 3.48, y: 3.12, w: 3.05, h: 1.62, sizing: { type: 'crop', x: 0, y: 0.05, w: 3.05, h: 1.62 } })
  s.addImage({ data: JHARIA, x: 6.66, y: 3.12, w: 3.05, h: 1.62, sizing: { type: 'crop', x: 0, y: 0.05, w: 3.05, h: 1.62 } })
  R(s, 0.3, 4.98, 9.4, 0.28, WHITE, { line: NAVY, lw: 0.75 })
  s.addText([{ text: 'Working prototype: ', options: { bold: true, color: NAVY } }, { text: DEMO, options: { hyperlink: { url: DEMO }, color: '1A0DAB', underline: true } },
    { text: '     Source code: ', options: { bold: true, color: NAVY } }, { text: REPO, options: { hyperlink: { url: REPO }, color: '1A0DAB', underline: true } }],
    { x: 0.4, y: 4.98, w: 9.2, h: 0.28, fontFace: SANS, fontSize: 8, align: 'center', valign: 'middle', margin: 0, isTextBox: true })
}

const out = path.join(__dirname, 'fix', 'FireOrbit_SIH26162_ThermalSentinel.pptx')
pres.writeFile({ fileName: out }).then(() => console.log('wrote', out, `(${n} slides)`))
