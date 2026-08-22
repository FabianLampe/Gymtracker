import type { CompletedExercise } from '../db/types'

// Beim Beenden: Sätze ohne Wiederholungen zählen nicht als absolviert (z. B. ein
// geleertes Feld). Gewicht 0 bleibt gültig — Körpergewichts-Übungen ohne Zusatz.
// Übungen ohne verbleibende Sätze fallen ganz aus der Einheit.
export function stripEmptySets(exercises: CompletedExercise[]): CompletedExercise[] {
  return exercises
    .map(ex => ({ ...ex, sets: ex.sets.filter(s => s.reps > 0) }))
    .filter(ex => ex.sets.length > 0)
}

export function addSetToTraining(
  exercises: CompletedExercise[],
  exIdx: number,
): CompletedExercise[] {
  return exercises.map((ex, i) => {
    if (i !== exIdx) return ex
    const lastSet = ex.sets[ex.sets.length - 1] ?? { reps: 10, weightKg: 20 }
    return { ...ex, sets: [...ex.sets, { ...lastSet }] }
  })
}

export function removeSetFromTraining(
  exercises: CompletedExercise[],
  exIdx: number,
  setIdx: number,
): CompletedExercise[] {
  return exercises.map((ex, i) => {
    if (i !== exIdx) return ex
    if (ex.sets.length <= 1) return ex
    return { ...ex, sets: ex.sets.filter((_, si) => si !== setIdx) }
  })
}

// Eingabe-Rohtexte sind mit `${exIdx}-${setIdx}-${field}` verschlüsselt.
// Nach dem Entfernen eines Satzes rücken höhere Satz-Indizes nach.
export function reindexRawInputsAfterRemove(
  rawInputs: Record<string, string>,
  exIdx: number,
  setIdx: number,
): Record<string, string> {
  const next: Record<string, string> = {}
  for (const [key, val] of Object.entries(rawInputs)) {
    const [ei, si, field] = key.split('-')
    const e = Number(ei)
    const s = Number(si)
    if (e !== exIdx) { next[key] = val; continue }
    if (s === setIdx) continue
    next[`${e}-${s > setIdx ? s - 1 : s}-${field}`] = val
  }
  return next
}

// Fertig-Markierungen sind mit `${exIdx}-${setIdx}` verschlüsselt.
export function reindexDoneSetsAfterRemove(
  doneSets: Set<string>,
  exIdx: number,
  setIdx: number,
): Set<string> {
  const next = new Set<string>()
  for (const key of doneSets) {
    const [e, s] = key.split('-').map(Number)
    if (e !== exIdx) { next.add(key); continue }
    if (s === setIdx) continue
    next.add(`${e}-${s > setIdx ? s - 1 : s}`)
  }
  return next
}
