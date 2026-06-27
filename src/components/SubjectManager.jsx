import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'

export default function SubjectManager({ subjects, onAdd, onDelete }) {
  const [name, setName] = useState('')

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    await onAdd(name.trim())
    setName('')
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800">
      <h2 className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider mb-4">Fächer</h2>
      <form onSubmit={handleAdd} className="flex gap-2 mb-4">
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Neues Fach..."
          className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl px-4 py-2.5 border border-gray-200 dark:border-gray-700 focus:outline-none focus:border-indigo-500 placeholder-gray-400 dark:placeholder-gray-600 text-sm"
        />
        <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl transition-colors">
          <Plus size={18} />
        </button>
      </form>
      <div className="space-y-2">
        {subjects.map(s => (
          <div key={s.id} className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-2.5">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
            <span className="text-gray-900 dark:text-white text-sm flex-1">{s.name}</span>
            <button onClick={() => onDelete(s.id)} className="text-gray-300 dark:text-gray-600 hover:text-red-400 transition-colors">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        {subjects.length === 0 && (
          <p className="text-gray-400 dark:text-gray-600 text-sm text-center py-4">Noch keine Fächer</p>
        )}
      </div>
    </div>
  )
}
