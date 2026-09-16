// Builds the SIH 2026 idea-submission deck for SIH26162 (ThermalSentinel).
// Run: node build_deck.js   → ThermalSentinel_SIH26162_Idea.pptx
const pptxgen = require('pptxgenjs')
const fs = require('fs')
const path = require('path')

const NAVY = '0B1020', PANEL = '111831', ORANGE = 'FF7A1A', CYAN = '22D3EE', WHITE = 'FFFFFF'
const INK = '1B2140', MUTED = '6B7597', LIGHT = 'F4F6FB', CARD = 'FFFFFF', LINE = 'DCE1F0'
const GREEN = '2BB673', RED = 'E5484D', YELLOW = 'E6B800', PURPLE = '9A6BFF'
const FONT = 'Calibri', HEAD = 'Cambria'

const pres = new pptxgen()
pres.layout = 'LAYOUT_16x9' // 10 x 5.625 in
pres.author = 'ThermalSentinel team'
pres.title = 'SIH26162 — AI-Based Detection and Classification of Industrial Fires and Persistent Thermal Sources'

const img = (f) => 'image/png;base64,' + fs.readFileSync(path.join(__dirname, f)).toString('base64')
const hasDash = fs.existsSync(path.join(__dirname, 'dashboard.png'))

function header(slide, title, kicker, size = 28, h = 0.6) {
  slide.background = { color: LIGHT }
  slide.addText(kicker, { x: 0.5, y: 0.28, w: 6, h: 0.3, fontFace: FONT, fontSize: 11, color: ORANGE, bold: true, charSpacing: 2, margin: 0, isTextBox: true })
  slide.addText(title, { x: 0.5, y: 0.55, w: 9, h, fontFace: HEAD, fontSize: size, color: INK, bold: true, valign: 'top', margin: 0, isTextBox: true })
  slide.addText('SIH26162 · NTRO · Disaster Management · Software', { x: 0.5, y: 5.2, w: 6, h: 0.25, fontFace: FONT, fontSize: 9, color: MUTED, margin: 0, isTextBox: true })
  slide.addText('ThermalSentinel', { x: 7.5, y: 5.2, w: 2, h: 0.25, fontFace: FONT, fontSize: 9, color: MUTED, align: 'right', margin: 0, isTextBox: true })
}

function card(slide, x, y, w, h, opts = {}) {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, fill: { color: opts.fill || CARD }, line: { color: opts.line || LINE, width: 0.75 }, rectRadius: 0.08, shadow: { type: 'outer', color: '000000', blur: 6, offset: 1, angle: 90, opacity: 0.08 } })
}

function dot(slide, x, y, color, d = 0.34, glyph) {
  slide.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color }, line: { color, width: 0 } })
  if (glyph) slide.addText(glyph, { x, y, w: d, h: d, fontFace: FONT, fontSize: 12, color: WHITE, bold: true, align: 'center', valign: 'middle', margin: 0, isTextBox: true })
}

function bullets(slide, items, x, y, w, h, size = 12, color = INK) {
  slide.addText(items.map((t, i) => ({ text: t, options: { bullet: { indent: 12 }, breakLine: i < items.length - 1, paraSpaceAfter: 4 } })),
    { x, y, w, h, fontFace: FONT, fontSize: size, color, valign: 'top', margin: 2, isTextBox: true })
}

