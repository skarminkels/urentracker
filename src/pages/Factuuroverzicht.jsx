import { useMemo, useState } from 'react'
import { Download } from 'lucide-react'
import jsPDF from 'jspdf'
import { useData } from '../context/DataContext'
import { Card, Button, EmptyState, Modal, Input, PageHeader } from '../components/ui'
import { generateBewijsVanWerk } from '../lib/bewijsVanWerk'

function fmt(amount) {
  return new Intl.NumberFormat('nl-BE', { style: 'currency', currency: 'EUR' }).format(amount)
}

function getMonthKey(dateStr) {
  return dateStr.slice(0, 7)
}

function monthLabel(key) {
  const [y, m] = key.split('-')
  const label = new Date(Number(y), Number(m) - 1, 1)
    .toLocaleDateString('nl-BE', { month: 'long', year: 'numeric' })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

function formatDateBE(dateStr) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('nl-BE', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

function generateOverzichtPDF(monthKey, entriesForMonth, clientMap) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const marginL = 20
  const pageW = 210
  let y = 20

  const capLabel = monthLabel(monthKey)

  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(30, 41, 59)
  doc.text('Factuuroverzicht', marginL, y)
  y += 8

  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 116, 139)
  doc.text(capLabel, marginL, y)
  y += 12

  doc.setDrawColor(234, 230, 225)
  doc.setLineWidth(0.3)
  doc.line(marginL, y, pageW - marginL, y)
  y += 8

  const byClient = {}
  for (const entry of entriesForMonth) {
    if (!byClient[entry.clientId]) byClient[entry.clientId] = []
    byClient[entry.clientId].push(entry)
  }

  let grandTotal = 0

  for (const [clientId, clientEntries] of Object.entries(byClient)) {
    const client = clientMap[clientId]
    if (!client) continue

    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(26, 26, 26)
    doc.text(client.name + (client.company ? `  —  ${client.company}` : ''), marginL, y)
    y += 5
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(107, 107, 107)
    doc.text(`Uurtarief: € ${Number(client.rate).toFixed(2)}/u`, marginL, y)
    y += 7

    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(158, 158, 158)
    doc.text('Datum', marginL, y)
    doc.text('Omschrijving', marginL + 35, y)
    doc.text('Uren', pageW - marginL - 40, y, { align: 'right' })
    doc.text('Bedrag', pageW - marginL, y, { align: 'right' })
    y += 4

    doc.setDrawColor(234, 230, 225)
    doc.setLineWidth(0.2)
    doc.line(marginL, y, pageW - marginL, y)
    y += 5

    let clientTotal = 0

    for (const entry of clientEntries.sort((a, b) => a.date.localeCompare(b.date))) {
      const amount = entry.hours * client.rate
      clientTotal += amount

      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(51, 65, 85)
      doc.text(formatDateBE(entry.date), marginL, y)

      const desc = entry.description || '—'
      const maxDescW = pageW - marginL - 80
      const truncated = doc.getTextWidth(desc) > maxDescW
        ? doc.splitTextToSize(desc, maxDescW)[0] + '…'
        : desc
      doc.text(truncated, marginL + 35, y)
      doc.text(`${entry.hours}u`, pageW - marginL - 40, y, { align: 'right' })
      doc.text(`€ ${amount.toFixed(2)}`, pageW - marginL, y, { align: 'right' })
      y += 6

      if (y > 270) { doc.addPage(); y = 20 }
    }

    doc.setDrawColor(234, 230, 225)
    doc.line(marginL + 100, y, pageW - marginL, y)
    y += 5
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(26, 26, 26)
    doc.text('Subtotaal', pageW - marginL - 40, y, { align: 'right' })
    doc.text(fmt(clientTotal), pageW - marginL, y, { align: 'right' })
    grandTotal += clientTotal
    y += 12
  }

  doc.setDrawColor(123, 63, 228)
  doc.setLineWidth(0.5)
  doc.line(marginL, y, pageW - marginL, y)
  y += 7
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(26, 26, 26)
  doc.text('Totaal', marginL, y)
  doc.text(fmt(grandTotal), pageW - marginL, y, { align: 'right' })

  doc.save(`factuuroverzicht-${monthKey}.pdf`)
}

