import { useState, useEffect, useRef } from 'react'
import { indexedDbRepository } from '../db/indexeddb'
import {
  buildPrefillFromPlan,
  buildPrefillFromLastEinheit,
  lastEinheitForPlan,
  createEinheit,
} from '../training/prefill'
import { saveSession, loadSession, clearSession } from '../training/sessionPersistence'
import {
  addSetToTraining,
  removeSetFromTraining,
  reindexRawInputsAfterRemove,
  reindexDoneSetsAfterRemove,
} from '../training/trainingOps'
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
  endTime: number
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

// Befüllt die Eingabefelder mit den Werten aus dem Trainings-State,
// z.B. den Wiederholungen/Gewichten der letzten Einheit
function buildRawInputs(exercises: CompletedExercise[]): Record<string, string> {
  const raws: Record<string, string> = {}
  exercises.forEach((ex, ei) => ex.sets.forEach((s, si) => {
    raws[`${ei}-${si}-reps`] = String(s.reps)
    raws[`${ei}-${si}-weightKg`] = String(s.weightKg)
  }))
  return raws
}

function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission()
  }
}

function notifyTimerDone(exerciseName: string) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('Pause vorbei! 💪', {
      body: `${exerciseName} — bereit für den nächsten Satz`,
      tag: 'gym-rest-timer',
    })
  }
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
  const [rawInputs, setRawInputs] = useState<Record<string, string>>({})

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
      const saved = loadSession()
      if (saved && saved.planId === planId) {
        setExercises(saved.exercises)
        setRawInputs(saved.rawInputs)
        setDoneSets(new Set(saved.doneSets))
      } else {
        // Neues Training: Werte der letzten Einheit (bzw. Plan-Startwerte)
        // stehen sichtbar in den Feldern und können frei geändert werden
        setExercises(prefill)
        setRawInputs(buildRawInputs(prefill))
      }
      requestNotificationPermission()

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

  useEffect(() => {
    if (!plan || exercises.length === 0) return
    saveSession({
      planId: plan.id,
      exercises,
      doneSets: [...doneSets],
      rawInputs,
      savedAt: Date.now(),
    })
  }, [exercises, rawInputs, doneSets, plan])

  useEffect(() => {
    function onVisible() {
      if (document.visibilityState !== 'visible') return
      setTimer(prev => {
        if (!prev) return null
        const remaining = Math.max(0, Math.ceil((prev.endTime - Date.now()) / 1000))
        if (remaining <= 0) {
          if (timerRef.current) clearInterval(timerRef.current)
          playDoneBeep()
          notifyTimerDone(prev.exerciseName)
          return null
        }
        return { ...prev, remaining }
      })
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [])

  function startRestTimer(exerciseId: string, reps: number, weightKg: number) {
    const restSeconds = computeRestFromSet(reps, weightKg)
    const name = catalog.find(e => e.id === exerciseId)?.name ?? ''
    if (timerRef.current) clearInterval(timerRef.current)
    const endTime = Date.now() + restSeconds * 1000
    setTimer({ exerciseName: name, restSeconds, totalSeconds: restSeconds, remaining: restSeconds, endTime })
    timerRef.current = setInterval(() => {
      setTimer(prev => {
        if (!prev) return null
        const remaining = Math.max(0, Math.ceil((prev.endTime - Date.now()) / 1000))
        if (remaining <= 0) {
          clearInterval(timerRef.current!)
          playDoneBeep()
          notifyTimerDone(prev.exerciseName)
          return null
        }
        return { ...prev, remaining }
      })
    }, 500)
  }

  function skipTimer() {
    if (timerRef.current) clearInterval(timerRef.current)
    setTimer(null)
  }

  function addTimerSeconds(s: number) {
    setTimer(prev => prev ? {
      ...prev,
      remaining: prev.remaining + s,
      totalSeconds: prev.totalSeconds + s,
      endTime: prev.endTime + s * 1000,
    } : null)
  }

  async function savePlan(updated: Plan) {
    await indexedDbRepository.savePlan(updated)
    setPlan(updated)
  }

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

  function handleSetDone(exIdx: number, setIdx: number, exerciseId: string) {
    const key = `${exIdx}-${setIdx}`
    const wasDone = doneSets.has(key)
    const set = exercises[exIdx]?.sets[setIdx]
    setDoneSets(prev => {
      const next = new Set(prev)
      if (next.has(key)) { next.delete(key); return next }
      next.add(key)
      return next
    })
    // Timer nur beim Abschließen starten, nicht beim Zurücknehmen
    if (!wasDone && set) startRestTimer(exerciseId, set.reps, set.weightKg)
  }

  async function handleAddSet(exIdx: number) {
    const ex = exercises[exIdx]
    if (!ex) return
    const newIdx = ex.sets.length
    const lastSet = ex.sets[newIdx - 1] ?? { reps: 10, weightKg: 20 }
    setExercises(prev => addSetToTraining(prev, exIdx))
    setRawInputs(prev => ({
      ...prev,
      [`${exIdx}-${newIdx}-reps`]: String(lastSet.reps),
      [`${exIdx}-${newIdx}-weightKg`]: String(lastSet.weightKg),
    }))
    if (!plan) return
    const pe = plan.exercises.find(e => e.exerciseId === ex.exerciseId)
    if (pe) await savePlan(updatePlanExercise(plan, ex.exerciseId, { sets: pe.sets + 1 }))
  }

  async function handleRemoveSet(exIdx: number, setIdx: number) {
    const ex = exercises[exIdx]
    if (!ex || ex.sets.length <= 1) return
    setExercises(prev => removeSetFromTraining(prev, exIdx, setIdx))
    setRawInputs(prev => reindexRawInputsAfterRemove(prev, exIdx, setIdx))
    setDoneSets(prev => reindexDoneSetsAfterRemove(prev, exIdx, setIdx))
    if (!plan) return
    const pe = plan.exercises.find(e => e.exerciseId === ex.exerciseId)
    if (pe && pe.sets > 1) await savePlan(updatePlanExercise(plan, ex.exerciseId, { sets: pe.sets - 1 }))
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
      const newIdx = exercises.length
      const prefillEx: CompletedExercise = {
        exerciseId,
        sets: Array.from({ length: newPe.sets }, () => ({ reps: newPe.startReps, weightKg: newPe.startWeightKg })),
      }
      setExercises(prev => [...prev, prefillEx])
      setRawInputs(prev => {
        const next = { ...prev }
        prefillEx.sets.forEach((s, si) => {
          next[`${newIdx}-${si}-reps`] = String(s.reps)
          next[`${newIdx}-${si}-weightKg`] = String(s.weightKg)
        })
        return next
      })
      await savePlan(addExerciseToPlan(plan, newPe))
    }
    setPickerMode(null)
  }

  function handleAcceptSuggestion(exerciseId: string, newWeightKg: number) {
    const targetReps = plan?.exercises.find(pe => pe.exerciseId === exerciseId)?.targetReps ?? 10
    const exIdx = exercises.findIndex(ex => ex.exerciseId === exerciseId)
    if (exIdx >= 0) {
      const numSets = exercises[exIdx].sets.length
      const newRaws: Record<string, string> = {}
      for (let si = 0; si < numSets; si++) {
        newRaws[`${exIdx}-${si}-reps`] = String(targetReps)
        newRaws[`${exIdx}-${si}-weightKg`] = String(newWeightKg)
      }
      setRawInputs(r => ({ ...r, ...newRaws }))
    }
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
    clearSession()
    onFinish()
  }

  function handleCancel() {
    clearSession()
    onCancel()
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
          <button className={styles.cancelButton} onClick={handleCancel}>Abbrechen</button>
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

              {ex.sets.map((_, setIdx) => {
                const key = `${exIdx}-${setIdx}`
                const done = doneSets.has(key)
                return (
                  <div key={setIdx} className={`${styles.setRow} ${done ? styles.done : ''}`}>
                    <span className={styles.setLabel}>Satz {setIdx + 1}</span>
                    <input
                      className={styles.setInput}
                      type="number"
                      min={0}
                      value={rawInputs[`${exIdx}-${setIdx}-reps`] ?? ''}
                      onChange={e => updateSet(exIdx, setIdx, 'reps', e.target.value)}
                    />
                    <span className={styles.setSep}>×</span>
                    <input
                      className={styles.setInput}
                      type="number"
                      min={0}
                      step={0.5}
                      value={rawInputs[`${exIdx}-${setIdx}-weightKg`] ?? ''}
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
