import { useState } from 'react'
import Sidebar from './components/Sidebar'
import TimerPage from './components/Timer/TimerPage'
import ProjectsPage from './components/Projects/ProjectsPage'
import ReportsPage from './components/Reports/ReportsPage'
import { useAppState } from './hooks/useAppState'

export default function App() {
  const [page, setPage] = useState('timer')
  const state = useAppState()

  return (
    <div className="flex min-h-screen bg-[#f5f5f5] font-sans">
      <Sidebar page={page} setPage={setPage} />

      <main className="flex-1 flex flex-col overflow-auto">
        {page === 'timer' && (
          <TimerPage
            entries={state.entries}
            projects={state.projects}
            runningTimer={state.runningTimer}
            elapsed={state.elapsed}
            currency={state.currency}
            startTimer={state.startTimer}
            stopTimer={state.stopTimer}
            continueEntry={state.continueEntry}
            deleteEntry={state.deleteEntry}
            updateEntry={state.updateEntry}
            addManualEntry={state.addManualEntry}
          />
        )}
        {page === 'reports' && (
          <ReportsPage
            entries={state.entries}
            projects={state.projects}
            currency={state.currency}
          />
        )}
        {page === 'projects' && (
          <ProjectsPage
            projects={state.projects}
            entries={state.entries}
            currency={state.currency}
            setCurrency={state.setCurrency}
            addProject={state.addProject}
            updateProject={state.updateProject}
            deleteProject={state.deleteProject}
          />
        )}
      </main>
    </div>
  )
}
