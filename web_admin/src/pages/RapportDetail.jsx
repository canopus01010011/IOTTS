import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { formatEquipmentItem, formatDateTime } from '../utils/missionFormat'
import Sidebar from '../components/Sidebar'
import TopBar  from '../components/TopBar'

const STATUS_LABEL = {
  pending: 'En attente',
  'in-progress': 'En cours',
  completed: 'Validé',
}

const CONFIRMATION_LABEL = {
  pending: 'En attente',
  driver_confirmed: 'Driver confirmé',
  technician_confirmed: 'Technicien confirmé',
  confirmed: 'Confirmé',
  rejected: 'Rejeté',
}

export default function RapportDetail() {
  const { id: missionId } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [actionDone, setActionDone] = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')
    api
      .get(`/reports/detail/${missionId}`)
      .then((res) => setData(res.data?.data || null))
      .catch((err) => {
        setData(null)
        setError(
          err?.response?.data?.error ||
          'Impossible de charger le rapport.',
        )
      })
      .finally(() => setLoading(false))
  }, [missionId])

  const handleAction = async (status) => {
    if (!data?.mission) return
    setActionLoading(true)
    try {
      await api.patch(`/missions/${missionId}/status`, { status })
      setActionDone(status)
      setTimeout(() => navigate('/dashboard/rapports'), 1500)
    } catch {
      setActionDone('')
      alert('Erreur lors de la mise à jour du statut.')
    } finally {
      setActionLoading(false)
    }
  }

  const card = {
    background: '#111827',
    border: '0.5px solid rgba(59,130,246,.18)',
    borderRadius: 10,
    padding: 20,
    marginBottom: 14,
  }
  const sec = {
    fontSize: 11,
    fontWeight: 500,
    color: '#60a5fa',
    letterSpacing: '.05em',
    textTransform: 'uppercase',
    marginBottom: 12,
  }
  const lbl = { fontSize: 11, color: 'rgba(148,163,184,.5)', marginBottom: 3 }
  const val = { fontSize: 13, color: '#e2e8f0' }

  if (loading) {
    return (
      <div className="flex min-h-screen" style={{ background: '#0a0f1e' }}>
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <p style={{ color: 'rgba(148,163,184,.5)', fontSize: 13 }}>Chargement…</p>
        </div>
      </div>
    )
  }

  if (error || !data?.mission || !report) {
    return (
      <div className="flex min-h-screen" style={{ background: '#0a0f1e' }}>
        <Sidebar />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <p style={{ color: '#f87171', fontSize: 14 }}>
            {error || 'Aucun rapport technicien soumis pour cette mission.'}
          </p>
          <button
            type="button"
            onClick={() => navigate('/dashboard/rapports')}
            style={{
              background: 'rgba(59,130,246,.12)',
              border: '0.5px solid rgba(59,130,246,.3)',
              color: '#60a5fa',
              borderRadius: 8,
              padding: '8px 16px',
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            Retour aux rapports
          </button>
        </div>
      </div>
    )
  }

  const { mission, report, confirmation } = data
  const technicien = mission.technician || {}
  const driver = mission.driver || {}
  const site = mission.Site || {}
  const photos = report?.delivery_photo_url || []
  const pictureUrls = (report?.Pictures || []).map((p) => p.picture_url)
  const allImages = [...photos, ...pictureUrls]

  const statutLabel = STATUS_LABEL[mission.status] || mission.status
  const dateLabel = formatDateTime(mission.scheduled_start_date)
  const startTime = mission.start_date
    ? new Date(mission.start_date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    : '—'
  const endTime = mission.end_date
    ? new Date(mission.end_date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    : '—'
  const gps =
    site.latitude != null && site.longitude != null
      ? `${Number(site.latitude).toFixed(4)}, ${Number(site.longitude).toFixed(4)}`
      : '—'
  const equipmentList = Array.isArray(mission.equipment_list) ? mission.equipment_list : []
  const reportText = report?.notes || report?.description || ''

  return (
    <div className="flex min-h-screen" style={{ background: '#0a0f1e' }}>
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopBar title={`Rapport technicien — ${mission.id}`} />
        <main className="flex-1 p-6 max-w-3xl">

          {actionDone && (
            <div
              className="mb-4 px-4 py-3 rounded-lg text-sm font-medium"
              style={
                actionDone === 'completed'
                  ? {
                      background: 'rgba(34,197,94,.1)',
                      color: '#4ade80',
                      border: '0.5px solid rgba(34,197,94,.2)',
                    }
                  : {
                      background: 'rgba(59,130,246,.1)',
                      color: '#60a5fa',
                      border: '0.5px solid rgba(59,130,246,.3)',
                    }
              }
            >
              Statut mis à jour. Redirection…
            </div>
          )}

          <div style={card}>
            <p style={sec}>Informations de la mission</p>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p style={lbl}>Réf. mission</p>
                <p style={{ ...val, color: '#60a5fa' }}>{mission.id}</p>
              </div>
              <div>
                <p style={lbl}>Statut mission</p>
                <p style={val}>{statutLabel}</p>
              </div>
              <div>
                <p style={lbl}>Rapport ID</p>
                <p style={val}>{report?.id || '—'}</p>
              </div>
              <div>
                <p style={lbl}>Technicien</p>
                <p style={val}>{technicien.full_name || '—'}</p>
              </div>
              <div>
                <p style={lbl}>Téléphone</p>
                <p style={val}>{technicien.phone || '—'}</p>
              </div>
              <div>
                <p style={lbl}>Driver</p>
                <p style={val}>{driver.full_name || '—'}</p>
              </div>
            </div>
          </div>

          <div style={card}>
            <p style={sec}>Site</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p style={lbl}>Nom du site</p>
                <p style={val}>{site.name || '—'}</p>
              </div>
              <div>
                <p style={lbl}>Adresse</p>
                <p style={val}>{site.address || '—'}</p>
              </div>
              <div>
                <p style={lbl}>Coordonnées GPS</p>
                <p style={val}>{gps}</p>
              </div>
            </div>
          </div>

          {confirmation && (
            <div style={card}>
              <p style={sec}>Confirmation livraison</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p style={lbl}>Statut</p>
                  <p style={val}>
                    {CONFIRMATION_LABEL[confirmation.confirmation_status] ||
                      confirmation.confirmation_status}
                  </p>
                </div>
                <div>
                  <p style={lbl}>Driver confirmé</p>
                  <p style={val}>
                    {confirmation.driver_confirm_time
                      ? new Date(confirmation.driver_confirm_time).toLocaleString('fr-FR')
                      : '—'}
                  </p>
                </div>
                <div>
                  <p style={lbl}>Technicien confirmé</p>
                  <p style={val}>
                    {confirmation.technician_confirm_time
                      ? new Date(confirmation.technician_confirm_time).toLocaleString('fr-FR')
                      : '—'}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div style={card}>
            <p style={sec}>Horaires</p>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <p style={lbl}>Date prévue</p>
                <p style={val}>{dateLabel}</p>
              </div>
              <div>
                <p style={lbl}>Heure début</p>
                <p style={val}>{startTime}</p>
              </div>
              <div>
                <p style={lbl}>Heure fin</p>
                <p style={val}>{endTime}</p>
              </div>
            </div>
            <div>
              <p style={lbl}>Description du rapport</p>
              <p style={{ ...val, lineHeight: 1.7, marginTop: 4 }}>
                {reportText || 'Aucune description fournie.'}
              </p>
            </div>
            {report?.report_date && (
              <p style={{ ...lbl, marginTop: 12 }}>
                Date rapport :{' '}
                {new Date(report.report_date).toLocaleDateString('fr-FR')}
              </p>
            )}
          </div>

          {allImages.length > 0 && (
            <div style={card}>
              <p style={sec}>Photos ({allImages.length})</p>
              <div className="flex flex-wrap gap-3 mt-2">
                {allImages.map((url, idx) => (
                  <a
                    key={idx}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    style={{ display: 'block' }}
                  >
                    <img
                      src={url}
                      alt={`Preuve ${idx + 1}`}
                      style={{
                        width: 100,
                        height: 100,
                        objectFit: 'cover',
                        borderRadius: 8,
                        border: '0.5px solid rgba(59,130,246,.2)',
                      }}
                    />
                  </a>
                ))}
              </div>
            </div>
          )}

          <div style={card}>
            <p style={sec}>Équipements</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {equipmentList.length === 0 && (
                <span style={{ color: 'rgba(148,163,184,.5)' }}>
                  Aucun équipement enregistré
                </span>
              )}
              {equipmentList.map((item, idx) => (
                <span
                  key={`${item.equipment_id || item}-${idx}`}
                  style={{
                    background: 'rgba(59,130,246,.08)',
                    border: '0.5px solid rgba(59,130,246,.2)',
                    borderRadius: 6,
                    padding: '3px 10px',
                    fontSize: 11,
                    color: '#93c5fd',
                  }}
                >
                  {formatEquipmentItem(item)}
                </span>
              ))}
            </div>
          </div>

          <div style={card}>
            <p style={sec}>Actions admin</p>
            <div className="flex gap-3 flex-wrap">
              <button
                type="button"
                onClick={() => handleAction('in-progress')}
                disabled={
                  actionLoading ||
                  mission.status === 'in-progress' ||
                  mission.status === 'completed'
                }
                style={{
                  background: 'rgba(59,130,246,.12)',
                  border: '0.5px solid rgba(59,130,246,.3)',
                  color: '#60a5fa',
                  borderRadius: 8,
                  padding: '10px 18px',
                  fontSize: 13,
                  cursor: 'pointer',
                  opacity: actionLoading ? 0.6 : 1,
                }}
              >
                Marquer en cours
              </button>
              <button
                type="button"
                onClick={() => handleAction('completed')}
                disabled={actionLoading || mission.status === 'completed'}
                style={{
                  background: 'rgba(34,197,94,.12)',
                  border: '0.5px solid rgba(34,197,94,.3)',
                  color: '#4ade80',
                  borderRadius: 8,
                  padding: '10px 18px',
                  fontSize: 13,
                  cursor: 'pointer',
                  opacity: actionLoading ? 0.6 : 1,
                }}
              >
                Valider (terminé)
              </button>
              <button
                type="button"
                onClick={() => navigate('/dashboard/rapports')}
                style={{
                  background: 'transparent',
                  border: '0.5px solid rgba(148,163,184,.2)',
                  color: 'rgba(148,163,184,.6)',
                  borderRadius: 8,
                  padding: '10px 18px',
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                Retour aux rapports
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
