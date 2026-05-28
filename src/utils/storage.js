const KEYS = {
  entries: 'tt_entries',
  projects: 'tt_projects',
  runningTimer: 'tt_running_timer',
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

export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}
