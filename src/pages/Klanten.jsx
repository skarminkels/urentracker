import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { useData } from '../context/DataContext'
import { Card, Button, Input, Modal, EmptyState, PageHeader } from '../components/ui'

function ClientForm({ initial = {}, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: initial.name || '',
    company: initial.company || '',
    address: initial.address || '',
    rate: initial.rate || '',
  })
  const [errors, setErrors] = useState({})

  function validate() {
    const e = {}
    if (!form.name.trim()) e.name = 'Naam is verplicht'
    if (!form.rate || isNaN(Number(form.rate)) || Number(form.rate) <= 0) e.rate = 'Voer een geldig uurtarief in'
    return e
  }

  function handleSubmit(e) {
    e.preventDefault()
    const e2 = validate()
    if (Object.keys(e2).length) { setErrors(e2); return }
    onSave({ ...form, rate: Number(form.rate) })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input label="Naam" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} error={errors.name} placeholder="Voornaam Achternaam" />
      <Input label="Bedrijfsnaam" value={form.company} onChange={e => setForm(p => ({ ...p, company: e.target.value }))} placeholder="Optioneel" />
      <Input label="Adres" value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} placeholder="Straat 1, 1000 Brussel (optioneel)" />
      <Input label="Uurtarief (€/u)" type="number" min="0" step="0.5" value={form.rate} onChange={e => setForm(p => ({ ...p, rate: e.target.value }))} error={errors.rate} placeholder="0.00" />
      <div className="flex gap-2 justify-end pt-2">
        <Button variant="secondary" onClick={onCancel}>Annuleren</Button>
        <Button type="submit">Opslaan</Button>
      </div>
    </form>
  )
}

export default function Klanten() {
  const { clients, addClient, updateClient, deleteClient } = useData()
  const [modal, setModal] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  function handleSave(data) {
    if (modal === 'add') addClient(data)
    else updateClient(modal.client.id, data)
    setModal(null)
  }

  return (
    <>
      <PageHeader
        title="Klanten"
        subtitle={`${clients.length} ${clients.length === 1 ? 'klant' : 'klanten'}`}
      >
        <Button onClick={() => setModal('add')}><Plus size={15} /> Klant toevoegen</Button>
      </PageHeader>

      <div className="p-8">
        {clients.length === 0 ? (
          <Card>
            <EmptyState icon="👤" title="Nog geen klanten" description="Voeg je eerste klant toe om uren bij te houden en facturen te genereren." />
          </Card>
        ) : (
          <Card>
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr className="border-b border-slate-100">
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Naam</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Bedrijf</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Uurtarief</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client, i) => (
                  <tr key={client.id} className={`${i > 0 ? 'border-t border-slate-100' : ''} hover:bg-blue-50/40 transition-colors duration-150`}>
                    <td className="px-6 py-4 text-sm font-medium text-slate-800">{client.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{client.company || '—'}</td>
                    <td className="px-6 py-4 text-right font-mono text-sm text-slate-600">€ {Number(client.rate).toFixed(2)}/u</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1.5 justify-end">
                        <Button size="sm" variant="ghost" onClick={() => setModal({ type: 'edit', client })}>
                          <Pencil size={13} />
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => setDeleteConfirm(client)}>
                          <Trash2 size={13} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </div>

      {modal && (
        <Modal title={modal === 'add' ? 'Klant toevoegen' : 'Klant bewerken'} onClose={() => setModal(null)}>
          <ClientForm initial={modal.client || {}} onSave={handleSave} onCancel={() => setModal(null)} />
        </Modal>
      )}

      {deleteConfirm && (
        <Modal title="Klant verwijderen" onClose={() => setDeleteConfirm(null)}>
          <p className="text-sm text-slate-600 mb-5">
            Weet je zeker dat je <strong>{deleteConfirm.name}</strong> wil verwijderen? Alle bijbehorende uren worden ook verwijderd.
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>Annuleren</Button>
            <Button variant="danger" onClick={() => { deleteClient(deleteConfirm.id); setDeleteConfirm(null) }}>
              <Trash2 size={13} /> Verwijderen
            </Button>
          </div>
        </Modal>
      )}
    </>
  )
}
