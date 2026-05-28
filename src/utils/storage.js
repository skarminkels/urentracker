const KEYS = {
  entries: 'tt_entries',
  projects: 'tt_projects',
  runningTimer: 'tt_running_timer',
  currency: 'tt_currency',
  invoiceSettings: 'tt_invoice_settings',
  invoices: 'tt_invoices',
  invoiceCounter: 'tt_invoice_counter',
}

export function loadEntries() {
  try {
    return JSON.parse(localStorage.getItem(KEYS.entries) || '[]')
  } catch {
    return []
  }
}

export function saveEntries(entries) {
  localStorage.setItem(KEYS.entries, JSON.stringify(entries))
}

export function loadProjects() {
  try {
    const stored = JSON.parse(localStorage.getItem(KEYS.projects) || 'null')
    if (stored) return stored
    return getDefaultProjects()
  } catch {
    return getDefaultProjects()
  }
}

export function saveProjects(projects) {
  localStorage.setItem(KEYS.projects, JSON.stringify(projects))
}

export function loadRunningTimer() {
  try {
    return JSON.parse(localStorage.getItem(KEYS.runningTimer) || 'null')
  } catch {
    return null
  }
}

export function saveRunningTimer(timer) {
  if (timer) {
    localStorage.setItem(KEYS.runningTimer, JSON.stringify(timer))
  } else {
    localStorage.removeItem(KEYS.runningTimer)
  }
}

function getDefaultProjects() {
  return [
    { id: 'p1', name: 'Design', color: '#e57cd8', client: '' },
    { id: 'p2', name: 'Development', color: '#4a9eff', client: '' },
    { id: 'p3', name: 'Meeting', color: '#f97316', client: '' },
  ]
}

export function loadCurrency() {
  return localStorage.getItem(KEYS.currency) || '€'
}

export function saveCurrency(symbol) {
  localStorage.setItem(KEYS.currency, symbol)
}

export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function loadInvoiceSettings() {
  try {
    return JSON.parse(localStorage.getItem(KEYS.invoiceSettings) || 'null') || {}
  } catch {
    return {}
  }
}

export function saveInvoiceSettings(settings) {
  localStorage.setItem(KEYS.invoiceSettings, JSON.stringify(settings))
}

export function loadInvoices() {
  try {
    return JSON.parse(localStorage.getItem(KEYS.invoices) || '[]')
  } catch {
    return []
  }
}

export function saveInvoices(invoices) {
  localStorage.setItem(KEYS.invoices, JSON.stringify(invoices))
}

// Reads the next available invoice number, increments the counter, and returns the formatted string.
// Only call this when actually generating a PDF.
export function consumeInvoiceNumber() {
  const year = new Date().getFullYear()
  let stored = null
  try {
    stored = JSON.parse(localStorage.getItem(KEYS.invoiceCounter) || 'null')
  } catch {
    stored = null
  }
  const seq = (!stored || stored.year !== year) ? 1 : stored.seq
  localStorage.setItem(KEYS.invoiceCounter, JSON.stringify({ year, seq: seq + 1 }))
  return `${year}-${String(seq).padStart(3, '0')}`
}
