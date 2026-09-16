// Presentation deck for the SIH internal / next-round pitch (ThermalSentinel, SIH26162).
// Run: node build_presentation.js  → ThermalSentinel_Presentation.pptx
const pptxgen = require('pptxgenjs')
const fs = require('fs')
const path = require('path')

const M = JSON.parse(fs.readFileSync(path.join(__dirname, 'metrics.json'), 'utf8'))

const NAVY = '0B1020', PANEL = '111831', ORANGE = 'FF7A1A', CYAN = '22D3EE', WHITE = 'FFFFFF'
const INK = '1B2140', MUTED = '6B7597', LIGHT = 'F4F6FB', CARD = 'FFFFFF', LINE = 'DCE1F0', SOFT = 'E9EDF7'
const GREEN = '2BB673', RED = 'E5484D', YELLOW = 'E6B800', PURPLE = '9A6BFF', GREY = '9CA3AF'
const FONT = 'Calibri', HEAD = 'Cambria'
const CLASS = {
  INDUSTRIAL_FIRE: ['Industrial fire / process heat', ORANGE], GAS_FLARE: ['Gas flare', YELLOW],
  MINING_ACTIVITY: ['Mining / coal-seam fire', PURPLE], AGRICULTURAL_BURN: ['Agricultural burn', GREEN],
  WILDFIRE: ['Wildfire', RED], OTHER: ['Other / urban waste', GREY],
}

const pres = new pptxgen()
pres.layout = 'LAYOUT_16x9'
pres.title = 'ThermalSentinel — SIH26162 presentation'
const img = (f) => 'image/png;base64,' + fs.readFileSync(path.join(__dirname, f)).toString('base64')

let slideNo = 0
function header(slide, title, kicker, size = 26, h = 0.6) {
  slideNo++
  slide.background = { color: LIGHT }
  slide.addText(kicker, { x: 0.5, y: 0.26, w: 7, h: 0.3, fontFace: FONT, fontSize: 10.5, color: ORANGE, bold: true, charSpacing: 2, margin: 0, isTextBox: true })
  slide.addText(title, { x: 0.5, y: 0.52, w: 9, h, fontFace: HEAD, fontSize: size, color: INK, bold: true, valign: 'top', margin: 0, isTextBox: true })
  slide.addText('ThermalSentinel · SIH26162 · NTRO', { x: 0.5, y: 5.22, w: 5, h: 0.25, fontFace: FONT, fontSize: 9, color: MUTED, margin: 0, isTextBox: true })
  slide.addText(String(slideNo), { x: 9, y: 5.22, w: 0.5, h: 0.25, fontFace: FONT, fontSize: 9, color: MUTED, align: 'right', margin: 0, isTextBox: true })
}
function card(s, x, y, w, h, o = {}) {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, fill: { color: o.fill || CARD }, line: { color: o.line || LINE, width: 0.75 }, rectRadius: 0.08,
    shadow: { type: 'outer', color: '000000', blur: 6, offset: 1, angle: 90, opacity: 0.08 } })
}
function dot(s, x, y, color, d = 0.34, glyph, glyphColor = WHITE) {
  s.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color }, line: { color, width: 0 } })
  if (glyph) s.addText(glyph, { x, y, w: d, h: d, fontFace: FONT, fontSize: d > 0.3 ? 12 : 9, color: glyphColor, bold: true, align: 'center', valign: 'middle', margin: 0, isTextBox: true })
}
function bullets(s, items, x, y, w, h, size = 12, color = INK, gap = 4) {
  s.addText(items.map((t, i) => ({ text: t, options: { bullet: { indent: 12 }, breakLine: i < items.length - 1, paraSpaceAfter: gap } })),
    { x, y, w, h, fontFace: FONT, fontSize: size, color, valign: 'top', margin: 2, isTextBox: true })
}
function label(s, text, x, y, w, h, o = {}) {
  s.addText(text, { x, y, w, h, fontFace: FONT, fontSize: o.size || 11, color: o.color || INK, bold: !!o.bold, italic: !!o.italic,
    align: o.align || 'left', valign: o.valign || 'top', margin: 0, isTextBox: true })
}
const fmt = (n) => n.toLocaleString('en-IN')

// =====================================================================================
// 1. Title
{
  const s = pres.addSlide(); slideNo++
  s.background = { color: NAVY }
  dot(s, 0.5, 0.5, ORANGE, 0.5)
  s.addText('ThermalSentinel', { x: 1.1, y: 0.47, w: 5, h: 0.55, fontFace: HEAD, fontSize: 26, color: WHITE, bold: true, margin: 0, isTextBox: true })
  label(s, 'SMART INDIA HACKATHON 2026  ·  SIH26162  ·  NTRO', 0.5, 1.4, 9, 0.3, { size: 11, color: CYAN, bold: true })
  s.addText('AI-based detection and classification of industrial fires and persistent thermal sources', { x: 0.5, y: 1.75, w: 9, h: 1.1, fontFace: HEAD, fontSize: 28, color: WHITE, bold: true, margin: 0, isTextBox: true })
  label(s, 'NASA FIRMS  ×  OpenStreetMap  ×  Satellite imagery  →  a GIS system that tells you what is burning, and whether it should be.', 0.5, 2.95, 9, 0.5, { size: 14, color: 'C9D1EC', italic: true })
  card(s, 0.5, 4.2, 9, 0.95, { fill: PANEL, line: '243055' })
  s.addText([
    { text: 'Team: ', options: { bold: true, color: CYAN } }, { text: '<TEAM NAME>      ', options: { color: WHITE } },
    { text: 'Members: ', options: { bold: true, color: CYAN } }, { text: '<NAMES>      ', options: { color: WHITE } },
    { text: 'Institute: ', options: { bold: true, color: CYAN } }, { text: '<COLLEGE>', options: { color: WHITE } },
  ], { x: 0.7, y: 4.2, w: 8.6, h: 0.95, fontFace: FONT, fontSize: 13, valign: 'middle', margin: 0, isTextBox: true })
  s.addNotes('Opening (20 s): "Good morning. NASA already tells the world where the ground is hot — thousands of times a day over India. Nobody tells you WHAT is hot. We built the system that does." Then introduce the team in one line each.')
}

