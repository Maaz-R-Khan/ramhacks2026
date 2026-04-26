import { useState } from 'react'
import { AppNav, BackBtn, Arrow } from './AppNav'
import { USER } from './data'

const Section = ({ title, children }) => (
  <div style={{ marginBottom: 48 }}>
    <div
      style={{
        fontFamily: 'var(--mono)',
        fontSize: 11,
        letterSpacing: '0.22em',
        textTransform: 'uppercase',
        color: 'var(--muted)',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        marginBottom: 24,
      }}
    >
      <span style={{ width: 28, height: 1, background: 'currentColor', opacity: 0.5, display: 'inline-block' }}></span>
      {title}
    </div>
    <div style={{ display: 'grid', gap: 14 }}>{children}</div>
  </div>
)

const Field = ({ label, children, hint }) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: '220px 1fr',
      gap: 24,
      alignItems: 'start',
      padding: '20px 0',
      borderBottom: '1px solid var(--line)',
    }}
  >
    <div>
      <div style={{ fontSize: 14, fontWeight: 500, marginBottom: hint ? 4 : 0 }}>{label}</div>
      {hint && <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>{hint}</div>}
    </div>
    <div>{children}</div>
  </div>
)

const textInputStyle = {
  width: '100%',
  maxWidth: 360,
  background: 'var(--paper-3)',
  border: '1px solid var(--line)',
  borderRadius: 8,
  padding: '12px 16px',
  fontSize: 14,
  outline: 'none',
  transition: 'border-color .2s',
}

