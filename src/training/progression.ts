import type { CompletedSet, Einheit } from '../db/types'

// Satzpause je nach Wiederholungsbereich (Schoenfeld et al. 2016 / de Salles et al. 2009).
//
// Hinweis zur Formel: Über die Epley-Schätzung e1RM = Gewicht × (1 + Wdh / 30)
// ist die relative Intensität Gewicht / e1RM = 1 / (1 + Wdh / 30) — sie hängt
// also **nur von den Wiederholungen** ab, nicht vom Gewicht. Der Parameter
// weightKg unterscheidet daher nur Körpergewichts-Übungen (< 5 kg Zusatzgewicht)
// von Hantel-/Maschinen-Übungen; innerhalb einer Kategorie ändert er nichts.
//
// Diese Funktion ist nur der **Fallback**: Hat die Übung im Plan eine Pause
// hinterlegt, gilt diese (siehe TrainingScreen).
//   ≥ 90 %  → 300 s (maximale Kraft, 1-3 Wdh)
//   ≥ 80 %  → 180 s (Kraft / Hypertrophie, 4-7 Wdh)
//   ≥ 70 %  → 120 s (Hypertrophie, 8-12 Wdh)
//   ≥ 60 %  →  90 s (Hypertrophie / Ausdauer, 13-20 Wdh)
//   < 60 %  →  60 s (Kraft-Ausdauer, 21+ Wdh)
export function computeRestFromSet(reps: number, weightKg: number): number {
  // Körpergewichts-Übungen (< 5 kg Zusatzgewicht): eigene Wdh-Staffelung
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

// Gewichte sind Gleitkommazahlen (2,5-kg-Schritte) — Vergleich mit Toleranz.
const WEIGHT_EPSILON = 0.001

function sameWeight(a: number, b: number): boolean {
  return Math.abs(a - b) < WEIGHT_EPSILON
}

// Doppelte Progression (Top-Satz-Variante):
// Erreicht der erste Satz die Zielwiederholungen in zwei aufeinanderfolgenden
// Einheiten **auf dem aktuellen Arbeitsgewicht**, gibt es einen Vorschlag.
// Die Bindung ans Arbeitsgewicht setzt die Serie nach einer Steigerung (oder
// einem Deload) zurück — sonst würde nach einer einzigen guten Einheit auf dem
// neuen Gewicht sofort wieder gesteigert.
export function computeProgressionSuggestion(
  recentFirstSets: CompletedSet[],
  targetReps: number,
  currentWeightKg: number,
  stepWeightKg: number,
): ProgressionSuggestion | null {
  if (recentFirstSets.length < 2) return null
  const [newest, previous] = recentFirstSets
  if (!sameWeight(newest.weightKg, currentWeightKg)) return null
  if (!sameWeight(previous.weightKg, currentWeightKg)) return null
  if (newest.reps >= targetReps && previous.reps >= targetReps) {
    return { newWeightKg: currentWeightKg + stepWeightKg }
  }
  return null
}

export function getFirstSetForExercise(
  einheit: Einheit,
  exerciseId: string,
): CompletedSet | null {
  const ex = einheit.exercises.find(e => e.exerciseId === exerciseId)
  if (!ex || ex.sets.length === 0) return null
  return { ...ex.sets[0] }
}

export function getFirstSetRepsForExercise(
  einheit: Einheit,
  exerciseId: string,
): number | null {
  return getFirstSetForExercise(einheit, exerciseId)?.reps ?? null
}
