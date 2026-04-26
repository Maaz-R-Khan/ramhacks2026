import {
  addDoc,
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore/lite'
import { db } from '../../firebase'
import { EXERCISES, MUSCLE_GROUPS } from './data'

const DEFAULT_HISTORY_WEEKS = 11

function pad(value) {
  return String(value).padStart(2, '0')
}

export function formatLocalDate(date = new Date()) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function getISOWeekKey(date = new Date()) {
  const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const day = target.getUTCDay() || 7
  target.setUTCDate(target.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1))
  const week = Math.ceil(((target - yearStart) / 86400000 + 1) / 7)
  return `${target.getUTCFullYear()}-W${pad(week)}`
}

export function createLiftSessionId(exerciseId) {
  return `${exerciseId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function parseWeight(weightRaw) {
  const parsed = Number.parseFloat(String(weightRaw || '').trim())
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

function parseReps(reps) {
  const parsed = Number.parseInt(String(reps || ''), 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0
}

function requireValue(value, name) {
  if (!value) throw new Error(`${name} is required for Firestore set log operations.`)
}

function buildSetPayload({ exercise, setIndex, reps, weightRaw, liftSessionId }) {
  const now = new Date()
  const cleanWeightRaw = String(weightRaw || '').trim()
  const cleanReps = parseReps(reps)
  const weight = parseWeight(cleanWeightRaw)

  return {
    exerciseId: exercise.id,
    exerciseName: exercise.name,
    muscle: exercise.muscle,
    secondary: exercise.secondary || [],
    equipment: exercise.equipment,
    difficulty: exercise.difficulty,
    setIndex: setIndex + 1,
    prescribedSets: exercise.sets,
    targetReps: exercise.reps,
    reps: cleanReps,
    weight,
    weightRaw: cleanWeightRaw,
    volume: weight === null ? null : weight * cleanReps,
    completedAt: serverTimestamp(),
    localDate: formatLocalDate(now),
    weekKey: getISOWeekKey(now),
    liftSessionId,
  }
}

export async function saveSetLog({ uid, exercise, setIndex, reps, weightRaw, liftSessionId }) {
  requireValue(uid, 'uid')

  const payload = buildSetPayload({ exercise, setIndex, reps, weightRaw, liftSessionId })
  const ref = await addDoc(collection(db, 'users', uid, 'setLogs'), payload)
  return ref.id
}

export async function updateSetLogFields({ uid, setLogId, reps, weightRaw }) {
  requireValue(uid, 'uid')
  requireValue(setLogId, 'setLogId')

  const cleanWeightRaw = String(weightRaw || '').trim()
  const cleanReps = parseReps(reps)
  const weight = parseWeight(cleanWeightRaw)

  await updateDoc(doc(db, 'users', uid, 'setLogs', setLogId), {
    reps: cleanReps,
    weight,
    weightRaw: cleanWeightRaw,
    volume: weight === null ? null : weight * cleanReps,
    updatedAt: serverTimestamp(),
  })
}

export async function loadSetLogs(uid, maxLogs = 300) {
  requireValue(uid, 'uid')

  const logsQuery = query(
    collection(db, 'users', uid, 'setLogs'),
    orderBy('completedAt', 'desc'),
    limit(maxLogs),
  )
  const snapshot = await getDocs(logsQuery)

  return snapshot.docs.map((entry) => {
    const data = entry.data()
    return {
      id: entry.id,
      ...data,
      completedAtDate: data.completedAt?.toDate?.() || null,
    }
  })
}

function recentWeekKeys(count = DEFAULT_HISTORY_WEEKS, now = new Date()) {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(now)
    date.setDate(date.getDate() - 7 * (count - index - 1))
    return getISOWeekKey(date)
  })
}

function weekLabel(weekKey) {
  return `W${Number(weekKey.split('-W')[1])}`
}

function dateFromLocalDate(localDate) {
  const [year, month, day] = String(localDate || '').split('-').map(Number)
  if (!year || !month || !day) return null
  return new Date(year, month - 1, day)
}

function relativeDateLabel(localDate, now = new Date()) {
  const date = dateFromLocalDate(localDate)
  if (!date) return 'Logged'

  const today = dateFromLocalDate(formatLocalDate(now))
  const diffDays = Math.round((today - date) / 86400000)
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays > 1 && diffDays < 7) return `${diffDays} days ago`

  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function sortLogAsc(a, b) {
  const aTime = a.completedAtDate?.getTime?.() || 0
  const bTime = b.completedAtDate?.getTime?.() || 0
  return aTime - bTime
}

function buildRecentSessions(logs, now) {
  const groups = new Map()

  logs.forEach((log) => {
    const key = log.liftSessionId || `${log.localDate}-${log.exerciseId}`
    const current = groups.get(key) || {
      key,
      localDate: log.localDate,
      sortTime: log.completedAtDate?.getTime?.() || 0,
      title: log.exerciseName || 'Training session',
      sets: 0,
      focus: log.muscle || 'Mixed',
    }

    current.sets += 1
    current.sortTime = Math.max(current.sortTime, log.completedAtDate?.getTime?.() || 0)
    groups.set(key, current)
  })

  return Array.from(groups.values())
    .sort((a, b) => b.sortTime - a.sortTime)
    .slice(0, 6)
    .map((session) => ({
      date: relativeDateLabel(session.localDate, now),
      title: session.title,
      duration: 'Logged',
      sets: session.sets,
      focus: session.focus,
    }))
}

function buildPrHistory(logs) {
  const ascending = [...logs].sort(sortLogAsc)

  return EXERCISES.reduce((acc, exercise) => {
    const exerciseLogs = ascending.filter((log) => log.exerciseId === exercise.id)
    const weightedLogs = exerciseLogs.filter((log) => typeof log.weight === 'number')
    const sourceLogs = weightedLogs.length ? weightedLogs : exerciseLogs
    const unit = weightedLogs.length ? 'lb' : 'reps'
    let best = 0
    const history = []

    sourceLogs.forEach((log) => {
      const value = weightedLogs.length ? log.weight : log.reps
      if (typeof value !== 'number') return
      best = Math.max(best, value)
      history.push(best)
    })

    acc[exercise.id] = {
      value: best || null,
      unit,
      history: history.length > 1 ? history : [best || 0, best || 0],
    }
    return acc
  }, {})
}

export function buildHistoryData(logs, now = new Date()) {
  const fourWeeksAgo = new Date(now)
  fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28)

  const muscleVolume = MUSCLE_GROUPS.reduce((acc, group) => {
    acc[group] = 0
    return acc
  }, {})

  logs.forEach((log) => {
    const completedAt = log.completedAtDate || dateFromLocalDate(log.localDate)
    if (!completedAt || completedAt < fourWeeksAgo) return
    if (log.muscle && muscleVolume[log.muscle] !== undefined) muscleVolume[log.muscle] += 1
  })

  const weekKeys = recentWeekKeys(DEFAULT_HISTORY_WEEKS, now)
  const weekCounts = weekKeys.reduce((acc, key) => {
    acc[key] = 0
    return acc
  }, {})

  logs.forEach((log) => {
    if (weekCounts[log.weekKey] !== undefined) weekCounts[log.weekKey] += 1
  })

  const setsPerWeek = weekKeys.map((key) => weekCounts[key])
  const totalRecent = Object.values(muscleVolume).reduce((sum, value) => sum + value, 0)

  return {
    hasLogs: logs.length > 0,
    logs,
    muscleVolume,
    totalRecent,
    weekLabels: weekKeys.map(weekLabel),
    setsPerWeek,
    avgSets: Math.round(setsPerWeek.reduce((sum, value) => sum + value, 0) / setsPerWeek.length),
    recentSessions: buildRecentSessions(logs, now),
    prHistory: buildPrHistory(logs),
  }
}
