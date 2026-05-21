import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { formatEquipmentList, formatDateTime } from '../utils/missionFormat'
import Sidebar from '../components/Sidebar'
import TopBar from '../components/TopBar'
import { useLanguage } from '../i18n.jsx'

const badgeStyle = {
  'En cours': { background: 'rgba(59,130,246,.14)', color: '#60a5fa' },
  'En attente': { background: 'rgba(234,179,8,.12)', color: '#fbbf24' },
  Incident: { background: 'rgba(239,68,68,.12)', color: '#f87171' },
  Annule: { background: 'rgba(148,163,184,.12)', color: '#94a3b8' },
  Termine: { background: 'rgba(34,197,94,.12)', color: '#4ade80' },
}

const emptyStats = {
  totalMissions: 0,
  inProgressMissions: 0,
  completedMissions: 0,
  pendingMissions: 0,
  totalTechnicians: 0,
  totalDrivers: 0,
}

const statusMap = {
  pending: 'En attente',
  'in-progress': 'En cours',
  completed: 'Termine',
}

const formatMission = (mission) => ({
  id: mission.id,
  ref: mission.id,
  site: mission.Site?.name || mission.site_id || 'N/A',
  driver: mission.driver?.full_name || 'N/A',
  equip: formatEquipmentList(mission.equipment_list),
  date: formatDateTime(mission.scheduled_start_date),
  statut: statusMap[mission.status] || mission.status,
})

export default function Dashboard() {
  const { t } = useLanguage()
  const [stats, setStats] = useState(emptyStats)
  const [missions, setMissions] = useState([])

  useEffect(() => {
    api.get('/reports/stats/dashboard')
      .then((r) => setStats(r.data.data || r.data || emptyStats))
      .catch(() => setStats(emptyStats))

    api.get('/missions?limit=5')
      .then((r) => setMissions((r.data.missions || []).map(formatMission)))
      .catch(() => setMissions([]))
  }, [])

  const cards = [
    { label: t('dashboard.totalMissions'), value: stats.totalMissions, color: '#f8fafc' },
    { label: t('dashboard.inProgress'), value: stats.inProgressMissions, color: '#60a5fa' },
    { label: t('dashboard.completed'), value: stats.completedMissions, color: '#4ade80' },
    { label: t('dashboard.pending'), value: stats.pendingMissions, color: '#fbbf24' },
    { label: t('nav.technicians'), value: stats.totalTechnicians, color: '#93c5fd', to: '/dashboard/technicians' },
    { label: t('nav.drivers'), value: stats.totalDrivers, color: '#94a3b8', to: '/dashboard/drivers' },
  ]

  return (
    <div className="flex min-h-screen admin-page">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopBar title={t('dashboard.title')} />
        <main className="flex-1 admin-main">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
              gap: 12,
              marginBottom: 22,
            }}
          >
            {cards.map((card) => {
              const content = (
                <>
                  <p style={{ fontSize: 28, fontWeight: 800, color: card.color, lineHeight: 1 }}>
                    {card.value}
                  </p>
                  <p className="admin-subtle" style={{ marginTop: 8 }}>{card.label}</p>
                </>
              )
              const style = {
                padding: '18px 20px',
                textDecoration: 'none',
                display: 'block',
                cursor: card.to ? 'pointer' : 'default',
              }
              return card.to ? (
                <Link key={card.label} to={card.to} className="admin-card admin-card-hover" style={style}>
                  {content}
                </Link>
              ) : (
                <div key={card.label} className="admin-card" style={style}>
                  {content}
                </div>
              )
            })}
          </div>

          <div className="admin-card admin-table">
            <div
              style={{
                padding: '15px 20px',
                borderBottom: '1px solid rgba(59,130,246,.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <p className="admin-section-title">{t('dashboard.recentMissions')}</p>
              <span className="admin-subtle">{t('dashboard.lastFive')}</span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '.7fr 1.3fr 1fr 1.4fr .8fr .9fr',
                padding: '9px 20px',
                fontSize: 10,
                color: 'rgba(99,179,255,.54)',
                textTransform: 'uppercase',
                borderBottom: '1px solid rgba(59,130,246,.08)',
              }}
            >
              {[t('dashboard.ref'), t('dashboard.site'), t('dashboard.driver'), t('dashboard.equipment'), t('dashboard.date'), t('dashboard.status')].map((h) => (
                <span key={h}>{h}</span>
              ))}
            </div>

            {missions.length === 0 ? (
              <p className="admin-subtle" style={{ padding: 24, textAlign: 'center' }}>
                {t('dashboard.noRecent')}
              </p>
            ) : (
              missions.map((mission) => (
                <div
                  key={mission.id}
                  className="admin-table-row"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '.7fr 1.3fr 1fr 1.4fr .8fr .9fr',
                    padding: '12px 20px',
                    fontSize: 12,
                    color: '#cbd5e1',
                    borderBottom: '1px solid rgba(255,255,255,.04)',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ color: '#60a5fa', fontWeight: 800 }}>{mission.ref}</span>
                  <span>{mission.site}</span>
                  <span style={{ color: 'rgba(148,163,184,.78)' }}>{mission.driver}</span>
                  <span style={{ color: 'rgba(148,163,184,.64)', fontSize: 11 }}>{mission.equip}</span>
                  <span style={{ color: 'rgba(148,163,184,.55)', fontSize: 11 }}>{mission.date}</span>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '3px 9px',
                      borderRadius: 999,
                      fontSize: 10,
                      fontWeight: 800,
                      ...(badgeStyle[mission.statut] || {}),
                    }}
                  >
                    <span className="status-dot" />
                    {mission.statut}
                  </span>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