// ------------------------------------------------------------------ 1. Title
{
  const s = pres.addSlide()
  s.background = { color: NAVY }
  dot(s, 0.5, 0.5, ORANGE, 0.5)
  s.addText('ThermalSentinel', { x: 1.1, y: 0.47, w: 5, h: 0.55, fontFace: HEAD, fontSize: 26, color: WHITE, bold: true, margin: 0, isTextBox: true })
  s.addText('SMART INDIA HACKATHON 2026  ·  IDEA SUBMISSION', { x: 0.5, y: 1.35, w: 9, h: 0.3, fontFace: FONT, fontSize: 11, color: CYAN, bold: true, charSpacing: 3, margin: 0, isTextBox: true })
  s.addText('AI-Based Detection and Classification of Industrial Fires and Persistent Thermal Sources Using NASA FIRMS, OSM & Satellite Data',
    { x: 0.5, y: 1.7, w: 9, h: 1.3, fontFace: HEAD, fontSize: 27, color: WHITE, bold: true, margin: 0, isTextBox: true })
  const meta = [['Problem Statement ID', 'SIH26162'], ['Organisation', 'National Technical Research Organisation (NTRO)'], ['Theme', 'Disaster Management'], ['Category', 'Software']]
  meta.forEach(([k, v], i) => {
    s.addText(k.toUpperCase(), { x: 0.5 + i * 2.35, y: 3.35, w: 2.2, h: 0.25, fontFace: FONT, fontSize: 9, color: MUTED, bold: true, charSpacing: 1, margin: 0, isTextBox: true })
    s.addText(v, { x: 0.5 + i * 2.35, y: 3.6, w: 2.2, h: 0.5, fontFace: FONT, fontSize: 12.5, color: WHITE, margin: 0, isTextBox: true })
  })
  card(s, 0.5, 4.4, 9, 0.75, { fill: PANEL, line: '243055' })
  s.addText([
    { text: 'Team name: ', options: { bold: true, color: CYAN } }, { text: 'FireOrbit      ', options: { color: WHITE } },
    { text: 'Team leader: ', options: { bold: true, color: CYAN } }, { text: '<NAME>      ', options: { color: WHITE } },
    { text: 'Institute: ', options: { bold: true, color: CYAN } }, { text: '<COLLEGE>', options: { color: WHITE } },
  ], { x: 0.7, y: 4.4, w: 8.6, h: 0.75, fontFace: FONT, fontSize: 13, valign: 'middle', margin: 0, isTextBox: true })
  s.addNotes('Replace the placeholders in the bottom card with your team details before submitting.')
}

// ------------------------------------------------------------------ 2. Idea & solution
{
  const s = pres.addSlide()
  header(s, 'FIRMS says where it is hot. We say what is burning — and whether it should be.', 'IDEA / SOLUTION', 21, 0.8)

  card(s, 0.5, 1.4, 4.35, 1.55)
  s.addText('The problem', { x: 0.7, y: 1.48, w: 4, h: 0.3, fontFace: FONT, fontSize: 13, bold: true, color: RED, margin: 0, isTextBox: true })
  bullets(s, [
    'FIRMS streams ~1 lakh thermal anomalies a day — a refinery flare, a steel plant, a coal-seam fire, a stubble burn and a forest fire all look identical.',
    'Responders waste effort on routine industrial heat while a real industrial fire hides among thousands of "normal" hotspots.',
  ], 0.7, 1.78, 4.0, 1.15, 10)

  card(s, 0.5, 3.1, 4.35, 1.95)
  s.addText('Our solution — ThermalSentinel', { x: 0.7, y: 3.18, w: 4, h: 0.3, fontFace: FONT, fontSize: 13, bold: true, color: ORANGE, margin: 0, isTextBox: true })
  bullets(s, [
    'Fuses FIRMS (VIIRS 375 m / MODIS) with OSM industrial infrastructure, OSM land cover and satellite imagery links.',
    'Classifies every detection into 6 classes; builds a live registry of persistent thermal sources with a persistence score.',
    'Flags FRP anomalies at known sources → industrial-fire / explosion alerts instead of routine heat.',
    'Explainable reasons for every label; GeoJSON API + GIS dashboard.',
  ], 0.7, 3.48, 4.0, 1.55, 10)

  if (hasDash) {
    s.addImage({ data: img('dashboard.png'), x: 5.1, y: 1.35, w: 4.4, h: 2.475, rounding: false, shadow: { type: 'outer', color: '000000', blur: 8, offset: 2, angle: 90, opacity: 0.25 } })
    s.addText('Working prototype: 22,179 detections classified, 114 persistent sources, 138 incident candidates (demo archive, Mar–May 2025)',
      { x: 5.1, y: 3.85, w: 4.4, h: 0.4, fontFace: FONT, fontSize: 9, color: MUTED, italic: true, margin: 0, isTextBox: true })
  }
  const classes = [['Industrial fire / process heat', ORANGE], ['Gas flare', YELLOW], ['Mining / coal-seam fire', PURPLE], ['Agricultural residue burning', GREEN], ['Wildfire', RED], ['Other / urban waste', '9CA3AF']]
  classes.forEach(([t, c], i) => {
    const col = i % 2, row = Math.floor(i / 2)
    dot(s, 5.15 + col * 2.2, 4.38 + row * 0.26, c, 0.14)
    s.addText(t, { x: 5.35 + col * 2.2, y: 4.3 + row * 0.26, w: 2.1, h: 0.28, fontFace: FONT, fontSize: 9.5, color: INK, margin: 0, isTextBox: true })
  })
}

