import type { AppState } from './types'

const CURRENT_VERSION = 1

export function exportState(state: AppState): string {
  return JSON.stringify({ ...state, version: CURRENT_VERSION }, null, 2)
}

export function importState(json: string): AppState | { error: string } {
  let parsed: unknown
  try {
    parsed = JSON.parse(json)
  } catch {
    return { error: 'Ungültiges JSON' }
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return { error: 'Ungültiges Format' }
  }
  const obj = parsed as Record<string, unknown>
  if (obj['version'] !== CURRENT_VERSION) {
    return { error: `Unbekannte Version: ${String(obj['version'])}` }
  }
  return parsed as AppState
}
