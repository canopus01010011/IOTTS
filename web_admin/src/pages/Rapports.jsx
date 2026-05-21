import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import Sidebar from '../components/Sidebar'
import TopBar  from '../components/TopBar'
import { useLanguage } from '../i18n.jsx'

const MISSION_STATUS_LABEL = {
  pending: 'En attente',
  'in-progress': 'En cours',
  completed: 'Validé',
}

const FILTER_STATUS = {
  Tous: '',
  'En attente': 'pending',
  'En cours': 'in-progress',
  Validé: 'completed',
}

const badgeStyle = {
  Validé:     { background: 'rgba(34,197,94,.1)',  color: '#4ade80' },
  'En attente': { background: 'rgba(234,179,8,.1)',  color: '#fbbf24' },
  'En cours': { background: 'rgba(59,130,246,.12)', color: '#60a5fa' },
}

const avatarColors = ['#1d4ed8', '#0f6e56', '#712b13', '#534ab7', '#854f0b']

function formatReportRow(report) {
  const mission = report.Mission || {}
  const site = mission.Site || {}
  const tech = mission.technician || {}

  const lat = site.latitude != null ? Number(site.latitude).toFixed(4) : null
  const lng = site.longitude != null ? Number(site.longitude).toFixed(4) : null
  const gps = lat != null && lng != null ? `${lat}, ${lng}` : '—'

  const missionStatus = mission.status || 'pending'

  return {
    id: mission.id || report.mission_id,
    reportId: report.id,
    reference: mission.id || report.mission_id,
    site: site.name || mission.site_id || '—',
    gps,
    date: report.report_date || mission.scheduled_start_date
      ? new Date(report.report_date || mission.scheduled_start_date).toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
      : '—',
    heureDebut: mission.start_date
      ? new Date(mission.start_date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      : '—',
    heureFin: mission.end_date
      ? new Date(mission.end_date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      : '—',
    statut: MISSION_STATUS_LABEL[missionStatus] || missionStatus,
    statusValue: missionStatus,
    hasPhotos: Array.isArray(report.delivery_photo_url) && report.delivery_photo_url.length > 0,
    technicien: {
      nom: tech.full_name || '—',
      telephone: tech.phone || '—',
    },
  }
}

export default function Rapports() {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [rapports, setRapports] = useState([])
  const [summary, setSummary] = useState(null)
  const [filtre, setFiltre] = useState('Tous')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const PER_PAGE = 10

  const loadReports = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = { page, limit: PER_PAGE }
      const status = FILTER_STATUS[filtre]
      if (status) params.status = status

      const res = await api.get('/reports/list', { params })
      const data = res.data

      let rows = (data.reports || []).map(formatReportRow)

      if (search.trim()) {
        const q = search.trim().toLowerCase()
        rows = rows.filter(
          (r) =>
            r.technicien.nom.toLowerCase().includes(q) ||
            r.reference.toLowerCase().includes(q) ||
            r.site.toLowerCase().includes(q),
        )
      }

      setRapports(rows)
      setSummary(data.summary || null)
      setTotalPages(data.totalPages || 1)
    } catch (err) {
      setRapports([])
      setSummary(null)
      setError(
        err?.response?.data?.error ||
        'Impossible de charger les rapports.',
      )
    } finally {
      setLoading(false)
    }
  }, [page, filtre, search])

  useEffect(() => {
    loadReports()
  }, [loadReports])

  const filtres = ['Tous', 'En attente', 'En cours', 'Validé']

  const stats = summary
    ? {
        total: summary.total ?? 0,
        valide: summary.validated ?? 0,
        attend: summary.awaiting ?? 0,
      }
    : { total: 0, valide: 0, attend: 0 }

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

  return (
    <div className="flex min-h-screen admin-page">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopBar title={t('reports.title')} />
        <main className="flex-1 admin-main">

          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { label: t('reports.submitted'), value: stats.total, color: '#e2e8f0' },
              { label: t('reports.validated'), value: stats.valide, color: '#4ade80' },
              { label: t('reports.awaiting'), value: stats.attend, color: '#fbbf24' },
            ].map((s) => (
              <div key={s.label} className="admin-card" style={{ padding: 16 }}>
                <p className="text-xl font-bold" style={{ color: s.color }}>
                  {s.value}
                </p>
                <p className="text-xs mt-1" style={{ color: 'rgba(148,163,184,.62)' }}>
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
              placeholder={t('reports.search')}
              style={{ ...inp, marginLeft: 'auto' }}
            />
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

          <div className="admin-card admin-table">
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '.7fr 1.3fr 1.1fr 1.4fr .9fr .8fr',
                padding: '9px 16px',
                fontSize: 10,
                color: 'rgba(99,179,255,.45)',
                letterSpacing: '.05em',
                textTransform: 'uppercase',
                borderBottom: '0.5px solid rgba(59,130,246,.1)',
              }}
            >
              {['Réf. mission', 'Technicien', 'Site / GPS', 'Intervention', 'Statut', 'Action'].map(
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
            ) : rapports.length === 0 ? (
              <p
                className="text-center py-10 text-sm"
                style={{ color: 'rgba(148,163,184,.4)' }}
              >
                {t('reports.empty')}
              </p>
            ) : (
              rapports.map((r, i) => (
                <div
                  key={r.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '.7fr 1.3fr 1.1fr 1.4fr .9fr .8fr',
                    padding: '11px 16px',
                    fontSize: 11,
                    color: '#cbd5e1',
                    borderBottom: '1px solid rgba(255,255,255,.04)',
                    alignItems: 'center',
                  }}
                  className="admin-table-row"
                >
                  <span style={{ color: '#60a5fa', fontWeight: 500 }}>{r.reference}</span>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: avatarColors[i % avatarColors.length],
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 10,
                        fontWeight: 500,
                        color: '#e2e8f0',
                        flexShrink: 0,
                      }}
                    >
                      {r.technicien.nom
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)}
                    </div>
                    <div>
                      <p style={{ fontSize: 11, color: '#e2e8f0' }}>{r.technicien.nom}</p>
                      <p style={{ fontSize: 10, color: 'rgba(148,163,184,.4)' }}>
                        {r.technicien.telephone}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p style={{ fontSize: 11 }}>{r.site}</p>
                    <p style={{ fontSize: 10, color: 'rgba(59,130,246,.55)' }}>📍 {r.gps}</p>
                  </div>

                  <div>
                    <p style={{ fontSize: 10, color: 'rgba(148,163,184,.5)' }}>
                      {r.heureDebut} → {r.heureFin}
                    </p>
                    <p style={{ fontSize: 10, color: 'rgba(148,163,184,.4)' }}>{r.date}</p>
                    {r.hasPhotos && (
                      <p style={{ fontSize: 10, color: '#4ade80', marginTop: 2 }}>📷 Photos</p>
                    )}
                  </div>

                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '2px 8px',
                      borderRadius: 20,
                      fontSize: 10,
                      fontWeight: 500,
                      ...(badgeStyle[r.statut] || {}),
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
                    {r.statut}
                  </span>

                  <button
                    type="button"
                    onClick={() => navigate(`/dashboard/rapports/${r.id}`)}
                    className="admin-secondary-btn"
                    style={{
                      fontSize: 10,
                      color: '#60a5fa',
                      minHeight: 30,
                      padding: '4px 10px',
                    }}
                  >
                    {t('reports.detail')}
                  </button>
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
