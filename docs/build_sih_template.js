// SIH 2026 Idea PPT reproducing the OFFICIAL template page-for-page
// (SIH logo top-right, team-name oval top-left, serif headings, ❖ / • pointers, blue footer bar).
//   node build_sih_template.js            → SIH26162_ThermalSentinel_Idea_6slides.pptx  (portal, 6 slides)
//   node build_sih_template.js extended   → SIH26162_ThermalSentinel_Idea_extended.pptx (for presenting)
const pptxgen = require('pptxgenjs')
const fs = require('fs')
const path = require('path')

const EXTENDED = process.argv.includes('extended')
const M = JSON.parse(fs.readFileSync(path.join(__dirname, 'metrics.json'), 'utf8'))
const img = (f) => 'image/png;base64,' + fs.readFileSync(path.join(__dirname, f)).toString('base64')
const LOGO = img('template_assets/sih_logo.png'), BRAIN = img('template_assets/brain_bulb.png')

const TEAM = 'FireOrbit', TEAM_ID = '<TEAM ID>'
// template colours
const NAVY = '1F3864', FOOT = '0070C0', OVAL = '8064A2', BLACK = '000000', INK = '1F2937', MUTED = '6B7280'
const LINE = 'D1D5DB', SOFT = 'F3F4F6', WHITE = 'FFFFFF', HEX = 'EDEDED'
const ORANGE = 'E8590C', BLUE = '1D4ED8', GREEN = '15803D', RED = 'B91C1C', PURPLE = '6D28D9', YELLOW = 'B45309', DARK = '0F172A'
const SERIF = 'Times New Roman', SANS = 'Arial'

const pres = new pptxgen()
pres.layout = 'LAYOUT_16x9'
pres.title = 'SIH 2026 Idea — SIH26162 ThermalSentinel (Team FireOrbit)'

let n = 0
function chrome(s, heading, headingSize = 24) {
  n++
  s.background = { color: WHITE }
  // "Your Team Name" oval (top-left)
  s.addShape(pres.shapes.OVAL, { x: 0.25, y: 0.18, w: 1.05, h: 0.62, fill: { color: WHITE }, line: { color: OVAL, width: 1.25 } })
  s.addText(TEAM, { x: 0.25, y: 0.18, w: 1.05, h: 0.62, fontFace: SANS, fontSize: 10, bold: true, color: INK, align: 'center', valign: 'middle', margin: 0, isTextBox: true })
  // heading
  s.addText(heading, { x: 1.4, y: 0.15, w: 6.5, h: 0.65, fontFace: SERIF, fontSize: headingSize, bold: true, color: BLACK, align: 'center', valign: 'middle', margin: 0, isTextBox: true })
  // SIH logo (top-right)
  s.addImage({ data: LOGO, x: 7.95, y: 0.05, w: 1.85, h: 0.87 })
  // footer bar
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.3, w: 10, h: 0.325, fill: { color: FOOT }, line: { color: FOOT, width: 0 } })
  s.addText('@SIH Idea submission- Template', { x: 0, y: 5.3, w: 10, h: 0.325, fontFace: 'Arial Narrow', fontSize: 9, color: WHITE, align: 'center', valign: 'middle', margin: 0, isTextBox: true })
  s.addText(String(n), { x: 8.8, y: 5.3, w: 0.9, h: 0.325, fontFace: 'Arial Narrow', fontSize: 9, bold: true, color: WHITE, align: 'right', valign: 'middle', margin: 0, isTextBox: true })
}
// ❖ underlined navy pointer (template page 2 style)
function diamond(s, t, x, y, w, size = 12) {
  s.addText([{ text: '❖ ', options: { color: OVAL, underline: false } }, { text: t, options: { color: NAVY, underline: true } }],
    { x, y, w, h: 0.3, fontFace: SANS, fontSize: size, bold: true, margin: 0, valign: 'middle', isTextBox: true })
}
// • pointer (template pages 3–6 style)
function pointer(s, t, x, y, w, color = INK, size = 11) {
  s.addText([{ text: '•  ', options: { color: BLACK } }, { text: t, options: { color } }], { x, y, w, h: 0.28, fontFace: SANS, fontSize: size, bold: true, margin: 0, valign: 'middle', isTextBox: true })
}
function box(s, x, y, w, h, o = {}) {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, fill: { color: o.fill || WHITE }, line: { color: o.line || LINE, width: 0.75 }, rectRadius: 0.05 })
}
function txt(s, t, x, y, w, h, o = {}) {
  s.addText(t, { x, y, w, h, fontFace: o.font || SANS, fontSize: o.size || 10, color: o.color || INK, bold: !!o.bold, italic: !!o.italic, align: o.align || 'left', valign: o.valign || 'top', margin: 0, isTextBox: true })
}
function bl(s, items, x, y, w, h, size = 9, gap = 2) {
  s.addText(items.map((t, i) => ({ text: t, options: { bullet: { indent: 10 }, breakLine: i < items.length - 1, paraSpaceAfter: gap } })),
    { x, y, w, h, fontFace: SANS, fontSize: size, color: INK, valign: 'top', margin: 1, isTextBox: true })
}
function arrow(s, x, y, w) {
  s.addShape(pres.shapes.LINE, { x, y, w, h: 0, line: { color: '9CA3AF', width: 1.5, endArrowType: 'triangle' } })
}
const fmt = (v) => v.toLocaleString('en-IN')

