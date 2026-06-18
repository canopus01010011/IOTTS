import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import DashboardLayout from '../components/DashboardLayout'
import StatCard from '../components/StatCard'

const avatarColors = ['#1d4ed8', '#0f6e56', '#712b13', '#534ab7', '#854f0b', '#0c447c']

const STATUS_STYLE = {
  'En mission':   { background: 'rgba(59,130,246,.12)', color: '#60a5fa' },
  'En attente':   { background: 'rgba(234,179,8,.1)',   color: '#fbbf24' },
  'Disponible':   { background: 'rgba(34,197,94,.1)',   color: '#4ade80' },
}

function initials(name) {
  if (!name) return '—'
  return name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function buildMissionStats(missions) {
  const map = {}
  for (const m of missions) {
    const id = m.driver_id || m.driver?.id
    if (!id) continue
    if (!map[id]) {
      map[id] = { total: 0, completed: 0, pending: 0, inProgress: false }
    }
    map[id].total += 1
    if (m.status === 'completed') map[id].completed += 1
    if (m.status === 'pending') map[id].pending += 1
    if (m.status === 'in-progress') map[id].inProgress = true
  }
  return map
}

function deriveStatus(stats) {
  if (!stats) return 'Disponible'
  if (stats.inProgress) return 'En mission'
  if (stats.pending > 0) return 'En attente'
  return 'Disponible'
}

function enrichDriver(user, missionStats) {
  const stats = missionStats[user.id]
  return {
    ...user,
    statusLabel: deriveStatus(stats),
    totalMissions: stats?.total ?? 0,
    completedMissions: stats?.completed ?? 0,
  }
}

export default function Drivers() {
  const [drivers, setDrivers]       = useState([])
  const [search, setSearch]         = useState('')
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')
  const [totalItems, setTotalItems] = useState(0)

  const loadDrivers = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = { role: 'driver', limit: 100 }
      if (search.trim()) params.search = search.trim()

      const usersRes = await api.get('/users', { params })
      const users = usersRes.data.users || []

      let missionStats = {}
      try {
        const missionsRes = await api.get('/missions', { params: { limit: 500 } })
        missionStats = buildMissionStats(missionsRes.data.missions || [])
      } catch {
        // Mission stats are optional; drivers still load from /users
      }

      setDrivers(users.map((u) => enrichDriver(u, missionStats)))
      setTotalItems(usersRes.data.totalItems ?? users.length)
    } catch (err) {
      setDrivers([])
      setTotalItems(0)
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        'Impossible de charger les conducteurs.',
      )
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => {
    const timer = setTimeout(loadDrivers, search ? 300 : 0)
    return () => clearTimeout(timer)
  }, [loadDrivers, search])

  const stats = {
    total: totalItems || drivers.length,
    dispo: drivers.filter((d) => d.statusLabel === 'Disponible').length,
    actifs: drivers.filter((d) => d.statusLabel === 'En mission').length,
    enAttente: drivers.filter((d) => d.statusLabel === 'En attente').length,
  }

  return (
    <DashboardLayout title="Conducteurs">
          <div className="stat-grid stagger-children" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
            {[
              { label: 'Total conducteurs', value: stats.total, color: '#e2e8f0', icon: '⬡' },
              { label: 'Disponibles', value: stats.dispo, color: '#4ade80', icon: '✓' },
              { label: 'En mission', value: stats.actifs, color: '#60a5fa', icon: '◎' },
              { label: 'En attente', value: stats.enAttente, color: '#fbbf24', icon: '◷' },
            ].map((s, i) => (
              <StatCard key={s.label} {...s} delay={i * 50} />
            ))}
          </div>

          <div className="mb-4 flex items-center gap-3 flex-wrap">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par nom ou e-mail…"
              style={{
                background: '#0d1426',
                border: '0.5px solid rgba(59,130,246,.2)',
                borderRadius: 7,
                padding: '8px 14px',
                fontSize: 13,
                color: '#e2e8f0',
                outline: 'none',
                width: 280,
              }}
            />
            <Link
              to="/dashboard/create-user"
              style={{
                background: '#1d4ed8',
                color: '#e2e8f0',
                borderRadius: 7,
                padding: '8px 16px',
                fontSize: 13,
                fontWeight: 500,
                textDecoration: 'none',
              }}
            >
              + Ajouter un conducteur
            </Link>
          </div>

          {error && (
            <div
              className="mb-4 px-4 py-3 rounded-lg text-sm"
              style={{
                background: 'rgba(239,68,68,.1)',
                color: '#f87171',
                border: '0.5px solid rgba(239,68,68,.2)',
              }}
            >
              {error}
            </div>
          )}

          {loading ? (
            <p style={{ fontSize: 13, color: 'rgba(148,163,184,.5)' }}>Chargement…</p>
          ) : drivers.length === 0 ? (
            <p style={{ fontSize: 13, color: 'rgba(148,163,184,.5)' }}>
              Aucun conducteur trouvé.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {drivers.map((d, i) => (
                <div
                  key={d.id}
                  className="rounded-xl p-5"
                  style={{ background: '#111827', border: '0.5px solid rgba(59,130,246,.15)' }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        background: avatarColors[i % avatarColors.length],
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 14,
                        fontWeight: 500,
                        color: '#e2e8f0',
                        flexShrink: 0,
                      }}
                    >
                      {initials(d.full_name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: '#e2e8f0' }}>
                        {d.full_name}
                      </p>
                      <p className="text-xs truncate" style={{ color: 'rgba(148,163,184,.5)' }}>
                        {d.email}
                      </p>
                    </div>
                    <span
                      style={{
                        padding: '2px 10px',
                        borderRadius: 20,
                        fontSize: 11,
                        fontWeight: 500,
                        flexShrink: 0,
                        ...STATUS_STYLE[d.statusLabel],
                      }}
                    >
                      {d.statusLabel}
                    </span>
                  </div>

                  <div style={{ borderTop: '0.5px solid rgba(59,130,246,.1)', paddingTop: 12 }}>
                    <div className="flex justify-between gap-4">
                      <div>
                        <p style={{ fontSize: 10, color: 'rgba(148,163,184,.4)' }}>Téléphone</p>
                        <p style={{ fontSize: 12, color: '#cbd5e1', marginTop: 2 }}>
                          {d.phone || '—'}
                        </p>
                      </div>
                      <div>
                        <p style={{ fontSize: 10, color: 'rgba(148,163,184,.4)' }}>ID</p>
                        <p
                          style={{
                            fontSize: 11,
                            color: '#60a5fa',
                            marginTop: 2,
                            fontFamily: 'monospace',
                          }}
                        >
                          {d.id}
                        </p>
                      </div>
                      <div className="text-right">
                        <p style={{ fontSize: 10, color: 'rgba(148,163,184,.4)' }}>
                          Missions (terminées / total)
                        </p>
                        <p style={{ fontSize: 18, fontWeight: 500, color: '#60a5fa', marginTop: 2 }}>
                          {d.completedMissions}
                          <span style={{ fontSize: 12, color: 'rgba(148,163,184,.4)' }}>
                            {' '}/ {d.totalMissions}
                          </span>
                        </p>
                        <p style={{ fontSize: 11, color: '#4ade80', marginTop: 4 }}>
                          Score : {d.performance_score ?? 0} pts
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

    </DashboardLayout>
  )
}
