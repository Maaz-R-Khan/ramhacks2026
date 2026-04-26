import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { PoseLandmarker, FilesetResolver, DrawingUtils } from '@mediapipe/tasks-vision'
import { getExerciseById } from '../data/exercises'
import './Session.css'

const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task'

const LM = {
  L_SHOULDER: 11, R_SHOULDER: 12,
  L_ELBOW: 13,    R_ELBOW: 14,
  L_WRIST: 15,    R_WRIST: 16,
  L_HIP: 23,      R_HIP: 24,
  L_KNEE: 25,     R_KNEE: 26,
  L_ANKLE: 27,    R_ANKLE: 28,
}

function calcAngle(a, b, c) {
  const rad = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x)
  let deg = Math.abs(rad * 180 / Math.PI)
  if (deg > 180) deg = 360 - deg
  return Math.round(deg)
}

function extractAngles(lm) {
  return {
    left_elbow:  calcAngle(lm[LM.L_SHOULDER], lm[LM.L_ELBOW],  lm[LM.L_WRIST]),
    right_elbow: calcAngle(lm[LM.R_SHOULDER], lm[LM.R_ELBOW],  lm[LM.R_WRIST]),
    left_knee:   calcAngle(lm[LM.L_HIP],      lm[LM.L_KNEE],   lm[LM.L_ANKLE]),
    right_knee:  calcAngle(lm[LM.R_HIP],      lm[LM.R_KNEE],   lm[LM.R_ANKLE]),
    left_hip:    calcAngle(lm[LM.L_SHOULDER], lm[LM.L_HIP],    lm[LM.L_KNEE]),
    right_hip:   calcAngle(lm[LM.R_SHOULDER], lm[LM.R_HIP],    lm[LM.R_KNEE]),
  }
}

export default function Session() {
  const { id } = useParams()
  const navigate = useNavigate()
  const exercise = getExerciseById(id)

  const videoRef      = useRef(null)
  const canvasRef     = useRef(null)
  const streamRef     = useRef(null)
  const landmarkerRef = useRef(null)
  const rafRef        = useRef(null)
  const repStateRef   = useRef({ phase: 'idle' })
  const repsRef       = useRef(0)
  const lastSendRef   = useRef(0)
  const wsRef         = useRef(null)

  const [reps, setReps]               = useState(0)
  const [feedback, setFeedback]       = useState(null)
  const [modelReady, setModelReady]   = useState(false)
  const [cameraError, setCameraError] = useState(null)

  // Load MediaPipe model
  useEffect(() => {
    async function load() {
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      )
      landmarkerRef.current = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: MODEL_URL, delegate: 'GPU' },
        runningMode: 'VIDEO',
        numPoses: 1,
      })
      setModelReady(true)
    }
    load()
  }, [])

  // Start camera + detection loop once model is ready
  useEffect(() => {
    if (!modelReady) return

    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        streamRef.current = stream
        const video = videoRef.current
        video.srcObject = stream
        video.onloadeddata = startLoop
      })
      .catch(() => setCameraError('Camera access denied or unavailable.'))

    const ws = new WebSocket('ws://localhost:8000/ws')
    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data)
      if (msg.type === 'feedback') {
        setFeedback(msg.message)
        setTimeout(() => setFeedback(null), 4000)
      }
    }
    wsRef.current = ws

    return () => {
      cancelAnimationFrame(rafRef.current)
      streamRef.current?.getTracks().forEach((t) => t.stop())
      ws.close()
    }
  }, [modelReady])

  function startLoop() {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    const ctx = canvas.getContext('2d')
    const drawingUtils = new DrawingUtils(ctx)
    let lastTime = -1

    function loop() {
      rafRef.current = requestAnimationFrame(loop)
      if (video.currentTime === lastTime) return
      lastTime = video.currentTime

      canvas.width  = video.videoWidth
      canvas.height = video.videoHeight
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const result = landmarkerRef.current.detectForVideo(video, performance.now())
      if (!result.landmarks.length) return

      const lm = result.landmarks[0]
      drawingUtils.drawLandmarks(lm, { radius: 4, color: '#00ff88', fillColor: '#00ff88' })
      drawingUtils.drawConnectors(lm, PoseLandmarker.POSE_CONNECTIONS, { color: '#ffffff', lineWidth: 2 })

      const angles = extractAngles(lm)
      updateRepState(angles)
      throttleSend(angles)
    }

    loop()
  }

  function updateRepState(angles) {
    const rd = exercise?.repDetection
    if (!rd) return

    const vals = rd.joints.map((j) => angles[j]).filter(Boolean)
    if (!vals.length) return
    const current = vals.reduce((a, b) => a + b, 0) / vals.length

    if (repStateRef.current.phase === 'idle' && current < rd.inThreshold) {
      repStateRef.current.phase = 'active'
    } else if (repStateRef.current.phase === 'active' && current > rd.outThreshold) {
      repStateRef.current.phase = 'idle'
      repsRef.current += 1
      setReps(repsRef.current)
      sendWs({ type: 'rep', exercise_id: id, rep: repsRef.current, angles })
    }
  }

  function throttleSend(angles) {
    const now = Date.now()
    if (now - lastSendRef.current < 500) return
    lastSendRef.current = now
    sendWs({ type: 'frame', exercise_id: id, rep: repsRef.current, angles })
  }

  function sendWs(data) {
    const ws = wsRef.current
    if (ws?.readyState === WebSocket.OPEN) ws.send(JSON.stringify(data))
  }

  function handleFinish() {
    cancelAnimationFrame(rafRef.current)
    streamRef.current?.getTracks().forEach((t) => t.stop())
    wsRef.current?.close()
    navigate(`/exercises/${id}`)
  }

  if (!exercise) {
    return (
      <div className="session-page">
        <p>Exercise not found.</p>
        <button onClick={() => navigate('/exercises')}>Back</button>
      </div>
    )
  }

  return (
    <div className="session-page">
      <div className="session-header">
        <span className="session-exercise-name">{exercise.name}</span>
        <button className="finish-btn" onClick={handleFinish}>Finish</button>
      </div>

      <div className="camera-container">
        {cameraError ? (
          <div className="camera-error">{cameraError}</div>
        ) : (
          <>
            <video ref={videoRef} autoPlay playsInline muted className="camera-feed" />
            <canvas ref={canvasRef} className="pose-canvas" />
          </>
        )}

        {!modelReady && !cameraError && (
          <div className="loading-overlay">Loading model...</div>
        )}

        <div className="rep-overlay">
          <span className="rep-count">{reps}</span>
          <span className="rep-label">reps</span>
        </div>

        {feedback && (
          <div className="feedback-banner">{feedback}</div>
        )}
      </div>
    </div>
  )
}
