import { useEffect, useState } from 'react'
import { USER } from './data'

export function Arrow() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="M13 5l7 7-7 7" />
    </svg>
  )
}

export function BackBtn({ label, onClick, dark = false }) {
  const [hover, setHover] = useState(false)
  const style = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 10,
    fontFamily: 'var(--mono)',
    fontSize: 11,
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    padding: '8px 16px',
    border: `1px solid ${dark ? 'rgba(255,255,255,0.2)' : 'var(--line)'}`,
    borderRadius: 999,
    color: hover ? (dark ? 'var(--paper)' : 'var(--ink)') : dark ? 'rgba(255,255,255,0.75)' : 'var(--muted)',
    background: hover ? (dark ? 'rgba(255,255,255,0.06)' : 'var(--paper-2)') : 'transparent',
    cursor: 'pointer',
    transition: 'background .2s, color .2s',
  }
  return (
    <button style={style} onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      ← {label}
    </button>
  )
}

export function AppNav({ onHome, onProfile, dark = false, crumb }) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  const cls = ['app-nav', dark ? 'dark' : '', scrolled ? 'scrolled' : ''].filter(Boolean).join(' ')
  return (
    <nav className={cls}>
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault()
          onHome()
        }}
        className="brand"
      >
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
          {USER.streak}-DAY STREAK
        </span>
        <button className="avatar" onClick={onProfile} title="Profile & Settings" style={{ cursor: 'pointer' }}>
          {USER.name[0]}
        </button>
      </div>
    </nav>
  )
}
