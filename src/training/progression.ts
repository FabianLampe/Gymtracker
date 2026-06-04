import type { Einheit } from '../db/types'

// Schoenfeld et al. (2016) / de Salles et al. (2009):
// Optimale Satzpause ergibt sich aus der relativen Intensität (% 1RM).
// 1RM-Schätzung via Epley: e1RM = Gewicht × (1 + Wdh / 30)
// Intensität = Gewicht / e1RM
//   ≥ 90 %  → 300 s (maximale Kraft, 1-2 Wdh)
//   ≥ 80 %  → 180 s (Kraft / Hypertrophie, 3-5 Wdh)
//   ≥ 70 %  → 120 s (Hypertrophie, 6-9 Wdh)
//   ≥ 60 %  →  90 s (Hypertrophie / Ausdauer, 10-15 Wdh)
//   < 60 %  →  60 s (Kraft-Ausdauer, 15+ Wdh)
export function computeRestFromSet(reps: number, weightKg: number): number {
  // Körpergewichts-Übungen (< 5 kg Zusatzgewicht): Wdh als Fallback
  if (weightKg < 5) {
    if (reps <= 5)  return 180
    if (reps <= 10) return 120
    if (reps <= 15) return  90
    return 60
  }

  const e1RM = reps === 1 ? weightKg : weightKg * (1 + reps / 30)
  const intensity = weightKg / e1RM

  if (intensity >= 0.90) return 300
  if (intensity >= 0.80) return 180
  if (intensity >= 0.70) return 120
  if (intensity >= 0.60) return  90
  return 60
}

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
