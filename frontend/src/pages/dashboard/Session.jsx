import { useEffect, useRef, useState } from 'react'
import { AppNav, Arrow } from './AppNav'
import { EXERCISES } from './data'

export default function Session({ goto, exerciseId }) {
  const ex = EXERCISES.find((e) => e.id === exerciseId) || EXERCISES[0]
  const totalSets = ex.sets
  const [setData, setSetData] = useState(
    Array.from({ length: totalSets }, () => ({ weight: '', reps: '', done: false })),
  )
  const [seconds, setSeconds] = useState(90)
  const [running, setRunning] = useState(false)
  const intervalRef = useRef(null)

  const allEx = EXERCISES
  const idx = allEx.findIndex((e) => e.id === ex.id)
  const lineup = allEx

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s <= 1) {
            setRunning(false)
            return 0
          }
          return s - 1
        })
      }, 1000)
    }
    return () => clearInterval(intervalRef.current)
  }, [running])

  const fmt = (s) => {
    const m = Math.floor(s / 60)
    const r = s % 60
    return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`
  }

  const completeSet = (i) => {
    setSetData((prev) => prev.map((s, j) => (j === i ? { ...s, done: !s.done } : s)))
    setSeconds(90)
    setRunning(true)
  }

  const updateField = (i, field, value) => {
    setSetData((prev) => prev.map((s, j) => (j === i ? { ...s, [field]: value } : s)))
  }

  const completed = setData.filter((s) => s.done).length
  const progress = (completed / totalSets) * 100

  const nameParts = ex.name.split(' ')
  const lastWord = nameParts.pop()
  const [mm, ss] = fmt(seconds).split(':')

  return (
    <>
      <AppNav onHome={() => goto('hub')} onProfile={() => goto('profile')} dark crumb={`Set ${Math.min(completed + 1, totalSets)} / ${totalSets}`} />
      <main className="session-screen">
        <div className="session-bg-circle"></div>
        <div className="session-inner">
          <div className="session-head">
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="session-back" onClick={() => goto('workout')}>
                ← Back to lifts
              </button>
              <button className="session-back" onClick={() => goto('hub')}>
                ← Hub
              </button>
            </div>
            <div style={{ textAlign: 'right', fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)' }}>
              Live session
              <br />
              <span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 22, color: 'var(--paper)', letterSpacing: 0, textTransform: 'none' }}>
                Started just now
              </span>
            </div>
          </div>

          <div className="session-grid">
            <div className="session-main">
              <div className="ex-eyebrow">
                {ex.muscle} · {ex.equipment} · {ex.difficulty}
              </div>
              <h2>
                {nameParts.length > 0 && <>{nameParts.join(' ')} </>}
                <em>{lastWord}.</em>
              </h2>
              <p className="ex-cue-big">{ex.cue}</p>

              <div className="set-tracker">
                <div className="tr-head">
                  <span className="lbl">Set tracker</span>
                  <span className="count">
                    {completed}
                    <em>of {totalSets}</em>
                  </span>
                </div>

                {setData.map((s, i) => (
                  <div className={`set-row ${s.done ? 'complete' : ''}`} key={i}>
                    <span className="s-num">SET {String(i + 1).padStart(2, '0')}</span>
                    <span className="s-bar">
                      <span style={{ width: s.done ? '100%' : s.weight && s.reps ? '50%' : '0%' }}></span>
                    </span>
                    <input
                      className="s-input"
                      type="text"
                      placeholder={ex.pr.unit === 'reps' ? 'BW' : `${ex.pr.value} lb`}
                      value={s.weight}
                      onChange={(e) => updateField(i, 'weight', e.target.value)}
                    />
                    <input
                      className="s-input"
                      type="text"
                      placeholder={ex.reps}
                      value={s.reps}
                      onChange={(e) => updateField(i, 'reps', e.target.value)}
                    />
                    <button className="s-done" onClick={() => completeSet(i)}>
                      {s.done ? 'Done ✓' : 'Mark'}
                    </button>
                  </div>
                ))}
              </div>

              <div className="finish-bar">
                <span className="progress">
                  <strong>{Math.round(progress)}%</strong>
                  through this lift
                </span>
                <button
                  className="finish-btn"
                  onClick={() => {
                    if (completed < totalSets) return
                    goto('data')
                  }}
                  style={{ opacity: completed < totalSets ? 0.4 : 1, cursor: completed < totalSets ? 'not-allowed' : 'pointer' }}
                  disabled={completed < totalSets}
                >
                  Finish lift
                  <span className="arr">
                    <Arrow />
                  </span>
                </button>
              </div>
            </div>

            <div className="session-side">
              <div className="side-card">
                <div className="lbl">Rest timer</div>
                <div className="timer">
                  {mm}
                  <em>:</em>
                  {ss}
                </div>
                <div className="timer-controls">
                  <button onClick={() => { setSeconds(60); setRunning(true) }}>60s</button>
                  <button onClick={() => { setSeconds(90); setRunning(true) }}>90s</button>
                  <button onClick={() => { setSeconds(120); setRunning(true) }}>2m</button>
                  <button className="primary" onClick={() => setRunning((r) => !r)}>
                    {running ? 'Pause' : 'Start'}
                  </button>
                </div>
              </div>

              <div className="side-card">
                <div className="lbl">Today's lineup</div>
                <div className="next-up">
                  {lineup.map((e, i) => {
                    const cls = e.id === ex.id ? 'current' : i < idx ? 'done' : ''
                    return (
                      <div key={e.id} className={`nu-row ${cls}`}>
                        <span className="n">{String(i + 1).padStart(2, '0')}</span>
                        <span className="name">{e.name}</span>
                        <span className="meta">
                          {e.sets}×{e.reps}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="side-card">
                <div className="lbl">Last time on this lift</div>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 36, lineHeight: 1, marginBottom: 8 }}>
                  {ex.pr.value}
                  <em style={{ fontStyle: 'italic', color: 'rgba(255,255,255,0.45)', fontSize: 18, marginLeft: 4 }}>
                    {ex.pr.unit}
                  </em>
                </div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>
                  PR · {ex.pr.date}
                </div>
                <p style={{ marginTop: 18, fontSize: 13, lineHeight: 1.55, color: 'rgba(255,255,255,0.75)' }}>
                  Hit your PR + 1 rep today and we'll log a new ceiling.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
