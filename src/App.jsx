import { useState } from 'react'
import { DataProvider } from './context/DataContext'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import UrenLoggen from './pages/UrenLoggen'
import Klanten from './pages/Klanten'
import Factuuroverzicht from './pages/Factuuroverzicht'
import Facturen from './pages/Facturen'
import Instellingen from './pages/Instellingen'

const PAGES = {
  dashboard: Dashboard,
  uren: UrenLoggen,
  klanten: Klanten,
  facturen: Facturen,
  factuuroverzicht: Factuuroverzicht,
  instellingen: Instellingen,
}

function App() {
  const [page, setPage] = useState('dashboard')
  const Page = PAGES[page]

  return (
    <DataProvider>
      <div className="flex min-h-screen">
        <Sidebar active={page} onNavigate={setPage} />
        <main className="flex-1 overflow-auto bg-canvas">
          <Page />
        </main>
      </div>
    </DataProvider>
  )
}

export default App
