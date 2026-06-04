import type { Exercise } from '../db/types'
import type { Repository } from '../db/repository'
import { SEED_EXERCISES } from './seedData'

export function createExercise(name: string, muscleGroup: string): Exercise {
  return {
    id: crypto.randomUUID(),
    name: name.trim(),
    muscleGroup: muscleGroup.trim(),
    source: 'custom',
    defaultRestSeconds: 90,
  }
}

export function seedExercises(): Exercise[] {
  return SEED_EXERCISES
}

export async function seedIfEmpty(repo: Repository): Promise<void> {
  const existing = await repo.getExercises()
  if (existing.length > 0) return
  for (const exercise of SEED_EXERCISES) {
    await repo.saveExercise(exercise)
  }
}
