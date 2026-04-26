import { AppNav, BackBtn, Arrow } from './AppNav'
import { RadarChart, LineChart, Sparkline } from './charts'
import { MUSCLE_GROUPS, MUSCLE_VOLUME, SETS_PER_WEEK, WEEK_LABELS, RECENT_SESSIONS, EXERCISES, PR_HISTORY, BODYWEIGHT } from './data'

export default function DataView({ goto }) {
  const totalRecent = Object.values(MUSCLE_VOLUME).reduce((a, b) => a + b, 0)
  const last = BODYWEIGHT[BODYWEIGHT.length - 1]
  const first = BODYWEIGHT[0]
  const avgSets = Math.round(SETS_PER_WEEK.reduce((a, b) => a + b, 0) / SETS_PER_WEEK.length)
  const avgBw = (BODYWEIGHT.reduce((a, b) => a + b, 0) / BODYWEIGHT.length).toFixed(1)

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
            Eleven weeks of training, four lenses. Look for the rhythm — where you've leaned, where you've grown, where the next session should land.
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
                  <strong>{totalRecent}</strong>
                  total sets
                </div>
              </div>
              <RadarChart data={MUSCLE_VOLUME} size={420} />
              <div className="legend">
                {MUSCLE_GROUPS.map((g) => (
                  <div className="item" key={g}>
                    <span>{g}</span>
                    <span className="v">{MUSCLE_VOLUME[g]}</span>
                  </div>
                ))}
              </div>
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
                  <strong>+63%</strong>
                  vs week 6
                </div>
              </div>
              <LineChart values={SETS_PER_WEEK} labels={WEEK_LABELS} />
              <div className="line-foot">
                <span>11 weeks</span>
                <span>Avg {avgSets} / wk</span>
              </div>
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
              <div className="session-list">
                {RECENT_SESSIONS.map((s, i) => (
                  <div className="session-row" key={i}>
                    <span className="s-date">{s.date}</span>
                    <span className="s-title">{s.title}</span>
                    <span className="s-meta">{s.duration} · {s.sets} sets</span>
                    <span className="s-focus">{s.focus}</span>
                  </div>
                ))}
              </div>
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
                  <strong>5</strong>
                  lifts tracked
                </div>
              </div>
              <div className="pr-list">
                {EXERCISES.map((ex) => (
                  <div className="pr-row" key={ex.id}>
                    <span className="pr-name">{ex.name}</span>
                    <span className="pr-trend">
                      <Sparkline values={PR_HISTORY[ex.id]} w={100} h={28} color="var(--accent)" />
                    </span>
                    <span className="pr-val">
                      {ex.pr.value}
                      <small>{ex.pr.unit}</small>
                    </span>
                  </div>
                ))}
              </div>
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
                Lower-body focus. 4 lifts, 18 sets, ~52 minutes. Your hamstrings asked for it.
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
