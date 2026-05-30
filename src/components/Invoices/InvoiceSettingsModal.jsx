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

  const inputClass = 'w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-[border-color,box-shadow] duration-150'
  const inputStyle = {
    backgroundColor: '#faf8f4',
    border: '1px solid rgba(43,42,39,0.12)',
    color: '#2b2a27',
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
          className="flex items-center justify-between p-6 sticky top-0"
          style={{
            backgroundColor: '#f6f3ee',
            borderBottom: '1px solid rgba(43,42,39,0.07)',
          }}
        >
          <h2 className="text-lg font-semibold" style={{ color: '#2b2a27' }}>Mijn gegevens</h2>
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
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#7c776f' }}>Volledige naam *</label>
            <input required value={form.naam} onChange={set('naam')} className={inputClass} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#7c776f' }}>Straat + nummer *</label>
            <input required value={form.straat} onChange={set('straat')} className={inputClass} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#7c776f' }}>Postcode *</label>
              <input required value={form.postcode} onChange={set('postcode')} className={inputClass} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#7c776f' }}>Gemeente *</label>
              <input required value={form.gemeente} onChange={set('gemeente')} className={inputClass} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#7c776f' }}>
              Ondernemingsnummer <span className="font-normal" style={{ color: '#c0b8ae' }}>(optioneel)</span>
            </label>
            <input
              value={form.ondernemingsnummer}
              onChange={set('ondernemingsnummer')}
              placeholder="BE 0XXX.XXX.XXX"
              className={inputClass}
              style={inputStyle}
              onFocus={onFocus}
              onBlur={onBlur}
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#7c776f' }}>IBAN *</label>
            <input
              required
              value={form.iban}
              onChange={set('iban')}
              placeholder="BE00 0000 0000 0000"
              className={inputClass}
              style={inputStyle}
              onFocus={onFocus}
              onBlur={onBlur}
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#7c776f' }}>
              Betalingstermijn (dagen)
            </label>
            <input
              type="number"
              min="1"
              max="365"
              value={form.betalingstermijn}
              onChange={set('betalingstermijn')}
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
              Annuleren
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-full text-sm font-medium text-white transition-[transform,background-color] duration-150 active:scale-[0.97]"
              style={{ backgroundColor: '#20242c' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#2d3340'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#20242c'}
            >
              Opslaan
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
