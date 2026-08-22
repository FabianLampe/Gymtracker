import { describe, it, expect } from 'vitest'
import { exportState, importState } from '../exportImport'
import type { AppState } from '../types'

const state: AppState = {
  version: 1,
  exercises: [{ id: 'ex-1', name: 'Bankdrücken', muscleGroup: 'Brust', source: 'seeded', defaultRestSeconds: 180 }],
  plans: [{ id: 'p-1', name: 'Push', exercises: [] }],
  einheiten: [{
    id: 'e-1', planId: 'p-1', date: '2026-06-04',
    exercises: [{ exerciseId: 'ex-1', sets: [{ reps: 5, weightKg: 80 }] }],
  }],
}

describe('exportState', () => {
  it('gibt einen gültigen JSON-String zurück', () => {
    expect(() => JSON.parse(exportState(state))).not.toThrow()
  })

  it('enthält ein version-Feld', () => {
    const parsed = JSON.parse(exportState(state))
    expect(typeof parsed.version).toBe('number')
  })
})

describe('importState', () => {
  it('Round-Trip: importState(exportState(state)) ergibt denselben Zustand', () => {
    const result = importState(exportState(state))
    expect('error' in result).toBe(false)
    if (!('error' in result)) {
      expect(result.exercises).toEqual(state.exercises)
      expect(result.plans).toEqual(state.plans)
      expect(result.einheiten).toEqual(state.einheiten)
    }
  })

  it('gibt Fehler bei ungültigem JSON', () => {
    const result = importState('{ ungültig }')
    expect('error' in result).toBe(true)
  })

  it('gibt Fehler bei unbekannter Version', () => {
    const broken = JSON.stringify({ ...state, version: 999 })
    const result = importState(broken)
    expect('error' in result).toBe(true)
  })

  it('gibt Fehler wenn kein Objekt', () => {
    const result = importState('"nur ein string"')
    expect('error' in result).toBe(true)
  })
})

describe('importState — Struktur-Prüfung', () => {
  it('meldet fehlende Listen statt still zu scheitern', () => {
    const result = importState(JSON.stringify({ version: 1 }))
    expect(result).toHaveProperty('error')
  })

  it('meldet ein Feld, das keine Liste ist', () => {
    const result = importState(JSON.stringify({ version: 1, exercises: [], plans: {}, einheiten: [] }))
    expect(result).toHaveProperty('error')
  })

  it('akzeptiert einen vollständigen Export', () => {
    const result = importState(JSON.stringify({ version: 1, exercises: [], plans: [], einheiten: [] }))
    expect(result).not.toHaveProperty('error')
  })
})
