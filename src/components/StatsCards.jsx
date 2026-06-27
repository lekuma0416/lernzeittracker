import { formatDurationHuman, todayISO, startOfWeek, startOfMonth } from '../lib/utils'

function StatCard({ label, value, sub }) {
  return (
    <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
      <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
      {sub && <p className="text-gray-500 text-xs mt-1">{sub}</p>}
    </div>
  )
}

export default function StatsCards({ sessions }) {
  const today = todayISO()
  const weekStart = startOfWeek()
  const monthStart = startOfMonth()

  const sum = (list) => list.reduce((a, s) => a + (s.duration_seconds ?? 0), 0)

  const todaySessions = sessions.filter(s => s.started_at.startsWith(today))
  const weekSessions = sessions.filter(s => s.started_at >= weekStart)
  const monthSessions = sessions.filter(s => s.started_at >= monthStart)

  return (
    <div className="grid grid-cols-3 gap-3">
      <StatCard label="Heute" value={formatDurationHuman(sum(todaySessions))} sub={`${todaySessions.length} Session${todaySessions.length !== 1 ? 's' : ''}`} />
      <StatCard label="Diese Woche" value={formatDurationHuman(sum(weekSessions))} sub={`${weekSessions.length} Sessions`} />
      <StatCard label="Dieser Monat" value={formatDurationHuman(sum(monthSessions))} sub={`${monthSessions.length} Sessions`} />
    </div>
  )
}
