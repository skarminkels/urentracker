import { useState, useEffect, useCallback, useRef } from 'react'
import {
  loadEntries, saveEntries,
  loadProjects, saveProjects,
  loadRunningTimer, saveRunningTimer,
  loadCurrency, saveCurrency,
  generateId,
} from '../utils/storage'

export function useAppState() {
  const [entries, setEntries] = useState(() => loadEntries())
  const [projects, setProjects] = useState(() => loadProjects())
  const [runningTimer, setRunningTimer] = useState(() => loadRunningTimer())
  const [elapsed, setElapsed] = useState(0)
  const [currency, setCurrencyState] = useState(() => loadCurrency())
  const intervalRef = useRef(null)

  // Sync to localStorage
  useEffect(() => { saveEntries(entries) }, [entries])
  useEffect(() => { saveProjects(projects) }, [projects])
  useEffect(() => { saveRunningTimer(runningTimer) }, [runningTimer])

  // Live timer tick
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

  const setCurrency = useCallback((symbol) => {
    saveCurrency(symbol)
    setCurrencyState(symbol)
  }, [])

  const getRateSnapshot = useCallback((projectId) => {
    const project = projects.find(p => p.id === projectId)
    return project?.hourlyRate ?? 0
  }, [projects])

  const startTimer = useCallback((description, projectId, tags, billable) => {
    const timer = {
      description: description || '',
      projectId: projectId || null,
      tags: tags || [],
      billable: billable || false,
      startTime: Date.now(),
    }
    setRunningTimer(timer)
  }, [])

  const stopTimer = useCallback(() => {
    if (!runningTimer) return
    const entry = {
      id: generateId(),
      description: runningTimer.description,
      projectId: runningTimer.projectId,
      tags: runningTimer.tags,
      billable: runningTimer.billable,
      startTime: runningTimer.startTime,
      endTime: Date.now(),
      rateAtTimeOfEntry: getRateSnapshot(runningTimer.projectId),
    }
    setEntries(prev => [entry, ...prev])
    setRunningTimer(null)
  }, [runningTimer, getRateSnapshot])

  const continueEntry = useCallback((entry) => {
    if (runningTimer) {
      const stoppedEntry = {
        id: generateId(),
        description: runningTimer.description,
        projectId: runningTimer.projectId,
        tags: runningTimer.tags,
        billable: runningTimer.billable,
        startTime: runningTimer.startTime,
        endTime: Date.now(),
        rateAtTimeOfEntry: getRateSnapshot(runningTimer.projectId),
      }
      setEntries(prev => [stoppedEntry, ...prev])
    }
    const timer = {
      description: entry.description,
      projectId: entry.projectId,
      tags: entry.tags,
      billable: entry.billable,
      startTime: Date.now(),
    }
    setRunningTimer(timer)
  }, [runningTimer, getRateSnapshot])

  const deleteEntry = useCallback((id) => {
    setEntries(prev => prev.filter(e => e.id !== id))
  }, [])

  const updateEntry = useCallback((id, updates) => {
    setEntries(prev => prev.map(e => {
      if (e.id !== id) return e
      const updated = { ...e, ...updates }
      // Refresh rate snapshot if project was explicitly changed
      if ('projectId' in updates) {
        const project = projects.find(p => p.id === updates.projectId)
        updated.rateAtTimeOfEntry = project?.hourlyRate ?? 0
      }
      return updated
    }))
  }, [projects])

  const addManualEntry = useCallback((entry) => {
    const rateAtTimeOfEntry = getRateSnapshot(entry.projectId)
    setEntries(prev =>
      [{ id: generateId(), rateAtTimeOfEntry, ...entry }, ...prev]
        .sort((a, b) => b.startTime - a.startTime)
    )
  }, [getRateSnapshot])

  const addProject = useCallback((project) => {
    setProjects(prev => [...prev, { id: generateId(), ...project }])
  }, [])

  const updateProject = useCallback((id, updates) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p))
  }, [])

  const deleteProject = useCallback((id) => {
    setProjects(prev => prev.filter(p => p.id !== id))
    setEntries(prev => prev.map(e => e.projectId === id ? { ...e, projectId: null } : e))
  }, [])

  return {
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
  }
}
