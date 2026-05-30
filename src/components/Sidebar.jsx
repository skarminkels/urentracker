import { Timer, BarChart2, Folder, Clock, Receipt, LogOut } from 'lucide-react'
import { supabase } from '../lib/supabase'

const navItems = [
  { id: 'timer', label: 'Timer', icon: Timer },
  { id: 'reports', label: 'Reports', icon: BarChart2 },
  { id: 'invoices', label: 'Facturatie', icon: Receipt },
  { id: 'projects', label: 'Projects', icon: Folder },
]

export default function Sidebar({ page, setPage }) {
  return (
    <aside className="w-16 lg:w-56 flex flex-col shrink-0 h-screen sticky top-0" style={{ backgroundColor: '#20242c' }}>
      <div className="flex items-center gap-3 px-4 py-5" style={{ borderBottom: '1px solid rgba(246,242,235,0.06)' }}>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#f1c93b' }}>
          <Clock size={16} style={{ color: '#20242c' }} />
        </div>
        <span className="hidden lg:block font-semibold text-sm tracking-wide" style={{ color: '#f6f2eb' }}>
          Urentracker
        </span>
      </div>

      <nav className="flex-1 py-4 px-2">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setPage(id)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 text-sm font-medium transition-[background-color,color] duration-150"
            style={page === id
              ? { backgroundColor: 'rgba(241,201,59,0.12)', color: '#f1c93b' }
              : { color: 'rgba(246,242,235,0.45)' }
            }
            onMouseEnter={e => { if (page !== id) e.currentTarget.style.color = 'rgba(246,242,235,0.75)' }}
            onMouseLeave={e => { if (page !== id) e.currentTarget.style.color = 'rgba(246,242,235,0.45)' }}
          >
            <Icon size={18} className="shrink-0" />
            <span className="hidden lg:block">{label}</span>
          </button>
        ))}
      </nav>

      <div className="px-2 pb-4 pt-3" style={{ borderTop: '1px solid rgba(246,242,235,0.06)' }}>
        <button
          onClick={() => supabase.auth.signOut()}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-[background-color,color] duration-150"
          style={{ color: 'rgba(246,242,235,0.25)' }}
          onMouseEnter={e => { e.currentTarget.style.color = 'rgba(246,242,235,0.55)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(246,242,235,0.25)' }}
        >
          <LogOut size={18} className="shrink-0" />
          <span className="hidden lg:block">Uitloggen</span>
        </button>
      </div>
    </aside>
  )
}
