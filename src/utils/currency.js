export const CURRENCIES = [
  { symbol: '€', label: 'EUR (€)', locale: 'nl-BE' },
  { symbol: '$', label: 'USD ($)', locale: 'en-US' },
  { symbol: '£', label: 'GBP (£)', locale: 'en-GB' },
]

export function formatCurrency(amount, currency = '€') {
  const entry = CURRENCIES.find(c => c.symbol === currency) || CURRENCIES[0]
  const formatted = Math.abs(amount).toLocaleString(entry.locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return `${currency}${formatted}`
}

// rateAtTimeOfEntry is the snapshot saved when the entry was created.
// If present, use it (preserves historical accuracy).
// If absent (old entries), fall back to current project rate.
export function calcEarnings(entry, projects) {
  if (!entry.endTime) return 0
  let rate
  if (entry.rateAtTimeOfEntry !== undefined) {
    rate = entry.rateAtTimeOfEntry
  } else {
    rate = projects.find(p => p.id === entry.projectId)?.hourlyRate ?? 0
  }
  if (!rate || rate <= 0) return 0
  const hours = (entry.endTime - entry.startTime) / 3600000
  return hours * rate
}

export function calcLiveEarnings(elapsedMs, projectId, projects) {
  const project = projects.find(p => p.id === projectId)
  if (!project?.hourlyRate || project.hourlyRate <= 0) return 0
  return (elapsedMs / 3600000) * project.hourlyRate
}
