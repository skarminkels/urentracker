import { formatDurationShort } from '../../utils/time'
import { calcEarnings, formatCurrency } from '../../utils/currency'
import TimeEntryRow from './TimeEntryRow'

export default function TimeEntryGroup({ group, projects, currency, onContinue, onDelete, onUpdate }) {
  const dayEarnings = group.entries.reduce((sum, e) => sum + calcEarnings(e, projects), 0)

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-4 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50/60">
        <span className="text-sm font-semibold text-gray-700">{group.label}</span>
        <div className="flex items-center gap-3">
          {dayEarnings > 0 && (
            <span className="text-sm font-medium text-[#c95da7]">
              {formatCurrency(dayEarnings, currency)}
            </span>
          )}
          <span className="text-sm font-medium text-gray-500 font-mono">
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
