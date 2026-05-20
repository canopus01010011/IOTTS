import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import Sidebar from '../components/Sidebar'
import TopBar  from '../components/TopBar'

const avatarColors = ['#0f6e56', '#534ab7', '#712b13', '#854f0b', '#0c447c', '#1d4ed8']

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
    const id = m.technician_id || m.technician?.id
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

function enrichTechnician(user, missionStats) {
  const stats = missionStats[user.id]
  return {
    ...user,
    statusLabel: deriveStatus(stats),
    totalMissions: stats?.total ?? 0,
    completedMissions: stats?.completed ?? 0,
  }
}

export default function Technicians() {
  const [technicians, setTechnicians]   = useState([])
  const [search, setSearch]             = useState('')
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState('')
  const [totalItems, setTotalItems]     = useState(0)

  const loadTechnicians = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = { role: 'technician', limit: 100 }
      if (search.trim()) params.search = search.trim()

      const usersRes = await api.get('/users', { params })
      const users = usersRes.data.users || []

      let missionStats = {}
      try {
        const missionsRes = await api.get('/missions', { params: { limit: 500 } })
        missionStats = buildMissionStats(missionsRes.data.missions || [])
      } catch {
        // Mission stats are optional; technicians still load from /users
      }

      setTechnicians(users.map((u) => enrichTechnician(u, missionStats)))
      setTotalItems(usersRes.data.totalItems ?? users.length)
    } catch (err) {
      setTechnicians([])
      setTotalItems(0)
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        'Impossible de charger les techniciens.',
      )
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => {
    const timer = setTimeout(loadTechnicians, search ? 300 : 0)
    return () => clearTimeout(timer)
  }, [loadTechnicians, search])

  const stats = {
    total: totalItems || technicians.length,
    dispo: technicians.filter((t) => t.statusLabel === 'Disponible').length,
    actifs: technicians.filter((t) => t.statusLabel === 'En mission').length,
    enAttente: technicians.filter((t) => t.statusLabel === 'En attente').length,
  }

  return (
    <div className="flex min-h-screen" style={{ background: '#0a0f1e' }}>
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopBar title="Techniciens" />
        <main className="flex-1 p-6">

          <div className="grid grid-cols-4 gap-3 mb-5">
            {[
              { label: 'Total techniciens', value: stats.total,      color: '#e2e8f0' },
              { label: 'Disponibles',        value: stats.dispo,      color: '#4ade80' },
              { label: 'En mission',         value: stats.actifs,     color: '#60a5fa' },
              { label: 'En attente',         value: stats.enAttente,  color: '#fbbf24' },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl p-4"
                style={{ background: '#111827', border: '0.5px solid rgba(34,197,94,.15)' }}
              >
                <p className="text-xl font-medium" style={{ color: s.color }}>{s.value}</p>
                <p className="text-xs mt-1" style={{ color: 'rgba(148,163,184,.5)' }}>{s.label}</p>
              </div>
            ))}
          </div>

          <div className="mb-4 flex items-center gap-3 flex-wrap">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par nom ou e-mail…"
              style={{
                background: '#0d1426',
                border: '0.5px solid rgba(34,197,94,.2)',
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
                background: '#0f6e56',
                color: '#e2e8f0',
                borderRadius: 7,
                padding: '8px 16px',
                fontSize: 13,
                fontWeight: 500,
                textDecoration: 'none',
              }}
            >
              + Ajouter un technicien
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
          ) : technicians.length === 0 ? (
            <p style={{ fontSize: 13, color: 'rgba(148,163,184,.5)' }}>
              Aucun technicien trouvé.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {technicians.map((t, i) => (
                <div
                  key={t.id}
                  className="rounded-xl p-5"
                  style={{ background: '#111827', border: '0.5px solid rgba(34,197,94,.15)' }}
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
                      {initials(t.full_name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: '#e2e8f0' }}>
                        {t.full_name}
                      </p>
                      <p className="text-xs truncate" style={{ color: 'rgba(148,163,184,.5)' }}>
                        {t.email}
                      </p>
                    </div>
                    <span
                      style={{
                        padding: '2px 10px',
                        borderRadius: 20,
                        fontSize: 11,
                        fontWeight: 500,
                        flexShrink: 0,
                        ...STATUS_STYLE[t.statusLabel],
                      }}
                    >
                      {t.statusLabel}
                    </span>
                  </div>

                  <div style={{ borderTop: '0.5px solid rgba(34,197,94,.1)', paddingTop: 12 }}>
                    <div className="flex justify-between gap-4">
                      <div>
                        <p style={{ fontSize: 10, color: 'rgba(148,163,184,.4)' }}>Téléphone</p>
                        <p style={{ fontSize: 12, color: '#cbd5e1', marginTop: 2 }}>
                          {t.phone || '—'}
                        </p>
                      </div>
                      <div>
                        <p style={{ fontSize: 10, color: 'rgba(148,163,184,.4)' }}>ID</p>
                        <p
                          style={{
                            fontSize: 11,
                            color: '#4ade80',
                            marginTop: 2,
                            fontFamily: 'monospace',
                          }}
                        >
                          {t.id}
                        </p>
                      </div>
                      <div className="text-right">
                        <p style={{ fontSize: 10, color: 'rgba(148,163,184,.4)' }}>
                          Missions (terminées / total)
                        </p>
                        <p style={{ fontSize: 18, fontWeight: 500, color: '#4ade80', marginTop: 2 }}>
                          {t.completedMissions}
                          <span style={{ fontSize: 12, color: 'rgba(148,163,184,.4)' }}>
                            {' '}/ {t.totalMissions}
                          </span>
                        </p>
                        <p style={{ fontSize: 11, color: '#4ade80', marginTop: 4 }}>
                          Score : {t.performance_score ?? 0} pts
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </main>
      </div>
    </div>
  )
}
