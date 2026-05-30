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

  const inputClass = 'w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#6B5CF6] focus:ring-2 focus:ring-[#6B5CF6]/15 transition-[border-color,box-shadow] duration-150'

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 modal-backdrop">
      <div className="bg-white rounded-2xl w-full max-w-md modal-content" style={{ boxShadow: '0 32px 64px rgba(15,23,42,0.18)' }}>
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-[#111827]">Add manual entry</h2>
          <button onClick={onClose} className="text-[#6B7280] hover:text-[#111827] transition-colors duration-150 rounded-lg p-1 hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <input
            type="text"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="What were you working on?"
            className={inputClass}
          />

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowProjectPicker(v => !v)}
              className={`w-full flex items-center gap-2 px-4 py-3 rounded-xl border text-sm transition-[border-color,background-color] duration-150 ${
                activeProject
                  ? 'border-transparent text-white'
                  : 'border-gray-200 text-[#6B7280] hover:border-gray-300'
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
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-100 rounded-2xl z-50 w-full py-1.5 overflow-hidden dropdown-content" style={{ boxShadow: '0 20px 40px rgba(15,23,42,0.12)' }}>
                <button
                  type="button"
                  onClick={() => { setProjectId(null); setShowProjectPicker(false) }}
                  className="w-full text-left px-4 py-2 text-sm text-[#6B7280] hover:bg-gray-50 flex items-center gap-2 transition-colors duration-100"
                >
                  <span className="w-2 h-2 rounded-full bg-gray-300" />
                  No project
                </button>
                {projects.map(p => (
                  <button
                    type="button"
                    key={p.id}
                    onClick={() => { setProjectId(p.id); setShowProjectPicker(false) }}
                    className="w-full text-left px-4 py-2 text-sm text-[#111827] hover:bg-gray-50 flex items-center gap-2 transition-colors duration-100"
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                    {p.name}
                    {p.hourlyRate > 0 && (
                      <span className="ml-auto text-xs text-[#6B7280]">{p.hourlyRate}/u</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <label className="block text-xs font-medium text-[#6B7280] mb-1.5">Date</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#6B7280] mb-1.5">Start</label>
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
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#6B7280] mb-1.5">End</label>
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
                className={inputClass}
              />
            </div>
          </div>

          {error && <p className="text-[#EF4444] text-sm">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-full border border-gray-200 text-sm font-medium text-[#6B7280] hover:bg-gray-50 transition-[transform,background-color] duration-150 active:scale-[0.97]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-full bg-[#6B5CF6] hover:bg-[#5347d4] text-white text-sm font-medium transition-[transform,background-color] duration-150 active:scale-[0.97]"
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
