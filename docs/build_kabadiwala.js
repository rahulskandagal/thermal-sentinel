// Team Fire Orbit — SIH 2026 idea deck for SIH26229 "Kabadiwala Connect" (Ministry of Mines / JNARDDC)
// in the infographic style of the reference deck, on the official SIH template chrome.
// Run: node build_kabadiwala.js → FireOrbit_SIH26229_KabadiwalaConnect.pptx
const pptxgen = require('pptxgenjs')
const fs = require('fs')
const path = require('path')

const img = (f) => 'image/png;base64,' + fs.readFileSync(path.join(__dirname, f)).toString('base64')
const LOGO = img('template_assets/sih_logo.png'), BRAIN = img('template_assets/brain_bulb.png')
const P1 = img('kabadi/phone1.png'), P2 = img('kabadi/phone2.png'), P3 = img('kabadi/phone3.png'), PHONES = img('kabadi/phones.png'), DASHK = img('kabadi/dash.png')

const TEAM = 'Fire Orbit', TEAM_ID = ''

const NAVY = '1F3864', FOOT = '0070C0', WHITE = 'FFFFFF', BLACK = '000000', INK = '1F2937', MUTED = '6B7280'
const DARKBOX = '3A3A3A', YEL = 'F2C94C', REDP = 'E53935', GRNP = '43A047', TAN = 'B08D57', GREY = '7A7A7A', HEXC = 'C9A97C'
const ORANGE = 'E8590C', BLUE = '1D4ED8', GREEN = '15803D', RED = 'B91C1C', PURPLE = '6D28D9', TEAL = '0F766E', MAROON = '7B2D26', OLIVE = '6B7A1E', BROWN = '8B5A2B'
const SERIF = 'Times New Roman', SANS = 'Arial', EMOJI = 'Segoe UI Emoji'

const pres = new pptxgen()
pres.layout = 'LAYOUT_16x9'
pres.title = 'Fire Orbit — SIH26229 Kabadiwala Connect'

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
const T = (s, t, x, y, w, h, o = {}) => s.addText(t, { x, y, w, h, fontFace: o.font || SANS, fontSize: o.size || 9, color: o.color || INK, bold: !!o.bold, italic: !!o.italic, underline: !!o.underline, align: o.align || 'left', valign: o.valign || 'top', margin: 0, isTextBox: true })
const R = (s, x, y, w, h, fill, o = {}) => s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, fill: { color: fill }, line: { color: o.line || fill, width: o.lw ?? 0 }, rectRadius: o.r ?? 0.08, shadow: o.shadow ? { type: 'outer', color: '000000', blur: 4, offset: 2, angle: 45, opacity: 0.35 } : undefined })
const C = (s, x, y, d, fill, o = {}) => s.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: fill }, line: { color: o.line || fill, width: o.lw ?? 0, dashType: o.dash } })
const E = (s, glyph, x, y, d, size) => s.addText(glyph, { x, y, w: d, h: d, fontFace: EMOJI, fontSize: size, align: 'center', valign: 'middle', margin: 0, isTextBox: true })
function cloud(s, x, y, w, h, lines) {
  s.addShape(pres.shapes.CLOUD, { x, y, w, h, fill: { color: WHITE }, line: { color: BLACK, width: 2 } })
  s.addText(lines.map((l, i) => ({ text: l, options: { color: '1A0DAB', bold: true, breakLine: i < lines.length - 1 } })),
    { x: x + w * 0.16, y: y + h * 0.2, w: w * 0.68, h: h * 0.6, fontFace: SANS, fontSize: 10, align: 'center', valign: 'middle', margin: 0, isTextBox: true })
}
function callout(s, x, y, w, h, label, body, size = 9.5) {
  R(s, x + 0.05, y + 0.05, w, h, '1A1A1A', { r: 0.12 })
  R(s, x, y, w, h, DARKBOX, { r: 0.12 })
  s.addText([{ text: label + ' ', options: { color: YEL, underline: true, bold: true } }, { text: body, options: { color: WHITE, bold: true } }],
    { x: x + 0.12, y: y + 0.06, w: w - 0.24, h: h - 0.12, fontFace: SERIF, fontSize: size, valign: 'middle', margin: 0, isTextBox: true })
}

