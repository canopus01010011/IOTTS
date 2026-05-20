import { useState, useEffect, useCallback } from 'react'
import api from '../services/api'
import { formatEquipmentList, formatDateTime } from '../utils/missionFormat'
import Sidebar from '../components/Sidebar'
import TopBar  from '../components/TopBar'

const STATUS_LABEL = {
  pending: 'En attente',
  'in-progress': 'En cours',
  completed: 'Terminé',
}

const STATUS_API = {
  'Tous': '',
  'Terminé': 'completed',
  'En cours': 'in-progress',
  'En attente': 'pending',
}

const badgeStyle = {
  'En cours':   { background: 'rgba(59,130,246,.12)', color: '#60a5fa' },
  'En attente': { background: 'rgba(234,179,8,.1)',   color: '#fbbf24' },
  'Terminé':    { background: 'rgba(34,197,94,.1)',   color: '#4ade80' },
}

function formatMission(m) {
  const site = m.Site || {}
  return {
    id: m.id,
    ref: m.id,
    site: site.name || m.site_id || '—',
    driver: m.driver?.full_name || '—',
    technicien: m.technician?.full_name || '—',
    equip: formatEquipmentList(m.equipment_list),
    date: formatDateTime(m.scheduled_start_date),
    statut: STATUS_LABEL[m.status] || m.status || '—',
    statusValue: m.status,
  }
}

