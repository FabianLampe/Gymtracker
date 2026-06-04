import { describe, it, expect } from 'vitest'
import { computeProgressionSuggestion, getFirstSetRepsForExercise } from '../progression'
import type { Einheit } from '../../db/types'

describe('computeProgressionSuggestion', () => {
  it('gibt Vorschlag wenn 2× in Folge Ziel erreicht', () => {
    const result = computeProgressionSuggestion([10, 10], 10, 80, 2.5)
    expect(result).toEqual({ newWeightKg: 82.5 })
  })

  it('gibt null wenn nur 1 Eintrag vorhanden', () => {
    expect(computeProgressionSuggestion([10], 10, 80, 2.5)).toBeNull()
  })

  it('gibt null wenn Liste leer ist', () => {
    expect(computeProgressionSuggestion([], 10, 80, 2.5)).toBeNull()
  })

  it('gibt null wenn neuester Satz das Ziel verfehlt', () => {
    expect(computeProgressionSuggestion([9, 10], 10, 80, 2.5)).toBeNull()
  })

  it('gibt null wenn vorheriger Satz das Ziel verfehlt', () => {
    expect(computeProgressionSuggestion([10, 9], 10, 80, 2.5)).toBeNull()
  })

  it('newWeightKg = currentWeightKg + stepWeightKg', () => {
    const result = computeProgressionSuggestion([12, 12], 10, 100, 5)
    expect(result?.newWeightKg).toBe(105)
  })

  it('>=Ziel zählt (mehr als Ziel reicht)', () => {
    expect(computeProgressionSuggestion([12, 11], 10, 80, 2.5)).toEqual({ newWeightKg: 82.5 })
  })
})

describe('getFirstSetRepsForExercise', () => {
  const einheit: Einheit = {
    id: 'e1',
    planId: 'p1',
    date: '2026-06-04',
    exercises: [
      { exerciseId: 'ex-1', sets: [{ reps: 8, weightKg: 80 }, { reps: 6, weightKg: 80 }] },
      { exerciseId: 'ex-2', sets: [] },
    ],
  }

  it('gibt Wdh des ersten Satzes zurück', () => {
    expect(getFirstSetRepsForExercise(einheit, 'ex-1')).toBe(8)
  })

  it('gibt null wenn Übung nicht in der Einheit', () => {
    expect(getFirstSetRepsForExercise(einheit, 'ex-unbekannt')).toBeNull()
  })

  it('gibt null wenn Übung keine Sätze hat', () => {
    expect(getFirstSetRepsForExercise(einheit, 'ex-2')).toBeNull()
  })
})
