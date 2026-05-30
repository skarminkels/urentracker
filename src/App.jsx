import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import LoginPage from './components/Auth/LoginPage'
import Sidebar from './components/Sidebar'
import TimerPage from './components/Timer/TimerPage'
import ProjectsPage from './components/Projects/ProjectsPage'
import ReportsPage from './components/Reports/ReportsPage'
import InvoicesPage from './components/Invoices/InvoicesPage'
import { useAppState } from './hooks/useAppState'

export default function App() {
  const [session, setSession] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setAuthLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (authLoading) return null

  if (!session) return <LoginPage />

  return <MainApp userId={session.user.id} />
}

function MainApp({ userId }) {
  const [page, setPage] = useState('timer')
  const [pendingEditProjectId, setPendingEditProjectId] = useState(null)
  const state = useAppState(userId)

  if (state.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#e8e4dd' }}>
        <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#20242c', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen font-sans" style={{ background: '#e8e4dd' }}>
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
        {page === 'invoices' && (
          <InvoicesPage
            entries={state.entries}
            projects={state.projects}
            currency={state.currency}
            invoices={state.invoices}
            invoiceSettings={state.invoiceSettings}
            addInvoice={state.addInvoice}
            updateInvoice={state.updateInvoice}
            saveInvoiceSettings={state.saveInvoiceSettings}
            consumeInvoiceNumber={state.consumeInvoiceNumber}
            onEditProject={(id) => { setPendingEditProjectId(id); setPage('projects') }}
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
            initialEditProjectId={pendingEditProjectId}
            onClearPendingEdit={() => setPendingEditProjectId(null)}
          />
        )}
      </main>
    </div>
  )
}
