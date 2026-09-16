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
  chrome(s, 'ThermalSentinel — AI Classification of Industrial Fires & Persistent Thermal Sources', 15)
  diamond(s, 'Proposed Solution (Describe your Idea/Solution/Prototype)', 0.3, 0.98, 9.4)

  // Detailed explanation
  pointer(s, 'Detailed explanation of the proposed solution', 0.3, 1.32, 5.9, BLUE, 10.5)
  bl(s, ['Ingest VIIRS / MODIS hotspots from the NASA FIRMS API (near-real-time + archive), normalise both sensors to one schema.',
    'Cluster detections into thermal SOURCES (haversine DBSCAN, 750 m) and track each over 90 days → active days, night fraction, FRP baseline, persistence score.',
    'Add context from OpenStreetMap: nearest refinery / steel / power plant / gas flare / kiln / mine and land cover (cropland, forest, industrial).',
    'Hybrid classifier — explainable rules + gradient-boosted trees — labels every detection: Industrial fire · Gas flare · Mining / coal-seam fire · Agricultural burn · Wildfire · Other, with confidence and reasons.',
    'FRP-anomaly detector: a known source burning ≥ 2.5× its own baseline → incident alert (a real fire, not routine heat).',
    'Stored in a spatial DB, served as GeoJSON to a Leaflet GIS dashboard; export to QGIS / ArcGIS.'], 0.45, 1.6, 5.75, 2.25, 8.5, 1.5)

  // How it addresses
  pointer(s, 'How it addresses the problem', 0.3, 3.88, 5.9, GREEN, 10.5)
  bl(s, ['Segregates industrial fires from forest fires, crop burning, flares and mine fires — exactly the PS requirement.',
    'Only abnormal industrial heat raises an alert → 99 % fewer hotspots for a control room to triage.',
    'Every result is a map overlay + stored record → the GIS storage / visualisation requirement.'], 0.45, 4.15, 5.75, 1.1, 8.5, 1.5)

  // Innovation + comparison (right column)
  pointer(s, 'Innovation and uniqueness of the solution', 6.35, 1.32, 3.4, PURPLE, 10.5)
  bl(s, ['Fuses temporal persistence + OSM infrastructure + physical signature in ONE explainable classifier.',
    'Baseline-relative alerts tell "refinery operating" from "refinery on fire".',
    'Finds UNREGISTERED sources: persistent heat where no facility is mapped.',
    'Zero data cost; offline archive or live with one API key; working prototype online.'], 6.5, 1.6, 3.25, 1.75, 8.5, 1.5)
  const H = (t) => ({ text: t, options: { bold: true, color: WHITE, fill: { color: DARK }, align: 'center', fontSize: 7.5 } })
  const Y = () => ({ text: '✔', options: { color: GREEN, bold: true, align: 'center' } }), N = () => ({ text: '✖', options: { color: RED, bold: true, align: 'center' } }), P = () => ({ text: '◐', options: { color: YELLOW, bold: true, align: 'center' } })
  const cmp = [[{ text: 'Comparison', options: { bold: true, color: WHITE, fill: { color: DARK }, fontSize: 7.5 } }, H('FIRMS'), H('Fire dashboards'), H('Ours')],
    ['Hotspots on a map', Y(), Y(), Y()], ['Tells WHAT is burning', N(), N(), Y()], ['Industrial vs wildfire vs crop', N(), P(), Y()],
    ['Persistent-source registry', N(), N(), Y()], ['Alert vs own baseline', N(), N(), Y()], ['Explains decisions', N(), N(), Y()]]
    .map((r, i) => r.map((c) => (typeof c === 'string' ? { text: c, options: { fill: { color: i % 2 ? SOFT : WHITE } } } : { text: c.text, options: { ...c.options, fill: c.options.fill || { color: i % 2 ? SOFT : WHITE } } })))
  s.addTable(cmp, { x: 6.35, y: 3.42, w: 3.4, colW: [1.55, 0.55, 0.75, 0.55], fontFace: SANS, fontSize: 7.5, color: INK, border: { type: 'solid', color: LINE, pt: 0.5 }, rowH: 0.245, margin: 0.02 })
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
  const tech = [['Data', 'NASA FIRMS Area API (VIIRS 375 m, MODIS 1 km), OpenStreetMap Overpass, Copernicus Sentinel-2 / NASA Worldview'],
    ['Backend / ML', 'Python 3, FastAPI, pandas, NumPy, scikit-learn (DBSCAN, HistGradientBoosting), shapely'],
    ['Storage / GIS', 'SQLite → PostGIS, GeoJSON API, QGIS / ArcGIS export'],
    ['Frontend / hosting', 'React 18, Vite, Leaflet (canvas renderer); any Linux VM or GitHub Pages for the static demo']]
  tech.forEach(([k, v], i) => {
    s.addText([{ text: k + ': ', options: { bold: true, color: ORANGE } }, { text: v, options: { color: INK } }],
      { x: 0.55, y: 1.27 + i * 0.21, w: 9.1, h: 0.21, fontFace: SANS, fontSize: 8.5, margin: 0, valign: 'top', isTextBox: true })
  })

  pointer(s, 'Methodology and process for implementation (Flow Charts/Images/ working prototype)', 0.3, 2.15, 9.4, INK, 10.5)
  const flow = [['1  Ingest', 'FIRMS hotspots,\n10-day chunks,\nnormalise, de-dup', ORANGE], ['2  Cluster', 'Haversine DBSCAN\n750 m → thermal\nsources', BLUE],
    ['3  Persistence', 'active days, span,\nnight %, FRP mean\n/ CV / z-score', PURPLE], ['4  OSM context', 'nearest facility\ntype + distance,\nland cover', GREEN],
    ['5  Classify', 'rules + GBM vote\n→ 6 classes,\nconfidence, reasons', RED], ['6  Serve', 'SQLite → GeoJSON\nAPI → Leaflet GIS\ndashboard, export', DARK]]
  flow.forEach(([t, d, c], i) => {
    const x = 0.3 + i * 1.6
    box(s, x, 2.47, 1.45, 0.86, { line: c })
    s.addShape(pres.shapes.RECTANGLE, { x, y: 2.47, w: 1.45, h: 0.25, fill: { color: c }, line: { color: c, width: 0 } })
    txt(s, t, x + 0.05, 2.47, 1.35, 0.25, { size: 8.5, bold: true, color: WHITE, valign: 'middle' })
    txt(s, d, x + 0.07, 2.75, 1.33, 0.56, { size: 7, color: INK })
    if (i < 5) arrow(s, x + 1.45, 2.9, 0.15)
  })
  s.addShape(pres.shapes.LINE, { x: 7.42, y: 3.33, w: 0, h: 0.15, line: { color: RED, width: 1.5, endArrowType: 'triangle' } })
  box(s, 6.15, 3.48, 2.55, 0.34, { fill: 'FEF2F2', line: RED })
  txt(s, '⚠ Anomaly: FRP ≥ 2.5× source baseline & z ≥ 3 → incident alert', 6.22, 3.48, 2.45, 0.34, { size: 7, bold: true, color: RED, valign: 'middle' })
  txt(s, 'Inputs: NASA FIRMS (thermal anomalies) · OSM (infrastructure & land use) · Sentinel-2 / Worldview (visual verification)', 0.3, 3.4, 5.8, 0.22, { size: 7.5, color: MUTED, italic: true })

  txt(s, 'Working prototype (real screenshots)', 0.3, 3.9, 4, 0.22, { size: 9, bold: true, color: INK })
  s.addImage({ data: img('dashboard.png'), x: 0.3, y: 4.13, w: 2.0, h: 1.12 })
  s.addImage({ data: img('dashboard_detail.png'), x: 2.4, y: 4.13, w: 4.0, h: 2.25, sizing: { type: 'crop', x: 2.25, y: 0.16, w: 1.45, h: 1.12 } })
  bl(s, [`${fmt(M.totals[0])} FIRMS detections classified in ~7 s · ${M.n_sources} persistent sources · ${M.totals[2]} incident candidates`,
    `Hybrid accuracy ${(M.acc * 100).toFixed(1)} % on labelled archive (group-aware split); rules-only ${(M.rules * 100).toFixed(1)} %`,
    'Live demo: rahulskandagal.github.io/thermal-sentinel  ·  Code: github.com/rahulskandagal/thermal-sentinel'], 4.0, 4.1, 5.7, 1.15, 8, 2)
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
    ['Analysis of the feasibility of the idea', GREEN, ['All inputs are free & open: FIRMS MAP_KEY (instant), OSM Overpass, Copernicus Sentinel-2, NASA Worldview.',
      'Working end-to-end prototype exists: 22 k detections classified in 7 s on a laptop; model trains in seconds.',
      'Same pipeline switches to live FIRMS with one env variable; Overpass queried only around hotspot cells → India-wide in minutes.',
      'Lightweight stack (SQLite / FastAPI / React) → one VM, NIC cloud or an air-gapped NTRO server.',
      'Explainable rules let analysts audit and tune; ML improves as labelled incidents accumulate.',
      'Static demo already live on GitHub Pages.']],
    ['Potential challenges and risks', RED, ['Incomplete OSM coverage of Indian industry (small kilns, sponge-iron units).',
      'Cloud cover & 375 m pixel offsets between passes.',
      'Few labelled real incidents for supervised ML; synthetic archive is cleaner than reality.',
      'Overpass rate limits when scaling to national, multi-year archives.',
      'False alarms from legitimate process changes (furnace restart, maintenance flaring).',
      'Sub-pixel sources (small flares) below VIIRS detection threshold.']],
    ['Strategies for overcoming these challenges', BLUE, ['Persistence signature detects unregistered sources even without an OSM facility; curated facility list merged with OSM; Sentinel-2 chip verification.',
      '90-day window + 4 passes/day from 3 VIIRS satellites; DBSCAN grouping absorbs pixel jitter.',
      'Rules as strong prior; validate on documented incidents (news / PESO / CPCB); analyst feedback loop → retrain.',
      'Around-cell queries + disk cache; self-hosted Overpass or ESA WorldCover raster for scale.',
      'Baseline-relative thresholds + analyst override; confidence shown on every alert.',
      'Add VIIRS Nightfire (VNF) for flare temperature; Landsat TIRS for small sources.']],
  ]
  cols.forEach(([t, c, items], i) => {
    const x = 0.3 + i * 3.15
    pointer(s, t, x, 0.98, 3.05, c, 10)
    box(s, x, 1.28, 3.05, 3.05)
    bl(s, items, x + 0.1, 1.36, 2.88, 2.92, 8.5, 2)
  })
  box(s, 0.3, 4.42, 9.4, 0.8, { fill: DARK, line: DARK })
  txt(s, 'VIABILITY', 0.45, 4.46, 2, 0.2, { size: 8.5, bold: true, color: 'FBBF24' })
  const via = [['₹ 0', 'data licensing — all open sources'], ['1 VM', 'or air-gapped server; SQLite → PostGIS to scale'], ['~7 s', 'to classify a 90-day national archive'], ['1 env var', 'switches offline archive → live NASA FIRMS'], ['Open', 'GeoJSON / API — plugs into any GIS NTRO runs']]
  via.forEach(([v, l], i) => {
    const x = 0.45 + i * 1.86
    txt(s, v, x, 4.66, 1.8, 0.28, { size: 14, bold: true, color: 'FB923C' })
    txt(s, l, x, 4.94, 1.75, 0.26, { size: 7, color: 'E5E7EB' })
  })
}

