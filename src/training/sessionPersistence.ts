import type { CompletedExercise } from '../db/types'

const KEY = 'gym_active_session'

export interface SavedSession {
  planId: string
  exercises: CompletedExercise[]
  doneSets: string[]
  rawInputs: Record<string, string>
  savedAt: number
}

export function saveSession(session: SavedSession): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(session))
  } catch { /* storage full */ }
}

export function loadSession(): SavedSession | null {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as SavedSession) : null
  } catch { return null }
}

export function clearSession(): void {
  localStorage.removeItem(KEY)
}
