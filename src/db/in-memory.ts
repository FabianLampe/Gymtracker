import type { Exercise, Einheit, Plan } from './types'
import type { Repository } from './repository'

// In-Memory-Fake — identisches Interface wie die IndexedDB-Implementierung, nur für Tests
export class InMemoryRepository implements Repository {
  private exercises = new Map<string, Exercise>()
  private plans = new Map<string, Plan>()
  private einheiten = new Map<string, Einheit>()

  async getExercises(): Promise<Exercise[]> {
    return [...this.exercises.values()]
  }

  async saveExercise(exercise: Exercise): Promise<void> {
    this.exercises.set(exercise.id, { ...exercise })
  }

  async deleteExercise(id: string): Promise<void> {
    this.exercises.delete(id)
  }

  async getPlans(): Promise<Plan[]> {
    return [...this.plans.values()]
  }

  async savePlan(plan: Plan): Promise<void> {
    this.plans.set(plan.id, { ...plan })
  }

  async deletePlan(id: string): Promise<void> {
    this.plans.delete(id)
  }

  async getEinheiten(): Promise<Einheit[]> {
    return [...this.einheiten.values()]
  }

  async saveEinheit(einheit: Einheit): Promise<void> {
    this.einheiten.set(einheit.id, { ...einheit })
  }

  async updateEinheit(einheit: Einheit): Promise<void> {
    this.einheiten.set(einheit.id, { ...einheit })
  }
}
