import {
  LayoutDashboard, Clock, Users, FileText, BarChart2, Settings,
} from 'lucide-react'

const NAV_ITEMS = [
  { id: 'dashboard',       label: 'Dashboard',       Icon: LayoutDashboard },
  { id: 'uren',            label: 'Uren loggen',      Icon: Clock },
  { id: 'klanten',         label: 'Klanten',          Icon: Users },
  { id: 'facturen',        label: 'Facturen',         Icon: FileText },
  { id: 'factuuroverzicht',label: 'Factuuroverzicht', Icon: BarChart2 },
]

export default function Sidebar({ active, onNavigate }) {
  return (
    <aside
      className="flex flex-col text-slate-300 shrink-0"
      style={{ width: 240, minHeight: '100vh', background: '#0F172A' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b" style={{ borderColor: '#1E293B' }}>
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
          <Clock size={16} className="text-white" />
        </div>
        <div>
          <p className="text-white font-semibold text-sm leading-tight">Urentracker</p>
          <p className="text-xs mt-0.5" style={{ color: '#64748B' }}>Freelance admin</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
        {NAV_ITEMS.map(({ id, label, Icon }) => {
          const isActive = active === id
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left
                transition-all duration-150 font-medium
                ${isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white'
                }
              `}
              style={!isActive ? { ':hover': { background: '#1E293B' } } : undefined}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#1E293B' }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = '' }}
            >
              <Icon size={16} className={isActive ? 'text-white' : 'text-slate-500'} />
              {label}
            </button>
          )
        })}
      </nav>

      {/* Bottom: settings */}
      <div className="px-3 pb-4 border-t" style={{ borderColor: '#1E293B', paddingTop: 12 }}>
        <button
          onClick={() => onNavigate('instellingen')}
          className={`
            w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left
            transition-all duration-150 font-medium
            ${active === 'instellingen'
              ? 'bg-blue-600 text-white'
              : 'text-slate-400 hover:text-white'
            }
          `}
          onMouseEnter={e => { if (active !== 'instellingen') e.currentTarget.style.background = '#1E293B' }}
          onMouseLeave={e => { if (active !== 'instellingen') e.currentTarget.style.background = '' }}
        >
          <Settings size={16} className={active === 'instellingen' ? 'text-white' : 'text-slate-500'} />
          Instellingen
        </button>
      </div>
    </aside>
  )
}
