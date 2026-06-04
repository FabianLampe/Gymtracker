// Übung — Eintrag im Übungskatalog, stabile Identität über Pläne/Einheiten
export interface Exercise {
  id: string
  name: string
  muscleGroup: string
  source: 'seeded' | 'custom'
}

// Plan-Übung — Einstellungen je Übung pro Plan (gleiche Übung, andere Werte in anderem Plan möglich)
export interface PlanExercise {
  exerciseId: string
  order: number
  targetReps: number    // Zielwiederholungen
  sets: number          // Satzzahl
  stepWeightKg: number  // Schrittweite (Default 2.5)
  startWeightKg: number
  startReps: number
}

// Plan — lebende Liste, Edits überschreiben ihn
export interface Plan {
  id: string
  name: string
  exercises: PlanExercise[]
}

// Satz — Wdh × Gewicht, pro Satz frei (Back-off erlaubt)
export interface CompletedSet {
  reps: number
  weightKg: number
}

// Absolvierte Übung innerhalb einer Einheit
export interface CompletedExercise {
  exerciseId: string
  sets: CompletedSet[]
}

// Einheit — datierter, unveränderlicher Verlaufseintrag (nach Abschluss fix, korrigierbar via updateEinheit)
export interface Einheit {
  id: string
  planId: string
  date: string // ISO-8601 Datum, z. B. "2026-06-04"
  exercises: CompletedExercise[]
}

// Vollständiger App-Zustand für Export/Import (ADR 0002)
export interface AppState {
  version: number
  exercises: Exercise[]
  plans: Plan[]
  einheiten: Einheit[]
}
