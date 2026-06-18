import { useEffect, useState } from 'react'
import api from '../services/api'
import { formatEquipmentList, formatDateTime } from '../utils/missionFormat'
import DashboardLayout from '../components/DashboardLayout'
import StatCard from '../components/StatCard'
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

const TABLE_COLS = '.7fr 1.3fr 1fr 1.4fr .8fr .9fr'

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
    { label: t('dashboard.totalMissions'), value: stats.totalMissions, color: '#f8fafc', icon: '◉' },
    { label: t('dashboard.inProgress'), value: stats.inProgressMissions, color: '#60a5fa', icon: '◎' },
    { label: t('dashboard.completed'), value: stats.completedMissions, color: '#4ade80', icon: '✓' },
    { label: t('dashboard.pending'), value: stats.pendingMissions, color: '#fbbf24', icon: '◷' },
    {
      label: t('nav.technicians'),
      value: stats.totalTechnicians,
      color: '#93c5fd',
      to: '/dashboard/technicians',
      icon: '⬢',
    },
    {
      label: t('nav.drivers'),
      value: stats.totalDrivers,
      color: '#94a3b8',
      to: '/dashboard/drivers',
      icon: '⬡',
    },
  ]

  const headers = [
    t('dashboard.ref'),
    t('dashboard.site'),
    t('dashboard.driver'),
    t('dashboard.equipment'),
    t('dashboard.date'),
    t('dashboard.status'),
  ]

  return (
    <DashboardLayout title={t('dashboard.title')}>
      <div className="stat-grid stagger-children">
        {cards.map((card, i) => (
          <StatCard key={card.label} {...card} delay={i * 60} />
        ))}
      </div>

      <div className="admin-card admin-table">
        <div
          style={{
            padding: '18px 22px',
            borderBottom: '1px solid rgba(59,130,246,.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <p className="admin-section-title">{t('dashboard.recentMissions')}</p>
          <span className="admin-subtle">{t('dashboard.lastFive')}</span>
        </div>

        <div className="admin-table-header" style={{ gridTemplateColumns: TABLE_COLS }}>
          {headers.map((h) => (
            <span key={h}>{h}</span>
          ))}
        </div>

        {missions.length === 0 ? (
          <p className="admin-subtle" style={{ padding: 32, textAlign: 'center' }}>
            {t('dashboard.noRecent')}
          </p>
        ) : (
          missions.map((mission, i) => (
            <div
              key={mission.id}
              className="admin-table-row"
              style={{
                gridTemplateColumns: TABLE_COLS,
                animationDelay: `${0.25 + i * 0.05}s`,
              }}
            >
              <span style={{ color: '#60a5fa', fontWeight: 800 }}>{mission.ref}</span>
              <span>{mission.site}</span>
              <span style={{ color: 'rgba(148,163,184,.78)' }}>{mission.driver}</span>
              <span style={{ color: 'rgba(148,163,184,.64)', fontSize: 12 }}>{mission.equip}</span>
              <span style={{ color: 'rgba(148,163,184,.55)', fontSize: 12 }}>{mission.date}</span>
              <span className="status-pill" style={badgeStyle[mission.statut] || {}}>
                <span className="status-dot" />
                {mission.statut}
              </span>
            </div>
          ))
        )}
      </div>
    </DashboardLayout>
  )
}
