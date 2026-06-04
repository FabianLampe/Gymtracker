import { describe, it, expect } from 'vitest'
import {
  createPlanExercise,
  swapExerciseInPlan,
  addExerciseToPlan,
  removeExerciseFromPlan,
  moveExerciseInPlan,
  updatePlanExercise,
} from '../planEditor'
import type { Plan } from '../../db/types'

const basePlan: Plan = { id: 'p1', name: 'Push', exercises: [] }

describe('createPlanExercise', () => {
  it('übernimmt exerciseId und order', () => {
    const pe = createPlanExercise('ex-1', 0)
    expect(pe.exerciseId).toBe('ex-1')
    expect(pe.order).toBe(0)
  })

  it('Default-Schrittweite ist 2.5 kg', () => {
    expect(createPlanExercise('ex-1', 0).stepWeightKg).toBe(2.5)
  })

  it('Default-Sätze ist 3', () => {
    expect(createPlanExercise('ex-1', 0).sets).toBe(3)
  })

  it('startReps entspricht targetReps wenn nicht angegeben', () => {
    const pe = createPlanExercise('ex-1', 0, { targetReps: 8 })
    expect(pe.startReps).toBe(8)
  })

  it('Optionen überschreiben Defaults', () => {
    const pe = createPlanExercise('ex-1', 0, { sets: 5, stepWeightKg: 5, startWeightKg: 100 })
    expect(pe.sets).toBe(5)
    expect(pe.stepWeightKg).toBe(5)
    expect(pe.startWeightKg).toBe(100)
  })
})

describe('addExerciseToPlan', () => {
  it('fügt Übung am Ende an', () => {
    const pe = createPlanExercise('ex-1', 0)
    const result = addExerciseToPlan(basePlan, pe)
    expect(result.exercises).toHaveLength(1)
    expect(result.exercises[0].exerciseId).toBe('ex-1')
  })

  it('verändert den originalen Plan nicht', () => {
    const pe = createPlanExercise('ex-1', 0)
    addExerciseToPlan(basePlan, pe)
    expect(basePlan.exercises).toHaveLength(0)
  })

  it('kann mehrere Übungen nacheinander hinzufügen', () => {
    const p1 = addExerciseToPlan(basePlan, createPlanExercise('ex-1', 0))
    const p2 = addExerciseToPlan(p1, createPlanExercise('ex-2', 1))
    expect(p2.exercises).toHaveLength(2)
  })
})

describe('removeExerciseFromPlan', () => {
  const planWith2: Plan = {
    ...basePlan,
    exercises: [
      createPlanExercise('ex-1', 0),
      createPlanExercise('ex-2', 1),
    ],
  }

  it('entfernt die Übung', () => {
    const result = removeExerciseFromPlan(planWith2, 'ex-1')
    expect(result.exercises.map(e => e.exerciseId)).toEqual(['ex-2'])
  })

  it('normalisiert die order-Werte', () => {
    const result = removeExerciseFromPlan(planWith2, 'ex-1')
    expect(result.exercises[0].order).toBe(0)
  })

  it('lässt andere Übungen unberührt', () => {
    const result = removeExerciseFromPlan(planWith2, 'ex-1')
    expect(result.exercises[0].exerciseId).toBe('ex-2')
  })
})

describe('moveExerciseInPlan', () => {
  const planWith3: Plan = {
    ...basePlan,
    exercises: [
      createPlanExercise('ex-1', 0),
      createPlanExercise('ex-2', 1),
      createPlanExercise('ex-3', 2),
    ],
  }

  it('verschiebt eine Übung nach unten', () => {
    const result = moveExerciseInPlan(planWith3, 0, 1)
    expect(result.exercises.map(e => e.exerciseId)).toEqual(['ex-2', 'ex-1', 'ex-3'])
  })

  it('verschiebt eine Übung nach oben', () => {
    const result = moveExerciseInPlan(planWith3, 2, 1)
    expect(result.exercises.map(e => e.exerciseId)).toEqual(['ex-1', 'ex-3', 'ex-2'])
  })

  it('clamp: kein Index unter 0', () => {
    const result = moveExerciseInPlan(planWith3, 0, -1)
    expect(result.exercises.map(e => e.exerciseId)).toEqual(['ex-1', 'ex-2', 'ex-3'])
  })

  it('clamp: kein Index über Ende', () => {
    const result = moveExerciseInPlan(planWith3, 2, 99)
    expect(result.exercises.map(e => e.exerciseId)).toEqual(['ex-1', 'ex-2', 'ex-3'])
  })

  it('normalisiert order-Werte nach Verschieben', () => {
    const result = moveExerciseInPlan(planWith3, 0, 2)
    expect(result.exercises.map(e => e.order)).toEqual([0, 1, 2])
  })
})

describe('updatePlanExercise', () => {
  const planWith2: Plan = {
    ...basePlan,
    exercises: [
      createPlanExercise('ex-1', 0, { sets: 3, targetReps: 10 }),
      createPlanExercise('ex-2', 1, { sets: 4, targetReps: 8 }),
    ],
  }

  it('aktualisiert ein Feld', () => {
    const result = updatePlanExercise(planWith2, 'ex-1', { sets: 5 })
    expect(result.exercises.find(e => e.exerciseId === 'ex-1')?.sets).toBe(5)
  })

  it('lässt andere Felder unberührt', () => {
    const result = updatePlanExercise(planWith2, 'ex-1', { sets: 5 })
    expect(result.exercises.find(e => e.exerciseId === 'ex-1')?.targetReps).toBe(10)
  })

  it('lässt andere Plan-Übungen unberührt', () => {
    const result = updatePlanExercise(planWith2, 'ex-1', { sets: 5 })
    expect(result.exercises.find(e => e.exerciseId === 'ex-2')?.sets).toBe(4)
  })
})

describe('swapExerciseInPlan', () => {
  const planWith2: Plan = {
    ...basePlan,
    exercises: [
      createPlanExercise('ex-1', 0, { sets: 3, targetReps: 10 }),
      createPlanExercise('ex-2', 1),
    ],
  }

  it('ersetzt die exerciseId', () => {
    const result = swapExerciseInPlan(planWith2, 'ex-1', 'ex-neu')
    expect(result.exercises.find(e => e.exerciseId === 'ex-neu')).toBeDefined()
    expect(result.exercises.find(e => e.exerciseId === 'ex-1')).toBeUndefined()
  })

  it('behält die Einstellungen der getauschten Übung', () => {
    const result = swapExerciseInPlan(planWith2, 'ex-1', 'ex-neu')
    expect(result.exercises.find(e => e.exerciseId === 'ex-neu')?.sets).toBe(3)
    expect(result.exercises.find(e => e.exerciseId === 'ex-neu')?.targetReps).toBe(10)
  })

  it('lässt andere Übungen unberührt', () => {
    const result = swapExerciseInPlan(planWith2, 'ex-1', 'ex-neu')
    expect(result.exercises.find(e => e.exerciseId === 'ex-2')).toBeDefined()
  })
})
