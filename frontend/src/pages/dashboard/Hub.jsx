import { AppNav, Arrow } from './AppNav'
import { USER, SETS_PER_WEEK, BODYWEIGHT } from './data'

export default function Hub({ goto }) {
  const u = USER
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
            Train<br />
            <em>now.</em>
          </h1>
          <p className="door-sub">
            Five lifts ready. Pick what your body asks for, or follow today's plan. The coach watches, the data follows.
          </p>
          <div className="door-foot">
            <div className="door-cta">
              Open the gym
              <span className="arr">
                <Arrow />
              </span>
            </div>
            <div className="door-meta">
              <strong>
                {u.streak}
                <em style={{ fontSize: 18 }}>d</em>
              </strong>
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
            Read<br />
            the <em>map.</em>
          </h1>
          <p className="door-sub">
            Eleven weeks of work, charted. Muscle balance, set volume, PRs, bodyweight — everything you've moved.
          </p>
          <div className="door-foot">
            <div className="door-cta">
              See the data
              <span className="arr">
                <Arrow />
              </span>
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
          <span className="val">
            {SETS_PER_WEEK[SETS_PER_WEEK.length - 1]}
            <em>sets</em>
          </span>
          <span className="delta">↑ +6 vs last</span>
        </div>
        <div className="cell">
          <span className="lbl">Top muscle group</span>
          <span className="val" style={{ fontStyle: 'italic' }}>
            Legs
          </span>
          <span className="delta" style={{ color: 'var(--muted)' }}>
            78 sets · 4 wk
          </span>
        </div>
        <div className="cell">
          <span className="lbl">Latest PR</span>
          <span className="val">
            245<em>lb</em>
          </span>
          <span className="delta" style={{ color: 'var(--muted)' }}>
            back squat · Apr 18
          </span>
        </div>
        <div className="cell">
          <span className="lbl">Bodyweight</span>
          <span className="val">
            {BODYWEIGHT[BODYWEIGHT.length - 1]}
            <em>lb</em>
          </span>
          <span className="delta">↑ +2.7 / 11 wk</span>
        </div>
      </section>
    </>
  )
}
