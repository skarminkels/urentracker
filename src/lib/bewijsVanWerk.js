import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

function monthLabel(key) {
  const [y, m] = key.split('-')
  const label = new Date(Number(y), Number(m) - 1, 1)
    .toLocaleDateString('nl-BE', { month: 'long', year: 'numeric' })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

function fmtDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00')
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${dd}/${mm}/${yyyy}`
}

function fmtEur(amount) {
  return new Intl.NumberFormat('nl-BE', { style: 'currency', currency: 'EUR' }).format(amount)
}

export function generateBewijsVanWerk({ client, monthKey, entries, settings, invoiceNumber }) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const marginL = 20
  const marginR = 20
  const pageW = 210
  const contentW = pageW - marginL - marginR
  let y = 20

  const period = monthLabel(monthKey)

  // ── Title block ──────────────────────────────────────────────────
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(30, 41, 59)
  doc.text('Bewijs van werk', marginL, y)
  y += 8

  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 116, 139)
  doc.text(`${client.name}${client.company ? ` — ${client.company}` : ''} · ${period}`, marginL, y)
  y += 10

  // ── Two-column info row ───────────────────────────────────────────
  const colR = marginL + contentW / 2

  // Left: my info
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(148, 163, 184)
  doc.text('VAN', marginL, y)
  y += 4
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(51, 65, 85)

  const myLines = [
    settings.name || '—',
    settings.address || '',
    settings.email || '',
    settings.phone || '',
  ].filter(Boolean)

  let yLeft = y
  for (const line of myLines) {
    doc.setFontSize(9)
    doc.text(line, marginL, yLeft)
    yLeft += 4.5
  }

  // Right: client info
  let yRight = y - 4
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(148, 163, 184)
  doc.text('VOOR', colR, yRight)
  yRight += 4
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(51, 65, 85)
  doc.text(client.name, colR, yRight)
  yRight += 4.5
  if (client.company) {
    doc.text(client.company, colR, yRight)
  }

  y = Math.max(yLeft, yRight) + 6

  // ── Divider ───────────────────────────────────────────────────────
  doc.setDrawColor(226, 232, 240)
  doc.setLineWidth(0.3)
  doc.line(marginL, y, pageW - marginR, y)
  y += 8

  // ── Table ─────────────────────────────────────────────────────────
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date))
  let totalHours = 0
  let totalAmount = 0

  const tableRows = sorted.map(entry => {
    const subtotal = entry.hours * client.rate
    totalHours += entry.hours
    totalAmount += subtotal
    return [
      fmtDate(entry.date),
      entry.description || '—',
      `${entry.hours}u`,
      fmtEur(client.rate),
      fmtEur(subtotal),
    ]
  })

  autoTable(doc, {
    startY: y,
    margin: { left: marginL, right: marginR },
    head: [['Datum', 'Omschrijving', 'Uren', 'Uurtarief', 'Subtotaal']],
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
      0: { cellWidth: 28 },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 18, halign: 'right' },
      3: { cellWidth: 24, halign: 'right' },
      4: { cellWidth: 26, halign: 'right', fontStyle: 'bold' },
    },
    tableLineColor: [226, 232, 240],
    tableLineWidth: 0.2,
    showHead: 'firstPage',
  })

  y = doc.lastAutoTable.finalY + 6

  // ── Totals ────────────────────────────────────────────────────────
  const totalsX = pageW - marginR
  doc.setDrawColor(59, 130, 246)
  doc.setLineWidth(0.4)
  doc.line(pageW - marginR - 68, y, totalsX, y)
  y += 6

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 116, 139)
  doc.text('Totaal uren:', pageW - marginR - 65, y)
  doc.setTextColor(51, 65, 85)
  doc.text(`${totalHours}u`, totalsX, y, { align: 'right' })
  y += 5.5

  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(30, 41, 59)
  doc.text('Totaal:', pageW - marginR - 65, y)
  doc.text(fmtEur(totalAmount), totalsX, y, { align: 'right' })
  y += 10

  // ── Footer note ───────────────────────────────────────────────────
  doc.setFontSize(8.5)
  doc.setFont('helvetica', 'italic')
  doc.setTextColor(148, 163, 184)
  doc.text(
    `Dit document dient als onderbouwing bij factuur nr. ${invoiceNumber || '—'}`,
    marginL,
    y,
  )

  const filename = `bewijs-van-werk_${client.name.replace(/\s+/g, '-').toLowerCase()}_${monthKey}.pdf`
  doc.save(filename)
}
