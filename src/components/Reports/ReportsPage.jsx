import { useState, useMemo } from 'react'
import { Clock, TrendingUp } from 'lucide-react'
import { getDayKey, getLast7Days, getLast12Months } from '../../utils/time'
import { calcEarnings, formatCurrency } from '../../utils/currency'

// ─── helpers ──────────────────────────────────────────────────────────────────

function formatHours(ms) {
  const h = ms / 3600000
  if (h < 0.1) return '0h'
  if (h < 1) return `${Math.round(h * 60)}m`
  return `${h.toFixed(1)}h`
}

function startOfDay(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
}

function startOfWeekMonday(d = new Date()) {
  const day = d.getDay() === 0 ? 6 : d.getDay() - 1
  return startOfDay(d) - day * 86400000
}

function startOfMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 1).getTime()
}

function startOfYear(d = new Date()) {
  return new Date(d.getFullYear(), 0, 1).getTime()
}

function formatMonthYear(ts) {
  return new Date(ts).toLocaleDateString('nl-BE', { month: 'long', year: 'numeric' })
}

// ─── shared card ──────────────────────────────────────────────────────────────

const cardBaseStyle = {
  backgroundColor: '#f6f3ee',
  border: '1px solid rgba(43,42,39,0.06)',
}

function HoverCard({ className, style, children }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      className={className}
      style={{
        ...cardBaseStyle,
        ...style,
        boxShadow: hovered
          ? '0 28px 56px rgba(55,44,22,0.13)'
          : '0 20px 40px rgba(55,44,22,0.06)',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        transition: 'box-shadow 200ms ease, transform 200ms ease',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </div>
  )
}

// ─── sub-components ────────────────────────────────────────────────────────────

function EarningsCard({ label, amount, hours, subtitle, large, currency }) {
  return (
    <HoverCard className="rounded-2xl p-5 flex flex-col gap-1">
      <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#7c776f' }}>{label}</p>
      <p className={`font-bold ${large ? 'text-3xl' : 'text-xl'}`} style={{ color: '#2b2a27' }}>
        {formatCurrency(amount, currency)}
      </p>
      <p className="text-xs" style={{ color: '#7c776f' }}>{formatHours(hours)} · {subtitle}</p>
    </HoverCard>
  )
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <HoverCard className="rounded-2xl px-6 py-5 flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: color + '18' }}>
        <Icon size={20} style={{ color }} />
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide" style={{ color: '#7c776f' }}>{label}</p>
        <p className="text-2xl font-bold mt-0.5" style={{ color: '#2b2a27' }}>{value}</p>
      </div>
    </HoverCard>
  )
}

function TimeBarChart({ days, data, maxMs }) {
  return (
    <HoverCard className="rounded-2xl p-6">
      <h2 className="text-sm font-semibold mb-6" style={{ color: '#2b2a27' }}>Last 7 days — time</h2>
      <div className="flex items-end gap-2 h-36">
        {days.map(day => {
          const ms = data[day.key] || 0
          const pct = maxMs > 0 ? (ms / maxMs) * 100 : 0
          return (
            <div key={day.key} className="flex-1 flex flex-col items-center gap-1.5">
              <span className="text-xs" style={{ color: '#7c776f' }}>{formatHours(ms)}</span>
              <div className="w-full flex flex-col justify-end" style={{ height: '80px' }}>
                <div
                  className="w-full rounded-t-lg transition-[height,background-color] duration-300 ease-out"
                  style={{
                    height: `${Math.max(pct, ms > 0 ? 4 : 0)}%`,
                    backgroundColor: '#f1c93b',
                    opacity: ms > 0 ? 1 : 0.2,
                    minHeight: ms > 0 ? '4px' : '0',
                  }}
                />
              </div>
              <span className="text-xs" style={{ color: '#7c776f' }}>{day.label}</span>
            </div>
          )
        })}
      </div>
    </HoverCard>
  )
}