// ------------------------------------------------------------------ 3. Technical approach
{
  const s = pres.addSlide()
  header(s, 'Technical approach', 'HOW IT WORKS')

  const steps = [
    ['1', 'Ingest', 'FIRMS Area API (VIIRS SNPP/NOAA-20/21, MODIS), 10-day chunks, NRT + archive CSV; de-dup overlapping passes', ORANGE],
    ['2', 'Cluster & persist', 'Haversine DBSCAN (750 m) → per-source stats over 90 d: active days, span, gaps, night fraction, FRP mean/CV/z', CYAN],
    ['3', 'Context', 'Overpass queries only around hotspot cells: refinery, steel, power, flare, kiln, mine, cement + land-use polygons (STRtree PIP)', PURPLE],
    ['4', 'Classify', 'Explainable rule engine + HistGradientBoosting (group-aware split); agreement boosts confidence; FRP-anomaly detector', GREEN],
    ['5', 'Serve', 'SQLite → FastAPI GeoJSON API → React + Leaflet dashboard; QGIS export; Sentinel-2 SWIR / Worldview deep links', RED],
  ]
  steps.forEach(([n, t, d, c], i) => {
    const x = 0.5 + i * 1.84
    card(s, x, 1.35, 1.7, 2.05)
    dot(s, x + 0.15, 1.5, c, 0.34, n)
    s.addText(t, { x: x + 0.55, y: 1.5, w: 1.1, h: 0.34, fontFace: FONT, fontSize: 12, bold: true, color: INK, valign: 'middle', margin: 0, isTextBox: true })
    s.addText(d, { x: x + 0.15, y: 1.95, w: 1.45, h: 1.4, fontFace: FONT, fontSize: 9, color: INK, valign: 'top', margin: 0, isTextBox: true })
    if (i < steps.length - 1) s.addShape(pres.shapes.RIGHT_TRIANGLE, { x: x + 1.72, y: 2.28, w: 0.1, h: 0.16, fill: { color: 'B8C0DA' }, line: { color: 'B8C0DA', width: 0 }, rotate: 0 })
  })

  card(s, 0.5, 3.6, 5.6, 1.45)
  s.addText('Feature groups the model sees (34 features)', { x: 0.7, y: 3.68, w: 5.3, h: 0.28, fontFace: FONT, fontSize: 11.5, bold: true, color: INK, margin: 0, isTextBox: true })
  const fg = [['Radiometric', 'FRP, I-4/I-5 brightness, Δbrightness, FIRMS confidence, day/night'],
    ['Persistence', 'active days, span, max gap, night fraction, FRP mean / CV / z-score, score'],
    ['Infrastructure', 'distance & type of nearest OSM facility (8 classes)'],
    ['Land cover + calendar', 'cropland/forest/shrub/industrial/mining/built; month, hour, burn season']]
  fg.forEach(([k, v], i) => {
    s.addText([{ text: k + ': ', options: { bold: true, color: ORANGE } }, { text: v, options: { color: INK } }],
      { x: 0.7, y: 3.97 + i * 0.26, w: 5.3, h: 0.26, fontFace: FONT, fontSize: 9.5, margin: 0, isTextBox: true })
  })

  card(s, 6.3, 3.6, 3.2, 1.45)
  s.addText('Tech stack', { x: 6.5, y: 3.68, w: 2.9, h: 0.28, fontFace: FONT, fontSize: 11.5, bold: true, color: INK, margin: 0, isTextBox: true })
  bullets(s, ['Python · FastAPI · pandas · scikit-learn · shapely', 'React 18 · Vite · Leaflet (canvas, 40 k+ points)', 'SQLite → PostGIS-ready; GeoJSON everywhere', 'Data: NASA FIRMS, OSM Overpass, Sentinel-2 (Copernicus), NASA Worldview'],
    6.5, 3.95, 2.9, 1.1, 9.5)
}

