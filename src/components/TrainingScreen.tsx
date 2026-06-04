import { useState, useEffect, useRef } from 'react'
import { indexedDbRepository } from '../db/indexeddb'
import {
  buildPrefillFromPlan,
  buildPrefillFromLastEinheit,
  lastEinheitForPlan,
  createEinheit,
} from '../training/prefill'
import { addSetToTraining, removeSetFromTraining } from '../training/trainingOps'
import { computeProgressionSuggestion, getFirstSetRepsForExercise, computeRestFromSet } from '../training/progression'
import {
  addExerciseToPlan,
  createPlanExercise,
  swapExerciseInPlan,
  updatePlanExercise,
} from '../plans/planEditor'
import type { CompletedExercise, Einheit, Exercise, Plan } from '../db/types'
import { ExercisePicker } from './ExercisePicker'
import styles from './TrainingScreen.module.css'

const MUSCLE_COLORS: Record<string, string> = {
  'Brust': '#ef4444', 'Rücken': '#3b82f6', 'Schultern': '#f59e0b',
  'Bizeps': '#8b5cf6', 'Trizeps': '#ec4899', 'Beine': '#22c55e', 'Bauch': '#06b6d4',
}

type PickerMode =
  | { type: 'add' }
  | { type: 'swap'; exIdx: number; oldExerciseId: string }

interface TimerState {
  exerciseName: string
  restSeconds: number
  totalSeconds: number
  remaining: number
}

interface Props {
  planId: string
  onFinish: () => void
  onCancel: () => void
}

function playDoneBeep() {
  try {
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.value = 880
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)
    osc.start()
    osc.stop(ctx.currentTime + 0.4)
  } catch { /* AudioContext may be blocked on first gesture */ }
}

