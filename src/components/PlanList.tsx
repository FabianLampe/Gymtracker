import { useState, useEffect, useRef } from 'react'
import { indexedDbRepository } from '../db/indexeddb'
import { createPlan } from '../plans/plan'
import type { Plan } from '../db/types'
import { Logo } from './Logo'
import styles from './PlanList.module.css'

interface Props {
  onOpenPlan: (planId: string) => void
  onOpenSettings: () => void
}

export function PlanList({ onOpenPlan, onOpenSettings }: Props) {
  const [plans, setPlans] = useState<Plan[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const addInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    indexedDbRepository.getPlans().then(setPlans)
  }, [])

  useEffect(() => {
    if (isAdding) addInputRef.current?.focus()
  }, [isAdding])

  async function handleAdd() {
    const trimmed = newName.trim()
    if (!trimmed) return
    const plan = createPlan(trimmed)
    await indexedDbRepository.savePlan(plan)
    setPlans(prev => [...prev, plan])
    setNewName('')
    setIsAdding(false)
  }

  async function handleRename(id: string) {
    const trimmed = editName.trim()
    if (!trimmed) return
    const plan = plans.find(p => p.id === id)
    if (!plan) return
    const updated: Plan = { ...plan, name: trimmed }
    await indexedDbRepository.savePlan(updated)
    setPlans(prev => prev.map(p => p.id === id ? updated : p))
    setEditingId(null)
  }

  // Zwei Schritte: ein Fehltipp darf keinen Plan mitsamt seiner Historie-Zuordnung kosten.
  async function handleDelete(id: string) {
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id)
      return
    }
    await indexedDbRepository.deletePlan(id)
    setPlans(prev => prev.filter(p => p.id !== id))
    setConfirmDeleteId(null)
  }

  function startEditing(plan: Plan) {
    setEditingId(plan.id)
    setEditName(plan.name)
  }

  function cancelAdding() {
    setIsAdding(false)
    setNewName('')
  }

  return (
    <div className={styles.container} onClick={() => setConfirmDeleteId(null)}>
      <div className={styles.appHeader}>
        <Logo size={34} />
        <span className={styles.appName}>Gymtracker</span>
        <button className={styles.settingsButton} onClick={onOpenSettings} aria-label="Einstellungen">⚙</button>
      </div>

      <header className={styles.header}>
        <span className={styles.title}>Meine Pläne</span>
        <button
          className={styles.addButton}
          onClick={() => setIsAdding(true)}
          aria-label="Plan hinzufügen"
        >
          +
        </button>
      </header>

      {isAdding && (
        <div className={styles.inputRow}>
          <input
            ref={addInputRef}
            className={styles.input}
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleAdd()
              if (e.key === 'Escape') cancelAdding()
            }}
            placeholder="Planname …"
          />
          <button className={styles.confirmButton} onClick={handleAdd}>✓</button>
          <button className={styles.cancelButton} onClick={cancelAdding}>✕</button>
        </div>
      )}

      {plans.length === 0 && !isAdding && (
        <p className={styles.empty}>
          Noch kein Plan vorhanden.<br />
          Tippe auf + um loszulegen.
        </p>
      )}

      <ul className={styles.list}>
        {plans.map(plan => (
          <li key={plan.id} className={styles.item}>
            {editingId === plan.id ? (
              <div className={styles.inputRow} style={{ flex: 1 }}>
                <input
                  className={styles.input}
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleRename(plan.id)
                    if (e.key === 'Escape') setEditingId(null)
                  }}
                  autoFocus
                />
                <button className={styles.confirmButton} onClick={() => handleRename(plan.id)}>✓</button>
                <button className={styles.cancelButton} onClick={() => setEditingId(null)}>✕</button>
              </div>
            ) : (
              <>
                <span
                  className={styles.planName}
                  onClick={() => onOpenPlan(plan.id)}
                  style={{ cursor: 'pointer' }}
                >
                  {plan.name} ›
                </span>
                <div className={styles.actions} onClick={e => e.stopPropagation()}>
                  <button
                    className={styles.iconButton}
                    onClick={() => startEditing(plan)}
                    aria-label={`${plan.name} umbenennen`}
                  >
                    ✎
                  </button>
                  <button
                    className={`${styles.iconButton} ${confirmDeleteId === plan.id ? styles.deleteConfirm : ''}`}
                    onClick={() => handleDelete(plan.id)}
                    aria-label={`${plan.name} löschen`}
                  >
                    {confirmDeleteId === plan.id ? 'Sicher?' : '✕'}
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
