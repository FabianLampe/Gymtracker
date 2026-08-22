import { useState, useEffect } from 'react'
import { indexedDbRepository } from '../db/indexeddb'
import { createExercise } from '../exercises/exercise'
import type { Einheit, Exercise, Plan } from '../db/types'
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
  const [plans, setPlans] = useState<Plan[]>([])
  const [einheiten, setEinheiten] = useState<Einheit[]>([])
  const [pendingDelete, setPendingDelete] = useState<{ id: string; msg: string } | null>(null)

  useEffect(() => {
    Promise.all([
      indexedDbRepository.getExercises(),
      indexedDbRepository.getPlans(),
      indexedDbRepository.getEinheiten(),
    ]).then(([exs, ps, es]) => {
      setExercises(exs)
      setPlans(ps)
      setEinheiten(es)
    })
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

  // Eine gelöschte Übung würde in Plänen und Einheiten als toter Verweis
  // zurückbleiben — deshalb erst nachsehen, wo sie verwendet wird, und
  // im Zweifel eine zweite Bestätigung verlangen.
  function usageOf(id: string): string | null {
    const inPlans = plans.filter(p => p.exercises.some(pe => pe.exerciseId === id)).length
    const inEinheiten = einheiten.filter(e => e.exercises.some(ex => ex.exerciseId === id)).length
    if (inPlans === 0 && inEinheiten === 0) return null
    const parts: string[] = []
    if (inPlans > 0) parts.push(`${inPlans} Plan${inPlans === 1 ? '' : 'en'}`)
    if (inEinheiten > 0) parts.push(`${inEinheiten} Einheit${inEinheiten === 1 ? '' : 'en'}`)
    return `Wird in ${parts.join(' und ')} verwendet. Wirklich löschen?`
  }

  async function handleDelete(id: string) {
    const usage = usageOf(id)
    if (usage && pendingDelete?.id !== id) {
      setPendingDelete({ id, msg: usage })
      return
    }
    // Aus allen Plänen entfernen, damit dort kein toter Verweis stehen bleibt.
    for (const plan of plans) {
      if (!plan.exercises.some(pe => pe.exerciseId === id)) continue
      const updated: Plan = {
        ...plan,
        exercises: plan.exercises.filter(pe => pe.exerciseId !== id).map((pe, i) => ({ ...pe, order: i })),
      }
      await indexedDbRepository.savePlan(updated)
      setPlans(prev => prev.map(p => p.id === plan.id ? updated : p))
    }
    await indexedDbRepository.deleteExercise(id)
    setExercises(prev => prev.filter(e => e.id !== id))
    setPendingDelete(null)
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

      {pendingDelete && (
        <p className={styles.deleteWarning}>{pendingDelete.msg}</p>
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
                        >{pendingDelete?.id === ex.id ? 'Sicher?' : '✕'}</button>
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