// 2. The problem
{
  const s = pres.addSlide()
  header(s, 'Every hotspot looks identical from space', 'THE PROBLEM')
  const items = [['Refinery flare', 'Jamnagar', YELLOW], ['Steel plant', 'Bhilai', ORANGE], ['Coal-seam fire', 'Jharia', PURPLE], ['Stubble burning', 'Sangrur', GREEN], ['Forest fire', 'Uttarakhand', RED]]
  items.forEach(([t, place, c], i) => {
    const x = 0.6 + i * 1.85
    card(s, x, 1.35, 1.65, 2.1)
    dot(s, x + 0.55, 1.5, 'FF4D1F', 0.55)
    label(s, 'FIRMS hotspot', x + 0.1, 2.12, 1.45, 0.25, { size: 9.5, color: MUTED, align: 'center' })
    label(s, 'lat/lon · FRP 18 MW · 08:06 UTC', x + 0.1, 2.34, 1.45, 0.25, { size: 8, color: MUTED, align: 'center' })
    s.addShape(pres.shapes.LINE, { x: x + 0.82, y: 2.62, w: 0, h: 0.28, line: { color: 'B8C0DA', width: 1.5, endArrowType: 'triangle' } })
    dot(s, x + 0.72, 2.95, c, 0.2)
    label(s, t, x + 0.1, 3.15, 1.45, 0.25, { size: 10.5, color: INK, bold: true, align: 'center' })
    label(s, place, x + 0.1, 3.36, 1.45, 0.2, { size: 8.5, color: MUTED, align: 'center' })
  })
  card(s, 0.6, 3.7, 8.8, 1.35)
  bullets(s, [
    'NASA FIRMS publishes every VIIRS / MODIS thermal anomaly within ~3 hours — location, brightness, FRP, day/night. It does NOT say what caused it.',
    'India gets thousands of detections a day: routine factory heat, flares and coal fires sit in the same list as wildfires, crop burning and real industrial accidents.',
    'Result: disaster managers cannot prioritise; a genuine refinery or steel-plant fire hides among thousands of "normal" hotspots.',
  ], 0.8, 3.8, 8.4, 1.2, 11)
  s.addNotes('Key message: the data exists, the interpretation does not. FIRMS is a list of hot pixels. Point to the five cards: same pixel, five completely different situations — only one of them needs a fire brigade.')
}

// 3. Why it matters
{
  const s = pres.addSlide()
  header(s, 'Why this matters for India', 'CONTEXT')
  const facts = [
    ['375 m', 'VIIRS pixel — enough to see a single furnace, flare stack or field', CYAN],
    ['4+ / day', 'satellite passes over India (Suomi-NPP, NOAA-20/21, day + night)', ORANGE],
    ['100+ yrs', 'Jharia coal-seam fires burning — a permanent "hotspot" that is not an emergency', PURPLE],
    ['30,000+', 'farm-fire detections in Punjab alone in a single Kharif season', GREEN],
  ]
  facts.forEach(([n, t, c], i) => {
    const x = 0.5 + i * 2.3
    card(s, x, 1.35, 2.15, 1.55, { fill: NAVY, line: NAVY })
    s.addText(n, { x: x + 0.15, y: 1.42, w: 1.9, h: 0.55, fontFace: HEAD, fontSize: 26, bold: true, color: c, margin: 0, isTextBox: true })
    label(s, t, x + 0.15, 2.0, 1.9, 0.85, { size: 9.5, color: 'C9D1EC' })
  })
  card(s, 0.5, 3.1, 4.4, 1.95)
  label(s, 'What NTRO asked for (PS SIH26162)', 0.7, 3.2, 4.1, 0.3, { size: 12.5, bold: true, color: ORANGE })
  bullets(s, ['Classification & segregation of industrial fires from forest fires and other natural fires',
    'A GIS-based solution: data storage + visualisation of the output as an overlay over maps',
    'Integrate thermal anomaly data, land cover, industrial infrastructure databases and satellite imagery'], 0.7, 3.55, 4.1, 1.45, 10.5)
  card(s, 5.1, 3.1, 4.4, 1.95)
  label(s, 'Who is hurt today', 5.3, 3.2, 4.1, 0.3, { size: 12.5, bold: true, color: RED })
  bullets(s, ['Fire services & SDMAs respond late or to the wrong hotspots',
    'Security agencies have no registry of persistent thermal sources or undeclared industrial activity',
    'Pollution boards cannot separate stubble burning from industrial emissions in the same district'], 5.3, 3.55, 4.1, 1.45, 10.5)
  s.addNotes('Tie the numbers to the story: satellites are good enough (375 m), frequent enough (4+ passes/day), but the signal is drowned — Jharia alone produces detections every single day, Punjab produces tens of thousands each season. Then read the PS requirements — we cover all three bullets.')
}

