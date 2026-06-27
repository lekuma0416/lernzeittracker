import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const DAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

function getLast7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - 6 + i)
    return d.toISOString().split('T')[0]
  })
}

export default function WeekChart({ sessions }) {
  const days = getLast7Days()
  const map = {}
  sessions.forEach(s => {
    const day = s.started_at.split('T')[0]
    map[day] = (map[day] ?? 0) + (s.duration_seconds ?? 0)
  })

  const todayISO = new Date().toISOString().split('T')[0]
  const data = days.map((iso, i) => ({
    day: DAYS[(new Date(iso).getDay() + 6) % 7],
    minutes: Math.round((map[iso] ?? 0) / 60),
    isToday: iso === todayISO,
  }))

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    const min = payload[0].value
    const h = Math.floor(min / 60)
    const m = min % 60
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm">
        <p className="text-gray-400">{label}</p>
        <p className="text-white font-semibold">{h > 0 ? `${h}h ${m}min` : `${m}min`}</p>
      </div>
    )
  }

  return (
    <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
      <h2 className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-4">Letzte 7 Tage</h2>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={data} barSize={28}>
          <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
          <YAxis hide />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
          <Bar dataKey="minutes" radius={[6, 6, 0, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.isToday ? '#6366f1' : '#374151'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