function ChipSet({ value, onChange, options }) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          style={{
            padding: '9px 18px',
            borderRadius: 999,
            border: `1px solid ${value === o.value ? 'var(--ink)' : 'var(--line)'}`,
            background: value === o.value ? 'var(--ink)' : 'transparent',
            color: value === o.value ? 'var(--paper)' : 'var(--muted)',
            fontFamily: 'var(--mono)',
            fontSize: 11,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            transition: 'all .15s',
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

function Toggle({ val, setVal }) {
  return (
    <button
      onClick={() => setVal((v) => !v)}
      style={{
        width: 44,
        height: 26,
        borderRadius: 999,
        background: val ? 'var(--accent)' : 'var(--line)',
        border: 'none',
        cursor: 'pointer',
        position: 'relative',
        transition: 'background .2s',
        flexShrink: 0,
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: 3,
          left: val ? 21 : 3,
          width: 20,
          height: 20,
          borderRadius: '50%',
          background: 'white',
          transition: 'left .2s',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        }}
      ></span>
    </button>
  )
}

export default function ProfileSettings({ goto }) {
  const u = USER

  const [name, setName] = useState(u.name)
  const [email, setEmail] = useState('alex@example.com')
  const [unit, setUnit] = useState('imperial')
  const [goal, setGoal] = useState('strength')
  const [restDef, setRestDef] = useState(90)
  const [notifW, setNotifW] = useState(true)
  const [notifPR, setNotifPR] = useState(true)
  const [notifTips, setNotifTips] = useState(false)
  const [saved, setSaved] = useState(false)

  const save = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2200)
  }

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
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 88,
                height: 88,
                borderRadius: '50%',
                background: 'var(--ink)',
                color: 'var(--paper)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--serif)',
                fontSize: 44,
                fontStyle: 'italic',
              }}
            >
              {name[0]}
            </div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--muted)' }}>
              {u.streak}-day streak
            </div>
          </div>
        </header>

        <Section title="Account">
          <Field label="Full name">
            <input
              style={textInputStyle}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onFocus={(e) => (e.target.style.borderColor = 'var(--ink)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--line)')}
            />
          </Field>
          <Field label="Email">
            <input
              style={textInputStyle}
              value={email}
              type="email"
              onChange={(e) => setEmail(e.target.value)}
              onFocus={(e) => (e.target.style.borderColor = 'var(--ink)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--line)')}
            />
          </Field>
          <Field label="Password" hint="Last changed 3 months ago">
            <button
              style={{
                padding: '10px 20px',
                border: '1px solid var(--line)',
                borderRadius: 8,
                fontFamily: 'var(--mono)',
                fontSize: 11,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: 'var(--muted)',
                cursor: 'pointer',
                transition: 'border-color .2s, color .2s',
                background: 'transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--ink)'
                e.currentTarget.style.color = 'var(--ink)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--line)'
                e.currentTarget.style.color = 'var(--muted)'
              }}
            >
              Change password
            </button>
          </Field>
        </Section>

        <Section title="Training Preferences">
          <Field label="Primary goal" hint="Shapes how the coach programs your sessions.">
            <ChipSet
              value={goal}
              onChange={setGoal}
              options={[
                { value: 'strength', label: 'Strength' },
                { value: 'hypertrophy', label: 'Hypertrophy' },
                { value: 'endurance', label: 'Endurance' },
                { value: 'weight-loss', label: 'Weight loss' },
              ]}
            />
          </Field>
          <Field label="Units">
            <ChipSet
              value={unit}
              onChange={setUnit}
              options={[
                { value: 'imperial', label: 'Imperial (lb)' },
                { value: 'metric', label: 'Metric (kg)' },
              ]}
            />
          </Field>
          <Field label="Default rest timer" hint="Applied when you start a new set.">
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              <input
                type="range"
                min={30}
                max={300}
                step={15}
                value={restDef}
                onChange={(e) => setRestDef(Number(e.target.value))}
                style={{ width: 200, accentColor: 'var(--accent)' }}
              />
              <span style={{ fontFamily: 'var(--serif)', fontSize: 32, fontStyle: 'italic', lineHeight: 1, width: 64 }}>
                {restDef}
                <span
                  style={{
                    fontFamily: 'var(--mono)',
                    fontSize: 12,
                    color: 'var(--muted)',
                    marginLeft: 4,
                    fontStyle: 'normal',
                    letterSpacing: '0.14em',
                  }}
                >
                  s
                </span>
              </span>
            </div>
          </Field>
        </Section>

        <Section title="Notifications">
          {[
            { label: 'Weekly summary', hint: 'Volume, streaks and highlights every Monday.', val: notifW, set: setNotifW },
            { label: 'New personal record', hint: 'A push notification when you beat a PR.', val: notifPR, set: setNotifPR },
            { label: 'Coach tips', hint: 'Occasional form and programming nudges.', val: notifTips, set: setNotifTips },
          ].map((n) => (
            <Field key={n.label} label={n.label} hint={n.hint}>
              <Toggle val={n.val} setVal={n.set} />
            </Field>
          ))}
        </Section>

        <Section title="Account Actions">
          <Field label="Export data" hint="Download your full session history as CSV.">
            <button
              style={{
                padding: '10px 20px',
                border: '1px solid var(--line)',
                borderRadius: 8,
                fontFamily: 'var(--mono)',
                fontSize: 11,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: 'var(--muted)',
                cursor: 'pointer',
                transition: 'border-color .2s, color .2s',
                background: 'transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--ink)'
                e.currentTarget.style.color = 'var(--ink)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--line)'
                e.currentTarget.style.color = 'var(--muted)'
              }}
            >
              Export CSV
            </button>
          </Field>
          <Field label="Delete account" hint="Permanently removes all data. This cannot be undone.">
            <button
              style={{
                padding: '10px 20px',
                border: '1px solid #e8a0a0',
                borderRadius: 8,
                fontFamily: 'var(--mono)',
                fontSize: 11,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: '#b94040',
                cursor: 'pointer',
                transition: 'all .2s',
                background: 'transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#b94040'
                e.currentTarget.style.color = 'white'
                e.currentTarget.style.borderColor = '#b94040'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = '#b94040'
                e.currentTarget.style.borderColor = '#e8a0a0'
              }}
            >
              Delete account
            </button>
          </Field>
        </Section>

        <div
          style={{
            position: 'sticky',
            bottom: 28,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 10,
            padding: '16px 24px',
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(12px)',
            borderRadius: 999,
            border: '1px solid var(--line)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
            maxWidth: 420,
            margin: '0 auto',
          }}
        >
          {saved && (
            <span style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--accent)' }}>
              ✓ Saved
            </span>
          )}
          <button
            onClick={save}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 12,
              padding: '13px 24px',
              background: 'var(--ink)',
              color: 'var(--paper)',
              borderRadius: 999,
              fontSize: 14,
              transition: 'transform .15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateX(2px)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
          >
            Save changes
            <span
              style={{
                width: 22,
                height: 22,
                borderRadius: '50%',
                background: 'var(--paper)',
                color: 'var(--ink)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Arrow />
            </span>
          </button>
        </div>
      </main>
    </>
  )
}