// ------------------------------------------------------------------ 4. Feasibility
{
  const s = pres.addSlide()
  header(s, 'Feasibility & viability', 'CAN IT BE BUILT AND RUN?')

  card(s, 0.5, 1.35, 4.4, 3.7)
  s.addText('Why it is feasible', { x: 0.7, y: 1.45, w: 4, h: 0.3, fontFace: FONT, fontSize: 13, bold: true, color: GREEN, margin: 0, isTextBox: true })
  bullets(s, [
    'All data sources are free and open: FIRMS MAP_KEY (instant), OSM Overpass, Copernicus Sentinel-2, NASA Worldview.',
    'Working end-to-end prototype already runs offline on a laptop: 22 k detections → classified in 7 s, model trains in seconds.',
    'Same pipeline switches to live FIRMS with one env variable; runs India-wide in minutes (Overpass queried only around hotspot cells).',
    'Lightweight stack (SQLite/FastAPI/React) → deployable on a single VM, NIC cloud or air-gapped NTRO server.',
    'Explainable rules mean analysts can audit and tune every decision; ML improves as labelled events accumulate.',
  ], 0.7, 1.8, 4.05, 3.2, 10.5)

  card(s, 5.1, 1.35, 4.4, 3.7)
  s.addText('Challenges → mitigation', { x: 5.3, y: 1.45, w: 4, h: 0.3, fontFace: FONT, fontSize: 13, bold: true, color: ORANGE, margin: 0, isTextBox: true })
  const ch = [
    ['Incomplete OSM coverage of Indian industry', 'Persistence signature detects unregistered sources; curated site list + Sentinel-2 chip verification'],
    ['Cloud gaps & 375 m pixel offsets', '90-day temporal window, DBSCAN grouping, day+night passes from 3 VIIRS satellites'],
    ['Few labelled real incidents for ML', 'Rules as strong prior; physically-motivated synthetic archive; active-learning loop from analyst feedback'],
    ['Overpass rate limits at national scale', 'Around-cell queries, on-disk cache, optional self-hosted Overpass / ESA WorldCover raster'],
  ]
  ch.forEach(([a, b], i) => {
    const y = 1.85 + i * 0.78
    s.addText(a, { x: 5.3, y, w: 4.05, h: 0.25, fontFace: FONT, fontSize: 10.5, bold: true, color: INK, margin: 0, isTextBox: true })
    s.addText('→ ' + b, { x: 5.3, y: y + 0.25, w: 4.05, h: 0.5, fontFace: FONT, fontSize: 9.5, color: MUTED, margin: 0, isTextBox: true })
  })
}

