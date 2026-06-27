import CalendarView from '../components/CalendarView'

export default function CalendarPage({ sessions, subjects }) {
  return (
    <div className="space-y-4">
      <CalendarView sessions={sessions} subjects={subjects} />
    </div>
  )
}
