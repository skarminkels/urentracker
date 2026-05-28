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
        startTimer={startTimer}
        stopTimer={stopTimer}
      />

      <div className="flex-1 px-6 py-6 max-w-4xl w-full mx-auto">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-lg font-semibold text-gray-800">Time entries</h1>
          <button
            onClick={() => setShowManual(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-[#c95da7] border border-[#c95da7]/30 hover:bg-[#c95da7]/5 transition-colors"
          >
            <Plus size={16} />
            Manual entry
          </button>
        </div>

        {groups.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg font-medium mb-2">No time entries yet</p>
            <p className="text-sm">Start the timer or add a manual entry to get started.</p>
          </div>
        ) : (
          groups.map(group => (
            <TimeEntryGroup
              key={group.key}
              group={group}
              projects={projects}
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
