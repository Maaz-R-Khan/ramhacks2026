import { useState } from 'react'
import { AppNav, BackBtn, Arrow } from './AppNav'
import { EXERCISES, MUSCLE_GROUPS, DIFFICULTIES } from './data'

const DIFF_ORDER = { Beginner: 0, Intermediate: 1, Advanced: 2 }

export default function WorkoutPicker({ goto }) {
  const [query, setQuery] = useState('')
  const [muscle, setMuscle] = useState('All')
  const [diff, setDiff] = useState('All')

  const filtered = EXERCISES.filter((ex) => {
    if (query && !ex.name.toLowerCase().includes(query.toLowerCase())) return false
    if (muscle !== 'All' && ex.muscle !== muscle && !ex.secondary.includes(muscle)) return false
    if (diff !== 'All' && ex.difficulty !== diff) return false
    return true
  }).sort((a, b) => DIFF_ORDER[a.difficulty] - DIFF_ORDER[b.difficulty])

  return (
    <>
      <AppNav onHome={() => goto('hub')} onProfile={() => goto('profile')} crumb="The Gym" />
      <main className="page">
        <header className="page-head">
          <div>
            <div className="page-eyebrow" style={{ alignItems: 'flex-start', flexDirection: 'column', gap: 14 }}>
              <BackBtn label="Back to hub" onClick={() => goto('hub')} />
              <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ width: 28, height: 1, background: 'currentColor', opacity: 0.5, display: 'inline-block' }}></span>
                I / The gym
              </span>
            </div>
            <h1 className="page-title">
              Pick a <em>lift.</em>
            </h1>
          </div>
          <p className="page-lede">
            Five movements. Search or filter to land on what you'll work today. Hit start when you're ready and the coach will count with you.
          </p>
        </header>

        <div className="picker-toolbar">
          <div className="picker-search">
            <span className="search-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search lifts…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button className="clear" onClick={() => setQuery('')}>
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="picker-toolbar" style={{ marginBottom: 36 }}>
          <span className="chip-group-label">Muscle</span>
          <div className="chip-row">
            {['All', ...MUSCLE_GROUPS].map((g) => (
              <button key={g} className={`chip ${muscle === g ? 'active' : ''}`} onClick={() => setMuscle(g)}>
                {g}
              </button>
            ))}
          </div>
          <div className="chip-divider"></div>
          <span className="chip-group-label">Level</span>
          <div className="chip-row">
            {['All', ...DIFFICULTIES].map((d) => (
              <button key={d} className={`chip ${diff === d ? 'active' : ''}`} onClick={() => setDiff(d)}>
                {d}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="no-results">
            Nothing matches that.
            <small>Try clearing a filter</small>
          </div>
        ) : (
          <div className="exercise-grid">
            {filtered.map((ex, i) => {
              const words = ex.name.split(' ')
              return (
                <button key={ex.id} className="exercise-card muscle-band" onClick={() => goto('session', ex.id)}>
                  <div className="ex-head">
                    <span className="ex-num">
                      {String(i + 1).padStart(2, '0')} · {ex.muscle.toUpperCase()}
                    </span>
                    <span className={`ex-diff ${ex.difficulty.toLowerCase()}`}>{ex.difficulty}</span>
                  </div>
                  <h3 className="ex-name">
                    {words.map((w, idx) =>
                      idx === words.length - 1 ? <em key={idx}>{w}</em> : <span key={idx}>{w} </span>,
                    )}
                  </h3>
                  <p className="ex-cue">{ex.cue}</p>
                  <div className="ex-foot">
                    <div className="ex-meta">
                      <span>
                        <strong>{ex.sets}</strong> sets
                      </span>
                      <span>
                        <strong>{ex.reps}</strong> reps
                      </span>
                    </div>
                    <div className="ex-pr">
                      {ex.pr.value}
                      <small>PR · {ex.pr.unit}</small>
                    </div>
                  </div>
                  <span className="ex-arrow">
                    <Arrow />
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </main>
    </>
  )
}