export default function Historique() {
  const [missions, setMissions]     = useState([])
  const [summary, setSummary]       = useState(null)
  const [filtre, setFiltre]         = useState('Tous')
  const [search, setSearch]         = useState('')
  const [page, setPage]             = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')
  const PER_PAGE = 6

  const loadMissions = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = {
        page,
        limit: PER_PAGE,
      }
      const statusParam = STATUS_API[filtre]
      if (statusParam) params.status = statusParam

      const res = await api.get('/reports/missions', { params })
      const data = res.data

      let rows = (data.missions || []).map(formatMission)

      if (search.trim()) {
        const q = search.trim().toLowerCase()
        rows = rows.filter(
          (m) =>
            m.site.toLowerCase().includes(q) ||
            m.driver.toLowerCase().includes(q) ||
            m.technicien.toLowerCase().includes(q) ||
            m.ref.toLowerCase().includes(q),
        )
      }

      setMissions(rows)
      setSummary(data.summary || null)
      setTotalPages(data.totalPages || 1)
    } catch (err) {
      setMissions([])
      setSummary(null)
      setError(
        err?.response?.data?.error ||
        'Impossible de charger l\'historique des missions.',
      )
    } finally {
      setLoading(false)
    }
  }, [page, filtre, search])

  useEffect(() => {
    loadMissions()
  }, [loadMissions])

  const filtres = ['Tous', 'Terminé', 'En cours', 'En attente']

  const stats = summary
    ? {
        total: summary.total ?? 0,
        termines: summary.completed ?? 0,
        enCours: summary.inProgress ?? 0,
        enAttente: summary.pending ?? 0,
      }
    : {
        total: 0,
        termines: 0,
        enCours: 0,
        enAttente: 0,
      }

  const inp = {
    background: '#0d1426',
    border: '0.5px solid rgba(59,130,246,.2)',
    borderRadius: 7,
    padding: '5px 12px',
    fontSize: 12,
    color: '#e2e8f0',
    outline: 'none',
    width: 220,
  }

  const handleExport = async () => {
    try {
      const params = {}
      const statusParam = STATUS_API[filtre]
      if (statusParam) params.status = statusParam

      const res = await api.get('/reports/export/excel', {
        params,
        responseType: 'blob',
      })

      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'missions-historique.xlsx')
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch {
      setError('Export Excel impossible.')
    }
  }

  return (
    <div className="flex min-h-screen" style={{ background: '#0a0f1e' }}>
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopBar title="Historique des missions" />
        <main className="flex-1 p-6">

          <div className="grid grid-cols-4 gap-3 mb-5">
            {[
              { label: 'Total missions', value: stats.total, color: '#e2e8f0' },
              { label: 'Terminées', value: stats.termines, color: '#4ade80' },
              { label: 'En cours', value: stats.enCours, color: '#60a5fa' },
              { label: 'En attente', value: stats.enAttente, color: '#fbbf24' },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl p-4"
                style={{
                  background: '#111827',
                  border: '0.5px solid rgba(59,130,246,.15)',
                }}
              >
                <p className="text-xl font-medium" style={{ color: s.color }}>
                  {s.value}
                </p>
                <p
                  className="text-xs mt-1"
                  style={{ color: 'rgba(148,163,184,.5)' }}
                >
                  {s.label}
                </p>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 flex-wrap mb-4">
            {filtres.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => {
                  setFiltre(f)
                  setPage(1)
                }}
                className="px-3 py-1 rounded-full text-xs"
                style={
                  filtre === f
                    ? {
                        background: 'rgba(59,130,246,.18)',
                        border: '0.5px solid #3b82f6',
                        color: '#60a5fa',
                      }
                    : {
                        background: 'rgba(59,130,246,.06)',
                        border: '0.5px solid rgba(59,130,246,.15)',
                        color: 'rgba(148,163,184,.6)',
                      }
                }
              >
                {f}
              </button>
            ))}

            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              placeholder="Rechercher…"
              style={{ ...inp, marginLeft: 'auto' }}
            />

            <button
              type="button"
              onClick={handleExport}
              className="px-3 py-1 rounded-lg text-xs"
              style={{
                background: 'rgba(34,197,94,.12)',
                border: '0.5px solid rgba(34,197,94,.3)',
                color: '#4ade80',
              }}
            >
              Export Excel
            </button>
          </div>

          {error && (
            <p
              className="text-sm mb-4 px-3 py-2 rounded-lg"
              style={{
                color: '#f87171',
                background: 'rgba(239,68,68,.08)',
                border: '0.5px solid rgba(239,68,68,.2)',
              }}
            >
              {error}
            </p>
          )}

          <div
            className="rounded-xl overflow-hidden"
            style={{
              background: '#111827',
              border: '0.5px solid rgba(59,130,246,.15)',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '.7fr 1.2fr 1fr 1fr 1.2fr .8fr .9fr',
                padding: '9px 16px',
                fontSize: 10,
                color: 'rgba(99,179,255,.45)',
                letterSpacing: '.05em',
                textTransform: 'uppercase',
                borderBottom: '0.5px solid rgba(59,130,246,.1)',
              }}
            >
              {['Réf.', 'Site', 'Driver', 'Technicien', 'Équipement', 'Date', 'Statut'].map(
                (h) => (
                  <span key={h}>{h}</span>
                ),
              )}
            </div>

            {loading ? (
              <p
                className="text-center py-10 text-sm"
                style={{ color: 'rgba(148,163,184,.5)' }}
              >
                Chargement…
              </p>
            ) : missions.length === 0 ? (
              <p
                className="text-center py-10 text-sm"
                style={{ color: 'rgba(148,163,184,.4)' }}
              >
                Aucune mission trouvée.
              </p>
            ) : (
              missions.map((m) => (
                <div
                  key={m.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '.7fr 1.2fr 1fr 1fr 1.2fr .8fr .9fr',
                    padding: '11px 16px',
                    fontSize: 12,
                    color: '#cbd5e1',
                    borderBottom: '0.5px solid rgba(255,255,255,.03)',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ color: '#60a5fa', fontWeight: 500 }}>{m.ref}</span>
                  <span>{m.site}</span>
                  <span style={{ color: 'rgba(148,163,184,.7)' }}>{m.driver}</span>
                  <span style={{ color: 'rgba(148,163,184,.7)' }}>{m.technicien}</span>
                  <span style={{ color: 'rgba(148,163,184,.5)', fontSize: 11 }}>
                    {m.equip}
                  </span>
                  <span style={{ color: 'rgba(148,163,184,.5)', fontSize: 11 }}>
                    {m.date}
                  </span>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '2px 8px',
                      borderRadius: 20,
                      fontSize: 10,
                      fontWeight: 500,
                      ...(badgeStyle[m.statut] || {}),
                    }}
                  >
                    <span
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: '50%',
                        background: 'currentColor',
                      }}
                    />
                    {m.statut}
                  </span>
                </div>
              ))
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 6,
                    fontSize: 12,
                    background: p === page ? '#1d4ed8' : 'rgba(59,130,246,.08)',
                    border:
                      p === page ? 'none' : '0.5px solid rgba(59,130,246,.15)',
                    color: p === page ? '#fff' : 'rgba(148,163,184,.6)',
                    cursor: 'pointer',
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
