import { useState } from 'react'
import type { Exercise } from '../db/types'
import styles from './ExercisePicker.module.css'

const GROUP_ORDER = ['Brust', 'Rücken', 'Schultern', 'Bizeps', 'Trizeps', 'Beine', 'Bauch']

function sortedGroups(groups: string[]): string[] {
  return [...groups].sort((a, b) => {
    const ai = GROUP_ORDER.indexOf(a)
    const bi = GROUP_ORDER.indexOf(b)
    if (ai === -1 && bi === -1) return a.localeCompare(b)
    if (ai === -1) return 1
    if (bi === -1) return -1
    return ai - bi
  })
}

interface Props {
  exercises: Exercise[]
  onSelect: (exerciseId: string) => void
  onClose: () => void
}

export function ExercisePicker({ exercises, onSelect, onClose }: Props) {
  const [search, setSearch] = useState('')

  const filtered = search.trim()
    ? exercises.filter(e =>
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.muscleGroup.toLowerCase().includes(search.toLowerCase()),
      )
    : exercises

  const grouped = filtered.reduce<Record<string, Exercise[]>>((acc, ex) => {
    if (!acc[ex.muscleGroup]) acc[ex.muscleGroup] = []
    acc[ex.muscleGroup].push(ex)
    return acc
  }, {})

  const groups = sortedGroups(Object.keys(grouped))

  return (
    <div className={styles.overlay}>
      <header className={styles.header}>
        <button className={styles.backButton} onClick={onClose}>← Zurück</button>
        <span className={styles.title}>Übung wählen</span>
      </header>

      <input
        className={styles.searchInput}
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Suchen …"
        autoFocus
      />

      <div className={styles.list}>
        {groups.map(group => (
          <div key={group}>
            <p className={styles.groupTitle}>{group}</p>
            {grouped[group].map(ex => (
              <button
                key={ex.id}
                className={styles.exerciseButton}
                onClick={() => onSelect(ex.id)}
              >
                {ex.name}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
