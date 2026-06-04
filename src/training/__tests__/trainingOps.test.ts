import { describe, it, expect } from 'vitest'
import { addSetToTraining, removeSetFromTraining } from '../trainingOps'
import type { CompletedExercise } from '../../db/types'

const ex1: CompletedExercise = {
  exerciseId: 'ex-1',
  sets: [{ reps: 5, weightKg: 80 }, { reps: 4, weightKg: 80 }],
}
const ex2: CompletedExercise = {
  exerciseId: 'ex-2',
  sets: [{ reps: 10, weightKg: 40 }],
}
const exercises = [ex1, ex2]

describe('addSetToTraining', () => {
  it('fügt eine Kopie des letzten Satzes hinzu', () => {
    const result = addSetToTraining(exercises, 0)
    expect(result[0].sets).toHaveLength(3)
    expect(result[0].sets[2]).toEqual({ reps: 4, weightKg: 80 })
  })

  it('beeinflusst andere Übungen nicht', () => {
    const result = addSetToTraining(exercises, 0)
    expect(result[1].sets).toHaveLength(1)
  })

  it('verändert das Original-Array nicht', () => {
    addSetToTraining(exercises, 0)
    expect(exercises[0].sets).toHaveLength(2)
  })

  it('fügt Default-Satz hinzu wenn sets leer ist', () => {
    const empty: CompletedExercise[] = [{ exerciseId: 'ex-x', sets: [] }]
    const result = addSetToTraining(empty, 0)
    expect(result[0].sets).toHaveLength(1)
    expect(result[0].sets[0]).toEqual({ reps: 10, weightKg: 20 })
  })
})

describe('removeSetFromTraining', () => {
  it('entfernt den Satz am angegebenen Index', () => {
    const result = removeSetFromTraining(exercises, 0, 0)
    expect(result[0].sets).toHaveLength(1)
    expect(result[0].sets[0]).toEqual({ reps: 4, weightKg: 80 })
  })

  it('entfernt nicht wenn nur noch 1 Satz übrig ist', () => {
    const result = removeSetFromTraining(exercises, 1, 0)
    expect(result[1].sets).toHaveLength(1)
  })

  it('beeinflusst andere Übungen nicht', () => {
    const result = removeSetFromTraining(exercises, 0, 0)
    expect(result[1].sets).toHaveLength(1)
  })
})