// ================================================================== 1. TITLE PAGE (template p1)
{
  const s = pres.addSlide(); n++
  s.background = { color: WHITE }
  // hexagons + brain-bulb graphic, cropped from the template page with transparency
  s.addImage({ data: BRAIN, x: 5.68, y: 0.94, w: 4.32, h: 4.04 })
  s.addImage({ data: LOGO, x: 7.95, y: 0.05, w: 1.85, h: 0.87 })
  txt(s, 'SMART INDIA HACKATHON 2026', 0.5, 0.15, 7.4, 0.6, { font: SERIF, size: 28, bold: true, color: NAVY, align: 'center', valign: 'middle' })
  txt(s, 'TITLE PAGE', 1.5, 0.95, 4.5, 0.45, { font: SERIF, size: 22, bold: true, color: BLACK, align: 'center', valign: 'middle' })
  const rows = [
    ['Problem Statement ID – ', 'SIH26162'],
    ['Problem Statement Title- ', 'AI-Based Detection and Classification of Industrial Fires and Persistent Thermal Sources Using NASA FIRMS, OSM & Satellite Data'],
    ['Theme- ', 'Disaster Management'],
    ['PS Category- ', 'Software'],
    ['Team ID- ', TEAM_ID],
    ['Team Name (Registered on portal)- ', TEAM],
  ]
  const runs = []
  rows.forEach(([k, v], i) => {
    runs.push({ text: k, options: { bold: true, bullet: true, color: BLACK } })
    runs.push({ text: v, options: { bold: false, color: INK, breakLine: i < rows.length - 1 } })
  })
  s.addText(runs.map((r) => ({ ...r, options: { ...r.options, paraSpaceAfter: 9 } })),
    { x: 0.35, y: 1.55, w: 5.5, h: 3.5, fontFace: SANS, fontSize: 13, valign: 'top', margin: 0, isTextBox: true })
}

// ================================================================== 2. IDEA TITLE / PROPOSED SOLUTION (template p2)
{
  const s = pres.addSlide()
  chrome(s, 'ThermalSentinel — Know WHAT is burning, and whether it should be', 15)
  diamond(s, 'Proposed Solution (Describe your Idea/Solution/Prototype)', 0.3, 0.98, 9.4)

  // ---- left: detailed explanation as a numbered pipeline
  pointer(s, 'Detailed explanation of the proposed solution', 0.3, 1.3, 5.9, BLUE, 10.5)
  const steps = [
    ['Ingest', 'NASA FIRMS VIIRS 375 m + MODIS hotspots (NRT ≤ 3 h + archive), both sensors normalised to one schema.', ORANGE],
    ['Track', 'DBSCAN (750 m) groups pixel-jittered detections into thermal SOURCES; 90-day history → active days, night %, FRP baseline μ/σ, persistence score.', BLUE],
    ['Contextualise', 'OpenStreetMap: nearest refinery / steel / power / flare / kiln / mine (type + distance) and land cover (cropland, forest, industrial).', GREEN],
    ['Classify', 'Hybrid AI = explainable rule engine + gradient-boosted trees on 34 features → 6 classes with confidence and plain-language reasons.', PURPLE],
    ['Alert', 'Baseline-relative anomaly: FRP ≥ 2.5 μ and z ≥ 3 at a known source → incident candidate. Routine heat stays silent.', RED],
    ['Serve', 'Spatial DB → GeoJSON REST API → Leaflet GIS dashboard; QGIS / ArcGIS / Bhuvan-ready export.', DARK],
  ]
  steps.forEach(([t, d, c], i) => {
    const y = 1.58 + i * 0.36
    s.addShape(pres.shapes.OVAL, { x: 0.4, y: y + 0.03, w: 0.26, h: 0.26, fill: { color: c }, line: { color: c, width: 0 } })
    txt(s, String(i + 1), 0.4, y + 0.03, 0.26, 0.26, { size: 8, bold: true, color: WHITE, align: 'center', valign: 'middle' })
    s.addText([{ text: t + ':  ', options: { bold: true, color: c } }, { text: d, options: { color: INK } }],
      { x: 0.75, y, w: 5.45, h: 0.38, fontFace: SANS, fontSize: 8, margin: 0, valign: 'top', isTextBox: true })
  })
  // worked example
  box(s, 0.3, 3.76, 5.9, 0.56, { fill: 'FFF7ED', line: 'FDBA74' })
  s.addText([
    { text: 'One detection, end-to-end:  ', options: { bold: true, color: ORANGE } },
    { text: 'FIRMS pixel 22.352° N 70.049° E, FRP 207 MW, 21 Apr 08:06 UTC  →  ', options: { color: INK } },
    { text: 'Industrial fire · Jamnagar Refinery (30 m from OSM polygon) · persistent 86/90 days · 10× its 19 MW baseline · ⚠ incident candidate · confidence 0.97 · verify: Sentinel-2 SWIR link', options: { bold: true, color: DARK } },
  ], { x: 0.4, y: 3.76, w: 5.7, h: 0.56, fontFace: SANS, fontSize: 7.2, valign: 'middle', margin: 0, isTextBox: true })

  // PS requirement → delivered
  pointer(s, 'How it addresses the problem', 0.3, 4.36, 5.9, GREEN, 10.5)
  const req = [['PS asks: segregate industrial fires from forest & natural fires', '→ 6-class AI: industrial · wildfire · crop burn · flare · mine'],
    ['PS asks: GIS storage + map overlay', '→ spatial DB, GeoJSON API, dashboard, QGIS export (live now)'],
    ['Disaster management needs: act only on real incidents', '→ 138 of 22,179 detections flagged (0.6 %) — 99 % less to triage']]
  req.forEach(([a, b], i) => {
    s.addText([{ text: a + ' ', options: { color: INK } }, { text: b, options: { bold: true, color: GREEN } }],
      { x: 0.45, y: 4.64 + i * 0.2, w: 5.75, h: 0.2, fontFace: SANS, fontSize: 7, margin: 0, isTextBox: true })
  })

  // ---- right: innovation + comparison
  pointer(s, 'Innovation and uniqueness of the solution', 6.35, 1.3, 3.4, PURPLE, 10.5)
  const nov = [['Source-level persistence fingerprint', 'classify the SOURCE over 90 days, not a single pixel'],
    ['Baseline-relative anomaly alerts', 'each site compared with its own normal → "operating" vs "on fire"'],
    ['OSM infrastructure fusion', 'facility type + distance + land cover as features'],
    ['Explainable hybrid AI', 'every label ships with human-readable reasons — auditable'],
    ['Unregistered-source discovery', 'persistent heat with no mapped facility is itself a finding'],
    ['Open & sovereign', '₹0 data, self-hostable, prototype live on GitHub Pages']]
  nov.forEach(([t, d], i) => {
    s.addText([{ text: '✦ ' + t + ' — ', options: { bold: true, color: PURPLE } }, { text: d, options: { color: INK } }],
      { x: 6.4, y: 1.6 + i * 0.3, w: 3.35, h: 0.3, fontFace: SANS, fontSize: 7.5, margin: 0, valign: 'top', isTextBox: true })
  })
  const H = (t) => ({ text: t, options: { bold: true, color: WHITE, fill: { color: DARK }, align: 'center', fontSize: 7 } })
  const Y = () => ({ text: '✔', options: { color: GREEN, bold: true, align: 'center' } }), N = () => ({ text: '✖', options: { color: RED, bold: true, align: 'center' } }), P = () => ({ text: '◐', options: { color: YELLOW, bold: true, align: 'center' } })
  const cmp = [[{ text: 'vs existing tools', options: { bold: true, color: WHITE, fill: { color: DARK }, fontSize: 7 } }, H('FIRMS map'), H('GFW / EFFIS'), H('Ours')],
    ['Tells WHAT is burning', N(), N(), Y()], ['Industrial vs wildfire vs crop', N(), P(), Y()], ['Persistent-source registry', N(), N(), Y()],
    ['Alert vs own baseline', N(), N(), Y()], ['OSM context + explanations', N(), N(), Y()], ['India-specific priors', N(), N(), Y()]]
    .map((r, i) => r.map((c) => (typeof c === 'string' ? { text: c, options: { fill: { color: i % 2 ? SOFT : WHITE } } } : { text: c.text, options: { ...c.options, fill: c.options.fill || { color: i % 2 ? SOFT : WHITE } } })))
  s.addTable(cmp, { x: 6.35, y: 3.45, w: 3.4, colW: [1.6, 0.6, 0.65, 0.55], fontFace: SANS, fontSize: 7, color: INK, border: { type: 'solid', color: LINE, pt: 0.5 }, rowH: 0.225, margin: 0.02 })
  txt(s, 'GFW = Global Forest Watch Fires · EFFIS = Copernicus fire information system', 6.35, 5.05, 3.4, 0.18, { size: 6, color: MUTED, italic: true })
}