// ================================================================== 1. TITLE PAGE
{
  const s = pres.addSlide(); n++
  s.background = { color: WHITE }
  s.addImage({ data: BRAIN, x: 5.68, y: 0.94, w: 4.32, h: 4.04 })
  s.addImage({ data: LOGO, x: 7.95, y: 0.05, w: 1.85, h: 0.87 })
  T(s, 'SMART INDIA HACKATHON 2026', 0.5, 0.15, 7.4, 0.6, { font: SERIF, size: 28, bold: true, color: NAVY, align: 'center', valign: 'middle' })
  const rows = [['Problem Statement ID – ', 'SIH26229'],
    ['Problem Statement Title- ', 'Kabadiwala Connect – Bringing the Informal Collector into the Formal Recycling Chain'],
    ['Theme- ', 'Clean & Green Technology'], ['PS Category- ', 'Software'], ['Team ID- ', TEAM_ID], ['Team Name (Registered on portal) - ', TEAM]]
  const runs = []
  rows.forEach(([k, v], i) => { runs.push({ text: k, options: { bullet: true, bold: true } }); runs.push({ text: v, options: { bold: true, breakLine: i < rows.length - 1 } }) })
  s.addText(runs.map((r) => ({ ...r, options: { ...r.options, paraSpaceAfter: 10 } })), { x: 0.3, y: 1.35, w: 5.6, h: 3.7, fontFace: SERIF, fontSize: 13.5, color: BLACK, valign: 'top', margin: 0, isTextBox: true })
  T(s, 'Organisation: Ministry of Mines · Dept: JNARDDC, Nagpur', 0.3, 4.75, 5.6, 0.3, { font: SERIF, size: 11, italic: true, color: MUTED })
  T(s, '1', 9.2, 5.05, 0.5, 0.3, { size: 10, color: MUTED, align: 'right' })
}

