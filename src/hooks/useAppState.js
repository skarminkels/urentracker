import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { generateId } from '../utils/storage'

// ── DB row ↔ app object mappers ───────────────────────────────────────────────

function rowToEntry(row) {
  return {
    id: row.id,
    description: row.description,
    projectId: row.project_id,
    tags: row.tags || [],
    startTime: row.start_time,
    endTime: row.end_time,
    rateAtTimeOfEntry: row.rate_at_time_of_entry ?? 0,
  }
}

function entryToRow(entry, userId) {
  return {
    id: entry.id,
    user_id: userId,
    description: entry.description,
    project_id: entry.projectId,
    tags: entry.tags || [],
    start_time: entry.startTime,
    end_time: entry.endTime,
    rate_at_time_of_entry: entry.rateAtTimeOfEntry ?? 0,
  }
}

function rowToProject(row) {
  return {
    id: row.id,
    name: row.name,
    color: row.color,
    client: row.client || '',
    clientAddress: row.client_address || '',
    clientVAT: row.client_vat || '',
    hourlyRate: row.hourly_rate ?? 0,
    maxHoursPerMonth: row.max_hours_per_month ?? 0,
  }
}

function projectToRow(project, userId) {
  return {
    id: project.id,
    user_id: userId,
    name: project.name,
    color: project.color,
    client: project.client || '',
    client_address: project.clientAddress || '',
    client_vat: project.clientVAT || '',
    hourly_rate: project.hourlyRate ?? 0,
    max_hours_per_month: project.maxHoursPerMonth || null,
  }
}

function rowToInvoice(row) {
  return {
    id: row.id,
    projectId: row.project_id,
    month: row.month,
    invoiceNumber: row.invoice_number,
    generatedAt: row.generated_at,
    status: row.status,
  }
}

function invoiceToRow(invoice, userId) {
  return {
    id: invoice.id,
    user_id: userId,
    project_id: invoice.projectId,
    month: invoice.month,
    invoice_number: invoice.invoiceNumber,
    generated_at: invoice.generatedAt,
    status: invoice.status,
  }
}

function getDefaultProjects() {
  return [
    { id: 'p1', name: 'Design', color: '#e57cd8', client: '', clientAddress: '', clientVAT: '', hourlyRate: 0, maxHoursPerMonth: 0 },
    { id: 'p2', name: 'Development', color: '#4a9eff', client: '', clientAddress: '', clientVAT: '', hourlyRate: 0, maxHoursPerMonth: 0 },
    { id: 'p3', name: 'Meeting', color: '#f97316', client: '', clientAddress: '', clientVAT: '', hourlyRate: 0, maxHoursPerMonth: 0 },
  ]
}

