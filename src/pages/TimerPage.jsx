import Timer from '../components/Timer'
import StatsCards from '../components/StatsCards'
import GoalsPanel from '../components/GoalsPanel'

export default function TimerPage({ subjects, sessions, goals, onSessionComplete, onAddGoal, onDeleteGoal }) {
  return (
    <div className="space-y-4">
      <StatsCards sessions={sessions} />
      <Timer subjects={subjects} onSessionComplete={onSessionComplete} />
      <GoalsPanel goals={goals} sessions={sessions} subjects={subjects} onAdd={onAddGoal} onDelete={onDeleteGoal} />
    </div>
  )
}