// ================================================================== 2. IDEA / PROPOSED SOLUTION
{
  const s = pres.addSlide()
  chrome(s, 'Kabadiwala Connect: Fair Price · Formal Chain · Full Traceability\nfor Every Scrap Collector', 16)

  callout(s, 0.2, 0.98, 3.05, 1.1, 'Real-world issue:', 'India generates ≈ 4 million tonnes of e-waste a year and over 90 % moves through kabadiwalas and waste-pickers who sit outside the formal EPR chain — ending in open-air cable burning and acid leaching.')
  callout(s, 0.2, 2.16, 3.05, 1.02, 'Why important:', 'Collectors do not know fair prices, authorized recyclers or compliant handover; recyclers cannot source traceable feedstock; India loses lithium, cobalt, neodymium, tantalum, gallium, indium — and workers lose their health.')
  callout(s, 0.2, 3.26, 3.05, 0.98, 'Solution:', 'A Hindi / Marathi, voice-first, offline-tolerant Android app: photo → instant fair price → nearest authorized recycler → GPS-stamped digital handover → UPI payment → EPR record.')
  cloud(s, 0.15, 4.3, 1.75, 0.95, ['App mockups', 'Nagpur pilot plan'])
  T(s, 'Prototype', 2.05, 4.32, 1.2, 0.28, { size: 12, bold: true, color: BLACK })
  s.addShape(pres.shapes.LINE, { x: 1.95, y: 4.62, w: 0.55, h: 0.12, flipV: true, line: { color: BLACK, width: 2, endArrowType: 'triangle' } })
  T(s, 'screens on the next pages;\nMVP APK in pilot week 4', 2.05, 4.78, 1.3, 0.45, { size: 7.5, italic: true, color: INK })

  // pyramid
  s.addShape(pres.shapes.ISOSCELES_TRIANGLE, { x: 3.4, y: 0.98, w: 3.5, h: 4.27, fill: { color: 'F0FDF4' }, line: { color: '16A34A', width: 3, dashType: 'dash' } })
  const tiers = [
    ['CORE INNOVATION', '📷 Snap-to-Value on-device AI + 🧾 tamper-evident GPS handover ledger — fair price and traceability in one tap', '14532D'],
    ['PRIMARY FUNCTIONS', '💰 Price discovery & 30-day trends   |   ♻️ Authorized-recycler matching & pooled pickup', '166534'],
    ['INCLUSION & TRUST', '🗣️ Hindi / Marathi voice UI · 📴 offline-first · 🪪 collector digital ID · 💳 instant UPI payout · 🛡️ safety training', '15803D'],
    ['PLATFORM & DATA', '🖥️ Recycler console · 📊 MoM / CPCB dashboard · 🔗 open price dataset & API · 📄 EPR / Form-6 records · 📍 hotspot map', '1E5AA8'],
  ]
  const geo = [[3.4, 0.8], [2.8, 0.72], [2.15, 0.72], [1.5, 0.72]]
  let by = 5.2
  const placed = []
  geo.forEach(([w, hh]) => { by -= hh; placed.push([w, hh, by]); by -= 0.08 })
  placed.reverse().forEach(([w, hh, y], i) => {
    const [h, d, c] = tiers[i]
    const x = 5.15 - w / 2
    R(s, x, y, w, hh, c, { r: 0.06 })
    T(s, h, x, y + 0.04, w, 0.18, { size: 7.5, bold: true, color: 'FDE68A', align: 'center' })
    T(s, d, x + 0.05, y + 0.22, w - 0.1, hh - 0.26, { size: 7, color: WHITE, align: 'center', valign: 'middle' })
  })
  E(s, '♻️', 4.9, 1.2, 0.5, 18)

  T(s, 'Risk', 7.05, 0.98, 1.2, 0.28, { size: 13, bold: true, color: ORANGE, align: 'center' })
  T(s, 'v', 8.25, 1.0, 0.3, 0.25, { size: 10, bold: true, color: MUTED, align: 'center' })
  T(s, 'Solution', 8.55, 0.98, 1.2, 0.28, { size: 13, bold: true, color: GREEN, align: 'center' })
  const pairs = [['Collector does not know the fair price', 'Photo → AI category → live ₹/kg band + trend'],
    ['No link to authorized recyclers', 'Matching + pooled pickup in one tap'],
    ['No proof of formal handover', 'GPS + time + weight + QR trace ID, UPI receipt'],
    ['Low literacy, weak network', 'Voice-first Hindi / Marathi; works offline']]
  pairs.forEach(([a, b], i) => {
    const y = 1.32 + i * 0.7
    R(s, 7.0, y, 1.3, 0.5, REDP, { r: 0.1, shadow: true })
    T(s, a, 7.05, y, 1.2, 0.5, { size: 7.5, bold: true, color: WHITE, align: 'center', valign: 'middle', font: SERIF })
    s.addShape(pres.shapes.LEFT_RIGHT_ARROW, { x: 8.33, y: y + 0.13, w: 0.32, h: 0.24, fill: { color: 'F5D28A' }, line: { color: 'B8860B', width: 0.75 } })
    R(s, 8.68, y, 1.1, 0.5, GRNP, { r: 0.1, shadow: true })
    T(s, b, 8.72, y, 1.02, 0.5, { size: 7, bold: true, color: WHITE, align: 'center', valign: 'middle', font: SERIF })
  })
  s.addImage({ data: DASHK, x: 7.0, y: 4.15, w: 2.78, h: 0.95, sizing: { type: 'crop', x: 0, y: 0, w: 2.78, h: 0.95 } })
  T(s, 'recycler & MoM console (mockup)', 7.0, 5.1, 2.78, 0.16, { size: 6.5, italic: true, color: MUTED, align: 'right' })
}

