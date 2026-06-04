import { useState, useEffect } from 'react'
import { indexedDbRepository } from '../db/indexeddb'
import {
  buildPrefillFromPlan,
  buildPrefillFromLastEinheit,
  lastEinheitForPlan,
  createEinheit,
} from '../training/prefill'
import { addSetToTraining, removeSetFromTraining } from '../training/trainingOps'
import { computeProgressionSuggestion, getFirstSetRepsForExercise } from '../training/progression'
import {
  addExerciseToPlan,
  createPlanExercise,
  swapExerciseInPlan,
  updatePlanExercise,
} from '../plans/planEditor'
import type { CompletedExercise, Einheit, Exercise, Plan } from '../db/types'
import { ExercisePicker } from './ExercisePicker'
import styles from './TrainingScreen.module.css'

type PickerMode =
  | { type: 'add' }
  | { type: 'swap'; exIdx: number; oldExerciseId: string }

interface Props {
  planId: string
  onFinish: () => void
  onCancel: () => void
}

export function TrainingScreen({ planId, onFinish, onCancel }: Props) {
  const [plan, setPlan] = useState<Plan | null>(null)
  const [catalog, setCatalog] = useState<Exercise[]>([])
  const [exercises, setExercises] = useState<CompletedExercise[]>([])
  const [suggestions, setSuggestions] = useState<Record<string, { newWeightKg: number }>>({})
  const [pickerMode, setPickerMode] = useState<PickerMode | null>(null)

  useEffect(() => {
    Promise.all([
      indexedDbRepository.getPlans(),
      indexedDbRepository.getExercises(),
      indexedDbRepository.getEinheiten(),
    ]).then(([plans, exs, einheiten]) => {
      const found = plans.find(p => p.id === planId)
      if (!found) return
      setCatalog(exs)

      const last = lastEinheitForPlan(einheiten, planId)
      const prefill = last
        ? buildPrefillFromLastEinheit(found, last)
        : buildPrefillFromPlan(found)

      setPlan(found)
      setExercises(prefill)

      // Compute progression suggestions
      const planEinheiten = einheiten
        .filter(e => e.planId === planId)
        .sort((a, b) => b.date.localeCompare(a.date))

      const computed: Record<string, { newWeightKg: number }> = {}
      for (const pe of found.exercises) {
        const recentReps: number[] = []
        for (const e of planEinheiten) {
          if (recentReps.length >= 2) break
          const reps = getFirstSetRepsForExercise(e, pe.exerciseId)
          if (reps !== null) recentReps.push(reps)
        }
        const currentWeight = prefill.find(ex => ex.exerciseId === pe.exerciseId)?.sets[0]?.weightKg ?? pe.startWeightKg
        const s = computeProgressionSuggestion(recentReps, pe.targetReps, currentWeight, pe.stepWeightKg)
        if (s) computed[pe.exerciseId] = s
      }
      setSuggestions(computed)
    })
  }, [planId])

  async function savePlan(updated: Plan) {
    await indexedDbRepository.savePlan(updated)
    setPlan(updated)
  }

  function updateSet(exIdx: number, setIdx: number, field: 'reps' | 'weightKg', raw: string) {
    const value = parseFloat(raw)
    if (isNaN(value) || value < 0) return
    setExercises(prev =>
      prev.map((ex, ei) =>
        ei === exIdx
          ? { ...ex, sets: ex.sets.map((s, si) => si === setIdx ? { ...s, [field]: value } : s) }
          : ex,
      ),
    )
  }

  async function handleAddSet(exIdx: number) {
    setExercises(prev => addSetToTraining(prev, exIdx))
    if (!plan) return
    const exerciseId = exercises[exIdx].exerciseId
    const pe = plan.exercises.find(e => e.exerciseId === exerciseId)
    if (pe) await savePlan(updatePlanExercise(plan, exerciseId, { sets: pe.sets + 1 }))
  }

  async function handleRemoveSet(exIdx: number, setIdx: number) {
    setExercises(prev => removeSetFromTraining(prev, exIdx, setIdx))
    if (!plan) return
    const exerciseId = exercises[exIdx].exerciseId
    const pe = plan.exercises.find(e => e.exerciseId === exerciseId)
    if (pe && pe.sets > 1) await savePlan(updatePlanExercise(plan, exerciseId, { sets: pe.sets - 1 }))
  }

  async function handlePickerSelect(exerciseId: string) {
    if (!plan || !pickerMode) return
    if (pickerMode.type === 'swap') {
      const { exIdx, oldExerciseId } = pickerMode
      setExercises(prev => prev.map((ex, i) => i === exIdx ? { ...ex, exerciseId } : ex))
      await savePlan(swapExerciseInPlan(plan, oldExerciseId, exerciseId))
    } else {
      const newPe = createPlanExercise(exerciseId, plan.exercises.length)
      const prefillEx: CompletedExercise = {
        exerciseId,
        sets: Array.from({ length: newPe.sets }, () => ({ reps: newPe.startReps, weightKg: newPe.startWeightKg })),
      }
      setExercises(prev => [...prev, prefillEx])
      await savePlan(addExerciseToPlan(plan, newPe))
    }
    setPickerMode(null)
  }

  function handleAcceptSuggestion(exerciseId: string, newWeightKg: number) {
    const targetReps = plan?.exercises.find(pe => pe.exerciseId === exerciseId)?.targetReps ?? 10
    setExercises(prev =>
      prev.map(ex =>
        ex.exerciseId === exerciseId
          ? { ...ex, sets: ex.sets.map(() => ({ reps: targetReps, weightKg: newWeightKg })) }
          : ex,
      ),
    )
    setSuggestions(prev => { const next = { ...prev }; delete next[exerciseId]; return next })
  }

  async function handleFinish() {
    if (!plan) return
    const date = new Date().toISOString().slice(0, 10)
    const einheit: Einheit = createEinheit(plan.id, exercises, date)
    await indexedDbRepository.saveEinheit(einheit)
    onFinish()
  }

  function exerciseName(id: string) {
    return catalog.find(e => e.id === id)?.name ?? id
  }

  if (!plan) return null

  return (
    <>
      {pickerMode && (
        <ExercisePicker
          exercises={catalog}
          onSelect={handlePickerSelect}
          onClose={() => setPickerMode(null)}
        />
      )}

      <div className={styles.screen}>
        <header className={styles.header}>
          <button className={styles.cancelButton} onClick={onCancel}>Abbrechen</button>
          <span className={styles.title}>{plan.name}</span>
          <button className={styles.finishButton} onClick={handleFinish}>Beenden ✓</button>
        </header>

        <div className={styles.body}>
          {exercises.map((ex, exIdx) => (
            <div key={`${ex.exerciseId}-${exIdx}`} className={styles.exerciseBlock}>
              <div className={styles.exerciseHeader}>
                <span className={styles.exerciseName}>{exerciseName(ex.exerciseId)}</span>
                <button
                  className={styles.swapButton}
                  onClick={() => setPickerMode({ type: 'swap', exIdx, oldExerciseId: ex.exerciseId })}
                >
                  ↔ Tauschen
                </button>
              </div>

              {suggestions[ex.exerciseId] && (
                <div className={styles.suggestion}>
                  <span className={styles.suggestionText}>
                    💡 Vorschlag: {suggestions[ex.exerciseId].newWeightKg} kg
                  </span>
                  <button
                    className={styles.acceptButton}
                    onClick={() => handleAcceptSuggestion(ex.exerciseId, suggestions[ex.exerciseId].newWeightKg)}
                  >
                    Annehmen
                  </button>
                </div>
              )}

              {ex.sets.map((s, setIdx) => (
                <div key={setIdx} className={styles.setRow}>
                  <span className={styles.setLabel}>Satz {setIdx + 1}</span>
                  <input
                    className={styles.setInput}
                    type="number"
                    min={0}
                    value={s.reps}
                    onChange={e => updateSet(exIdx, setIdx, 'reps', e.target.value)}
                  />
                  <span className={styles.setSep}>Wdh ×</span>
                  <input
                    className={styles.setInput}
                    type="number"
                    min={0}
                    step={0.5}
                    value={s.weightKg}
                    onChange={e => updateSet(exIdx, setIdx, 'weightKg', e.target.value)}
                  />
                  <span className={styles.setUnit}>kg</span>
                  <button
                    className={styles.removeSetButton}
                    onClick={() => handleRemoveSet(exIdx, setIdx)}
                    aria-label="Satz entfernen"
                  >✕</button>
                </div>
              ))}

              <button className={styles.addSetButton} onClick={() => handleAddSet(exIdx)}>
                + Satz
              </button>
            </div>
          ))}

          <button
            className={styles.addExerciseButton}
            onClick={() => setPickerMode({ type: 'add' })}
          >
            + Übung hinzufügen
          </button>
        </div>
      </div>
    </>
  )
}
