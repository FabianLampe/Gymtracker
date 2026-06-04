import { describe, it, expect, beforeEach } from 'vitest'
import { InMemoryRepository } from '../in-memory'
import type { Exercise, Plan, Einheit } from '../types'

describe('InMemoryRepository — Repository-Vertrag', () => {
  let repo: InMemoryRepository

  beforeEach(() => {
    repo = new InMemoryRepository()
  })

  it('speichert und liest eine Übung', async () => {
    const exercise: Exercise = {
      id: 'ex-1',
      name: 'Bankdrücken',
      muscleGroup: 'Brust',
      source: 'seeded',
      defaultRestSeconds: 180,
    }
    await repo.saveExercise(exercise)
    expect(await repo.getExercises()).toEqual([exercise])
  })

  it('löscht eine Übung', async () => {
    const exercise: Exercise = { id: 'ex-2', name: 'Kniebeuge', muscleGroup: 'Beine', source: 'seeded', defaultRestSeconds: 180 }
    await repo.saveExercise(exercise)
    await repo.deleteExercise('ex-2')
    expect(await repo.getExercises()).toEqual([])
  })

  it('speichert und liest einen Plan', async () => {
    const plan: Plan = { id: 'plan-1', name: 'Push', exercises: [] }
    await repo.savePlan(plan)
    expect(await repo.getPlans()).toEqual([plan])
  })

  it('löscht einen Plan', async () => {
    const plan: Plan = { id: 'plan-2', name: 'Pull', exercises: [] }
    await repo.savePlan(plan)
    await repo.deletePlan('plan-2')
    expect(await repo.getPlans()).toEqual([])
  })

  it('speichert und liest eine Einheit', async () => {
    const einheit: Einheit = {
      id: 'e-1',
      planId: 'plan-1',
      date: '2026-06-04',
      exercises: [],
    }
    await repo.saveEinheit(einheit)
    expect(await repo.getEinheiten()).toEqual([einheit])
  })

  it('aktualisiert eine Einheit (Korrektur)', async () => {
    const original: Einheit = { id: 'e-2', planId: 'p-1', date: '2026-06-01', exercises: [] }
    await repo.saveEinheit(original)
    const corrected: Einheit = {
      ...original,
      exercises: [{ exerciseId: 'ex-1', sets: [{ reps: 5, weightKg: 80 }] }],
    }
    await repo.updateEinheit(corrected)
    expect(await repo.getEinheiten()).toEqual([corrected])
  })

  it('löscht eine Einheit', async () => {
    const einheit: Einheit = { id: 'e-3', planId: 'p-1', date: '2026-06-04', exercises: [] }
    await repo.saveEinheit(einheit)
    await repo.deleteEinheit('e-3')
    expect(await repo.getEinheiten()).toEqual([])
  })

  it('gibt leere Arrays zurück wenn nichts gespeichert ist', async () => {
    expect(await repo.getExercises()).toEqual([])
    expect(await repo.getPlans()).toEqual([])
    expect(await repo.getEinheiten()).toEqual([])
  })
})
