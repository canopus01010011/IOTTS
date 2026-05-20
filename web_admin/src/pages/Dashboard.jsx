import { useState, useEffect } from 'react'
import api from '../services/api'
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
  totalMissions: 0,
  inProgressMissions: 0,
  completedMissions: 0,
  pendingMissions: 0,
  totalTechnicians: 0,
  totalDrivers: 0,
}

const MOCK_RECENTES = []

const statusMap = {
  pending: 'En attente',
  'in-progress': 'En cours',
  completed: 'Terminé',
}

const formatMission = (m) => ({
  id: m.id,
  ref: m.id,
  site: m.Site?.name || m.site_id || 'N/A',
  driver: m.driver?.full_name || 'N/A',
  equip: Array.isArray(m.equipment_list)
    ? m.equipment_list.map(e => `${e.equipment_id} x${e.quantity}`).join(', ')
    : 'N/A',
  date: m.scheduled_start_date
    ? new Date(m.scheduled_start_date).toLocaleDateString('fr-FR')
    : 'N/A',
  statut: statusMap[m.status] || m.status,
})

export default function Dashboard() {
  const [stats,    setStats]    = useState(MOCK_STATS)
  const [missions, setMissions] = useState([])

  useEffect(() => {
    api.get('/reports/stats/dashboard')
      .then((r) => setStats(r.data.data || r.data || MOCK_STATS))
      .catch(() => setStats(MOCK_STATS))

    api.get('/missions?limit=5')
      .then((r) => setMissions((r.data.missions || []).map(formatMission)))
      .catch(() => setMissions(MOCK_RECENTES))
  }, [])

  const cards = [
    { label: 'Missions totales',      value: stats.totalMissions,     color: '#e2e8f0' },
    { label: 'En cours',              value: stats.inProgressMissions, color: '#60a5fa' },
    { label: 'Terminées',             value: stats.completedMissions,  color: '#4ade80' },
    { label: 'En attente',            value: stats.pendingMissions,    color: '#fbbf24' },
    { label: 'Techniciens',           value: stats.totalTechnicians,   color: '#a78bfa' },
    { label: 'Conducteurs',           value: stats.totalDrivers,       color: '#94a3b8' },
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
