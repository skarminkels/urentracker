import { useState } from 'react'
import { useData } from '../context/DataContext'
import { Card, Input, Button, PageHeader } from '../components/ui'

function Toggle({ checked, onChange, label, description }) {
  return (
    <label className="flex items-start gap-3 cursor-pointer">
      <div className="relative mt-0.5 shrink-0">
        <input type="checkbox" className="sr-only" checked={checked} onChange={e => onChange(e.target.checked)} />
        <div className={`w-10 h-6 rounded-full transition-colors duration-150 ${checked ? 'bg-brand' : 'bg-surface-hover'}`} />
        <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-surface shadow transition-transform duration-150 ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
      </div>
      <div>
        <p className="text-sm font-medium text-ink-primary">{label}</p>
        {description && <p className="text-xs text-ink-muted mt-0.5">{description}</p>}
      </div>
    </label>
  )
}

export default function Instellingen() {
  const { settings, setSettings } = useData()

  const [form, setForm] = useState({
    threshold: 8595, showThreshold: true,
    iban: '', studentNumber: '',
    btwEnabled: false, btwNumber: '', btwRate: 21,
    paymentTermDays: 30,
    ...settings,
  })
  const [saved, setSaved] = useState(false)

  function handleSave(e) {
    e.preventDefault()
    setSettings({
      ...form,
      threshold: Number(form.threshold),
      btwRate: Number(form.btwRate),
      paymentTermDays: Number(form.paymentTermDays),
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  function field(key) {
    return {
      value: form[key] ?? '',
      onChange: e => { setForm(p => ({ ...p, [key]: e.target.value })); setSaved(false) },
    }
  }

  function toggle(key) {
    return {
      checked: form[key] ?? false,
      onChange: val => { setForm(p => ({ ...p, [key]: val })); setSaved(false) },
    }
  }

  return (
    <>
      <PageHeader title="Instellingen" subtitle="Jouw gegevens worden gebruikt in facturen en PDF-exports." />

      <div className="p-8 max-w-xl">
        <form onSubmit={handleSave} className="flex flex-col gap-6">
          <Card className="p-6">
            <h3 className="text-sm font-semibold text-ink-primary mb-4">Persoonlijke gegevens</h3>
            <div className="flex flex-col gap-4">
              <Input label="Volledige naam" placeholder="Timon Dewerchin" {...field('name')} />
              <Input label="Adres" placeholder="Straat 1, 1000 Brussel" {...field('address')} />
              <Input label="E-mailadres" type="email" placeholder="timon@voorbeeld.be" {...field('email')} />
              <Input label="Telefoonnummer" type="tel" placeholder="+32 470 00 00 00" {...field('phone')} />
              <Input label="Ondernemingsnummer student (optioneel)" placeholder="BE 0XXX.XXX.XXX" {...field('studentNumber')} />
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-sm font-semibold text-ink-primary mb-4">Facturatie</h3>
            <div className="flex flex-col gap-4">
              <Input label="IBAN rekeningnummer" placeholder="BE68 5390 0754 7034" {...field('iban')} />
              <Input
                label="Standaard betaaltermijn (dagen)"
                type="number" min="1" step="1" placeholder="30"
                value={form.paymentTermDays ?? 30}
                onChange={e => { setForm(p => ({ ...p, paymentTermDays: e.target.value })); setSaved(false) }}
              />
              <div className="pt-1">
                <Toggle
                  label="BTW toepassen"
                  description="Standaard uit voor student-ondernemers. Schakel in als je BTW-plichtig bent."
                  {...toggle('btwEnabled')}
                />
              </div>
              {form.btwEnabled && (
                <div className="grid grid-cols-2 gap-3 pl-13">
                  <Input label="BTW-nummer" placeholder="BE 0XXX.XXX.XXX" {...field('btwNumber')} />
                  <Input
                    label="BTW-tarief (%)"
                    type="number" min="0" max="100" step="1" placeholder="21"
                    value={form.btwRate ?? 21}
                    onChange={e => { setForm(p => ({ ...p, btwRate: e.target.value })); setSaved(false) }}
                  />
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-sm font-semibold text-ink-primary mb-1">Jaarlimiet</h3>
            <p className="text-xs text-ink-muted mb-4">
              De Belgische jaarlimiet voor netto-inkomsten als student-ondernemer is momenteel €8.595. Pas aan als de wettelijke grens wijzigt.
            </p>
            <div className="flex flex-col gap-4">
              <Input
                label="Jaarlimiet (€ netto)"
                type="number" min="0" step="1" placeholder="8595"
                value={form.threshold ?? 8595}
                onChange={e => { setForm(p => ({ ...p, threshold: e.target.value })); setSaved(false) }}
              />
              <Toggle
                label="Toon drempelwaarschuwing op dashboard"
                description="Toont de voortgangsbalk op het dashboard."
                {...toggle('showThreshold')}
              />
            </div>
          </Card>

          <div className="flex items-center gap-3">
            <Button type="submit">Opslaan</Button>
            {saved && <span className="text-sm font-medium" style={{ color: '#80CBC4' }}>Opgeslagen ✓</span>}
          </div>
        </form>
      </div>
    </>
  )
}
