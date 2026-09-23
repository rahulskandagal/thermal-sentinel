import { LABELS } from '../api.js'

const pct = (v) => (v == null ? '–' : `${(v * 100).toFixed(1)}%`)

function Reliability({ curve }) {
  if (!curve?.length) return null
  const S = 150, P = 18
  const x = (v) => P + v * (S - 2 * P)
  const y = (v) => S - P - v * (S - 2 * P)
  return (
    <div className="reliability">
      <svg viewBox={`0 0 ${S} ${S}`} width="100%" height={S}>
        <rect x={P} y={P} width={S - 2 * P} height={S - 2 * P} fill="none" stroke="#2a3550" />
        <line x1={x(0)} y1={y(0)} x2={x(1)} y2={y(1)} stroke="#4b5563" strokeDasharray="3 3" />
        <polyline fill="none" stroke="#ffb454" strokeWidth="2"
          points={curve.map((c) => `${x(c.confidence)},${y(c.accuracy)}`).join(' ')} />
        {curve.map((c) => (
          <circle key={c.bin} cx={x(c.confidence)} cy={y(c.accuracy)} r={2.5} fill="#ffb454">
            <title>{`stated ${pct(c.confidence)} → actually right ${pct(c.accuracy)} (n=${c.n})`}</title>
          </circle>
        ))}
        <text x={S / 2} y={S - 3} textAnchor="middle" fill="#6b7280" fontSize="7">stated confidence</text>
        <text x={6} y={S / 2} textAnchor="middle" fill="#6b7280" fontSize="7" transform={`rotate(-90 6 ${S / 2})`}>actually right</text>
      </svg>
      <p className="hint">On the dashed line, “80% confident” really is right 80% of the time.</p>
    </div>
  )
}

export default function ModelPanel({ model }) {
  if (!model || model.status) return <section className="panel"><h3>Model</h3><p className="hint">Not trained yet.</p></section>
  const { cv, spatial_holdout: sp, ablation: ab, calibration: cal, stress_test: st, report, classes } = model

  return (
    <section className="panel">
      <h3><span>Model</span> <span className="hint">{model.n_features} features · {model.n_train?.toLocaleString()} train / {model.n_test?.toLocaleString()} test</span></h3>

      <div className="kpis">
        <div className="kpi"><div className="kpi-v">{pct(cv?.accuracy_mean)}</div><div className="kpi-l">cross-validated accuracy <span className="pm">± {((cv?.accuracy_std || 0) * 100).toFixed(1)}</span></div></div>
        <div className="kpi"><div className="kpi-v">{pct(sp?.accuracy_mean)}</div><div className="kpi-l">on a region it never saw</div></div>
        <div className="kpi"><div className="kpi-v">{pct(model.macro_f1)}</div><div className="kpi-l">macro F1 (all six classes)</div></div>
        <div className="kpi"><div className="kpi-v">{cal ? cal.ece_after.toFixed(3) : '–'}</div>
          <div className="kpi-l">{cal?.method?.startsWith('none') ? 'calibration error (already calibrated)' : `calibration error after ${cal?.method}`}</div></div>
      </div>
      <p className="hint">
        Every split is group-aware: all detections of one thermal source stay on the same side, so
        per-source persistence features cannot leak the answer. {cv?.scheme}.
      </p>

      <h4>Rules vs model vs both</h4>
      <table className="mini-table">
        <thead><tr><th></th><th>accuracy</th><th>macro F1</th></tr></thead>
        <tbody>
          {[['Explainable rules only', ab?.rules_only], ['Gradient-boosted model only', ab?.model_only], ['Hybrid (shipped)', ab?.hybrid]].map(([n, v]) => (
            <tr key={n} className={n.includes('shipped') ? 'row-hi' : ''}>
              <td>{n}</td><td>{pct(v?.accuracy)}</td><td>{pct(v?.macro_f1)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="hint">The rules alone are already strong — they are what makes every label explainable. The model
        earns its place on the ambiguous cases, and below {Math.round(0.55 * 100)}% probability the rules take the decision back.</p>

      {st?.levels?.length > 0 && (
        <>
          <h4>When the context is missing</h4>
          <table className="mini-table">
            <thead><tr><th>land cover &amp; facility blanked</th><th>accuracy</th><th>macro F1</th></tr></thead>
            <tbody>
              <tr><td>none (as measured above)</td><td>{pct(ab?.hybrid?.accuracy)}</td><td>{pct(ab?.hybrid?.macro_f1)}</td></tr>
              {st.levels.map((l) => (
                <tr key={l.context_missing}>
                  <td>{Math.round(l.context_missing * 100)}% of detections</td>
                  <td>{pct(l.accuracy)}</td><td>{pct(l.macro_f1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="hint">OSM coverage across India is uneven. This blanks land cover and the nearest facility for
            a share of the test set, so the score says how much is real signal rather than a tidy archive.</p>
        </>
      )}

      <h4>Is the confidence honest?</h4>
      <Reliability curve={cal?.curve} />
      <div className="kv-grid">
        <div className="kv"><span>Calibration error</span><b>{cal?.ece_before.toFixed(3)} → {cal?.ece_after.toFixed(3)}</b></div>
        <div className="kv"><span>Brier score</span><b>{cal?.brier_before.toFixed(3)} → {cal?.brier_after.toFixed(3)}</b></div>
      </div>

      <h4>Per class</h4>
      <table className="mini-table">
        <thead><tr><th></th><th>precision</th><th>recall</th><th>F1</th><th>n</th></tr></thead>
        <tbody>
          {(classes || []).map((c) => {
            const r = report?.[c]
            return r ? (
              <tr key={c}>
                <td><span className="legend-dot" style={{ background: LABELS[c]?.color }} /> {LABELS[c]?.short || c}</td>
                <td>{pct(r.precision)}</td><td>{pct(r.recall)}</td><td>{pct(r['f1-score'])}</td><td>{r.support}</td>
              </tr>
            ) : null
          })}
        </tbody>
      </table>

      {sp?.blocks?.length > 0 && (
        <>
          <h4>Held-out regions</h4>
          <table className="mini-table">
            <thead><tr><th>block (~330 km)</th><th>detections</th><th>accuracy</th></tr></thead>
            <tbody>{sp.blocks.map((b) => (
              <tr key={b.block}><td>{b.block}</td><td>{b.n_test.toLocaleString()}</td><td>{pct(b.accuracy)}</td></tr>
            ))}</tbody>
          </table>
          <p className="hint">Trained on the rest of the country, then asked about this region cold.</p>
        </>
      )}

      <h4>What the model leans on</h4>
      <ol className="feat-list">
        {(model.feature_importance || []).slice(0, 10).map((f) => (
          <li key={f.feature}>
            <span>{f.feature}</span>
            <i style={{ width: `${(f.importance / (model.feature_importance[0].importance || 1)) * 100}%` }} />
          </li>
        ))}
      </ol>
      {model.analyst_labels_applied > 0 && (
        <p className="hint">{model.analyst_labels_applied.toLocaleString()} detections were relabelled by analyst corrections before this fit.</p>
      )}
    </section>
  )
}