// ================================================================== (extended) COMPARISON
if (EXTENDED) {
  const s = pres.addSlide()
  chrome(s, 'COMPARISON WITH EXISTING SOLUTIONS', 22)
  const H = (t) => ({ text: t, options: { bold: true, color: WHITE, fill: { color: DARK }, align: 'center', fontSize: 8.5, valign: 'middle' } })
  const Y = () => ({ text: '✔', options: { color: GREEN, bold: true, align: 'center' } })
  const N = () => ({ text: '✖', options: { color: RED, bold: true, align: 'center' } })
  const P = (t) => ({ text: t || '◐', options: { color: YELLOW, bold: !t, align: 'center', fontSize: t ? 7.5 : 8.5 } })
  const body = [
    ['Primary purpose', P('hotspot map'), P('forest / land fires'), P('wildfire danger & burnt area'), P('flare & industrial catalogue'), P('industrial fire intelligence')],
    ['Detects thermal anomalies', Y(), Y(), Y(), Y(), Y()],
    ['Classifies WHAT is burning (6 classes)', N(), N(), N(), P('flares only'), Y()],
    ['Separates industrial fire from wildfire / crop burn', N(), N(), N(), P(), Y()],
    ['Registry of persistent sources with history', N(), N(), N(), P('annual, global'), Y()],
    ["Incident alert vs source's own baseline", N(), N(), N(), N(), Y()],
    ['Uses OSM infrastructure + land-cover context', N(), P('land cover'), P('land cover'), N(), Y()],
    ['Explains every decision (reasons)', N(), N(), N(), N(), Y()],
    ['Near-real-time (≤ 3 h latency)', Y(), Y(), P('daily'), N(), Y()],
    ['India-specific priors (crop-residue seasons, kiln belts)', N(), N(), N(), N(), Y()],
    ['Open GeoJSON API / GIS export', P(), P(), P(), P('CSV'), Y()],
    ['Free & open data / self-hostable', Y(), Y(), Y(), Y(), Y()],
  ]
  const rows = [[{ text: 'Capability', options: { bold: true, color: WHITE, fill: { color: DARK }, fontSize: 8.5, valign: 'middle' } },
    H('NASA FIRMS map'), H('Global Forest Watch Fires'), H('Copernicus EFFIS / GWIS'), H('VIIRS Nightfire (VNF) / research'), H('ThermalSentinel (FireOrbit)')]]
  body.forEach((r, i) => {
    const bg = { color: i % 2 ? SOFT : WHITE }
    rows.push(r.map((c, j) => typeof c === 'string' ? { text: c, options: { fill: bg } } : { text: c.text, options: { ...c.options, fill: j === 5 ? { color: 'ECFDF5' } : bg } }))
  })
  s.addTable(rows, { x: 0.3, y: 1.0, w: 9.4, colW: [3.0, 1.15, 1.3, 1.35, 1.35, 1.25], fontFace: SANS, fontSize: 8, color: INK, border: { type: 'solid', color: LINE, pt: 0.5 }, rowH: 0.25, margin: 0.03 })
  box(s, 0.3, 4.38, 4.6, 0.82, { fill: SOFT, line: SOFT })
  txt(s, 'Versus published research', 0.42, 4.42, 4.4, 0.22, { size: 9, bold: true, color: ORANGE })
  txt(s, 'Elvidge et al. (VIIRS Nightfire) catalogue flares globally; Liu et al. (2018) find industrial heat sources from Nightfire time-series — offline, global, single-class. We add OSM context, six-class discrimination, per-source baselines with operational alerts and a live GIS, for India.', 0.42, 4.63, 4.4, 0.57, { size: 7.5, color: INK })
  box(s, 5.1, 4.38, 4.6, 0.82, { fill: 'ECFDF5', line: 'ECFDF5' })
  txt(s, 'Bottom line', 5.22, 4.42, 4.4, 0.22, { size: 9, bold: true, color: GREEN })
  txt(s, 'Existing tools answer "where is it hot?". ThermalSentinel answers "what is it, is it normal, and should someone respond?" — the gap NTRO\'s problem statement describes.', 5.22, 4.63, 4.4, 0.57, { size: 7.5, color: INK })
}

