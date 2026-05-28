import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import ProjectModal from './ProjectModal'
import { CURRENCIES, formatCurrency } from '../../utils/currency'
import { formatDurationShort } from '../../utils/time'

export default function ProjectsPage({
  projects, entries, currency, setCurrency,
  addProject, updateProject, deleteProject,
}) {
  const [showModal, setShowModal] = useState(false)
  const [editingProject, setEditingProject] = useState(null)

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
          <h1 className="text-xl font-semibold text-gray-900">Projects</h1>

          {/* Currency selector */}
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-0.5">
            {CURRENCIES.map(c => (
              <button
                key={c.symbol}
                onClick={() => setCurrency(c.symbol)}
                className={`px-2.5 py-1 rounded-md text-sm font-medium transition-colors ${
                  currency === c.symbol
                    ? 'bg-[#c95da7] text-white'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {c.symbol}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => { setEditingProject(null); setShowModal(true) }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#c95da7] hover:bg-[#a04389] text-white text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          New project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
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
                className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-4 group hover:shadow-md transition-shadow"
              >
                <div
                  className="w-4 h-4 rounded-full shrink-0"
                  style={{ backgroundColor: project.color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-gray-800 text-sm">{project.name}</span>
                    {project.client && (
                      <span className="text-xs text-gray-400">{project.client}</span>
                    )}
                    {project.hourlyRate > 0 && (
                      <span className="text-xs font-semibold text-[#c95da7] bg-[#c95da7]/8 px-2 py-0.5 rounded-full">
                        {currency}{project.hourlyRate}/u
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {count} {count === 1 ? 'entry' : 'entries'} · {formatDurationShort(totalMs)}
                    {project.hourlyRate > 0 && totalMs > 0 && (
                      <span className="ml-1">
                        · {formatCurrency((totalMs / 3600000) * project.hourlyRate, currency)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => { setEditingProject(project); setShowModal(true) }}
                    className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => deleteProject(project.id)}
                    className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
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
