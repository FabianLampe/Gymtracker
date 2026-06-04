import type { Plan } from '../db/types'

export function createPlan(name: string): Plan {
  return {
    id: crypto.randomUUID(),
    name: name.trim(),
    exercises: [],
  }
}