// 4. Our solution
{
  const s = pres.addSlide()
  header(s, 'ThermalSentinel — what it does', 'OUR SOLUTION')
  const pillars = [
    ['1', 'Classify', 'Every FIRMS detection → one of 6 classes: industrial fire / process heat, gas flare, mining & coal-seam fire, agricultural burn, wildfire, other. With a confidence and a plain-English reason.', ORANGE],
    ['2', 'Track', 'Groups detections into thermal sources and follows them over 90 days: active days, night fraction, FRP baseline → a persistence score and a registry of persistent sources.', CYAN],
    ['3', 'Alert', 'Flags FRP anomalies: a known source burning ≥ 2.5× its own normal is an incident candidate — a real industrial fire, not routine heat.', RED],
  ]
  pillars.forEach(([n, t, d, c], i) => {
    const y = 1.35 + i * 1.25
    card(s, 0.5, y, 4.6, 1.12)
    dot(s, 0.65, y + 0.15, c, 0.36, n)
    label(s, t, 1.12, y + 0.14, 3.8, 0.35, { size: 14, bold: true, color: INK, valign: 'middle' })
    label(s, d, 0.65, y + 0.5, 4.3, 0.6, { size: 9.5, color: INK })
  })
  s.addImage({ data: img('dashboard.png'), x: 5.3, y: 1.35, w: 4.2, h: 2.36, shadow: { type: 'outer', color: '000000', blur: 8, offset: 2, angle: 90, opacity: 0.25 } })
  label(s, 'Working prototype — interactive GIS dashboard, REST/GeoJSON API, runs on a laptop', 5.3, 3.75, 4.2, 0.3, { size: 9, color: MUTED, italic: true })
  card(s, 5.3, 4.1, 4.2, 0.95, { fill: SOFT, line: SOFT })
  label(s, 'Only free, open data: NASA FIRMS · OpenStreetMap (Overpass) · Copernicus Sentinel-2 · NASA Worldview.  No licences, no cost, works offline on an archive and live with one API key.', 5.45, 4.17, 3.9, 0.85, { size: 9.5, color: INK })
  s.addNotes('Three verbs: classify, track, alert. Stress that "alert" is the disaster-management payoff — separating a refinery operating normally from a refinery on fire. Mention that everything on the right is running code, not a mock-up.')
}

// 5. Dashboard walkthrough
{
  const s = pres.addSlide()
  header(s, 'The GIS dashboard', 'LIVE PROTOTYPE')
  s.addImage({ data: img('dashboard.png'), x: 0.5, y: 1.2, w: 6.8, h: 3.825, shadow: { type: 'outer', color: '000000', blur: 8, offset: 2, angle: 90, opacity: 0.25 } })
  const notes = [
    ['A', 'KPIs & daily timeline', 'detections, persistent sources, incident candidates; stacked bars per class per day'],
    ['B', 'Top persistent sources', 'ranked by persistence score, one click flies to the site'],
    ['C', 'Class filters & layers', 'class, date range, min confidence, persistent-only, anomalies-only'],
    ['D', 'Map overlays', 'coloured detections (size = FRP), dashed footprints = persistent sources, OSM factory icons'],
    ['E', 'Detail drawer', 'reasons, persistence stats, source time-series, links to Sentinel-2 / Worldview'],
    ['F', 'GIS export', 'GeoJSON → QGIS / ArcGIS; full REST API at /docs'],
  ]
  notes.forEach(([k, t, d], i) => {
    const y = 1.2 + i * 0.64
    dot(s, 7.5, y + 0.02, ORANGE, 0.26, k)
    label(s, t, 7.85, y - 0.02, 1.7, 0.25, { size: 10, bold: true, color: INK })
    label(s, d, 7.85, y + 0.2, 1.7, 0.45, { size: 8, color: MUTED })
  })
  const marks = [['A', 0.4, 1.42], ['B', 0.4, 3.02], ['C', 0.4, 4.05], ['D', 4.0, 3.85]]
  marks.forEach(([k, x, y]) => dot(s, x, y, ORANGE, 0.24, k))
  s.addNotes('If the live demo works, switch to the browser here. Script: (1) zoom to Jamnagar — orange persistent footprint, 86 active days, the April incident spike in the timeline; (2) toggle "anomalies only"; (3) click a green dot in Punjab — cropland + season + low FRP reasons; (4) export GeoJSON. Fallback: this slide.')
}

// 5b. Anatomy of a persistent source
{
  const s = pres.addSlide()
  header(s, 'Anatomy of a persistent source — Jamnagar Refinery', 'LIVE PROTOTYPE', 24)
  // crop the right part of the 1600x900 capture (map footprint + detail drawer)
  // image scaled to 8.0 x 4.5 in; crop the right 700 px x 760 px region (map footprint + detail drawer)
  s.addImage({ data: img('dashboard_detail.png'), x: 0.6, y: 1.25, w: 8.0, h: 4.5,
    sizing: { type: 'crop', x: 4.5, y: 0.3, w: 3.5, h: 3.8 },
    shadow: { type: 'outer', color: '000000', blur: 8, offset: 2, angle: 90, opacity: 0.25 } })
  const notes = [
    ['Class + confidence', 'Industrial fire / process heat · persistent source · ⚠ 6 anomalies', ORANGE],
    ['Persistence', '86 active days of 90 · 469 detections · 59 % night · score 0.97', CYAN],
    ['Context', 'land cover industrial · 30 m from OSM refinery polygon', GREEN],
    ['Timeline', 'ΣFRP per day — steady baseline ~19 MW, one spike to 207 MW on 21 Apr → incident candidate', RED],
    ['Verify', 'one click to Sentinel-2 SWIR, NASA Worldview, FIRMS, OSM, Google Earth for that date & place', PURPLE],
  ]
  notes.forEach(([t, d, c], i) => {
    const y = 1.3 + i * 0.75
    card(s, 4.4, y, 5.1, 0.65)
    dot(s, 4.53, y + 0.16, c, 0.3, String(i + 1))
    label(s, t, 4.95, y + 0.07, 4.45, 0.25, { size: 10.5, bold: true, color: INK })
    label(s, d, 4.95, y + 0.3, 4.45, 0.35, { size: 8.5, color: MUTED })
  })
  s.addNotes('This is one click in the dashboard. Walk top to bottom: what it is and how sure we are; why it is persistent; the context that made the decision; the timeline that shows the one abnormal day; and the imagery links an analyst uses to confirm. Emphasise: routine days are silent — only the spike alerts.')
}

