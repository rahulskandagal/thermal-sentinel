import { useState } from 'react'
import { api, LABELS, LABEL_KEYS } from '../api.js'

/** An analyst's verdict on one classification. Confirmations and corrections are stored and
 *  applied as training labels on the next retrain, which is what makes the loop a loop. */
export default function FeedbackBox({ detail: d }) {
  const [sent, setSent] = useState(null)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)
  const [picking, setPicking] = useState(false)
  const [note, setNote] = useState('')

  const send = async (label, verdict) => {
    setBusy(true)
    setError(null)
    try {
      await api.sendFeedback({
        label, verdict, note: note || undefined,
        hotspot_id: d.kind === 'hotspot' ? d.id : undefined,
        group_id: d.kind === 'hotspot' ? d.group_id : d.group_id,
      })
      setSent(verdict === 'confirm' ? `Confirmed as ${LABELS[label]?.short || label}` : `Corrected to ${LABELS[label]?.short || label}`)
      setPicking(false)
    } catch (e) {
      setError(String(e.message || e))
    } finally {
      setBusy(false)
    }
  }

  if (sent) {
    return (
      <div className="feedback done">
        ✓ {sent}.{' '}
        <span className="hint">
          {api.isStatic ? 'Saved in this browser — replay it against /api/feedback to retrain.' : 'It becomes a training label on the next retrain.'}
        </span>
      </div>
    )
  }

  return (
    <div className="feedback">
      <h4>Analyst verdict</h4>
      {!picking ? (
        <div className="fb-row">
          <button className="btn btn-ok" disabled={busy} onClick={() => send(d.label, 'confirm')}>✓ Correct</button>
          <button className="btn" disabled={busy} onClick={() => setPicking(true)}>✎ It&apos;s something else</button>
        </div>
      ) : (
        <>
          <div className="fb-classes">
            {LABEL_KEYS.filter((k) => k !== d.label).map((k) => (
              <button key={k} className="chip" disabled={busy} onClick={() => send(k, 'correct')}>
                <span className="legend-dot" style={{ background: LABELS[k].color }} />{LABELS[k].short}
              </button>
            ))}
          </div>
          <input className="fb-note" placeholder="note (optional)" value={note} onChange={(e) => setNote(e.target.value)} />
          <button className="link" onClick={() => setPicking(false)}>cancel</button>
        </>
      )}
      {error && <p className="hint err">{error}</p>}
    </div>
  )
}
