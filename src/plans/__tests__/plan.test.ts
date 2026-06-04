import { describe, it, expect } from 'vitest'
import { createPlan } from '../plan'

describe('createPlan', () => {
  it('setzt den gegebenen Namen', () => {
    const plan = createPlan('Push')
    expect(plan.name).toBe('Push')
  })

  it('entfernt Leerzeichen am Rand', () => {
    const plan = createPlan('  Pull  ')
    expect(plan.name).toBe('Pull')
  })

  it('startet mit leerer Übungsliste', () => {
    const plan = createPlan('Beine')
    expect(plan.exercises).toEqual([])
  })

  it('generiert jedes Mal eine eindeutige ID', () => {
    const a = createPlan('Push')
    const b = createPlan('Push')
    expect(a.id).not.toBe(b.id)
  })

  it('ID ist ein nicht-leerer String', () => {
    const plan = createPlan('Push')
    expect(typeof plan.id).toBe('string')
    expect(plan.id.length).toBeGreaterThan(0)
  })
})
