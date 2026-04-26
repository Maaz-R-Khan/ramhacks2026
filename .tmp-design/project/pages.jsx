// ============================================================
// Page components: Hub, DataView, WorkoutPicker, Session
// ============================================================
// Using React.* directly to avoid identifier collisions across babel scripts

// -------- TOP NAV --------
function AppNav({ view, onHome, onProfile, dark = false, crumb }) {
  const [scrolled, setScrolled] = React.useState(false);
  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const cls = ['app-nav', dark ? 'dark' : '', scrolled ? 'scrolled' : ''].join(' ');
  return (
    <nav className={cls}>
      <a href="#" onClick={(e) => { e.preventDefault(); onHome(); }} className="brand">
        <span className="brand-mark"></span>
        FORMLINE<small>AI Personal Trainer.</small>
      </a>
      {crumb && (
        <div className="crumb">
          <span>HUB</span>
          <span className="sep"></span>
          <span style={{ opacity: 1 }}>{crumb}</span>
        </div>
      )}
      <div className="nav-right">
        <span className="pill">
          <span className="dot"></span>
          {window.USER.streak}-DAY STREAK
        </span>
        <button
          className="avatar"
          onClick={onProfile}
          title="Profile & Settings"
          style={{ cursor: 'pointer' }}
        >{window.USER.name[0]}</button>
      </div>
    </nav>
  );
}

// -------- HUB --------
function Hub({ goto }) {
  const u = window.USER;
  return (
    <>
      <AppNav onHome={() => goto('hub')} onProfile={() => goto('profile')} />
      <main className="hub">
        <div className="hub-divider"></div>
        <section className="hub-door train" onClick={() => goto('workout')}>
          <div className="door-visual">
            <div className="door-art"></div>
          </div>
          <div className="door-eyebrow">I &nbsp;/&nbsp; SESSION 015</div>

          <h1 className="door-headline">
            Train<br /><em>now.</em>
          </h1>
          <p className="door-sub">
            Five lifts ready. Pick what your body asks for, or follow today's plan. The coach watches, the data follows.
          </p>
          <div className="door-foot">
            <div className="door-cta">
              Open the gym
              <span className="arr"><Arrow /></span>
            </div>
            <div className="door-meta">
              <strong>{u.streak}<em style={{ fontSize: 18 }}>d</em></strong>
              streak running
            </div>
          </div>
        </section>

        <section className="hub-door track" onClick={() => goto('data')}>
          <div className="door-visual">
            <div className="door-art"></div>
          </div>
          <div className="door-eyebrow">II &nbsp;/&nbsp; YOUR HISTORY</div>

          <h1 className="door-headline">
            Read<br />the <em>map.</em>
          </h1>
          <p className="door-sub">
            Eleven weeks of work, charted. Muscle balance, set volume, PRs, bodyweight — everything you've moved.
          </p>
          <div className="door-foot">
            <div className="door-cta">
              See the data
              <span className="arr"><Arrow /></span>
            </div>
            <div className="door-meta">
              <strong>{u.totalSets}</strong>
              total sets logged
            </div>
          </div>
        </section>
      </main>

      <section className="hub-strip">
        <div className="cell">
          <span className="lbl">This week</span>
          <span className="val">{window.SETS_PER_WEEK[window.SETS_PER_WEEK.length - 1]}<em>sets</em></span>
          <span className="delta">↑ +6 vs last</span>
        </div>
        <div className="cell">
          <span className="lbl">Top muscle group</span>
          <span className="val" style={{ fontStyle: 'italic' }}>Legs</span>
          <span className="delta" style={{ color: 'var(--muted)' }}>78 sets · 4 wk</span>
        </div>
        <div className="cell">
          <span className="lbl">Latest PR</span>
          <span className="val">245<em>lb</em></span>
          <span className="delta" style={{ color: 'var(--muted)' }}>back squat · Apr 18</span>
        </div>
        <div className="cell">
          <span className="lbl">Bodyweight</span>
          <span className="val">{window.BODYWEIGHT[window.BODYWEIGHT.length - 1]}<em>lb</em></span>
          <span className="delta">↑ +2.7 / 11 wk</span>
        </div>
      </section>
    </>
  );
}