// 6. Pipeline
{
  const s = pres.addSlide()
  header(s, 'How it works — the pipeline', 'ARCHITECTURE')
  const steps = [
    ['Ingest', 'FIRMS Area API — VIIRS SNPP / NOAA-20 / 21 + MODIS. 10-day chunks, NRT + archive CSV. Normalise both sensors to one schema, de-dup overlapping passes.', ORANGE],
    ['Cluster', 'Haversine DBSCAN (750 m). Pixel jitter between passes collapses into one "thermal source" — 22 k dots → 4.4 k sources.', CYAN],
    ['Persistence', 'Per source over 90 d: active days, span, max gap, night fraction, FRP mean / CV / z-score → persistence score.', PURPLE],
    ['OSM context', 'Overpass queried only around hotspot cells: refineries, steel, power, flares, kilns, mines + land-use polygons (point-in-polygon).', GREEN],
    ['Classify', 'Explainable rule engine + gradient-boosted trees vote. Confidence, reasons, FRP-anomaly flag.', RED],
    ['Serve', 'SQLite → FastAPI GeoJSON API → React + Leaflet dashboard, QGIS export, imagery deep-links.', INK],
  ]
  steps.forEach(([t, d, c], i) => {
    const col = i % 3, row = Math.floor(i / 3)
    const x = 0.5 + col * 3.05, y = 1.35 + row * 1.9
    card(s, x, y, 2.9, 1.7)
    dot(s, x + 0.15, y + 0.15, c, 0.34, String(i + 1))
    label(s, t, x + 0.6, y + 0.14, 2.2, 0.36, { size: 14, bold: true, color: INK, valign: 'middle' })
    label(s, d, x + 0.15, y + 0.6, 2.6, 1.05, { size: 9.5, color: INK })
    if (col < 2) s.addShape(pres.shapes.LINE, { x: x + 2.9, y: y + 0.85, w: 0.15, h: 0, line: { color: 'B8C0DA', width: 1.5, endArrowType: 'triangle' } })
  })
  s.addNotes('Walk left-to-right, top-to-bottom. The two clever engineering decisions to call out: (a) DBSCAN clustering — without it, persistence cannot be computed because the satellite never puts the same factory on the same pixel twice; (b) Overpass "around hotspot cells" — makes OSM context feasible India-wide instead of downloading the whole country.')
}

// 7. Three clues
{
  const s = pres.addSlide()
  header(s, 'Three clues separate the classes', 'THE INTELLIGENCE')
  const clues = [
    ['Persistence (time)', 'Has this exact spot been hot again and again?', [['Refinery', 86, ORANGE], ['Gas flare', 84, YELLOW], ['Coal fire', 86, PURPLE], ['Wildfire', 5, RED], ['Crop burn', 1, GREEN]], 'active days in 90'],
    ['Context (place)', 'What is on the ground here, per OpenStreetMap?', [['≤1.5 km from refinery / steel / power', ORANGE], ['man_made=flare, oil & gas field', YELLOW], ['landuse=quarry, mine', PURPLE], ['landuse=farmland (+ Apr–May / Oct–Nov)', GREEN], ['landuse=forest, natural=scrub', RED]], null],
    ['Signature (physics)', 'How does it burn?', [['Steady FRP, ~50 % night, daily', ORANGE], ['Small, very steady, 80 %+ night', YELLOW], ['Low FRP, diffuse, day & night', PURPLE], ['Huge, variable FRP, spreads', RED], ['Low FRP, daytime, gone next day', GREEN]], null],
  ]
  clues.forEach(([t, q, rows, unit], i) => {
    const x = 0.5 + i * 3.05
    card(s, x, 1.35, 2.9, 3.7)
    label(s, t, x + 0.15, 1.45, 2.6, 0.3, { size: 13, bold: true, color: INK })
    label(s, q, x + 0.15, 1.75, 2.6, 0.4, { size: 9.5, color: MUTED, italic: true })
    rows.forEach((r, j) => {
      const y = 2.25 + j * 0.54
      if (unit) {
        const [name, days, c] = r
        label(s, name, x + 0.15, y, 0.9, 0.25, { size: 9.5, color: INK })
        s.addShape(pres.shapes.RECTANGLE, { x: x + 1.05, y: y + 0.04, w: Math.max(0.03, 1.4 * (days / 90)), h: 0.17, fill: { color: c }, line: { color: c, width: 0 } })
        label(s, `${days} d`, x + 1.05 + 1.4 * (days / 90) + 0.05, y, 0.5, 0.25, { size: 8.5, color: MUTED })
      } else {
        const [txt, c] = r
        dot(s, x + 0.15, y + 0.05, c, 0.16)
        label(s, txt, x + 0.4, y, 2.4, 0.45, { size: 9.5, color: INK })
      }
    })
    if (unit) label(s, unit, x + 1.05, 4.85, 1.6, 0.2, { size: 8, color: MUTED })
  })
  s.addNotes('This is the slide that shows we understand the domain. No single clue works alone: a brick kiln on farmland, a forest fire next to a mine. The classifier sees all three at once — 34 features.')
}

