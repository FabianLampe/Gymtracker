import { describe, it, expect } from 'vitest'
import { computeProgressionSuggestion, getFirstSetRepsForExercise, computeRestFromSet } from '../progression'
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

// ── computeRestFromSet (Schoenfeld 2016 / de Salles 2009) ──────────────────
//
// Formel: Epley-1RM-Schätzung → Intensität = Gewicht / e1RM
//   e1RM = Gewicht × (1 + Wdh / 30)
//   ≥ 90% 1RM (1-2 Wdh):   300 s  — maximale Kraft
//   ≥ 80% 1RM (3-5 Wdh):   180 s  — Kraft/Hypertrophie
//   ≥ 70% 1RM (6-9 Wdh):   120 s  — Hypertrophie
//   ≥ 60% 1RM (10-15 Wdh):  90 s  — Hypertrophie/Ausdauer
//   < 60% 1RM (15+ Wdh):    60 s  — Kraft-Ausdauer
//
// Körpergewichts-Übungen (< 5 kg): Wdh-Tabelle als Fallback.

describe('computeRestFromSet', () => {
  // ── Gewichts-Übungen ─────────────────────────────────────────────
  it('1 Wdh → 300 s (near-1RM, maximale Kraft)', () => {
    // e1RM = 100, Intensität ≈ 100 %
    expect(computeRestFromSet(1, 100)).toBe(300)
  })

  it('3 Wdh × 85 kg → 300 s (≥ 90 % 1RM)', () => {
    // e1RM = 85 × 1.1 = 93.5, Intensität ≈ 90.9 % → 300 s
    expect(computeRestFromSet(3, 85)).toBe(300)
  })

  it('5 Wdh × 80 kg → 180 s (≈ 86 % 1RM, Kraft/Hypertrophie)', () => {
    // e1RM = 80 × 1.167 = 93.3, Intensität ≈ 85.7 % → 180 s
    expect(computeRestFromSet(5, 80)).toBe(180)
  })

  it('8 Wdh × 75 kg → 120 s (≈ 79 % 1RM, Hypertrophie)', () => {
    // e1RM = 75 × 1.267 = 95, Intensität ≈ 78.9 % → 120 s
    expect(computeRestFromSet(8, 75)).toBe(120)
  })

  it('12 Wdh × 70 kg → 120 s (≈ 71 % 1RM, Hypertrophie)', () => {
    // e1RM = 70 × 1.4 = 98, Intensität ≈ 71.4 % → 120 s
    expect(computeRestFromSet(12, 70)).toBe(120)
  })

  it('15 Wdh × 60 kg → 90 s (≈ 67 % 1RM)', () => {
    // e1RM = 60 × 1.5 = 90, Intensität ≈ 66.7 % → 90 s
    expect(computeRestFromSet(15, 60)).toBe(90)
  })

  it('25 Wdh × 20 kg → 60 s (< 60 % 1RM, Ausdauer)', () => {
    // e1RM = 20 × 1.833 = 36.7, Intensität ≈ 54.5 % → 60 s
    expect(computeRestFromSet(25, 20)).toBe(60)
  })

  // ── Körpergewicht (0 kg) ─────────────────────────────────────────
  it('Körpergewicht ≤ 5 Wdh → 180 s (sehr schwere BW-Übung)', () => {
    expect(computeRestFromSet(5, 0)).toBe(180)
  })

  it('Körpergewicht 8 Wdh → 120 s', () => {
    expect(computeRestFromSet(8, 0)).toBe(120)
  })

  it('Körpergewicht 12 Wdh → 90 s', () => {
    expect(computeRestFromSet(12, 0)).toBe(90)
  })

  it('Körpergewicht 20 Wdh → 60 s', () => {
    expect(computeRestFromSet(20, 0)).toBe(60)
  })
})