// ================================================================== 3. TECHNICAL APPROACH
{
  const s = pres.addSlide()
  chrome(s, 'TECHNICAL APPROACH')
  T(s, 'METHODOLOGY & PROCESS OF\nIMPLEMENTATION', 0.2, 0.95, 3.4, 0.55, { size: 12.5, bold: true, color: MAROON, align: 'center' })
  const cx = 1.9, cy = 2.95, r = 0.72
  C(s, cx - r, cy - r, 2 * r, WHITE, { line: '9CA3AF', lw: 1.5, dash: 'dash' })
  const nodes = [['📷', 'Snap', 'on-device AI', BLUE, -90], ['💰', 'Price', 'fair ₹/kg band', ORANGE, -30], ['♻️', 'Match', 'authorized recycler', PURPLE, 30],
    ['🧾', 'Handover', 'GPS · QR · weight', GREEN, 90], ['💳', 'Pay', 'UPI instant', RED, 150], ['📄', 'Record', 'EPR · dataset', TEAL, 210]]
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
  E(s, '♻️', cx - 0.3, cy - 0.3, 0.6, 22)
  cloud(s, 0.15, 4.42, 1.6, 0.83, ['Offline-first', 'Android 8+'])
  T(s, 'Works on a\n₹6–8 k phone', 2.35, 4.5, 1.2, 0.5, { size: 11, bold: true, color: BLACK })
  s.addShape(pres.shapes.LINE, { x: 1.8, y: 4.72, w: 0.5, h: 0.1, flipV: true, line: { color: BLACK, width: 2, endArrowType: 'triangle' } })

  R(s, 3.75, 0.98, 3.1, 1.95, 'F8FAFC', { line: '1F2937', lw: 1.5, r: 0.03 })
  const flow = [['📱', 'Collector app\noffline queue', BLUE], ['☁️', 'Sync · price engine\n· matching', ORANGE], ['🏭', 'Recycler console\nquotes · pickups', RED], ['🏛️', 'MoM / CPCB\ndashboard · EPR', GREEN]]
  flow.forEach(([g, t, c], i) => {
    const x = 3.85 + i * 0.76
    C(s, x + 0.08, 1.1, 0.5, c)
    E(s, g, x + 0.08, 1.1, 0.5, 14)
    T(s, t, x - 0.06, 1.66, 0.8, 0.5, { size: 5.8, color: INK, align: 'center' })
    if (i < 3) s.addShape(pres.shapes.LINE, { x: x + 0.6, y: 1.35, w: 0.14, h: 0, line: { color: '6B7280', width: 1.5, endArrowType: 'triangle' } })
  })
  R(s, 3.85, 2.2, 2.9, 0.66, 'ECFDF5', { line: 'A7F3D0', lw: 0.75, r: 0.04 })
  s.addText([{ text: 'AI & data core: ', options: { bold: true, color: GREEN } }, { text: 'on-device TFLite MobileNet classifier (12 e-waste categories, ~4 MB) · price engine = recycler quotes + LME/MCX Cu/Al indices + verified transactions, median & 30-day trend · matching = distance × price × capacity × rating · handover records SHA-256 hash-chained → tamper-evident EPR trail.', options: { color: INK } }],
    { x: 3.92, y: 2.2, w: 2.78, h: 0.66, fontFace: SANS, fontSize: 6.3, valign: 'middle', margin: 0, isTextBox: true })
  s.addImage({ data: PHONES, x: 3.75, y: 3.02, w: 3.1, h: 1.81 })
  T(s, 'Collector app: Snap & Value → authorized recyclers → digital handover receipt (Hindi UI)', 3.75, 4.86, 3.1, 0.36, { size: 6.5, color: MUTED, italic: true, align: 'center' })

  T(s, 'TECHNOLOGIES USED', 7.0, 0.95, 2.8, 0.35, { size: 13, bold: true, color: MAROON, align: 'center' })
  const tech = [['📱', 'Mobile', 'Flutter (Android 8+, 1 GB RAM), SQLite + WorkManager offline sync, TensorFlow Lite on-device vision', OLIVE],
    ['🗣️', 'Vernacular', 'Bhashini ASR / TTS (Hindi, Marathi), icon-first UI, voice prompts, SMS / IVR fallback', BROWN],
    ['🗄️', 'Backend', 'FastAPI + PostgreSQL / PostGIS · price engine · matching service · hash-chained handover ledger', MAROON],
    ['💳', 'Payments & ID', 'UPI payouts (NPCI), OTP-confirmed handover, phone-number digital ID, QR receipts', PURPLE],
    ['🖥️', 'Consoles & data', 'React dashboards (recycler, MoM / CPCB), open price-dataset API, EPR / Form-6 export', TEAL]]
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
    ['FEASIBILITY ANALYSIS', TAN, '★★★★½', [['Tech is ready:', 'on-device image AI, offline sync, UPI and Bhashini are proven, free / open building blocks — no research risk.'],
      ['Data exists:', 'CPCB list of EPR-registered recyclers; MCX / LME metal indices; recycler quotes seed the price dataset.'],
      ['Low-end friendly:', 'APK < 15 MB, Android 8+, works on ₹6–8 k phones and 2G; SMS / IVR fallback.'],
      ['Field-first:', 'pilot with 50 collectors + 3 authorized recyclers in Nagpur (JNARDDC\'s city), Marathi + Hindi.']]],
    ['VIABILITY', GREY, '✔', [['Incentives align:', 'collector earns more (fair price, no middleman cut); recycler gets traceable feedstock; MoM gets data.'],
      ['Unit economics:', 'PCB informal ≈ ₹250/kg vs formal ₹310 + ₹15 incentive → ≈ +30 % per kg (pilot target, to be measured).'],
      ['Trust by design:', 'OTP handover, visible price band, dispute button; only a phone number — no sensitive personal data.'],
      ['Risks handled:', 'recycler adoption → onboarding kit + EPR credits; price gaming → multi-source median; connectivity → offline queue + SMS.']]],
    ['BUSINESS & SCALE', TAN, '💼', [['Revenue:', '1–2 % platform fee on recycler payouts; EPR compliance reports for PROs / producers; price-index data services.'],
      ['Policy fit:', 'E-Waste (Management) Rules 2022 EPR framework; automated Form-6; Mission LiFE & Swachh Bharat alignment.'],
      ['Scale path:', 'Nagpur → Maharashtra (Marathi) → Hindi belt; extend to plastics & metals; ULB and PRO partnerships.'],
      ['Roadmap:', '4-week MVP + pilot → finale: 500 collectors, price API, CPCB integration → national roll-out with PROs.']]],
  ]
  cards.forEach(([h, fill, sym, items], i) => {
    const x = 0.25 + i * 3.2
    R(s, x + 0.04, 1.02, 3.05, 3.42, '5C4A32', { r: 0.03 })
    R(s, x, 0.98, 3.05, 3.42, fill, { r: 0.03 })
    s.addShape(pres.shapes.LINE, { x: x + 2.72, y: 1.0, w: 0.12, h: 0.3, line: { color: '4B5563', width: 1.5 } })
    C(s, x + 2.66, 0.86, 0.24, i === 1 ? 'B91C1C' : 'DC2626', { line: '7F1D1D', lw: 0.75 })
    T(s, h, x + 0.1, 1.06, 2.85, 0.3, { size: 12.5, bold: true, color: WHITE, align: 'center', font: SERIF })
    T(s, sym, x + 0.1, 1.36, 2.85, 0.3, { size: sym.length > 2 ? 14 : 18, bold: true, color: 'FFF3C4', align: 'center', font: sym === '💼' ? EMOJI : SANS })
    let y = 1.72
    items.forEach(([k, v]) => {
      s.addText([{ text: k + ' ', options: { bold: true, underline: true, color: 'FFF7E6' } }, { text: v, options: { bold: true, color: WHITE } }],
        { x: x + 0.14, y, w: 2.78, h: 0.64, fontFace: SERIF, fontSize: 8.6, valign: 'top', margin: 0, isTextBox: true })
      y += 0.68
    })
  })
  R(s, 0.25, 4.5, 9.5, 0.72, '0F172A', { r: 0.04 })
  s.addShape(pres.shapes.LINE, { x: 0.7, y: 4.86, w: 8.6, h: 0, line: { color: '64748B', width: 1, dashType: 'dash' } })
  const ms = [['✔ Idea + mockups', 'architecture · field-survey plan', '2BB673'], ['Next 4 weeks', 'MVP app · 50-collector Nagpur pilot', 'FB923C'], ['Grand finale', 'recycler console · price API · unit economics', '38BDF8'], ['Deployment', 'CPCB EPR portal · PRO partners', 'C4B5FD']]
  ms.forEach(([t, d, c], i) => {
    const x = 0.9 + i * 2.25
    C(s, x, 4.78, 0.16, c)
    T(s, t, x + 0.22, 4.56, 2.0, 0.2, { size: 8, bold: true, color: c })
    T(s, d, x + 0.22, 4.93, 2.0, 0.22, { size: 7, color: 'CBD5E1' })
  })
  E(s, '♻️', 9.2, 4.62, 0.45, 16)
}

