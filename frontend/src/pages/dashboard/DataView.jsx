import { useEffect, useState } from 'react'
import { AppNav, BackBtn, Arrow } from './AppNav'
import { RadarChart, LineChart, Sparkline } from './charts'
import { MUSCLE_GROUPS, EXERCISES, BODYWEIGHT, WEEK_LABELS } from './data'
import { buildHistoryData, loadSetLogs } from './trainingData'

function HistoryState({ type = 'empty', dark = false, goto }) {
  const copy = {
    loading: {
      title: 'Loading history.',
      body: 'Pulling your logged sets from Firestore.',
    },
    error: {
      title: 'History unavailable.',
      body: 'Your local session still works, but charts could not load right now.',
    },
    empty: {
      title: 'No logged sets yet.',
      body: 'Finish a tracked set and this chart will fill from your own data.',
    },
  }[type]

  return (
    <div className={`history-state ${dark ? 'dark' : ''}`}>
      <strong>{copy.title}</strong>
      <span>{copy.body}</span>
      {type === 'empty' && (
        <button onClick={() => goto('workout')}>Start training</button>
      )}
    </div>
  )
}

export default function DataView({ goto, user }) {
  const [historyState, setHistoryState] = useState(() => ({
    loading: true,
    error: null,
    data: buildHistoryData([]),
  }))

  useEffect(() => {
    if (!user?.uid) return undefined

    let cancelled = false
    setHistoryState((prev) => ({ ...prev, loading: true, error: null }))

    loadSetLogs(user.uid)
      .then((logs) => {
        if (cancelled) return
        setHistoryState({ loading: false, error: null, data: buildHistoryData(logs) })
      })
      .catch((error) => {
        console.error('History load failed:', error)
        if (!cancelled) {
          setHistoryState((prev) => ({ ...prev, loading: false, error }))
        }
      })

    return () => {
      cancelled = true
    }
  }, [user?.uid])

  const history = historyState.data
  const hasLogs = history.hasLogs
  const currentWeekSets = history.setsPerWeek[history.setsPerWeek.length - 1] || 0
  const prCount = Object.values(history.prHistory).filter((pr) => pr.value).length
  const last = BODYWEIGHT[BODYWEIGHT.length - 1]
  const first = BODYWEIGHT[0]
  const avgBw = (BODYWEIGHT.reduce((a, b) => a + b, 0) / BODYWEIGHT.length).toFixed(1)

  const historyStatusType = historyState.loading ? 'loading' : historyState.error ? 'error' : 'empty'
  const showHistoryState = historyState.loading || historyState.error || !hasLogs

  return (
    <>
      <AppNav onHome={() => goto('hub')} onProfile={() => goto('profile')} crumb="The Map" />
      <main className="page">
        <header className="page-head">
          <div>
            <div className="page-eyebrow" style={{ alignItems: 'flex-start', flexDirection: 'column', gap: 14 }}>
              <BackBtn label="Back to hub" onClick={() => goto('hub')} />
              <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ width: 28, height: 1, background: 'currentColor', opacity: 0.5, display: 'inline-block' }}></span>
                II / Your history
              </span>
            </div>
            <h1 className="page-title">
              Read <em>the</em>
              <br />
              map.
            </h1>
          </div>
          <p className="page-lede">
            Your tracked sets now build the history. Muscle balance, weekly volume, recent sessions, and PRs update from the sets you log.
          </p>
        </header>

        <div className="data-grid">
          <div className="col">
            <div className="card card-radar">
              <div className="card-head">
                <div>
                  <span className="card-lbl">Muscle balance · last 4 weeks</span>
                  <h3 className="card-title">
                    Where the <em>work</em> went.
                  </h3>
                </div>
                <div className="card-meta">
                  <strong>{history.totalRecent}</strong>
                  total sets
                </div>
              </div>
              {showHistoryState ? (
                <HistoryState type={historyStatusType} goto={goto} />
              ) : (
                <>
                  <RadarChart data={history.muscleVolume} size={420} />
                  <div className="legend">
                    {MUSCLE_GROUPS.map((g) => (
                      <div className="item" key={g}>
                        <span>{g}</span>
                        <span className="v">{history.muscleVolume[g]}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="card card-line">
              <div className="card-head">
                <div>
                  <span className="card-lbl">Set volume · weekly</span>
                  <h3 className="card-title">
                    Volume <em>climbing.</em>
                  </h3>
                </div>
                <div className="card-meta">
                  <strong>{currentWeekSets}</strong>
                  this wk
                </div>
              </div>
              {showHistoryState ? (
                <HistoryState type={historyStatusType} goto={goto} />
              ) : (
                <>
                  <LineChart values={history.setsPerWeek} labels={history.weekLabels} />
                  <div className="line-foot">
                    <span>{history.weekLabels.length} weeks</span>
                    <span>Avg {history.avgSets} / wk</span>
                  </div>
                </>
              )}
            </div>

            <div className="card">
              <div className="card-head">
                <div>
                  <span className="card-lbl">Recent sessions</span>
                  <h3 className="card-title">
                    The <em>last</em> six.
                  </h3>
                </div>
              </div>
              {showHistoryState ? (
                <HistoryState type={historyStatusType} goto={goto} />
              ) : (
                <div className="session-list">
                  {history.recentSessions.map((s, i) => (
                    <div className="session-row" key={`${s.date}-${s.title}-${i}`}>
                      <span className="s-date">{s.date}</span>
                      <span className="s-title">{s.title}</span>
                      <span className="s-meta">{s.duration} · {s.sets} sets</span>
                      <span className="s-focus">{s.focus}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="col">
            <div className="card dark">
              <div className="card-head">
                <div>
                  <span className="card-lbl">Personal records</span>
                  <h3 className="card-title">
                    Your <em>best</em> work.
                  </h3>
                </div>
                <div className="card-meta">
                  <strong>{prCount}</strong>
                  lifts tracked
                </div>
              </div>
              {showHistoryState ? (
                <HistoryState type={historyStatusType} dark goto={goto} />
              ) : (
                <div className="pr-list">
                  {EXERCISES.map((ex) => {
                    const pr = history.prHistory[ex.id]
                    return (
                      <div className="pr-row" key={ex.id}>
                        <span className="pr-name">{ex.name}</span>
                        <span className="pr-trend">
                          <Sparkline values={pr.history} w={100} h={28} color="var(--accent)" />
                        </span>
                        <span className="pr-val">
                          {pr.value ?? '—'}
                          {pr.value && <small>{pr.unit}</small>}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="card bw-card">
              <div className="card-head">
                <div>
                  <span className="card-lbl">Bodyweight · 11 weeks</span>
                  <h3 className="card-title">
                    Holding the <em>line.</em>
                  </h3>
                </div>
              </div>
              <div className="bw-stat-row">
                <div className="item">
                  <span className="v">
                    {last}
                    <em>lb</em>
                  </span>
                  <span className="l">Today</span>
                </div>
                <div className="item">
                  <span className="v" style={{ color: 'var(--accent)' }}>
                    +{(last - first).toFixed(1)}
                    <em style={{ color: 'var(--muted)' }}>lb</em>
                  </span>
                  <span className="l">11-wk delta</span>
                </div>
                <div className="item">
                  <span className="v">
                    {avgBw}
                    <em>lb</em>
                  </span>
                  <span className="l">Average</span>
                </div>
              </div>
              <LineChart values={BODYWEIGHT} labels={WEEK_LABELS} height={180} />
            </div>

            <div className="card" style={{ background: 'var(--ink)', color: 'var(--paper)' }}>
              <div className="card-head" style={{ marginBottom: 18 }}>
                <div>
                  <span className="card-lbl" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    Ready to lift
                  </span>
                  <h3 className="card-title" style={{ color: 'var(--paper)' }}>
                    Today's <em style={{ color: 'rgba(255,255,255,0.55)' }}>session</em>.
                  </h3>
                </div>
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.55, color: 'rgba(255,255,255,0.75)', maxWidth: '36ch', marginBottom: 22 }}>
                Log your next set and the profile charts will update from your own training history.
              </p>
              <button
                onClick={() => goto('workout')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '14px 22px',
                  background: 'var(--paper)',
                  color: 'var(--ink)',
                  borderRadius: 999,
                  fontSize: 14,
                }}
              >
                Start training
                <span
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    background: 'var(--ink)',
                    color: 'var(--paper)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Arrow />
                </span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