// ================================================================== 5. IMPACT AND BENEFITS (template p5)
{
  const s = pres.addSlide()
  chrome(s, 'IMPACT AND BENEFITS')
  pointer(s, 'Potential impact on the target audience', 0.3, 0.98, 4.6, BLUE, 10.5)
  box(s, 0.3, 1.28, 4.6, 1.9)
  bl(s, ['Disaster management (NDMA / SDMAs / fire services): alerts only on abnormal industrial heat → faster, correctly-targeted response to plant fires & explosions.',
    'NTRO & security agencies: national registry of persistent thermal sources with activity history; detects undeclared industrial activity; change detection (shutdowns, restarts, surges).',
    'CPCB / MoEFCC: attribute district fires to stubble burning vs industry; flaring inventories.',
    'Insurers & industry: verified incident records; compliance evidence.'], 0.4, 1.36, 4.4, 1.78, 8.5, 2)
  pointer(s, 'Benefits of the solution (social, economic, environmental, etc.)', 5.1, 0.98, 4.6, GREEN, 10.5)
  box(s, 5.1, 1.28, 4.6, 1.9)
  bl(s, ['Social: earlier warning for communities near refineries, steel plants, chemical complexes; better use of fire-service capacity.',
    'Economic: 99 % fewer hotspots to triage; ₹0 data licensing; lower losses through early detection; runs on one VM.',
    'Environmental: separates agricultural burning from industrial emissions; flaring and coal-fire monitoring for climate reporting.',
    'Strategic: open, explainable, auditable — deployable on sovereign / air-gapped infrastructure.'], 5.2, 1.36, 4.4, 1.78, 8.5, 2)

  box(s, 0.3, 3.3, 9.4, 1.92, { fill: DARK, line: DARK })
  txt(s, 'REPORT — results of the working prototype (90-day labelled archive over real Indian sites)', 0.45, 3.35, 9.1, 0.25, { size: 10, bold: true, color: 'FBBF24' })
  const tiles = [[fmt(M.totals[0]), 'FIRMS detections classified in ~7 s'], [String(M.n_sources), 'persistent sources registered'], [String(M.totals[2]), 'incident candidates (0.6 % of detections)'],
    [`${(M.acc * 100).toFixed(1)} %`, 'hybrid accuracy (group-aware test split)'], [`${(M.rules * 100).toFixed(1)} %`, 'rules-only accuracy (explainable baseline)'], ['6', 'classes: industrial, flare, mining, agri, wildfire, other']]
  tiles.forEach(([v, l], i) => {
    const x = 0.45 + (i % 3) * 3.05, y = 3.65 + Math.floor(i / 3) * 0.66
    txt(s, v, x, y, 1.1, 0.42, { size: 18, bold: true, color: 'FB923C', valign: 'middle' })
    txt(s, l, x + 1.15, y, 1.85, 0.42, { size: 8, color: 'E5E7EB', valign: 'middle' })
  })
  txt(s, 'Example alerts: Bhilai Steel 414 MW vs 32 MW baseline · Jamnagar 207 MW vs 19 MW · Tata Steel 101 MW vs 26 MW.  Note: archive is physically simulated & labelled; real-world accuracy will be lower — validating on real incidents is the next-round goal.',
    0.45, 4.9, 9.1, 0.3, { size: 7, color: 'CBD5E1', italic: true })
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