// ------------------------------------------------------------------ 5. Impact
{
  const s = pres.addSlide()
  header(s, 'Impact & benefits', 'WHO GAINS')

  const stats = [['6', 'thermal source classes\n(industrial, flare, mining, agri, wildfire, other)'], ['< 10 s', 'to classify a 90-day\nnational FIRMS archive'], ['≈ 98–99 %', 'agreement with ground truth on\nlabelled demo archive (group split)'], ['₹ 0', 'data licensing cost —\nall open sources']]
  stats.forEach(([n, l], i) => {
    const x = 0.5 + i * 2.3
    card(s, x, 1.35, 2.15, 1.25, { fill: NAVY, line: NAVY })
    s.addText(n, { x: x + 0.15, y: 1.4, w: 1.9, h: 0.55, fontFace: HEAD, fontSize: 26, bold: true, color: ORANGE, margin: 0, isTextBox: true })
    s.addText(l, { x: x + 0.15, y: 1.95, w: 1.9, h: 0.6, fontFace: FONT, fontSize: 9, color: 'C9D1EC', margin: 0, isTextBox: true })
  })

  const cols = [
    ['Disaster management (NDMA/SDMA, fire services)', GREEN, ['Industrial-fire & explosion alerts separated from routine heat', 'Faster, correctly-targeted response; fewer false alarms', 'Coal-seam fire monitoring (Jharia, Raniganj)']],
    ['Security & strategic (NTRO)', CYAN, ['National registry of persistent thermal sources with activity time-series', 'Detect unregistered / undeclared industrial activity', 'Change detection: shutdowns, restarts, capacity surges']],
    ['Environment & economy (CPCB, MoEFCC, insurers)', PURPLE, ['Stubble-burning vs industrial attribution for air-quality action', 'Flaring inventories for emissions reporting', 'Verified incident records for insurance & compliance']],
  ]
  cols.forEach(([t, c, items], i) => {
    const x = 0.5 + i * 3.05
    card(s, x, 2.8, 2.9, 2.25)
    dot(s, x + 0.15, 2.92, c, 0.22)
    s.addText(t, { x: x + 0.45, y: 2.86, w: 2.35, h: 0.36, fontFace: FONT, fontSize: 10.5, bold: true, color: INK, valign: 'middle', margin: 0, isTextBox: true })
    bullets(s, items, x + 0.15, 3.3, 2.6, 1.7, 9.5)
  })
}

// ------------------------------------------------------------------ 6. References
{
  const s = pres.addSlide()
  header(s, 'Research & references', 'GROUNDING')
  const refs = [
    ['NASA FIRMS Area API & VIIRS 375 m active-fire product (VNP14IMG / VJ114IMG)', 'firms.modaps.eosdis.nasa.gov/api/area'],
    ['Schroeder et al. (2014) — The New VIIRS 375 m active fire detection data product, Remote Sensing of Environment', 'doi:10.1016/j.rse.2013.12.008'],
    ['Elvidge et al. (2013/2016) — VIIRS Nightfire: satellite pyrometry at night; global gas-flaring survey', 'doi:10.3390/rs5094423'],
    ['Liu et al. (2018) — Identifying industrial heat sources using time-series of the VIIRS Nightfire product, Remote Sensing of Environment 204', 'sciencedirect.com'],
    ['Copernicus Sentinel-2 SWIR (B11/B12) for hotspot verification; ESA WorldCover 10 m land cover', 'dataspace.copernicus.eu · esa-worldcover.org'],
    ['OpenStreetMap Overpass API — industrial, man_made=flare|works, power=plant, landuse=quarry|farmland tags', 'wiki.openstreetmap.org/wiki/Overpass_API'],
    ['CPCB / ICAR–CREAMS crop-residue burning bulletins (Oct–Nov, Apr–May seasonality)', 'creams.iari.res.in'],
    ['Ester et al. (1996) DBSCAN; Ke et al. / scikit-learn HistGradientBoosting', 'scikit-learn.org'],
  ]
  refs.forEach(([t, u], i) => {
    const col = i < 4 ? 0 : 1, row = i % 4
    const x = 0.5 + col * 4.6, y = 1.35 + row * 0.92
    card(s, x, y, 4.4, 0.8)
    dot(s, x + 0.12, y + 0.23, ORANGE, 0.3, String(i + 1))
    s.addText(t, { x: x + 0.52, y: y + 0.07, w: 3.8, h: 0.45, fontFace: FONT, fontSize: 9.5, color: INK, valign: 'top', margin: 0, isTextBox: true })
    s.addText(u, { x: x + 0.52, y: y + 0.52, w: 3.8, h: 0.22, fontFace: FONT, fontSize: 8.5, color: CYAN, margin: 0, isTextBox: true })
  })
}

const out = path.join(__dirname, 'ThermalSentinel_SIH26162_Idea.pptx')
pres.writeFile({ fileName: out }).then(() => console.log('wrote', out))
