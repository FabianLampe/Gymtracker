import type { CompletedExercise, CompletedSet, Einheit, Plan, PlanExercise } from '../db/types'

export function buildPrefillFromPlan(plan: Plan): CompletedExercise[] {
  return [...plan.exercises]
    .sort((a, b) => a.order - b.order)
    .map(pe => ({
      exerciseId: pe.exerciseId,
      sets: buildStartSets(pe),
    }))
}

function buildStartSets(pe: PlanExercise): CompletedSet[] {
  return Array.from({ length: Math.max(0, pe.sets) }, () => ({
    reps: pe.startReps,
    weightKg: pe.startWeightKg,
  }))
}

// Satzzahl des Plans gewinnt: wurde sie im Plan-Editor geändert, gilt die neue
// Zahl auch dann, wenn die letzte Einheit anders viele Sätze hatte. Zusätzliche
// Sätze übernehmen die Werte des letzten Satzes der letzten Einheit.
function fitSetsToPlan(lastSets: CompletedSet[], pe: PlanExercise): CompletedSet[] {
  const target = Math.max(0, pe.sets)
  if (lastSets.length === 0) return buildStartSets(pe)
  return Array.from({ length: target }, (_, i) => ({
    ...(lastSets[i] ?? lastSets[lastSets.length - 1]),
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
        return { exerciseId: pe.exerciseId, sets: fitSetsToPlan(lastEx.sets, pe) }
      }
      return { exerciseId: pe.exerciseId, sets: buildStartSets(pe) }
    })
}

// Neueste zuerst. Bei gleichem Datum entscheidet createdAt, sonst die ID —
// so ist die Reihenfolge stabil und nicht von der DB-Lesereihenfolge abhängig.
export function compareEinheitenNewestFirst(a: Einheit, b: Einheit): number {
  const byDate = b.date.localeCompare(a.date)
  if (byDate !== 0) return byDate
  const byCreated = (b.createdAt ?? '').localeCompare(a.createdAt ?? '')
  if (byCreated !== 0) return byCreated
  return b.id.localeCompare(a.id)
}

export function sortEinheitenNewestFirst(einheiten: Einheit[]): Einheit[] {
  return [...einheiten].sort(compareEinheitenNewestFirst)
}

export function lastEinheitForPlan(einheiten: Einheit[], planId: string): Einheit | undefined {
  return sortEinheitenNewestFirst(einheiten.filter(e => e.planId === planId))[0]
}

export function createEinheit(
  planId: string,
  exercises: CompletedExercise[],
  date: string,
  createdAt: string = new Date().toISOString(),
): Einheit {
  return { id: crypto.randomUUID(), planId, date, createdAt, exercises }
}
