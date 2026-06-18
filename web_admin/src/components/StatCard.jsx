import { Link } from 'react-router-dom'

export default function StatCard({ label, value, color = '#f8fafc', to, delay = 0, icon }) {
  const content = (
    <>
      <div className="stat-card__glow" style={{ background: `radial-gradient(circle, ${color}33 0%, transparent 70%)` }} />
      {icon ? <span className="stat-card__icon">{icon}</span> : null}
      <p className="stat-card__value" style={{ color }}>{value}</p>
      <p className="stat-card__label">{label}</p>
    </>
  )

  const className = `stat-card admin-card-hover animate-fade-in-up ${to ? 'stat-card--link' : ''}`
  const style = { animationDelay: `${delay}ms` }

  if (to) {
    return (
      <Link to={to} className={className} style={style}>
        {content}
      </Link>
    )
  }

  return (
    <div className={className} style={style}>
      {content}
    </div>
  )
}
