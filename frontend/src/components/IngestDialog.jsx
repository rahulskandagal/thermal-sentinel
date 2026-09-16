import { useState } from 'react'

const PRESETS = {
  'Current map view': null,
  'All India': [68.0, 6.5, 97.5, 37.5],
  'Gujarat industrial coast': [68.5, 20.0, 73.5, 24.5],
  'Jharkhand–Odisha steel & coal belt': [83.0, 19.5, 88.5, 25.0],
  'Punjab–Haryana (stubble burning)': [73.5, 28.5, 77.5, 32.5],
  'Uttarakhand forests': [77.5, 29.0, 81.0, 31.5],
}

export default function IngestDialog({ status, getBbox, onClose, onRun }) {
  const live = status?.firms_key_configured
  const [source, setSource] = useState(live ? 'firms' : 'demo')
  const [preset, setPreset] = useState('Current map view')
  const [days, setDays] = useState(30)
  const [useOsm, setUseOsm] = useState(true)
  const [csvPath, setCsvPath] = useState('')

  const submit = (e) => {
    e.preventDefault()
    const bbox = PRESETS[preset] || getBbox() || [68.0, 6.5, 97.5, 37.5]
    onRun({ source, bbox, days: +days, use_osm: useOsm, csv_path: source === 'csv' ? csvPath : undefined })
  }

  return (
    <div className="modal-back" onClick={onClose}>
      <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <h2>Run classification pipeline</h2>
        <label className="field">Data source
          <select value={source} onChange={(e) => setSource(e.target.value)}>
            <option value="demo">Bundled demo archive (offline, labelled, Mar–May 2025)</option>
            <option value="firms" disabled={!live}>Live NASA FIRMS (VIIRS NRT){live ? '' : ' — set FIRMS_MAP_KEY in backend/.env'}</option>
            <option value="csv">FIRMS archive CSV on server disk</option>
          </select>
        </label>
        {source !== 'demo' && (
          <>
            <label className="field">Area
              <select value={preset} onChange={(e) => setPreset(e.target.value)}>
                {Object.keys(PRESETS).map((k) => <option key={k}>{k}</option>)}
              </select>
            </label>
            <label className="field">Days back <input type="number" min="1" max="365" value={days} onChange={(e) => setDays(e.target.value)} />
              <span className="hint">FIRMS NRT keeps ~2 months; use *_SP sources in .env for older archives.</span></label>
            <label className="toggles"><input type="checkbox" checked={useOsm} onChange={(e) => setUseOsm(e.target.checked)} /> Query OpenStreetMap (Overpass) for industrial sites &amp; land cover around detections</label>
            {source === 'csv' && <label className="field">CSV path on server <input value={csvPath} onChange={(e) => setCsvPath(e.target.value)} placeholder="C:\\data\\fire_nrt_SV-C2_123.csv" /></label>}
          </>
        )}
        <p className="hint">The run happens in the background; the dashboard reloads when it finishes. Large areas + OSM may take a few minutes (Overpass rate limits).</p>
        <div className="modal-actions">
          <button type="button" className="btn" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary">Run</button>
        </div>
      </form>
    </div>
  )
}
