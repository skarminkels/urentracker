import { useState } from 'react'
import { X } from 'lucide-react'

const DEFAULTS = {
  naam: '',
  straat: '',
  postcode: '',
  gemeente: '',
  ondernemingsnummer: '',
  iban: '',
  betalingstermijn: 30,
}

export default function InvoiceSettingsModal({ settings, onSave, onClose }) {
  const [form, setForm] = useState({ ...DEFAULTS, ...settings })

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({ ...form, betalingstermijn: Number(form.betalingstermijn) || 30 })
  }

  const inputClass =
    'w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#c95da7] transition-colors'

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white">
          <h2 className="text-lg font-semibold text-gray-900">Mijn gegevens</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Volledige naam *</label>
            <input required value={form.naam} onChange={set('naam')} className={inputClass} />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Straat + nummer *</label>
            <input required value={form.straat} onChange={set('straat')} className={inputClass} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Postcode *</label>
              <input required value={form.postcode} onChange={set('postcode')} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Gemeente *</label>
              <input required value={form.gemeente} onChange={set('gemeente')} className={inputClass} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              Ondernemingsnummer <span className="text-gray-400 font-normal">(optioneel)</span>
            </label>
            <input
              value={form.ondernemingsnummer}
              onChange={set('ondernemingsnummer')}
              placeholder="BE 0XXX.XXX.XXX"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">IBAN *</label>
            <input
              required
              value={form.iban}
              onChange={set('iban')}
              placeholder="BE00 0000 0000 0000"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              Betalingstermijn (dagen)
            </label>
            <input
              type="number"
              min="1"
              max="365"
              value={form.betalingstermijn}
              onChange={set('betalingstermijn')}
              className={inputClass}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Annuleren
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-[#c95da7] hover:bg-[#a04389] text-white text-sm font-medium transition-colors"
            >
              Opslaan
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
