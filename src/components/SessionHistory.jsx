import { useState } from 'react'
import { Trash2, BookOpen, StickyNote, ChevronUp } from 'lucide-react'
import { formatDurationHuman } from '../lib/utils'

function groupByDate(sessions) {
  const map = {}
  sessions.forEach(s => {
    const day = s.started_at.split('T')[0]
    if (!map[day]) map[day] = []
    map[day].push(s)
  })
  return Object.entries(map).sort(([a], [b]) => b.localeCompare(a))
}

function formatDate(iso) {
  const d = new Date(iso)
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
  if (iso === today) return 'Heute'
  if (iso === yesterday) return 'Gestern'
  return d.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })
}

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
}

export default function SessionHistory({ sessions, subjects, onDelete, filterSubject, setFilterSubject }) {
  const [expandedNote, setExpandedNote] = useState(null)
  const subjectMap = Object.fromEntries(subjects.map(s => [s.id, s]))
  const filtered = filterSubject ? sessions.filter(s => s.subject_id === filterSubject) : sessions
  const grouped = groupByDate(filtered)

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider">Verlauf</h2>
        <select
          value={filterSubject}
          onChange={e => setFilterSubject(e.target.value)}
          className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white text-sm rounded-lg px-3 py-1.5 border border-gray-200 dark:border-gray-700 focus:outline-none focus:border-indigo-500"
        >
          <option value="">Alle Fächer</option>
          {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      {grouped.length === 0 ? (
        <p className="text-gray-400 dark:text-gray-600 text-sm text-center py-8">Noch keine Sessions</p>
      ) : (
        <div className="space-y-5">
          {grouped.map(([date, daySessions]) => {
            const totalSeconds = daySessions.reduce((a, s) => a + (s.duration_seconds ?? 0), 0)
            return (
              <div key={date}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">{formatDate(date)}</span>
                  <span className="text-gray-400 dark:text-gray-500 text-xs">{formatDurationHuman(totalSeconds)}</span>
                </div>
                <div className="space-y-2">
                  {daySessions.map(session => {
                    const subj = subjectMap[session.subject_id]
                    const hasNote = !!session.note
                    const noteOpen = expandedNote === session.id
                    return (
                      <div key={session.id} className="bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 flex flex-col gap-1">
                        <div className="flex items-center gap-3">
                          {subj ? (
                            <div className="flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: subj.color + '20', color: subj.color }}>
                              <BookOpen size={10} />
                              {subj.name}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400 dark:text-gray-600">Kein Fach</span>
                          )}
                          <span className="text-gray-400 dark:text-gray-500 text-xs ml-auto">{formatTime(session.started_at)}</span>
                          <span className="text-gray-900 dark:text-white text-sm font-semibold">{formatDurationHuman(session.duration_seconds)}</span>
                          {hasNote && (
                            <button onClick={() => setExpandedNote(noteOpen ? null : session.id)} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
                              {noteOpen ? <ChevronUp size={14} /> : <StickyNote size={14} />}
                            </button>
                          )}
                          <button onClick={() => onDelete(session.id)} className="text-gray-300 dark:text-gray-600 hover:text-red-400 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                        {noteOpen && session.note && (
                          <p className="text-gray-500 dark:text-gray-400 text-xs mt-1 leading-relaxed border-t border-gray-200 dark:border-gray-700 pt-2">{session.note}</p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
