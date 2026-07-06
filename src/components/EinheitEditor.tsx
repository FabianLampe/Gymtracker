import { useState, useEffect } from 'react'
import { indexedDbRepository } from '../db/indexeddb'
import type { CompletedExercise, Einheit, Exercise } from '../db/types'
import styles from './EinheitEditor.module.css'

function formatDate(iso: string): string {
  const [year, month, day] = iso.split('-')
  return `${day}.${month}.${year}`
}

interface Props {
  einheitId: string
  onBack: () => void
}

export function EinheitEditor({ einheitId, onBack }: Props) {
  const [einheit, setEinheit] = useState<Einheit | null>(null)
  const [catalog, setCatalog] = useState<Exercise[]>([])
  const [exercises, setExercises] = useState<CompletedExercise[]>([])
  const [rawInputs, setRawInputs] = useState<Record<string, string>>({})

  useEffect(() => {
    Promise.all([
      indexedDbRepository.getEinheiten(),
      indexedDbRepository.getExercises(),
    ]).then(([es, exs]) => {
      const found = es.find(e => e.id === einheitId)
      if (!found) return
      setEinheit(found)
      setExercises(found.exercises.map(ex => ({ ...ex, sets: ex.sets.map(s => ({ ...s })) })))
      // Gespeicherte Werte in den Feldern anzeigen; Leeren eines Felds setzt auf 0
      const raws: Record<string, string> = {}
      found.exercises.forEach((ex, ei) => ex.sets.forEach((s, si) => {
        raws[`${ei}-${si}-reps`] = String(s.reps)
        raws[`${ei}-${si}-weightKg`] = String(s.weightKg)
      }))
      setRawInputs(raws)
      setCatalog(exs)
    })
  }, [einheitId])

  function updateSet(exIdx: number, setIdx: number, field: 'reps' | 'weightKg', raw: string) {
    setRawInputs(prev => ({ ...prev, [`${exIdx}-${setIdx}-${field}`]: raw }))
    const value = raw === '' ? 0 : parseFloat(raw)
    if (isNaN(value) || value < 0) return
    setExercises(prev =>
      prev.map((ex, ei) =>
        ei === exIdx
          ? { ...ex, sets: ex.sets.map((s, si) => si === setIdx ? { ...s, [field]: value } : s) }
          : ex,
      ),
    )
  }

  async function handleSave() {
    if (!einheit) return
    await indexedDbRepository.updateEinheit({ ...einheit, exercises })
    onBack()
  }

  function exerciseName(id: string) {
    return catalog.find(e => e.id === id)?.name ?? id
  }

  if (!einheit) return null

  return (
    <div className={styles.screen}>
      <header className={styles.header}>
        <button className={styles.backButton} onClick={onBack}>Abbrechen</button>
        <span className={styles.title}>{formatDate(einheit.date)}</span>
        <button className={styles.saveButton} onClick={handleSave}>Speichern</button>
      </header>

      <div className={styles.body}>
        {exercises.map((ex, exIdx) => (
          <div key={ex.exerciseId} className={styles.exerciseBlock}>
            <p className={styles.exerciseName}>{exerciseName(ex.exerciseId)}</p>
            {ex.sets.map((_, setIdx) => (
              <div key={setIdx} className={styles.setRow}>
                <span className={styles.setLabel}>Satz {setIdx + 1}</span>
                <input
                  className={styles.setInput}
                  type="number"
                  min={0}
                  value={rawInputs[`${exIdx}-${setIdx}-reps`] ?? ''}
                  onChange={e => updateSet(exIdx, setIdx, 'reps', e.target.value)}
                />
                <span className={styles.setSep}>Wdh ×</span>
                <input
                  className={styles.setInput}
                  type="number"
                  min={0}
                  step={0.5}
                  value={rawInputs[`${exIdx}-${setIdx}-weightKg`] ?? ''}
                  onChange={e => updateSet(exIdx, setIdx, 'weightKg', e.target.value)}
                />
                <span className={styles.setUnit}>kg</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
