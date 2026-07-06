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

// Nach 12 h gilt eine unterbrochene Session als verwaist und wird verworfen
const MAX_AGE_MS = 12 * 60 * 60 * 1000

export function loadSession(): SavedSession | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const session = JSON.parse(raw) as SavedSession
    if (!session.planId || Date.now() - session.savedAt > MAX_AGE_MS) {
      localStorage.removeItem(KEY)
      return null
    }
    return session
  } catch { return null }
}

export function clearSession(): void {
  localStorage.removeItem(KEY)
}
