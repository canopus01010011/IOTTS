import { NavLink, useNavigate } from 'react-router-dom'
import BrandLogo from './BrandLogo.jsx'
import { useLanguage } from '../i18n.jsx'

const links = [
  { to: '/dashboard', labelKey: 'nav.dashboard', icon: 'D' },
  { to: '/dashboard/missions', labelKey: 'nav.createMission', icon: '+' },
  { to: '/dashboard/suivi', labelKey: 'nav.tracking', icon: 'M' },
  { to: '/dashboard/historique', labelKey: 'nav.history', icon: 'H' },
  { to: '/dashboard/rapports', labelKey: 'nav.reports', icon: 'R' },
  { to: '/dashboard/create-user', labelKey: 'nav.createUser', icon: 'U' },
  { to: '/dashboard/drivers', labelKey: 'nav.drivers', icon: 'C' },
  { to: '/dashboard/technicians', labelKey: 'nav.technicians', icon: 'T' },
  { to: '/dashboard/sites', labelKey: 'nav.sites', icon: 'S' },
  { to: '/dashboard/containers', labelKey: 'nav.containers', icon: 'B' },
  { to: '/dashboard/settings', labelKey: 'nav.settings', icon: 'P' },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const { t } = useLanguage()

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userRole')
    navigate('/login')
  }

  return (
    <aside
      className="w-56 min-h-screen flex flex-col"
      style={{
        background: 'rgba(8,13,26,.96)',
        borderRight: '1px solid var(--border)',
        boxShadow: '10px 0 30px rgba(0,0,0,.18)',
      }}
    >
      <div
        className="flex items-center gap-3 px-4 py-4"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <BrandLogo size={40} subtitle={t('app.admin')} />
      </div>

      <nav className="flex-1 py-3 px-3">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/dashboard'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 text-sm transition-all ${
                isActive ? 'font-medium' : 'hover:opacity-80'
              }`
            }
            style={({ isActive }) =>
              isActive
                ? {
                    color: '#f8fafc',
                    background: 'rgba(30, 168, 212, 0.16)',
                    border: '1px solid rgba(30, 168, 212, 0.28)',
                    borderRadius: 8,
                  }
                : {
                    color: 'rgba(148,163,184,.72)',
                    border: '1px solid transparent',
                    borderRadius: 8,
                  }
            }
          >
            <span
              style={{
                width: 24,
                height: 24,
                borderRadius: 7,
                background: 'rgba(148,163,184,.12)',
                color: '#93c5fd',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                fontWeight: 800,
                flexShrink: 0,
              }}
            >
              {link.icon}
            </span>
            {t(link.labelKey)}
          </NavLink>
        ))}
      </nav>

      <button
        onClick={logout}
        className="mx-3 mb-5 text-left text-sm py-2.5 px-3 transition-opacity hover:opacity-80"
        style={{
          color: 'rgba(248,250,252,.76)',
          background: 'rgba(148,163,184,.1)',
          border: '1px solid rgba(148,163,184,.14)',
          borderRadius: 8,
          cursor: 'pointer',
        }}
      >
        {t('nav.logout')}
      </button>
    </aside>
  )
}