function PieChart({ slices }) {
  if (slices.length === 0) {
    return (
      <HoverCard className="rounded-2xl p-6 flex items-center justify-center h-64" style={{ color: '#c0b8ae' }}>
        No data
      </HoverCard>
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
    return { x: 50 + 40 * Math.cos(angle), y: 50 + 40 * Math.sin(angle) }
  }
  return (
    <HoverCard className="rounded-2xl p-6">
      <h2 className="text-sm font-semibold mb-6" style={{ color: '#2b2a27' }}>By project — time this week</h2>
      <div className="flex items-center gap-6">
        <svg viewBox="0 0 100 100" className="w-36 h-36 shrink-0">
          {segments.map((s, i) => {
            if (s.pct === 1) return <circle key={i} cx="50" cy="50" r="40" fill="none" stroke={s.color} strokeWidth="20" />
            const start = toCoords(s.start)
            const end = toCoords(s.start + s.pct)
            const large = s.pct > 0.5 ? 1 : 0
            return (
              <path key={i} d={`M 50 50 L ${start.x} ${start.y} A 40 40 0 ${large} 1 ${end.x} ${end.y} Z`} fill={s.color} />
            )
          })}
          <circle cx="50" cy="50" r="22" fill="#f6f3ee" />
        </svg>
        <div className="flex-1 space-y-2">
          {segments.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
              <span className="text-sm flex-1 truncate" style={{ color: '#7c776f' }}>{s.label}</span>
              <span className="text-xs font-medium" style={{ color: '#2b2a27' }}>{formatHours(s.value)}</span>
              <span className="text-xs" style={{ color: '#c0b8ae' }}>{Math.round(s.pct * 100)}%</span>
            </div>
          ))}
        </div>
      </div>
    </HoverCard>
  )
}

function EarningsMonthChart({ months, data, maxEarnings, currency }) {
  return (
    <HoverCard className="rounded-2xl p-6">
      <h2 className="text-sm font-semibold mb-6" style={{ color: '#2b2a27' }}>Earnings per month</h2>
      <div className="flex items-end gap-1.5 h-40">
        {months.map(month => {
          const amount = data[month.key] || 0
          const pct = maxEarnings > 0 ? (amount / maxEarnings) * 100 : 0
          return (
            <div key={month.key} className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
              {amount > 0 && (
                <span className="text-xs truncate w-full text-center" style={{ color: '#7c776f' }}>
                  {formatCurrency(amount, currency).replace(/[€$£]/, '')}
                </span>
              )}
              <div className="w-full flex flex-col justify-end" style={{ height: '80px' }}>
                <div
                  className="w-full rounded-t-lg transition-[height] duration-300 ease-out"
                  style={{
                    height: `${Math.max(pct, amount > 0 ? 5 : 0)}%`,
                    backgroundColor: amount > 0 ? '#f1c93b' : '#e6e0d7',
                    minHeight: amount > 0 ? '4px' : '0',
                  }}
                />
              </div>
              <span className="text-xs truncate w-full text-center" style={{ color: '#7c776f' }}>{month.label}</span>
            </div>
          )
        })}
      </div>
    </HoverCard>
  )
}

function EarningsProjectChart({ slices, currency }) {
  if (slices.length === 0) {
    return (
      <HoverCard className="rounded-2xl p-6 flex items-center justify-center min-h-48" style={{ color: '#c0b8ae' }}>
        No billable entries this month
      </HoverCard>
    )
  }
  const total = slices.reduce((s, x) => s + x.earnings, 0)
  const max = slices[0].earnings
  return (
    <HoverCard className="rounded-2xl p-6">
      <h2 className="text-sm font-semibold mb-5" style={{ color: '#2b2a27' }}>Earnings per project — this month</h2>
      <div className="space-y-3">
        {slices.map((s, i) => {
          const pct = max > 0 ? (s.earnings / max) * 100 : 0
          const sharePct = total > 0 ? Math.round((s.earnings / total) * 100) : 0
          return (
            <div key={i} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                  <span style={{ color: '#7c776f' }}>{s.label}</span>
                </div>
                <div className="flex items-center gap-2" style={{ color: '#7c776f' }}>
                  <span className="font-medium">{formatCurrency(s.earnings, currency)}</span>
                  <span style={{ color: '#c0b8ae' }}>{sharePct}%</span>
                </div>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#e6e0d7' }}>
                <div
                  className="h-full rounded-full transition-[width] duration-300 ease-out"
                  style={{ width: `${pct}%`, backgroundColor: s.color }}
                />
              </div>
            </div>
          )
        })}
        <div className="pt-1 flex justify-between text-xs" style={{ borderTop: '1px solid rgba(43,42,39,0.07)' }}>
          <span className="font-medium" style={{ color: '#7c776f' }}>Total</span>
          <span className="font-semibold" style={{ color: '#2b2a27' }}>{formatCurrency(total, currency)}</span>
        </div>
      </div>
    </HoverCard>
  )
}

