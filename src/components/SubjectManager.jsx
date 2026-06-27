import { useState } from 'react'
import { Plus, Trash2, Check } from 'lucide-react'

const COLORS = [
  '#6366f1', '#f59e0b', '#10b981', '#ef4444',
  '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6',
  '#f97316', '#84cc16', '#06b6d4', '#e11d48',
]

function ColorPicker({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {COLORS.map(c => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          className="w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110"
          style={{ backgroundColor: c }}
        >
          {value === c && <Check size={13} color="white" strokeWidth={3} />}
        </button>
      ))}
      <input
        type="color"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-7 h-7 rounded-full border-0 cursor-pointer bg-transparent"
        title="Eigene Farbe wählen"
      />
    </div>
  )
}

export default function SubjectManager({ subjects, onAdd, onUpdate, onDelete }) {
  const [name, setName] = useState('')
  const [color, setColor] = useState(COLORS[0])
  const [editingColor, setEditingColor] = useState(null)

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    await onAdd(name.trim(), color)
    setName('')
    setColor(COLORS[subjects.length % COLORS.length] ?? COLORS[0])
  }

  const handleColorChange = async (id, newColor) => {
    await onUpdate(id, { color: newColor })
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800">
      <h2 className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider mb-4">Fächer</h2>

      <form onSubmit={handleAdd} className="mb-4 space-y-2">
        <div className="flex gap-2">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Neues Fach..."
            className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl px-4 py-2.5 border border-gray-200 dark:border-gray-700 focus:outline-none focus:border-indigo-500 placeholder-gray-400 dark:placeholder-gray-600 text-sm"
          />
          <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl transition-colors">
            <Plus size={18} />
          </button>
        </div>
        <div className="px-1">
          <p className="text-gray-400 dark:text-gray-500 text-xs mb-1">Farbe wählen</p>
          <ColorPicker value={color} onChange={setColor} />
        </div>
      </form>

      <div className="space-y-2">
        {subjects.map(s => (
          <div key={s.id} className="bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setEditingColor(editingColor === s.id ? null : s.id)}
                className="w-5 h-5 rounded-full flex-shrink-0 ring-2 ring-offset-2 ring-offset-gray-50 dark:ring-offset-gray-800 transition-transform hover:scale-110"
                style={{ backgroundColor: s.color, ringColor: s.color }}
                title="Farbe ändern"
              />
              <span className="text-gray-900 dark:text-white text-sm flex-1">{s.name}</span>
              <button onClick={() => onDelete(s.id)} className="text-gray-300 dark:text-gray-600 hover:text-red-400 transition-colors">
                <Trash2 size={14} />
              </button>
            </div>
            {editingColor === s.id && (
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <p className="text-gray-400 dark:text-gray-500 text-xs mb-2">Farbe ändern</p>
                <ColorPicker
                  value={s.color}
                  onChange={(c) => handleColorChange(s.id, c)}
                />
              </div>
            )}
          </div>
        ))}
        {subjects.length === 0 && (
          <p className="text-gray-400 dark:text-gray-600 text-sm text-center py-4">Noch keine Fächer</p>
        )}
      </div>
    </div>
  )
}