function BewijsModal({ client, monthKey, entries, settings, onClose }) {
  const [invoiceNumber, setInvoiceNumber] = useState('')

  function handleGenerate() {
    generateBewijsVanWerk({ client, monthKey, entries, settings, invoiceNumber })
    onClose()
  }

  return (
    <Modal title="Bewijs van werk exporteren" onClose={onClose}>
      <div className="flex flex-col gap-4">
        <div className="bg-surface-hover rounded-lg px-4 py-3 text-sm text-ink-secondary">
          <span className="font-medium text-ink-primary">{client.name}</span>
          {client.company && <span className="text-ink-muted"> — {client.company}</span>}
          <span className="text-ink-muted ml-2">· {monthLabel(monthKey)}</span>
        </div>

        <Input
          label="Factuurnummer (optioneel)"
          placeholder="bv. 2024-001"
          value={invoiceNumber}
          onChange={e => setInvoiceNumber(e.target.value)}
          autoFocus
        />

        {!settings?.name && (
          <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
            Tip: vul je gegevens in via Instellingen zodat ze in de PDF verschijnen.
          </p>
        )}

        <div className="flex gap-2 justify-end pt-1">
          <Button variant="secondary" onClick={onClose}>Annuleren</Button>
          <Button onClick={handleGenerate}><Download size={14} /> PDF genereren</Button>
        </div>
      </div>
    </Modal>
  )
}

export default function Factuuroverzicht() {
  const { clients, entries, settings } = useData()
  const clientMap = Object.fromEntries(clients.map(c => [c.id, c]))
  const [bewijsTarget, setBewijsTarget] = useState(null)

  const months = useMemo(() => {
    const map = {}
    for (const entry of entries) {
      const key = getMonthKey(entry.date)
      if (!map[key]) map[key] = { totalHours: 0, totalAmount: 0, entries: [], byClient: {} }
      const client = clientMap[entry.clientId]
      if (client) {
        map[key].totalHours += entry.hours
        map[key].totalAmount += entry.hours * client.rate
        if (!map[key].byClient[entry.clientId]) {
          map[key].byClient[entry.clientId] = { hours: 0, amount: 0, entries: [] }
        }
        map[key].byClient[entry.clientId].hours += entry.hours
        map[key].byClient[entry.clientId].amount += entry.hours * client.rate
        map[key].byClient[entry.clientId].entries.push(entry)
      }
      map[key].entries.push(entry)
    }
    return Object.entries(map).sort((a, b) => b[0].localeCompare(a[0]))
  }, [entries, clients])

  if (months.length === 0) {
    return (
      <>
        <PageHeader title="Factuuroverzicht" subtitle="Maandelijkse overzichten" />
        <div className="p-8">
          <Card>
            <EmptyState icon="📄" title="Nog geen factuurdata" description="Zodra je uren logt verschijnen hier de maandelijkse overzichten met PDF-export." />
          </Card>
        </div>
      </>
    )
  }

  return (
    <>
      <PageHeader title="Factuuroverzicht" subtitle="Exporteer per maand of per klant" />

      <div className="p-8">
        <div className="flex flex-col gap-4">
          {months.map(([key, data]) => {
            const clientRows = Object.entries(data.byClient)
            return (
              <Card key={key}>
                <div className="flex items-center justify-between px-6 py-4 border-b border-bdr">
                  <div>
                    <span className="font-semibold text-ink-primary">{monthLabel(key)}</span>
                    <span className="text-ink-muted text-sm ml-3">
                      {data.totalHours.toFixed(2)}u · {fmt(data.totalAmount)}
                    </span>
                  </div>
                  <Button size="sm" variant="secondary" onClick={() => generateOverzichtPDF(key, data.entries, clientMap)}>
                    <Download size={13} /> PDF exporteren
                  </Button>
                </div>

                <div>
                  {clientRows.map(([clientId, clientData], i) => {
                    const client = clientMap[clientId]
                    if (!client) return null
                    return (
                      <div
                        key={clientId}
                        className={`flex items-center justify-between px-6 py-3.5 ${i < clientRows.length - 1 ? 'border-b border-bdr' : ''} hover:bg-surface-hover transition-colors duration-150`}
                      >
                        <div className="flex items-center gap-3 pl-2">
                          <span className="text-ink-muted text-xs">└</span>
                          <div>
                            <span className="text-sm font-medium text-ink-primary">{client.name}</span>
                            {client.company && <span className="text-xs text-ink-muted ml-2">{client.company}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <span className="font-mono text-sm text-ink-secondary">{clientData.hours.toFixed(2)}u</span>
                          <span className="font-mono text-sm font-medium text-ink-primary w-24 text-right">{fmt(clientData.amount)}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setBewijsTarget({ client, monthKey: key, entries: clientData.entries })}
                          >
                            Bewijs van werk
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      {bewijsTarget && (
        <BewijsModal
          client={bewijsTarget.client}
          monthKey={bewijsTarget.monthKey}
          entries={bewijsTarget.entries}
          settings={settings}
          onClose={() => setBewijsTarget(null)}
        />
      )}
    </>
  )
}
