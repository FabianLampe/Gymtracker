import type { CompletedExercise, Einheit, Plan } from '../db/types'

export function buildPrefillFromPlan(plan: Plan): CompletedExercise[] {
  return [...plan.exercises]
    .sort((a, b) => a.order - b.order)
    .map(pe => ({
      exerciseId: pe.exerciseId,
      sets: Array.from({ length: pe.sets }, () => ({
        reps: pe.startReps,
        weightKg: pe.startWeightKg,
      })),
    }))
}

export function buildPrefillFromLastEinheit(
  plan: Plan,
  lastEinheit: Einheit,
): CompletedExercise[] {
  return [...plan.exercises]
    .sort((a, b) => a.order - b.order)
    .map(pe => {
      const lastEx = lastEinheit.exercises.find(e => e.exerciseId === pe.exerciseId)
      if (lastEx) {
        return { exerciseId: pe.exerciseId, sets: lastEx.sets.map(s => ({ ...s })) }
      }
      return {
        exerciseId: pe.exerciseId,
        sets: Array.from({ length: pe.sets }, () => ({
          reps: pe.startReps,
          weightKg: pe.startWeightKg,
        })),
      }
    })
}

export function lastEinheitForPlan(einheiten: Einheit[], planId: string): Einheit | undefined {
  return einheiten
    .filter(e => e.planId === planId)
    .sort((a, b) => b.date.localeCompare(a.date))[0]
}

export function createEinheit(
  planId: string,
  exercises: CompletedExercise[],
  date: string,
): Einheit {
  return { id: crypto.randomUUID(), planId, date, exercises }
}
