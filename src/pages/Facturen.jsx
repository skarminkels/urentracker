import { useState, useMemo } from 'react'
import { Plus, Download, Trash2, ArrowLeft, Check } from 'lucide-react'
import { useData } from '../context/DataContext'
import { Card, Button, Input, Select, Textarea, Modal, Badge, EmptyState, PageHeader } from '../components/ui'
import { generateFactuurPdf } from '../lib/factuurPdf'

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(amount) {
  return new Intl.NumberFormat('nl-BE', { style: 'currency', currency: 'EUR' }).format(amount)
}

function fmtDateBE(dateStr) {
  const d = new Date(dateStr + 'T12:00:00')
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
}

function monthLabel(key) {
  const [y, m] = key.split('-')
  const label = new Date(Number(y), Number(m) - 1, 1)
    .toLocaleDateString('nl-BE', { month: 'long', year: 'numeric' })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

function currentMonthKey() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function buildLineItems(entries, rate, grouping) {
  if (grouping === 'per-description') {
    const map = new Map()
    for (const e of entries) {
      const key = (e.description || 'Werkzaamheden').trim()
      if (!map.has(key)) map.set(key, { description: key, hours: 0, rate, total: 0 })
      const row = map.get(key)
      row.hours = Math.round((row.hours + e.hours) * 1000) / 1000
      row.total = Math.round((row.total + e.hours * rate) * 100) / 100
    }
    return [...map.values()].sort((a, b) => a.description.localeCompare(b.description))
  }
  return [...entries].sort((a, b) => a.date.localeCompare(b.date)).map(e => {
    const d = new Date(e.date + 'T12:00:00')
    const dd = String(d.getDate()).padStart(2, '0')
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dateStr = `${dd}/${mm}`
    return {
      description: e.description ? `${dateStr} — ${e.description}` : `Werkzaamheden ${dateStr}`,
      hours: e.hours,
      rate,
      total: Math.round(e.hours * rate * 100) / 100,
    }
  })
}

const STATUS_LABEL = { concept: 'Concept', verstuurd: 'Verstuurd', betaald: 'Betaald' }
const STATUS_COLOR = { concept: 'slate', verstuurd: 'blue', betaald: 'teal' }

// ── Invoice list ──────────────────────────────────────────────────────────────

function InvoiceList({ onCreate, onDetail }) {
  const { invoices, clients, updateInvoice, deleteInvoice, settings } = useData()
  const [filterClient, setFilterClient] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)

  const clientMap = Object.fromEntries(clients.map(c => [c.id, c]))

  const filtered = useMemo(() =>
    [...invoices]
      .filter(inv => !filterClient || inv.clientId === filterClient)
      .filter(inv => !filterStatus || inv.status === filterStatus)
      .sort((a, b) => b.number.localeCompare(a.number)),
    [invoices, filterClient, filterStatus],
  )

  function handleDownload(inv) {
    const client = clientMap[inv.clientId]
    if (!client) return
    generateFactuurPdf({ invoice: inv, client, settings })
  }

  const selectCls = 'border border-bdr rounded-md px-3 py-2 text-sm bg-surface text-ink-secondary focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all duration-150'

  return (
    <>
      <PageHeader
        title="Facturen"
        subtitle={`${invoices.length} ${invoices.length === 1 ? 'factuur' : 'facturen'}`}
      >
        <Button onClick={onCreate}><Plus size={15} /> Factuur aanmaken</Button>
      </PageHeader>

      <div className="p-8">
        {invoices.length > 0 && (
          <div className="flex gap-3 mb-4">
            <select value={filterClient} onChange={e => setFilterClient(e.target.value)} className={selectCls}>
              <option value="">Alle klanten</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className={selectCls}>
              <option value="">Alle statussen</option>
              <option value="concept">Concept</option>
              <option value="verstuurd">Verstuurd</option>
              <option value="betaald">Betaald</option>
            </select>
          </div>
        )}

        {invoices.length === 0 ? (
          <Card>
            <EmptyState icon="🧾" title="Nog geen facturen" description="Maak je eerste factuur aan op basis van gelogde uren." />
          </Card>
        ) : filtered.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-ink-secondary text-sm">Geen facturen gevonden voor deze filters.</p>
          </Card>
        ) : (
          <Card>
            <table className="w-full">
              <thead className="bg-canvas">
                <tr className="border-b border-bdr">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wide">Nr</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wide">Klant</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wide">Periode</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wide">Bedrag</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wide">Status</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((inv, i) => {
                  const client = clientMap[inv.clientId]
                  return (
                    <tr
                      key={inv.id}
                      className={`${i > 0 ? 'border-t border-bdr' : ''} hover:bg-surface-hover transition-colors duration-150 cursor-pointer`}
                      onClick={() => onDetail(inv.id)}
                    >
                      <td className="px-6 py-4 font-mono text-sm font-medium text-ink-primary">{inv.number}</td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-ink-primary">{client?.name || '(verwijderd)'}</span>
                        {client?.company && <span className="text-xs text-ink-muted ml-1.5">{client.company}</span>}
                      </td>
                      <td className="px-6 py-4 text-sm text-ink-secondary">{monthLabel(inv.monthKey)}</td>
                      <td className="px-6 py-4 text-right font-mono text-sm font-semibold text-ink-primary">{fmt(inv.totalAmount)}</td>
                      <td className="px-6 py-4">
                        <Badge color={STATUS_COLOR[inv.status]}>{STATUS_LABEL[inv.status]}</Badge>
                      </td>
                      <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                        <div className="flex gap-1.5 justify-end">
                          <Button size="sm" variant="ghost" onClick={() => handleDownload(inv)}>
                            <Download size={13} />
                          </Button>
                          {inv.status === 'concept' && (
                            <Button size="sm" variant="ghost" onClick={() => updateInvoice(inv.id, { status: 'verstuurd' })}>
                              <Check size={13} />
                            </Button>
                          )}
                          {inv.status === 'verstuurd' && (
                            <Button size="sm" variant="ghost" onClick={() => updateInvoice(inv.id, { status: 'betaald' })}>
                              <Check size={13} />
                            </Button>
                          )}
                          <Button size="sm" variant="danger" onClick={() => setDeleteTarget(inv)}>
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

      {deleteTarget && (
        <Modal title="Factuur verwijderen" onClose={() => setDeleteTarget(null)}>
          <p className="text-sm text-ink-secondary mb-5">
            Weet je zeker dat je factuur <strong>{deleteTarget.number}</strong> wil verwijderen?
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Annuleren</Button>
            <Button variant="danger" onClick={() => { deleteInvoice(deleteTarget.id); setDeleteTarget(null) }}>
              <Trash2 size={13} /> Verwijderen
            </Button>
          </div>
        </Modal>
      )}
    </>
  )
}

// ── Create invoice ────────────────────────────────────────────────────────────

function CreateInvoice({ onBack, onCreated }) {
  const { clients, entries, addInvoice, invoices, settings } = useData()

  const [clientId, setClientId] = useState(clients[0]?.id || '')
  const [monthKey, setMonthKey] = useState(currentMonthKey)
  const [grouping, setGrouping] = useState('per-description')
  const [notes, setNotes] = useState('')

  const client = clients.find(c => c.id === clientId)

  const preview = useMemo(() => {
    if (!clientId || !monthKey || !client) return null
    const monthEntries = entries.filter(e => e.clientId === clientId && e.date.startsWith(monthKey))
    if (monthEntries.length === 0) return null
    const lineItems = buildLineItems(monthEntries, client.rate, grouping)
    const totalAmount = lineItems.reduce((s, li) => s + li.total, 0)
    return { lineItems, totalAmount, entryCount: monthEntries.length }
  }, [clientId, monthKey, grouping, entries, client])

  const duplicate = invoices.find(inv => inv.clientId === clientId && inv.monthKey === monthKey)

  function handleCreate() {
    if (!preview || !client) return
    const today = new Date().toISOString().slice(0, 10)
    const created = addInvoice({
      clientId, monthKey,
      lineItems: preview.lineItems,
      totalAmount: preview.totalAmount,
      dateIssued: today,
      status: 'concept',
      notes, grouping,
    })
    onCreated(created.id)
  }

  const btwEnabled = settings?.btwEnabled ?? false
  const btwRate = Number(settings?.btwRate ?? 21)
  const btwAmount = btwEnabled && preview ? preview.totalAmount * (btwRate / 100) : 0
  const grandTotal = preview ? preview.totalAmount + btwAmount : 0

  return (
    <>
      <PageHeader title="Factuur aanmaken">
        <Button variant="secondary" onClick={onBack}><ArrowLeft size={15} /> Terug</Button>
      </PageHeader>

      <div className="p-8 max-w-2xl">
        <div className="flex flex-col gap-5">
          <Card className="p-6">
            <h3 className="text-sm font-semibold text-ink-primary mb-4">Factuurgegevens</h3>
            <div className="grid grid-cols-2 gap-4">
              <Select label="Klant" value={clientId} onChange={e => setClientId(e.target.value)}>
                {clients.length === 0 && <option value="">Geen klanten</option>}
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}{c.company ? ` — ${c.company}` : ''}</option>)}
              </Select>
              <Input label="Periode (maand)" type="month" value={monthKey} onChange={e => setMonthKey(e.target.value)} />
            </div>

            <div className="mt-4">
              <p className="text-sm font-medium text-ink-primary mb-2">Groepering regelitems</p>
              <div className="flex gap-4">
                {[
                  { value: 'per-description', label: 'Per omschrijving', desc: 'Gelijke omschrijvingen samenvoegen' },
                  { value: 'per-entry', label: 'Per registratie', desc: 'Elke urenregistratie als aparte regel' },
                ].map(opt => (
                  <label key={opt.value} className="flex items-start gap-2 cursor-pointer">
                    <input type="radio" name="grouping" value={opt.value} checked={grouping === opt.value} onChange={() => setGrouping(opt.value)} className="mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-ink-primary">{opt.label}</p>
                      <p className="text-xs text-ink-muted">{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <Textarea label="Notities (optioneel)" placeholder="Verschijnt onderaan de factuur" rows={2} value={notes} onChange={e => setNotes(e.target.value)} />
            </div>
          </Card>

          {clientId && monthKey && (
            <Card className="p-6">
              <h3 className="text-sm font-semibold text-ink-primary mb-3">Voorvertoning regelitems</h3>
              {duplicate && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-4">
                  <p className="text-sm text-amber-700">⚠ Er bestaat al een factuur ({duplicate.number}) voor deze klant en periode.</p>
                </div>
              )}
              {!preview ? (
                <p className="text-sm text-ink-muted italic">
                  Geen uren gevonden voor {client?.name || '...'} in {monthKey ? monthLabel(monthKey) : '...'}.
                </p>
              ) : (
                <>
                  <table className="w-full mb-4">
                    <thead className="bg-canvas">
                      <tr className="border-b border-bdr">
                        <th className="text-left py-2 text-xs font-semibold text-ink-muted uppercase tracking-wide">Omschrijving</th>
                        <th className="text-right py-2 text-xs font-semibold text-ink-muted uppercase tracking-wide w-16">Uren</th>
                        <th className="text-right py-2 text-xs font-semibold text-ink-muted uppercase tracking-wide w-24">Uurtarief</th>
                        <th className="text-right py-2 text-xs font-semibold text-ink-muted uppercase tracking-wide w-24">Totaal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.lineItems.map((li, i) => (
                        <tr key={i} className={i > 0 ? 'border-t border-bdr' : ''}>
                          <td className="py-2 text-sm text-ink-primary">{li.description}</td>
                          <td className="py-2 text-right font-mono text-sm text-ink-secondary">{li.hours}u</td>
                          <td className="py-2 text-right font-mono text-sm text-ink-secondary">{fmt(li.rate)}</td>
                          <td className="py-2 text-right font-mono text-sm font-medium text-ink-primary">{fmt(li.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="border-t border-bdr pt-3 text-right space-y-1">
                    <div className="flex justify-end gap-8 text-sm text-ink-secondary">
                      <span>Subtotaal</span>
                      <span className="font-mono w-24 text-right">{fmt(preview.totalAmount)}</span>
                    </div>
                    {btwEnabled && (
                      <div className="flex justify-end gap-8 text-sm text-ink-secondary">
                        <span>BTW {btwRate}%</span>
                        <span className="font-mono w-24 text-right">{fmt(btwAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-end gap-8 text-sm font-bold text-ink-primary">
                      <span>Totaal</span>
                      <span className="font-mono w-24 text-right">{fmt(grandTotal)}</span>
                    </div>
                  </div>
                </>
              )}
            </Card>
          )}

          <div className="flex gap-3">
            <Button variant="secondary" onClick={onBack}>Annuleren</Button>
            <Button onClick={handleCreate} disabled={!preview || clients.length === 0}>Factuur aanmaken</Button>
          </div>
        </div>
      </div>
    </>
  )
}

// ── Invoice detail ─────────────────────────────────────────────────────────────

function InvoiceDetail({ invoiceId, onBack }) {
  const { invoices, clients, updateInvoice, deleteInvoice, settings } = useData()
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  const invoice = invoices.find(inv => inv.id === invoiceId)
  const client = invoice ? clients.find(c => c.id === invoice.clientId) : null

  if (!invoice) {
    return (
      <>
        <PageHeader title="Factuur">
          <Button variant="secondary" onClick={onBack}><ArrowLeft size={15} /> Terug</Button>
        </PageHeader>
        <div className="p-8">
          <p className="text-ink-secondary text-sm">Factuur niet gevonden.</p>
        </div>
      </>
    )
  }

  const btwEnabled = settings?.btwEnabled ?? false
  const btwRate = Number(settings?.btwRate ?? 21)
  const btwAmount = btwEnabled ? invoice.totalAmount * (btwRate / 100) : 0
  const grandTotal = invoice.totalAmount + btwAmount

  function handleDownload() {
    if (!client) return
    generateFactuurPdf({ invoice, client, settings })
  }

  function handleDelete() {
    deleteInvoice(invoice.id)
    onBack()
  }

  return (
    <>
      <PageHeader
        title={`Factuur ${invoice.number}`}
        subtitle={<Badge color={STATUS_COLOR[invoice.status]}>{STATUS_LABEL[invoice.status]}</Badge>}
      >
        <Button variant="secondary" onClick={onBack}><ArrowLeft size={15} /> Terug</Button>
      </PageHeader>

      <div className="p-8 max-w-2xl">
        <div className="flex flex-col gap-5">
          <Card className="p-5">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-xs text-ink-muted mb-0.5">Klant</p>
                <p className="font-medium text-ink-primary">{client?.name || '(verwijderd)'}</p>
                {client?.company && <p className="text-ink-secondary text-xs">{client.company}</p>}
              </div>
              <div>
                <p className="text-xs text-ink-muted mb-0.5">Periode</p>
                <p className="font-medium text-ink-primary">{monthLabel(invoice.monthKey)}</p>
              </div>
              <div>
                <p className="text-xs text-ink-muted mb-0.5">Datum</p>
                <p className="font-medium text-ink-primary">{fmtDateBE(invoice.dateIssued)}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="px-6 py-4 border-b border-bdr">
              <h3 className="text-sm font-semibold text-ink-primary">Regelitems</h3>
            </div>
            <table className="w-full">
              <thead className="bg-canvas">
                <tr className="border-b border-bdr">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wide">Omschrijving</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wide">Uren</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wide">Uurtarief</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wide">Totaal</th>
                </tr>
              </thead>
              <tbody>
                {invoice.lineItems.map((li, i) => (
                  <tr key={i} className={i > 0 ? 'border-t border-bdr' : ''}>
                    <td className="px-6 py-3.5 text-sm text-ink-primary">{li.description}</td>
                    <td className="px-6 py-3.5 text-right font-mono text-sm text-ink-secondary">{li.hours}u</td>
                    <td className="px-6 py-3.5 text-right font-mono text-sm text-ink-secondary">{fmt(li.rate)}</td>
                    <td className="px-6 py-3.5 text-right font-mono text-sm font-medium text-ink-primary">{fmt(li.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-6 py-4 border-t border-bdr space-y-1.5">
              <div className="flex justify-between text-sm text-ink-secondary">
                <span>Subtotaal</span><span className="font-mono">{fmt(invoice.totalAmount)}</span>
              </div>
              {btwEnabled && (
                <div className="flex justify-between text-sm text-ink-secondary">
                  <span>BTW {btwRate}%</span><span className="font-mono">{fmt(btwAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-ink-primary pt-1 border-t border-bdr">
                <span>Totaal</span><span className="font-mono">{fmt(grandTotal)}</span>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <Textarea
              label="Notities"
              placeholder="Notities verschijnen op de factuur..."
              rows={3}
              value={invoice.notes || ''}
              onChange={e => updateInvoice(invoice.id, { notes: e.target.value })}
            />
          </Card>

          <div className="flex items-center gap-3 flex-wrap">
            <Button onClick={handleDownload}><Download size={15} /> PDF downloaden</Button>
            {invoice.status === 'concept' && (
              <Button variant="secondary" onClick={() => updateInvoice(invoice.id, { status: 'verstuurd' })}>
                Markeren als verstuurd
              </Button>
            )}
            {invoice.status === 'verstuurd' && (
              <Button variant="secondary" onClick={() => updateInvoice(invoice.id, { status: 'betaald' })}>
                Markeren als betaald
              </Button>
            )}
            {invoice.status === 'betaald' && (
              <Button variant="secondary" onClick={() => updateInvoice(invoice.id, { status: 'verstuurd' })}>
                Terug naar verstuurd
              </Button>
            )}
            <Button variant="danger" onClick={() => setDeleteConfirm(true)} className="ml-auto">
              <Trash2 size={13} /> Verwijderen
            </Button>
          </div>
        </div>
      </div>

      {deleteConfirm && (
        <Modal title="Factuur verwijderen" onClose={() => setDeleteConfirm(false)}>
          <p className="text-sm text-ink-secondary mb-5">
            Weet je zeker dat je factuur <strong>{invoice.number}</strong> wil verwijderen?
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setDeleteConfirm(false)}>Annuleren</Button>
            <Button variant="danger" onClick={handleDelete}><Trash2 size={13} /> Verwijderen</Button>
          </div>
        </Modal>
      )}
    </>
  )
}

// ── Page router ───────────────────────────────────────────────────────────────

export default function Facturen() {
  const [view, setView] = useState('list')
  const [detailId, setDetailId] = useState(null)

  if (view === 'create') {
    return (
      <CreateInvoice
        onBack={() => setView('list')}
        onCreated={id => { setDetailId(id); setView('detail') }}
      />
    )
  }

  if (view === 'detail' && detailId) {
    return (
      <InvoiceDetail
        invoiceId={detailId}
        onBack={() => setView('list')}
      />
    )
  }

  return (
    <InvoiceList
      onCreate={() => setView('create')}
      onDetail={id => { setDetailId(id); setView('detail') }}
    />
  )
}
