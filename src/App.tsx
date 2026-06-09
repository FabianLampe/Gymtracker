import { useState, useEffect, useRef } from 'react'
import { PlanList } from './components/PlanList'
import { PlanEditor } from './components/PlanEditor'
import { ExerciseCatalog } from './components/ExerciseCatalog'
import { TrainingScreen } from './components/TrainingScreen'
import { HistoryScreen } from './components/HistoryScreen'
import { ProgressionScreen } from './components/ProgressionScreen'
import { EinheitEditor } from './components/EinheitEditor'
import { SettingsScreen } from './components/SettingsScreen'
import { TabBar, type Tab } from './components/TabBar'
import { seedIfEmpty } from './exercises/exercise'
import { indexedDbRepository } from './db/indexeddb'
import { loadSession } from './training/sessionPersistence'

type AppScreen =
  | { name: 'plan-list' }
  | { name: 'plan-editor'; planId: string }
  | { name: 'exercise-catalog' }
  | { name: 'training'; planId: string }
  | { name: 'history' }
  | { name: 'progression'; exerciseId?: string }
  | { name: 'einheit-editor'; einheitId: string }
  | { name: 'settings' }

// Screens, die einen Zurück-Button haben und per iOS-Wisch navigierbar sein sollen
const DEEP_SCREENS = new Set<AppScreen['name']>([
  'plan-editor', 'training', 'einheit-editor', 'settings',
])

function parentOf(screen: AppScreen): AppScreen {
  if (screen.name === 'plan-editor')    return { name: 'plan-list' }
  if (screen.name === 'training')       return { name: 'plan-list' }
  if (screen.name === 'einheit-editor') return { name: 'history' }
  if (screen.name === 'settings')       return { name: 'plan-list' }
  if (screen.name === 'progression' && screen.exerciseId) return { name: 'exercise-catalog' }
  return screen
}

function screenToTab(screen: AppScreen): Tab {
  if (screen.name === 'exercise-catalog') return 'exercises'
  if (screen.name === 'progression')      return 'progression'
  if (screen.name === 'history' || screen.name === 'einheit-editor') return 'history'
  return 'plans'
}

const TAB_SCREENS: Record<Tab, AppScreen> = {
  plans:       { name: 'plan-list' },
  exercises:   { name: 'exercise-catalog' },
  progression: { name: 'progression' },
  history:     { name: 'history' },
}

const HIDE_TABBAR: AppScreen['name'][] = ['plan-editor', 'training', 'einheit-editor', 'settings']

function App() {
  const [screen, setScreen] = useState<AppScreen>({ name: 'plan-list' })
  const screenRef = useRef(screen)
  screenRef.current = screen

  useEffect(() => {
    seedIfEmpty(indexedDbRepository)
    window.history.pushState({ depth: 0 }, '')
    const saved = loadSession()
    if (saved) {
      window.history.pushState({ depth: 1 }, '')
      setScreen({ name: 'training', planId: saved.planId })
    }
  }, [])

  useEffect(() => {
    function handlePopState() {
      const current = screenRef.current
      if (DEEP_SCREENS.has(current.name)) {
        // In der App zurück navigieren
        setScreen(parentOf(current))
      } else {
        // Auf Root-Screen: neues Entry pushen damit man nicht aus der App fliegt
        window.history.pushState({ depth: 0 }, '')
      }
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  // Navigiert zu einem tiefen Screen und schreibt einen History-Eintrag
  function goTo(next: AppScreen) {
    if (DEEP_SCREENS.has(next.name)) {
      window.history.pushState({ depth: 1 }, '')
    }
    setScreen(next)
  }

  // Navigiert zurück (Zurück-Button) und entfernt den History-Eintrag
  function goBack(target: AppScreen) {
    window.history.back()
    setScreen(target)
  }

  const showTabBar = !HIDE_TABBAR.includes(screen.name)

  return (
    <>
      {screen.name === 'plan-list' && (
        <PlanList
          onOpenPlan={planId => goTo({ name: 'plan-editor', planId })}
          onOpenSettings={() => goTo({ name: 'settings' })}
        />
      )}
      {screen.name === 'plan-editor' && (
        <PlanEditor
          planId={screen.planId}
          onBack={() => goBack({ name: 'plan-list' })}
          onStartTraining={planId => goTo({ name: 'training', planId })}
        />
      )}
      {screen.name === 'exercise-catalog' && (
        <ExerciseCatalog
          onViewProgression={exerciseId => goTo({ name: 'progression', exerciseId })}
        />
      )}
      {screen.name === 'training' && (
        <TrainingScreen
          planId={screen.planId}
          onFinish={() => { window.history.back(); setScreen({ name: 'history' }) }}
          onCancel={() => goBack({ name: 'plan-list' })}
        />
      )}
      {screen.name === 'history' && (
        <HistoryScreen
          onEditEinheit={einheitId => goTo({ name: 'einheit-editor', einheitId })}
        />
      )}
      {screen.name === 'progression' && (
        <ProgressionScreen
          initialExerciseId={screen.exerciseId}
          onBack={screen.exerciseId ? () => goBack({ name: 'exercise-catalog' }) : undefined}
        />
      )}
      {screen.name === 'einheit-editor' && (
        <EinheitEditor
          einheitId={screen.einheitId}
          onBack={() => goBack({ name: 'history' })}
        />
      )}
      {screen.name === 'settings' && (
        <SettingsScreen
          onBack={() => goBack({ name: 'plan-list' })}
        />
      )}

      {showTabBar && (
        <TabBar
          activeTab={screenToTab(screen)}
          onTabChange={tab => setScreen(TAB_SCREENS[tab])}
        />
      )}
    </>
  )
}

export default App
