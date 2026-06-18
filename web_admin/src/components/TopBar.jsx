import BrandLogo from './BrandLogo.jsx'
import LanguageSelect from './LanguageSelect.jsx'
import { useLanguage } from '../i18n.jsx'

export default function TopBar({ title }) {
  const { t } = useLanguage()

  return (
    <header className="admin-topbar">
      <div>
        <p className="admin-topbar__breadcrumb">{t('app.control')}</p>
        <h1 className="admin-topbar__title">{title}</h1>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <span className="admin-badge-live">Live</span>
        <LanguageSelect compact />
        <div
          style={{
            padding: '4px 10px',
            background: 'rgba(15,23,42,.6)',
            border: '1px solid var(--border)',
            borderRadius: 12,
          }}
        >
          <BrandLogo size={32} showText />
        </div>
        <div
          className="admin-card-hover"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '8px 12px 8px 14px',
            background: 'rgba(30, 168, 212, 0.08)',
            border: '1px solid rgba(30, 168, 212, 0.22)',
            borderRadius: 12,
          }}
        >
          <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(248,250,252,.85)' }}>
            {t('common.admin')}
          </span>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #1ea8d4, #38bdf8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 13,
              fontWeight: 800,
              color: '#fff',
              boxShadow: '0 4px 16px rgba(30, 168, 212, 0.4)',
            }}
          >
            A
          </div>
        </div>
      </div>
    </header>
  )
}
