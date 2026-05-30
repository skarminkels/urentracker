import { useState } from 'react'
import { X, ChevronDown } from 'lucide-react'

export default function EditEntryModal({ entry, projects, onSave, onClose }) {
  const formatLocalDate = (ts) => new Date(ts).toISOString().split('T')[0]
  const formatLocalTime = (ts) => {
    const d = new Date(ts)
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  }

  const [description, setDescription] = useState(entry.description)
  const [projectId, setProjectId] = useState(entry.projectId)
  const [date, setDate] = useState(formatLocalDate(entry.startTime))
  const [startTime, setStartTime] = useState(formatLocalTime(entry.startTime))
  const [endTime, setEndTime] = useState(entry.endTime ? formatLocalTime(entry.endTime) : '')
  const [showProjectPicker, setShowProjectPicker] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    const startTs = new Date(`${date}T${startTime}:00`).getTime()
    const endTs = endTime ? new Date(`${date}T${endTime}:00`).getTime() : null

    if (isNaN(startTs) || (endTs !== null && isNaN(endTs))) {
      setError('Invalid time format. Use HH:MM.')
      return
    }

    if (endTs && endTs <= startTs) {
      setError('End time must be after start time.')
      return
    }

    onSave(entry.id, {
      description,
      projectId,
      startTime: startTs,
      endTime: endTs,
    })
    onClose()
  }

  const activeProject = projects.find(p => p.id === projectId)

  const inputClass = 'w-full px-4 py-3 rounded-xl text-sm outline-none transition-[border-color,box-shadow] duration-150'
  const inputStyle = {
    backgroundColor: '#faf8f4',
    border: '1px solid rgba(43,42,39,0.12)',
    color: '#2b2a27',
  }

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4 modal-backdrop">
      <div
        className="rounded-2xl w-full max-w-md modal-content"
        style={{ backgroundColor: '#f6f3ee', boxShadow: '0 32px 64px rgba(55,44,22,0.14)' }}
      >
        <div
          className="flex items-center justify-between p-6"
          style={{ borderBottom: '1px solid rgba(43,42,39,0.07)' }}
        >
          <h2 className="text-lg font-semibold" style={{ color: '#2b2a27' }}>Edit entry</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 transition-colors duration-150"
            style={{ color: '#7c776f' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#2b2a27'; e.currentTarget.style.backgroundColor = '#e6e0d7' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#7c776f'; e.currentTarget.style.backgroundColor = '' }}
          >
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
            style={inputStyle}
            onFocus={e => e.currentTarget.style.boxShadow = '0 0 0 3px rgba(241,201,59,0.30)'}
            onBlur={e => e.currentTarget.style.boxShadow = ''}
          />

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowProjectPicker(v => !v)}
              className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-sm transition-[border-color,background-color] duration-150"
              style={activeProject
                ? { backgroundColor: activeProject.color, border: '1px solid transparent', color: '#fff' }
                : { ...inputStyle, color: '#7c776f' }
              }
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: activeProject ? 'rgba(255,255,255,0.7)' : '#c0b8ae' }}
              />
              {activeProject ? activeProject.name : 'No project'}
              <ChevronDown size={14} className="ml-auto" />
            </button>
            {showProjectPicker && (
              <div
                className="absolute top-full left-0 mt-1 rounded-2xl z-50 w-full py-1.5 overflow-hidden dropdown-content"
                style={{
                  backgroundColor: '#faf8f4',
                  border: '1px solid rgba(43,42,39,0.08)',
                  boxShadow: '0 20px 40px rgba(55,44,22,0.10)',
                }}
              >
                <button
                  type="button"
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
                    type="button"
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
                      <span className="ml-auto text-xs" style={{ color: '#7c776f' }}>{p.hourlyRate}/u</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#7c776f' }}>Date</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className={inputClass}
                style={inputStyle}
                onFocus={e => e.currentTarget.style.boxShadow = '0 0 0 3px rgba(241,201,59,0.30)'}
                onBlur={e => e.currentTarget.style.boxShadow = ''}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#7c776f' }}>Start</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="HH:MM"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                onBlur={e => {
                  const m = e.target.value.replace(/[^0-9]/g, '')
                  if (m.length === 4) setStartTime(`${m.slice(0,2)}:${m.slice(2)}`)
                  e.currentTarget.style.boxShadow = ''
                }}
                className={inputClass}
                style={inputStyle}
                onFocus={e => e.currentTarget.style.boxShadow = '0 0 0 3px rgba(241,201,59,0.30)'}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#7c776f' }}>End</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="HH:MM"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                onBlur={e => {
                  const m = e.target.value.replace(/[^0-9]/g, '')
                  if (m.length === 4) setEndTime(`${m.slice(0,2)}:${m.slice(2)}`)
                  e.currentTarget.style.boxShadow = ''
                }}
                className={inputClass}
                style={inputStyle}
                onFocus={e => e.currentTarget.style.boxShadow = '0 0 0 3px rgba(241,201,59,0.30)'}
              />
            </div>
          </div>

          {error && <p className="text-sm" style={{ color: '#EF4444' }}>{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-full text-sm font-medium transition-[transform,background-color] duration-150 active:scale-[0.97]"
              style={{ border: '1px solid rgba(43,42,39,0.12)', color: '#7c776f' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#e6e0d7'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = ''}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-full text-sm font-medium text-white transition-[transform,background-color] duration-150 active:scale-[0.97]"
              style={{ backgroundColor: '#20242c' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#2d3340'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#20242c'}
            >
              Save
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
