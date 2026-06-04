import { useState } from 'react'
import { indexedDbRepository } from '../db/indexeddb'
import { createExercise } from '../exercises/exercise'
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
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [newGroup, setNewGroup] = useState('')
  const [localExercises, setLocalExercises] = useState(exercises)

  const filtered = search.trim()
    ? localExercises.filter(e =>
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.muscleGroup.toLowerCase().includes(search.toLowerCase()),
      )
    : localExercises

  const grouped = filtered.reduce<Record<string, Exercise[]>>((acc, ex) => {
    if (!acc[ex.muscleGroup]) acc[ex.muscleGroup] = []
    acc[ex.muscleGroup].push(ex)
    return acc
  }, {})

  const groups = sortedGroups(Object.keys(grouped))
  const existingGroups = [...new Set(localExercises.map(e => e.muscleGroup))]

  async function handleCreate() {
    const name = newName.trim()
    const group = newGroup.trim()
    if (!name || !group) return
    const ex = createExercise(name, group)
    await indexedDbRepository.saveExercise(ex)
    setLocalExercises(prev => [...prev, ex])
    setNewName('')
    setNewGroup('')
    setCreating(false)
    onSelect(ex.id)
  }

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
        autoFocus={!creating}
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

        {/* ── Neue Übung anlegen ──────────────────────────────────── */}
        {!creating ? (
          <button
            className={styles.createButton}
            onClick={() => { setCreating(true); setSearch('') }}
          >
            + Neue Übung anlegen
          </button>
        ) : (
          <div className={styles.createForm}>
            <p className={styles.createTitle}>Neue Übung</p>
            <input
              className={styles.createInput}
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Name der Übung"
              autoFocus
              onKeyDown={e => e.key === 'Escape' && setCreating(false)}
            />
            <input
              className={styles.createInput}
              value={newGroup}
              onChange={e => setNewGroup(e.target.value)}
              placeholder="Muskelgruppe"
              list="picker-groups"
              onKeyDown={e => {
                if (e.key === 'Enter') handleCreate()
                if (e.key === 'Escape') setCreating(false)
              }}
            />
            <datalist id="picker-groups">
              {existingGroups.map(g => <option key={g} value={g} />)}
            </datalist>
            <div className={styles.createActions}>
              <button
                className={styles.createConfirm}
                onClick={handleCreate}
                disabled={!newName.trim() || !newGroup.trim()}
              >
                ✓ Anlegen & hinzufügen
              </button>
              <button
                className={styles.createCancel}
                onClick={() => { setCreating(false); setNewName(''); setNewGroup('') }}
              >
                Abbrechen
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
