import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const firestoreMocks = vi.hoisted(() => ({
  db: { type: 'mock-db' },
  addDoc: vi.fn(),
  collection: vi.fn(),
  doc: vi.fn(),
  getDocs: vi.fn(),
  limit: vi.fn(),
  orderBy: vi.fn(),
  query: vi.fn(),
  serverTimestamp: vi.fn(),
  updateDoc: vi.fn(),
}))

vi.mock('../../firebase', () => ({
  db: firestoreMocks.db,
}))

vi.mock('firebase/firestore/lite', () => ({
  addDoc: firestoreMocks.addDoc,
  collection: firestoreMocks.collection,
  doc: firestoreMocks.doc,
  getDocs: firestoreMocks.getDocs,
  limit: firestoreMocks.limit,
  orderBy: firestoreMocks.orderBy,
  query: firestoreMocks.query,
  serverTimestamp: firestoreMocks.serverTimestamp,
  updateDoc: firestoreMocks.updateDoc,
}))

import {
  buildHistoryData,
  formatLocalDate,
  getISOWeekKey,
  loadSetLogs,
  saveSetLog,
  updateSetLogFields,
} from './trainingData'

const exercise = {
  id: 'squat',
  name: 'Back Squat',
  muscle: 'Legs',
  secondary: [],
  equipment: 'Barbell',
  difficulty: 'Advanced',
  sets: 5,
  reps: '5',
}

describe('trainingData Firestore operations', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 3, 26, 12))
    vi.clearAllMocks()

    firestoreMocks.collection.mockImplementation((...args) => ({ type: 'collection', args }))
    firestoreMocks.doc.mockImplementation((...args) => ({ type: 'doc', args }))
    firestoreMocks.limit.mockImplementation((count) => ({ type: 'limit', count }))
    firestoreMocks.orderBy.mockImplementation((field, direction) => ({ type: 'orderBy', field, direction }))
    firestoreMocks.query.mockImplementation((...args) => ({ type: 'query', args }))
    firestoreMocks.serverTimestamp.mockReturnValue({ type: 'serverTimestamp' })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('saves a set log under the signed-in user path with parsed volume data', async () => {
    firestoreMocks.addDoc.mockResolvedValue({ id: 'set-123' })

    await expect(saveSetLog({
      uid: 'user-1',
      exercise,
      setIndex: 1,
      reps: '8',
      weightRaw: ' 135 ',
      liftSessionId: 'session-1',
    })).resolves.toBe('set-123')

    expect(firestoreMocks.collection).toHaveBeenCalledWith(
      firestoreMocks.db,
      'users',
      'user-1',
      'setLogs',
    )
    expect(firestoreMocks.addDoc).toHaveBeenCalledWith(
      { type: 'collection', args: [firestoreMocks.db, 'users', 'user-1', 'setLogs'] },
      expect.objectContaining({
        exerciseId: 'squat',
        exerciseName: 'Back Squat',
        reps: 8,
        weight: 135,
        weightRaw: '135',
        volume: 1080,
        setIndex: 2,
        completedAt: { type: 'serverTimestamp' },
        localDate: '2026-04-26',
        weekKey: '2026-W17',
        liftSessionId: 'session-1',
      }),
    )
  })

  it('updates a saved set log by id with parsed edit data', async () => {
    firestoreMocks.updateDoc.mockResolvedValue()

    await updateSetLogFields({
      uid: 'user-1',
      setLogId: 'set-123',
      reps: '10',
      weightRaw: 'bodyweight',
    })

    expect(firestoreMocks.doc).toHaveBeenCalledWith(
      firestoreMocks.db,
      'users',
      'user-1',
      'setLogs',
      'set-123',
    )
    expect(firestoreMocks.updateDoc).toHaveBeenCalledWith(
      { type: 'doc', args: [firestoreMocks.db, 'users', 'user-1', 'setLogs', 'set-123'] },
      {
        reps: 10,
        weight: null,
        weightRaw: 'bodyweight',
        volume: null,
        updatedAt: { type: 'serverTimestamp' },
      },
    )
  })

  it('loads set logs using the owner collection, newest-first ordering, and default limit', async () => {
    const completedAtDate = new Date('2026-04-24T14:30:00Z')
    firestoreMocks.getDocs.mockResolvedValue({
      docs: [
        {
          id: 'set-123',
          data: () => ({
            exerciseId: 'squat',
            completedAt: { toDate: () => completedAtDate },
          }),
        },
      ],
    })

    const logs = await loadSetLogs('user-1')

    expect(firestoreMocks.collection).toHaveBeenCalledWith(
      firestoreMocks.db,
      'users',
      'user-1',
      'setLogs',
    )
    expect(firestoreMocks.orderBy).toHaveBeenCalledWith('completedAt', 'desc')
    expect(firestoreMocks.limit).toHaveBeenCalledWith(300)
    expect(firestoreMocks.query).toHaveBeenCalledWith(
      { type: 'collection', args: [firestoreMocks.db, 'users', 'user-1', 'setLogs'] },
      { type: 'orderBy', field: 'completedAt', direction: 'desc' },
      { type: 'limit', count: 300 },
    )
    expect(logs).toEqual([
      {
        id: 'set-123',
        exerciseId: 'squat',
        completedAt: { toDate: expect.any(Function) },
        completedAtDate,
      },
    ])
  })

  it('fails before Firestore calls when required identifiers are missing', async () => {
    await expect(loadSetLogs()).rejects.toThrow('uid is required')
    await expect(saveSetLog({ exercise })).rejects.toThrow('uid is required')
    await expect(updateSetLogFields({ uid: 'user-1' })).rejects.toThrow('setLogId is required')

    expect(firestoreMocks.collection).not.toHaveBeenCalled()
    expect(firestoreMocks.doc).not.toHaveBeenCalled()
  })
})

