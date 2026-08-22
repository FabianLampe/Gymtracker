import { describe, it, expect } from 'vitest'
import { buildPrefillFromPlan, buildPrefillFromLastEinheit, lastEinheitForPlan, createEinheit } from '../prefill'
import { createPlanExercise } from '../../plans/planEditor'
import type { Einheit, Plan } from '../../db/types'

const plan: Plan = {
  id: 'p1',
  name: 'Push',
  exercises: [
    createPlanExercise('ex-1', 0, { sets: 3, startWeightKg: 80, startReps: 5, targetReps: 5 }),
    createPlanExercise('ex-2', 1, { sets: 4, startWeightKg: 40, startReps: 10, targetReps: 10 }),
  ],
}

describe('buildPrefillFromPlan', () => {
  it('erzeugt je Plan-Übung einen CompletedExercise-Eintrag', () => {
    const result = buildPrefillFromPlan(plan)
    expect(result).toHaveLength(2)
    expect(result[0].exerciseId).toBe('ex-1')
    expect(result[1].exerciseId).toBe('ex-2')
  })

  it('Anzahl Sätze entspricht PlanExercise.sets', () => {
    const result = buildPrefillFromPlan(plan)
    expect(result[0].sets).toHaveLength(3)
    expect(result[1].sets).toHaveLength(4)
  })

  it('Gewicht je Satz kommt aus startWeightKg', () => {
    const result = buildPrefillFromPlan(plan)
    expect(result[0].sets.every(s => s.weightKg === 80)).toBe(true)
    expect(result[1].sets.every(s => s.weightKg === 40)).toBe(true)
  })

  it('Wdh je Satz kommt aus startReps', () => {
    const result = buildPrefillFromPlan(plan)
    expect(result[0].sets.every(s => s.reps === 5)).toBe(true)
    expect(result[1].sets.every(s => s.reps === 10)).toBe(true)
  })

  it('Reihenfolge folgt dem order-Feld', () => {
    const reversed: Plan = {
      ...plan,
      exercises: [...plan.exercises].reverse(),
    }
    const result = buildPrefillFromPlan(reversed)
    expect(result[0].exerciseId).toBe('ex-1')
    expect(result[1].exerciseId).toBe('ex-2')
  })

  it('gibt unabhängige Satz-Objekte zurück (keine gemeinsamen Referenzen)', () => {
    const result = buildPrefillFromPlan(plan)
    result[0].sets[0].reps = 99
    expect(result[0].sets[1].reps).toBe(5)
  })
})

describe('createEinheit', () => {
  it('setzt planId und date', () => {
    const e = createEinheit('p1', [], '2026-06-04')
    expect(e.planId).toBe('p1')
    expect(e.date).toBe('2026-06-04')
  })

  it('übernimmt die Übungen', () => {
    const exercises = [{ exerciseId: 'ex-1', sets: [{ reps: 5, weightKg: 80 }] }]
    const e = createEinheit('p1', exercises, '2026-06-04')
    expect(e.exercises).toEqual(exercises)
  })

  it('generiert jedes Mal eine eindeutige ID', () => {
    const a = createEinheit('p1', [], '2026-06-04')
    const b = createEinheit('p1', [], '2026-06-04')
    expect(a.id).not.toBe(b.id)
  })
})

// ── #06 Fortschreiben ──────────────────────────────────────────────────────

const plan2: Plan = {
  id: 'p2',
  name: 'Push',
  exercises: [
    createPlanExercise('ex-1', 0, { sets: 3, startWeightKg: 60, startReps: 5 }),
    createPlanExercise('ex-2', 1, { sets: 2, startWeightKg: 40, startReps: 8 }),
  ],
}

const lastEinheit: Einheit = {
  id: 'e-prev',
  planId: 'p2',
  date: '2026-06-01',
  exercises: [
    { exerciseId: 'ex-1', sets: [{ reps: 5, weightKg: 80 }, { reps: 4, weightKg: 80 }, { reps: 3, weightKg: 75 }] },
    { exerciseId: 'ex-2', sets: [{ reps: 10, weightKg: 42.5 }, { reps: 8, weightKg: 42.5 }] },
  ],
}

