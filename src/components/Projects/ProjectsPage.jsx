import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import ProjectModal from './ProjectModal'

export default function ProjectsPage({ projects, entries, addProject, updateProject, deleteProject }) {
  const [showModal, setShowModal] = useState(false)
  const [editingProject, setEditingProject] = useState(null)

  const getEntryCount = (projectId) =>
    entries.filter(e => e.projectId === projectId).length

  const getTotalTime = (projectId) => {
    const ms = entries
      .filter(e => e.projectId === projectId && e.endTime)
      .reduce((sum, e) => sum + (e.endTime - e.startTime), 0)
    const h = Math.floor(ms / 3600000)
    const m = Math.floor((ms % 3600000) / 60000)
    return `${h}h ${m}m`
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
        <h1 className="text-xl font-semibold text-gray-900">Projects</h1>
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
          {projects.map(project => (
            <div
              key={project.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-4 group hover:shadow-md transition-shadow"
            >
              <div
                className="w-4 h-4 rounded-full shrink-0"
                style={{ backgroundColor: project.color }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-800 text-sm">{project.name}</span>
                  {project.client && (
                    <span className="text-xs text-gray-400">{project.client}</span>
                  )}
                </div>
                <div className="text-xs text-gray-400 mt-0.5">
                  {getEntryCount(project.id)} entries · {getTotalTime(project.id)}
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
          ))}
        </div>
      )}

      {showModal && (
        <ProjectModal
          project={editingProject}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditingProject(null) }}
        />
      )}
    </div>
  )
}
