import { useState, useEffect, useCallback, useRef } from 'react'
import {
  loadEntries, saveEntries,
  loadProjects, saveProjects,
  loadRunningTimer, saveRunningTimer,
  generateId,
} from '../utils/storage'

export function useAppState() {
  const [entries, setEntries] = useState(() => loadEntries())
  const [projects, setProjects] = useState(() => loadProjects())
  const [runningTimer, setRunningTimer] = useState(() => loadRunningTimer())
  const [elapsed, setElapsed] = useState(0)
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
    }
    setEntries(prev => [entry, ...prev])
    setRunningTimer(null)
  }, [runningTimer])

  const continueEntry = useCallback((entry) => {
    // Stop current timer if running
    if (runningTimer) {
      const stoppedEntry = {
        id: generateId(),
        description: runningTimer.description,
        projectId: runningTimer.projectId,
        tags: runningTimer.tags,
        billable: runningTimer.billable,
        startTime: runningTimer.startTime,
        endTime: Date.now(),
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
  }, [runningTimer])

  const deleteEntry = useCallback((id) => {
    setEntries(prev => prev.filter(e => e.id !== id))
  }, [])

  const updateEntry = useCallback((id, updates) => {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e))
  }, [])

  const addManualEntry = useCallback((entry) => {
    setEntries(prev => [{ id: generateId(), ...entry }, ...prev].sort((a, b) => b.startTime - a.startTime))
  }, [])

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
