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
        className="flex items-center gap-4 px-5 py-3.5 group transition-colors duration-100"
        style={{
          backgroundColor: hovered ? 'rgba(43,42,39,0.03)' : 'transparent',
          borderBottom: '1px solid rgba(43,42,39,0.05)',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Description */}
        <div className="flex-1 min-w-0">
          <span
            className="text-sm"
            style={{ color: entry.description ? '#2b2a27' : '#7c776f', fontStyle: entry.description ? 'normal' : 'italic' }}
          >
            {entry.description || 'No description'}
          </span>
        </div>

        {/* Project */}
        <div className="hidden sm:flex items-center gap-1.5 min-w-24">
          {project ? (
            <>
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: project.color }} />
              <span className="text-xs truncate" style={{ color: '#7c776f' }}>{project.name}</span>
            </>
          ) : (
            <span className="text-xs" style={{ color: '#c0b8ae' }}>—</span>
          )}
        </div>

        {/* Time range */}
        <div className="hidden md:block text-xs font-mono tabular-nums min-w-28 text-right" style={{ color: '#7c776f' }}>
          {formatTime(entry.startTime)} – {formatTime(entry.endTime)}
        </div>

        {/* Duration + earnings */}
        <div className="text-right min-w-28">
          <div className="text-sm font-medium font-mono tabular-nums" style={{ color: '#2b2a27' }}>
            {formatDurationShort(duration)}
          </div>
          {earnings > 0 && (
            <div className="text-xs font-medium mt-0.5" style={{ color: '#4a4a45' }}>
              {formatCurrency(earnings, currency)}
            </div>
          )}
        </div>

        {/* Hover actions */}
        <div className={`flex items-center gap-1 transition-opacity duration-150 ${hovered ? 'opacity-100' : 'opacity-0'}`}>
          <button
            onClick={() => onContinue(entry)}
            className="p-1.5 rounded-lg transition-[transform,color,background-color] duration-150 active:scale-[0.90]"
            style={{ color: '#7c776f' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#2b2a27'; e.currentTarget.style.backgroundColor = '#e6e0d7' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#7c776f'; e.currentTarget.style.backgroundColor = '' }}
            title="Continue"
          >
            <Play size={14} className="fill-current" />
          </button>
          <button
            onClick={() => setEditing(true)}
            className="p-1.5 rounded-lg transition-[transform,color,background-color] duration-150 active:scale-[0.90]"
            style={{ color: '#7c776f' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#2b2a27'; e.currentTarget.style.backgroundColor = '#e6e0d7' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#7c776f'; e.currentTarget.style.backgroundColor = '' }}
            title="Edit"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => onDelete(entry.id)}
            className="p-1.5 rounded-lg transition-[transform,color,background-color] duration-150 active:scale-[0.90]"
            style={{ color: '#7c776f' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.backgroundColor = '#fef2f2' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#7c776f'; e.currentTarget.style.backgroundColor = '' }}
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
