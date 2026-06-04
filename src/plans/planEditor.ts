import type { Plan, PlanExercise } from '../db/types'

export function createPlanExercise(
  exerciseId: string,
  order: number,
  options?: Partial<Omit<PlanExercise, 'exerciseId' | 'order'>>,
): PlanExercise {
  const targetReps = options?.targetReps ?? 10
  return {
    exerciseId,
    order,
    targetReps,
    sets: options?.sets ?? 3,
    stepWeightKg: options?.stepWeightKg ?? 2.5,
    startWeightKg: options?.startWeightKg ?? 20,
    startReps: options?.startReps ?? targetReps,
    restSeconds: options?.restSeconds ?? 90,
  }
}

export function addExerciseToPlan(plan: Plan, planExercise: PlanExercise): Plan {
  return { ...plan, exercises: [...plan.exercises, planExercise] }
}

export function removeExerciseFromPlan(plan: Plan, exerciseId: string): Plan {
  return {
    ...plan,
    exercises: plan.exercises
      .filter(e => e.exerciseId !== exerciseId)
      .map((e, i) => ({ ...e, order: i })),
  }
}

export function moveExerciseInPlan(plan: Plan, fromIndex: number, toIndex: number): Plan {
  const exs = [...plan.exercises]
  const clamped = Math.max(0, Math.min(exs.length - 1, toIndex))
  const [moved] = exs.splice(fromIndex, 1)
  exs.splice(clamped, 0, moved)
  return { ...plan, exercises: exs.map((e, i) => ({ ...e, order: i })) }
}

export function swapExerciseInPlan(
  plan: Plan,
  oldExerciseId: string,
  newExerciseId: string,
): Plan {
  return {
    ...plan,
    exercises: plan.exercises.map(pe =>
      pe.exerciseId === oldExerciseId ? { ...pe, exerciseId: newExerciseId } : pe,
    ),
  }
}

export function updatePlanExercise(
  plan: Plan,
  exerciseId: string,
  updates: Partial<Omit<PlanExercise, 'exerciseId' | 'order'>>,
): Plan {
  return {
    ...plan,
    exercises: plan.exercises.map(e =>
      e.exerciseId === exerciseId ? { ...e, ...updates } : e,
    ),
  }
}
