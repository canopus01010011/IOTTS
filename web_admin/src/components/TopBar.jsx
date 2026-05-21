import logo from '../assets/logo.js'
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
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '7px 10px',
            background: 'rgba(15,23,42,.7)',
            border: '1px solid rgba(96,165,250,.16)',
            borderRadius: 8,
          }}
        >
          <img
            src={`data:image/png;base64,${logo}`}
            alt="ErcTrac"
            style={{ width: 28, height: 28, borderRadius: 7, objectFit: 'cover' }}
          />
          <span style={{ fontSize: 13, fontWeight: 800, color: '#f8fafc' }}>
            Erc<span style={{ color: '#3b82f6' }}>Trac</span>
          </span>
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
              background: '#1d4ed8',
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
