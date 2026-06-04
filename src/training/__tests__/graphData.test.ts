import { describe, it, expect } from 'vitest'
import { buildGraphData } from '../graphData'
import type { Einheit } from '../../db/types'

const REF = '2026-06-04'

const einheiten: Einheit[] = [
  {
    id: 'e1', planId: 'p1', date: '2026-06-01',
    exercises: [{ exerciseId: 'ex-1', sets: [{ reps: 5, weightKg: 80 }] }],
  },
  {
    id: 'e2', planId: 'p1', date: '2026-05-20',
    exercises: [{ exerciseId: 'ex-1', sets: [{ reps: 5, weightKg: 75 }] }],
  },
  {
    id: 'e3', planId: 'p1', date: '2025-09-01',
    exercises: [{ exerciseId: 'ex-1', sets: [{ reps: 5, weightKg: 60 }] }],
  },
  {
    id: 'e4', planId: 'p1', date: '2024-01-01',
    exercises: [{ exerciseId: 'ex-1', sets: [{ reps: 5, weightKg: 50 }] }],
  },
  {
    id: 'e5', planId: 'p1', date: '2026-06-02',
    exercises: [{ exerciseId: 'ex-2', sets: [{ reps: 10, weightKg: 40 }] }],
  },
]

describe('buildGraphData', () => {
  it('gibt leeres Array wenn keine Einheit die Übung enthält', () => {
    expect(buildGraphData(einheiten, 'ex-unbekannt', 'year', REF)).toEqual([])
  })

  it('Y-Wert ist das Gewicht des ersten Satzes', () => {
    const result = buildGraphData(einheiten, 'ex-1', 'year', REF)
    expect(result.find(p => p.date === '2026-06-01')?.weightKg).toBe(80)
  })

  it('sortiert aufsteigend nach Datum', () => {
    const result = buildGraphData(einheiten, 'ex-1', 'year', REF)
    const dates = result.map(p => p.date)
    expect(dates).toEqual([...dates].sort())
  })

  it('Woche-Spanne: nur letzte 7 Tage', () => {
    const result = buildGraphData(einheiten, 'ex-1', 'week', REF)
    expect(result.every(p => p.date >= '2026-05-28')).toBe(true)
    expect(result.map(p => p.date)).toContain('2026-06-01')
    expect(result.map(p => p.date)).not.toContain('2026-05-01')
  })

  it('Monat-Spanne: nur letzte 30 Tage', () => {
    const result = buildGraphData(einheiten, 'ex-1', 'month', REF)
    expect(result.map(p => p.date)).toContain('2026-05-20')
    expect(result.map(p => p.date)).not.toContain('2025-09-01')
  })

  it('Jahr-Spanne: nur letzte 365 Tage', () => {
    const result = buildGraphData(einheiten, 'ex-1', 'year', REF)
    expect(result.map(p => p.date)).toContain('2025-09-01')
    expect(result.map(p => p.date)).not.toContain('2024-01-01')
  })

  it('filtert auf die angegebene Übung', () => {
    const result = buildGraphData(einheiten, 'ex-1', 'year', REF)
    expect(result.every(p => p.weightKg !== 40)).toBe(true)
  })
})
