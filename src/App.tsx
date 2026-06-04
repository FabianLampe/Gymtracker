import { useState, useEffect } from 'react'
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

type AppScreen =
  | { name: 'plan-list' }
  | { name: 'plan-editor'; planId: string }
  | { name: 'exercise-catalog' }
  | { name: 'training'; planId: string }
  | { name: 'history' }
  | { name: 'progression'; exerciseId?: string }
  | { name: 'einheit-editor'; einheitId: string }
  | { name: 'settings' }

function screenToTab(screen: AppScreen): Tab {
  if (screen.name === 'exercise-catalog') return 'exercises'
  if (screen.name === 'progression') return 'progression'
  if (screen.name === 'history' || screen.name === 'einheit-editor') return 'history'
  return 'plans'
}

const TAB_SCREENS: Record<Tab, AppScreen> = {
  plans: { name: 'plan-list' },
  exercises: { name: 'exercise-catalog' },
  progression: { name: 'progression' },
  history: { name: 'history' },
}

const HIDE_TABBAR: AppScreen['name'][] = ['plan-editor', 'training', 'einheit-editor', 'settings']

function App() {
  const [screen, setScreen] = useState<AppScreen>({ name: 'plan-list' })

  useEffect(() => {
    seedIfEmpty(indexedDbRepository)
  }, [])

  const showTabBar = !HIDE_TABBAR.includes(screen.name)

  return (
    <>
      {screen.name === 'plan-list' && (
        <PlanList
          onOpenPlan={planId => setScreen({ name: 'plan-editor', planId })}
          onOpenSettings={() => setScreen({ name: 'settings' })}
        />
      )}
      {screen.name === 'plan-editor' && (
        <PlanEditor
          planId={screen.planId}
          onBack={() => setScreen({ name: 'plan-list' })}
          onStartTraining={planId => setScreen({ name: 'training', planId })}
        />
      )}
      {screen.name === 'exercise-catalog' && (
        <ExerciseCatalog
          onViewProgression={exerciseId => setScreen({ name: 'progression', exerciseId })}
        />
      )}
      {screen.name === 'training' && (
        <TrainingScreen
          planId={screen.planId}
          onFinish={() => setScreen({ name: 'history' })}
          onCancel={() => setScreen({ name: 'plan-list' })}
        />
      )}
      {screen.name === 'history' && (
        <HistoryScreen
          onEditEinheit={einheitId => setScreen({ name: 'einheit-editor', einheitId })}
        />
      )}
      {screen.name === 'progression' && (
        <ProgressionScreen
          initialExerciseId={screen.exerciseId}
          onBack={() => setScreen({ name: 'exercise-catalog' })}
        />
      )}
      {screen.name === 'einheit-editor' && (
        <EinheitEditor
          einheitId={screen.einheitId}
          onBack={() => setScreen({ name: 'history' })}
        />
      )}
      {screen.name === 'settings' && (
        <SettingsScreen
          onBack={() => setScreen({ name: 'plan-list' })}
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