describe('buildPrefillFromLastEinheit', () => {
  it('verwendet Sätze der letzten Einheit', () => {
    const result = buildPrefillFromLastEinheit(plan2, lastEinheit)
    expect(result[0].sets).toEqual(lastEinheit.exercises[0].sets.map(s => ({ ...s })))
  })

  it('folgt der Satzzahl des Plans, wenn sie erhöht wurde', () => {
    const planMehrSaetze: Plan = {
      ...plan2,
      exercises: [
        createPlanExercise('ex-1', 0, { sets: 5, startWeightKg: 60, startReps: 5 }),
        ...plan2.exercises.slice(1),
      ],
    }
    const result = buildPrefillFromLastEinheit(planMehrSaetze, lastEinheit)
    expect(result[0].sets).toHaveLength(5)
    // Die letzten beiden Sätze übernehmen die Werte des letzten gemachten Satzes
    expect(result[0].sets[3]).toEqual({ reps: 3, weightKg: 75 })
    expect(result[0].sets[4]).toEqual({ reps: 3, weightKg: 75 })
  })

  it('folgt der Satzzahl des Plans, wenn sie verringert wurde', () => {
    const planWenigerSaetze: Plan = {
      ...plan2,
      exercises: [
        createPlanExercise('ex-1', 0, { sets: 2, startWeightKg: 60, startReps: 5 }),
        ...plan2.exercises.slice(1),
      ],
    }
    const result = buildPrefillFromLastEinheit(planWenigerSaetze, lastEinheit)
    expect(result[0].sets).toEqual([
      { reps: 5, weightKg: 80 },
      { reps: 4, weightKg: 80 },
    ])
  })

  it('fällt auf Plan-Startwerte zurück, wenn die letzte Einheit keine Sätze hat', () => {
    const leer: Einheit = {
      ...lastEinheit,
      exercises: [{ exerciseId: 'ex-1', sets: [] }],
    }
    const result = buildPrefillFromLastEinheit(plan2, leer)
    expect(result[0].sets).toHaveLength(3)
    expect(result[0].sets[0]).toEqual({ reps: 5, weightKg: 60 })
  })

  it('fällt auf Plan-Startwerte zurück wenn Übung in letzter Einheit fehlt', () => {
    const planWithNew: Plan = {
      ...plan2,
      exercises: [
        ...plan2.exercises,
        createPlanExercise('ex-neu', 2, { sets: 3, startWeightKg: 20, startReps: 12 }),
      ],
    }
    const result = buildPrefillFromLastEinheit(planWithNew, lastEinheit)
    const neu = result.find(e => e.exerciseId === 'ex-neu')!
    expect(neu.sets.every(s => s.weightKg === 20 && s.reps === 12)).toBe(true)
  })

  it('respektiert die Plan-Reihenfolge (order-Feld)', () => {
    const reversed: Plan = { ...plan2, exercises: [...plan2.exercises].reverse() }
    const result = buildPrefillFromLastEinheit(reversed, lastEinheit)
    expect(result[0].exerciseId).toBe('ex-1')
    expect(result[1].exerciseId).toBe('ex-2')
  })

  it('gibt unabhängige Satz-Objekte zurück', () => {
    const result = buildPrefillFromLastEinheit(plan2, lastEinheit)
    result[0].sets[0].reps = 99
    expect(lastEinheit.exercises[0].sets[0].reps).toBe(5)
  })
})

describe('lastEinheitForPlan', () => {
  const einheiten: Einheit[] = [
    { id: 'e1', planId: 'p-a', date: '2026-05-01', exercises: [] },
    { id: 'e2', planId: 'p-a', date: '2026-06-01', exercises: [] },
    { id: 'e3', planId: 'p-b', date: '2026-06-04', exercises: [] },
  ]

  it('gibt die neueste Einheit des Plans zurück', () => {
    expect(lastEinheitForPlan(einheiten, 'p-a')?.id).toBe('e2')
  })

  it('ignoriert Einheiten anderer Pläne', () => {
    expect(lastEinheitForPlan(einheiten, 'p-a')?.planId).toBe('p-a')
  })

  it('gibt undefined zurück wenn kein Eintrag für den Plan existiert', () => {
    expect(lastEinheitForPlan(einheiten, 'p-unbekannt')).toBeUndefined()
  })

  it('wählt das neueste Datum bei mehreren Einheiten', () => {
    const withThree: Einheit[] = [
      ...einheiten,
      { id: 'e4', planId: 'p-a', date: '2026-04-01', exercises: [] },
    ]
    expect(lastEinheitForPlan(withThree, 'p-a')?.id).toBe('e2')
  })

  it('entscheidet bei gleichem Datum über createdAt (nicht über die Lesereihenfolge)', () => {
    const sameDay: Einheit[] = [
      { id: 'a', planId: 'p-a', date: '2026-06-01', createdAt: '2026-06-01T08:00:00.000Z', exercises: [] },
      { id: 'b', planId: 'p-a', date: '2026-06-01', createdAt: '2026-06-01T18:00:00.000Z', exercises: [] },
    ]
    expect(lastEinheitForPlan(sameDay, 'p-a')?.id).toBe('b')
    expect(lastEinheitForPlan([...sameDay].reverse(), 'p-a')?.id).toBe('b')
  })

  it('ist auch ohne createdAt stabil (Alt-Daten)', () => {
    const sameDay: Einheit[] = [
      { id: 'a', planId: 'p-a', date: '2026-06-01', exercises: [] },
      { id: 'b', planId: 'p-a', date: '2026-06-01', exercises: [] },
    ]
    const first = lastEinheitForPlan(sameDay, 'p-a')?.id
    const second = lastEinheitForPlan([...sameDay].reverse(), 'p-a')?.id
    expect(first).toBe(second)
  })
})

describe('createEinheit', () => {
  it('setzt createdAt als Zeitstempel', () => {
    const e = createEinheit('p1', [], '2026-06-04')
    expect(e.createdAt).toBeTruthy()
    expect(Number.isNaN(Date.parse(e.createdAt!))).toBe(false)
  })
})
