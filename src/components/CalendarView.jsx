import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { formatDurationHuman } from '../lib/utils'

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year, month) {
  return (new Date(year, month, 1).getDay() + 6) % 7
}

export default function CalendarView({ sessions, subjects }) {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())

  const subjectMap = Object.fromEntries(subjects.map(s => [s.id, s]))

  const sessionsByDay = {}
  sessions.forEach(s => {
    const d = new Date(s.started_at)
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate()
      if (!sessionsByDay[day]) sessionsByDay[day] = { seconds: 0, subjects: new Set() }
      sessionsByDay[day].seconds += s.duration_seconds ?? 0
      if (s.subject_id) sessionsByDay[day].subjects.add(s.subject_id)
    }
  })

  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)
  const todayDate = now.getDate()
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth()
  const maxSeconds = Math.max(...Object.values(sessionsByDay).map(d => d.seconds), 1)

  const prevMonth = () => { if (month === 0) { setYear(y => y - 1); setMonth(11) } else setMonth(m => m - 1) }
  const nextMonth = () => { if (month === 11) { setYear(y => y + 1); setMonth(0) } else setMonth(m => m + 1) }
  const monthName = new Date(year, month, 1).toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors p-1"><ChevronLeft size={18} /></button>
        <h2 className="text-gray-900 dark:text-white font-medium capitalize">{monthName}</h2>
        <button onClick={nextMonth} className="text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors p-1"><ChevronRight size={18} /></button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(d => (
          <div key={d} className="text-center text-gray-400 dark:text-gray-600 text-xs py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
          const data = sessionsByDay[day]
          const isToday = isCurrentMonth && day === todayDate
          const intensity = data ? Math.max(0.15, data.seconds / maxSeconds) : 0
          const subjColors = data ? [...data.subjects].map(id => subjectMap[id]?.color).filter(Boolean) : []

          return (
            <div
              key={day}
              className={`relative aspect-square rounded-lg flex flex-col items-center justify-center text-xs transition-colors ${isToday ? 'ring-2 ring-indigo-500' : ''}`}
              style={{ backgroundColor: data ? `rgba(99,102,241,${intensity * 0.6})` : undefined }}
              title={data ? formatDurationHuman(data.seconds) : ''}
            >
              <div className={`w-full h-full rounded-lg flex flex-col items-center justify-center ${!data ? 'bg-gray-100 dark:bg-gray-800' : ''}`}>
                <span className={`font-medium ${isToday ? 'text-indigo-500' : data ? 'text-white' : 'text-gray-500 dark:text-gray-600'}`}>{day}</span>
                {subjColors.length > 0 && (
                  <div className="flex gap-0.5 mt-0.5">
                    {subjColors.slice(0, 3).map((c, i) => (
                      <div key={i} className="w-1 h-1 rounded-full" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
