import { Timer, BarChart2, Folder, Clock, Receipt } from 'lucide-react'

const navItems = [
  { id: 'timer', label: 'Timer', icon: Timer },
  { id: 'reports', label: 'Reports', icon: BarChart2 },
  { id: 'invoices', label: 'Facturatie', icon: Receipt },
  { id: 'projects', label: 'Projects', icon: Folder },
]

export default function Sidebar({ page, setPage }) {
  return (
    <aside className="w-16 lg:w-56 bg-[#2c1a47] flex flex-col shrink-0 h-screen sticky top-0">
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
        <div className="w-8 h-8 rounded-lg bg-[#c95da7] flex items-center justify-center shrink-0">
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
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm font-medium transition-colors ${
              page === id
                ? 'bg-[#c95da7]/20 text-[#e57cd8]'
                : 'text-white/60 hover:text-white/90 hover:bg-white/5'
            }`}
          >
            <Icon size={18} className="shrink-0" />
            <span className="hidden lg:block">{label}</span>
          </button>
        ))}
      </nav>
    </aside>
  )
}
