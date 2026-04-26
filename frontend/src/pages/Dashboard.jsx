import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../firebase'
import './dashboard/dashboard.css'
import Hub from './dashboard/Hub'
import DataView from './dashboard/DataView'
import WorkoutPicker from './dashboard/WorkoutPicker'
import Session from './dashboard/Session'
import ProfileSettings from './dashboard/ProfileSettings'

export default function Dashboard() {
  const navigate = useNavigate()
  const location = useLocation()
  const [user, setUser] = useState(() => auth.currentUser)
  const [authReady, setAuthReady] = useState(() => Boolean(auth.currentUser))

  useEffect(() => {
    document.body.classList.add('dashboard-page')
    return () => document.body.classList.remove('dashboard-page')
  }, [])

  useEffect(() => {
    return onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser)
      setAuthReady(true)
    })
  }, [])

  const goto = (next, payload) => {
    const routes = {
      hub: '/dashboard',
      workout: '/dashboard/train',
      data: '/dashboard/data',
      profile: '/dashboard/profile',
    }

    const target = next === 'session' && payload
      ? `/dashboard/train/${payload}`
      : routes[next] || '/dashboard'

    navigate(target)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  const view = (() => {
    if (location.pathname === '/dashboard/train') return 'workout'
    if (location.pathname.startsWith('/dashboard/train/')) return 'session'
    if (location.pathname === '/dashboard/data') return 'data'
    if (location.pathname === '/dashboard/profile') return 'profile'
    return 'hub'
  })()

  if (!authReady) {
    return (
      <div className="formline-app app-shell" data-view={view}>
        <main className="page">
          <div className="history-state">Loading your training history...</div>
        </main>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return (
    <div className="formline-app app-shell" data-view={view}>
      <Routes>
        <Route index element={<Hub goto={goto} />} />
        <Route path="train" element={<WorkoutPicker goto={goto} />} />
        <Route path="train/:exerciseId" element={<Session goto={goto} user={user} />} />
        <Route path="data" element={<DataView goto={goto} user={user} />} />
        <Route path="profile" element={<ProfileSettings goto={goto} />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  )
}
