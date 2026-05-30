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
          <h1 className="text-xl font-semibold text-[#111827]">Projects</h1>

          {/* Currency selector */}
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-0.5">
            {CURRENCIES.map(c => (
              <button
                key={c.symbol}
                onClick={() => setCurrency(c.symbol)}
                className={`px-2.5 py-1 rounded-lg text-sm font-medium transition-[transform,background-color,color] duration-150 active:scale-[0.94] ${
                  currency === c.symbol
                    ? 'bg-[#6B5CF6] text-white'
                    : 'text-[#6B7280] hover:text-[#111827]'
                }`}
              >
                {c.symbol}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => { setEditingProject(null); setShowModal(true) }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#6B5CF6] hover:bg-[#5347d4] text-white text-sm font-medium transition-[transform,background-color] duration-150 active:scale-[0.97]"
        >
          <Plus size={16} />
          New project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-20 text-[#6B7280]">
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
                className="bg-white rounded-2xl px-5 py-4 flex items-center gap-4 group card-lift"
                style={{ boxShadow: '0 20px 40px rgba(15,23,42,0.06)', border: '1px solid rgba(15,23,42,0.05)' }}
              >
                <div
                  className="w-4 h-4 rounded-full shrink-0"
                  style={{ backgroundColor: project.color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-[#111827] text-sm">{project.name}</span>
                    {project.client && (
                      <span className="text-xs text-[#6B7280]">{project.client}</span>
                    )}
                    {project.hourlyRate > 0 && (
                      <span className="text-xs font-semibold text-[#6B5CF6] bg-[#6B5CF6]/8 px-2 py-0.5 rounded-full">
                        {currency}{project.hourlyRate}/u
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-[#6B7280] mt-0.5">
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
                    className="p-2 rounded-lg text-[#6B7280] hover:text-[#111827] hover:bg-gray-100 transition-[transform,color,background-color] duration-150 active:scale-[0.90]"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => deleteProject(project.id)}
                    className="p-2 rounded-lg text-[#6B7280] hover:text-[#EF4444] hover:bg-red-50 transition-[transform,color,background-color] duration-150 active:scale-[0.90]"
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
