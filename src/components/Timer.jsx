import { useState, useEffect, useRef, useCallback } from 'react'
import { Play, Square, Pause, BookOpen } from 'lucide-react'
import { formatDuration } from '../lib/utils'
import SaveModal from './SaveModal'

const PAUSE_TIMEOUT_SECONDS = 5 * 60

export default function Timer({ subjects, onSessionComplete }) {
  const [running, setRunning] = useState(false)
  const [paused, setPaused] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [pauseCountdown, setPauseCountdown] = useState(0)
  const [selectedSubject, setSelectedSubject] = useState('')
  const [note, setNote] = useState('')
  const [draft, setDraft] = useState(null)

  // wallclock start + accumulated pause offset in ms
  const startTimeRef = useRef(null)     // Date.now() when timer started
  const sessionStartISORef = useRef(null) // ISO string für DB
  const pauseOffsetRef = useRef(0)      // total ms spent in pause
  const pauseBeganRef = useRef(null)    // Date.now() when current pause started
  const pauseStartISORef = useRef(null) // ISO when pause began (for ended_at)

  const intervalRef = useRef(null)
  const pauseIntervalRef = useRef(null)

  const getElapsed = useCallback(() => {
    if (!startTimeRef.current) return 0
    return Math.floor((Date.now() - startTimeRef.current - pauseOffsetRef.current) / 1000)
  }, [])

  const resetTimer = useCallback(() => {
    setSeconds(0)
    startTimeRef.current = null
    pauseOffsetRef.current = 0
    pauseBeganRef.current = null
    pauseStartISORef.current = null
    sessionStartISORef.current = null
  }, [])

  const openDraft = useCallback((durationSeconds) => {
    if (durationSeconds < 5) { resetTimer(); return }
    setDraft({
      subject_id: selectedSubject || null,
      started_at: sessionStartISORef.current,
      ended_at: pauseStartISORef.current ?? new Date().toISOString(),
      duration_seconds: durationSeconds,
      note: note.trim() || null,
    })
    resetTimer()
  }, [selectedSubject, note, resetTimer])

  const handleModalSave = async (session) => {
    await onSessionComplete(session)
    setDraft(null)
    setNote('')
  }

  const handleModalDiscard = () => {
    setDraft(null)
    setNote('')
  }

  // Haupttimer — liest Wanduhrzeit, immun gegen Tab-Throttling
  useEffect(() => {
    if (running && !paused) {
      intervalRef.current = setInterval(() => setSeconds(getElapsed()), 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [running, paused, getElapsed])

  // Pause-Countdown
  useEffect(() => {
    if (paused) {
      setPauseCountdown(PAUSE_TIMEOUT_SECONDS)
      pauseIntervalRef.current = setInterval(() => {
        setPauseCountdown(c => {
          if (c <= 1) {
            clearInterval(pauseIntervalRef.current)
            const dur = getElapsed()
            setRunning(false)
            setPaused(false)
            openDraft(dur)
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
  }, [paused, saveSession, getElapsed])

  const handleStart = () => {
    const now = Date.now()
    startTimeRef.current = now
    sessionStartISORef.current = new Date(now).toISOString()
    pauseOffsetRef.current = 0
    setSeconds(0)
    setRunning(true)
    setPaused(false)
  }

  const handlePause = () => {
    pauseBeganRef.current = Date.now()
    pauseStartISORef.current = new Date().toISOString()
    setPaused(true)
  }

  const handleResume = () => {
    // add time spent in pause to offset so elapsed stays correct
    if (pauseBeganRef.current) {
      pauseOffsetRef.current += Date.now() - pauseBeganRef.current
      pauseBeganRef.current = null
      pauseStartISORef.current = null
    }
    setPaused(false)
  }

  const handleStop = () => {
    const dur = getElapsed()
    setRunning(false)
    setPaused(false)
    openDraft(dur)
  }

  const subject = subjects.find(s => s.id === selectedSubject)
  const timerColor = subject?.color ?? '#6366f1'

  return (
    <>
    {draft && (
      <SaveModal
        draft={draft}
        subjects={subjects}
        onSave={handleModalSave}
        onDiscard={handleModalDiscard}
      />
    )}
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
    </>
  )
}
