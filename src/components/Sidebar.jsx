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
    <aside className="w-16 lg:w-56 flex flex-col shrink-0 h-screen sticky top-0" style={{ backgroundColor: '#151821' }}>
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/8">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #6B5CF6 0%, #A855F7 100%)' }}>
          <Clock size={16} className="text-white" />
        </div>
        <span className="hidden lg:block text-white font-semibold text-sm tracking-wide">
          Urentracker
        </span>
      </div>

      <nav className="flex-1 py-4 px-2">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setPage(id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 text-sm font-medium transition-[background-color,color] duration-150 ${
              page === id
                ? 'text-white'
                : 'text-white/50 hover:text-white/80 hover:bg-white/5'
            }`}
            style={page === id ? { backgroundColor: 'rgba(107,92,246,0.2)', color: '#a78bfa' } : {}}
          >
            <Icon size={18} className="shrink-0" />
            <span className="hidden lg:block">{label}</span>
          </button>
        ))}
      </nav>

      <div className="px-2 pb-4 border-t border-white/8 pt-3">
        <button
          onClick={() => supabase.auth.signOut()}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/30 hover:text-white/60 hover:bg-white/5 transition-[background-color,color] duration-150"
        >
          <LogOut size={18} className="shrink-0" />
          <span className="hidden lg:block">Uitloggen</span>
        </button>
      </div>
    </aside>
  )
}
