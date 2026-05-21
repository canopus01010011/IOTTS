import { LANGUAGES, useLanguage } from '../i18n.jsx'

export default function LanguageSelect({ compact = false }) {
  const { language, setLanguage, t } = useLanguage()

  return (
    <label
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        color: 'rgba(148,163,184,.72)',
        fontSize: 12,
      }}
    >
      {!compact && <span>{t('common.language')}</span>}
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        style={{
          background: 'rgba(15,23,42,.82)',
          border: '1px solid rgba(96,165,250,.2)',
          borderRadius: 8,
          color: '#f8fafc',
          height: 34,
          padding: '0 10px',
          outline: 'none',
        }}
      >
        {LANGUAGES.map((item) => (
          <option key={item.code} value={item.code}>
            {item.nativeLabel}
          </option>
        ))}
      </select>
    </label>
  )
}
