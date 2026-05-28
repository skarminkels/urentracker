import { formatDurationShort } from '../../utils/time'
import TimeEntryRow from './TimeEntryRow'

export default function TimeEntryGroup({ group, projects, onContinue, onDelete, onUpdate }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-4 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50/60">
        <span className="text-sm font-semibold text-gray-700">{group.label}</span>
        <span className="text-sm font-medium text-gray-500 font-mono">
          {formatDurationShort(group.total)}
        </span>
      </div>
      <div>
        {group.entries.map(entry => (
          <TimeEntryRow
            key={entry.id}
            entry={entry}
            projects={projects}
            onContinue={onContinue}
            onDelete={onDelete}
            onUpdate={onUpdate}
          />
        ))}
      </div>
    </div>
  )
}
