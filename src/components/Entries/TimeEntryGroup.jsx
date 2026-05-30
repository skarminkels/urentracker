import { formatDurationShort } from '../../utils/time'
import { calcEarnings, formatCurrency } from '../../utils/currency'
import TimeEntryRow from './TimeEntryRow'

export default function TimeEntryGroup({ group, projects, currency, onContinue, onDelete, onUpdate }) {
  const dayEarnings = group.entries.reduce((sum, e) => sum + calcEarnings(e, projects), 0)

  return (
    <div className="bg-white rounded-2xl mb-4 overflow-hidden" style={{ boxShadow: '0 20px 40px rgba(15,23,42,0.06)', border: '1px solid rgba(15,23,42,0.05)' }}>
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-50 bg-gray-50/40">
        <span className="text-sm font-semibold text-[#111827]">{group.label}</span>
        <div className="flex items-center gap-3">
          {dayEarnings > 0 && (
            <span className="text-sm font-medium text-[#6B5CF6]">
              {formatCurrency(dayEarnings, currency)}
            </span>
          )}
          <span className="text-sm font-medium text-[#6B7280] font-mono tabular-nums">
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
