/** Ambient mesh + grid for admin and marketing pages */
export default function AnimatedBackground({ variant = 'admin' }) {
  return (
    <div className={`ambient-bg ambient-bg--${variant}`} aria-hidden="true">
      <div className="ambient-orb ambient-orb--1" />
      <div className="ambient-orb ambient-orb--2" />
      <div className="ambient-orb ambient-orb--3" />
      <div className="ambient-grid" />
    </div>
  )
}
