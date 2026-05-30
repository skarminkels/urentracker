import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import ProjectModal from './ProjectModal'
import { CURRENCIES, formatCurrency } from '../../utils/currency'
import { formatDurationShort } from '../../utils/time'

export default function ProjectsPage({
  projects, entries, currency, setCurrency,
  addProject, updateProject, deleteProject,
  initialEditProjectId, onClearPendingEdit,
}) {
  const [showModal, setShowModal] = useState(false)
  const [editingProject, setEditingProject] = useState(null)

  useEffect(() => {
    if (!initialEditProjectId || projects.length === 0) return
    const project = projects.find(p => p.id === initialEditProjectId)
    if (project) {
      setEditingProject(project)
      setShowModal(true)
      onClearPendingEdit?.()
    }
  }, [initialEditProjectId, projects])

  const getStats = (projectId) => {
    const proj_entries = entries.filter(e => e.projectId === projectId && e.endTime)
    const totalMs = proj_entries.reduce((s, e) => s + (e.endTime - e.startTime), 0)
    return { count: proj_entries.length, totalMs }
  }

  const handleSave = (data) => {
    if (editingProject) {
      updateProject(editingProject.id, data)
    } else {
      addProject(data)
    }
    setEditingProject(null)
  }

  return (
    <div className="flex-1 px-6 py-6 max-w-4xl w-full mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold" style={{ color: '#2b2a27' }}>Projects</h1>

          {/* Currency selector */}
          <div
            className="flex items-center gap-0.5 rounded-xl p-0.5"
            style={{ backgroundColor: '#f6f3ee', border: '1px solid rgba(43,42,39,0.08)' }}
          >
            {CURRENCIES.map(c => (
              <button
                key={c.symbol}
                onClick={() => setCurrency(c.symbol)}
                className="px-2.5 py-1 rounded-lg text-sm font-medium transition-[transform,background-color,color] duration-150 active:scale-[0.94]"
                style={currency === c.symbol
                  ? { backgroundColor: '#20242c', color: '#f6f2eb' }
                  : { color: '#7c776f' }
                }
                onMouseEnter={e => { if (currency !== c.symbol) e.currentTarget.style.color = '#2b2a27' }}
                onMouseLeave={e => { if (currency !== c.symbol) e.currentTarget.style.color = '#7c776f' }}
              >
                {c.symbol}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => { setEditingProject(null); setShowModal(true) }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium text-white transition-[transform,background-color] duration-150 active:scale-[0.97]"
          style={{ backgroundColor: '#20242c' }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#2d3340'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = '#20242c'}
        >
          <Plus size={16} />
          New project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-20" style={{ color: '#7c776f' }}>
          <p className="text-lg font-medium mb-2">No projects yet</p>
          <p className="text-sm">Create a project to organize your time entries.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {projects.map(project => {
            const { count, totalMs } = getStats(project.id)
            return (
              <div
                key={project.id}
                className="rounded-2xl px-5 py-4 flex items-center gap-4 group card-lift"
                style={{
                  backgroundColor: '#f6f3ee',
                  boxShadow: '0 20px 40px rgba(55,44,22,0.06)',
                  border: '1px solid rgba(43,42,39,0.06)',
                }}
              >
                <div
                  className="w-4 h-4 rounded-full shrink-0"
                  style={{ backgroundColor: project.color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm" style={{ color: '#2b2a27' }}>{project.name}</span>
                    {project.client && (
                      <span className="text-xs" style={{ color: '#7c776f' }}>{project.client}</span>
                    )}
                    {project.hourlyRate > 0 && (
                      <span
                        className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: '#e6e0d7', color: '#4a4a45' }}
                      >
                        {currency}{project.hourlyRate}/u
                      </span>
                    )}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: '#7c776f' }}>
                    {count} {count === 1 ? 'entry' : 'entries'} · {formatDurationShort(totalMs)}
                    {project.hourlyRate > 0 && totalMs > 0 && (
                      <span className="ml-1">
                        · {formatCurrency((totalMs / 3600000) * project.hourlyRate, currency)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                  <button
                    onClick={() => { setEditingProject(project); setShowModal(true) }}
                    className="p-2 rounded-lg transition-[transform,color,background-color] duration-150 active:scale-[0.90]"
                    style={{ color: '#7c776f' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#2b2a27'; e.currentTarget.style.backgroundColor = '#e6e0d7' }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#7c776f'; e.currentTarget.style.backgroundColor = '' }}
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => deleteProject(project.id)}
                    className="p-2 rounded-lg transition-[transform,color,background-color] duration-150 active:scale-[0.90]"
                    style={{ color: '#7c776f' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.backgroundColor = '#fef2f2' }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#7c776f'; e.currentTarget.style.backgroundColor = '' }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showModal && (
        <ProjectModal
          project={editingProject}
          currency={currency}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditingProject(null) }}
        />
      )}
    </div>
  )
}
