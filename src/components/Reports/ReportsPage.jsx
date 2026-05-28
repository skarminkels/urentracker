import { useMemo } from 'react'
import { Clock, TrendingUp, DollarSign } from 'lucide-react'
import { getDayKey, getLast7Days, isSameDay } from '../../utils/time'

function formatHours(ms) {
  const h = ms / 3600000
  if (h < 0.1) return '0h'
  if (h < 1) return `${Math.round(h * 60)}m`
  return `${h.toFixed(1)}h`
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-5 flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: color + '20' }}>
        <Icon size={20} style={{ color }} />
      </div>
      <div>
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-gray-800 mt-0.5">{value}</p>
      </div>
    </div>
  )
}

function BarChart({ days, data, maxMs }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h2 className="text-sm font-semibold text-gray-700 mb-6">Last 7 days</h2>
      <div className="flex items-end gap-2 h-36">
        {days.map(day => {
          const ms = data[day.key] || 0
          const pct = maxMs > 0 ? (ms / maxMs) * 100 : 0
          return (
            <div key={day.key} className="flex-1 flex flex-col items-center gap-1.5">
              <span className="text-xs text-gray-400">{formatHours(ms)}</span>
              <div className="w-full flex flex-col justify-end" style={{ height: '80px' }}>
                <div
                  className="w-full rounded-t-lg transition-all"
                  style={{
                    height: `${Math.max(pct, ms > 0 ? 4 : 0)}%`,
                    backgroundColor: '#c95da7',
                    opacity: ms > 0 ? 1 : 0.15,
                    minHeight: ms > 0 ? '4px' : '0',
                  }}
                />
              </div>
              <span className="text-xs text-gray-400">{day.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function PieChart({ slices }) {
  if (slices.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center justify-center text-gray-300 h-64">
        No data
      </div>
    )
  }

  const total = slices.reduce((s, x) => s + x.value, 0)
  let cumulative = 0
  const segments = slices.map(s => {
    const start = cumulative
    const pct = s.value / total
    cumulative += pct
    return { ...s, start, pct }
  })

  const toCoords = (pct) => {
    const angle = pct * 2 * Math.PI - Math.PI / 2
    return {
      x: 50 + 40 * Math.cos(angle),
      y: 50 + 40 * Math.sin(angle),
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h2 className="text-sm font-semibold text-gray-700 mb-6">By project</h2>
      <div className="flex items-center gap-6">
        <svg viewBox="0 0 100 100" className="w-36 h-36 shrink-0">
          {segments.map((s, i) => {
            if (s.pct === 1) {
              return (
                <circle
                  key={i}
                  cx="50" cy="50" r="40"
                  fill="none"
                  stroke={s.color}
                  strokeWidth="20"
                />
              )
            }
            const start = toCoords(s.start)
            const end = toCoords(s.start + s.pct)
            const large = s.pct > 0.5 ? 1 : 0
            return (
              <path
                key={i}
                d={`M 50 50 L ${start.x} ${start.y} A 40 40 0 ${large} 1 ${end.x} ${end.y} Z`}
                fill={s.color}
              />
            )
          })}
          <circle cx="50" cy="50" r="22" fill="white" />
        </svg>
        <div className="flex-1 space-y-2">
          {segments.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
              <span className="text-sm text-gray-600 flex-1 truncate">{s.label}</span>
              <span className="text-xs font-medium text-gray-500">{formatHours(s.value)}</span>
              <span className="text-xs text-gray-300">
                {Math.round(s.pct * 100)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function ReportsPage({ entries, projects }) {
  const now = Date.now()
  const today = new Date()
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()
  const startOfWeek = startOfToday - today.getDay() * 86400000

  const completedEntries = entries.filter(e => e.endTime)

  const todayMs = completedEntries
    .filter(e => e.startTime >= startOfToday)
    .reduce((s, e) => s + (e.endTime - e.startTime), 0)

  const weekMs = completedEntries
    .filter(e => e.startTime >= startOfWeek)
    .reduce((s, e) => s + (e.endTime - e.startTime), 0)

  const billableMs = completedEntries
    .filter(e => e.billable && e.startTime >= startOfWeek)
    .reduce((s, e) => s + (e.endTime - e.startTime), 0)

  const days = getLast7Days()
  const dailyData = useMemo(() => {
    const map = {}
    completedEntries.forEach(e => {
      const key = getDayKey(e.startTime)
      map[key] = (map[key] || 0) + (e.endTime - e.startTime)
    })
    return map
  }, [completedEntries])

  const maxDayMs = Math.max(...days.map(d => dailyData[d.key] || 0), 1)

  const pieSlices = useMemo(() => {
    const map = {}
    completedEntries
      .filter(e => e.startTime >= startOfWeek)
      .forEach(e => {
        const key = e.projectId || '__none__'
        map[key] = (map[key] || 0) + (e.endTime - e.startTime)
      })

    return Object.entries(map)
      .filter(([, v]) => v > 0)
      .map(([key, value]) => {
        const project = projects.find(p => p.id === key)
        return {
          label: project ? project.name : 'No project',
          color: project ? project.color : '#d1d5db',
          value,
        }
      })
      .sort((a, b) => b.value - a.value)
  }, [completedEntries, projects, startOfWeek])

  return (
    <div className="flex-1 px-6 py-6 max-w-4xl w-full mx-auto">
      <h1 className="text-xl font-semibold text-gray-900 mb-6">Reports</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard icon={Clock} label="Today" value={formatHours(todayMs)} color="#c95da7" />
        <StatCard icon={TrendingUp} label="This week" value={formatHours(weekMs)} color="#4a9eff" />
        <StatCard icon={DollarSign} label="Billable this week" value={formatHours(billableMs)} color="#34d399" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <BarChart days={days} data={dailyData} maxMs={maxDayMs} />
        <PieChart slices={pieSlices} />
      </div>
    </div>
  )
}
