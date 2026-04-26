import { useEffect, useState } from 'react'
import './dashboard/dashboard.css'
import Hub from './dashboard/Hub'
import DataView from './dashboard/DataView'
import WorkoutPicker from './dashboard/WorkoutPicker'
import Session from './dashboard/Session'
import ProfileSettings from './dashboard/ProfileSettings'

export default function Dashboard() {
  const [view, setView] = useState('hub')
  const [exerciseId, setExerciseId] = useState('squat')

  useEffect(() => {
    document.body.classList.add('dashboard-page')
    return () => document.body.classList.remove('dashboard-page')
  }, [])

  const goto = (next, payload) => {
    if (next === 'session' && payload) setExerciseId(payload)
    setView(next)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  let screen = null
  if (view === 'hub') screen = <Hub goto={goto} />
  else if (view === 'data') screen = <DataView goto={goto} />
  else if (view === 'workout') screen = <WorkoutPicker goto={goto} />
  else if (view === 'session') screen = <Session goto={goto} exerciseId={exerciseId} />
  else if (view === 'profile') screen = <ProfileSettings goto={goto} />

  return (
    <div className="formline-app app-shell" data-view={view}>
      {screen}
    </div>
  )
}
