import { useEffect, useMemo, useRef, useState } from 'react'
import { LABELS, LABEL_KEYS } from '../api.js'

const DAY = 86400000
const iso = (d) => new Date(d).toISOString().slice(0, 10)

/** Scrub the 90-day archive a day at a time: a plant burns every night, a crop fire
 *  flares once and is gone. That difference is the whole idea, and it only shows in motion. */
export default function TimeSlider({ stats, filters, setFilters }) {
  const [on, setOn] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [i, setI] = useState(0)
  const [windowDays, setWindowDays] = useState(7)
  const timer = useRef(null)

  const { start, n } = useMemo(() => {
    const from = stats?.totals?.date_from, to = stats?.totals?.date_to
    if (!from || !to) return { start: null, n: 0 }
    const s = Date.parse(from)
    return { start: s, n: Math.max(1, Math.round((Date.parse(to) - s) / DAY) + 1) }
  }, [stats])

  const perDay = useMemo(() => {
    const m = new Map()
    for (const r of stats?.by_day || []) {
      if (!m.has(r.acq_date)) m.set(r.acq_date, {})
      m.get(r.acq_date)[r.label] = r.c
    }
    return m
  }, [stats])

  // Drive the map's date filter from the cursor while time travel is on
  useEffect(() => {
    if (!on || !start) return
    const end = start + i * DAY
    setFilters((f) => ({ ...f, dateFrom: iso(Math.max(start, end - (windowDays - 1) * DAY)), dateTo: iso(end) }))
  }, [on, i, windowDays, start, setFilters])

  useEffect(() => {
    if (!playing) return
    timer.current = setInterval(() => setI((v) => (v + 1) % n), 420)
    return () => clearInterval(timer.current)
  }, [playing, n])

  const stop = () => {
    setOn(false)
    setPlaying(false)
    setFilters((f) => ({ ...f, dateFrom: stats.totals.date_from, dateTo: stats.totals.date_to }))
  }

  if (!start) return null
  if (!on) {
    return (
      <div className="timebar timebar-off">
        <button className="btn" onClick={() => { setOn(true); setI(n - 1) }}>▶ Time travel</button>
        <span className="hint">Replay the {n} days one at a time</span>
      </div>
    )
  }

  const day = iso(start + i * DAY)
  const counts = perDay.get(day) || {}
  const total = Object.values(counts).reduce((a, b) => a + b, 0)

  return (
    <div className="timebar">
      <button className="btn btn-primary" onClick={() => setPlaying((p) => !p)}>{playing ? '❚❚' : '▶'}</button>
      <div className="timebar-mid">
        <input type="range" min="0" max={n - 1} value={i} onChange={(e) => { setPlaying(false); setI(+e.target.value) }} />
        <div className="timebar-labels">
          <b>{day}</b>
          <span>{windowDays}-day window · {total.toLocaleString()} detections that day</span>
          <span className="daybar">
            {LABEL_KEYS.map((k) => counts[k] ? (
              <i key={k} style={{ background: LABELS[k].color, width: `${(counts[k] / Math.max(total, 1)) * 100}%` }}
                title={`${LABELS[k].short}: ${counts[k]}`} />
            ) : null)}
          </span>
        </div>
      </div>
      <label className="timebar-win">
        window
        <select value={windowDays} onChange={(e) => setWindowDays(+e.target.value)}>
          {[1, 3, 7, 14, 30].map((d) => <option key={d} value={d}>{d} d</option>)}
        </select>
      </label>
      <button className="btn" onClick={stop}>✕</button>
    </div>
  )
}
