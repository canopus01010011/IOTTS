import { useState, useEffect, useCallback } from 'react'
import api from '../services/api'
import Sidebar from '../components/Sidebar'
import TopBar from '../components/TopBar'

const inputStyle = {
  background: '#0d1426',
  border: '0.5px solid rgba(59,130,246,.2)',
  borderRadius: 8,
  padding: '10px 14px',
  fontSize: 13,
  color: '#e2e8f0',
  outline: 'none',
  width: '100%',
}

const STATUS_LABELS = {
  available: 'Disponible',
  assigned: 'Assigné',
  in_transit: 'En transit',
  delivered: 'Livré',
  maintenance: 'Maintenance',
}

const STATUS_STYLES = {
  available: { bg: 'rgba(34,197,94,.12)', color: '#4ade80' },
  assigned: { bg: 'rgba(59,130,246,.12)', color: '#60a5fa' },
  in_transit: { bg: 'rgba(234,179,8,.1)', color: '#fbbf24' },
  delivered: { bg: 'rgba(148,163,184,.1)', color: '#94a3b8' },
  maintenance: { bg: 'rgba(239,68,68,.12)', color: '#f87171' },
}

export default function Containers() {
  const [containers, setContainers] = useState([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [totalItems, setTotalItems] = useState(0)
  const [showForm, setShowForm] = useState(false)

  const [qrCode, setQrCode] = useState('')
  const [capacity, setCapacity] = useState('')
  const [status, setStatus] = useState('available')
  const [creating, setCreating] = useState(false)

  const loadContainers = useCallback(async () => {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const params = { limit: 100 }
      if (search.trim()) params.search = search.trim()
      if (statusFilter) params.status = statusFilter
      const res = await api.get('/containers', { params })
      const data = res.data || {}
      setContainers(data.containers || [])
      setTotalItems(data.totalItems ?? data.containers?.length ?? 0)
    } catch (err) {
      setContainers([])
      setTotalItems(0)
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        'Impossible de charger les conteneurs.',
      )
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter])

  useEffect(() => {
    const timer = setTimeout(loadContainers, search ? 300 : 0)
    return () => clearTimeout(timer)
  }, [loadContainers, search])

  const handleCreate = async (event) => {
    event.preventDefault()
    setCreating(true)
    setError('')
    setSuccess('')

    try {
      const payload = {
        qr_code: qrCode.trim(),
        capacity: Number(capacity),
        status,
      }
      const res = await api.post('/containers', payload)
      const created = res.data || {}
      setSuccess(`Conteneur créé : ${created.id || created.qr_code || 'OK'}`)
      setQrCode('')
      setCapacity('')
      setStatus('available')
      setShowForm(false)
      loadContainers()
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        'Impossible de créer le conteneur.',
      )
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="flex min-h-screen" style={{ background: '#0a0f1e' }}>
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopBar title="Conteneurs" />
        <main className="flex-1 p-6">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: '#e2e8f0' }}>Gestion des conteneurs</p>
              <p className="text-xs" style={{ color: 'rgba(148,163,184,.6)' }}>
                Liste des conteneurs, statut et création de nouveaux conteneurs.
              </p>
            </div>
            <button
              onClick={() => setShowForm((prev) => !prev)}
              style={{
                background: '#1d4ed8',
                color: '#e2e8f0',
                borderRadius: 8,
                padding: '10px 16px',
                fontSize: 13,
                fontWeight: 500,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {showForm ? 'Fermer le formulaire' : '+ Nouveau conteneur'}
            </button>
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

          {success && (
            <div
              className="mb-4 px-4 py-3 rounded-lg text-sm"
              style={{
                background: 'rgba(34,197,94,.1)',
                color: '#4ade80',
                border: '0.5px solid rgba(34,197,94,.2)',
              }}
            >
              {success}
            </div>
          )}

          {showForm && (
            <div
              className="mb-6"
              style={{ background: '#111827', border: '0.5px solid rgba(59,130,246,.18)', borderRadius: 12, padding: 24 }}
            >
              <p className="text-xs uppercase tracking-[0.12em]" style={{ color: '#60a5fa', marginBottom: 14 }}>
                Nouveau conteneur
              </p>
              <form onSubmit={handleCreate} className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="block text-xs mb-2" style={{ color: 'rgba(148,163,184,.7)' }}>
                    Code QR *
                  </label>
                  <input
                    value={qrCode}
                    onChange={(e) => setQrCode(e.target.value)}
                    placeholder="CTR-QR-001"
                    style={inputStyle}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs mb-2" style={{ color: 'rgba(148,163,184,.7)' }}>
                    Capacité *
                  </label>
                  <input
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    placeholder="120"
                    style={inputStyle}
                    required
                    type="number"
                    min="1"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="block text-xs mb-2" style={{ color: 'rgba(148,163,184,.7)' }}>
                    Statut
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    style={{ ...inputStyle, cursor: 'pointer' }}
                  >
                    {Object.entries(STATUS_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-3">
                  <button
                    type="submit"
                    disabled={creating}
                    style={{
                      background: '#22c55e',
                      color: '#0f172a',
                      borderRadius: 8,
                      padding: '10px 18px',
                      fontSize: 13,
                      fontWeight: 600,
                      border: 'none',
                      cursor: creating ? 'not-allowed' : 'pointer',
                      opacity: creating ? 0.65 : 1,
                    }}
                  >
                    {creating ? 'Création…' : 'Créer le conteneur'}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p style={{ color: '#cbd5e1', fontSize: 13 }}>
              {loading ? 'Chargement…' : `${totalItems} conteneur(s)`}
            </p>
            <div className="flex flex-wrap gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ ...inputStyle, maxWidth: 180, cursor: 'pointer' }}
              >
                <option value="">Tous les statuts</option>
                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Recherche QR ou ID…"
                style={{ ...inputStyle, maxWidth: 280 }}
              />
            </div>
          </div>

          {loading ? (
            <p style={{ color: 'rgba(148,163,184,.6)', fontSize: 13 }}>Veuillez patienter…</p>
          ) : containers.length === 0 ? (
            <p style={{ color: 'rgba(148,163,184,.6)', fontSize: 13 }}>Aucun conteneur.</p>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {containers.map((c) => {
                const st = STATUS_STYLES[c.status] || STATUS_STYLES.available
                return (
                  <div
                    key={c.id}
                    style={{ background: '#111827', border: '0.5px solid rgba(59,130,246,.15)', borderRadius: 12, padding: 20 }}
                  >
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <p style={{ fontSize: 12, color: 'rgba(148,163,184,.6)' }}>ID</p>
                        <p style={{ fontSize: 14, color: '#60a5fa', fontFamily: 'monospace', marginTop: 4 }}>{c.id}</p>
                      </div>
                      <span
                        style={{
                          padding: '4px 12px',
                          borderRadius: 20,
                          fontSize: 11,
                          fontWeight: 500,
                          background: st.bg,
                          color: st.color,
                        }}
                      >
                        {STATUS_LABELS[c.status] || c.status}
                      </span>
                    </div>
                    <div style={{ marginTop: 16, borderTop: '0.5px solid rgba(59,130,246,.1)', paddingTop: 16 }}>
                      <p style={{ fontSize: 12, color: 'rgba(148,163,184,.6)' }}>Code QR</p>
                      <p style={{ fontSize: 15, color: '#e2e8f0', marginTop: 4 }}>{c.qr_code}</p>
                    </div>
                    <div style={{ marginTop: 12 }}>
                      <p style={{ fontSize: 12, color: 'rgba(148,163,184,.6)' }}>Capacité</p>
                      <p style={{ fontSize: 13, color: '#cbd5e1', marginTop: 4 }}>{c.capacity}</p>
                    </div>
                    <div style={{ marginTop: 12 }}>
                      <p style={{ fontSize: 12, color: 'rgba(148,163,184,.6)' }}>QR à imprimer (conducteur entrepôt)</p>
                      <p style={{ fontSize: 13, color: '#93c5fd', marginTop: 4, fontFamily: 'monospace' }}>{c.qr_code}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