// ================================================================== 3. TECHNICAL APPROACH (template p3)
{
  const s = pres.addSlide()
  chrome(s, 'TECHNICAL APPROACH')
  pointer(s, 'Technologies to be used (e.g. programming languages, frameworks, hardware)', 0.3, 0.98, 9.4, INK, 10.5)
  const tech = [['Data', 'NASA FIRMS Area API (VIIRS SNPP / NOAA-20 / NOAA-21 375 m, MODIS 1 km) · OpenStreetMap Overpass · Copernicus Sentinel-2 SWIR · NASA Worldview'],
    ['AI / ML', 'Python 3, scikit-learn — DBSCAN (haversine), HistGradientBoosting, group-aware validation; rule engine; NumPy / pandas / shapely (STRtree point-in-polygon)'],
    ['Backend / GIS', 'FastAPI REST (GeoJSON), SQLite → PostGIS; OGC-standard outputs for QGIS / ArcGIS / ISRO Bhuvan; Docker-ready'],
    ['Frontend / hosting', 'React 18 + Vite, Leaflet canvas renderer (40 k+ points); runs on a laptop, one Linux VM, NIC cloud or air-gapped server; static demo on GitHub Pages']]
  tech.forEach(([k, v], i) => {
    s.addText([{ text: k + ': ', options: { bold: true, color: ORANGE } }, { text: v, options: { color: INK } }],
      { x: 0.55, y: 1.27 + i * 0.21, w: 9.1, h: 0.21, fontFace: SANS, fontSize: 8, margin: 0, valign: 'top', isTextBox: true })
  })

  pointer(s, 'Methodology and process for implementation (Flow Charts/Images/ working prototype)', 0.3, 2.13, 9.4, INK, 10.5)
  // input sources strip
  const inputs = [['NASA FIRMS', 'thermal anomalies'], ['OpenStreetMap', 'facilities + land use'], ['Sentinel-2 · Worldview', 'visual verification']]
  inputs.forEach(([t, d], i) => {
    box(s, 0.3 + i * 1.05, 2.42, 0.98, 0.42, { fill: SOFT, line: SOFT })
    txt(s, t, 0.33 + i * 1.05, 2.44, 0.92, 0.2, { size: 6.5, bold: true, color: DARK, align: 'center' })
    txt(s, d, 0.33 + i * 1.05, 2.62, 0.92, 0.2, { size: 6, color: MUTED, align: 'center' })
  })
  arrow(s, 3.45, 2.63, 0.2)
  const flow = [['Ingest', 'normalise VIIRS +\nMODIS, de-dup passes', ORANGE], ['Cluster', 'DBSCAN 750 m →\nthermal sources', BLUE],
    ['Persistence', 'days, span, night %,\nFRP μ / σ / z', PURPLE], ['Context', 'nearest facility,\nland cover', GREEN], ['Classify', 'rules + GBM →\nclass, conf., reasons', RED]]
  flow.forEach(([t, d, c], i) => {
    const x = 3.7 + i * 1.22
    box(s, x, 2.38, 1.1, 0.5, { line: c })
    s.addShape(pres.shapes.RECTANGLE, { x, y: 2.38, w: 1.1, h: 0.17, fill: { color: c }, line: { color: c, width: 0 } })
    txt(s, `${i + 1}  ${t}`, x + 0.04, 2.38, 1.02, 0.17, { size: 7, bold: true, color: WHITE, valign: 'middle' })
    txt(s, d, x + 0.05, 2.56, 1.0, 0.32, { size: 5.8, color: INK })
    if (i < 4) arrow(s, x + 1.1, 2.63, 0.12)
  })
  // outputs row
  const outs = [['GIS layers', 'classified detections, persistent-source registry, GeoJSON API', BLUE],
    ['⚠ Incident alerts', 'FRP ≥ 2.5 μ & z ≥ 3 at a known source → webhook / SMS / e-mail', RED],
    ['Analyst loop', 'reasons shown → confirm / override → labels retrain the model', GREEN]]
  outs.forEach(([t, d, c], i) => {
    const x = 0.3 + i * 3.15
    s.addShape(pres.shapes.LINE, { x: x + 1.5, y: 2.9, w: 0, h: 0.12, line: { color: '9CA3AF', width: 1.2, endArrowType: 'triangle' } })
    box(s, x, 3.02, 3.05, 0.42, { fill: i === 1 ? 'FEF2F2' : SOFT, line: i === 1 ? RED : SOFT })
    s.addText([{ text: t + ': ', options: { bold: true, color: c } }, { text: d, options: { color: INK } }], { x: x + 0.08, y: 3.02, w: 2.9, h: 0.42, fontFace: SANS, fontSize: 7, valign: 'middle', margin: 0, isTextBox: true })
  })
  // AI core spec
  box(s, 0.3, 3.52, 9.4, 0.36, { fill: 'EFF6FF', line: 'BFDBFE' })
  s.addText([{ text: 'AI core:  ', options: { bold: true, color: BLUE } },
    { text: '34 features (radiometry · persistence · OSM context · land cover · calendar priors: Oct–Nov & Apr–May residue burning)  ·  rules give auditable priors, GBM resolves ambiguous cases, agreement raises confidence  ·  trained/tested with a group-aware split so no source leaks between train and test.', options: { color: INK } }],
    { x: 0.42, y: 3.52, w: 9.2, h: 0.36, fontFace: SANS, fontSize: 7, valign: 'middle', margin: 0, isTextBox: true })

  txt(s, 'Working prototype (real screenshots)', 0.3, 3.95, 4, 0.22, { size: 9, bold: true, color: INK })
  s.addImage({ data: img('dashboard.png'), x: 0.3, y: 4.17, w: 1.95, h: 1.1 })
  s.addImage({ data: img('dashboard_detail.png'), x: 2.35, y: 4.17, w: 3.9, h: 2.2, sizing: { type: 'crop', x: 2.2, y: 0.16, w: 1.4, h: 1.1 } })
  bl(s, [`${fmt(M.totals[0])} FIRMS detections classified in ~7 s · ${M.n_sources} persistent sources · ${M.totals[2]} incident candidates (0.6 %)`,
    `Hybrid accuracy ${(M.acc * 100).toFixed(1)} % vs rules-only ${(M.rules * 100).toFixed(1)} % on the labelled archive (group-aware split)`,
    'Scales: India ≈ 5–15 k detections / day → seconds of compute; OSM queried only around hotspot cells',
    'Live demo: rahulskandagal.github.io/thermal-sentinel  ·  Code: github.com/rahulskandagal/thermal-sentinel'], 3.9, 4.15, 5.8, 1.15, 7.5, 1.5)
}

