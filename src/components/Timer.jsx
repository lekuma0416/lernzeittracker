import { useState, useEffect, useRef } from 'react'
import { Play, Square, BookOpen } from 'lucide-react'
import { formatDuration } from '../lib/utils'

export default function Timer({ subjects, onSessionComplete }) {
  const [running, setRunning] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [selectedSubject, setSelectedSubject] = useState('')
  const [note, setNote] = useState('')
  const startRef = useRef(null)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (running) {
      startRef.current = new Date().toISOString()
      intervalRef.current = setInterval(() => setSeconds(s => s + 1), 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [running])

  const handleStop = async () => {
    if (!running) return
    setRunning(false)
    const endTime = new Date().toISOString()
    if (seconds < 5) { setSeconds(0); return }
    await onSessionComplete({
      subject_id: selectedSubject || null,
      started_at: startRef.current,
      ended_at: endTime,
      duration_seconds: seconds,
      note: note.trim() || null,
    })
    setSeconds(0)
    setNote('')
  }

  const subject = subjects.find(s => s.id === selectedSubject)

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
      <h2 className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider mb-4">Timer</h2>

      <div className="text-center mb-6">
        <div className="text-7xl font-mono font-bold tabular-nums" style={{ color: subject?.color ?? '#6366f1' }}>
          {formatDuration(seconds)}
        </div>
        {subject && (
          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm" style={{ backgroundColor: subject.color + '20', color: subject.color }}>
            <BookOpen size={12} />
            {subject.name}
          </div>
        )}
      </div>

      <div className="space-y-3 mb-6">
        <select
          value={selectedSubject}
          onChange={e => setSelectedSubject(e.target.value)}
          disabled={running}
          className="w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl px-4 py-2.5 border border-gray-200 dark:border-gray-700 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
        >
          <option value="">Kein Fach</option>
          {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Notiz zur Session (optional)"
          rows={2}
          className="w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl px-4 py-2.5 border border-gray-200 dark:border-gray-700 focus:outline-none focus:border-indigo-500 resize-none placeholder-gray-400 dark:placeholder-gray-600 text-sm"
        />
      </div>

      <div className="flex gap-3">
        {!running ? (
          <button onClick={() => setRunning(true)} className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition-colors">
            <Play size={18} />
            Starten
          </button>
        ) : (
          <button onClick={handleStop} className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white font-semibold py-3 rounded-xl transition-colors">
            <Square size={18} />
            Stoppen & Speichern
          </button>
        )}
      </div>
    </div>
  )
}
