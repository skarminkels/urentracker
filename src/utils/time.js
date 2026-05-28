export function formatDuration(ms) {
  if (!ms || ms < 0) return '00:00:00'
  const totalSeconds = Math.floor(ms / 1000)
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function formatDurationShort(ms) {
  if (!ms || ms < 0) return '0:00:00'
  const totalSeconds = Math.floor(ms / 1000)
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function formatTime(timestamp) {
  if (!timestamp) return ''
  const d = new Date(timestamp)
  return d.toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' })
}

export function formatDate(timestamp) {
  const d = new Date(timestamp)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (isSameDay(d, today)) return 'Today'
  if (isSameDay(d, yesterday)) return 'Yesterday'
  return d.toLocaleDateString('nl-BE', { weekday: 'long', month: 'long', day: 'numeric' })
}

export function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function getDayKey(timestamp) {
  const d = new Date(timestamp)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function groupEntriesByDay(entries) {
  const groups = {}
  for (const entry of entries) {
    if (!entry.endTime) continue
    const key = getDayKey(entry.startTime)
    if (!groups[key]) groups[key] = []
    groups[key].push(entry)
  }
  return Object.entries(groups)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([key, entries]) => ({
      key,
      label: formatDate(new Date(key).getTime() + 12 * 3600 * 1000),
      entries: entries.sort((a, b) => b.startTime - a.startTime),
      total: entries.reduce((sum, e) => sum + (e.endTime - e.startTime), 0),
    }))
}

export function getLast7Days() {
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push({
      key: getDayKey(d.getTime()),
      label: i === 0 ? 'Today' : d.toLocaleDateString('nl-BE', { weekday: 'short' }),
    })
  }
  return days
}

export function getLast12Months() {
  const months = []
  const now = new Date()
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      label: d.toLocaleDateString('nl-BE', { month: 'short' }),
      startTs: d.getTime(),
      endTs: new Date(d.getFullYear(), d.getMonth() + 1, 1).getTime(),
    })
  }
  return months
}

export function getMonthKey(timestamp) {
  const d = new Date(timestamp)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}
