import { useNavigate } from 'react-router-dom'
import AnimatedBackground from '../components/AnimatedBackground.jsx'
import BrandLogo from '../components/BrandLogo.jsx'

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="admin-page min-h-screen flex flex-col">
      <AnimatedBackground variant="landing" />

      <nav className="landing-nav">
        <BrandLogo size={44} subtitle="Télécom Admin" />
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="admin-primary-btn"
          style={{ padding: '10px 24px' }}
        >
          Connexion
        </button>
      </nav>

      <section className="landing-hero">
        <span className="landing-badge">PLATEFORME DE SUIVI MISSIONS TÉLÉCOM</span>

        <h1 className="landing-title">
          Gérez vos missions terrain
          <br />
          en temps réel
        </h1>

        <p className="landing-subtitle">
          Créez, suivez et archivez vos missions d&apos;équipements télécom.
          Antennes, fibre, câblage — tout centralisé dans un espace admin premium.
        </p>

        <div className="landing-cta">
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="admin-primary-btn"
            style={{ padding: '14px 32px', fontSize: 15 }}
          >
            Accéder au dashboard
          </button>
          <button
            type="button"
            className="admin-secondary-btn"
            style={{ padding: '14px 32px', fontSize: 15 }}
            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
          >
            En savoir plus
          </button>
        </div>

        <div id="features" className="landing-features">
          {[
            {
              icon: '📡',
              title: 'Équipements télécom',
              desc: 'Antenne, fibre, groupe électrogène, câblage réseau et plus',
            },
            {
              icon: '🚗',
              title: 'Suivi drivers',
              desc: 'Assignation et suivi de chaque conducteur en temps réel sur carte IoT',
            },
            {
              icon: '📋',
              title: 'Rapports & historique',
              desc: 'Rapports techniciens avec validation admin intégrée',
            },
          ].map((f) => (
            <div key={f.title} className="admin-card admin-card-hover landing-feature-card">
              <span className="landing-feature-icon">{f.icon}</span>
              <p className="landing-feature-title">{f.title}</p>
              <p className="landing-feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer
        style={{
          position: 'relative',
          zIndex: 2,
          textAlign: 'center',
          padding: '20px',
          borderTop: '1px solid var(--border)',
          fontSize: 12,
          color: 'rgba(148,163,184,.4)',
        }}
      >
        © 2026 ErcTrack — Plateforme télécom
      </footer>
    </div>
  )
}
