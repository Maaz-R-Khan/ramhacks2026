import { useNavigate } from 'react-router-dom'
import { exerciseGroups } from '../data/exercises'
import './Exercises.css'

export default function Exercises() {
  const navigate = useNavigate()

  return (
    <div className="exercises-page">
      <h1>Exercises</h1>
      {exerciseGroups.map((group) => (
        <section key={group.group} className="exercise-group">
          <h2>{group.group}</h2>
          <div className="exercise-cards">
            {group.exercises.map((exercise) => (
              <button
                key={exercise.id}
                className="exercise-card"
                onClick={() => navigate(`/exercises/${exercise.id}`)}
              >
                <span className="exercise-name">{exercise.name}</span>
                <span className={`difficulty difficulty--${exercise.difficulty.toLowerCase()}`}>
                  {exercise.difficulty}
                </span>
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
