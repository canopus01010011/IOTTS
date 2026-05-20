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

export default function Sites() {
  const [sites, setSites] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [totalItems, setTotalItems] = useState(0)
  const [showForm, setShowForm] = useState(false)

  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [creating, setCreating] = useState(false)

  const loadSites = useCallback(async () => {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const params = { limit: 100 }
      if (search.trim()) params.search = search.trim()
      const res = await api.get('/sites', { params })
      const data = res.data || {}
      setSites(data.sites || [])
      setTotalItems(data.totalItems ?? data.sites?.length ?? 0)
    } catch (err) {
      setSites([])
      setTotalItems(0)
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        'Impossible de charger les sites.',
      )
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => {
    const timer = setTimeout(loadSites, search ? 300 : 0)
    return () => clearTimeout(timer)
  }, [loadSites, search])

  const handleCreateSite = async (event) => {
    event.preventDefault()
    setCreating(true)
    setError('')
    setSuccess('')

    try {
      const payload = {
        name: name.trim(),
        address: address.trim(),
        latitude: Number(latitude),
        longitude: Number(longitude),
      }
      const res = await api.post('/sites', payload)
      const created = res.data || {}
      setSuccess(`Site créé : ${created.id || created.name || 'OK'}`)
      setName('')
      setAddress('')
      setLatitude('')
      setLongitude('')
      setShowForm(false)
      loadSites()
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        'Impossible de créer le site.',
      )
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="flex min-h-screen" style={{ background: '#0a0f1e' }}>
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopBar title="Sites" />
        <main className="flex-1 p-6">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: '#e2e8f0' }}>Gestion des sites</p>
              <p className="text-xs" style={{ color: 'rgba(148,163,184,.6)' }}>
                Affiche les sites existants et crée de nouveaux points d'intervention.
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
              {showForm ? 'Fermer le formulaire' : '+ Ajouter un site'}
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
                Nouveau site
              </p>
              <form onSubmit={handleCreateSite} className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-xs mb-2" style={{ color: 'rgba(148,163,184,.7)' }}>
                    Nom du site
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nom du site"
                    style={inputStyle}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs mb-2" style={{ color: 'rgba(148,163,184,.7)' }}>
                    Adresse
                  </label>
                  <input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Adresse complète"
                    style={inputStyle}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs mb-2" style={{ color: 'rgba(148,163,184,.7)' }}>
                    Latitude
                  </label>
                  <input
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    placeholder="Ex. 36.7538"
                    style={inputStyle}
                    required
                    type="number"
                    step="0.000001"
                    min="-90"
                    max="90"
                  />
                </div>
                <div>
                  <label className="block text-xs mb-2" style={{ color: 'rgba(148,163,184,.7)' }}>
                    Longitude
                  </label>
                  <input
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    placeholder="Ex. 3.0588"
                    style={inputStyle}
                    required
                    type="number"
                    step="0.000001"
                    min="-180"
                    max="180"
                  />
                </div>
                <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-3">
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
                    {creating ? 'Création…' : 'Créer le site'}
                  </button>
                  <p className="text-xs" style={{ color: 'rgba(148,163,184,.6)' }}>
                    Les champs name, address, latitude et longitude sont requis.
                  </p>
                </div>
              </form>
            </div>
          )}

          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p style={{ color: '#cbd5e1', fontSize: 13 }}>
              {loading ? 'Chargement des sites…' : `${totalItems} site(s) trouvé(s)`}
            </p>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Recherche par nom ou adresse..."
              style={{
                ...inputStyle,
                maxWidth: 320,
              }}
            />
          </div>

          {loading ? (
            <p style={{ color: 'rgba(148,163,184,.6)', fontSize: 13 }}>Veuillez patienter...</p>
          ) : sites.length === 0 ? (
            <p style={{ color: 'rgba(148,163,184,.6)', fontSize: 13 }}>Aucun site à afficher.</p>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {sites.map((site) => (
                <div
                  key={site.id}
                  style={{ background: '#111827', border: '0.5px solid rgba(59,130,246,.15)', borderRadius: 12, padding: 20 }}
                >
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <p style={{ fontSize: 12, color: 'rgba(148,163,184,.6)' }}>ID du site</p>
                      <p style={{ fontSize: 14, color: '#60a5fa', fontFamily: 'monospace', marginTop: 4 }}>{site.id}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: 12, color: 'rgba(148,163,184,.6)' }}>Coordonnées</p>
                      <p style={{ fontSize: 14, color: '#e2e8f0', marginTop: 4 }}>
                        {Number(site.latitude).toFixed(6)}, {Number(site.longitude).toFixed(6)}
                      </p>
                    </div>
                  </div>

                  <div style={{ marginTop: 16, borderTop: '0.5px solid rgba(59,130,246,.1)', paddingTop: 16 }}>
                    <p style={{ fontSize: 12, color: 'rgba(148,163,184,.6)' }}>Nom</p>
                    <p style={{ fontSize: 15, color: '#e2e8f0', marginTop: 4 }}>{site.name}</p>
                  </div>

                  <div style={{ marginTop: 12 }}>
                    <p style={{ fontSize: 12, color: 'rgba(148,163,184,.6)' }}>Adresse</p>
                    <p style={{ fontSize: 13, color: '#cbd5e1', marginTop: 4, lineHeight: 1.6 }}>{site.address}</p>
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
