import { useState } from 'react'
import WeekChart from '../components/WeekChart'
import SessionHistory from '../components/SessionHistory'

export default function StatsPage({ sessions, subjects, onDeleteSession, onUpdateSession }) {
  const [filterSubject, setFilterSubject] = useState('')

  return (
    <div className="space-y-4">
      <WeekChart sessions={sessions} />
      <SessionHistory
        sessions={sessions}
        subjects={subjects}
        onDelete={onDeleteSession}
        onUpdate={onUpdateSession}
        filterSubject={filterSubject}
        setFilterSubject={setFilterSubject}
      />
    </div>
  )
}
