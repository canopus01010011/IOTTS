import BrandLogo from './BrandLogo.jsx'
import LanguageSelect from './LanguageSelect.jsx'
import { useLanguage } from '../i18n.jsx'

export default function TopBar({ title }) {
  const { t } = useLanguage()

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        height: 64,
        background: 'rgba(8,13,26,.88)',
        borderBottom: '1px solid var(--border)',
        backdropFilter: 'blur(14px)',
      }}
    >
      <div>
        <p style={{ fontSize: 11, color: 'rgba(148,163,184,.58)', marginBottom: 3 }}>
          {t('app.control')}
        </p>
        <h1 style={{ fontSize: 17, fontWeight: 800, color: '#f8fafc', margin: 0 }}>
          {title}
        </h1>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <LanguageSelect compact />

        <div
          style={{
            padding: '4px 8px',
            background: 'rgba(15,23,42,.7)',
            border: '1px solid var(--border)',
            borderRadius: 10,
          }}
        >
          <BrandLogo size={32} showText />
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 9,
            padding: '6px 8px 6px 11px',
            background: 'rgba(34,197,94,.08)',
            border: '1px solid rgba(34,197,94,.18)',
            borderRadius: 8,
          }}
        >
          <span style={{ fontSize: 12, color: 'rgba(248,250,252,.76)' }}>{t('common.admin')}</span>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: '50%',
              background: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: 800,
              color: '#fff',
            }}
          >
            A
          </div>
        </div>
      </div>
    </div>
  )
}
