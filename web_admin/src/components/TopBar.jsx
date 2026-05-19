import logo from '../assets/logo.js'

export default function TopBar({ title }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px', height: 58,
      background: '#080d1a',
      borderBottom: '0.5px solid rgba(59,130,246,.2)',
    }}>
      {/* Titre de la page */}
      <p style={{ fontSize: 14, fontWeight: 500, color: '#e2e8f0' }}>{title}</p>

      {/* Droite : logo + nom + avatar admin */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <img
            src={`data:image/png;base64,${logo}`}
            alt="ErcTrac"
            style={{ width: 30, height: 30, borderRadius: 7, objectFit: 'cover' }}
          />
          <span style={{ fontSize: 13, fontWeight: 500, color: '#e2e8f0' }}>
            Erc<span style={{ color: '#3b82f6' }}>Trac</span>
          </span>
        </div>

        <div style={{ width: 1, height: 20, background: 'rgba(59,130,246,.2)' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: 'rgba(148,163,184,.4)' }}>Admin</span>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: '#1d4ed8',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 500, color: '#e2e8f0'
          }}>
            A
          </div>
        </div>
      </div>
    </div>
  )
}