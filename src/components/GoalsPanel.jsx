import { useState } from 'react'
import { Plus, Trash2, Target } from 'lucide-react'
import { todayISO, startOfWeek, formatDurationHuman } from '../lib/utils'

function GoalProgress({ goal, sessions, subjects }) {
  const subject = subjects.find(s => s.id === goal.subject_id)

  const now = new Date().toISOString()
  const filtered = sessions.filter(s => {
    const matchSubject = !goal.subject_id || s.subject_id === goal.subject_id
    if (goal.period === 'daily') return matchSubject && s.started_at.startsWith(todayISO())
    if (goal.period === 'weekly') return matchSubject && s.started_at >= startOfWeek()
    return matchSubject
  })

  const done = filtered.reduce((a, s) => a + (s.duration_seconds ?? 0), 0)
  const target = goal.target_seconds
  const pct = Math.min(100, Math.round((done / target) * 100))

  return (
    <div className="bg-gray-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {subject && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: subject.color }} />}
          <span className="text-white text-sm font-medium">
            {subject?.name ?? 'Gesamt'} — {goal.period === 'daily' ? 'täglich' : 'wöchentlich'}
          </span>
        </div>
        <span className="text-gray-400 text-xs">{pct}%</span>
      </div>
      <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: subject?.color ?? '#6366f1' }}
        />
      </div>
      <div className="flex justify-between mt-1.5">
        <span className="text-gray-500 text-xs">{formatDurationHuman(done)}</span>
        <span className="text-gray-500 text-xs">Ziel: {formatDurationHuman(target)}</span>
      </div>
    </div>
  )
}

export default function GoalsPanel({ goals, sessions, subjects, onAdd, onDelete }) {
  const [subjectId, setSubjectId] = useState('')
  const [period, setPeriod] = useState('daily')
  const [hours, setHours] = useState(1)
  const [minutes, setMinutes] = useState(0)
  const [adding, setAdding] = useState(false)

  const handleAdd = async (e) => {
    e.preventDefault()
    const seconds = hours * 3600 + minutes * 60
    if (seconds < 60) return
    await onAdd({ subject_id: subjectId || null, period, target_seconds: seconds })
    setAdding(false)
    setHours(1); setMinutes(0); setSubjectId(''); setPeriod('daily')
  }

  return (
    <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-gray-400 text-sm font-medium uppercase tracking-wider">Ziele</h2>
        <button onClick={() => setAdding(!adding)} className="text-indigo-400 hover:text-indigo-300 transition-colors">
          <Plus size={18} />
        </button>
      </div>

      {adding && (
        <form onSubmit={handleAdd} className="bg-gray-800 rounded-xl p-4 mb-4 space-y-3">
          <select value={subjectId} onChange={e => setSubjectId(e.target.value)} className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm border border-gray-600 focus:outline-none focus:border-indigo-500">
            <option value="">Alle Fächer</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select value={period} onChange={e => setPeriod(e.target.value)} className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm border border-gray-600 focus:outline-none focus:border-indigo-500">
            <option value="daily">Täglich</option>
            <option value="weekly">Wöchentlich</option>
          </select>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-gray-500 text-xs mb-1 block">Stunden</label>
              <input type="number" min="0" max="24" value={hours} onChange={e => setHours(Number(e.target.value))} className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm border border-gray-600 focus:outline-none focus:border-indigo-500" />
            </div>
            <div className="flex-1">
              <label className="text-gray-500 text-xs mb-1 block">Minuten</label>
              <input type="number" min="0" max="59" value={minutes} onChange={e => setMinutes(Number(e.target.value))} className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm border border-gray-600 focus:outline-none focus:border-indigo-500" />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg py-2 text-sm font-medium transition-colors">Speichern</button>
            <button type="button" onClick={() => setAdding(false)} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white rounded-lg py-2 text-sm transition-colors">Abbrechen</button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {goals.length === 0 && !adding && <p className="text-gray-600 text-sm text-center py-4">Noch keine Ziele gesetzt</p>}
        {goals.map(goal => (
          <div key={goal.id} className="relative group">
            <GoalProgress goal={goal} sessions={sessions} subjects={subjects} />
            <button
              onClick={() => onDelete(goal.id)}
              className="absolute top-3 right-3 text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
