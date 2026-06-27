import { useState } from 'react'
import { X, Check } from 'lucide-react'

function toLocalDateTimeInput(iso) {
  const d = new Date(iso)
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function SaveModal({ draft, subjects, onSave, onDiscard }) {
  const [startedAt, setStartedAt] = useState(toLocalDateTimeInput(draft.started_at))
  const [hours, setHours] = useState(Math.floor(draft.duration_seconds / 3600))
  const [minutes, setMinutes] = useState(Math.floor((draft.duration_seconds % 3600) / 60))
  const [note, setNote] = useState(draft.note ?? '')
  const [subjectId, setSubjectId] = useState(draft.subject_id ?? '')

  const handleSave = () => {
    const durationSeconds = hours * 3600 + minutes * 60
    if (durationSeconds < 5) return
    const startISO = new Date(startedAt).toISOString()
    const endISO = new Date(new Date(startedAt).getTime() + durationSeconds * 1000).toISOString()
    onSave({
      subject_id: subjectId || null,
      started_at: startISO,
      ended_at: endISO,
      duration_seconds: durationSeconds,
      note: note.trim() || null,
    })
  }

  const inputCls = "w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl px-4 py-2.5 border border-gray-200 dark:border-gray-700 focus:outline-none focus:border-indigo-500 text-sm"

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl">
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-gray-900 dark:text-white font-semibold">Session speichern</h2>
          <button onClick={onDiscard} className="text-gray-400 hover:text-red-400 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">Fach</label>
            <select value={subjectId} onChange={e => setSubjectId(e.target.value)} className={inputCls}>
              <option value="">Kein Fach</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <div>
            <label className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">Startzeit</label>
            <input
              type="datetime-local"
              value={startedAt}
              onChange={e => setStartedAt(e.target.value)}
              className={inputCls}
            />
          </div>

          <div>
            <label className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">Dauer</label>
            <div className="flex gap-3">
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="number" min="0" max="24" value={hours}
                    onChange={e => setHours(Number(e.target.value))}
                    className={inputCls + ' pr-14'}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">Std</span>
                </div>
              </div>
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="number" min="0" max="59" value={minutes}
                    onChange={e => setMinutes(Number(e.target.value))}
                    className={inputCls + ' pr-14'}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">Min</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">Notiz</label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Was hast du gelernt?"
              rows={3}
              className={inputCls + ' resize-none placeholder-gray-400 dark:placeholder-gray-600'}
            />
          </div>
        </div>

        <div className="flex gap-3 px-5 pb-5">
          <button
            onClick={onDiscard}
            className="flex-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium py-3 rounded-xl transition-colors text-sm"
          >
            Verwerfen
          </button>
          <button
            onClick={handleSave}
            className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
          >
            <Check size={16} />
            Speichern
          </button>
        </div>
      </div>
    </div>
  )
}