describe('trainingData history helpers', () => {
  it('formats local dates and ISO week keys for fixed dates', () => {
    expect(formatLocalDate(new Date(2026, 3, 26))).toBe('2026-04-26')
    expect(getISOWeekKey(new Date(2026, 3, 26))).toBe('2026-W17')
    expect(getISOWeekKey(new Date(2026, 0, 1))).toBe('2026-W01')
  })

  it('builds dashboard history from saved logs', () => {
    const now = new Date(2026, 3, 26, 12)
    const logs = [
      {
        id: 'set-1',
        exerciseId: 'squat',
        exerciseName: 'Back Squat',
        muscle: 'Legs',
        reps: 5,
        weight: 225,
        localDate: '2026-04-26',
        weekKey: '2026-W17',
        liftSessionId: 'session-1',
        completedAtDate: new Date('2026-04-26T12:00:00Z'),
      },
      {
        id: 'set-2',
        exerciseId: 'squat',
        exerciseName: 'Back Squat',
        muscle: 'Legs',
        reps: 5,
        weight: 235,
        localDate: '2026-04-26',
        weekKey: '2026-W17',
        liftSessionId: 'session-1',
        completedAtDate: new Date('2026-04-26T12:05:00Z'),
      },
      {
        id: 'set-3',
        exerciseId: 'pullup',
        exerciseName: 'Pull-up',
        muscle: 'Back',
        reps: 8,
        weight: null,
        localDate: '2026-04-19',
        weekKey: '2026-W16',
        liftSessionId: 'session-2',
        completedAtDate: new Date('2026-04-19T12:00:00Z'),
      },
    ]

    const history = buildHistoryData(logs, now)

    expect(history.hasLogs).toBe(true)
    expect(history.muscleVolume.Legs).toBe(2)
    expect(history.muscleVolume.Back).toBe(1)
    expect(history.totalRecent).toBe(3)
    expect(history.setsPerWeek.at(-1)).toBe(2)
    expect(history.setsPerWeek.at(-2)).toBe(1)
    expect(history.recentSessions[0]).toEqual({
      date: 'Today',
      title: 'Back Squat',
      duration: 'Logged',
      sets: 2,
      focus: 'Legs',
    })
    expect(history.prHistory.squat).toEqual({
      value: 235,
      unit: 'lb',
      history: [225, 235],
    })
    expect(history.prHistory.pullup).toEqual({
      value: 8,
      unit: 'reps',
      history: [8, 8],
    })
  })
})