// 8. Classifier & anomaly
{
  const s = pres.addSlide()
  header(s, 'Hybrid classifier: explainable rules + ML', 'THE MODEL')
  card(s, 0.5, 1.35, 4.4, 2.15)
  label(s, 'Rule engine (transparent)', 0.7, 1.45, 4, 0.3, { size: 12.5, bold: true, color: ORANGE })
  s.addText([
    { text: 'IF ', options: { bold: true, color: PURPLE } }, { text: 'persistent ∧ night ≥ 60 % ∧ FRP-CV ≤ 0.9 ∧ near oil/gas ', options: {} }, { text: '→ GAS_FLARE', options: { bold: true, breakLine: true } },
    { text: 'IF ', options: { bold: true, color: PURPLE } }, { text: 'dist(refinery|steel|power) ≤ 1.5 km ', options: {} }, { text: '→ INDUSTRIAL_FIRE', options: { bold: true, breakLine: true } },
    { text: 'IF ', options: { bold: true, color: PURPLE } }, { text: 'cropland ∧ Apr–May|Oct–Nov ∧ day ∧ FRP < 25 ∧ ≤ 2 days ', options: {} }, { text: '→ AGRI_BURN', options: { bold: true, breakLine: true } },
    { text: 'IF ', options: { bold: true, color: PURPLE } }, { text: 'forest|scrub ∧ not persistent ∧ > 3 km from industry ', options: {} }, { text: '→ WILDFIRE', options: { bold: true } },
  ], { x: 0.7, y: 1.8, w: 4.05, h: 1.25, fontFace: 'Courier New', fontSize: 8.5, color: INK, valign: 'top', margin: 0, isTextBox: true })
  label(s, 'Every decision returns human-readable reasons → shown in the UI, auditable by analysts.', 0.7, 3.05, 4.05, 0.4, { size: 9.5, color: MUTED, italic: true })

  card(s, 5.1, 1.35, 4.4, 2.15)
  label(s, 'Gradient-boosted trees (learned)', 5.3, 1.45, 4, 0.3, { size: 12.5, bold: true, color: CYAN })
  bullets(s, ['scikit-learn HistGradientBoosting on 34 features (radiometry, persistence, OSM context, land cover, calendar)',
    `Trained on ${fmt(M.n_train)} labelled detections, tested on ${fmt(M.n_test)} — group-aware split: all detections of one source stay on one side, so nothing leaks`,
    'ML label used when probability ≥ 0.55, else rules; agreement raises confidence'], 5.3, 1.8, 4.05, 1.65, 9.5)

  card(s, 0.5, 3.65, 9, 1.4, { fill: NAVY, line: NAVY })
  label(s, '⚠  FRP-anomaly detector — the disaster-management trigger', 0.7, 3.73, 8.6, 0.3, { size: 12.5, bold: true, color: YELLOW })
  s.addText([
    { text: 'For a persistent source with baseline FRP μ and σ:  ', options: { color: 'C9D1EC' } },
    { text: 'anomaly  ⇔  FRP ≥ 2.5 μ  and  (FRP − μ)/σ ≥ 3', options: { bold: true, color: WHITE, fontFace: 'Courier New' } },
  ], { x: 0.7, y: 4.05, w: 8.6, h: 0.3, fontFace: FONT, fontSize: 11, margin: 0, isTextBox: true })
  label(s, `Found ${M.totals[2]} incident candidates in the 90-day archive — e.g. Bhilai Steel 414 MW vs 32 MW baseline, Jamnagar 207 MW vs 19 MW. Routine operation is silent; only the abnormal day raises an alert.`, 0.7, 4.38, 8.6, 0.6, { size: 10, color: 'C9D1EC' })
  s.addNotes('Anticipated question: "why not a CNN on satellite images?" Answer: FIRMS gives us a point + FRP, not an image; the discriminating information is temporal and contextual, which tabular ML handles well and explainably. Imagery is the verification step (deep links), and a Sentinel-2 chip classifier is on the roadmap.')
}

