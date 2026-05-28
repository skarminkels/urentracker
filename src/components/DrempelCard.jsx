import { useMemo } from 'react'
import { AlertTriangle } from 'lucide-react'
import { useData } from '../context/DataContext'
import { Card } from './ui'

function fmt(amount) {
  return new Intl.NumberFormat('nl-BE', { style: 'currency', currency: 'EUR' }).format(amount)
}

export default function DrempelCard() {
  const { clients, entries, settings } = useData()

  const threshold = Number(settings?.threshold ?? 8595)
  const showThreshold = settings?.showThreshold ?? true
  const thisYear = new Date().getFullYear()
  const now = new Date()

  const { yearTotal, monthsWorked } = useMemo(() => {
    const clientMap = Object.fromEntries(clients.map(c => [c.id, c]))
    const yearPrefix = `${thisYear}-`
    const monthSet = new Set()
    let total = 0
    for (const entry of entries) {
      if (!entry.date.startsWith(yearPrefix)) continue
      const client = clientMap[entry.clientId]
      if (!client) continue
      total += entry.hours * client.rate
      monthSet.add(entry.date.slice(0, 7))
    }
    return { yearTotal: total, monthsWorked: monthSet.size }
  }, [entries, clients, thisYear])

  if (!showThreshold) return null

  const pctRaw = threshold > 0 ? (yearTotal / threshold) * 100 : 0
  const pct = Math.min(pctRaw, 100)
  const exceeded = yearTotal >= threshold
  const remaining = Math.max(threshold - yearTotal, 0)
  const overshoot = Math.max(yearTotal - threshold, 0)

  const barGradient =
    pct >= 90 ? '#DC2626' :
    pct >= 70 ? 'linear-gradient(to right, #2563EB, #D97706)' :
    'linear-gradient(to right, #2563EB, #3B82F6)'

  const pctColor =
    pct >= 90 ? 'text-red-600' :
    pct >= 70 ? 'text-amber-600' :
    'text-blue-600'

  let projectionText = null
  if (!exceeded && monthsWorked > 0) {
    const avgMonthly = yearTotal / monthsWorked
    if (avgMonthly > 0) {
      const monthsNeeded = Math.ceil((threshold - yearTotal) / avgMonthly)
      const projDate = new Date(now.getFullYear(), now.getMonth() + monthsNeeded, 1)
      const label = projDate.toLocaleDateString('nl-BE', { month: 'long', year: 'numeric' })
      projectionText = `Aan je huidig tempo bereik je de limiet in ${label}.`
    }
  }

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
          Jaarlimiet studentenonderneming
        </p>
        <span className={`text-sm font-semibold tabular-nums ${pctColor}`}>
          {pctRaw.toFixed(1)}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-slate-100 rounded-full h-3 mb-4 overflow-hidden">
        <div
          className="h-3 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${pct}%`, background: barGradient }}
        />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <p className="text-xs text-slate-400 mb-1">Verdiend dit jaar</p>
          <p className="text-sm font-semibold text-slate-800 tabular-nums">{fmt(yearTotal)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400 mb-1">Nog beschikbaar</p>
          {exceeded
            ? <p className="text-sm font-semibold text-red-600 tabular-nums">−{fmt(overshoot)}</p>
            : <p className="text-sm font-semibold text-slate-800 tabular-nums">{fmt(remaining)}</p>
          }
        </div>
        <div>
          <p className="text-xs text-slate-400 mb-1">Limiet</p>
          <p className="text-sm font-semibold text-slate-800 tabular-nums">{fmt(threshold)}</p>
        </div>
      </div>

      {exceeded && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-3">
          <AlertTriangle size={15} className="text-red-500 mt-0.5 shrink-0" />
          <p className="text-sm text-red-700 font-medium">
            Je hebt de jaarlimiet overschreden. Overweeg je statuut te herzien.
          </p>
        </div>
      )}

      {projectionText && (
        <p className="text-xs text-slate-500 mb-2">{projectionText}</p>
      )}

      <p className="text-xs text-slate-400 border-t border-slate-100 pt-3">
        Brutobedragen (uren × tarief). Nettobedrag kan afwijken na kosten en belastingen — raadpleeg een belastingadviseur.
      </p>
    </Card>
  )
}
