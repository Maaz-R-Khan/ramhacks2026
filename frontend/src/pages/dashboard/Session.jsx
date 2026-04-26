import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { PoseLandmarker, FilesetResolver, DrawingUtils } from '@mediapipe/tasks-vision'
import { AppNav, Arrow } from './AppNav'
import { EXERCISES } from './data'
import { createLiftSessionId, saveSetLog, updateSetLogFields } from './trainingData'

const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task'
const WASM_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
const WS_URL = 'ws://localhost:8000/ws'

const LM = {
  L_SHOULDER: 11, R_SHOULDER: 12,
  L_ELBOW: 13, R_ELBOW: 14,
  L_WRIST: 15, R_WRIST: 16,
  L_HIP: 23, R_HIP: 24,
  L_KNEE: 25, R_KNEE: 26,
  L_ANKLE: 27, R_ANKLE: 28,
}

function calcAngle(a, b, c) {
  if (!a || !b || !c) return null

  const rad = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x)
  let deg = Math.abs((rad * 180) / Math.PI)
  if (deg > 180) deg = 360 - deg
  return Math.round(deg)
}

function extractAngles(lm) {
  return {
    left_elbow: calcAngle(lm[LM.L_SHOULDER], lm[LM.L_ELBOW], lm[LM.L_WRIST]),
    right_elbow: calcAngle(lm[LM.R_SHOULDER], lm[LM.R_ELBOW], lm[LM.R_WRIST]),
    left_knee: calcAngle(lm[LM.L_HIP], lm[LM.L_KNEE], lm[LM.L_ANKLE]),
    right_knee: calcAngle(lm[LM.R_HIP], lm[LM.R_KNEE], lm[LM.R_ANKLE]),
    left_hip: calcAngle(lm[LM.L_SHOULDER], lm[LM.L_HIP], lm[LM.L_KNEE]),
    right_hip: calcAngle(lm[LM.R_SHOULDER], lm[LM.R_HIP], lm[LM.R_KNEE]),
  }
}

function syncErrorMessage(error, fallback) {
  const code = error?.code
  if (code === 'permission-denied') {
    return `${fallback} Firestore denied access; deploy the latest firestore.rules and confirm this user is signed in.`
  }
  if (code === 'unauthenticated') {
    return `${fallback} Firebase says the request is unauthenticated; sign out and sign back in.`
  }
  if (code === 'unavailable') {
    return `${fallback} Firestore is unreachable; check browser blockers or network access to firestore.googleapis.com.`
  }
  if (code === 'invalid-argument') {
    return `${fallback} Firestore rejected the set data; check the console for the rejected payload.`
  }

  return code ? `${fallback} Firebase error: ${code}.` : fallback
}

