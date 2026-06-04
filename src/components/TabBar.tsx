import styles from './TabBar.module.css'

export type Tab = 'plans' | 'exercises' | 'history'

interface Props {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
}

export function TabBar({ activeTab, onTabChange }: Props) {
  return (
    <nav className={styles.tabBar}>
      <button
        className={`${styles.tab} ${activeTab === 'plans' ? styles.active : ''}`}
        onClick={() => onTabChange('plans')}
        aria-label="Pläne"
      >
        <span className={styles.icon}>📋</span>
        <span className={styles.label}>Pläne</span>
      </button>
      <button
        className={`${styles.tab} ${activeTab === 'exercises' ? styles.active : ''}`}
        onClick={() => onTabChange('exercises')}
        aria-label="Übungen"
      >
        <span className={styles.icon}>🏋</span>
        <span className={styles.label}>Übungen</span>
      </button>
      <button
        className={`${styles.tab} ${activeTab === 'history' ? styles.active : ''}`}
        onClick={() => onTabChange('history')}
        aria-label="Verlauf"
      >
        <span className={styles.icon}>📈</span>
        <span className={styles.label}>Verlauf</span>
      </button>
    </nav>
  )
}
