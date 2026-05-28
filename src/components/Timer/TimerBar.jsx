import { useState, useEffect } from 'react'
import { Play, Square, DollarSign, Tag, ChevronDown } from 'lucide-react'
import { formatDuration } from '../../utils/time'

export default function TimerBar({ runningTimer, elapsed, projects, startTimer, stopTimer }) {
  const [description, setDescription] = useState('')
  const [projectId, setProjectId] = useState(null)
  const [billable, setBillable] = useState(false)
  const [showProjectPicker, setShowProjectPicker] = useState(false)

  useEffect(() => {
    if (runningTimer) {
      setDescription(runningTimer.description)
      setProjectId(runningTimer.projectId)
      setBillable(runningTimer.billable)
    }
  }, [runningTimer])

  const handleStart = () => {
    startTimer(description, projectId, [], billable)
  }

  const handleStop = () => {
    stopTimer()
    setDescription('')
    setProjectId(null)
    setBillable(false)
  }

  const activeProject = projects.find(p => p.id === projectId)

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4 shadow-sm">
      <div className="flex-1 flex items-center gap-3">
        <input
          type="text"
          value={description}
          onChange={e => setDescription(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !runningTimer) handleStart()
          }}
          placeholder="What are you working on?"
          className="flex-1 text-gray-800 placeholder-gray-400 text-base outline-none bg-transparent"
          readOnly={!!runningTimer}
        />
      </div>

      <div className="flex items-center gap-2">
        {/* Project picker */}
        <div className="relative">
          <button
            onClick={() => setShowProjectPicker(v => !v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeProject
                ? 'text-white'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
            style={activeProject ? { backgroundColor: activeProject.color } : {}}
          >
            {activeProject ? (
              <>
                <span
                  className="w-2 h-2 rounded-full bg-white/70"
                />
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
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 min-w-48 py-1">
              <button
                onClick={() => { setProjectId(null); setShowProjectPicker(false) }}
                className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-gray-300" />
                No project
              </button>
              {projects.map(p => (
                <button
                  key={p.id}
                  onClick={() => { setProjectId(p.id); setShowProjectPicker(false) }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                  {p.name}
                  {p.client && <span className="text-gray-400 text-xs">{p.client}</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Billable toggle */}
        <button
          onClick={() => setBillable(v => !v)}
          className={`p-1.5 rounded-full transition-colors ${
            billable ? 'text-[#c95da7] bg-[#c95da7]/10' : 'text-gray-400 hover:text-gray-600'
          }`}
          title="Billable"
        >
          <DollarSign size={16} />
        </button>

        {/* Timer display */}
        {runningTimer && (
          <span className="text-gray-700 font-mono text-base min-w-24 text-right">
            {formatDuration(elapsed)}
          </span>
        )}

        {/* Start / Stop */}
        {runningTimer ? (
          <button
            onClick={handleStop}
            className="w-10 h-10 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors shadow-sm"
          >
            <Square size={14} className="text-white fill-white" />
          </button>
        ) : (
          <button
            onClick={handleStart}
            className="w-10 h-10 rounded-full bg-[#c95da7] hover:bg-[#a04389] flex items-center justify-center transition-colors shadow-sm"
          >
            <Play size={16} className="text-white fill-white ml-0.5" />
          </button>
        )}
      </div>

      {/* Close project picker on outside click */}
      {showProjectPicker && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowProjectPicker(false)}
        />
      )}
    </div>
  )
}