// ================================================================== (extended) IMPLEMENTATION
if (EXTENDED) {
  const s = pres.addSlide()
  chrome(s, 'IMPLEMENTATION & WORKING PROTOTYPE', 22)
  s.addImage({ data: img('dashboard.png'), x: 0.3, y: 1.0, w: 5.6, h: 3.15 })
  txt(s, 'GIS dashboard: coloured detections by class, dashed footprints = persistent sources, OSM facility icons, class / date / confidence filters, per-day timeline, GeoJSON export.', 0.3, 4.17, 5.6, 0.4, { size: 8, color: MUTED, italic: true })
  s.addImage({ data: img('dashboard_detail.png'), x: 6.1, y: 1.0, w: 8.2, h: 4.61, sizing: { type: 'crop', x: 4.6, y: 0.32, w: 3.6, h: 3.15 } })
  txt(s, 'Detail drawer — Jamnagar refinery: class + confidence, 86 active days, 59 % night, FRP baseline 19 MW with a 207 MW spike flagged as incident; one-click Sentinel-2 / Worldview verification.', 6.1, 4.17, 3.6, 0.55, { size: 8, color: MUTED, italic: true })
  const steps = ['Ingest → normalise VIIRS & MODIS to one schema', 'DBSCAN clusters → per-source persistence statistics', 'Overpass around hotspot cells → facility + land cover', 'Rule engine + GBM → label, confidence, reasons, anomaly flag', 'SQLite + FastAPI GeoJSON → React / Leaflet; static demo on GitHub Pages']
  steps.forEach((t, i) => {
    box(s, 0.3 + i * 1.9, 4.65, 1.8, 0.58, { fill: SOFT, line: SOFT })
    txt(s, `${i + 1}. ${t}`, 0.37 + i * 1.9, 4.68, 1.68, 0.54, { size: 7.5, color: INK })
  })
}