// 9. Results
{
  const s = pres.addSlide()
  header(s, 'Results on the labelled 90-day archive', 'EVALUATION')
  const tiles = [[`${(M.acc * 100).toFixed(1)} %`, 'hybrid ML + rules accuracy', ORANGE], [`${(M.rules * 100).toFixed(1)} %`, 'rules-only accuracy', CYAN], [fmt(M.totals[0]), 'detections classified in ~7 s', GREEN], [String(M.n_sources), 'persistent sources registered', PURPLE]]
  tiles.forEach(([n, l, c], i) => {
    const x = 0.5 + i * 2.3
    card(s, x, 1.3, 2.15, 0.95, { fill: NAVY, line: NAVY })
    s.addText(n, { x: x + 0.15, y: 1.33, w: 1.9, h: 0.5, fontFace: HEAD, fontSize: 22, bold: true, color: c, margin: 0, isTextBox: true })
    label(s, l, x + 0.15, 1.85, 1.9, 0.3, { size: 9, color: 'C9D1EC' })
  })
  const cls = M.classes.filter((c) => c !== 'OTHER')
  card(s, 0.5, 2.4, 4.4, 2.6)
  label(s, 'Per-class F1 (held-out sources)', 0.7, 2.47, 4, 0.3, { size: 11.5, bold: true, color: INK })
  s.addChart(pres.charts.BAR, [{ name: 'F1', labels: cls.map((c) => CLASS[c][0]), values: cls.map((c) => +(M.f1[c] * 100).toFixed(1)) }], {
    x: 0.6, y: 2.75, w: 4.2, h: 2.2, barDir: 'bar', chartColors: cls.map((c) => CLASS[c][1]),
    showValue: true, dataLabelPosition: 'inEnd', dataLabelFontSize: 8, dataLabelColor: WHITE, dataLabelFormatCode: '0.0"%"', catAxisOrientation: 'maxMin',
    valAxisMinVal: 90, valAxisMaxVal: 100, valAxisLabelFontSize: 8, catAxisLabelFontSize: 8, valAxisLabelColor: MUTED, catAxisLabelColor: INK,
    valGridLine: { color: 'E4E8F3', size: 0.5 }, catGridLine: { style: 'none' }, showLegend: false, showTitle: false,
  })
  card(s, 5.1, 2.4, 4.4, 2.6)
  label(s, 'What drives the decision (permutation importance)', 5.3, 2.47, 4, 0.3, { size: 11.5, bold: true, color: INK })
  const imp = M.imp.slice(0, 8)
  const nice = { lc_cropland: 'land cover: cropland', lc_industrial: 'land cover: industrial', night_frac: 'night fraction', site_mine: 'near mine/quarry', site_gas_flare: 'near gas flare', lc_unknown: 'land cover unknown', dist_industrial_km: 'distance to industry', frp_mean: 'source mean FRP', n_days: 'active days', lc_forest: 'land cover: forest' }
  s.addChart(pres.charts.BAR, [{ name: 'importance', labels: imp.map((r) => nice[r.feature] || r.feature), values: imp.map((r) => +(r.importance * 100).toFixed(2)) }], {
    x: 5.2, y: 2.75, w: 4.2, h: 2.2, barDir: 'bar', chartColors: [CYAN], showValue: true, dataLabelPosition: 'outEnd', dataLabelFontSize: 8, dataLabelColor: INK, dataLabelFormatCode: '0.0', catAxisOrientation: 'maxMin',
    valAxisHidden: true, valGridLine: { style: 'none' }, catGridLine: { style: 'none' }, catAxisLabelFontSize: 8, catAxisLabelColor: INK, showLegend: false, showTitle: false,
  })
  label(s, `Note: archive is physically-simulated over real sites, so it is clean; real-world accuracy will be lower. "Other" class had no held-out sources. Split = ${fmt(M.n_train)} / ${fmt(M.n_test)} detections.`, 0.5, 5.02, 9, 0.22, { size: 8, color: MUTED, italic: true })
  s.addNotes('Be upfront: the archive is synthetic-but-physical (real coordinates, realistic behaviour, labelled). The point of this slide is that the pipeline is measurable and the model learns sensible things — land cover, night fraction, proximity to infrastructure, persistence. With a FIRMS key we run on live data; with analyst-labelled incidents we retrain.')
}

// 10. What it found
{
  const s = pres.addSlide()
  header(s, 'What the system found in 90 days', 'OUTPUT')
  const H = (t, align = 'left') => ({ text: t, options: { bold: true, color: WHITE, fill: { color: NAVY }, align } })
  const rows = [[H('Persistent source'), H('Class'), H('Days', 'right'), H('Mean FRP', 'right'), H('Night', 'right'), H('⚠', 'right')]]
  M.top.forEach(([name, lab, days, frp, an, nf], i) => {
    const bg = { color: i % 2 ? 'F7F8FC' : WHITE }
    const clsColor = CLASS[lab][1] === YELLOW ? 'A88400' : CLASS[lab][1]
    rows.push([{ text: name.replace(/ – flare \d/, ' (flare)').replace('Bellary Iron Ore Quarries', 'Bellary sponge-iron units'), options: { fill: bg } }, { text: CLASS[lab][0], options: { color: clsColor, bold: true, fill: bg } },
      { text: String(days), options: { align: 'right', fill: bg } }, { text: `${frp.toFixed(1)} MW`, options: { align: 'right', fill: bg } },
      { text: `${Math.round(nf * 100)} %`, options: { align: 'right', fill: bg } }, { text: an ? String(an) : '–', options: { align: 'right', color: an ? RED : MUTED, bold: !!an, fill: bg } }])
  })
  s.addTable(rows, { x: 0.5, y: 1.3, w: 5.6, colW: [2.15, 1.5, 0.5, 0.75, 0.45, 0.25], fontFace: FONT, fontSize: 8.5, color: INK, border: { type: 'solid', color: LINE, pt: 0.5 }, rowH: 0.29, margin: 0.04 })
  label(s, 'Top persistent sources by persistence score (Mar–May 2025 archive).', 0.5, 4.0, 5.6, 0.25, { size: 8.5, color: MUTED, italic: true })
  label(s, 'Note how the flares show 82–87 % night detections and a steady ~6 MW — exactly the signature the classifier keys on.', 0.5, 4.3, 5.6, 0.5, { size: 9.5, color: INK })

  card(s, 6.3, 1.3, 3.2, 3.75, { fill: NAVY, line: NAVY })
  label(s, '⚠ Incident candidates', 6.5, 1.4, 2.9, 0.3, { size: 12.5, bold: true, color: YELLOW })
  label(s, "FRP spikes far above the source's own baseline", 6.5, 1.7, 2.9, 0.3, { size: 9, color: 'C9D1EC', italic: true })
  M.anom_sites.forEach(([name, n, mean, max], i) => {
    const y = 2.1 + i * 0.4
    label(s, name.replace(' (coal-seam fires)', ''), 6.5, y, 2.9, 0.22, { size: 9.5, bold: true, color: WHITE })
    label(s, `${max.toFixed(0)} MW peak vs ${mean.toFixed(0)} MW normal · ${n} days`, 6.5, y + 0.2, 2.9, 0.2, { size: 8, color: 'C9D1EC' })
  })
  label(s, `${M.totals[2]} of ${fmt(M.totals[0])} detections flagged (0.6 %) — the short list a control room actually needs to look at.`, 6.5, 4.55, 2.9, 0.45, { size: 9, color: ORANGE })
  s.addNotes('Read the incident column: 138 flagged out of 22,179 — that is a 99.4 % noise reduction for an operator. The Bhilai example: 414 MW against a 32 MW baseline, on one day, at a known steel plant. That is the alert you want at 3 a.m.')
}

