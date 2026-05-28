import { useState } from 'react'
import { Play, Pencil, Trash2, DollarSign } from 'lucide-react'
import { formatTime, formatDurationShort } from '../../utils/time'
import { calcEarnings, formatCurrency } from '../../utils/currency'
import EditEntryModal from './EditEntryModal'

export default function TimeEntryRow({ entry, projects, currency, onContinue, onDelete, onUpdate }) {
  const [hovered, setHovered] = useState(false)
  const [editing, setEditing] = useState(false)

  const project = projects.find(p => p.id === entry.projectId)
  const duration = entry.endTime ? entry.endTime - entry.startTime : 0
  const earnings = calcEarnings(entry, projects)

  return (
    <>
      <div
        className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 group transition-colors border-b border-gray-100 last:border-0"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Description */}
        <div className="flex-1 min-w-0">
          <span className={`text-sm ${entry.description ? 'text-gray-800' : 'text-gray-400 italic'}`}>
            {entry.description || 'No description'}
          </span>
        </div>

        {/* Project */}
        <div className="hidden sm:flex items-center gap-1.5 min-w-24">
          {project ? (
            <>
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: project.color }} />
              <span className="text-xs text-gray-500 truncate">{project.name}</span>
            </>
          ) : (
            <span className="text-xs text-gray-300">—</span>
          )}
        </div>

        {/* Billable */}
        {entry.billable && (
          <DollarSign size={14} className="text-[#c95da7] shrink-0" />
        )}

        {/* Time range */}
        <div className="hidden md:block text-xs text-gray-400 font-mono min-w-28 text-right">
          {formatTime(entry.startTime)} – {formatTime(entry.endTime)}
        </div>

        {/* Duration + earnings */}
        <div className="text-right min-w-28">
          <div className="text-sm font-medium text-gray-700 font-mono">
            {formatDurationShort(duration)}
          </div>
          {earnings > 0 && (
            <div className="text-xs text-[#c95da7] font-medium mt-0.5">
              {formatCurrency(earnings, currency)}
            </div>
          )}
        </div>

        {/* Hover actions */}
        <div className={`flex items-center gap-1 transition-opacity ${hovered ? 'opacity-100' : 'opacity-0'}`}>
          <button
            onClick={() => onContinue(entry)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-[#c95da7] hover:bg-[#c95da7]/10 transition-colors"
            title="Continue"
          >
            <Play size={14} className="fill-current" />
          </button>
          <button
            onClick={() => setEditing(true)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            title="Edit"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => onDelete(entry.id)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {editing && (
        <EditEntryModal
          entry={entry}
          projects={projects}
          onSave={onUpdate}
          onClose={() => setEditing(false)}
        />
      )}
    </>
  )
}
