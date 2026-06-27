import { useState, useEffect, useRef, useCallback } from 'react'
import { Play, Square, Pause, BookOpen } from 'lucide-react'
import { formatDuration } from '../lib/utils'

const PAUSE_TIMEOUT_SECONDS = 5 * 60

export default function Timer({ subjects, onSessionComplete }) {
  const [running, setRunning] = useState(false)
  const [paused, setPaused] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [pauseCountdown, setPauseCountdown] = useState(0)
  const [selectedSubject, setSelectedSubject] = useState('')
  const [note, setNote] = useState('')

  const startRef = useRef(null)
  const sessionSecondsRef = useRef(0)
  const pauseStartRef = useRef(null)
  const intervalRef = useRef(null)
  const pauseIntervalRef = useRef(null)

  const saveSession = useCallback(async (durationSeconds) => {
    if (durationSeconds < 5) return
    await onSessionComplete({
      subject_id: selectedSubject || null,
      started_at: startRef.current,
      ended_at: pauseStartRef.current ?? new Date().toISOString(),
      duration_seconds: durationSeconds,
      note: note.trim() || null,
    })
    setSeconds(0)
    setNote('')
    sessionSecondsRef.current = 0
    startRef.current = null
    pauseStartRef.current = null
  }, [selectedSubject, note, onSessionComplete])

  // Haupttimer
  useEffect(() => {
    if (running && !paused) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => s + 1)
        sessionSecondsRef.current += 1
      }, 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [running, paused])

  // Pause-Countdown → auto-stop nach 5 min
  useEffect(() => {
    if (paused) {
      setPauseCountdown(PAUSE_TIMEOUT_SECONDS)
      pauseIntervalRef.current = setInterval(() => {
        setPauseCountdown(c => {
          if (c <= 1) {
            clearInterval(pauseIntervalRef.current)
            // Auto-save und reset
            const dur = sessionSecondsRef.current
            setRunning(false)
            setPaused(false)
            setSeconds(0)
            saveSession(dur)
            return 0
          }
          return c - 1
        })
      }, 1000)
    } else {
      clearInterval(pauseIntervalRef.current)
      setPauseCountdown(0)
    }
    return () => clearInterval(pauseIntervalRef.current)
  }, [paused, saveSession])

  const handleStart = () => {
    startRef.current = new Date().toISOString()
    sessionSecondsRef.current = 0
    setSeconds(0)
    setRunning(true)
    setPaused(false)
  }

  const handlePause = () => {
    pauseStartRef.current = new Date().toISOString()
    setPaused(true)
  }

  const handleResume = () => {
    pauseStartRef.current = null
    setPaused(false)
  }

  const handleStop = async () => {
    const dur = sessionSecondsRef.current
    setRunning(false)
    setPaused(false)
    await saveSession(dur)
  }

  const subject = subjects.find(s => s.id === selectedSubject)
  const timerColor = subject?.color ?? '#6366f1'

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
      <h2 className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider mb-4">Timer</h2>

      <div className="text-center mb-6">
        <div
          className="text-7xl font-mono font-bold tabular-nums transition-opacity"
          style={{ color: timerColor, opacity: paused ? 0.4 : 1 }}
        >
          {formatDuration(seconds)}
        </div>

        {subject && (
          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm" style={{ backgroundColor: subject.color + '20', color: subject.color }}>
            <BookOpen size={12} />
            {subject.name}
          </div>
        )}

        {paused && (
          <div className="mt-3 flex flex-col items-center gap-1">
            <span className="text-amber-500 dark:text-amber-400 text-sm font-medium">Pausiert</span>
            <span className="text-gray-400 text-xs">
              Automatisch gespeichert in {formatDuration(pauseCountdown)}
            </span>
            <div className="w-48 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mt-1">
              <div
                className="h-full bg-amber-400 rounded-full transition-all duration-1000"
                style={{ width: `${(pauseCountdown / PAUSE_TIMEOUT_SECONDS) * 100}%` }}
              />
            </div>
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
          <button onClick={handleStart} className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition-colors">
            <Play size={18} />
            Starten
          </button>
        ) : (
          <>
            {paused ? (
              <button onClick={handleResume} className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition-colors">
                <Play size={18} />
                Weiter
              </button>
            ) : (
              <button onClick={handlePause} className="flex-1 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-semibold py-3 rounded-xl transition-colors">
                <Pause size={18} />
                Pause
              </button>
            )}
            <button onClick={handleStop} className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white font-semibold py-3 rounded-xl transition-colors">
              <Square size={18} />
              Stoppen
            </button>
          </>
        )}
      </div>
    </div>
  )
}