// ================================================================== 4. FEASIBILITY AND VIABILITY (template p4)
{
  const s = pres.addSlide()
  chrome(s, 'FEASIBILITY AND VIABILITY')
  const cols = [
    ['Analysis of the feasibility of the idea', GREEN, ['Technical: end-to-end prototype already runs — 22 k detections → classified in 7 s on a laptop; model trains in seconds; deployed static demo online.',
      'Data: every input is free, open and API-accessible (FIRMS key issued instantly; OSM Overpass; Copernicus). No procurement, no licence.',
      'Operational: one env variable switches offline archive → live FIRMS; Overpass queried only around hotspot cells → India-wide refresh in minutes.',
      'Deployment: SQLite / FastAPI / React on one VM, NIC cloud or an air-gapped NTRO server; GeoJSON fits existing GIS (QGIS, ArcGIS, Bhuvan).',
      'Team & timeline: 4-week pilot plan (live ingest → validation → alerting) is realistic with the current code base.']],
    ['Potential challenges and risks', RED, ['OSM under-maps Indian industry (small kilns, sponge-iron units) → missed context.',
      'Cloud cover & 375 m pixel offsets between passes → gaps / jitter.',
      'Few labelled real incidents; our archive is physically simulated → optimistic accuracy.',
      'False alarms from legitimate process changes (furnace restart, maintenance flaring).',
      'Sub-pixel sources (small flares) below VIIRS threshold; Overpass rate limits at national, multi-year scale.',
      'Adoption: agencies need trust in an AI label before acting on it.']],
    ['Strategies for overcoming these challenges', BLUE, ['Persistence fingerprint flags unregistered sources even with no OSM facility; curated facility list; Sentinel-2 chip verification.',
      '90-day window, 4 passes/day from 3 VIIRS satellites; DBSCAN absorbs jitter; anomalies require an established baseline.',
      'Validate on documented incidents (PESO / CPCB / news); analyst confirm-or-override → labels retrain the model.',
      'Baseline-relative thresholds + confidence on every alert; tunable per site class.',
      'Add VIIRS Nightfire & Landsat TIRS; self-hosted Overpass or ESA WorldCover raster for scale.',
      'Explainability first: every decision shows its reasons — auditable, not a black box.']],
  ]
  cols.forEach(([t, c, items], i) => {
    const x = 0.3 + i * 3.15
    pointer(s, t, x, 0.98, 3.05, c, 10)
    box(s, x, 1.28, 3.05, 2.72)
    bl(s, items, x + 0.1, 1.35, 2.88, 2.6, 8, 2)
  })
  // roadmap
  box(s, 0.3, 4.1, 9.4, 1.12, { fill: DARK, line: DARK })
  txt(s, 'ROADMAP & VIABILITY', 0.45, 4.14, 3, 0.2, { size: 8.5, bold: true, color: 'FBBF24' })
  const phases = [['✔ Done', 'Idea + working prototype', 'pipeline, 6-class AI, alerts, GIS dashboard, public demo', '2BB673'],
    ['Next 4 weeks', 'Pilot with live FIRMS', 'India-wide ingest, validation against real incidents, analyst loop', 'FB923C'],
    ['Grand finale', 'Scale & harden', 'PostGIS + tiles, SMS / webhook alerts, Sentinel-2 chip CNN, WorldCover', '38BDF8'],
    ['Deployment', 'Agency integration', 'Bhuvan / NDEM layers, SDMA control-room pilot, SOP for alerts', 'C4B5FD']]
  phases.forEach(([w, t, d, c], i) => {
    const x = 0.45 + i * 2.33
    s.addShape(pres.shapes.OVAL, { x, y: 4.42, w: 0.16, h: 0.16, fill: { color: c }, line: { color: c, width: 0 } })
    if (i < 3) s.addShape(pres.shapes.LINE, { x: x + 0.16, y: 4.5, w: 2.17, h: 0, line: { color: '475569', width: 1 } })
    txt(s, w, x + 0.22, 4.36, 2.0, 0.18, { size: 7, bold: true, color: c })
    txt(s, t, x, 4.62, 2.2, 0.18, { size: 8, bold: true, color: WHITE })
    txt(s, d, x, 4.8, 2.2, 0.4, { size: 6.5, color: 'CBD5E1' })
  })
  txt(s, 'Cost to run: ₹0 data · one VM (≈ ₹3–5 k / month) · open-source stack — sustainable for any state or central agency.', 0.45, 5.06, 9.1, 0.16, { size: 6.5, color: 'FBBF24', italic: true })
}

