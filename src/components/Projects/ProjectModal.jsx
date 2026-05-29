import { useState } from 'react'
import { X } from 'lucide-react'

const PRESET_COLORS = [
  '#c95da7', '#e57cd8', '#4a9eff', '#34d399', '#f97316',
  '#ef4444', '#a78bfa', '#fbbf24', '#06b6d4', '#84cc16',
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

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            {project ? 'Edit project' : 'New project'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Project name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Design"
              autoFocus
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#c95da7] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">Color</label>
            <div className="flex gap-2 flex-wrap">
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform ${color === c ? 'scale-125 ring-2 ring-offset-2 ring-gray-400' : 'hover:scale-110'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              Klant *
            </label>
            <input
              type="text"
              value={client}
              onChange={e => { setClient(e.target.value); setClientErrors(ce => ({ ...ce, client: undefined })) }}
              placeholder="e.g. Acme Corp"
              className={`w-full px-4 py-3 rounded-xl border text-sm outline-none focus:border-[#c95da7] transition-colors ${clientErrors.client ? 'border-red-400' : 'border-gray-200'}`}
            />
            {clientErrors.client && <p className="text-red-500 text-xs mt-1">{clientErrors.client}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              Adres klant *
            </label>
            <textarea
              rows={3}
              value={clientAddress}
              onChange={e => { setClientAddress(e.target.value); setClientErrors(ce => ({ ...ce, clientAddress: undefined })) }}
              placeholder={"Straat 1\n1000 Brussel"}
              className={`w-full px-4 py-3 rounded-xl border text-sm outline-none focus:border-[#c95da7] transition-colors resize-none ${clientErrors.clientAddress ? 'border-red-400' : 'border-gray-200'}`}
            />
            {clientErrors.clientAddress && <p className="text-red-500 text-xs mt-1">{clientErrors.clientAddress}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">BTW-nummer klant (optioneel)</label>
            <input
              type="text"
              value={clientVAT}
              onChange={e => setClientVAT(e.target.value)}
              placeholder="BE 0123.456.789"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#c95da7] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              Hourly rate (optional)
            </label>
            <div className="flex items-center gap-0">
              <span className="inline-flex items-center px-3.5 py-3 bg-gray-50 border border-r-0 border-gray-200 rounded-l-xl text-sm text-gray-500 font-medium">
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
                className="flex-1 px-4 py-3 rounded-r-xl border border-gray-200 text-sm outline-none focus:border-[#c95da7] transition-colors"
              />
            </div>
            {rateError && <p className="text-red-500 text-xs mt-1">{rateError}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              Max uren per maand (optioneel)
            </label>
            <input
              type="number"
              value={maxHoursPerMonth}
              onChange={e => setMaxHoursPerMonth(e.target.value)}
              placeholder="bv. 6 — laat leeg voor geen limiet"
              min="0"
              step="0.5"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#c95da7] transition-colors"
            />
          </div>

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
              {project ? 'Save' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
