import { Routes, Route } from 'react-router-dom'
import './App.css'
import Home from './pages/Home'
import About from './pages/About'
import Login from './pages/Login'
import Exercises from './pages/Exercises'
import ExerciseDetail from './pages/ExerciseDetail'
import Session from './pages/Session'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/login" element={<Login />} />
      <Route path="/exercises" element={<Exercises />} />
      <Route path="/exercises/:id" element={<ExerciseDetail />} />
      <Route path="/session/:id" element={<Session />} />
    </Routes>
  )
}

export default App
