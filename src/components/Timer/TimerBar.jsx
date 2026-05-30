import { useState, useEffect } from 'react'
import { Play, Square, ChevronDown } from 'lucide-react'
import { formatDuration } from '../../utils/time'
import { calcLiveEarnings, formatCurrency } from '../../utils/currency'

export default function TimerBar({ runningTimer, elapsed, projects, currency, startTimer, stopTimer }) {
  const [description, setDescription] = useState('')
  const [projectId, setProjectId] = useState(null)
  const [showProjectPicker, setShowProjectPicker] = useState(false)

  useEffect(() => {
    if (runningTimer) {
      setDescription(runningTimer.description)
      setProjectId(runningTimer.projectId)
    }
  }, [runningTimer])

  const handleStart = () => {
    startTimer(description, projectId, [])
  }

  const handleStop = () => {
    stopTimer()
    setDescription('')
    setProjectId(null)
  }

  const activeProject = projects.find(p => p.id === projectId)
  const liveEarnings = runningTimer
    ? calcLiveEarnings(elapsed, runningTimer.projectId, projects)
    : 0

  return (
    <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-4" style={{ boxShadow: '0 1px 0 rgba(15,23,42,0.05)' }}>
      <div className="flex-1 flex items-center gap-3">
        <input
          type="text"
          value={description}
          onChange={e => setDescription(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !runningTimer) handleStart()
          }}
          placeholder="What are you working on?"
          className="flex-1 text-[#111827] placeholder-[#6B7280] text-base outline-none bg-transparent"
          readOnly={!!runningTimer}
        />
      </div>

      <div className="flex items-center gap-2">
        {/* Project picker */}
        <div className="relative">
          <button
            onClick={() => setShowProjectPicker(v => !v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-[transform,background-color] duration-150 active:scale-[0.97] ${
              activeProject
                ? 'text-white'
                : 'bg-gray-100 text-[#6B7280] hover:bg-gray-200'
            }`}
            style={activeProject ? { backgroundColor: activeProject.color } : {}}
          >
            {activeProject ? (
              <>
                <span className="w-2 h-2 rounded-full bg-white/70" />
                {activeProject.name}
              </>
            ) : (
              <>
                <ChevronDown size={14} />
                Project
              </>
            )}
          </button>

          {showProjectPicker && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-100 rounded-2xl z-50 min-w-48 py-1.5 overflow-hidden" style={{ boxShadow: '0 20px 40px rgba(15,23,42,0.12)' }}>
              <button
                onClick={() => { setProjectId(null); setShowProjectPicker(false) }}
                className="w-full text-left px-4 py-2 text-sm text-[#6B7280] hover:bg-gray-50 flex items-center gap-2 transition-colors duration-100"
              >
                <span className="w-2 h-2 rounded-full bg-gray-300" />
                No project
              </button>
              {projects.map(p => (
                <button
                  key={p.id}
                  onClick={() => { setProjectId(p.id); setShowProjectPicker(false) }}
                  className="w-full text-left px-4 py-2 text-sm text-[#111827] hover:bg-gray-50 flex items-center gap-2 transition-colors duration-100"
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                  {p.name}
                  {p.hourlyRate > 0 && (
                    <span className="ml-auto text-xs text-[#6B7280]">{currency}{p.hourlyRate}/u</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Live timer + earnings */}
        {runningTimer && (
          <div className="text-right">
            <div className="text-[#111827] font-mono text-base tabular-nums">
              {formatDuration(elapsed)}
            </div>
            {liveEarnings > 0 && (
              <div className="text-xs text-[#6B5CF6] font-medium">
                {formatCurrency(liveEarnings, currency)}
              </div>
            )}
          </div>
        )}

        {/* Start / Stop */}
        {runningTimer ? (
          <button
            onClick={handleStop}
            className="w-10 h-10 rounded-full bg-[#EF4444] hover:bg-red-600 flex items-center justify-center transition-[transform,background-color] duration-150 active:scale-[0.97]"
          >
            <Square size={14} className="text-white fill-white" />
          </button>
        ) : (
          <button
            onClick={handleStart}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-[transform,background-color] duration-150 active:scale-[0.97]"
            style={{ background: 'linear-gradient(135deg, #6B5CF6 0%, #A855F7 100%)' }}
          >
            <Play size={16} className="text-white fill-white ml-0.5" />
          </button>
        )}
      </div>

      {showProjectPicker && (
        <div className="fixed inset-0 z-40" onClick={() => setShowProjectPicker(false)} />
      )}
    </div>
  )
}
