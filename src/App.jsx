import { useState } from 'react'
import { useAuth } from './hooks/useAuth'
import { useTheme } from './hooks/useTheme'
import { useSessions } from './hooks/useSessions'
import { useSubjects } from './hooks/useSubjects'
import { useGoals } from './hooks/useGoals'
import AuthPage from './components/AuthPage'
import Navbar from './components/Navbar'
import TimerPage from './pages/TimerPage'
import StatsPage from './pages/StatsPage'
import CalendarPage from './pages/CalendarPage'
import SubjectsPage from './pages/SubjectsPage'

export default function App() {
  useTheme()
  const { user, loading } = useAuth()
  const { sessions, addSession, deleteSession } = useSessions(user?.id)
  const { subjects, addSubject, updateSubject, deleteSubject } = useSubjects(user?.id)
  const { goals, upsertGoal, deleteGoal } = useGoals(user?.id)
  const [activeTab, setActiveTab] = useState('timer')

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return <AuthPage />

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="max-w-2xl mx-auto px-4 pt-6 pb-24 md:pb-6">
        {activeTab === 'timer' && (
          <TimerPage
            subjects={subjects}
            sessions={sessions}
            goals={goals}
            onSessionComplete={addSession}
            onAddGoal={upsertGoal}
            onDeleteGoal={deleteGoal}
          />
        )}
        {activeTab === 'stats' && (
          <StatsPage sessions={sessions} subjects={subjects} onDeleteSession={deleteSession} />
        )}
        {activeTab === 'calendar' && (
          <CalendarPage sessions={sessions} subjects={subjects} />
        )}
        {activeTab === 'subjects' && (
          <SubjectsPage subjects={subjects} onAdd={addSubject} onUpdate={updateSubject} onDelete={deleteSubject} />
        )}
      </main>
    </div>
  )
}
