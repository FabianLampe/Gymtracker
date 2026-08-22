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
  // Übungen, die im Plan schon vorkommen — werden als „schon im Plan" markiert
  // und sind nicht wählbar (eine Übung darf pro Plan nur einmal stehen).
  usedIds?: string[]
  onSelect: (exerciseId: string) => void
  onClose: () => void
}

export function ExercisePicker({ exercises, usedIds = [], onSelect, onClose }: Props) {
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
  const usedSet = new Set(usedIds)

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

  function cancelCreate() {
    setCreating(false)
    setNewName('')
    setNewGroup('')
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

      {/* Scrollbare Liste */}
      <div className={styles.list}>
        {groups.map(group => (
          <div key={group}>
            <p className={styles.groupTitle}>{group}</p>
            {grouped[group].map(ex => {
              const used = usedSet.has(ex.id)
              return (
                <button
                  key={ex.id}
                  className={styles.exerciseButton}
                  onClick={() => onSelect(ex.id)}
                  disabled={used}
                  style={used ? { opacity: 0.4 } : undefined}
                >
                  {ex.name}{used ? ' · schon im Plan' : ''}
                </button>
              )
            })}
          </div>
        ))}
        <div style={{ height: '1rem' }} />
      </div>

      {/* Fixe Fußleiste — immer sichtbar */}
      <div className={styles.footer}>
        {!creating ? (
          <button
            className={styles.createButton}
            onClick={() => setCreating(true)}
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
              onKeyDown={e => e.key === 'Escape' && cancelCreate()}
            />
            <input
              className={styles.createInput}
              value={newGroup}
              onChange={e => setNewGroup(e.target.value)}
              placeholder="Muskelgruppe"
              list="picker-groups"
              onKeyDown={e => {
                if (e.key === 'Enter') handleCreate()
                if (e.key === 'Escape') cancelCreate()
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
              <button className={styles.createCancel} onClick={cancelCreate}>
                Abbrechen
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
