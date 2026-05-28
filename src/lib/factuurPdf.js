import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

function fmtEur(amount) {
  return new Intl.NumberFormat('nl-BE', { style: 'currency', currency: 'EUR' }).format(amount)
}

function fmtDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00')
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
}

function addDays(dateStr, days) {
  const d = new Date(dateStr + 'T12:00:00')
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export function generateFactuurPdf({ invoice, client, settings }) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const ML = 20       // margin left
  const MR = 20       // margin right
  const PW = 210      // page width
  const CW = PW - ML - MR  // content width
  const colR = ML + CW / 2  // right column start
  let y = 20

  const btwEnabled = settings?.btwEnabled ?? false
  const btwRate = Number(settings?.btwRate ?? 21)
  const paymentTermDays = Number(settings?.paymentTermDays ?? 30)
  const dueDate = addDays(invoice.dateIssued, paymentTermDays)

  // ── Title + number/date block ─────────────────────────────────────
  doc.setFontSize(26)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(30, 41, 59)
  doc.text('FACTUUR', ML, y)

  // Right-aligned invoice meta
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 116, 139)
  doc.text('Factuurnummer', PW - MR, y - 4, { align: 'right' })
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(30, 41, 59)
  doc.text(invoice.number, PW - MR, y + 1, { align: 'right' })

  y += 8
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 116, 139)
  doc.text(`Datum: ${fmtDate(invoice.dateIssued)}`, PW - MR, y, { align: 'right' })
  y += 5
  doc.text(`Vervaldatum: ${fmtDate(dueDate)}`, PW - MR, y, { align: 'right' })
  y += 10

  // ── From / To columns ─────────────────────────────────────────────
  const sectionY = y

  // FROM
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(148, 163, 184)
  doc.text('VAN', ML, y)
  y += 4.5
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(51, 65, 85)

  const fromLines = [
    { text: settings?.name || '—', bold: true },
    settings?.address && { text: settings.address },
    settings?.email && { text: settings.email },
    settings?.phone && { text: settings.phone },
    settings?.studentNumber && { text: `Ondernemingsnr: ${settings.studentNumber}` },
    btwEnabled && settings?.btwNumber && { text: `BTW: ${settings.btwNumber}` },
  ].filter(Boolean)

  let yFrom = y
  for (const line of fromLines) {
    doc.setFontSize(9)
    doc.setFont('helvetica', line.bold ? 'bold' : 'normal')
    doc.text(line.text, ML, yFrom)
    yFrom += 4.5
  }

  // TO
  let yTo = sectionY
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(148, 163, 184)
  doc.text('VOOR', colR, yTo)
  yTo += 4.5
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(51, 65, 85)

  const toLines = [
    { text: client.name || '—', bold: true },
    client.company && { text: client.company },
    client.address && { text: client.address },
  ].filter(Boolean)

  for (const line of toLines) {
    doc.setFontSize(9)
    doc.setFont('helvetica', line.bold ? 'bold' : 'normal')
    doc.text(line.text, colR, yTo)
    yTo += 4.5
  }

  y = Math.max(yFrom, yTo) + 8

  // ── Divider ───────────────────────────────────────────────────────
  doc.setDrawColor(226, 232, 240)
  doc.setLineWidth(0.3)
  doc.line(ML, y, PW - MR, y)
  y += 8

  // ── Line items table ──────────────────────────────────────────────
  const tableRows = invoice.lineItems.map(item => [
    item.description || 'Werkzaamheden',
    `${item.hours}u`,
    fmtEur(item.rate),
    fmtEur(item.total),
  ])

  autoTable(doc, {
    startY: y,
    margin: { left: ML, right: MR },
    head: [['Omschrijving', 'Uren', 'Uurtarief', 'Totaal']],
    body: tableRows,
    headStyles: {
      fillColor: [241, 245, 249],
      textColor: [100, 116, 139],
      fontStyle: 'bold',
      fontSize: 8.5,
      cellPadding: { top: 3, bottom: 3, left: 4, right: 4 },
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [51, 65, 85],
      cellPadding: { top: 3.5, bottom: 3.5, left: 4, right: 4 },
    },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 22, halign: 'right' },
      2: { cellWidth: 28, halign: 'right' },
      3: { cellWidth: 28, halign: 'right', fontStyle: 'bold' },
    },
    tableLineColor: [226, 232, 240],
    tableLineWidth: 0.2,
  })

  y = doc.lastAutoTable.finalY + 6

  // ── Totals ────────────────────────────────────────────────────────
  const subtotal = invoice.lineItems.reduce((s, li) => s + li.total, 0)
  const btwAmount = btwEnabled ? subtotal * (btwRate / 100) : 0
  const total = subtotal + btwAmount

  const totalsX = PW - MR
  const labelsX = totalsX - 66

  doc.setDrawColor(226, 232, 240)
  doc.setLineWidth(0.2)
  doc.line(labelsX, y, totalsX, y)
  y += 5.5

  // Subtotal
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 116, 139)
  doc.text('Subtotaal:', labelsX, y)
  doc.setTextColor(51, 65, 85)
  doc.text(fmtEur(subtotal), totalsX, y, { align: 'right' })
  y += 5.5

  // BTW
  if (btwEnabled) {
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100, 116, 139)
    doc.text(`BTW ${btwRate}%:`, labelsX, y)
    doc.setTextColor(51, 65, 85)
    doc.text(fmtEur(btwAmount), totalsX, y, { align: 'right' })
    y += 5.5
  }

  // Total
  doc.setDrawColor(59, 130, 246)
  doc.setLineWidth(0.4)
  doc.line(labelsX, y, totalsX, y)
  y += 6
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(30, 41, 59)
  doc.text('TOTAAL:', labelsX, y)
  doc.text(fmtEur(total), totalsX, y, { align: 'right' })
  y += 12

  // ── Payment instructions ──────────────────────────────────────────
  doc.setDrawColor(226, 232, 240)
  doc.setLineWidth(0.3)
  doc.line(ML, y, PW - MR, y)
  y += 7

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 116, 139)

  const iban = settings?.iban
  if (iban) {
    doc.text(
      `Gelieve te betalen binnen ${paymentTermDays} dagen op rekeningnummer ${iban}.`,
      ML, y,
    )
  } else {
    doc.text(
      `Gelieve te betalen binnen ${paymentTermDays} dagen. Neem contact op voor betalingsgegevens.`,
      ML, y,
    )
  }
  y += 6

  // Reference line
  doc.text(`Mededeling: ${invoice.number}`, ML, y)
  y += 8

  // Notes
  if (invoice.notes?.trim()) {
    doc.setTextColor(51, 65, 85)
    const lines = doc.splitTextToSize(invoice.notes.trim(), CW)
    doc.text(lines, ML, y)
  }

  const filename = `factuur_${invoice.number.replace('-', '_')}_${client.name.replace(/\s+/g, '-').toLowerCase()}.pdf`
  doc.save(filename)
}
