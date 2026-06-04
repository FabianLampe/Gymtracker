import type { CompletedExercise } from '../db/types'

export function addSetToTraining(
  exercises: CompletedExercise[],
  exIdx: number,
): CompletedExercise[] {
  return exercises.map((ex, i) => {
    if (i !== exIdx) return ex
    const lastSet = ex.sets[ex.sets.length - 1] ?? { reps: 10, weightKg: 20 }
    return { ...ex, sets: [...ex.sets, { ...lastSet }] }
  })
}

export function removeSetFromTraining(
  exercises: CompletedExercise[],
  exIdx: number,
  setIdx: number,
): CompletedExercise[] {
  return exercises.map((ex, i) => {
    if (i !== exIdx) return ex
    if (ex.sets.length <= 1) return ex
    return { ...ex, sets: ex.sets.filter((_, si) => si !== setIdx) }
  })
}