function HourCapSection({ projects, entries }) {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime()
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1).getTime()

  const hoursPerProject = {}
  for (const entry of entries) {
    if (!entry.endTime) continue
    if (entry.endTime < monthStart || entry.endTime >= monthEnd) continue
    const project = projects.find(p => p.id === entry.projectId)
    const rate = entry.rateAtTimeOfEntry !== undefined
      ? entry.rateAtTimeOfEntry
      : (project?.hourlyRate ?? 0)
    if (rate <= 0) continue
    const key = entry.projectId || '__none__'
    hoursPerProject[key] = (hoursPerProject[key] || 0) + (entry.endTime - entry.startTime) / 3600000
  }

  const rows = projects
    .filter(p => hoursPerProject[p.id] > 0 || (p.maxHoursPerMonth > 0))
    .map(p => ({ project: p, hours: hoursPerProject[p.id] || 0, max: p.maxHoursPerMonth || 0 }))

  if (rows.length === 0) return null

  const fmtH = (h) => h.toFixed(1).replace('.', ',')

  return (
    <HoverCard className="rounded-2xl p-6 mb-4">
      <h2 className="text-sm font-semibold mb-4" style={{ color: '#2b2a27' }}>Uren deze maand per project</h2>
      <div className="space-y-4">
        {rows.map(({ project, hours, max }) => {
          const pct = max > 0 ? (hours / max) * 100 : 0
          const barColor = pct >= 100 ? '#EF4444' : pct >= 80 ? '#f97316' : project.color
          const overLimit = max > 0 && hours > max

          return (
            <div key={project.id}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: project.color }} />
                  <span className="text-sm truncate" style={{ color: '#2b2a27' }}>{project.name}</span>
                  {project.client && (
                    <span className="text-xs truncate hidden sm:inline" style={{ color: '#7c776f' }}>{project.client}</span>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  {overLimit && (
                    <span className="text-xs font-medium whitespace-nowrap" style={{ color: '#EF4444' }}>⚠ limiet overschreden</span>
                  )}
                  <span className="text-sm font-mono whitespace-nowrap" style={{ color: '#7c776f' }}>
                    {max > 0 ? `${fmtH(hours)} / ${fmtH(max)} u` : `${fmtH(hours)} u`}
                  </span>
                </div>
              </div>
              {max > 0 && (
                <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#e6e0d7' }}>
                  <div
                    className="h-full rounded-full transition-[width,background-color] duration-300 ease-out"
                    style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: barColor }}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </HoverCard>
  )
}

// ─── main component ────────────────────────────────────────────────────────────

export default function ReportsPage({ entries, projects, currency }) {
  const now = new Date()
  const todayStart = startOfDay(now)
  const weekStart = startOfWeekMonday(now)
  const monthStart = startOfMonth(now)
  const yearStart = startOfYear(now)

  const completedEntries = entries.filter(e => e.endTime)

  const earn = (from) =>
    completedEntries
      .filter(e => e.startTime >= from)
      .reduce((s, e) => s + calcEarnings(e, projects), 0)

  const hoursMs = (from) =>
    completedEntries
      .filter(e => e.startTime >= from)
      .reduce((s, e) => s + (e.endTime - e.startTime), 0)

  const earningsToday = earn(todayStart)
  const earningsWeek = earn(weekStart)
  const earningsMonth = earn(monthStart)
  const earningsYTD = earn(yearStart)
  const hoursToday = hoursMs(todayStart)
  const hoursWeek = hoursMs(weekStart)
  const hoursMonth = hoursMs(monthStart)
  const hoursYTD = hoursMs(yearStart)

  const days7 = getLast7Days()
  const dailyTimeData = useMemo(() => {
    const map = {}
    completedEntries.forEach(e => {
      const key = getDayKey(e.startTime)
      map[key] = (map[key] || 0) + (e.endTime - e.startTime)
    })
    return map
  }, [completedEntries])
  const maxDayMs = Math.max(...days7.map(d => dailyTimeData[d.key] || 0), 1)

  const pieSlices = useMemo(() => {
    const map = {}
    completedEntries.filter(e => e.startTime >= weekStart).forEach(e => {
      const key = e.projectId || '__none__'
      map[key] = (map[key] || 0) + (e.endTime - e.startTime)
    })
    return Object.entries(map)
      .filter(([, v]) => v > 0)
      .map(([key, value]) => {
        const p = projects.find(x => x.id === key)
        return { label: p ? p.name : 'No project', color: p ? p.color : '#c0b8ae', value }
      })
      .sort((a, b) => b.value - a.value)
  }, [completedEntries, projects, weekStart])

  const months12 = getLast12Months()
  const earningsMonthData = useMemo(() => {
    const map = {}
    completedEntries.forEach(e => {
      const month = months12.find(m => e.startTime >= m.startTs && e.startTime < m.endTs)
      if (!month) return
      const earned = calcEarnings(e, projects)
      if (earned > 0) map[month.key] = (map[month.key] || 0) + earned
    })
    return map
  }, [completedEntries, projects, months12])
  const maxMonthEarnings = Math.max(...months12.map(m => earningsMonthData[m.key] || 0), 1)

  const projectEarningsSlices = useMemo(() => {
    const map = {}
    completedEntries.filter(e => e.startTime >= monthStart).forEach(e => {
      const earned = calcEarnings(e, projects)
      if (earned <= 0) return
      const key = e.projectId || '__none__'
      map[key] = (map[key] || 0) + earned
    })
    return Object.entries(map)
      .map(([key, earnings]) => {
        const p = projects.find(x => x.id === key)
        return { label: p ? p.name : 'No project', color: p ? p.color : '#c0b8ae', earnings }
      })
      .sort((a, b) => b.earnings - a.earnings)
  }, [completedEntries, projects, monthStart])

  return (
    <div className="flex-1 px-6 py-6 max-w-5xl w-full mx-auto">
      <h1 className="text-xl font-semibold mb-5" style={{ color: '#2b2a27' }}>Reports</h1>

      {/* ── Earnings KPIs ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <EarningsCard
          large
          label="Earned this month"
          amount={earningsMonth}
          hours={hoursMonth}
          subtitle={formatMonthYear(monthStart)}
          currency={currency}
        />
        <EarningsCard
          large
          label="Earned YTD"
          amount={earningsYTD}
          hours={hoursYTD}
          subtitle={`${now.getFullYear()} YTD`}
          currency={currency}
        />
        <EarningsCard
          label="Earned today"
          amount={earningsToday}
          hours={hoursToday}
          subtitle="Today"
          currency={currency}
        />
        <EarningsCard
          label="Earned this week"
          amount={earningsWeek}
          hours={hoursWeek}
          subtitle="This week"
          currency={currency}
        />
      </div>

      {/* ── Time stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <StatCard icon={Clock} label="Today" value={formatHours(hoursToday)} color="#ef8e78" />
        <StatCard icon={TrendingUp} label="This week" value={formatHours(hoursWeek)} color="#f1c93b" />
      </div>

      {/* ── Hour cap progress ── */}
      <HourCapSection projects={projects} entries={completedEntries} />

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <TimeBarChart days={days7} data={dailyTimeData} maxMs={maxDayMs} />
        <PieChart slices={pieSlices} />
      </div>

      {/* ── Earnings charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <EarningsMonthChart
          months={months12}
          data={earningsMonthData}
          maxEarnings={maxMonthEarnings}
          currency={currency}
        />
        <EarningsProjectChart slices={projectEarningsSlices} currency={currency} />
      </div>
    </div>
  )
}
