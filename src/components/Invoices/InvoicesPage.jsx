import { useState, useMemo } from 'react'
import { Settings, FileText, AlertCircle, X } from 'lucide-react'
import { jsPDF } from 'jspdf'
import InvoiceSettingsModal from './InvoiceSettingsModal'
import { generateId } from '../../utils/storage'

const DUTCH_MONTHS = [
  'januari', 'februari', 'maart', 'april', 'mei', 'juni',
  'juli', 'augustus', 'september', 'oktober', 'november', 'december',
]

function formatDutchDate(dateOrTs) {
  const d = typeof dateOrTs === 'number' ? new Date(dateOrTs) : dateOrTs
  return `${d.getDate()} ${DUTCH_MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

function formatMonthLabel(yyyyMM) {
  const [y, m] = yyyyMM.split('-')
  return `${DUTCH_MONTHS[parseInt(m, 10) - 1]} ${y}`
}

function fmtBelgian(amount, decimals = 2) {
  return amount.toLocaleString('nl-BE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

function fmtCurrency(amount) {
  return `€ ${fmtBelgian(amount)}`
}

function getEffectiveRate(entry, project) {
  if (entry.rateAtTimeOfEntry !== undefined) return entry.rateAtTimeOfEntry
  return project?.hourlyRate ?? 0
}

function isSettingsComplete(s) {
  return !!(s?.naam && s?.straat && s?.postcode && s?.gemeente && s?.iban)
}

function isClientComplete(project) {
  return !!(project?.client?.trim() && project?.clientAddress?.trim())
}

function clientIncompleteMsg(project) {
  const missingName = !project?.client?.trim()
  const missingAddress = !project?.clientAddress?.trim()
  if (missingName && missingAddress) return 'Vul de klantnaam en het adres in bij dit project.'
  if (missingName) return 'Vul de klantnaam in bij dit project.'
  return 'Vul het adres van de klant in bij dit project.'
}

function computeGroupTotals(group, projects) {
  let totalHours = 0
  let totalAmount = 0
  for (const entry of group.entries) {
    const project = projects.find(p => p.id === entry.projectId)
    const rate = getEffectiveRate(entry, project)
    const hours = (entry.endTime - entry.startTime) / 3600000
    totalHours += hours
    totalAmount += hours * rate
  }
  return { totalHours, totalAmount }
}

function buildPDF(invoiceNumber, settings, project, groupEntries, projects) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const L = 15
  const R = 195

  const today = new Date()
  const dueDate = new Date(today)
  dueDate.setDate(dueDate.getDate() + (settings.betalingstermijn || 30))

  const trunc = (str, max) => (str.length > max ? str.slice(0, max - 1) + '…' : str)

  // ── HEADER ──────────────────────────────────────────────
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.text('FACTUUR', L, 24)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text(`Factuurnummer: ${invoiceNumber}`, R, 18, { align: 'right' })
  doc.text(`Factuurdatum: ${formatDutchDate(today)}`, R, 24, { align: 'right' })
  doc.text(`Vervaldatum: ${formatDutchDate(dueDate)}`, R, 30, { align: 'right' })

  // ── SENDER (left) ────────────────────────────────────────
  let y = 43
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text(settings.naam, L, y)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  y += 5.5
  doc.text(settings.straat, L, y)
  y += 5.5
  doc.text(`${settings.postcode} ${settings.gemeente}`, L, y)
  if (settings.ondernemingsnummer) {
    y += 5.5
    doc.text(settings.ondernemingsnummer, L, y)
  }
  y += 5.5
  doc.text(settings.iban, L, y)

  // ── CLIENT (right) ───────────────────────────────────────
  const clientName = project?.client || project?.name || ''
  const clientAddressLines = project?.clientAddress
    ? project.clientAddress.split('\n').map(l => l.trim()).filter(Boolean)
    : []
  const clientVAT = project?.clientVAT || ''

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text('Klant:', R, 43, { align: 'right' })
  doc.setFont('helvetica', 'normal')
  let clientY = 49
  doc.text(trunc(clientName, 40), R, clientY, { align: 'right' })
  for (const line of clientAddressLines) {
    clientY += 5.5
    doc.text(trunc(line, 40), R, clientY, { align: 'right' })
  }
  if (clientVAT) {
    clientY += 5.5
    doc.text(trunc(clientVAT, 40), R, clientY, { align: 'right' })
  }

  // ── TABLE ────────────────────────────────────────────────
  const tableY = 78
  doc.setDrawColor(180, 180, 180)
  doc.line(L, tableY, R, tableY)

  const headerY = tableY + 6
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.text('Datum', L, headerY)
  doc.text('Beschrijving', 50, headerY)
  doc.text('Uren', 148, headerY, { align: 'right' })
  doc.text('Tarief', 170, headerY, { align: 'right' })
  doc.text('Bedrag', R, headerY, { align: 'right' })

  doc.setDrawColor(180, 180, 180)
  doc.line(L, headerY + 2.5, R, headerY + 2.5)

  const sorted = [...groupEntries].sort((a, b) => a.startTime - b.startTime)
  let rowY = headerY + 8
  let totalAmount = 0

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)

  for (const entry of sorted) {
    const proj = projects.find(p => p.id === entry.projectId)
    const rate = getEffectiveRate(entry, proj)
    const hours = (entry.endTime - entry.startTime) / 3600000
    const amount = hours * rate
    totalAmount += amount

    const dateStr = new Date(entry.startTime).toLocaleDateString('nl-BE', {
      day: 'numeric', month: 'short', year: 'numeric',
    })
    const desc = trunc(entry.description || proj?.name || 'Geen beschrijving', 50)

    doc.text(dateStr, L, rowY)
    doc.text(desc, 50, rowY)
    doc.text(fmtBelgian(hours), 148, rowY, { align: 'right' })
    doc.text(`€ ${fmtBelgian(rate)}`, 170, rowY, { align: 'right' })
    doc.text(fmtCurrency(amount), R, rowY, { align: 'right' })

    rowY += 6
  }

  // ── TOTAL ────────────────────────────────────────────────
  doc.setDrawColor(180, 180, 180)
  doc.line(L, rowY + 1.5, R, rowY + 1.5)
  rowY += 8
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('Totaal:', 170, rowY, { align: 'right' })
  doc.text(fmtCurrency(totalAmount), R, rowY, { align: 'right' })

  // ── FOOTER ───────────────────────────────────────────────
  const footerY = rowY + 14
  doc.setDrawColor(180, 180, 180)
  doc.line(L, footerY - 5, R, footerY - 5)

  doc.setFont('helvetica', 'italic')
  doc.setFontSize(8)
  doc.setTextColor(110, 110, 110)
  doc.text(
    'Kleine onderneming onderworpen aan de vrijstellingsregeling van belasting. Btw niet toepasselijk.',
    L, footerY,
  )

  doc.setFont('helvetica', 'normal')
  doc.setTextColor(0, 0, 0)
  doc.text(
    `Gelieve te betalen voor ${formatDutchDate(dueDate)} op ${settings.iban}`,
    L, footerY + 7,
  )
  doc.text(`met mededeling: ${invoiceNumber}`, L, footerY + 13)

  return doc
}

export default function InvoicesPage({
  entries, projects,
  invoices, invoiceSettings,
  addInvoice, updateInvoice, saveInvoiceSettings, consumeInvoiceNumber,
  onEditProject,
}) {
  const [showSettings, setShowSettings] = useState(false)
  const [pendingGroup, setPendingGroup] = useState(null)
  const [clientError, setClientError] = useState(null)

  const groups = useMemo(() => {
    const map = new Map()
    for (const entry of entries) {
      if (!entry.endTime) continue
      const project = projects.find(p => p.id === entry.projectId)
      const rate = getEffectiveRate(entry, project)
      if (rate <= 0) continue

      const month = new Date(entry.startTime).toISOString().slice(0, 7)
      const key = `${entry.projectId ?? 'null'}-${month}`

      if (!map.has(key)) {
        map.set(key, { key, projectId: entry.projectId, month, entries: [] })
      }
      map.get(key).entries.push(entry)
    }

    return Array.from(map.values()).sort((a, b) => b.month.localeCompare(a.month))
  }, [entries, projects])

  function getRecord(group) {
    return (
      invoices
        .filter(inv => inv.projectId === group.projectId && inv.month === group.month)
        .sort((a, b) => b.generatedAt - a.generatedAt)[0] || null
    )
  }

  async function handleToggleStatus(group) {
    const record = getRecord(group)
    if (!record) {
      await addInvoice({
        id: generateId(),
        projectId: group.projectId,
        month: group.month,
        invoiceNumber: null,
        generatedAt: Date.now(),
        status: 'gefactureerd',
      })
    } else {
      const newStatus = record.status === 'gefactureerd' ? 'niet-gefactureerd' : 'gefactureerd'
      await updateInvoice(record.id, { status: newStatus })
    }
  }

  async function doGeneratePDF(group, settings) {
    const invoiceNumber = await consumeInvoiceNumber()
    const project = projects.find(p => p.id === group.projectId)
    const doc = buildPDF(invoiceNumber, settings, project, group.entries, projects)

    const slug = (project?.name || 'geen-project').toLowerCase().replace(/[^a-z0-9]+/g, '-')
    doc.save(`factuur-${invoiceNumber}-${slug}-${group.month}.pdf`)

    await addInvoice({
      id: generateId(),
      projectId: group.projectId,
      month: group.month,
      invoiceNumber,
      generatedAt: Date.now(),
      status: 'gefactureerd',
    })
  }

  async function handleGeneratePDF(group) {
    setClientError(null)
    if (!isSettingsComplete(invoiceSettings)) {
      setPendingGroup(group)
      setShowSettings(true)
      return
    }
    const project = projects.find(p => p.id === group.projectId)
    if (!isClientComplete(project)) {
      setClientError({ message: clientIncompleteMsg(project), projectId: group.projectId })
      return
    }
    await doGeneratePDF(group, invoiceSettings)
  }

  async function handleSaveSettings(settings) {
    await saveInvoiceSettings(settings)
    setShowSettings(false)
    const pending = pendingGroup
    setPendingGroup(null)
    if (pending) {
      const project = projects.find(p => p.id === pending.projectId)
      if (!isClientComplete(project)) {
        setClientError({ message: clientIncompleteMsg(project), projectId: pending.projectId })
        return
      }
      doGeneratePDF(pending, settings)
    }
  }

  return (
    <div className="flex-1 p-8 max-w-5xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold" style={{ color: '#2b2a27' }}>Facturatie</h1>
        <button
          onClick={() => setShowSettings(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-[transform,background-color,color] duration-150 active:scale-[0.97]"
          style={{ border: '1px solid rgba(43,42,39,0.12)', color: '#7c776f' }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#e6e0d7'; e.currentTarget.style.color = '#2b2a27' }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = '#7c776f' }}
        >
          <Settings size={16} />
          <span className="hidden sm:inline">Mijn gegevens</span>
        </button>
      </div>

      {clientError && (
        <div
          className="mb-4 flex items-center gap-3 px-4 py-3 rounded-2xl text-sm"
          style={{ backgroundColor: '#fef9ec', border: '1px solid rgba(241,201,59,0.3)', color: '#4a3c1a' }}
        >
          <AlertCircle size={16} className="shrink-0" />
          <span className="flex-1">{clientError.message}</span>
          <button
            onClick={() => { onEditProject?.(clientError.projectId); setClientError(null) }}
            className="underline font-medium whitespace-nowrap"
          >
            Bewerk project
          </button>
          <button onClick={() => setClientError(null)} className="ml-1" style={{ color: '#7c776f' }}>
            <X size={14} />
          </button>
        </div>
      )}

      {groups.length === 0 ? (
        <div className="text-center py-24" style={{ color: '#7c776f' }}>
          <FileText size={44} className="mx-auto mb-4 opacity-20" />
          <p className="text-sm font-medium">Geen factureerbare uren gevonden</p>
          <p className="text-xs mt-1" style={{ color: '#c0b8ae' }}>
            Voeg een uurtarief toe aan een project en registreer uren om hier facturen te genereren.
          </p>
        </div>
      ) : (
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            backgroundColor: '#f6f3ee',
            boxShadow: '0 20px 40px rgba(55,44,22,0.06)',
            border: '1px solid rgba(43,42,39,0.06)',
          }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(43,42,39,0.07)' }}>
                <th className="px-5 py-3.5 text-xs font-medium text-left" style={{ color: '#7c776f' }}>Maand</th>
                <th className="px-5 py-3.5 text-xs font-medium text-left" style={{ color: '#7c776f' }}>Project / klant</th>
                <th className="px-5 py-3.5 text-xs font-medium text-right" style={{ color: '#7c776f' }}>Uren</th>
                <th className="px-5 py-3.5 text-xs font-medium text-right" style={{ color: '#7c776f' }}>Bedrag</th>
                <th className="px-5 py-3.5 text-xs font-medium text-left" style={{ color: '#7c776f' }}>Status</th>
                <th className="px-5 py-3.5 text-xs font-medium text-left" style={{ color: '#7c776f' }}></th>
              </tr>
            </thead>
            <tbody>
              {groups.map(group => {
                const project = projects.find(p => p.id === group.projectId)
                const { totalHours, totalAmount } = computeGroupTotals(group, projects)
                const record = getRecord(group)
                const isFactured = record?.status === 'gefactureerd'

                const settingsOk = isSettingsComplete(invoiceSettings)
                const clientOk = isClientComplete(project)
                const canGenerate = settingsOk && clientOk
                const btnTitle = !settingsOk
                  ? 'Vul eerst je eigen gegevens in via "Mijn gegevens"'
                  : !clientOk
                  ? clientIncompleteMsg(project)
                  : undefined

                return (
                  <tr
                    key={group.key}
                    className="transition-colors duration-100"
                    style={{ borderBottom: '1px solid rgba(43,42,39,0.05)' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(43,42,39,0.025)'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = ''}
                  >
                    <td className="px-5 py-4 font-medium capitalize whitespace-nowrap" style={{ color: '#2b2a27' }}>
                      {formatMonthLabel(group.month)}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {project && (
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: project.color }}
                          />
                        )}
                        <div>
                          <div style={{ color: '#2b2a27' }}>{project?.name || 'Geen project'}</div>
                          {project?.client && (
                            <div className="text-xs mt-0.5" style={{ color: '#7c776f' }}>{project.client}</div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-right font-mono whitespace-nowrap tabular-nums" style={{ color: '#7c776f' }}>
                      {fmtBelgian(totalHours)} u
                    </td>

                    <td className="px-5 py-4 text-right font-medium whitespace-nowrap" style={{ color: '#2b2a27' }}>
                      {fmtCurrency(totalAmount)}
                    </td>

                    <td className="px-5 py-4">
                      <div>
                        <button
                          onClick={() => handleToggleStatus(group)}
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-[transform,background-color] duration-150 active:scale-[0.95]"
                          style={isFactured
                            ? { backgroundColor: 'rgba(34,197,94,0.1)', color: '#22C55E' }
                            : { backgroundColor: '#e6e0d7', color: '#7c776f' }
                          }
                          onMouseEnter={e => {
                            if (isFactured) e.currentTarget.style.backgroundColor = 'rgba(34,197,94,0.18)'
                            else e.currentTarget.style.backgroundColor = '#ddd8ce'
                          }}
                          onMouseLeave={e => {
                            if (isFactured) e.currentTarget.style.backgroundColor = 'rgba(34,197,94,0.1)'
                            else e.currentTarget.style.backgroundColor = '#e6e0d7'
                          }}
                        >
                          {isFactured ? 'Gefactureerd' : 'Niet gefactureerd'}
                        </button>
                        {record?.invoiceNumber && (
                          <div className="text-xs mt-1 font-mono pl-0.5" style={{ color: '#7c776f' }}>
                            {record.invoiceNumber}
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleGeneratePDF(group)}
                        title={btnTitle}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-[transform,background-color] duration-150 active:scale-[0.95] whitespace-nowrap"
                        style={canGenerate
                          ? { backgroundColor: '#20242c', color: '#f6f2eb' }
                          : { backgroundColor: '#e6e0d7', color: '#c0b8ae', cursor: 'not-allowed' }
                        }
                        onMouseEnter={e => { if (canGenerate) e.currentTarget.style.backgroundColor = '#2d3340' }}
                        onMouseLeave={e => { if (canGenerate) e.currentTarget.style.backgroundColor = '#20242c' }}
                      >
                        <FileText size={13} />
                        PDF
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {showSettings && (
        <InvoiceSettingsModal
          settings={invoiceSettings}
          onSave={handleSaveSettings}
          onClose={() => {
            setShowSettings(false)
            setPendingGroup(null)
          }}
        />
      )}
    </div>
  )
}
