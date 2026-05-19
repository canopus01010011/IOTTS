import { useState, useEffect } from 'react'
import axios from 'axios'
import Sidebar from '../components/Sidebar'
import TopBar  from '../components/TopBar'

const badgeStyle = {
  'En cours':   { background: 'rgba(59,130,246,.12)', color: '#60a5fa' },
  'En attente': { background: 'rgba(234,179,8,.1)',   color: '#fbbf24' },
  'Incident':   { background: 'rgba(239,68,68,.12)',  color: '#f87171' },
  'Annulé':     { background: 'rgba(148,163,184,.1)', color: '#94a3b8' },
  'Terminé':    { background: 'rgba(34,197,94,.1)',   color: '#4ade80' },
}

const MOCK_STATS = {
  totalMissions: 142,
  enCours:       38,
  incidents:     7,
  rapportsAttente: 16,
  drivers:       5,
  terminees:     85,
}

const MOCK_RECENTES = [
  { id:1, ref:'MSN-091', site:'BTS Bab Ezzouar',  driver:'K. Benali',  equip:'Fibre + Antenne',  date:'12/04/2024', statut:'En cours'   },
  { id:2, ref:'MSN-090', site:'Pylône Kouba',      driver:'A. Hamid',   equip:'Câblage réseau',   date:'11/04/2024', statut:'En cours'   },
  { id:3, ref:'MSN-089', site:'Site Rouiba',       driver:'M. Saadi',   equip:'Groupe élec.',     date:'10/04/2024', statut:'Incident'   },
  { id:4, ref:'MSN-088', site:'Dar El Beida',      driver:'O. Meziane', equip:'Clim. site',       date:'09/04/2024', statut:'En attente' },
  { id:5, ref:'MSN-087', site:'Hussein Dey',       driver:'K. Benali',  equip:'Fibre optique',    date:'08/04/2024', statut:'Terminé'    },
]

export default function Dashboard() {
  const [stats,    setStats]    = useState(MOCK_STATS)
  const [missions, setMissions] = useState([])

  useEffect(() => {
    axios.get('/api/dashboard/stats', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(r => setStats(r.data))
      .catch(() => setStats(MOCK_STATS))

    axios.get('/api/missions?limit=5', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(r => setMissions(r.data))
      .catch(() => setMissions(MOCK_RECENTES))
  }, [])

  const cards = [
    { label: 'Missions totales',      value: stats.totalMissions,     color: '#e2e8f0' },
    { label: 'En cours',              value: stats.enCours,           color: '#60a5fa' },
    { label: 'Terminées',             value: stats.terminees,         color: '#4ade80' },
    { label: 'Incidents',             value: stats.incidents,         color: '#f87171' },
    { label: 'Rapports en attente',   value: stats.rapportsAttente,   color: '#fbbf24' },
    { label: 'Drivers actifs',        value: stats.drivers,           color: '#a78bfa' },
  ]

  return (
    <div className="flex min-h-screen" style={{ background: '#0a0f1e' }}>
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopBar title="Vue d'ensemble" />
        <main className="flex-1 p-6">

          {/* Stat cards */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 12, marginBottom: 24
          }}>
            {cards.map(c => (
              <div key={c.label} style={{
                background: '#111827',
                border: '0.5px solid rgba(59,130,246,.15)',
                borderRadius: 12, padding: '18px 20px'
              }}>
                <p style={{ fontSize: 26, fontWeight: 500, color: c.color }}>{c.value}</p>
                <p style={{ fontSize: 12, color: 'rgba(148,163,184,.5)', marginTop: 4 }}>{c.label}</p>
              </div>
            ))}
          </div>

          {/* Missions récentes */}
          <div style={{
            background: '#111827',
            border: '0.5px solid rgba(59,130,246,.15)',
            borderRadius: 12, overflow: 'hidden'
          }}>
            <div style={{
              padding: '14px 20px',
              borderBottom: '0.5px solid rgba(59,130,246,.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
              <p style={{ fontSize: 14, fontWeight: 500, color: '#e2e8f0' }}>
                Missions récentes
              </p>
              <span style={{ fontSize: 11, color: 'rgba(148,163,184,.4)' }}>
                5 dernières
              </span>
            </div>

            {/* En-tête table */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '.7fr 1.3fr 1fr 1.4fr .8fr .9fr',
              padding: '8px 20px', fontSize: 10,
              color: 'rgba(99,179,255,.4)',
              letterSpacing: '.05em', textTransform: 'uppercase',
              borderBottom: '0.5px solid rgba(59,130,246,.08)'
            }}>
              {['Réf.', 'Site', 'Driver', 'Équipement', 'Date', 'Statut'].map(h => (
                <span key={h}>{h}</span>
              ))}
            </div>

            {/* Lignes */}
            {missions.map(m => (
              <div key={m.id} style={{
                display: 'grid',
                gridTemplateColumns: '.7fr 1.3fr 1fr 1.4fr .8fr .9fr',
                padding: '11px 20px', fontSize: 12, color: '#cbd5e1',
                borderBottom: '0.5px solid rgba(255,255,255,.03)',
                alignItems: 'center'
              }}>
                <span style={{ color: '#60a5fa', fontWeight: 500 }}>{m.ref}</span>
                <span>{m.site}</span>
                <span style={{ color: 'rgba(148,163,184,.7)' }}>{m.driver}</span>
                <span style={{ color: 'rgba(148,163,184,.5)', fontSize: 11 }}>{m.equip}</span>
                <span style={{ color: 'rgba(148,163,184,.45)', fontSize: 11 }}>{m.date}</span>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  padding: '2px 8px', borderRadius: 20,
                  fontSize: 10, fontWeight: 500,
                  ...badgeStyle[m.statut]
                }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor' }} />
                  {m.statut}
                </span>
              </div>
            ))}
          </div>

        </main>
      </div>
    </div>
  )
}