// 11. Architecture / stack
{
  const s = pres.addSlide()
  header(s, 'System architecture & technology', 'ENGINEERING')
  const layers = [
    ['Data sources', ['NASA FIRMS Area API (VIIRS 375 m, MODIS 1 km)', 'OpenStreetMap via Overpass', 'Copernicus Sentinel-2 / NASA Worldview (verification)'], CYAN],
    ['Processing (Python)', ['pandas · numpy · scikit-learn (DBSCAN, HistGradientBoosting)', 'shapely STRtree point-in-polygon', 'rule engine + anomaly detector'], ORANGE],
    ['Storage & API', ['SQLite (PostGIS-ready schema)', 'FastAPI — GeoJSON endpoints, background jobs', 'OpenAPI docs at /docs'], PURPLE],
    ['Presentation', ['React 18 + Vite', 'Leaflet with canvas renderer (40 k+ points)', 'GeoJSON export → QGIS / ArcGIS / Google Earth'], GREEN],
  ]
  layers.forEach(([t, items, c], i) => {
    const y = 1.3 + i * 0.95
    card(s, 0.5, y, 5.6, 0.85)
    s.addShape(pres.shapes.OVAL, { x: 0.65, y: y + 0.27, w: 0.3, h: 0.3, fill: { color: c }, line: { color: c, width: 0 } })
    label(s, t, 1.1, y + 0.08, 1.6, 0.7, { size: 12, bold: true, color: INK, valign: 'middle' })
    bullets(s, items, 2.7, y + 0.06, 3.3, 0.78, 8.5, INK, 1)
  })
  card(s, 6.3, 1.3, 3.2, 3.75)
  label(s, 'Design decisions', 6.5, 1.4, 2.9, 0.3, { size: 12.5, bold: true, color: INK })
  bullets(s, ['Around-cell Overpass queries + disk cache → OSM context scales India-wide',
    'Canvas rendering, not DOM markers → smooth with tens of thousands of points',
    'Offline demo archive + live mode share one code path → one env variable to go live',
    'Everything is GeoJSON → plugs into any GIS NTRO already runs',
    'Explainability first → analysts can audit, override, and feed corrections back'], 6.5, 1.75, 2.9, 3.2, 9.5)
  s.addNotes('Keep this short unless asked. If a judge is technical: SQLite is deliberate for the hackathon; the schema and API are PostGIS-ready and we would add a tile server for multi-year national archives.')
}

// 12. Differentiation
{
  const s = pres.addSlide()
  header(s, 'How this differs from what exists', 'DIFFERENTIATION')
  const hdr = (t) => ({ text: t, options: { bold: true, color: WHITE, fill: { color: NAVY }, align: 'center' } })
  const mark = (ch, color) => ({ text: ch, options: { color, bold: true, align: 'center' } })
  const yes = () => mark('✔', GREEN), no = () => mark('✖', RED), part = () => mark('◐', 'A88400')
  const body = [
    ['Shows thermal anomalies on a map', yes(), yes(), yes()],
    ['Says what caused the anomaly (6 classes)', no(), no(), yes()],
    ['Separates industrial fire from wildfire / agri burning', no(), part(), yes()],
    ['Registry of persistent sources with history', no(), no(), yes()],
    ['Incident alert: FRP anomaly vs own baseline', no(), no(), yes()],
    ['Uses OSM infrastructure + land cover as context', no(), no(), yes()],
    ['Explains every decision (reasons)', no(), no(), yes()],
    ['Open GeoJSON API, GIS export', part(), part(), yes()],
    ['Free & open data only', yes(), part(), yes()],
  ]
  const rows = [[{ text: 'Capability', options: { bold: true, color: WHITE, fill: { color: NAVY } } }, hdr('NASA FIRMS map'), hdr('Generic fire dashboards'), hdr('ThermalSentinel')]]
  body.forEach((r, i) => {
    const bg = { color: i % 2 ? 'F7F8FC' : WHITE }
    rows.push(r.map((c) => typeof c === 'string' ? { text: c, options: { fill: bg } } : { text: c.text, options: { ...c.options, fill: bg } }))
  })
  s.addTable(rows, { x: 0.5, y: 1.3, w: 9, colW: [4.2, 1.6, 1.6, 1.6], fontFace: FONT, fontSize: 10, color: INK, border: { type: 'solid', color: LINE, pt: 0.5 }, rowH: 0.33, margin: 0.05 })
  label(s, 'Novelty: combining temporal persistence, OSM infrastructure context and physical signature in one explainable classifier, with baseline-relative anomaly alerts — none of the existing public tools do this.', 0.5, 4.7, 9, 0.45, { size: 10, color: INK, italic: true })
  s.addNotes('If asked about published research: Liu et al. 2018 identified industrial heat sources from VIIRS Nightfire time-series; Elvidge et al. built global flare catalogues. We build on that idea but add OSM context, six-class discrimination, and operational alerting on a live GIS.')
}

