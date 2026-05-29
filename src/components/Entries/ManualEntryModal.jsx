import { useState } from 'react'
import { X, ChevronDown } from 'lucide-react'

export default function ManualEntryModal({ projects, onAdd, onClose }) {
  const today = new Date().toISOString().split('T')[0]
  const [description, setDescription] = useState('')
  const [projectId, setProjectId] = useState(null)
  const [date, setDate] = useState(today)
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('10:00')
  const [showProjectPicker, setShowProjectPicker] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    const startTs = new Date(`${date}T${startTime}:00`).getTime()
    const endTs = new Date(`${date}T${endTime}:00`).getTime()

    if (isNaN(startTs) || isNaN(endTs)) {
      setError('Invalid time format. Use HH:MM.')
      return
    }

    if (endTs <= startTs) {
      setError('End time must be after start time.')
      return
    }

    onAdd({
      description,
      projectId,
      tags: [],
      startTime: startTs,
      endTime: endTs,
    })
    onClose()
  }

  const activeProject = projects.find(p => p.id === projectId)

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Add manual entry</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <input
            type="text"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="What were you working on?"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#c95da7] transition-colors"
          />

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowProjectPicker(v => !v)}
              className={`w-full flex items-center gap-2 px-4 py-3 rounded-xl border text-sm transition-colors ${
                activeProject
                  ? 'border-transparent text-white'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
              style={activeProject ? { backgroundColor: activeProject.color } : {}}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: activeProject ? 'rgba(255,255,255,0.7)' : '#d1d5db' }}
              />
              {activeProject ? activeProject.name : 'No project'}
              <ChevronDown size={14} className="ml-auto" />
            </button>
            {showProjectPicker && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 w-full py-1">
                <button
                  type="button"
                  onClick={() => { setProjectId(null); setShowProjectPicker(false) }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2"
                >
                  <span className="w-2 h-2 rounded-full bg-gray-300" />
                  No project
                </button>
                {projects.map(p => (
                  <button
                    type="button"
                    key={p.id}
                    onClick={() => { setProjectId(p.id); setShowProjectPicker(false) }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                    {p.name}
                    {p.hourlyRate > 0 && (
                      <span className="ml-auto text-xs text-gray-400">{p.hourlyRate}/u</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Date</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#c95da7] transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Start</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="HH:MM"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                onBlur={e => {
                  const m = e.target.value.replace(/[^0-9]/g, '')
                  if (m.length === 4) setStartTime(`${m.slice(0,2)}:${m.slice(2)}`)
                }}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#c95da7] transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">End</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="HH:MM"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                onBlur={e => {
                  const m = e.target.value.replace(/[^0-9]/g, '')
                  if (m.length === 4) setEndTime(`${m.slice(0,2)}:${m.slice(2)}`)
                }}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#c95da7] transition-colors"
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-[#c95da7] hover:bg-[#a04389] text-white text-sm font-medium transition-colors"
            >
              Add entry
            </button>
          </div>
        </form>

        {showProjectPicker && (
          <div className="fixed inset-0 z-40" onClick={() => setShowProjectPicker(false)} />
        )}
      </div>
    </div>
  )
}
