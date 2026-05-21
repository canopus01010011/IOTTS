import telcotrackLogo from '../assets/telcotrack-logo.png'

export default function BrandLogo({ size = 48, showText = true, subtitle }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: size < 40 ? 10 : 12 }}>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: size >= 48 ? 14 : 10,
          background: 'rgba(30, 168, 212, 0.12)',
          border: '1px solid rgba(30, 168, 212, 0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(30, 168, 212, 0.15)',
          overflow: 'hidden',
        }}
      >
        <img
          src={telcotrackLogo}
          alt="TelcoTrack"
          style={{ width: size * 0.72, height: size * 0.72, objectFit: 'contain' }}
        />
      </div>
      {showText ? (
        <div>
          <p style={{ fontSize: size >= 48 ? 20 : 15, fontWeight: 800, color: '#f8fafc', lineHeight: 1.15, margin: 0 }}>
            Erc<span style={{ color: 'var(--accent)' }}>Track</span>
          </p>
          {subtitle ? (
            <p style={{ fontSize: 11, color: 'rgba(139, 164, 190, 0.85)', marginTop: 2 }}>{subtitle}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
