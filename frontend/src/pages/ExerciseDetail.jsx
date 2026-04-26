import { useParams, useNavigate } from 'react-router-dom'
import { getExerciseById } from '../data/exercises'
import './ExerciseDetail.css'

export default function ExerciseDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const exercise = getExerciseById(id)

  if (!exercise) {
    return (
      <div className="detail-page">
        <p>Exercise not found.</p>
        <button onClick={() => navigate('/exercises')}>Back</button>
      </div>
    )
  }

  return (
    <div className="detail-page">
      <button className="back-btn" onClick={() => navigate('/exercises')}>
        Back to Exercises
      </button>

      <div className="detail-header">
        <span className="detail-group">{exercise.group}</span>
        <h1>{exercise.name}</h1>
        <span className={`difficulty difficulty--${exercise.difficulty.toLowerCase()}`}>
          {exercise.difficulty}
        </span>
      </div>

      <section className="detail-section">
        <h2>How to do it</h2>
        <ol className="steps-list">
          {exercise.steps.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </section>

      <section className="detail-section">
        <h2>Key joint angles</h2>
        <div className="angles-grid">
          {exercise.keyAngles.map((a) => (
            <div key={a.joint} className="angle-card">
              <span className="angle-joint">{a.joint}</span>
              <span className="angle-target">{a.target}</span>
              <span className="angle-note">{a.note}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="detail-section">
        <h2>Common mistakes</h2>
        <ul className="mistakes-list">
          {exercise.commonMistakes.map((m, i) => (
            <li key={i}>{m}</li>
          ))}
        </ul>
      </section>

      <button className="start-btn" onClick={() => navigate(`/session/${exercise.id}`)}>
        Start Exercise
        <span className="start-btn-arrow">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" /><path d="M13 5l7 7-7 7" />
          </svg>
        </span>
      </button>
    </div>
  )
}
