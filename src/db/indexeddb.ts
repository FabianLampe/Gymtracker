import Dexie, { type Table } from 'dexie'
import type { Exercise, Plan, Einheit } from './types'
import type { Repository } from './repository'

class GymTrackerDB extends Dexie {
  exercises!: Table<Exercise, string>
  plans!: Table<Plan, string>
  einheiten!: Table<Einheit, string>

  constructor() {
    super('gymtracker')
    this.version(1).stores({
      exercises: 'id, muscleGroup, source',
      plans: 'id',
      einheiten: 'id, planId, date',
    })
  }
}

const db = new GymTrackerDB()

export const indexedDbRepository: Repository = {
  async getExercises() {
    return db.exercises.toArray()
  },
  async saveExercise(exercise) {
    await db.exercises.put(exercise)
  },
  async deleteExercise(id) {
    await db.exercises.delete(id)
  },

  async getPlans() {
    return db.plans.toArray()
  },
  async savePlan(plan) {
    await db.plans.put(plan)
  },
  async deletePlan(id) {
    await db.plans.delete(id)
  },

  async getEinheiten() {
    return db.einheiten.toArray()
  },
  async saveEinheit(einheit) {
    await db.einheiten.put(einheit)
  },
  async updateEinheit(einheit) {
    await db.einheiten.put(einheit)
  },
  async deleteEinheit(id) {
    await db.einheiten.delete(id)
  },
}