// 13. Impact
{
  const s = pres.addSlide()
  header(s, 'Impact & beneficiaries', 'WHY IT MATTERS')
  const cols = [
    ['Disaster management', 'NDMA / SDMAs · fire services', GREEN, ['Alerts only on abnormal industrial heat — 99 % fewer hotspots to triage', 'Faster, correctly-targeted response to plant fires and explosions', 'Standing watch on coal-seam fires (Jharia, Raniganj)']],
    ['Security & strategic', 'NTRO and partner agencies', CYAN, ['National registry of persistent thermal sources with activity history', 'Detect unregistered or undeclared industrial activity (persistent heat with no OSM facility)', 'Change detection: shutdowns, restarts, capacity surges']],
    ['Environment & economy', 'CPCB · MoEFCC · insurers', PURPLE, ['Attribute district-level fires: stubble burning vs industry', 'Flaring inventories for emissions reporting', 'Verified incident records for insurance and compliance']],
  ]
  cols.forEach(([t, who, c, items], i) => {
    const x = 0.5 + i * 3.05
    card(s, x, 1.3, 2.9, 2.9)
    dot(s, x + 0.15, 1.42, c, 0.22)
    label(s, t, x + 0.45, 1.37, 2.35, 0.3, { size: 12, bold: true, color: INK })
    label(s, who, x + 0.45, 1.65, 2.35, 0.25, { size: 8.5, color: MUTED })
    bullets(s, items, x + 0.15, 1.95, 2.6, 2.2, 9.5)
  })
  card(s, 0.5, 4.35, 9, 0.7, { fill: NAVY, line: NAVY })
  label(s, 'Zero data cost · deployable on one VM or an air-gapped server · outputs plug into existing GIS · improves as analysts label real incidents.', 0.7, 4.35, 8.6, 0.7, { size: 11, color: WHITE, valign: 'middle' })
  s.addNotes('Pick the beneficiary that matches the judge panel. For NTRO emphasise the middle column: a living registry of persistent heat sources — and the ability to spot activity where no facility is declared.')
}

// 14. Roadmap
{
  const s = pres.addSlide()
  header(s, 'Where we take it next', 'ROADMAP')
  const phases = [
    ['Done — prototype', GREEN, ['End-to-end pipeline, 6-class hybrid classifier', 'Persistent-source registry + FRP-anomaly alerts', 'GIS dashboard, GeoJSON API, QGIS export', 'Offline labelled archive; live-FIRMS switch']],
    ['Next round — validation', ORANGE, ['Live FIRMS ingestion for all India (MAP_KEY)', 'Validate against documented incidents (news / PESO / CPCB records)', 'Analyst feedback loop: label → retrain', 'Curated facility list to fill OSM gaps']],
    ['Finals — scale & depth', CYAN, ['Sentinel-2 SWIR chip classifier (CNN) per persistent source', 'ESA WorldCover 10 m raster where OSM is sparse', 'PostGIS + tile server, multi-year archive', 'Alerting: e-mail / SMS / webhook on anomalies']],
  ]
  phases.forEach(([t, c, items], i) => {
    const x = 0.5 + i * 3.05
    card(s, x, 1.3, 2.9, 2.55)
    s.addShape(pres.shapes.OVAL, { x: x + 0.15, y: 1.42, w: 0.26, h: 0.26, fill: { color: c }, line: { color: c, width: 0 } })
    label(s, t, x + 0.5, 1.38, 2.3, 0.35, { size: 12.5, bold: true, color: INK })
    bullets(s, items, x + 0.15, 1.85, 2.6, 1.95, 9.5)
    if (i < 2) s.addShape(pres.shapes.LINE, { x: x + 2.9, y: 2.55, w: 0.15, h: 0, line: { color: 'B8C0DA', width: 1.5, endArrowType: 'triangle' } })
  })
  card(s, 0.5, 4.05, 9, 0.75, { fill: NAVY, line: NAVY })
  label(s, 'Our ask for the next round: access to any historical incident records NTRO / partner agencies can share, so we can validate against confirmed events.', 0.7, 4.05, 8.6, 0.75, { size: 11, color: WHITE, valign: 'middle' })
  s.addNotes('Shows the judges we know what is missing. The honest limitation is validation on real, confirmed incidents — say it before they do, and turn it into an ask.')
}

// 15. Closing
{
  const s = pres.addSlide(); slideNo++
  s.background = { color: NAVY }
  dot(s, 0.5, 0.5, ORANGE, 0.5)
  s.addText('ThermalSentinel', { x: 1.1, y: 0.47, w: 5, h: 0.55, fontFace: HEAD, fontSize: 26, color: WHITE, bold: true, margin: 0, isTextBox: true })
  s.addText('FIRMS tells you where it is hot.\nWe tell you what is burning — and whether it should be.', { x: 0.5, y: 1.5, w: 9, h: 1.4, fontFace: HEAD, fontSize: 28, color: WHITE, bold: true, margin: 0, isTextBox: true })
  const pts = [['6', 'classes'], [String(M.n_sources), 'persistent sources'], [String(M.totals[2]), 'incident alerts'], [`${(M.acc * 100).toFixed(1)} %`, 'accuracy']]
  pts.forEach(([n, l], i) => {
    s.addText(n, { x: 0.5 + i * 2.3, y: 3.1, w: 2.1, h: 0.55, fontFace: HEAD, fontSize: 26, bold: true, color: ORANGE, margin: 0, isTextBox: true })
    label(s, l, 0.5 + i * 2.3, 3.65, 2.1, 0.3, { size: 11, color: 'C9D1EC' })
  })
  label(s, 'Live demo · http://localhost:5173  ·  API docs · http://127.0.0.1:8000/docs', 0.5, 4.35, 9, 0.3, { size: 11, color: CYAN })
  label(s, 'Thank you — questions?', 0.5, 4.7, 9, 0.4, { size: 16, color: WHITE, bold: true })
  s.addNotes('Close with the one-liner, then invite questions. Likely questions: clouds (answer: 90-day window + multiple passes; anomalies need persistence so one missed day does not matter), false alarms (answer: baseline-relative thresholds, explainable reasons, analyst override), scale (answer: around-cell OSM queries, PostGIS roadmap).')
}

const out = path.join(__dirname, 'ThermalSentinel_Presentation_v2.pptx')
pres.writeFile({ fileName: out }).then(() => console.log('wrote', out))
