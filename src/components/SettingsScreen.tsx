import { useRef, useState } from 'react'
import { indexedDbRepository } from '../db/indexeddb'
import { exportState, importState } from '../db/exportImport'
import type { AppState } from '../db/types'
import styles from './SettingsScreen.module.css'

interface Props {
  onBack: () => void
}

export function SettingsScreen({ onBack }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  async function handleExport() {
    const [exercises, plans, einheiten] = await Promise.all([
      indexedDbRepository.getExercises(),
      indexedDbRepository.getPlans(),
      indexedDbRepository.getEinheiten(),
    ])
    const state: AppState = { version: 1, exercises, plans, einheiten }
    const json = exportState(state)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `gymtracker-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    setFeedback({ type: 'success', msg: 'Export erfolgreich.' })
  }

  async function handleImportFile(file: File) {
    try {
      const text = await file.text()
      const result = importState(text)
      if ('error' in result) {
        setFeedback({ type: 'error', msg: result.error })
        return
      }
      for (const ex of result.exercises) await indexedDbRepository.saveExercise(ex)
      for (const p of result.plans) await indexedDbRepository.savePlan(p)
      for (const e of result.einheiten) await indexedDbRepository.saveEinheit(e)
      setFeedback({ type: 'success', msg: `Import erfolgreich: ${result.exercises.length} Übungen, ${result.plans.length} Pläne, ${result.einheiten.length} Einheiten.` })
    } catch (err) {
      // Ohne diesen Zweig bliebe der Bildschirm bei einer kaputten Datei stumm.
      setFeedback({ type: 'error', msg: `Import fehlgeschlagen: ${err instanceof Error ? err.message : String(err)}` })
    }
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button className={styles.backButton} onClick={onBack}>← Zurück</button>
        <h1 className={styles.title}>Einstellungen</h1>
      </header>

      {feedback && (
        <div className={`${styles.feedback} ${styles[feedback.type]}`}>{feedback.msg}</div>
      )}

      <div className={styles.section}>
        <p className={styles.sectionTitle}>Daten</p>

        <button className={styles.actionButton} onClick={handleExport}>
          ⬇ Exportieren (JSON)
        </button>
        <p className={styles.description}>
          Speichert alle Pläne, Übungen und Trainings-Verlauf als JSON-Datei — als Backup und für spätere Migration.
        </p>

        <button className={styles.actionButton} onClick={() => fileInputRef.current?.click()}>
          ⬆ Importieren (JSON)
        </button>
        <p className={styles.description}>
          Stellt einen vorherigen Export wieder her. Vorhandene Daten werden ergänzt, nicht überschrieben.
        </p>
        <input
          ref={fileInputRef}
          className={styles.fileInput}
          type="file"
          accept=".json"
          onChange={e => {
            const file = e.target.files?.[0]
            if (file) handleImportFile(file)
            e.target.value = ''
          }}
        />
      </div>
    </div>
  )
}
