import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { useData } from '../context/DataContext'
import { Card, Button, Input, Select, Textarea, Modal, EmptyState, PageHeader } from '../components/ui'

function EntryForm({ initial = {}, onSave, onCancel }) {
  const { clients } = useData()
  const today = new Date().toISOString().slice(0, 10)

  const [form, setForm] = useState({
    clientId: initial.clientId || (clients[0]?.id || ''),
    date: initial.date || today,
    hours: initial.hours || '',
    description: initial.description || '',
  })
  const [errors, setErrors] = useState({})

  function validate() {
    const e = {}
    if (!form.clientId) e.clientId = 'Selecteer een klant'
    if (!form.date) e.date = 'Datum is verplicht'
    if (!form.hours || isNaN(Number(form.hours)) || Number(form.hours) <= 0) e.hours = 'Voer een geldig aantal uren in'
    return e
  }

  function handleSubmit(e) {
    e.preventDefault()
    const e2 = validate()
    if (Object.keys(e2).length) { setErrors(e2); return }
    onSave({ ...form, hours: Number(form.hours) })
  }

  if (clients.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-slate-500">Voeg eerst een klant toe voordat je uren kan loggen.</p>
        <Button variant="secondary" onClick={onCancel} className="mt-4">Sluiten</Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Select label="Klant" value={form.clientId} onChange={e => setForm(p => ({ ...p, clientId: e.target.value }))} error={errors.clientId}>
        <option value="">Selecteer klant...</option>
        {clients.map(c => <option key={c.id} value={c.id}>{c.name}{c.company ? ` — ${c.company}` : ''}</option>)}
      </Select>
      <Input label="Datum" type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} error={errors.date} />
      <Input label="Aantal uren" type="number" min="0.25" step="0.25" value={form.hours} onChange={e => setForm(p => ({ ...p, hours: e.target.value }))} error={errors.hours} placeholder="0.00" />
      <Textarea label="Omschrijving (optioneel)" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} placeholder="Wat heb je gedaan?" />
      <div className="flex gap-2 justify-end pt-2">
        <Button variant="secondary" onClick={onCancel}>Annuleren</Button>
        <Button type="submit">Opslaan</Button>
      </div>
    </form>
  )
}

export default function UrenLoggen() {
  const { clients, entries, addEntry, updateEntry, deleteEntry } = useData()
  const [modal, setModal] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const clientMap = Object.fromEntries(clients.map(c => [c.id, c]))
  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date))

  function handleSave(data) {
    if (modal === 'add') addEntry(data)
    else updateEntry(modal.entry.id, data)
    setModal(null)
  }

  function formatDate(dateStr) {
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('nl-BE', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  function formatAmount(entry) {
    const client = clientMap[entry.clientId]
    if (!client) return '—'
    return `€ ${(entry.hours * client.rate).toFixed(2)}`
  }

  return (
    <>
      <PageHeader
        title="Uren loggen"
        subtitle={`${entries.length} ${entries.length === 1 ? 'registratie' : 'registraties'}`}
      >
        <Button onClick={() => setModal('add')}><Plus size={15} /> Uren toevoegen</Button>
      </PageHeader>

      <div className="p-8">
        {sorted.length === 0 ? (
          <Card>
            <EmptyState icon="⏱" title="Nog geen uren gelogd" description="Voeg je eerste werkregistratie toe om je uren bij te houden." />
          </Card>
        ) : (
          <Card>
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr className="border-b border-slate-100">
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Datum</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Klant</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Omschrijving</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Uren</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Bedrag</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((entry, i) => {
                  const client = clientMap[entry.clientId]
                  return (
                    <tr key={entry.id} className={`${i > 0 ? 'border-t border-slate-100' : ''} hover:bg-blue-50/40 transition-colors duration-150`}>
                      <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">{formatDate(entry.date)}</td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-slate-800">{client?.name || '(verwijderd)'}</span>
                        {client?.company && <span className="text-xs text-slate-400 ml-1.5">{client.company}</span>}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 max-w-xs truncate">{entry.description || '—'}</td>
                      <td className="px-6 py-4 text-right font-mono text-sm text-slate-600">{entry.hours}u</td>
                      <td className="px-6 py-4 text-right font-mono text-sm font-semibold text-slate-800">{formatAmount(entry)}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1.5 justify-end">
                          <Button size="sm" variant="ghost" onClick={() => setModal({ type: 'edit', entry })}>
                            <Pencil size={13} />
                          </Button>
                          <Button size="sm" variant="danger" onClick={() => setDeleteConfirm(entry)}>
                            <Trash2 size={13} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </Card>
        )}
      </div>

      {modal && (
        <Modal title={modal === 'add' ? 'Uren toevoegen' : 'Registratie bewerken'} onClose={() => setModal(null)}>
          <EntryForm initial={modal.entry || {}} onSave={handleSave} onCancel={() => setModal(null)} />
        </Modal>
      )}

      {deleteConfirm && (
        <Modal title="Registratie verwijderen" onClose={() => setDeleteConfirm(null)}>
          <p className="text-sm text-slate-600 mb-5">
            Weet je zeker dat je deze registratie van <strong>{deleteConfirm.hours}u</strong> op {formatDate(deleteConfirm.date)} wil verwijderen?
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>Annuleren</Button>
            <Button variant="danger" onClick={() => { deleteEntry(deleteConfirm.id); setDeleteConfirm(null) }}>
              <Trash2 size={13} /> Verwijderen
            </Button>
          </div>
        </Modal>
      )}
    </>
  )
}
