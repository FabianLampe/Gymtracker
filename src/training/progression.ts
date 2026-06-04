import type { Einheit } from '../db/types'

export interface ProgressionSuggestion {
  newWeightKg: number
}

export function computeProgressionSuggestion(
  recentFirstSetReps: number[],
  targetReps: number,
  currentWeightKg: number,
  stepWeightKg: number,
): ProgressionSuggestion | null {
  if (recentFirstSetReps.length < 2) return null
  if (recentFirstSetReps[0] >= targetReps && recentFirstSetReps[1] >= targetReps) {
    return { newWeightKg: currentWeightKg + stepWeightKg }
  }
  return null
}

export function getFirstSetRepsForExercise(
  einheit: Einheit,
  exerciseId: string,
): number | null {
  const ex = einheit.exercises.find(e => e.exerciseId === exerciseId)
  if (!ex || ex.sets.length === 0) return null
  return ex.sets[0].reps
}