// ================================================================== 5. IMPACT AND BENEFITS (template p5)
{
  const s = pres.addSlide()
  chrome(s, 'IMPACT AND BENEFITS')
  pointer(s, 'Potential impact on the target audience', 0.3, 0.98, 5.4, BLUE, 10.5)
  const H = (t) => ({ text: t, options: { bold: true, color: WHITE, fill: { color: DARK }, fontSize: 7.5 } })
  const rows = [[H('Who'), H('What they get'), H('Measurable outcome')],
    ['NDMA / SDMAs · fire services', 'Alerts only on abnormal industrial heat, with location, facility name and reasons', '99 % fewer hotspots to triage; response targeted to the right plant, faster'],
    ['NTRO & security agencies', 'National registry of persistent thermal sources with 90-day activity history', 'Undeclared / unregistered activity surfaced; shutdowns, restarts and surges detected'],
    ['CPCB / MoEFCC / state boards', 'Fire attribution: stubble burning vs industry vs flaring, per district', 'Evidence-grade inventories for air-quality and emissions action'],
    ['Industry & insurers', 'Verified incident timeline for any site, with imagery links', 'Faster claims, compliance evidence, third-party monitoring']]
    .map((r, i) => r.map((c) => typeof c === 'string' ? { text: c, options: { fill: { color: i % 2 ? SOFT : WHITE } } } : c))
  s.addTable(rows, { x: 0.3, y: 1.28, w: 5.4, colW: [1.35, 2.15, 1.9], fontFace: SANS, fontSize: 7, color: INK, border: { type: 'solid', color: LINE, pt: 0.5 }, rowH: 0.36, margin: 0.03 })

  pointer(s, 'Benefits of the solution (social, economic, environmental, etc.)', 5.9, 0.98, 3.9, GREEN, 8.8)
  const ben = [['Social', 'Earlier warning for communities around refineries, steel and chemical complexes; fire-service capacity used where it matters.', GREEN],
    ['Economic', '₹0 data cost; one VM; losses cut by early detection; a sovereign, open alternative to paid geospatial platforms.', ORANGE],
    ['Environmental', 'Separates agricultural burning from industrial emissions; flaring & coal-fire monitoring feed climate and AQ reporting.', BLUE],
    ['Strategic', 'Explainable, auditable, air-gap deployable — fits NTRO / NDEM / Bhuvan ecosystems.', PURPLE]]
  ben.forEach(([t, d, c], i) => {
    const y = 1.28 + i * 0.5
    s.addShape(pres.shapes.RECTANGLE, { x: 5.9, y, w: 0.06, h: 0.44, fill: { color: c }, line: { color: c, width: 0 } })
    s.addText([{ text: t + ': ', options: { bold: true, color: c } }, { text: d, options: { color: INK } }], { x: 6.03, y, w: 3.7, h: 0.44, fontFace: SANS, fontSize: 7.2, valign: 'top', margin: 0, isTextBox: true })
  })
  // SDG badges
  const sdg = [['SDG 9', 'Industry & infrastructure', 'F36D25'], ['SDG 11', 'Safe, resilient cities', 'F99D26'], ['SDG 13', 'Climate action', '3F7E44'], ['SDG 3', 'Health & well-being', '4C9F38']]
  sdg.forEach(([k, t, c], i) => {
    const x = 5.9 + i * 0.97
    box(s, x, 3.3, 0.92, 0.36, { fill: c, line: c })
    txt(s, k, x, 3.31, 0.92, 0.17, { size: 7, bold: true, color: WHITE, align: 'center' })
    txt(s, t, x, 3.47, 0.92, 0.17, { size: 5.2, color: WHITE, align: 'center' })
  })

  box(s, 0.3, 3.78, 9.4, 1.44, { fill: DARK, line: DARK })
  txt(s, 'REPORT — what the working prototype already delivers (90-day labelled archive over real Indian industrial sites)', 0.45, 3.82, 9.1, 0.22, { size: 9, bold: true, color: 'FBBF24' })
  const tiles = [[fmt(M.totals[0]), 'detections classified in ~7 s'], [String(M.n_sources), 'persistent sources registered'], [String(M.totals[2]), 'incident candidates (0.6 %)'],
    [`${(M.acc * 100).toFixed(1)} %`, 'hybrid accuracy, group-aware split'], [`${(M.rules * 100).toFixed(1)} %`, 'rules-only (explainable baseline)'], ['6', 'classes · 34 features · 3 data sources']]
  tiles.forEach(([v, l], i) => {
    const x = 0.45 + (i % 3) * 3.05, y = 4.08 + Math.floor(i / 3) * 0.44
    txt(s, v, x, y, 1.05, 0.4, { size: 15, bold: true, color: 'FB923C', valign: 'middle' })
    txt(s, l, x + 1.1, y, 1.9, 0.4, { size: 7.5, color: 'E5E7EB', valign: 'middle' })
  })
  txt(s, 'Alerts found: Bhilai Steel 414 MW vs 32 MW baseline · Jamnagar Refinery 207 MW vs 19 MW · Tata Steel 101 MW vs 26 MW.  Honest note: the archive is physically simulated & labelled, so real-world accuracy will be lower — validating on confirmed incidents is the next-round goal.',
    0.45, 4.95, 9.1, 0.26, { size: 6.5, color: 'CBD5E1', italic: true })
}

