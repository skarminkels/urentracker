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
    <div
      className="px-6 py-4 flex items-center gap-4"
      style={{
        backgroundColor: '#f6f3ee',
        borderBottom: '1px solid rgba(43,42,39,0.07)',
        boxShadow: '0 1px 0 rgba(55,44,22,0.04)',
      }}
    >
      <div className="flex-1 flex items-center gap-3">
        <input
          type="text"
          value={description}
          onChange={e => setDescription(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !runningTimer) handleStart()
          }}
          placeholder="What are you working on?"
          className="flex-1 text-sm outline-none bg-transparent"
          style={{ color: '#2b2a27', '::placeholder': { color: '#7c776f' } }}
          readOnly={!!runningTimer}
        />
      </div>

      <div className="flex items-center gap-2">
        {/* Project picker */}
        <div className="relative">
          <button
            onClick={() => setShowProjectPicker(v => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-[transform,background-color] duration-150 active:scale-[0.97]"
            style={activeProject
              ? { backgroundColor: activeProject.color, color: '#fff' }
              : { backgroundColor: '#e6e0d7', color: '#7c776f' }
            }
          >
            {activeProject ? (
              <>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.7)' }} />
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
            <div
              className="absolute top-full left-0 mt-1 rounded-2xl z-50 min-w-48 py-1.5 overflow-hidden dropdown-content"
              style={{
                backgroundColor: '#faf8f4',
                border: '1px solid rgba(43,42,39,0.08)',
                boxShadow: '0 20px 40px rgba(55,44,22,0.10)',
              }}
            >
              <button
                onClick={() => { setProjectId(null); setShowProjectPicker(false) }}
                className="w-full text-left px-4 py-2 text-sm flex items-center gap-2 transition-colors duration-100"
                style={{ color: '#7c776f' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f1ede6'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = ''}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#c0b8ae' }} />
                No project
              </button>
              {projects.map(p => (
                <button
                  key={p.id}
                  onClick={() => { setProjectId(p.id); setShowProjectPicker(false) }}
                  className="w-full text-left px-4 py-2 text-sm flex items-center gap-2 transition-colors duration-100"
                  style={{ color: '#2b2a27' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f1ede6'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = ''}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                  {p.name}
                  {p.hourlyRate > 0 && (
                    <span className="ml-auto text-xs" style={{ color: '#7c776f' }}>{currency}{p.hourlyRate}/u</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Live timer + earnings */}
        {runningTimer && (
          <div className="text-right">
            <div className="font-mono text-base tabular-nums" style={{ color: '#2b2a27' }}>
              {formatDuration(elapsed)}
            </div>
            {liveEarnings > 0 && (
              <div className="text-xs font-medium" style={{ color: '#7c776f' }}>
                {formatCurrency(liveEarnings, currency)}
              </div>
            )}
          </div>
        )}

        {/* Start / Stop */}
        {runningTimer ? (
          <button
            onClick={handleStop}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-[transform,background-color] duration-150 active:scale-[0.97]"
            style={{ backgroundColor: '#EF4444' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#dc2626'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#EF4444'}
          >
            <Square size={14} className="fill-white" style={{ color: '#fff' }} />
          </button>
        ) : (
          <button
            onClick={handleStart}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-[transform,background-color] duration-150 active:scale-[0.97]"
            style={{ backgroundColor: '#20242c' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#2d3340'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#20242c'}
          >
            <Play size={16} className="fill-white ml-0.5" style={{ color: '#fff' }} />
          </button>
        )}
      </div>

      {showProjectPicker && (
        <div className="fixed inset-0 z-40" onClick={() => setShowProjectPicker(false)} />
      )}
    </div>
  )
}
