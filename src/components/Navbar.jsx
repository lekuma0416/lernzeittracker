import { supabase } from '../lib/supabase'
import { LogOut, Clock, BookOpen, BarChart2, Calendar, Sun, Moon } from 'lucide-react'
import { useTheme } from '../hooks/useTheme'

const TABS = [
  { id: 'timer', label: 'Timer', icon: Clock },
  { id: 'stats', label: 'Statistiken', icon: BarChart2 },
  { id: 'calendar', label: 'Kalender', icon: Calendar },
  { id: 'subjects', label: 'Fächer', icon: BookOpen },
]

export default function Navbar({ activeTab, setActiveTab }) {
  const { theme, toggle } = useTheme()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-4 pb-safe z-50 md:static md:border-t-0 md:border-b">
      <div className="max-w-2xl mx-auto flex items-center justify-between py-2">
        <span className="hidden md:block text-gray-900 dark:text-white font-bold text-lg">Lernzeit</span>
        <div className="flex items-center gap-1 w-full md:w-auto justify-around md:justify-end md:gap-2">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex flex-col md:flex-row items-center gap-1 md:gap-1.5 px-3 py-2 rounded-xl text-xs md:text-sm font-medium transition-colors ${
                activeTab === id ? 'text-indigo-500 bg-indigo-500/10' : 'text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Icon size={20} strokeWidth={activeTab === id ? 2.5 : 2} />
              <span>{label}</span>
            </button>
          ))}
          <button
            onClick={toggle}
            className="text-gray-400 dark:text-gray-600 hover:text-gray-700 dark:hover:text-gray-300 transition-colors p-2"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            onClick={() => supabase.auth.signOut()}
            className="text-gray-400 dark:text-gray-600 hover:text-red-400 transition-colors p-2"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </nav>
  )
}
