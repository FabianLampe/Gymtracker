import type { Exercise, Plan, Einheit } from './types'

// Port-Interface — Domänen-Module hängen nur hier, nicht an IndexedDB
export interface Repository {
  // Übungskatalog
  getExercises(): Promise<Exercise[]>
  saveExercise(exercise: Exercise): Promise<void>
  deleteExercise(id: string): Promise<void>

  // Pläne
  getPlans(): Promise<Plan[]>
  savePlan(plan: Plan): Promise<void>
  deletePlan(id: string): Promise<void>

  // Einheiten
  getEinheiten(): Promise<Einheit[]>
  saveEinheit(einheit: Einheit): Promise<void>
  updateEinheit(einheit: Einheit): Promise<void>
  deleteEinheit(id: string): Promise<void>
}
