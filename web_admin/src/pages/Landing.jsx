import { useNavigate } from 'react-router-dom'
import BrandLogo from '../components/BrandLogo.jsx'

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="admin-page min-h-screen flex flex-col">

      {/* Navbar */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 32px', height: 62,
        background: '#080d1a',
        borderBottom: '0.5px solid rgba(59,130,246,.2)'
      }}>
        <BrandLogo size={40} subtitle="Télécom Admin" />
        <button
          onClick={() => navigate('/login')}
          className="admin-primary-btn"
          style={{ padding: '9px 22px', fontSize: 13 }}
        >
          Connexion
        </button>
      </nav>

      {/* Hero */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '60px 24px'
      }}>
        <div style={{
          display: 'inline-block',
          background: 'rgba(59,130,246,.08)',
          border: '0.5px solid rgba(59,130,246,.25)',
          borderRadius: 20, padding: '4px 16px',
          fontSize: 11, color: '#60a5fa',
          letterSpacing: '.07em', marginBottom: 20
        }}>
          PLATEFORME DE SUIVI MISSIONS TÉLÉCOM
        </div>

        <h1 style={{
          fontSize: 38, fontWeight: 500, color: '#e2e8f0',
          lineHeight: 1.3, marginBottom: 14, maxWidth: 520
        }}>
          Gérez vos missions terrain<br />en temps réel
        </h1>

        <p style={{
          fontSize: 14, color: 'rgba(148,163,184,.65)',
          maxWidth: 420, lineHeight: 1.7, marginBottom: 32
        }}>
          Créez, suivez et archivez vos missions d'équipements télécom.
          Antennes, fibre, câblage — tout centralisé en un seul espace admin.
        </p>

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={() => navigate('/login')}
            className="admin-primary-btn"
            style={{ padding: '11px 28px', fontSize: 14 }}
          >
            Accéder au dashboard
          </button>
          <button className="admin-secondary-btn" style={{
            padding: '11px 28px', fontSize: 14,
          }}>
            En savoir plus
          </button>
        </div>

        {/* Feature cards */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 16, marginTop: 60, width: '100%', maxWidth: 680
        }}>
          {[
            { icon: '📡', title: 'Équipements télécom',   desc: 'Antenne, fibre, groupe électrogène, câblage réseau et plus' },
            { icon: '🚗', title: 'Suivi drivers',          desc: 'Assignation et suivi de chaque driver en temps réel' },
            { icon: '📋', title: 'Rapports & historique', desc: 'Rapports techniciens avec validation admin intégrée' },
          ].map(f => (
            <div key={f.title} style={{
              background: '#111827', border: '0.5px solid rgba(59,130,246,.15)',
              borderRadius: 12, padding: '20px 18px', textAlign: 'left'
            }}>
              <p style={{ fontSize: 24, marginBottom: 10 }}>{f.icon}</p>
              <p style={{ fontSize: 13, fontWeight: 500, color: '#e2e8f0', marginBottom: 6 }}>{f.title}</p>
              <p style={{ fontSize: 12, color: 'rgba(148,163,184,.5)', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{
        textAlign: 'center', padding: '16px',
        borderTop: '0.5px solid rgba(59,130,246,.08)',
        fontSize: 11, color: 'rgba(148,163,184,.3)'
      }}>
        © 2026 ErcTrac — Plateforme télécom
      </div>
    </div>
  )
}