export function TrainingScreen({ planId, onFinish, onCancel }: Props) {
  const [plan, setPlan] = useState<Plan | null>(null)
  const [catalog, setCatalog] = useState<Exercise[]>([])
  const [exercises, setExercises] = useState<CompletedExercise[]>([])
  const [suggestions, setSuggestions] = useState<Record<string, { newWeightKg: number }>>({})
  const [doneSets, setDoneSets] = useState<Set<string>>(new Set())
  const [pickerMode, setPickerMode] = useState<PickerMode | null>(null)
  const [timer, setTimer] = useState<TimerState | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

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
      const prefill = last ? buildPrefillFromLastEinheit(found, last) : buildPrefillFromPlan(found)
      setPlan(found)
      setExercises(prefill)

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

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  function startRestTimer(exerciseId: string, reps: number, weightKg: number) {
    const restSeconds = computeRestFromSet(reps, weightKg)
    const name = catalog.find(e => e.id === exerciseId)?.name ?? ''
    if (timerRef.current) clearInterval(timerRef.current)
    setTimer({ exerciseName: name, restSeconds, totalSeconds: restSeconds, remaining: restSeconds })
    timerRef.current = setInterval(() => {
      setTimer(prev => {
        if (!prev) return null
        if (prev.remaining <= 1) {
          clearInterval(timerRef.current!)
          playDoneBeep()
          return null
        }
        return { ...prev, remaining: prev.remaining - 1 }
      })
    }, 1000)
  }

  function skipTimer() {
    if (timerRef.current) clearInterval(timerRef.current)
    setTimer(null)
  }

  function addTimerSeconds(s: number) {
    setTimer(prev => prev ? { ...prev, remaining: prev.remaining + s, totalSeconds: prev.totalSeconds + s } : null)
  }

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

  function handleSetDone(exIdx: number, setIdx: number, exerciseId: string) {
    const key = `${exIdx}-${setIdx}`
    const set = exercises[exIdx]?.sets[setIdx]
    setDoneSets(prev => {
      const next = new Set(prev)
      if (next.has(key)) { next.delete(key); return next }
      next.add(key)
      return next
    })
    if (set) startRestTimer(exerciseId, set.reps, set.weightKg)
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
      const ex = catalog.find(e => e.id === exerciseId)
      const newPe = createPlanExercise(exerciseId, plan.exercises.length, {
        restSeconds: ex?.defaultRestSeconds ?? 90,
      })
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
    if (timerRef.current) clearInterval(timerRef.current)
    onFinish()
  }

  function exerciseName(id: string) { return catalog.find(e => e.id === id)?.name ?? id }
  function muscleColor(id: string) {
    const g = catalog.find(e => e.id === id)?.muscleGroup ?? ''
    return MUSCLE_COLORS[g] ?? '#64748b'
  }

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  function restLabel(totalSeconds: number): string {
    if (totalSeconds >= 300) return '≥ 90 % 1RM — Maximalkraft'
    if (totalSeconds >= 180) return '80–90 % 1RM — Kraft'
    if (totalSeconds >= 120) return '70–80 % 1RM — Hypertrophie'
    if (totalSeconds >= 90)  return '60–70 % 1RM — Hypertrophie'
    return '< 60 % 1RM — Ausdauer'
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
                <div className={styles.exerciseNameRow}>
                  <span
                    className={styles.muscleGroupDot}
                    style={{ background: muscleColor(ex.exerciseId) }}
                  />
                  <span className={styles.exerciseName}>{exerciseName(ex.exerciseId)}</span>
                </div>
                <button
                  className={styles.swapButton}
                  onClick={() => setPickerMode({ type: 'swap', exIdx, oldExerciseId: ex.exerciseId })}
                >⇄ Tauschen</button>
              </div>

              {suggestions[ex.exerciseId] && (
                <div className={styles.suggestion}>
                  <span className={styles.suggestionText}>
                    💡 Vorschlag: {suggestions[ex.exerciseId].newWeightKg} kg
                  </span>
                  <button
                    className={styles.acceptButton}
                    onClick={() => handleAcceptSuggestion(ex.exerciseId, suggestions[ex.exerciseId].newWeightKg)}
                  >Annehmen</button>
                </div>
              )}

              {ex.sets.map((s, setIdx) => {
                const key = `${exIdx}-${setIdx}`
                const done = doneSets.has(key)
                return (
                  <div key={setIdx} className={`${styles.setRow} ${done ? styles.done : ''}`}>
                    <span className={styles.setLabel}>Satz {setIdx + 1}</span>
                    <input
                      className={styles.setInput}
                      type="number"
                      min={0}
                      value={s.reps}
                      onChange={e => updateSet(exIdx, setIdx, 'reps', e.target.value)}
                    />
                    <span className={styles.setSep}>×</span>
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
                      className={`${styles.doneButton} ${done ? styles.active : ''}`}
                      onClick={() => handleSetDone(exIdx, setIdx, ex.exerciseId)}
                      aria-label="Satz fertig"
                    >{done ? '✓' : '○'}</button>
                    <button
                      className={styles.removeSetButton}
                      onClick={() => handleRemoveSet(exIdx, setIdx)}
                      aria-label="Satz entfernen"
                    >✕</button>
                  </div>
                )
              })}

              <button className={styles.addSetButton} onClick={() => handleAddSet(exIdx)}>
                + Satz
              </button>
            </div>
          ))}

          <button
            className={styles.addExerciseButton}
            onClick={() => setPickerMode({ type: 'add' })}
          >+ Übung hinzufügen</button>
        </div>

        {timer && (
          <div className={styles.timerBanner}>
            <div className={styles.timerHeader}>
              <span className={styles.timerLabel}>⏱ {timer.exerciseName} · {restLabel(timer.totalSeconds)}</span>
              <span className={`${styles.timerCountdown} ${timer.remaining <= 10 ? styles.urgent : ''}`}>
                {fmt(timer.remaining)}
              </span>
            </div>
            <div className={styles.timerTrack}>
              <div
                className={`${styles.timerFill} ${timer.remaining <= 10 ? styles.urgent : ''}`}
                style={{ width: `${(timer.remaining / timer.totalSeconds) * 100}%` }}
              />
            </div>
            <div className={styles.timerActions}>
              <button className={styles.timerActionButton} onClick={() => addTimerSeconds(30)}>+30s</button>
              <button className={styles.timerActionButton} onClick={() => addTimerSeconds(60)}>+1 min</button>
              <button className={styles.timerSkipButton} onClick={skipTimer}>Überspringen</button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
