import type { Einheit } from '../db/types'

const SPAN_DAYS: Record<string, number> = { week: 7, month: 30, year: 365 }

function subtractDays(isoDate: string, days: number): string {
  const d = new Date(isoDate)
  d.setDate(d.getDate() - days)
  return d.toISOString().slice(0, 10)
}

export function buildGraphData(
  einheiten: Einheit[],
  exerciseId: string,
  span: 'week' | 'month' | 'year',
  referenceDate: string,
): Array<{ date: string; weightKg: number }> {
  const cutoff = subtractDays(referenceDate, SPAN_DAYS[span])
  return einheiten
    .filter(e => e.date >= cutoff && e.date <= referenceDate)
    .flatMap(e => {
      const ex = e.exercises.find(x => x.exerciseId === exerciseId)
      if (!ex || ex.sets.length === 0) return []
      return [{ date: e.date, weightKg: ex.sets[0].weightKg }]
    })
    .sort((a, b) => a.date.localeCompare(b.date))
}
