import { NavLink, useNavigate } from 'react-router-dom'
import logo from '../assets/logo.js'

const links = [
  { to: '/dashboard',                label: 'Dashboard',         icon: '▣' },
  { to: '/dashboard/missions',       label: 'Créer une mission', icon: '+' },
  { to: '/dashboard/suivi',          label: 'Suivi missions',    icon: '◎' },
  { to: '/dashboard/historique',     label: 'Historique',        icon: '⏱' },
  { to: '/dashboard/rapports',       label: 'Rapports',          icon: '📋' },
  { to: '/dashboard/create-user',    label: 'Créer utilisateur', icon: '👤' },
  { to: '/dashboard/drivers',        label: 'Drivers',           icon: '◈' },
  { to: '/dashboard/settings',       label: 'Paramètres',        icon: '⚙' },
]

export default function Sidebar() {
  const navigate = useNavigate()

  const logout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <aside className="w-52 min-h-screen flex flex-col"
      style={{ background: '#080d1a', borderRight: '0.5px solid rgba(59,130,246,.15)' }}>

      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-3"
        style={{ borderBottom: '0.5px solid rgba(59,130,246,.15)' }}>
        <img
          src={`data:image/png;base64,${logo}`}
          alt="ErcTrac logo"
          className="w-9 h-9 rounded-lg object-cover"
        />
        <div>
          <p className="text-sm font-medium leading-tight" style={{ color: '#e2e8f0' }}>
            Erc<span style={{ color: '#3b82f6' }}>Trac</span>
          </p>
          <p className="text-xs" style={{ color: 'rgba(148,163,184,.4)' }}>Télécom Admin</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3">
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 text-sm transition-all ${
                isActive ? 'font-medium' : 'hover:opacity-80'
              }`
            }
            style={({ isActive }) => isActive
              ? {
                  color: '#60a5fa',
                  background: 'rgba(59,130,246,.1)',
                  borderLeft: '2px solid #3b82f6',
                  paddingLeft: '14px'
                }
              : { color: 'rgba(148,163,184,.6)' }
            }
          >
            <span style={{ fontSize: '13px', opacity: 0.7 }}>{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <button
        onClick={logout}
        className="mx-4 mb-5 text-left text-sm py-2 px-1 transition-opacity hover:opacity-80"
        style={{ color: 'rgba(148,163,184,.4)', background: 'none', border: 'none', cursor: 'pointer' }}
      >
        ⎋ Déconnexion
      </button>
    </aside>
  )
}