// ================================================================== 5. IMPACT AND BENEFITS
{
  const s = pres.addSlide()
  chrome(s, 'IMPACT AND BENEFITS')
  const cx = 2.75, cy = 3.1, r = 1.3
  C(s, cx - r, cy - r, 2 * r, WHITE, { line: '9CA3AF', lw: 1.5, dash: 'dash' })
  C(s, cx - 0.52, cy - 0.52, 1.04, WHITE, { line: '1F2937', lw: 2 })
  s.addShape(pres.shapes.LINE, { x: cx, y: cy - 0.45, w: 0, h: 0.9, line: { color: '1F2937', width: 1.5 } })
  T(s, 'IMPACTS', cx - 0.5, cy - 0.12, 0.48, 0.24, { size: 6.5, bold: true, color: TAN, align: 'center', valign: 'middle' })
  T(s, 'BENEFITS', cx + 0.02, cy - 0.12, 0.5, 0.24, { size: 6.5, bold: true, color: '1E5AA8', align: 'center', valign: 'middle' })
  const left = [['Higher income', '≈ +25–35 % per kg through fair prices and no middleman cut (pilot target).'], ['Formalisation', 'Every lot enters the EPR chain with a GPS-stamped, traceable record.'],
    ['Safer work', 'Pickup + training replace open burning and acid leaching.'], ['Critical minerals', 'Li, Co, Nd, Ta, Ga, In recovered instead of lost to backyard processing.']]
  const right = [['Social', 'Dignity, digital identity and records for lakhs of informal workers.'], ['Economic', 'Recyclers get compliant feedstock; producers earn EPR credits.'],
    ['Environmental', 'Less toxic burning / leaching; higher material recovery rates.'], ['Governance', 'MoM / CPCB see real-time flows, prices and hotspots.']]
  const angles = [-62, -21, 21, 62]
  left.forEach(([t, d], i) => {
    const a = (180 - angles[i]) * Math.PI / 180, nx = cx + r * Math.cos(a), ny = cy + r * Math.sin(a)
    C(s, nx - 0.19, ny - 0.19, 0.38, 'D9C7A6', { line: '8B7355', lw: 1 })
    T(s, String(i + 1), nx - 0.19, ny - 0.19, 0.38, 0.38, { size: 10, bold: true, color: '3B2F1E', align: 'center', valign: 'middle' })
    T(s, t, 0.15, ny - 0.3, nx - 0.6, 0.22, { size: 9.5, bold: true, underline: true, color: '1E5AA8', align: 'right', font: SERIF })
    T(s, d, 0.15, ny - 0.08, nx - 0.6, 0.42, { size: 7, bold: true, color: INK, align: 'right', font: SERIF })
  })
  right.forEach(([t, d], i) => {
    const a = angles[i] * Math.PI / 180, nx = cx + r * Math.cos(a), ny = cy + r * Math.sin(a)
    C(s, nx - 0.19, ny - 0.19, 0.38, '1E5AA8')
    T(s, String(i + 1), nx - 0.19, ny - 0.19, 0.38, 0.38, { size: 10, bold: true, color: WHITE, align: 'center', valign: 'middle' })
    T(s, t, nx + 0.34, ny - 0.3, 5.5 - nx - 0.34, 0.22, { size: 9.5, bold: true, underline: true, color: MUTED, font: SERIF })
    T(s, d, nx + 0.34, ny - 0.08, 5.5 - nx - 0.34, 0.42, { size: 7, bold: true, color: INK, font: SERIF })
  })
  s.addShape(pres.shapes.RECTANGLE, { x: 5.62, y: 0.98, w: 0.08, h: 4.25, fill: { color: '4B5563' }, line: { color: '4B5563', width: 0 } })
  T(s, 'Collector earnings ₹ / kg — informal today vs Kabadiwala Connect', 5.85, 0.98, 3.9, 0.25, { size: 8.5, bold: true, color: NAVY, align: 'center' })
  const cats = ['PCB / motherboards', 'Copper cables', 'Li-ion batteries', 'Mobile phones']
  s.addChart(pres.charts.BAR, [
    { name: 'Informal today', labels: cats, values: [250, 480, 90, 400] },
    { name: 'Kabadiwala Connect', labels: cats, values: [325, 560, 130, 520] },
  ], { x: 5.8, y: 1.22, w: 3.95, h: 2.05, barDir: 'bar', barGrouping: 'clustered', chartColors: ['9CA3AF', '16A34A'], showValue: true, dataLabelPosition: 'outEnd', dataLabelFontSize: 7, dataLabelFormatCode: '₹#,##0',
    valAxisMinVal: 0, valAxisMaxVal: 650, valAxisLabelFontSize: 7, catAxisLabelFontSize: 7, catAxisOrientation: 'maxMin', valGridLine: { color: 'E5E7EB', size: 0.5 }, catGridLine: { style: 'none' },
    showLegend: true, legendPos: 'b', legendFontSize: 7 })
  T(s, 'Illustrative pilot model (fair price + incentive, pooled pickup) — to be validated in the Nagpur field study.', 5.85, 3.27, 3.9, 0.3, { size: 6, color: MUTED, italic: true, align: 'center' })
  T(s, 'From backyard burning to a traceable, fairly-paid chain', 5.85, 3.6, 3.9, 0.25, { size: 10, bold: true, color: NAVY, align: 'center' })
  s.addImage({ data: P2, x: 6.0, y: 3.9, w: 0.58, h: 1.14 })
  s.addImage({ data: P3, x: 6.68, y: 3.9, w: 0.58, h: 1.14 })
  s.addImage({ data: DASHK, x: 7.4, y: 3.9, w: 2.35, h: 1.14, sizing: { type: 'crop', x: 0, y: 0, w: 2.35, h: 1.14 } })
  T(s, 'recycler match  ·  digital receipt  ·  recycler / MoM console (mockups)', 5.85, 5.07, 3.9, 0.16, { size: 6, color: MUTED, italic: true, align: 'center' })
}

