import { useState } from 'react'
import { Trash2, BookOpen, StickyNote, ChevronUp, Pencil, Check, X } from 'lucide-react'
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

function EditForm({ session, subjects, onSave, onCancel }) {
  const totalMin = Math.round((session.duration_seconds ?? 0) / 60)
  const [hours, setHours] = useState(Math.floor(totalMin / 60))
  const [minutes, setMinutes] = useState(totalMin % 60)
  const [subjectId, setSubjectId] = useState(session.subject_id ?? '')
  const [note, setNote] = useState(session.note ?? '')

  const handleSave = () => {
    const seconds = hours * 3600 + minutes * 60
    if (seconds < 1) return
    onSave({ subject_id: subjectId || null, duration_seconds: seconds, note: note.trim() || null })
  }

  const inputCls = "w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 focus:outline-none focus:border-indigo-500"

  return (
    <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-700 mt-2">
      <select value={subjectId} onChange={e => setSubjectId(e.target.value)} className={inputCls}>
        <option value="">Kein Fach</option>
        {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
      </select>
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="text-gray-400 text-xs mb-1 block">Stunden</label>
          <input type="number" min="0" max="24" value={hours} onChange={e => setHours(Number(e.target.value))} className={inputCls} />
        </div>
        <div className="flex-1">
          <label className="text-gray-400 text-xs mb-1 block">Minuten</label>
          <input type="number" min="0" max="59" value={minutes} onChange={e => setMinutes(Number(e.target.value))} className={inputCls} />
        </div>
      </div>
      <textarea
        value={note}
        onChange={e => setNote(e.target.value)}
        placeholder="Notiz..."
        rows={2}
        className={`${inputCls} resize-none placeholder-gray-400 dark:placeholder-gray-600`}
      />
      <div className="flex gap-2">
        <button onClick={handleSave} className="flex-1 flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg py-2 text-sm font-medium transition-colors">
          <Check size={14} /> Speichern
        </button>
        <button onClick={onCancel} className="flex-1 flex items-center justify-center gap-1.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg py-2 text-sm transition-colors">
          <X size={14} /> Abbrechen
        </button>
      </div>
    </div>
  )
}

export default function SessionHistory({ sessions, subjects, onDelete, onUpdate, filterSubject, setFilterSubject }) {
  const [expandedNote, setExpandedNote] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const subjectMap = Object.fromEntries(subjects.map(s => [s.id, s]))
  const filtered = filterSubject ? sessions.filter(s => s.subject_id === filterSubject) : sessions
  const grouped = groupByDate(filtered)

  const handleSave = async (id, updates) => {
    await onUpdate(id, updates)
    setEditingId(null)
  }

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
                    const isEditing = editingId === session.id
                    const hasNote = !!session.note
                    const noteOpen = expandedNote === session.id

                    return (
                      <div key={session.id} className="bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3">
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
                          {hasNote && !isEditing && (
                            <button onClick={() => setExpandedNote(noteOpen ? null : session.id)} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
                              {noteOpen ? <ChevronUp size={14} /> : <StickyNote size={14} />}
                            </button>
                          )}
                          <button
                            onClick={() => { setEditingId(isEditing ? null : session.id); setExpandedNote(null) }}
                            className={`transition-colors ${isEditing ? 'text-indigo-500' : 'text-gray-300 dark:text-gray-600 hover:text-indigo-400'}`}
                          >
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => onDelete(session.id)} className="text-gray-300 dark:text-gray-600 hover:text-red-400 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>

                        {!isEditing && noteOpen && session.note && (
                          <p className="text-gray-500 dark:text-gray-400 text-xs mt-1 leading-relaxed border-t border-gray-200 dark:border-gray-700 pt-2">{session.note}</p>
                        )}

                        {isEditing && (
                          <EditForm
                            session={session}
                            subjects={subjects}
                            onSave={(updates) => handleSave(session.id, updates)}
                            onCancel={() => setEditingId(null)}
                          />
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