export default function Session({ goto, exerciseId, user }) {
  const params = useParams()
  const activeExerciseId = exerciseId || params.exerciseId
  const ex = EXERCISES.find((e) => e.id === activeExerciseId) || EXERCISES[0]
  const totalSets = ex.sets
  const [setData, setSetData] = useState(
    Array.from({ length: totalSets }, () => ({ weight: '', reps: '', done: false })),
  )
  const [seconds, setSeconds] = useState(90)
  const [running, setRunning] = useState(false)
  const [modelReady, setModelReady] = useState(false)
  const [modelError, setModelError] = useState(null)
  const [cameraReady, setCameraReady] = useState(false)
  const [cameraError, setCameraError] = useState(null)
  const [reps, setReps] = useState(0)
  const [trackingActive, setTrackingActive] = useState(true)
  const [feedback, setFeedback] = useState(null)
  const [syncError, setSyncError] = useState(null)

  const intervalRef = useRef(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const landmarkerRef = useRef(null)
  const rafRef = useRef(null)
  const repStateRef = useRef({ phase: 'idle' })
  const repsRef = useRef(0)
  const lastSendRef = useRef(0)
  const wsRef = useRef(null)
  const feedbackTimerRef = useRef(null)
  const liftSessionIdRef = useRef(createLiftSessionId(ex.id))
  const setLogIdsRef = useRef({})
  const stopInFlightRef = useRef(false)

  const allEx = EXERCISES
  const idx = allEx.findIndex((e) => e.id === ex.id)
  const lineup = allEx

  const stopPoseSession = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }

    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null

    if (videoRef.current) {
      videoRef.current.onloadeddata = null
      videoRef.current.srcObject = null
    }

    wsRef.current?.close()
    wsRef.current = null
  }, [])

  const sendWs = useCallback((data) => {
    const ws = wsRef.current
    if (ws?.readyState === WebSocket.OPEN) ws.send(JSON.stringify(data))
  }, [])

  const updateRepState = useCallback((angles) => {
    const rd = ex.repDetection
    if (!rd) return

    const vals = rd.joints.map((joint) => angles[joint]).filter((value) => typeof value === 'number')
    if (!vals.length) return

    const current = vals.reduce((sum, value) => sum + value, 0) / vals.length
    if (repStateRef.current.phase === 'idle' && current < rd.inThreshold) {
      repStateRef.current.phase = 'active'
    } else if (repStateRef.current.phase === 'active' && current > rd.outThreshold) {
      repStateRef.current.phase = 'idle'
      repsRef.current += 1
      setReps(repsRef.current)
      sendWs({ type: 'rep', exercise_id: ex.id, rep: repsRef.current, angles })
    }
  }, [ex.id, ex.repDetection, sendWs])

  const throttleSend = useCallback((angles) => {
    const now = Date.now()
    if (now - lastSendRef.current < 500) return
    lastSendRef.current = now
    sendWs({ type: 'frame', exercise_id: ex.id, rep: repsRef.current, angles })
  }, [ex.id, sendWs])

  const startLoop = useCallback(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    const landmarker = landmarkerRef.current
    if (!video || !canvas || !landmarker) return

    if (rafRef.current) cancelAnimationFrame(rafRef.current)

    const ctx = canvas.getContext('2d')
    const drawingUtils = new DrawingUtils(ctx)
    let lastTime = -1

    function loop() {
      rafRef.current = requestAnimationFrame(loop)
      if (video.currentTime === lastTime || !video.videoWidth || !video.videoHeight) return
      lastTime = video.currentTime

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const result = landmarker.detectForVideo(video, performance.now())
      if (!result.landmarks.length) return

      const lm = result.landmarks[0]
      drawingUtils.drawLandmarks(lm, { radius: 4, color: '#00ff88', fillColor: '#00ff88' })
      drawingUtils.drawConnectors(lm, PoseLandmarker.POSE_CONNECTIONS, { color: '#ffffff', lineWidth: 2 })

      const angles = extractAngles(lm)
      updateRepState(angles)
      throttleSend(angles)
    }

    loop()
  }, [throttleSend, updateRepState])

  useEffect(() => {
    setSetData(Array.from({ length: totalSets }, () => ({ weight: '', reps: '', done: false })))
    setSeconds(90)
    setRunning(false)
    setCameraReady(false)
    setCameraError(null)
    setTrackingActive(true)
    repsRef.current = 0
    repStateRef.current = { phase: 'idle' }
    lastSendRef.current = 0
    liftSessionIdRef.current = createLiftSessionId(ex.id)
    setLogIdsRef.current = {}
    stopInFlightRef.current = false
    setReps(0)
    setSyncError(null)
    clearTimeout(feedbackTimerRef.current)
    setFeedback(null)
  }, [ex.id, totalSets])

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s <= 1) {
            setRunning(false)
            return 0
          }
          return s - 1
        })
      }, 1000)
    }
    return () => clearInterval(intervalRef.current)
  }, [running])

  useEffect(() => {
    let cancelled = false

    async function loadModel() {
      try {
        const vision = await FilesetResolver.forVisionTasks(WASM_URL)
        const landmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: { modelAssetPath: MODEL_URL, delegate: 'GPU' },
          runningMode: 'VIDEO',
          numPoses: 1,
        })

        if (cancelled) {
          landmarker.close?.()
          return
        }

        landmarkerRef.current = landmarker
        setModelReady(true)
      } catch {
        if (!cancelled) setModelError('Pose model could not load. Check your connection and reload.')
      }
    }

    loadModel()

    return () => {
      cancelled = true
      stopPoseSession()
      landmarkerRef.current?.close?.()
      landmarkerRef.current = null
      clearTimeout(feedbackTimerRef.current)
    }
  }, [stopPoseSession])

  useEffect(() => {
    if (!modelReady || !trackingActive) return undefined

    let cancelled = false
    setCameraReady(false)
    setCameraError(null)

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }

        streamRef.current = stream
        const video = videoRef.current
        if (!video) return

        video.srcObject = stream
        video.onloadeddata = () => {
          if (cancelled) return
          setCameraReady(true)
          video.play().catch(() => undefined)
          startLoop()
        }
      } catch {
        if (!cancelled) setCameraError('Camera access denied or unavailable.')
      }
    }

    try {
      const ws = new WebSocket(WS_URL)
      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data)
          if (msg.type === 'feedback') {
            setFeedback(msg.message)
            clearTimeout(feedbackTimerRef.current)
            feedbackTimerRef.current = setTimeout(() => setFeedback(null), 4000)
          }
        } catch {
          // Ignore malformed feedback packets without interrupting camera tracking.
        }
      }
      ws.onerror = () => undefined
      wsRef.current = ws
    } catch {
      wsRef.current = null
    }

    startCamera()

    return () => {
      cancelled = true
      stopPoseSession()
    }
  }, [modelReady, startLoop, stopPoseSession, trackingActive])

  const fmt = (s) => {
    const m = Math.floor(s / 60)
    const r = s % 60
    return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`
  }

  const completeSet = (i) => {
    setSetData((prev) => prev.map((s, j) => (j === i ? { ...s, done: !s.done } : s)))
    setSeconds(90)
    setRunning(true)
  }

  const resetLiveReps = () => {
    repsRef.current = 0
    repStateRef.current = { phase: 'idle' }
    lastSendRef.current = 0
    setReps(0)
  }

  const stopAndLogSet = async () => {
    if (stopInFlightRef.current) return
    stopInFlightRef.current = true

    const repsToRecord = repsRef.current
    const nextOpenIndex = setData.findIndex((set) => !set.done)
    const shouldLogSet = repsToRecord > 0 && nextOpenIndex !== -1
    const setToRecord = shouldLogSet ? setData[nextOpenIndex] : null
    setSyncError(null)

    if (shouldLogSet) {
      setSetData((prev) => prev.map((set, index) => (
        index === nextOpenIndex
          ? { ...set, reps: String(repsToRecord), done: true }
          : set
      )))
    }

    stopPoseSession()
    setTrackingActive(false)
    setCameraReady(false)
    resetLiveReps()

    if (shouldLogSet) {
      setSeconds(90)
      setRunning(true)

      if (!user?.uid) {
        setSyncError('Set was logged locally, but you must be signed in to sync history.')
      } else {
        try {
          const setLogId = await saveSetLog({
            uid: user.uid,
            exercise: ex,
            setIndex: nextOpenIndex,
            reps: repsToRecord,
            weightRaw: setToRecord?.weight || '',
            liftSessionId: liftSessionIdRef.current,
          })
          setLogIdsRef.current[nextOpenIndex] = setLogId
        } catch (error) {
          console.error('Set log save failed:', error)
          setSyncError(syncErrorMessage(error, 'Set was logged locally, but could not sync to history.'))
        }
      }
    }

    stopInFlightRef.current = false
  }

  const startSetTracking = () => {
    stopInFlightRef.current = false
    resetLiveReps()
    setRunning(false)
    setCameraReady(false)
    setCameraError(null)
    setTrackingActive(true)
  }

  const syncLoggedSetEdit = async (index) => {
    const setLogId = setLogIdsRef.current[index]
    if (!setLogId || !user?.uid) return

    try {
      await updateSetLogFields({
        uid: user.uid,
        setLogId,
        reps: setData[index]?.reps,
        weightRaw: setData[index]?.weight,
      })
      setSyncError(null)
    } catch (error) {
      console.error('Set log update failed:', error)
      setSyncError(syncErrorMessage(error, 'Latest set edit could not sync to history.'))
    }
  }

  const updateField = (i, field, value) => {
    setSetData((prev) => prev.map((s, j) => (j === i ? { ...s, [field]: value } : s)))
  }

  const completed = setData.filter((s) => s.done).length
  const progress = (completed / totalSets) * 100

  const nameParts = ex.name.split(' ')
  const lastWord = nameParts.pop()
  const [mm, ss] = fmt(seconds).split(':')
  const trackingStatus = modelError || cameraError
    ? 'Tracking paused'
    : !trackingActive
      ? 'Camera stopped'
    : cameraReady
      ? 'Live pose tracking'
      : modelReady
        ? 'Starting camera'
        : 'Loading pose model'

  return (
    <>
      <AppNav onHome={() => goto('hub')} onProfile={() => goto('profile')} dark crumb={`Set ${Math.min(completed + 1, totalSets)} / ${totalSets}`} />
      <main className="session-screen">
        <div className="session-bg-circle"></div>
        <div className="session-inner">
          <div className="session-head">
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="session-back" onClick={() => goto('workout')}>
                ← Back to lifts
              </button>
              <button className="session-back" onClick={() => goto('hub')}>
                ← Hub
              </button>
            </div>
            <div style={{ textAlign: 'right', fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)' }}>
              Live session
              <br />
              <span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 22, color: 'var(--paper)', letterSpacing: 0, textTransform: 'none' }}>
                Started just now
              </span>
            </div>
          </div>

          <div className="session-grid">
            <div className="session-main">
              <div className="ex-eyebrow">
                {ex.muscle} · {ex.equipment} · {ex.difficulty}
              </div>
              <h2>
                {nameParts.length > 0 && <>{nameParts.join(' ')} </>}
                <em>{lastWord}.</em>
              </h2>
              <p className="ex-cue-big">{ex.cue}</p>

              <div className="pose-panel">
                <div className="pose-panel-head">
                  <div>
                    <div className="pose-label">AI form camera</div>
                    <p>{trackingStatus}</p>
                  </div>
                  <div className="rep-controls">
                    <button
                      className={`set-camera-btn ${trackingActive ? 'is-stop' : 'is-start'}`}
                      onClick={trackingActive ? stopAndLogSet : startSetTracking}
                      disabled={Boolean(modelError) || (!trackingActive && !modelReady)}
                    >
                      {trackingActive ? 'Stop' : 'Start Set'}
                    </button>
                    <div className="rep-pill">
                      <strong>{reps}</strong>
                      <span>reps</span>
                    </div>
                  </div>
                </div>

                <div className="camera-stage">
                  {modelError || cameraError ? (
                    <div className="camera-message">{modelError || cameraError}</div>
                  ) : !trackingActive ? (
                    <div className="camera-message">Camera stopped. Start Set to track the next set.</div>
                  ) : (
                    <>
                      <video ref={videoRef} autoPlay playsInline muted className="camera-feed" />
                      <canvas ref={canvasRef} className="pose-canvas" />
                      {!cameraReady && (
                        <div className="camera-message camera-message--overlay">
                          {modelReady ? 'Starting camera...' : 'Loading pose model...'}
                        </div>
                      )}
                    </>
                  )}

                  {feedback && (
                    <div className="feedback-banner">{feedback}</div>
                  )}
                </div>
              </div>

              <div className="set-tracker">
                <div className="tr-head">
                  <span className="lbl">Set tracker</span>
                  <span className="count">
                    {completed}
                    <em>of {totalSets}</em>
                  </span>
                </div>

                <div className="set-row-labels" aria-hidden="true">
                  <span></span>
                  <span></span>
                  <span>Weight</span>
                  <span>Reps</span>
                  <span></span>
                </div>

                {setData.map((s, i) => (
                  <div className={`set-row ${s.done ? 'complete' : ''}`} key={i}>
                    <span className="s-num">SET {String(i + 1).padStart(2, '0')}</span>
                    <span className="s-bar">
                      <span style={{ width: s.done ? '100%' : s.weight && s.reps ? '50%' : '0%' }}></span>
                    </span>
                    <input
                      className="s-input"
                      type="text"
                      placeholder=""
                      value={s.weight}
                      onChange={(e) => updateField(i, 'weight', e.target.value)}
                      onBlur={() => syncLoggedSetEdit(i)}
                    />
                    <input
                      className="s-input"
                      type="text"
                      placeholder=""
                      value={s.reps}
                      onChange={(e) => updateField(i, 'reps', e.target.value)}
                      onBlur={() => syncLoggedSetEdit(i)}
                    />
                    <button className="s-done" onClick={() => completeSet(i)}>
                      {s.done ? 'Done ✓' : 'Mark'}
                    </button>
                  </div>
                ))}
                {syncError && (
                  <div className="sync-error">{syncError}</div>
                )}
              </div>

              <div className="finish-bar">
                <span className="progress">
                  <strong>{Math.round(progress)}%</strong>
                  through this lift
                </span>
                <button
                  className="finish-btn"
                  onClick={() => {
                    if (completed < totalSets) return
                    goto('data')
                  }}
                  style={{ opacity: completed < totalSets ? 0.4 : 1, cursor: completed < totalSets ? 'not-allowed' : 'pointer' }}
                  disabled={completed < totalSets}
                >
                  Finish lift
                  <span className="arr">
                    <Arrow />
                  </span>
                </button>
              </div>
            </div>

            <div className="session-side">
              <div className="side-card">
                <div className="lbl">Rest timer</div>
                <div className="timer">
                  {mm}
                  <em>:</em>
                  {ss}
                </div>
                <div className="timer-controls">
                  <button onClick={() => { setSeconds(60); setRunning(true) }}>60s</button>
                  <button onClick={() => { setSeconds(90); setRunning(true) }}>90s</button>
                  <button onClick={() => { setSeconds(120); setRunning(true) }}>2m</button>
                  <button className="primary" onClick={() => setRunning((r) => !r)}>
                    {running ? 'Pause' : 'Start'}
                  </button>
                </div>
              </div>

              <div className="side-card">
                <div className="lbl">Today's lineup</div>
                <div className="next-up">
                  {lineup.map((e, i) => {
                    const cls = e.id === ex.id ? 'current' : i < idx ? 'done' : ''
                    return (
                      <div key={e.id} className={`nu-row ${cls}`}>
                        <span className="n">{String(i + 1).padStart(2, '0')}</span>
                        <span className="name">{e.name}</span>
                        <span className="meta">
                          {e.sets}×{e.reps}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="side-card">
                <div className="lbl">Last time on this lift</div>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 36, lineHeight: 1, marginBottom: 8 }}>
                  {ex.pr.value}
                  <em style={{ fontStyle: 'italic', color: 'rgba(255,255,255,0.45)', fontSize: 18, marginLeft: 4 }}>
                    {ex.pr.unit}
                  </em>
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
  )
}
