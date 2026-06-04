import { useState, useEffect } from 'react'
import { indexedDbRepository } from '../db/indexeddb'
import type { Einheit, Exercise, Plan } from '../db/types'
import styles from './HistoryScreen.module.css'

function formatDate(iso: string): string {
  const [year, month, day] = iso.split('-')
  return `${day}.${month}.${year}`
}

function setsSummary(sets: { reps: number; weightKg: number }[]): string {
  if (sets.length === 0) return '—'
  return `${sets.length} × ${sets[0].weightKg} kg`
}

interface Props {
  onEditEinheit: (einheitId: string) => void
}

export function HistoryScreen({ onEditEinheit }: Props) {
  const [einheiten, setEinheiten] = useState<Einheit[]>([])
  const [plans, setPlans] = useState<Plan[]>([])
  const [catalog, setCatalog] = useState<Exercise[]>([])
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      indexedDbRepository.getEinheiten(),
      indexedDbRepository.getPlans(),
      indexedDbRepository.getExercises(),
    ]).then(([e, p, c]) => {
      setEinheiten([...e].sort((a, b) => b.date.localeCompare(a.date)))
      setPlans(p)
      setCatalog(c)
    })
  }, [])

  async function handleDelete(id: string) {
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id)
      return
    }
    await indexedDbRepository.deleteEinheit(id)
    setEinheiten(prev => prev.filter(e => e.id !== id))
    setConfirmDeleteId(null)
  }

  function planName(id: string) {
    return plans.find(p => p.id === id)?.name ?? '—'
  }

  function exerciseName(id: string) {
    return catalog.find(e => e.id === id)?.name ?? id
  }

  return (
    <div className={styles.container} onClick={() => setConfirmDeleteId(null)}>
      <h1 className={styles.title}>Verlauf</h1>

      {einheiten.length === 0 && (
        <p className={styles.empty}>
          Noch kein Training abgeschlossen.<br />
          Starte ein Training über deine Pläne.
        </p>
      )}

      {einheiten.map(einheit => (
        <div key={einheit.id} className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.planName}>{planName(einheit.planId)}</span>
            <div className={styles.cardActions} onClick={e => e.stopPropagation()}>
              <span className={styles.date}>{formatDate(einheit.date)}</span>
              <button
                className={styles.iconButton}
                onClick={() => onEditEinheit(einheit.id)}
                aria-label="Bearbeiten"
              >✎</button>
              <button
                className={`${styles.iconButton} ${confirmDeleteId === einheit.id ? styles.deleteConfirm : ''}`}
                onClick={() => handleDelete(einheit.id)}
                aria-label="Löschen"
              >
                {confirmDeleteId === einheit.id ? 'Sicher?' : '🗑'}
              </button>
            </div>
          </div>
          {einheit.exercises.map(ex => (
            <div key={ex.exerciseId} className={styles.exerciseRow}>
              <span className={styles.exerciseRowName}>{exerciseName(ex.exerciseId)}</span>
              <span className={styles.exerciseRowSummary}>{setsSummary(ex.sets)}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
