import { formatDurationShort } from '../../utils/time'
import { calcEarnings, formatCurrency } from '../../utils/currency'
import TimeEntryRow from './TimeEntryRow'

export default function TimeEntryGroup({ group, projects, currency, onContinue, onDelete, onUpdate }) {
  const dayEarnings = group.entries.reduce((sum, e) => sum + calcEarnings(e, projects), 0)

  return (
    <div
      className="rounded-2xl mb-4 overflow-hidden"
      style={{
        backgroundColor: '#f6f3ee',
        boxShadow: '0 20px 40px rgba(55,44,22,0.06)',
        border: '1px solid rgba(43,42,39,0.06)',
      }}
    >
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{
          backgroundColor: '#f1ede6',
          borderBottom: '1px solid rgba(43,42,39,0.06)',
        }}
      >
        <span className="text-sm font-semibold" style={{ color: '#2b2a27' }}>{group.label}</span>
        <div className="flex items-center gap-3">
          {dayEarnings > 0 && (
            <span className="text-sm font-medium" style={{ color: '#4a4a45' }}>
              {formatCurrency(dayEarnings, currency)}
            </span>
          )}
          <span className="text-sm font-medium font-mono tabular-nums" style={{ color: '#7c776f' }}>
            {formatDurationShort(group.total)}
          </span>
        </div>
      </div>
      <div>
        {group.entries.map(entry => (
          <TimeEntryRow
            key={entry.id}
            entry={entry}
            projects={projects}
            currency={currency}
            onContinue={onContinue}
            onDelete={onDelete}
            onUpdate={onUpdate}
          />
        ))}
      </div>
    </div>
  )
}
