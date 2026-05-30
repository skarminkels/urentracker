import { useState } from 'react'
import { Plus } from 'lucide-react'
import { groupEntriesByDay } from '../../utils/time'
import TimerBar from './TimerBar'
import TimeEntryGroup from '../Entries/TimeEntryGroup'
import ManualEntryModal from '../Entries/ManualEntryModal'

export default function TimerPage({
  entries,
  projects,
  runningTimer,
  elapsed,
  currency,
  startTimer,
  stopTimer,
  continueEntry,
  deleteEntry,
  updateEntry,
  addManualEntry,
}) {
  const [showManual, setShowManual] = useState(false)
  const groups = groupEntriesByDay(entries)

  return (
    <div className="flex flex-col flex-1 min-h-screen">
      <TimerBar
        runningTimer={runningTimer}
        elapsed={elapsed}
        projects={projects}
        currency={currency}
        startTimer={startTimer}
        stopTimer={stopTimer}
      />

      <div className="flex-1 px-6 py-6 max-w-4xl w-full mx-auto">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-lg font-semibold" style={{ color: '#2b2a27' }}>Time entries</h1>
          <button
            onClick={() => setShowManual(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-[transform,background-color,border-color] duration-150 active:scale-[0.97]"
            style={{ color: '#4a4a45', border: '1px solid rgba(43,42,39,0.15)' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#e6e0d7'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = ''}
          >
            <Plus size={16} />
            Manual entry
          </button>
        </div>

        {groups.length === 0 ? (
          <div className="text-center py-20" style={{ color: '#7c776f' }}>
            <p className="text-lg font-medium mb-2">No time entries yet</p>
            <p className="text-sm">Start the timer or add a manual entry to get started.</p>
          </div>
        ) : (
          groups.map(group => (
            <TimeEntryGroup
              key={group.key}
              group={group}
              projects={projects}
              currency={currency}
              onContinue={continueEntry}
              onDelete={deleteEntry}
              onUpdate={updateEntry}
            />
          ))
        )}
      </div>

      {showManual && (
        <ManualEntryModal
          projects={projects}
          onAdd={addManualEntry}
          onClose={() => setShowManual(false)}
        />
      )}
    </div>
  )
}