// ================================================================== (extended) REPORT
if (EXTENDED) {
  const s = pres.addSlide()
  chrome(s, 'REPORT — EVALUATION OF THE PROTOTYPE', 22)
  const cls = M.classes.filter((c) => c !== 'OTHER')
  const names = { AGRICULTURAL_BURN: 'Agricultural burn', GAS_FLARE: 'Gas flare', INDUSTRIAL_FIRE: 'Industrial fire', MINING_ACTIVITY: 'Mining / coal fire', WILDFIRE: 'Wildfire' }
  box(s, 0.3, 1.0, 4.6, 2.65)
  txt(s, 'Per-class F1 score (held-out sources)', 0.45, 1.06, 4.3, 0.25, { size: 10, bold: true })
  s.addChart(pres.charts.BAR, [{ name: 'F1', labels: cls.map((c) => names[c]), values: cls.map((c) => +(M.f1[c] * 100).toFixed(1)) }], {
    x: 0.4, y: 1.3, w: 4.4, h: 2.3, barDir: 'bar', chartColors: [GREEN, YELLOW, ORANGE, PURPLE, RED], showValue: true, dataLabelPosition: 'inEnd', dataLabelColor: WHITE, dataLabelFontSize: 8,
    dataLabelFormatCode: '0.0"%"', valAxisMinVal: 90, valAxisMaxVal: 100, catAxisOrientation: 'maxMin', valAxisLabelFontSize: 8, catAxisLabelFontSize: 8, valGridLine: { color: 'E5E7EB', size: 0.5 }, catGridLine: { style: 'none' }, showLegend: false })
  box(s, 5.1, 1.0, 4.6, 2.65)
  txt(s, 'What drives the decision (permutation importance)', 5.25, 1.06, 4.3, 0.25, { size: 10, bold: true })
  const nice = { lc_cropland: 'land cover: cropland', lc_industrial: 'land cover: industrial', night_frac: 'night fraction', site_mine: 'near mine/quarry', site_gas_flare: 'near gas flare', lc_unknown: 'land cover unknown', dist_industrial_km: 'distance to industry', frp_mean: 'source mean FRP' }
  const imp = M.imp.slice(0, 8)
  s.addChart(pres.charts.BAR, [{ name: 'imp', labels: imp.map((r) => nice[r.feature] || r.feature), values: imp.map((r) => +(r.importance * 100).toFixed(2)) }], {
    x: 5.2, y: 1.3, w: 4.4, h: 2.3, barDir: 'bar', chartColors: [BLUE], showValue: true, dataLabelPosition: 'outEnd', dataLabelFontSize: 8, dataLabelFormatCode: '0.0', catAxisOrientation: 'maxMin',
    valAxisHidden: true, valGridLine: { style: 'none' }, catGridLine: { style: 'none' }, catAxisLabelFontSize: 8, showLegend: false })
  const H = (t, a = 'left') => ({ text: t, options: { bold: true, color: WHITE, fill: { color: DARK }, align: a } })
  const rows = [[H('Persistent source'), H('Class'), H('Days', 'right'), H('Mean FRP', 'right'), H('Night', 'right'), H('Alerts', 'right')]]
  M.top.slice(0, 6).forEach(([name, lab, days, frp, an, nf], i) => {
    const bg = { color: i % 2 ? SOFT : WHITE }
    rows.push([{ text: name.replace(/ – flare \d/, ' (flare)').replace('Bellary Iron Ore Quarries', 'Bellary sponge-iron units'), options: { fill: bg } }, { text: names[lab] || lab, options: { fill: bg } },
      { text: String(days), options: { align: 'right', fill: bg } }, { text: `${frp.toFixed(1)} MW`, options: { align: 'right', fill: bg } }, { text: `${Math.round(nf * 100)} %`, options: { align: 'right', fill: bg } }, { text: an ? String(an) : '–', options: { align: 'right', color: an ? RED : MUTED, bold: !!an, fill: bg } }])
  })
  s.addTable(rows, { x: 0.3, y: 3.78, w: 9.4, colW: [3.4, 1.9, 0.9, 1.2, 1.0, 1.0], fontFace: SANS, fontSize: 8, color: INK, border: { type: 'solid', color: LINE, pt: 0.5 }, rowH: 0.2, margin: 0.03 })
}

// ================================================================== 6. RESEARCH AND REFERENCES (template p6)
{
  const s = pres.addSlide()
  chrome(s, 'RESEARCH AND REFERENCES')
  pointer(s, 'Details / Links of the reference and research work', 0.3, 0.98, 9.4, INK, 10.5)
  const refs = [
    ['NASA FIRMS — Fire Information for Resource Management System; Area API & VIIRS 375 m active-fire product (VNP14IMG / VJ114IMG)', 'https://firms.modaps.eosdis.nasa.gov/api/area/'],
    ['Schroeder, W. et al. (2014). The New VIIRS 375 m active fire detection data product. Remote Sensing of Environment, 143, 85–96.', 'https://doi.org/10.1016/j.rse.2013.12.008'],
    ['Elvidge, C. D. et al. (2013). VIIRS Nightfire: Satellite Pyrometry at Night. Remote Sensing, 5(9), 4423–4449 — basis for gas-flare signatures.', 'https://doi.org/10.3390/rs5094423'],
    ['Liu, Y. et al. (2018). Identifying industrial heat sources using time-series of the VIIRS Nightfire product. Remote Sensing of Environment, 204.', 'https://www.sciencedirect.com/journal/remote-sensing-of-environment'],
    ['OpenStreetMap Overpass API & tagging: landuse=industrial, man_made=flare|works, power=plant, landuse=quarry|farmland|forest', 'https://wiki.openstreetmap.org/wiki/Overpass_API'],
    ['Copernicus Data Space — Sentinel-2 L2A SWIR (B11/B12) for hotspot verification; ESA WorldCover 10 m land cover', 'https://dataspace.copernicus.eu · https://esa-worldcover.org'],
    ['ICAR-IARI CREAMS / CPCB — crop-residue burning bulletins (Oct–Nov, Apr–May seasonality used as a prior)', 'https://creams.iari.res.in'],
    ['Ester, M. et al. (1996). DBSCAN. KDD-96 · scikit-learn HistGradientBoostingClassifier documentation', 'https://scikit-learn.org'],
    ['Our prototype — live demo & source code (Team FireOrbit)', 'https://rahulskandagal.github.io/thermal-sentinel/ · https://github.com/rahulskandagal/thermal-sentinel'],
  ]
  refs.forEach(([t, u], i) => {
    const y = 1.32 + i * 0.43
    txt(s, `${i + 1}.`, 0.4, y, 0.3, 0.22, { size: 8.5, bold: true, color: ORANGE })
    txt(s, t, 0.7, y, 8.95, 0.22, { size: 8.5, color: INK })
    txt(s, u, 0.7, y + 0.2, 8.95, 0.2, { size: 7.5, color: BLUE })
  })
}

const out = path.join(__dirname, EXTENDED ? 'SIH26162_ThermalSentinel_Idea_extended.pptx' : 'SIH26162_ThermalSentinel_Idea_6slides.pptx')
pres.writeFile({ fileName: out }).then(() => console.log('wrote', out, `(${n} slides)`))
