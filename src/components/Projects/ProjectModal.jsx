import { useState } from 'react'
import { X } from 'lucide-react'

const PRESET_COLORS = [
  '#ef8e78', '#f1c93b', '#4a9eff', '#34d399', '#f97316',
  '#a8786e', '#82b8a0', '#b8a88c', '#7b9cbf', '#c5895a',
]

export default function ProjectModal({ project, currency, onSave, onClose }) {
  const [name, setName] = useState(project?.name || '')
  const [color, setColor] = useState(project?.color || PRESET_COLORS[0])
  const [client, setClient] = useState(project?.client || '')
  const [clientAddress, setClientAddress] = useState(project?.clientAddress || '')
  const [clientVAT, setClientVAT] = useState(project?.clientVAT || '')
  const [hourlyRate, setHourlyRate] = useState(
    project?.hourlyRate ? String(project.hourlyRate) : ''
  )
  const [maxHoursPerMonth, setMaxHoursPerMonth] = useState(
    project?.maxHoursPerMonth ? String(project.maxHoursPerMonth) : ''
  )
  const [rateError, setRateError] = useState('')
  const [clientErrors, setClientErrors] = useState({})

  const handleSubmit = (e) => {
    e.preventDefault()
    setRateError('')
    setClientErrors({})

    const rate = hourlyRate === '' ? 0 : parseFloat(hourlyRate.replace(',', '.'))
    if (hourlyRate !== '' && (isNaN(rate) || rate < 0)) {
      setRateError('Enter a valid rate (≥ 0).')
      return
    }
    if (!name.trim()) return

    if (rate > 0) {
      const errs = {}
      if (!client.trim()) errs.client = 'Verplicht voor facturatie.'
      if (!clientAddress.trim()) errs.clientAddress = 'Verplicht voor facturatie.'
      if (Object.keys(errs).length > 0) {
        setClientErrors(errs)
        return
      }
    }

    onSave({
      name: name.trim(),
      color,
      client: client.trim(),
      clientAddress: clientAddress.trim(),
      clientVAT: clientVAT.trim(),
      hourlyRate: rate || 0,
      maxHoursPerMonth: parseFloat(maxHoursPerMonth) || 0,
    })
    onClose()
  }

  const inputClass = 'w-full px-4 py-3 rounded-xl text-sm outline-none transition-[border-color,box-shadow] duration-150'
  const inputStyle = {
    backgroundColor: '#faf8f4',
    border: '1px solid rgba(43,42,39,0.12)',
    color: '#2b2a27',
  }
  const inputStyleError = {
    ...inputStyle,
    border: '1px solid #EF4444',
  }

  const onFocus = e => e.currentTarget.style.boxShadow = '0 0 0 3px rgba(241,201,59,0.30)'
  const onBlur = e => e.currentTarget.style.boxShadow = ''

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4 modal-backdrop">
      <div
        className="rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto modal-content"
        style={{ backgroundColor: '#f6f3ee', boxShadow: '0 32px 64px rgba(55,44,22,0.14)' }}
      >
        <div
          className="flex items-center justify-between p-6"
          style={{ borderBottom: '1px solid rgba(43,42,39,0.07)' }}
        >
          <h2 className="text-lg font-semibold" style={{ color: '#2b2a27' }}>
            {project ? 'Edit project' : 'New project'}
          </h2>
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
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#7c776f' }}>Project name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Design"
              autoFocus
              className={inputClass}
              style={inputStyle}
              onFocus={onFocus}
              onBlur={onBlur}
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: '#7c776f' }}>Color</label>
            <div className="flex gap-2 flex-wrap">
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform duration-150 ${color === c ? 'scale-125' : 'hover:scale-110'}`}
                  style={{
                    backgroundColor: c,
                    boxShadow: color === c ? `0 0 0 2px #f6f3ee, 0 0 0 4px ${c}` : 'none',
                  }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#7c776f' }}>
              Klant *
            </label>
            <input
              type="text"
              value={client}
              onChange={e => { setClient(e.target.value); setClientErrors(ce => ({ ...ce, client: undefined })) }}
              placeholder="e.g. Acme Corp"
              className={inputClass}
              style={clientErrors.client ? inputStyleError : inputStyle}
              onFocus={onFocus}
              onBlur={onBlur}
            />
            {clientErrors.client && <p className="text-xs mt-1" style={{ color: '#EF4444' }}>{clientErrors.client}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#7c776f' }}>
              Adres klant *
            </label>
            <textarea
              rows={3}
              value={clientAddress}
              onChange={e => { setClientAddress(e.target.value); setClientErrors(ce => ({ ...ce, clientAddress: undefined })) }}
              placeholder={"Straat 1\n1000 Brussel"}
              className={`${inputClass} resize-none`}
              style={clientErrors.clientAddress ? inputStyleError : inputStyle}
              onFocus={onFocus}
              onBlur={onBlur}
            />
            {clientErrors.clientAddress && <p className="text-xs mt-1" style={{ color: '#EF4444' }}>{clientErrors.clientAddress}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#7c776f' }}>BTW-nummer klant (optioneel)</label>
            <input
              type="text"
              value={clientVAT}
              onChange={e => setClientVAT(e.target.value)}
              placeholder="BE 0123.456.789"
              className={inputClass}
              style={inputStyle}
              onFocus={onFocus}
              onBlur={onBlur}
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#7c776f' }}>
              Hourly rate (optional)
            </label>
            <div className="flex items-center gap-0">
              <span
                className="inline-flex items-center px-3.5 py-3 rounded-l-xl text-sm font-medium"
                style={{
                  backgroundColor: '#e6e0d7',
                  border: '1px solid rgba(43,42,39,0.12)',
                  borderRight: 'none',
                  color: '#7c776f',
                }}
              >
                {currency}/u
              </span>
              <input
                type="number"
                value={hourlyRate}
                onChange={e => {
                  setRateError('')
                  setHourlyRate(e.target.value)
                }}
                placeholder="0"
                min="0"
                step="0.01"
                className="flex-1 px-4 py-3 rounded-r-xl text-sm outline-none transition-[border-color,box-shadow] duration-150"
                style={inputStyle}
                onFocus={onFocus}
                onBlur={onBlur}
              />
            </div>
            {rateError && <p className="text-xs mt-1" style={{ color: '#EF4444' }}>{rateError}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#7c776f' }}>
              Max uren per maand (optioneel)
            </label>
            <input
              type="number"
              value={maxHoursPerMonth}
              onChange={e => setMaxHoursPerMonth(e.target.value)}
              placeholder="bv. 6 — laat leeg voor geen limiet"
              min="0"
              step="0.5"
              className={inputClass}
              style={inputStyle}
              onFocus={onFocus}
              onBlur={onBlur}
            />
          </div>

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
              {project ? 'Save' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
