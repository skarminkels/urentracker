import { LayoutDashboard, Clock, Users, FileText, BarChart2, Settings } from 'lucide-react'

const NAV_GROUPS = [
  {
    section: 'TRACK',
    items: [
      { id: 'uren', label: 'Uren loggen', Icon: Clock },
    ],
  },
  {
    section: 'ANALYZE',
    items: [
      { id: 'dashboard',        label: 'Dashboard',        Icon: LayoutDashboard },
      { id: 'factuuroverzicht', label: 'Factuuroverzicht', Icon: BarChart2 },
    ],
  },
  {
    section: 'MANAGE',
    items: [
      { id: 'klanten',  label: 'Klanten',  Icon: Users },
      { id: 'facturen', label: 'Facturen', Icon: FileText },
    ],
  },
]

function NavButton({ id, label, Icon, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] font-medium text-left transition-all duration-150"
      style={isActive ? { background: '#7B3FE4', color: '#FFFFFF' } : { color: '#A89BC4' }}
      onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#2A1B4E' }}
      onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = '' }}
    >
      <Icon size={15} style={isActive ? { color: 'white' } : { color: '#A89BC4' }} />
      {label}
    </button>
  )
}

export default function Sidebar({ active, onNavigate }) {
  return (
    <aside
      className="flex flex-col shrink-0"
      style={{ width: 220, minHeight: '100vh', background: '#1E1033' }}
    >
      {/* Logo */}
      <div className="px-4 py-5" style={{ borderBottom: '1px solid #2D1F50' }}>
        <button
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-2.5 w-full"
        >
          <div
            className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
            style={{ background: '#E54B8C' }}
          >
            <Clock size={14} className="text-white" />
          </div>
          <span className="text-sm font-bold text-white">uren</span>
          <span className="text-sm font-normal" style={{ color: '#A89BC4' }}>tracker</span>
        </button>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-5 overflow-y-auto">
        {NAV_GROUPS.map(({ section, items }) => (
          <div key={section}>
            <p
              className="px-3 mb-1.5 text-[10px] font-semibold tracking-widest uppercase"
              style={{ color: '#6B5A8A' }}
            >
              {section}
            </p>
            <div className="flex flex-col gap-0.5">
              {items.map(({ id, label, Icon }) => (
                <NavButton
                  key={id}
                  id={id}
                  label={label}
                  Icon={Icon}
                  isActive={active === id}
                  onClick={() => onNavigate(id)}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Admin at bottom */}
      <div className="px-3 pb-4" style={{ borderTop: '1px solid #2D1F50', paddingTop: 12 }}>
        <p
          className="px-3 mb-1.5 text-[10px] font-semibold tracking-widest uppercase"
          style={{ color: '#6B5A8A' }}
        >
          ADMIN
        </p>
        <NavButton
          id="instellingen"
          label="Instellingen"
          Icon={Settings}
          isActive={active === 'instellingen'}
          onClick={() => onNavigate('instellingen')}
        />
      </div>
    </aside>
  )
}