// ================================================================== 6. RESEARCH AND REFERENCES
{
  const s = pres.addSlide()
  chrome(s, 'RESEARCH AND REFERENCES')
  const refs = [['policy framework', 'E-Waste (Mgmt)\nRules 2022\nMoEFCC / CPCB', 'https://cpcb.nic.in/e-waste/'],
    ['recycler database', 'CPCB EPR\ne-waste portal:\nregistered recyclers', 'https://eprewastecpcb.in'],
    ['scale of problem', 'Global E-waste\nMonitor 2024\nUNITAR / ITU', 'https://ewastemonitor.info'],
    ['domain partner', 'JNARDDC,\nMinistry of Mines\nNagpur', 'https://jnarddc.gov.in'],
    ['vernacular AI', 'Bhashini:\nHindi / Marathi\nASR & TTS', 'https://bhashini.gov.in'],
    ['payments', 'NPCI UPI:\ninstant payouts\n& receipts', 'https://www.npci.org.in/what-we-do/upi'],
    ['on-device AI', 'TensorFlow Lite\n& critical-minerals\nlist (MoM 2023)', 'https://mines.gov.in']]
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
  T(s, 'UI / UX — collector app (Hindi) and recycler / MoM console', 0.3, 2.88, 6, 0.22, { size: 9, bold: true, color: NAVY })
  T(s, 'Snap & Value  ·  authorized recyclers  ·  digital handover receipt  ·  console', 3.5, 2.88, 6.2, 0.22, { size: 7.5, italic: true, color: MUTED, align: 'right' })
  s.addImage({ data: P1, x: 0.35, y: 3.12, w: 0.95, h: 1.87 })
  s.addImage({ data: P2, x: 1.4, y: 3.12, w: 0.95, h: 1.87 })
  s.addImage({ data: P3, x: 2.45, y: 3.12, w: 0.95, h: 1.87 })
  s.addImage({ data: DASHK, x: 3.6, y: 3.12, w: 6.1, h: 1.87, sizing: { type: 'crop', x: 0, y: 0, w: 6.1, h: 1.87 } })
  R(s, 0.3, 5.03, 9.4, 0.22, WHITE, { line: NAVY, lw: 0.75 })
  T(s, 'Field study: 50 collectors + 3 authorized recyclers, Nagpur · unit-economics report (informal vs platform earnings) delivered with the MVP', 0.4, 5.03, 9.2, 0.22, { size: 7.5, bold: true, color: NAVY, align: 'center', valign: 'middle' })
}

const out = path.join(__dirname, 'FireOrbit_SIH26229_KabadiwalaConnect.pptx')
pres.writeFile({ fileName: out }).then(() => console.log('wrote', out, `(${n} slides)`))
