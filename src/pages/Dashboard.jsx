import { useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import { TrendingUp, TrendingDown, Euro, Users, Clock } from 'lucide-react'
import { useData } from '../context/DataContext'
import { Card, EmptyState, PageHeader } from '../components/ui'
import DrempelCard from '../components/DrempelCard'

const COLORS = ['#2563EB', '#8b5cf6', '#0D9488', '#f59e0b', '#ef4444', '#06b6d4']

function fmt(amount) {
  return new Intl.NumberFormat('nl-BE', { style: 'currency', currency: 'EUR' }).format(amount)
}

function getMonthKey(dateStr) { return dateStr.slice(0, 7) }

function monthLabel(key) {
  const [y, m] = key.split('-')
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString('nl-BE', { month: 'short', year: '2-digit' })
}

function StatCard({ label, value, subtitle, Icon, trend }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="p-2.5 bg-blue-50 rounded-lg">
          <Icon size={18} className="text-blue-600" />
        </div>
        {trend != null && (
          <div className={`flex items-center gap-1 text-xs font-medium ${trend >= 0 ? 'text-teal-600' : 'text-red-500'}`}>
            {trend >= 0
              ? <TrendingUp size={13} />
              : <TrendingDown size={13} />
            }
            {trend >= 0 ? '+' : ''}{trend.toFixed(1)}%
          </div>
        )}
      </div>
      <p className="text-2xl font-semibold text-slate-800 tabular-nums">{value}</p>
      <p className="text-xs text-slate-500 mt-1">{label}</p>
      {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
    </Card>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-3 text-xs" style={{ borderLeft: '3px solid #2563EB' }}>
      <p className="font-medium text-slate-700 mb-2">{label}</p>
      {payload.map(p => (
        <div key={p.name} className="flex items-center justify-between gap-4">
          <span className="text-slate-500">{p.name}</span>
          <span className="font-semibold text-slate-800 tabular-nums">{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const { clients, entries } = useData()
  const clientMap = Object.fromEntries(clients.map(c => [c.id, c]))

  const now = new Date()
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const lastMonth = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`

  const { thisTotal, lastTotal, clientBreakdown, chartData } = useMemo(() => {
    let thisTotal = 0
    let lastTotal = 0
    const byClient = {}

    for (const entry of entries) {
      const client = clientMap[entry.clientId]
      if (!client) continue
      const amount = entry.hours * client.rate
      const month = getMonthKey(entry.date)
      if (month === thisMonth) {
        thisTotal += amount
        if (!byClient[entry.clientId]) byClient[entry.clientId] = { hours: 0, amount: 0 }
        byClient[entry.clientId].hours += entry.hours
        byClient[entry.clientId].amount += amount
      }
      if (month === lastMonth) lastTotal += amount
    }

    const clientBreakdown = Object.entries(byClient)
      .map(([id, data]) => ({ client: clientMap[id], ...data }))
      .sort((a, b) => b.amount - a.amount)

    const months = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
    }

    const chartData = months.map(month => {
      const row = { month: monthLabel(month) }
      for (const client of clients) {
        const total = entries
          .filter(e => e.clientId === client.id && getMonthKey(e.date) === month)
          .reduce((sum, e) => sum + e.hours * client.rate, 0)
        if (total > 0) row[client.name] = total
      }
      return row
    })

    return { thisTotal, lastTotal, clientBreakdown, chartData }
  }, [entries, clients, thisMonth, lastMonth])

  const evolution = lastTotal === 0 ? null : ((thisTotal - lastTotal) / lastTotal) * 100
  const thisMonthLabel = now.toLocaleDateString('nl-BE', { month: 'long', year: 'numeric' })

  if (entries.length === 0 && clients.length === 0) {
    return (
      <>
        <PageHeader title="Dashboard" subtitle="Welkom" />
        <div className="p-8">
          <Card>
            <EmptyState icon="◉" title="Welkom bij Urentracker" description="Voeg eerst een klant toe en log dan je eerste werkuren om je dashboard te zien." />
          </Card>
        </div>
      </>
    )
  }

  return (
    <>
      <PageHeader title="Dashboard" subtitle={<span className="capitalize">{thisMonthLabel}</span>} />

      <div className="p-8 flex flex-col gap-6">
        {/* KPI row */}
        <div className="grid grid-cols-3 gap-4">
          <StatCard
            label="Verdiend deze maand"
            value={fmt(thisTotal)}
            Icon={Euro}
            trend={evolution}
          />
          <StatCard
            label="Evolutie vs vorige maand"
            value={evolution === null ? '—' : `${evolution >= 0 ? '+' : ''}${evolution.toFixed(1)}%`}
            subtitle={`Vorige maand: ${fmt(lastTotal)}`}
            Icon={TrendingUp}
          />
          <StatCard
            label="Actieve klanten"
            value={clientBreakdown.length}
            subtitle="met uren deze maand"
            Icon={Users}
          />
        </div>

        {/* Threshold tracker */}
        <DrempelCard />

        {/* Client breakdown */}
        {clientBreakdown.length > 0 && (
          <Card>
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="font-medium text-slate-700 text-sm">Per klant — deze maand</h3>
            </div>
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Klant</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Uren</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Verdiend</th>
                </tr>
              </thead>
              <tbody>
                {clientBreakdown.map(({ client, hours, amount }, i) => (
                  <tr key={client.id} className={`${i > 0 ? 'border-t border-slate-100' : ''} hover:bg-blue-50/40 transition-colors duration-150`}>
                    <td className="px-6 py-3.5">
                      <span className="font-medium text-slate-800 text-sm">{client.name}</span>
                      {client.company && <span className="text-xs text-slate-400 ml-2">{client.company}</span>}
                    </td>
                    <td className="px-6 py-3.5 text-right font-mono text-sm text-slate-500">{hours.toFixed(2)}u</td>
                    <td className="px-6 py-3.5 text-right font-mono text-sm font-semibold text-slate-800">{fmt(amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}

        {/* Bar chart */}
        {clients.length > 0 && (
          <Card className="p-6">
            <h3 className="font-medium text-slate-700 text-sm mb-5">Omzet per klant — laatste 6 maanden</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} barGap={4} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8', fontFamily: 'Inter, system-ui' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8', fontFamily: 'Inter, system-ui' }} axisLine={false} tickLine={false} tickFormatter={v => `€${v}`} width={56} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#EFF6FF' }} />
                {clients.map((client, idx) => (
                  <Bar key={client.id} dataKey={client.name} fill={COLORS[idx % COLORS.length]} radius={[4, 4, 0, 0]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}
      </div>
    </>
  )
}
