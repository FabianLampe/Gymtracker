import { useState, useEffect } from 'react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import { indexedDbRepository } from '../db/indexeddb'
import { buildGraphData } from '../training/graphData'
import type { Einheit, Exercise, Plan } from '../db/types'
import styles from './ProgressionScreen.module.css'

type Span = 'week' | 'month' | 'year'

const SPAN_LABELS: Record<Span, string> = { week: '7 T', month: '1 M', year: '1 J' }

// Sonderwert im Plan-Auswahlfeld: zeigt jede Übung, für die es Daten gibt —
// auch solche, die in keinem Plan (mehr) stehen.
const ALL_EXERCISES = '__all__'

function formatDate(iso: string): string {
  const [, month, day] = iso.split('-')
  return `${day}.${month}.`
}

interface Props {
  initialExerciseId?: string
  onBack?: () => void
}

interface Chart {
  id: string
  name: string
  data: Array<{ date: string; weightKg: number }>
}

export function ProgressionScreen({ initialExerciseId, onBack }: Props) {
  const [plans, setPlans] = useState<Plan[]>([])
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [einheiten, setEinheiten] = useState<Einheit[]>([])
  const [selectedPlanId, setSelectedPlanId] = useState('')
  const [span, setSpan] = useState<Span>('month')

  useEffect(() => {
    Promise.all([
      indexedDbRepository.getPlans(),
      indexedDbRepository.getExercises(),
      indexedDbRepository.getEinheiten(),
    ]).then(([ps, exs, es]) => {
      setPlans(ps)
      setExercises(exs)
      setEinheiten(es)
      if (ps.length > 0) setSelectedPlanId(ps[0].id)
      else setSelectedPlanId(ALL_EXERCISES)
    })
  }, [])

  const today = new Date().toISOString().slice(0, 10)
  const selectedPlan = plans.find(p => p.id === selectedPlanId)

  function exerciseName(id: string) {
    return exercises.find(e => e.id === id)?.name ?? 'Gelöschte Übung'
  }

  function chartFor(exerciseId: string): Chart {
    return {
      id: exerciseId,
      name: exerciseName(exerciseId),
      data: buildGraphData(einheiten, exerciseId, span, today),
    }
  }

  // Detail-Ansicht: aus dem Übungskatalog geöffnet — genau diese eine Übung,
  // unabhängig davon, ob sie in einem Plan steht.
  const detailMode = Boolean(initialExerciseId)

  let charts: Chart[] = []
  if (detailMode) {
    charts = [chartFor(initialExerciseId!)]
  } else if (selectedPlanId === ALL_EXERCISES) {
    const withData = [...new Set(einheiten.flatMap(e => e.exercises.map(ex => ex.exerciseId)))]
    charts = withData.map(chartFor).sort((a, b) => a.name.localeCompare(b.name))
  } else if (selectedPlan) {
    charts = [...selectedPlan.exercises]
      .sort((a, b) => a.order - b.order)
      .map(pe => chartFor(pe.exerciseId))
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        {onBack && (
          <button className={styles.backButton} onClick={onBack}>← Zurück</button>
        )}
        <h1 className={styles.title}>
          {detailMode ? exerciseName(initialExerciseId!) : 'Fortschritt'}
        </h1>
      </header>

      <div className={styles.controls}>
        {!detailMode && (
          <select
            className={styles.select}
            value={selectedPlanId}
            onChange={e => setSelectedPlanId(e.target.value)}
          >
            {plans.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
            <option value={ALL_EXERCISES}>Alle Übungen</option>
          </select>
        )}

        <div className={styles.spanButtons}>
          {(Object.keys(SPAN_LABELS) as Span[]).map(s => (
            <button
              key={s}
              className={`${styles.spanButton} ${span === s ? styles.active : ''}`}
              onClick={() => setSpan(s)}
            >
              {SPAN_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {!detailMode && plans.length === 0 && charts.length === 0 && (
        <p className={styles.empty}>Noch keine Trainingsdaten vorhanden.</p>
      )}

      {charts.map(({ id, name, data }) => (
        <div key={id} className={styles.chartBlock}>
          {!detailMode && <p className={styles.chartTitle}>{name}</p>}
          {data.length === 0 ? (
            <p className={styles.chartEmpty}>Keine Daten im Zeitraum</p>
          ) : (
            <div className={styles.chartWrapper}>
              <ResponsiveContainer width="100%" height={detailMode ? 260 : 160}>
                <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatDate}
                    tick={{ fill: 'var(--text-3)', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: 'var(--text-3)', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    unit=" kg"
                    width={44}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--surface-2)',
                      border: '1px solid var(--border)',
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    labelStyle={{ color: 'var(--text-2)' }}
                    itemStyle={{ color: 'var(--accent)' }}
                    formatter={(v) => [`${v} kg`, 'Gewicht']}
                    labelFormatter={(label) =>
                      typeof label === 'string' ? formatDate(label) : String(label)
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="weightKg"
                    stroke="var(--accent)"
                    strokeWidth={2}
                    dot={{ fill: 'var(--accent)', r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
