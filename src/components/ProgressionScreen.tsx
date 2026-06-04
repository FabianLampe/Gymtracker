import { useState, useEffect } from 'react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import { indexedDbRepository } from '../db/indexeddb'
import { buildGraphData } from '../training/graphData'
import type { Einheit, Exercise } from '../db/types'
import styles from './ProgressionScreen.module.css'

type Span = 'week' | 'month' | 'year'

const SPAN_LABELS: Record<Span, string> = { week: '7 T', month: '1 M', year: '1 J' }

function formatDate(iso: string): string {
  const [, month, day] = iso.split('-')
  return `${day}.${month}.`
}

interface Props {
  initialExerciseId?: string
  onBack?: () => void
}

export function ProgressionScreen({ initialExerciseId, onBack }: Props) {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [einheiten, setEinheiten] = useState<Einheit[]>([])
  const [selectedId, setSelectedId] = useState(initialExerciseId ?? '')
  const [span, setSpan] = useState<Span>('month')

  useEffect(() => {
    Promise.all([
      indexedDbRepository.getExercises(),
      indexedDbRepository.getEinheiten(),
    ]).then(([exs, es]) => {
      setExercises(exs)
      setEinheiten(es)
      if (!initialExerciseId && exs.length > 0) setSelectedId(exs[0].id)
    })
  }, [initialExerciseId])

  const today = new Date().toISOString().slice(0, 10)
  const data = selectedId ? buildGraphData(einheiten, selectedId, span, today) : []

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        {onBack && (
          <button className={styles.backButton} onClick={onBack}>← Zurück</button>
        )}
        <h1 className={styles.title}>Fortschritt</h1>
      </header>

      <div className={styles.controls}>
        <select
          className={styles.select}
          value={selectedId}
          onChange={e => setSelectedId(e.target.value)}
        >
          {exercises.map(ex => (
            <option key={ex.id} value={ex.id}>{ex.name}</option>
          ))}
        </select>

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

      {data.length === 0 ? (
        <p className={styles.empty}>Keine Daten für diesen Zeitraum.</p>
      ) : (
        <div className={styles.chartWrapper}>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                tick={{ fill: '#64748b', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#64748b', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                unit=" kg"
                width={48}
              />
              <Tooltip
                contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8 }}
                labelStyle={{ color: '#94a3b8' }}
                itemStyle={{ color: '#93c5fd' }}
                formatter={(v: number) => [`${v} kg`, 'Gewicht']}
                labelFormatter={formatDate}
              />
              <Line
                type="monotone"
                dataKey="weightKg"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