// -------- BACK BUTTON --------
function BackBtn({ label, onClick, dark = false }) {
  const style = {
    display: 'inline-flex', alignItems: 'center', gap: 10,
    fontFamily: 'var(--mono)', fontSize: 11,
    letterSpacing: '0.2em', textTransform: 'uppercase',
    padding: '8px 16px',
    border: `1px solid ${dark ? 'rgba(255,255,255,0.2)' : 'var(--line)'}`,
    borderRadius: 999,
    color: dark ? 'rgba(255,255,255,0.75)' : 'var(--muted)',
    cursor: 'pointer',
    transition: 'background .2s, color .2s',
    background: 'transparent',
  };
  return (
    <button style={style}
      onClick={onClick}
      onMouseEnter={e => { e.currentTarget.style.background = dark ? 'rgba(255,255,255,0.06)' : 'var(--paper-2)'; e.currentTarget.style.color = dark ? 'var(--paper)' : 'var(--ink)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = dark ? 'rgba(255,255,255,0.75)' : 'var(--muted)'; }}
    >
      ← {label}
    </button>
  );
}

// -------- DATA VIEW --------
function DataView({ goto }) {
  const totalRecent = Object.values(window.MUSCLE_VOLUME).reduce((a, b) => a + b, 0);
  const last = window.BODYWEIGHT[window.BODYWEIGHT.length - 1];
  const first = window.BODYWEIGHT[0];

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
            <h1 className="page-title">Read <em>the</em><br />map.</h1>
          </div>
          <p className="page-lede">
            Eleven weeks of training, four lenses. Look for the rhythm — where you've leaned, where you've grown, where the next session should land.
          </p>
        </header>

        <div className="data-grid">
          {/* LEFT col */}
          <div className="col">
            {/* Radar */}
            <div className="card card-radar">
              <div className="card-head">
                <div>
                  <span className="card-lbl">Muscle balance · last 4 weeks</span>
                  <h3 className="card-title">Where the <em>work</em> went.</h3>
                </div>
                <div className="card-meta">
                  <strong>{totalRecent}</strong>
                  total sets
                </div>
              </div>
              <window.RadarChart data={window.MUSCLE_VOLUME} size={420} />
              <div className="legend">
                {window.MUSCLE_GROUPS.map(g => (
                  <div className="item" key={g}>
                    <span>{g}</span>
                    <span className="v">{window.MUSCLE_VOLUME[g]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Line — sets per week */}
            <div className="card card-line">
              <div className="card-head">
                <div>
                  <span className="card-lbl">Set volume · weekly</span>
                  <h3 className="card-title">Volume <em>climbing.</em></h3>
                </div>
                <div className="card-meta">
                  <strong>+63%</strong>
                  vs week 6
                </div>
              </div>
              <window.LineChart values={window.SETS_PER_WEEK} labels={window.WEEK_LABELS} />
              <div className="line-foot">
                <span>11 weeks</span>
                <span>Avg {Math.round(window.SETS_PER_WEEK.reduce((a, b) => a + b, 0) / window.SETS_PER_WEEK.length)} / wk</span>
              </div>
            </div>

            {/* Recent sessions */}
            <div className="card">
              <div className="card-head">
                <div>
                  <span className="card-lbl">Recent sessions</span>
                  <h3 className="card-title">The <em>last</em> six.</h3>
                </div>
              </div>
              <div className="session-list">
                {window.RECENT_SESSIONS.map((s, i) => (
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

          {/* RIGHT col */}
          <div className="col">
            {/* PR tracker (dark) */}
            <div className="card dark">
              <div className="card-head">
                <div>
                  <span className="card-lbl">Personal records</span>
                  <h3 className="card-title">Your <em>best</em> work.</h3>
                </div>
                <div className="card-meta">
                  <strong>5</strong>
                  lifts tracked
                </div>
              </div>
              <div className="pr-list">
                {window.EXERCISES.map(ex => (
                  <div className="pr-row" key={ex.id}>
                    <span className="pr-name">{ex.name}</span>
                    <span className="pr-trend">
                      <window.Sparkline values={window.PR_HISTORY[ex.id]} w={100} h={28} color="var(--accent)" />
                    </span>
                    <span className="pr-val">
                      {ex.pr.value}
                      <small>{ex.pr.unit}</small>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bodyweight */}
            <div className="card bw-card">
              <div className="card-head">
                <div>
                  <span className="card-lbl">Bodyweight · 11 weeks</span>
                  <h3 className="card-title">Holding the <em>line.</em></h3>
                </div>
              </div>
              <div className="bw-stat-row">
                <div className="item">
                  <span className="v">{last}<em>lb</em></span>
                  <span className="l">Today</span>
                </div>
                <div className="item">
                  <span className="v" style={{ color: 'var(--accent)' }}>+{(last - first).toFixed(1)}<em style={{ color: 'var(--muted)' }}>lb</em></span>
                  <span className="l">11-wk delta</span>
                </div>
                <div className="item">
                  <span className="v">{(window.BODYWEIGHT.reduce((a, b) => a + b, 0) / window.BODYWEIGHT.length).toFixed(1)}<em>lb</em></span>
                  <span className="l">Average</span>
                </div>
              </div>
              <window.LineChart values={window.BODYWEIGHT} labels={window.WEEK_LABELS} height={180} />
            </div>

            {/* Quick action card */}
            <div className="card" style={{ background: 'var(--ink)', color: 'var(--paper)' }}>
              <div className="card-head" style={{ marginBottom: 18 }}>
                <div>
                  <span className="card-lbl" style={{ color: 'rgba(255,255,255,0.5)' }}>Ready to lift</span>
                  <h3 className="card-title" style={{ color: 'var(--paper)' }}>Today's <em style={{ color: 'rgba(255,255,255,0.55)' }}>session</em>.</h3>
                </div>
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.55, color: 'rgba(255,255,255,0.75)', maxWidth: '36ch', marginBottom: 22 }}>
                Lower-body focus. 4 lifts, 18 sets, ~52 minutes. Your hamstrings asked for it.
              </p>
              <button onClick={() => goto('workout')}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 12,
                  padding: '14px 22px',
                  background: 'var(--paper)', color: 'var(--ink)',
                  borderRadius: 999, fontSize: 14,
                }}>
                Start training
                <span style={{
                  width: 22, height: 22, borderRadius: '50%',
                  background: 'var(--ink)', color: 'var(--paper)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                }}><Arrow /></span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

// -------- WORKOUT PICKER --------
function WorkoutPicker({ goto }) {
  const [query, setQuery] = React.useState('');
  const [muscle, setMuscle] = React.useState('All');
  const [diff, setDiff] = React.useState('All');

  const DIFF_ORDER = { Beginner: 0, Intermediate: 1, Advanced: 2 };

  const filtered = window.EXERCISES.filter(ex => {
    if (query && !ex.name.toLowerCase().includes(query.toLowerCase())) return false;
    if (muscle !== 'All' && ex.muscle !== muscle && !ex.secondary.includes(muscle)) return false;
    if (diff !== 'All' && ex.difficulty !== diff) return false;
    return true;
  }).sort((a, b) => DIFF_ORDER[a.difficulty] - DIFF_ORDER[b.difficulty]);

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
            <h1 className="page-title">Pick a <em>lift.</em></h1>
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
              <button className="clear" onClick={() => setQuery('')}>Clear</button>
            )}
          </div>
        </div>

        <div className="picker-toolbar" style={{ marginBottom: 36 }}>
          <span className="chip-group-label">Muscle</span>
          <div className="chip-row">
            {['All', ...window.MUSCLE_GROUPS].map(g => (
              <button key={g} className={`chip ${muscle === g ? 'active' : ''}`}
                onClick={() => setMuscle(g)}>{g}</button>
            ))}
          </div>
          <div className="chip-divider"></div>
          <span className="chip-group-label">Level</span>
          <div className="chip-row">
            {['All', ...window.DIFFICULTIES].map(d => (
              <button key={d} className={`chip ${diff === d ? 'active' : ''}`}
                onClick={() => setDiff(d)}>{d}</button>
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
            {filtered.map((ex, i) => (
              <button key={ex.id} className="exercise-card muscle-band"
                onClick={() => goto('session', ex.id)}>
                <div className="ex-head">
                  <span className="ex-num">{String(i + 1).padStart(2, '0')} · {ex.muscle.toUpperCase()}</span>
                  <span className={`ex-diff ${ex.difficulty.toLowerCase()}`}>{ex.difficulty}</span>
                </div>
                <h3 className="ex-name">{ex.name.split(' ').map((w, idx, arr) => (
                  idx === arr.length - 1 ? <em key={idx}>{w}</em> : <span key={idx}>{w} </span>
                ))}</h3>
                <p className="ex-cue">{ex.cue}</p>
                <div className="ex-foot">
                  <div className="ex-meta">
                    <span><strong>{ex.sets}</strong> sets</span>
                    <span><strong>{ex.reps}</strong> reps</span>
                  </div>
                  <div className="ex-pr">
                    {ex.pr.value}
                    <small>PR · {ex.pr.unit}</small>
                  </div>
                </div>
                <span className="ex-arrow"><Arrow /></span>
              </button>
            ))}
          </div>
        )}
      </main>
    </>
  );
}

// -------- ACTIVE SESSION --------
function Session({ goto, exerciseId }) {
  const ex = window.EXERCISES.find(e => e.id === exerciseId) || window.EXERCISES[0];
  const totalSets = ex.sets;
  const [setData, setSetData] = React.useState(
    Array.from({ length: totalSets }, () => ({ weight: '', reps: '', done: false }))
  );
  const [seconds, setSeconds] = React.useState(90);
  const [running, setRunning] = React.useState(false);
  const intervalRef = React.useRef(null);

  // Find next exercises
  const allEx = window.EXERCISES;
  const idx = allEx.findIndex(e => e.id === ex.id);
  const lineup = allEx; // show all 5 as a virtual session lineup

  React.useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => {
          if (s <= 1) { setRunning(false); return 0; }
          return s - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const fmt = (s) => {
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
  };

  const completeSet = (i) => {
    setSetData(prev => prev.map((s, j) => j === i ? { ...s, done: !s.done } : s));
    setSeconds(90); setRunning(true);
  };

  const updateField = (i, field, value) => {
    setSetData(prev => prev.map((s, j) => j === i ? { ...s, [field]: value } : s));
  };

  const completed = setData.filter(s => s.done).length;
  const progress = (completed / totalSets) * 100;

  const nameParts = ex.name.split(' ');
  const lastWord = nameParts.pop();

  return (
    <>
      <AppNav onHome={() => goto('hub')} onProfile={() => goto('profile')} dark crumb={`Set ${Math.min(completed + 1, totalSets)} / ${totalSets}`} />
      <main className="session-screen">
        <div className="session-bg-circle"></div>
        <div className="session-inner">
          <div className="session-head">
            <button className="session-back" onClick={() => goto('workout')}>
              ← Back to lifts
            </button>
            <button className="session-back" onClick={() => goto('hub')} style={{ marginLeft: 8 }}>
              ← Hub
            </button>
            <div style={{ textAlign: 'right', fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)' }}>
              Live session<br />
              <span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 22, color: 'var(--paper)', letterSpacing: 0, textTransform: 'none' }}>
                Started just now
              </span>
            </div>
          </div>

          <div className="session-grid">
            {/* MAIN */}
            <div className="session-main">
              <div className="ex-eyebrow">{ex.muscle} · {ex.equipment} · {ex.difficulty}</div>
              <h2>
                {nameParts.length > 0 && <>{nameParts.join(' ')} </>}
                <em>{lastWord}.</em>
              </h2>
              <p className="ex-cue-big">{ex.cue}</p>

              <div className="set-tracker">
                <div className="tr-head">
                  <span className="lbl">Set tracker</span>
                  <span className="count">{completed}<em>of {totalSets}</em></span>
                </div>

                {setData.map((s, i) => (
                  <div className={`set-row ${s.done ? 'complete' : ''}`} key={i}>
                    <span className="s-num">SET {String(i + 1).padStart(2, '0')}</span>
                    <span className="s-bar">
                      <span style={{ width: s.done ? '100%' : (s.weight && s.reps ? '50%' : '0%') }}></span>
                    </span>
                    <input className="s-input" type="text" placeholder={ex.pr.unit === 'reps' ? 'BW' : `${ex.pr.value} lb`}
                      value={s.weight} onChange={(e) => updateField(i, 'weight', e.target.value)} />
                    <input className="s-input" type="text" placeholder={ex.reps}
                      value={s.reps} onChange={(e) => updateField(i, 'reps', e.target.value)} />
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
                <button className="finish-btn"
                  onClick={() => {
                    if (completed < totalSets) return;
                    goto('data');
                  }}
                  style={{ opacity: completed < totalSets ? 0.4 : 1, cursor: completed < totalSets ? 'not-allowed' : 'pointer' }}
                  disabled={completed < totalSets}
                >
                  Finish lift
                  <span className="arr"><Arrow /></span>
                </button>
              </div>
            </div>

            {/* SIDE */}
            <div className="session-side">
              <div className="side-card">
                <div className="lbl">Rest timer</div>
                <div className="timer">
                  {fmt(seconds).split(':')[0]}<em>:</em>{fmt(seconds).split(':')[1]}
                </div>
                <div className="timer-controls">
                  <button onClick={() => { setSeconds(60); setRunning(true); }}>60s</button>
                  <button onClick={() => { setSeconds(90); setRunning(true); }}>90s</button>
                  <button onClick={() => { setSeconds(120); setRunning(true); }}>2m</button>
                  <button className="primary" onClick={() => setRunning(r => !r)}>
                    {running ? 'Pause' : 'Start'}
                  </button>
                </div>
              </div>

              <div className="side-card">
                <div className="lbl">Today's lineup</div>
                <div className="next-up">
                  {lineup.map((e, i) => {
                    const cls = e.id === ex.id ? 'current' : (i < idx ? 'done' : '');
                    return (
                      <div key={e.id} className={`nu-row ${cls}`}>
                        <span className="n">{String(i + 1).padStart(2, '0')}</span>
                        <span className="name">{e.name}</span>
                        <span className="meta">{e.sets}×{e.reps}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="side-card">
                <div className="lbl">Last time on this lift</div>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 36, lineHeight: 1, marginBottom: 8 }}>
                  {ex.pr.value}<em style={{ fontStyle: 'italic', color: 'rgba(255,255,255,0.45)', fontSize: 18, marginLeft: 4 }}>{ex.pr.unit}</em>
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
  );
}

// Tiny arrow used everywhere
function Arrow() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="M13 5l7 7-7 7" />
    </svg>
  );
}

// -------- PROFILE & SETTINGS --------
function ProfileSettings({ goto }) {
  const u = window.USER;

  // Local state for form fields
  const [name, setName]         = React.useState(u.name);
  const [email, setEmail]       = React.useState('alex@example.com');
  const [unit, setUnit]         = React.useState('imperial');
  const [goal, setGoal]         = React.useState('strength');
  const [restDef, setRestDef]   = React.useState(90);
  const [notifW, setNotifW]     = React.useState(true);
  const [notifPR, setNotifPR]   = React.useState(true);
  const [notifTips, setNotifTips] = React.useState(false);
  const [saved, setSaved]       = React.useState(false);

  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  const Section = ({ title, children }) => (
    <div style={{ marginBottom: 48 }}>
      <div style={{
        fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.22em',
        textTransform: 'uppercase', color: 'var(--muted)',
        display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24,
      }}>
        <span style={{ width: 28, height: 1, background: 'currentColor', opacity: 0.5, display: 'inline-block' }}></span>
        {title}
      </div>
      <div style={{ display: 'grid', gap: 14 }}>{children}</div>
    </div>
  );

  const Field = ({ label, children, hint }) => (
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 24, alignItems: 'start', padding: '20px 0', borderBottom: '1px solid var(--line)' }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 500, marginBottom: hint ? 4 : 0 }}>{label}</div>
        {hint && <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>{hint}</div>}
      </div>
      <div>{children}</div>
    </div>
  );

  const textInputStyle = {
    width: '100%', maxWidth: 360,
    background: 'var(--paper-3)', border: '1px solid var(--line)',
    borderRadius: 8, padding: '12px 16px',
    fontSize: 14, outline: 'none',
    transition: 'border-color .2s',
  };

  const chipSet = (val, setVal, opts) => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {opts.map(o => (
        <button key={o.value}
          onClick={() => setVal(o.value)}
          style={{
            padding: '9px 18px',
            borderRadius: 999,
            border: `1px solid ${val === o.value ? 'var(--ink)' : 'var(--line)'}`,
            background: val === o.value ? 'var(--ink)' : 'transparent',
            color: val === o.value ? 'var(--paper)' : 'var(--muted)',
            fontFamily: 'var(--mono)', fontSize: 11,
            letterSpacing: '0.16em', textTransform: 'uppercase',
            cursor: 'pointer', transition: 'all .15s',
          }}>
          {o.label}
        </button>
      ))}
    </div>
  );

  const Toggle = ({ val, setVal }) => (
    <button
      onClick={() => setVal(v => !v)}
      style={{
        width: 44, height: 26, borderRadius: 999,
        background: val ? 'var(--accent)' : 'var(--line)',
        border: 'none', cursor: 'pointer',
        position: 'relative', transition: 'background .2s',
        flexShrink: 0,
      }}>
      <span style={{
        position: 'absolute', top: 3,
        left: val ? 21 : 3,
        width: 20, height: 20, borderRadius: '50%',
        background: 'white',
        transition: 'left .2s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }}></span>
    </button>
  );

  return (
    <>
      <AppNav onHome={() => goto('hub')} onProfile={() => goto('hub')} crumb="Profile" />
      <main className="page" style={{ maxWidth: 900 }}>
        <header className="page-head" style={{ marginBottom: 56 }}>
          <div>
            <div className="page-eyebrow" style={{ alignItems: 'flex-start', flexDirection: 'column', gap: 14 }}>
              <BackBtn label="Back to hub" onClick={() => goto('hub')} />
              <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ width: 28, height: 1, background: 'currentColor', opacity: 0.5, display: 'inline-block' }}></span>
                Profile &amp; Settings
              </span>
            </div>
            <h1 className="page-title" style={{ fontSize: 'clamp(48px,5.5vw,84px)' }}>
              Your <em>profile.</em>
            </h1>
          </div>
          {/* Avatar */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 88, height: 88, borderRadius: '50%',
              background: 'var(--ink)', color: 'var(--paper)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--serif)', fontSize: 44, fontStyle: 'italic',
            }}>{name[0]}</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--muted)' }}>
              {u.streak}-day streak
            </div>
          </div>
        </header>

        {/* Account */}
        <Section title="Account">
          <Field label="Full name">
            <input style={textInputStyle} value={name} onChange={e => setName(e.target.value)}
              onFocus={e => e.target.style.borderColor = 'var(--ink)'}
              onBlur={e => e.target.style.borderColor = 'var(--line)'}
            />
          </Field>
          <Field label="Email">
            <input style={textInputStyle} value={email} type="email" onChange={e => setEmail(e.target.value)}
              onFocus={e => e.target.style.borderColor = 'var(--ink)'}
              onBlur={e => e.target.style.borderColor = 'var(--line)'}
            />
          </Field>
          <Field label="Password" hint="Last changed 3 months ago">
            <button style={{
              padding: '10px 20px', border: '1px solid var(--line)', borderRadius: 8,
              fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase',
              color: 'var(--muted)', cursor: 'pointer', transition: 'border-color .2s, color .2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--ink)'; e.currentTarget.style.color = 'var(--ink)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.color = 'var(--muted)'; }}
            >Change password</button>
          </Field>
        </Section>

        {/* Training */}
        <Section title="Training Preferences">
          <Field label="Primary goal" hint="Shapes how the coach programs your sessions.">
            {chipSet(goal, setGoal, [
              { value: 'strength', label: 'Strength' },
              { value: 'hypertrophy', label: 'Hypertrophy' },
              { value: 'endurance', label: 'Endurance' },
              { value: 'weight-loss', label: 'Weight loss' },
            ])}
          </Field>
          <Field label="Units">
            {chipSet(unit, setUnit, [
              { value: 'imperial', label: 'Imperial (lb)' },
              { value: 'metric', label: 'Metric (kg)' },
            ])}
          </Field>
          <Field label="Default rest timer" hint="Applied when you start a new set.">
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              <input
                type="range" min={30} max={300} step={15}
                value={restDef} onChange={e => setRestDef(Number(e.target.value))}
                style={{ width: 200, accentColor: 'var(--accent)' }}
              />
              <span style={{ fontFamily: 'var(--serif)', fontSize: 32, fontStyle: 'italic', lineHeight: 1, width: 64 }}>
                {restDef}<span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--muted)', marginLeft: 4, fontStyle: 'normal', letterSpacing: '0.14em' }}>s</span>
              </span>
            </div>
          </Field>
        </Section>

        {/* Notifications */}
        <Section title="Notifications">
          {[
            { label: 'Weekly summary', hint: 'Volume, streaks and highlights every Monday.', val: notifW, set: setNotifW },
            { label: 'New personal record', hint: 'A push notification when you beat a PR.', val: notifPR, set: setNotifPR },
            { label: 'Coach tips', hint: 'Occasional form and programming nudges.', val: notifTips, set: setNotifTips },
          ].map(n => (
            <Field key={n.label} label={n.label} hint={n.hint}>
              <Toggle val={n.val} setVal={n.set} />
            </Field>
          ))}
        </Section>

        {/* Danger zone */}
        <Section title="Account Actions">
          <Field label="Export data" hint="Download your full session history as CSV.">
            <button style={{
              padding: '10px 20px', border: '1px solid var(--line)', borderRadius: 8,
              fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase',
              color: 'var(--muted)', cursor: 'pointer', transition: 'border-color .2s, color .2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--ink)'; e.currentTarget.style.color = 'var(--ink)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.color = 'var(--muted)'; }}
            >Export CSV</button>
          </Field>
          <Field label="Delete account" hint="Permanently removes all data. This cannot be undone.">
            <button style={{
              padding: '10px 20px', border: '1px solid #e8a0a0', borderRadius: 8,
              fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase',
              color: '#b94040', cursor: 'pointer', transition: 'all .2s',
              background: 'transparent',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = '#b94040'; e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = '#b94040'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#b94040'; e.currentTarget.style.borderColor = '#e8a0a0'; }}
            >Delete account</button>
          </Field>
        </Section>

        {/* Save bar */}
        <div style={{
          position: 'sticky', bottom: 28,
          display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 18,
          padding: '16px 24px',
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(12px)',
          borderRadius: 999,
          border: '1px solid var(--line)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          maxWidth: 420, marginLeft: 'auto',
        }}>
          {saved && (
            <span style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--accent)' }}>
              ✓ Saved
            </span>
          )}
          <button onClick={save} style={{
            display: 'inline-flex', alignItems: 'center', gap: 12,
            padding: '13px 24px',
            background: 'var(--ink)', color: 'var(--paper)',
            borderRadius: 999, fontSize: 14,
            transition: 'transform .15s',
          }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateX(2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'none'}
          >
            Save changes
            <span style={{
              width: 22, height: 22, borderRadius: '50%',
              background: 'var(--paper)', color: 'var(--ink)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            }}><Arrow /></span>
          </button>
        </div>
      </main>
    </>
  );
}

Object.assign(window, { Hub, DataView, WorkoutPicker, Session, AppNav, Arrow, BackBtn, ProfileSettings });
