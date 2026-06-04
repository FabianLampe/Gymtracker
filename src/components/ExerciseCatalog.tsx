import { useState, useEffect } from 'react'
import { indexedDbRepository } from '../db/indexeddb'
import { createExercise } from '../exercises/exercise'
import type { Exercise } from '../db/types'
import styles from './ExerciseCatalog.module.css'

const GROUP_ORDER = ['Brust', 'Rücken', 'Schultern', 'Bizeps', 'Trizeps', 'Beine', 'Bauch']

const MUSCLE_COLORS: Record<string, string> = {
  'Brust': '#ef4444', 'Rücken': '#3b82f6', 'Schultern': '#f59e0b',
  'Bizeps': '#8b5cf6', 'Trizeps': '#ec4899', 'Beine': '#22c55e', 'Bauch': '#06b6d4',
}

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
  onViewProgression: (exerciseId: string) => void
}

export function ExerciseCatalog({ onViewProgression }: Props) {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [search, setSearch] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [newGroup, setNewGroup] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  useEffect(() => {
    indexedDbRepository.getExercises().then(setExercises)
  }, [])

  const filtered = search.trim()
    ? exercises.filter(e =>
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.muscleGroup.toLowerCase().includes(search.toLowerCase())
      )
    : exercises

  const grouped = filtered.reduce<Record<string, Exercise[]>>((acc, ex) => {
    if (!acc[ex.muscleGroup]) acc[ex.muscleGroup] = []
    acc[ex.muscleGroup].push(ex)
    return acc
  }, {})

  const groups = sortedGroups(Object.keys(grouped))

  const existingGroups = [...new Set(exercises.map(e => e.muscleGroup))]

  async function handleAdd() {
    const name = newName.trim()
    const group = newGroup.trim()
    if (!name || !group) return
    const ex = createExercise(name, group)
    await indexedDbRepository.saveExercise(ex)
    setExercises(prev => [...prev, ex])
    setNewName('')
    setNewGroup('')
    setIsAdding(false)
  }

  async function handleRename(id: string) {
    const name = editName.trim()
    if (!name) return
    const ex = exercises.find(e => e.id === id)
    if (!ex) return
    const updated: Exercise = { ...ex, name }
    await indexedDbRepository.saveExercise(updated)
    setExercises(prev => prev.map(e => e.id === id ? updated : e))
    setEditingId(null)
  }

  async function handleDelete(id: string) {
    await indexedDbRepository.deleteExercise(id)
    setExercises(prev => prev.filter(e => e.id !== id))
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Übungen</h1>
        <button
          className={styles.addButton}
          onClick={() => setIsAdding(true)}
          aria-label="Übung hinzufügen"
        >
          +
        </button>
      </header>

      <input
        className={styles.searchInput}
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Suchen …"
      />

      {isAdding && (
        <div className={styles.addForm}>
          <input
            className={styles.input}
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="Name der Übung"
            autoFocus
            list="group-suggestions"
          />
          <input
            className={styles.input}
            value={newGroup}
            onChange={e => setNewGroup(e.target.value)}
            placeholder="Muskelgruppe (z. B. Brust)"
            list="group-suggestions"
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
          />
          <datalist id="group-suggestions">
            {existingGroups.map(g => <option key={g} value={g} />)}
          </datalist>
          <div className={styles.addFormRow}>
            <button className={styles.confirmButton} onClick={handleAdd}>Hinzufügen</button>
            <button className={styles.cancelButton} onClick={() => { setIsAdding(false); setNewName(''); setNewGroup('') }}>Abbrechen</button>
          </div>
        </div>
      )}

      {filtered.length === 0 && !isAdding && (
        <p className={styles.empty}>
          {search ? 'Keine Übung gefunden.' : 'Keine Übungen vorhanden.'}
        </p>
      )}

      {groups.map(group => (
        <div key={group} className={styles.group}>
          <p className={styles.groupTitle}>{group}</p>
          <ul className={styles.list}>
            {grouped[group].map(ex => (
              <li key={ex.id} className={styles.item}>
                {editingId === ex.id ? (
                  <div className={styles.inlineEdit}>
                    <input
                      className={styles.input}
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleRename(ex.id)
                        if (e.key === 'Escape') setEditingId(null)
                      }}
                      autoFocus
                    />
                    <button className={styles.confirmButton} onClick={() => handleRename(ex.id)}>✓</button>
                    <button className={styles.cancelButton} onClick={() => setEditingId(null)}>✕</button>
                  </div>
                ) : (
                  <>
                    <div
                      className={styles.exerciseNameRow}
                      onClick={() => onViewProgression(ex.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <span
                        className={styles.muscleGroupDot}
                        style={{ background: MUSCLE_COLORS[ex.muscleGroup] ?? '#64748b' }}
                      />
                      <span className={styles.exerciseName}>{ex.name} ›</span>
                    </div>
                    {ex.source === 'custom' ? (
                      <div className={styles.actions}>
                        <button
                          className={styles.iconButton}
                          onClick={() => { setEditingId(ex.id); setEditName(ex.name) }}
                          aria-label={`${ex.name} umbenennen`}
                        >✎</button>
                        <button
                          className={styles.iconButton}
                          onClick={() => handleDelete(ex.id)}
                          aria-label={`${ex.name} löschen`}
                        >✕</button>
                      </div>
                    ) : (
                      <span className={styles.seededBadge}>Standard</span>
                    )}
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
