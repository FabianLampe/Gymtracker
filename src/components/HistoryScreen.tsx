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
  const topWeight = sets[0].weightKg
  return `${sets.length} × ${topWeight} kg`
}

interface Props {
  onEditEinheit: (einheitId: string) => void
}

export function HistoryScreen({ onEditEinheit }: Props) {
  const [einheiten, setEinheiten] = useState<Einheit[]>([])
  const [plans, setPlans] = useState<Plan[]>([])
  const [catalog, setCatalog] = useState<Exercise[]>([])

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

  function planName(id: string) {
    return plans.find(p => p.id === id)?.name ?? '—'
  }

  function exerciseName(id: string) {
    return catalog.find(e => e.id === id)?.name ?? id
  }

  return (
    <div className={styles.container}>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className={styles.date}>{formatDate(einheit.date)}</span>
              <button
                onClick={() => onEditEinheit(einheit.id)}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.9rem', padding: '0.1rem 0.25rem' }}
                aria-label="Einheit bearbeiten"
              >✎</button>
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
