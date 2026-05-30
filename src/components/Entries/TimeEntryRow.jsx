import { useState } from 'react'
import { Play, Pencil, Trash2 } from 'lucide-react'
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
        className="flex items-center gap-4 px-5 py-3.5 group border-b border-gray-50 last:border-0 transition-colors duration-100"
        style={{ backgroundColor: hovered ? 'rgba(107,92,246,0.02)' : 'transparent' }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Description */}
        <div className="flex-1 min-w-0">
          <span className={`text-sm ${entry.description ? 'text-[#111827]' : 'text-[#6B7280] italic'}`}>
            {entry.description || 'No description'}
          </span>
        </div>

        {/* Project */}
        <div className="hidden sm:flex items-center gap-1.5 min-w-24">
          {project ? (
            <>
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: project.color }} />
              <span className="text-xs text-[#6B7280] truncate">{project.name}</span>
            </>
          ) : (
            <span className="text-xs text-gray-300">—</span>
          )}
        </div>

        {/* Time range */}
        <div className="hidden md:block text-xs text-[#6B7280] font-mono tabular-nums min-w-28 text-right">
          {formatTime(entry.startTime)} – {formatTime(entry.endTime)}
        </div>

        {/* Duration + earnings */}
        <div className="text-right min-w-28">
          <div className="text-sm font-medium text-[#111827] font-mono tabular-nums">
            {formatDurationShort(duration)}
          </div>
          {earnings > 0 && (
            <div className="text-xs text-[#6B5CF6] font-medium mt-0.5">
              {formatCurrency(earnings, currency)}
            </div>
          )}
        </div>

        {/* Hover actions */}
        <div className={`flex items-center gap-1 transition-opacity duration-150 ${hovered ? 'opacity-100' : 'opacity-0'}`}>
          <button
            onClick={() => onContinue(entry)}
            className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#6B5CF6] hover:bg-[#6B5CF6]/8 transition-[transform,color,background-color] duration-150 active:scale-[0.90]"
            title="Continue"
          >
            <Play size={14} className="fill-current" />
          </button>
          <button
            onClick={() => setEditing(true)}
            className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#111827] hover:bg-gray-100 transition-[transform,color,background-color] duration-150 active:scale-[0.90]"
            title="Edit"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => onDelete(entry.id)}
            className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#EF4444] hover:bg-red-50 transition-[transform,color,background-color] duration-150 active:scale-[0.90]"
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
