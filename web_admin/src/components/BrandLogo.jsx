import telcotrackLogo from '../assets/telcotrack-logo.png'

export default function BrandLogo({ size = 48, showText = true, subtitle }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: size < 40 ? 10 : 12 }}>
      <div
        className="brand-logo-glow"
        style={{
          width: size,
          height: size,
          borderRadius: size >= 48 ? 14 : 10,
          background: 'linear-gradient(145deg, rgba(30, 168, 212, 0.2), rgba(59, 130, 246, 0.08))',
          border: '1px solid rgba(30, 168, 212, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 32px rgba(30, 168, 212, 0.2)',
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
          <p
            style={{
              fontSize: size >= 48 ? 20 : 15,
              fontWeight: 800,
              color: '#f8fafc',
              lineHeight: 1.15,
              margin: 0,
              letterSpacing: '-0.02em',
            }}
          >
            Erc<span style={{ color: 'var(--accent-soft)' }}>Track</span>
          </p>
          {subtitle ? (
            <p style={{ fontSize: 11, color: 'rgba(139, 164, 190, 0.85)', marginTop: 3 }}>
              {subtitle}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
