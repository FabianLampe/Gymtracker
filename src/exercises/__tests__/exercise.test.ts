import { describe, it, expect, beforeEach } from 'vitest'
import { createExercise, seedIfEmpty, seedExercises } from '../exercise'
import { InMemoryRepository } from '../../db/in-memory'

describe('createExercise', () => {
  it('setzt Name und Muskelgruppe', () => {
    const ex = createExercise('Bankdrücken', 'Brust')
    expect(ex.name).toBe('Bankdrücken')
    expect(ex.muscleGroup).toBe('Brust')
  })

  it('source ist "custom"', () => {
    expect(createExercise('Test', 'Brust').source).toBe('custom')
  })

  it('entfernt Leerzeichen am Rand', () => {
    const ex = createExercise('  Kniebeuge  ', '  Beine  ')
    expect(ex.name).toBe('Kniebeuge')
    expect(ex.muscleGroup).toBe('Beine')
  })

  it('generiert jedes Mal eine eindeutige ID', () => {
    const a = createExercise('A', 'Brust')
    const b = createExercise('A', 'Brust')
    expect(a.id).not.toBe(b.id)
  })
})

describe('seedExercises', () => {
  it('gibt eine nicht-leere Liste zurück', () => {
    expect(seedExercises().length).toBeGreaterThan(0)
  })

  it('alle Seed-Übungen haben source "seeded"', () => {
    expect(seedExercises().every(e => e.source === 'seeded')).toBe(true)
  })

  it('alle Seed-Übungen haben nicht-leere Namen und IDs', () => {
    const exercises = seedExercises()
    expect(exercises.every(e => e.name.length > 0 && e.id.length > 0)).toBe(true)
  })

  it('enthält Übungen aus mehreren Muskelgruppen', () => {
    const groups = new Set(seedExercises().map(e => e.muscleGroup))
    expect(groups.size).toBeGreaterThanOrEqual(5)
  })

  it('IDs sind eindeutig (keine Duplikate in Seed-Daten)', () => {
    const ids = seedExercises().map(e => e.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('seedIfEmpty', () => {
  let repo: InMemoryRepository

  beforeEach(() => {
    repo = new InMemoryRepository()
  })

  it('befüllt leeren Katalog mit Seed-Übungen', async () => {
    await seedIfEmpty(repo)
    const exercises = await repo.getExercises()
    expect(exercises.length).toBe(seedExercises().length)
  })

  it('überschreibt nicht, wenn Übungen bereits vorhanden sind', async () => {
    const custom = createExercise('Meine Übung', 'Brust')
    await repo.saveExercise(custom)
    await seedIfEmpty(repo)
    const exercises = await repo.getExercises()
    expect(exercises.length).toBe(1)
    expect(exercises[0].id).toBe(custom.id)
  })
})
