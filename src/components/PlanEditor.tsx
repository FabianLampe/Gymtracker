import { useState, useEffect } from 'react'
import { indexedDbRepository } from '../db/indexeddb'
import {
  createPlanExercise,
  addExerciseToPlan,
  removeExerciseFromPlan,
  moveExerciseInPlan,
  updatePlanExercise,
} from '../plans/planEditor'
import type { Exercise, Plan, PlanExercise } from '../db/types'
import { ExercisePicker } from './ExercisePicker'
import styles from './PlanEditor.module.css'

interface Props {
  planId: string
  onBack: () => void
  onStartTraining: (planId: string) => void
}

export function PlanEditor({ planId, onBack, onStartTraining }: Props) {
  const [plan, setPlan] = useState<Plan | null>(null)
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [showPicker, setShowPicker] = useState(false)

  useEffect(() => {
    Promise.all([
      indexedDbRepository.getPlans(),
      indexedDbRepository.getExercises(),
    ]).then(([plans, exs]) => {
      setPlan(plans.find(p => p.id === planId) ?? null)
      setExercises(exs)
    })
  }, [planId])

  async function savePlan(updated: Plan) {
    await indexedDbRepository.savePlan(updated)
    setPlan(updated)
  }

  async function handleAddExercise(exerciseId: string) {
    if (!plan) return
    const ex = exercises.find(e => e.id === exerciseId)
    const pe = createPlanExercise(exerciseId, plan.exercises.length, {
      restSeconds: ex?.defaultRestSeconds ?? 90,
    })
    await savePlan(addExerciseToPlan(plan, pe))
    setShowPicker(false)
  }

  async function handleRemove(exerciseId: string) {
    if (!plan) return
    await savePlan(removeExerciseFromPlan(plan, exerciseId))
  }

  async function handleMove(index: number, direction: -1 | 1) {
    if (!plan) return
    await savePlan(moveExerciseInPlan(plan, index, index + direction))
  }

  async function handleSetting(
    exerciseId: string,
    field: keyof Omit<PlanExercise, 'exerciseId' | 'order'>,
    raw: string,
  ) {
    if (!plan) return
    const value = parseFloat(raw)
    if (isNaN(value) || value < 0) return
    await savePlan(updatePlanExercise(plan, exerciseId, { [field]: value }))
  }

  function exerciseName(id: string) {
    return exercises.find(e => e.id === id)?.name ?? id
  }

  if (!plan) return null

  return (
    <>
      {showPicker && (
        <ExercisePicker
          exercises={exercises}
          onSelect={handleAddExercise}
          onClose={() => setShowPicker(false)}
        />
      )}

      <div className={styles.container}>
        <header className={styles.header}>
          <button className={styles.backButton} onClick={onBack}>← Zurück</button>
          <h1 className={styles.title}>{plan.name}</h1>
          <button
            className={styles.startButton}
            onClick={() => onStartTraining(planId)}
            disabled={plan.exercises.length === 0}
          >
            ▶ Start
          </button>
          <button
            className={styles.addButton}
            onClick={() => setShowPicker(true)}
            aria-label="Übung hinzufügen"
          >
            +
          </button>
        </header>

        {plan.exercises.length === 0 && (
          <p className={styles.empty}>
            Noch keine Übungen.<br />
            Tippe auf + um eine hinzuzufügen.
          </p>
        )}

        {plan.exercises.map((pe, index) => (
          <div key={pe.exerciseId} className={styles.exerciseCard}>
            <div className={styles.cardHeader}>
              <span className={styles.exerciseName}>{exerciseName(pe.exerciseId)}</span>
              <div className={styles.cardActions}>
                <button
                  className={styles.iconButton}
                  onClick={() => handleMove(index, -1)}
                  disabled={index === 0}
                  aria-label="Nach oben"
                >↑</button>
                <button
                  className={styles.iconButton}
                  onClick={() => handleMove(index, 1)}
                  disabled={index === plan.exercises.length - 1}
                  aria-label="Nach unten"
                >↓</button>
                <button
                  className={styles.iconButton}
                  onClick={() => handleRemove(pe.exerciseId)}
                  aria-label="Entfernen"
                >✕</button>
              </div>
            </div>

            <div className={styles.settings}>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Sätze</span>
                <input
                  className={styles.fieldInput}
                  type="number"
                  min={1}
                  defaultValue={pe.sets}
                  key={`${pe.exerciseId}-sets`}
                  onBlur={e => handleSetting(pe.exerciseId, 'sets', e.target.value)}
                />
              </div>

              <div className={styles.field}>
                <span className={styles.fieldLabel}>Ziel-Wdh</span>
                <input
                  className={styles.fieldInput}
                  type="number"
                  min={1}
                  defaultValue={pe.targetReps}
                  key={`${pe.exerciseId}-targetReps`}
                  onBlur={e => handleSetting(pe.exerciseId, 'targetReps', e.target.value)}
                />
              </div>

              <div className={styles.field}>
                <span className={styles.fieldLabel}>Start-Gewicht (kg)</span>
                <input
                  className={styles.fieldInput}
                  type="number"
                  min={0}
                  step={0.5}
                  defaultValue={pe.startWeightKg}
                  key={`${pe.exerciseId}-startWeightKg`}
                  onBlur={e => handleSetting(pe.exerciseId, 'startWeightKg', e.target.value)}
                />
              </div>

              <div className={styles.field}>
                <span className={styles.fieldLabel}>Schrittweite (kg)</span>
                <input
                  className={styles.fieldInput}
                  type="number"
                  min={0.5}
                  step={0.5}
                  defaultValue={pe.stepWeightKg}
                  key={`${pe.exerciseId}-stepWeightKg`}
                  onBlur={e => handleSetting(pe.exerciseId, 'stepWeightKg', e.target.value)}
                />
              </div>

              <div className={styles.field}>
                <span className={styles.fieldLabel}>Pause (s)</span>
                <input
                  className={styles.fieldInput}
                  type="number"
                  min={10}
                  step={10}
                  defaultValue={pe.restSeconds}
                  key={`${pe.exerciseId}-restSeconds`}
                  onBlur={e => handleSetting(pe.exerciseId, 'restSeconds', e.target.value)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
