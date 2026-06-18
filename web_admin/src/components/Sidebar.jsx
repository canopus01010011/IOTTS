import { NavLink, useNavigate } from 'react-router-dom'
import BrandLogo from './BrandLogo.jsx'
import { useLanguage } from '../i18n.jsx'

const links = [
  { to: '/dashboard', labelKey: 'nav.dashboard', icon: '◉' },
  { to: '/dashboard/missions', labelKey: 'nav.createMission', icon: '＋' },
  { to: '/dashboard/suivi', labelKey: 'nav.tracking', icon: '◎' },
  { to: '/dashboard/historique', labelKey: 'nav.history', icon: '◷' },
  { to: '/dashboard/rapports', labelKey: 'nav.reports', icon: '▣' },
  { to: '/dashboard/create-user', labelKey: 'nav.createUser', icon: '◇' },
  { to: '/dashboard/drivers', labelKey: 'nav.drivers', icon: '⬡' },
  { to: '/dashboard/technicians', labelKey: 'nav.technicians', icon: '⬢' },
  { to: '/dashboard/sites', labelKey: 'nav.sites', icon: '⌖' },
  { to: '/dashboard/containers', labelKey: 'nav.containers', icon: '▦' },
  { to: '/dashboard/settings', labelKey: 'nav.settings', icon: '⚙' },
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
    <aside className="admin-sidebar">
      <div className="admin-sidebar__brand">
        <BrandLogo size={40} subtitle={t('app.admin')} />
      </div>

      <nav className="flex-1 py-4 px-3">
        {links.map((link, i) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/dashboard'}
            className={({ isActive }) =>
              `admin-nav-link ${isActive ? 'admin-nav-link--active' : ''}`
            }
            style={{ animationDelay: `${0.05 * i}s` }}
          >
            <span className="admin-nav-icon">{link.icon}</span>
            {t(link.labelKey)}
          </NavLink>
        ))}
      </nav>

      <button type="button" onClick={logout} className="admin-sidebar__logout">
        {t('nav.logout')}
      </button>
    </aside>
  )
}
