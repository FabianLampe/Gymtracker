import { describe, it, expect } from 'vitest'
import {
  addSetToTraining,
  removeSetFromTraining,
  reindexRawInputsAfterRemove,
  reindexDoneSetsAfterRemove,
} from '../trainingOps'
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

describe('reindexRawInputsAfterRemove', () => {
  const raw = {
    '0-0-reps': '5', '0-0-weightKg': '80',
    '0-1-reps': '4', '0-1-weightKg': '80',
    '0-2-reps': '3', '0-2-weightKg': '77.5',
    '1-0-reps': '10',
  }

  it('entfernt die Einträge des gelöschten Satzes und rückt höhere nach', () => {
    const result = reindexRawInputsAfterRemove(raw, 0, 1)
    expect(result).toEqual({
      '0-0-reps': '5', '0-0-weightKg': '80',
      '0-1-reps': '3', '0-1-weightKg': '77.5',
      '1-0-reps': '10',
    })
  })

  it('lässt andere Übungen unangetastet', () => {
    const result = reindexRawInputsAfterRemove(raw, 0, 0)
    expect(result['1-0-reps']).toBe('10')
  })

  it('behält niedrigere Satz-Indizes bei', () => {
    const result = reindexRawInputsAfterRemove(raw, 0, 2)
    expect(result['0-0-reps']).toBe('5')
    expect(result['0-1-reps']).toBe('4')
    expect(result['0-2-reps']).toBeUndefined()
  })
})

describe('reindexDoneSetsAfterRemove', () => {
  it('entfernt den gelöschten Satz und rückt höhere nach', () => {
    const done = new Set(['0-0', '0-2', '1-0'])
    const result = reindexDoneSetsAfterRemove(done, 0, 1)
    expect(result).toEqual(new Set(['0-0', '0-1', '1-0']))
  })

  it('entfernt die Markierung des gelöschten Satzes', () => {
    const done = new Set(['0-1'])
    const result = reindexDoneSetsAfterRemove(done, 0, 1)
    expect(result.size).toBe(0)
  })

  it('lässt andere Übungen unangetastet', () => {
    const done = new Set(['2-0', '2-1'])
    const result = reindexDoneSetsAfterRemove(done, 0, 0)
    expect(result).toEqual(new Set(['2-0', '2-1']))
  })
})