async function upsertSetting(key, value, userId) {
  const { error } = await supabase
    .from('app_settings')
    .upsert({ key, user_id: userId, value, updated_at: new Date().toISOString() })
  if (error) console.error('upsertSetting error:', error)
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useAppState(userId) {
  const [entries, setEntries] = useState([])
  const [projects, setProjects] = useState([])
  const [runningTimer, setRunningTimerState] = useState(null)
  const [elapsed, setElapsed] = useState(0)
  const [currency, setCurrencyState] = useState('€')
  const [invoices, setInvoices] = useState([])
  const [invoiceSettings, setInvoiceSettingsState] = useState({})
  const [invoiceCounter, setInvoiceCounter] = useState(null)
  const [loading, setLoading] = useState(true)
  const intervalRef = useRef(null)

  // ── Initial load ─────────────────────────────────────────────────────────

  useEffect(() => {
    if (!userId) return
    let cancelled = false

    async function loadAll() {
      setLoading(true)

      const [
        { data: entriesData, error: eErr },
        { data: projectsData, error: pErr },
        { data: settingsData },
        { data: invoicesData },
      ] = await Promise.all([
        supabase.from('entries').select('*').order('start_time', { ascending: false }),
        supabase.from('projects').select('*'),
        supabase.from('app_settings').select('*'),
        supabase.from('invoices').select('*'),
      ])

      if (cancelled) return
      if (eErr) console.error('load entries:', eErr)
      if (pErr) console.error('load projects:', pErr)

      if (entriesData) setEntries(entriesData.map(rowToEntry))

      if (projectsData && projectsData.length > 0) {
        setProjects(projectsData.map(rowToProject))
      } else if (projectsData?.length === 0) {
        const defaults = getDefaultProjects()
        setProjects(defaults)
        await supabase.from('projects').insert(defaults.map(p => projectToRow(p, userId)))
      }

      if (invoicesData) setInvoices(invoicesData.map(rowToInvoice))

      if (settingsData) {
        const map = {}
        settingsData.forEach(s => { map[s.key] = s.value })
        if (map.currency != null) setCurrencyState(map.currency)
        if (map.running_timer != null) setRunningTimerState(map.running_timer)
        if (map.invoice_settings != null) setInvoiceSettingsState(map.invoice_settings)
        if (map.invoice_counter != null) setInvoiceCounter(map.invoice_counter)
      }

      setLoading(false)
    }

    loadAll()
    return () => { cancelled = true }
  }, [userId])

  // ── Live timer tick ──────────────────────────────────────────────────────

  useEffect(() => {
    if (runningTimer) {
      const tick = () => setElapsed(Date.now() - runningTimer.startTime)
      tick()
      intervalRef.current = setInterval(tick, 500)
    } else {
      setElapsed(0)
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [runningTimer])

  // ── Running timer (synced to DB so other devices see it) ─────────────────

  const setRunningTimer = useCallback(async (timer) => {
    setRunningTimerState(timer)
    await upsertSetting('running_timer', timer, userId)
  }, [userId])

  // ── Currency ─────────────────────────────────────────────────────────────

  const setCurrency = useCallback(async (symbol) => {
    setCurrencyState(symbol)
    await upsertSetting('currency', symbol, userId)
  }, [userId])

  // ── Helpers ──────────────────────────────────────────────────────────────

  const getRateSnapshot = useCallback((projectId) => {
    const project = projects.find(p => p.id === projectId)
    return project?.hourlyRate ?? 0
  }, [projects])

  // ── Timer ────────────────────────────────────────────────────────────────

  const startTimer = useCallback(async (description, projectId, tags) => {
    const timer = {
      description: description || '',
      projectId: projectId || null,
      tags: tags || [],
      startTime: Date.now(),
    }
    await setRunningTimer(timer)
  }, [setRunningTimer])

  const stopTimer = useCallback(async () => {
    if (!runningTimer) return
    const entry = {
      id: generateId(),
      description: runningTimer.description,
      projectId: runningTimer.projectId,
      tags: runningTimer.tags,
      startTime: runningTimer.startTime,
      endTime: Date.now(),
      rateAtTimeOfEntry: getRateSnapshot(runningTimer.projectId),
    }
    setEntries(prev => [entry, ...prev])
    await supabase.from('entries').insert(entryToRow(entry, userId))
    await setRunningTimer(null)
  }, [runningTimer, getRateSnapshot, setRunningTimer, userId])

  const continueEntry = useCallback(async (entry) => {
    if (runningTimer) {
      const stoppedEntry = {
        id: generateId(),
        description: runningTimer.description,
        projectId: runningTimer.projectId,
        tags: runningTimer.tags,
        startTime: runningTimer.startTime,
        endTime: Date.now(),
        rateAtTimeOfEntry: getRateSnapshot(runningTimer.projectId),
      }
      setEntries(prev => [stoppedEntry, ...prev])
      await supabase.from('entries').insert(entryToRow(stoppedEntry, userId))
    }
    const timer = {
      description: entry.description,
      projectId: entry.projectId,
      tags: entry.tags,
      startTime: Date.now(),
    }
    await setRunningTimer(timer)
  }, [runningTimer, getRateSnapshot, setRunningTimer, userId])

  // ── Entries ──────────────────────────────────────────────────────────────

  const deleteEntry = useCallback(async (id) => {
    setEntries(prev => prev.filter(e => e.id !== id))
    await supabase.from('entries').delete().eq('id', id)
  }, [])

  const updateEntry = useCallback(async (id, updates) => {
    setEntries(prev => prev.map(e => {
      if (e.id !== id) return e
      const updated = { ...e, ...updates }
      if ('projectId' in updates) {
        const project = projects.find(p => p.id === updates.projectId)
        updated.rateAtTimeOfEntry = project?.hourlyRate ?? 0
      }
      return updated
    }))
    const dbUpdates = {}
    if ('description' in updates) dbUpdates.description = updates.description
    if ('projectId' in updates) {
      dbUpdates.project_id = updates.projectId
      const project = projects.find(p => p.id === updates.projectId)
      dbUpdates.rate_at_time_of_entry = project?.hourlyRate ?? 0
    }
    if ('startTime' in updates) dbUpdates.start_time = updates.startTime
    if ('endTime' in updates) dbUpdates.end_time = updates.endTime
    if ('tags' in updates) dbUpdates.tags = updates.tags
    if (Object.keys(dbUpdates).length > 0) {
      await supabase.from('entries').update(dbUpdates).eq('id', id)
    }
  }, [projects])

  const addManualEntry = useCallback(async (entry) => {
    const rateAtTimeOfEntry = getRateSnapshot(entry.projectId)
    const newEntry = { id: generateId(), rateAtTimeOfEntry, ...entry }
    setEntries(prev =>
      [newEntry, ...prev].sort((a, b) => b.startTime - a.startTime)
    )
    await supabase.from('entries').insert(entryToRow(newEntry, userId))
  }, [getRateSnapshot, userId])

  // ── Projects ─────────────────────────────────────────────────────────────

  const addProject = useCallback(async (project) => {
    const newProject = { id: generateId(), ...project }
    setProjects(prev => [...prev, newProject])
    await supabase.from('projects').insert(projectToRow(newProject, userId))
  }, [userId])

  const updateProject = useCallback(async (id, updates) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p))
    const dbUpdates = {}
    if ('name' in updates) dbUpdates.name = updates.name
    if ('color' in updates) dbUpdates.color = updates.color
    if ('client' in updates) dbUpdates.client = updates.client
    if ('clientAddress' in updates) dbUpdates.client_address = updates.clientAddress
    if ('clientVAT' in updates) dbUpdates.client_vat = updates.clientVAT
    if ('hourlyRate' in updates) dbUpdates.hourly_rate = updates.hourlyRate
    if ('maxHoursPerMonth' in updates) dbUpdates.max_hours_per_month = updates.maxHoursPerMonth || null
    await supabase.from('projects').update(dbUpdates).eq('id', id)
  }, [])

  const deleteProject = useCallback(async (id) => {
    setProjects(prev => prev.filter(p => p.id !== id))
    setEntries(prev => prev.map(e => e.projectId === id ? { ...e, projectId: null } : e))
    await supabase.from('projects').delete().eq('id', id)
    await supabase.from('entries').update({ project_id: null }).eq('project_id', id)
  }, [])

  // ── Invoices ─────────────────────────────────────────────────────────────

  const addInvoice = useCallback(async (invoice) => {
    setInvoices(prev => [...prev, invoice])
    await supabase.from('invoices').insert(invoiceToRow(invoice, userId))
  }, [userId])

  const updateInvoice = useCallback(async (id, updates) => {
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, ...updates } : inv))
    const dbUpdates = {}
    if ('status' in updates) dbUpdates.status = updates.status
    if ('invoiceNumber' in updates) dbUpdates.invoice_number = updates.invoiceNumber
    if ('generatedAt' in updates) dbUpdates.generated_at = updates.generatedAt
    if (Object.keys(dbUpdates).length > 0) {
      await supabase.from('invoices').update(dbUpdates).eq('id', id)
    }
  }, [])

  const saveInvoiceSettings = useCallback(async (settings) => {
    setInvoiceSettingsState(settings)
    await upsertSetting('invoice_settings', settings, userId)
  }, [userId])

  const consumeInvoiceNumber = useCallback(async () => {
    const year = new Date().getFullYear()
    let seq = 1
    if (invoiceCounter && invoiceCounter.year === year) {
      seq = invoiceCounter.seq
    }
    const newCounter = { year, seq: seq + 1 }
    setInvoiceCounter(newCounter)
    await upsertSetting('invoice_counter', newCounter, userId)
    return `${year}-${String(seq).padStart(3, '0')}`
  }, [invoiceCounter, userId])

  // ── Return ────────────────────────────────────────────────────────────────

  return {
    loading,
    entries,
    projects,
    runningTimer,
    elapsed,
    currency,
    setCurrency,
    startTimer,
    stopTimer,
    continueEntry,
    deleteEntry,
    updateEntry,
    addManualEntry,
    addProject,
    updateProject,
    deleteProject,
    invoices,
    invoiceSettings,
    addInvoice,
    updateInvoice,
    saveInvoiceSettings,
    consumeInvoiceNumber,
  }
}
