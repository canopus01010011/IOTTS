import { useState, useRef, useEffect, useCallback } from 'react'
import api from '../services/api'
import Sidebar from '../components/Sidebar'
import TopBar  from '../components/TopBar'
import MissionTrackingMap from '../components/MissionTrackingMap'
import iotDemo001 from '../../examples/mission-iot-package_001.json'
import iotDemo002 from '../../examples/mission-iot-package_002.json'
import iotDemo003 from '../../examples/mission-iot-package_003.json'

const IOT_DEMOS = { '001': iotDemo001, '002': iotDemo002, '003': iotDemo003 }
import {
  toDateTimeLocal,
  toIsoDateTime,
  isValidEquipmentItem,
  isMissionImportFormat,
  summarizeImportPreview,
} from '../utils/missionFormat'

const CODED_ID = /^[A-Z]{3,4}-[A-Z2-9]{6}$/

const EMPTY_FORM = {
  reference: '',
  scheduled_start_date: '',
  scheduled_end_date: '',
  driver_id: '',
  technician_id: '',
  site_id: '',
  container_id: '',
  equipment_list: [{ label: '', model: '', serial_number: '', quantity: 1 }],
}

function hasEquipmentInput(data) {
  if (Array.isArray(data?.equipment_list) && data.equipment_list.length > 0) return true
  if (Array.isArray(data?.equipements) && data.equipements.length > 0) return true
  return false
}

function buildApiPayload(form) {
  const equipment_list = form.equipment_list
    .filter((e) => isValidEquipmentItem(e))
    .map((e) => {
      const row = {
        label: (e.label || e.name || e.type || '').trim(),
        quantity: Math.floor(Number(e.quantity)),
      }
      if (e.equipment_id?.trim()) row.equipment_id = e.equipment_id.trim()
      if (e.model?.trim()) row.model = e.model.trim()
      if (e.serial_number?.trim()) row.serial_number = e.serial_number.trim()
      return row
    })

  const payload = {
    scheduled_start_date: toIsoDateTime(form.scheduled_start_date),
    scheduled_end_date: toIsoDateTime(form.scheduled_end_date),
    driver_id: form.driver_id.trim(),
    technician_id: form.technician_id.trim(),
    site_id: form.site_id.trim(),
    equipment_list,
  }

  if (form.container_id?.trim()) {
    payload.container_id = form.container_id.trim()
  }

  return payload
}

function validatePayload(form) {
  const errors = []
  if (!form.scheduled_start_date) errors.push('Date/heure de début requise.')
  if (!form.scheduled_end_date) errors.push('Date/heure de fin requise.')

  const start = new Date(toIsoDateTime(form.scheduled_start_date))
  const end = new Date(toIsoDateTime(form.scheduled_end_date))
  if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) && end <= start) {
    errors.push('La fin doit être après le début.')
  }

  if (!CODED_ID.test(form.driver_id?.trim() || '')) errors.push('Conducteur invalide (USR-*).')
  if (!CODED_ID.test(form.technician_id?.trim() || '')) errors.push('Technicien invalide (USR-*).')
  if (!CODED_ID.test(form.site_id?.trim() || '')) errors.push('Site invalide (STE-*).')
  if (!form.container_id?.trim()) {
    errors.push('Conteneur requis pour le suivi livraison (CTR-IOT-*).')
  } else if (!CODED_ID.test(form.container_id.trim())) {
    errors.push('Conteneur invalide (CTR-*).')
  }

  const list = buildApiPayload(form).equipment_list
  if (list.length === 0) errors.push('Au moins un équipement est requis.')
  form.equipment_list.filter((e) => isValidEquipmentItem(e)).forEach((e, i) => {
    if (!(e.label || e.name || e.type)?.trim()) {
      errors.push(`Équipement ${i + 1} : type/libellé requis.`)
    }
    if (!e.model?.trim()) errors.push(`Équipement ${i + 1} : modèle requis.`)
    if (!e.serial_number?.trim()) errors.push(`Équipement ${i + 1} : numéro de série requis.`)
  })

  return errors
}

export default function CreateMission() {
  const fileRef = useRef(null)

  const [mode, setMode] = useState('form')
  const [form, setForm] = useState(EMPTY_FORM)
  const [importedJson, setImportedJson] = useState(null)
  const [fileName, setFileName] = useState('')
  const [resources, setResources] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadingResources, setLoadingResources] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [trackingMission, setTrackingMission] = useState(null)

  const loadResources = useCallback(() => {
    setLoadingResources(true)
    api.get('/missions/import-template')
      .then((res) => {
        const data = res.data?.data || res.data
        setResources(data?.resources || null)
        const t = data?.template
        if (t) {
          const driverId = t.driver_id || t.driver?.id || ''
          const techId = t.technician_id || t.technician?.id || ''
          const siteId = t.site_id || t.site?.id || ''
          const containerId = t.container_id || t.container?.id || ''
          setForm({
            reference: t.reference || '',
            scheduled_start_date: t.scheduled_start_date || '',
            scheduled_end_date: t.scheduled_end_date || '',
            driver_id: driverId,
            technician_id: techId,
            site_id: siteId,
            container_id: containerId,
            equipment_list: (() => {
              const example =
                Array.isArray(t.equipment_list) && t.equipment_list.length > 0
                  ? t.equipment_list[0]
                  : null
              return [
                {
                  label: example?.label || example?.name || example?.type || 'Équipement télécom',
                  model: example?.model || 'EQ-MODEL-01',
                  serial_number: example?.serial_number || example?.serial || 'SN-EXAMPLE-001',
                  quantity: example?.quantity || 1,
                  equipment_id: '',
                },
              ]
            })(),
          })
        }
      })
      .catch((err) => {
        setError(
          err.response?.data?.error ||
          err.response?.data?.message ||
          'Impossible de charger les données (conducteurs, techniciens, sites).',
        )
      })
      .finally(() => setLoadingResources(false))
  }, [])

  useEffect(() => {
    loadResources()
  }, [loadResources])

  const setField = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }))
  }

  const updateEquipment = (index, field, value) => {
    setForm((f) => {
      const equipment_list = [...f.equipment_list]
      equipment_list[index] = {
        ...equipment_list[index],
        [field]: field === 'quantity' ? Number(value) : value,
      }
      return { ...f, equipment_list }
    })
  }

  const addEquipment = () => {
    setForm((f) => ({
      ...f,
      equipment_list: [...f.equipment_list, { label: '', model: '', serial_number: '', quantity: 1 }],
    }))
  }

  const removeEquipment = (index) => {
    setForm((f) => {
      const equipment_list = f.equipment_list.filter((_, i) => i !== index)
      return {
        ...f,
        equipment_list: equipment_list.length ? equipment_list : [{ label: '', model: '', serial_number: '', quantity: 1 }],
      }
    })
  }

  const parseJsonFile = (text, name) => {
    setError('')
    setSuccess(null)
    try {
      const data = JSON.parse(text)
      if (!data || typeof data !== 'object' || Array.isArray(data)) {
        throw new Error('Le JSON doit être un objet.')
      }
      if (!isMissionImportFormat(data)) {
        throw new Error(
          'Structure invalide. Requis : dates, conducteur/technicien (doivent exister en base), site, equipment_list[]. Site/conteneur/équipement créés si absents.',
        )
      }
      setImportedJson(data)
      setFileName(name)
      setMode('import')
    } catch (err) {
      setError(err.message || 'JSON invalide.')
      setImportedJson(null)
    }
  }

  const handleFile = (e) => {
    const file = e.target.files[0]
    if (!file?.name.endsWith('.json')) {
      setError('Fichier .json requis.')
      return
    }
    const reader = new FileReader()
    reader.onload = (ev) => parseJsonFile(ev.target.result, file.name)
    reader.readAsText(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (!file) return
    handleFile({ target: { files: [file] } })
  }

  const beginTracking = async (missionId) => {
    const res = await api.get(`/missions/${missionId}`)
    const m = res.data
    const site = m.Site || {}

    if (!m.container_id) {
      setSuccess({ id: missionId })
      setError(
        'Mission créée sans conteneur. Pour le suivi IoT, assignez un conteneur (ex. CTR-IOT-001) ou importez mission-iot-package_001.json.',
      )
      return
    }

    setTrackingMission({
      id: m.id,
      status: m.status,
      containerId: m.container_id,
      siteName: site.name || '',
      siteAddress: site.address || '',
      siteLat: Number(site.latitude),
      siteLng: Number(site.longitude),
      driver: m.driver?.full_name || '',
    })
    setSuccess(null)
    setError('')
    setMode('tracking')
  }

  const submitForm = async () => {
    const errors = validatePayload(form)
    if (errors.length) {
      setError(errors.join(' '))
      return
    }

    if (!form.container_id?.trim()) {
      setError('Sélectionnez un conteneur IoT pour afficher le suivi livraison sur la carte.')
      return
    }

    setLoading(true)
    setError('')
    setSuccess(null)

    try {
      const mission = buildApiPayload(form)
      const res = await api.post('/missions', mission)
      await beginTracking(res.data?.id)
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Création impossible.')
    } finally {
      setLoading(false)
    }
  }

  const submitImport = async () => {
    if (!importedJson) return

    setLoading(true)
    setError('')
    setSuccess(null)

    try {
      const res = await api.post('/missions/from-json', {
        reference: importedJson.reference || form.reference || `import-${Date.now()}`,
        file_format: importedJson,
      })
      const created = res.data?.mission || res.data
      await beginTracking(created?.id)
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Import impossible.')
    } finally {
      setLoading(false)
    }
  }

  const applyDemoUsers = (demo) => {
    const driver = resources?.drivers?.[0]
    const tech = resources?.technicians?.[0]
    if (driver?.id) {
      demo.driver_id = driver.id
      demo.driver = { id: driver.id, email: driver.email, full_name: driver.full_name }
    }
    if (tech?.id) {
      demo.technician_id = tech.id
      demo.technician = { id: tech.id, email: tech.email, full_name: tech.full_name }
    }
    return demo
  }

  const loadIotDemoJson = (pkg = '001') => {
    setError('')
    setSuccess(null)
    const source = IOT_DEMOS[pkg] || IOT_DEMOS['001']
    const demo = applyDemoUsers(JSON.parse(JSON.stringify(source)))
    if (!demo.driver_id || !demo.technician_id) {
      setError('Aucun conducteur/technicien dans la base. Créez-les via Créer utilisateur avant l\'import.')
      return
    }
    setImportedJson(demo)
    setFileName(`mission-iot-package_${pkg}.json`)
    setMode('import')
  }

  const resetForNewMission = () => {
    setTrackingMission(null)
    setImportedJson(null)
    setFileName('')
    setForm(EMPTY_FORM)
    setSuccess(null)
    setError('')
    setMode('form')
    loadResources()
  }

  const downloadTemplate = async () => {
    let content
    try {
      const res = await api.get('/missions/import-template')
      content = res.data?.data?.template || res.data?.template
    } catch {
      content = null
    }
    if (!content) {
      content = {
        reference: form.reference || `MSN-${Date.now()}`,
        ...buildApiPayload(form),
      }
      if (!content.container_id) delete content.container_id
    }
    const blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'mission-template.json'
    a.click()
    URL.revokeObjectURL(url)
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
    marginBottom: 14,
  }
  const lbl = { display: 'block', fontSize: 11, color: 'rgba(148,163,184,.55)', marginBottom: 5 }
  const inp = {
    width: '100%',
    background: '#0d1426',
    border: '0.5px solid rgba(59,130,246,.25)',
    color: '#e2e8f0',
    borderRadius: 7,
    padding: '9px 12px',
    fontSize: 13,
    outline: 'none',
  }

  const drivers = resources?.drivers || []
  const technicians = resources?.technicians || []
  const sites = resources?.sites || []
  const containers = resources?.containers || []

  const tabStyle = (active) => ({
    padding: '8px 16px',
    borderRadius: 8,
    fontSize: 13,
    cursor: 'pointer',
    border: active ? '0.5px solid #3b82f6' : '0.5px solid rgba(59,130,246,.15)',
    background: active ? 'rgba(59,130,246,.15)' : 'transparent',
    color: active ? '#60a5fa' : 'rgba(148,163,184,.6)',
  })

  return (
    <div className="flex min-h-screen" style={{ background: '#0a0f1e' }}>
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopBar title="Créer une mission" />
        <main className={`flex-1 p-6 ${mode === 'tracking' ? 'max-w-5xl' : 'max-w-3xl'}`}>

      

          {mode !== 'tracking' && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
              <button type="button" style={tabStyle(mode === 'form')} onClick={() => setMode('form')}>
                Formulaire
              </button>
              <button type="button" style={tabStyle(mode === 'import')} onClick={() => setMode('import')}>
                Import JSON
              </button>
              {['001', '002', '003'].map((pkg) => (
                <button
                  key={pkg}
                  type="button"
                  onClick={() => loadIotDemoJson(pkg)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 8,
                    fontSize: 12,
                    cursor: 'pointer',
                    border: '0.5px solid rgba(34,197,94,.35)',
                    background: 'rgba(34,197,94,.08)',
                    color: '#4ade80',
                  }}
                >
                  Démo IoT {pkg}
                </button>
              ))}
            </div>
          )}

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
              className="mb-4 px-4 py-3 rounded-lg text-sm font-medium"
              style={{
                background: 'rgba(34,197,94,.1)',
                color: '#4ade80',
                border: '0.5px solid rgba(34,197,94,.2)',
              }}
            >
              Mission créée ({success.id || success.reference})
            </div>
          )}

          {mode === 'tracking' && trackingMission && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <p style={{ fontSize: 13, color: '#4ade80', margin: 0 }}>
                  Mission active — suivi livraison en direct (cette mission seulement)
                </p>
                <button
                  type="button"
                  onClick={resetForNewMission}
                  style={{
                    background: 'rgba(59,130,246,.1)',
                    border: '0.5px solid rgba(59,130,246,.3)',
                    color: '#60a5fa',
                    borderRadius: 8,
                    padding: '8px 16px',
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  + Nouvelle mission
                </button>
              </div>
              <MissionTrackingMap mission={trackingMission} />
              <p style={{ fontSize: 11, color: 'rgba(148,163,184,.45)', marginTop: 12 }}>
                Simulateur : <code style={{ color: '#93c5fd' }}>python gps_simulator.py --listen</code>
                {' '}— départ <strong>Oued Smar</strong> au scan QR mission par le conducteur assigné.
              </p>
            </div>
          )}

          {loadingResources && mode !== 'tracking' ? (
            <p style={{ fontSize: 13, color: 'rgba(148,163,184,.5)' }}>Chargement des données…</p>
          ) : mode === 'tracking' ? null : mode === 'form' ? (
            <>
              <div style={card}>
                <p style={sec}>Planification (missions.scheduled_*_date)</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={lbl}>Référence import (optionnel)</label>
                    <input
                      value={form.reference}
                      onChange={(e) => setField('reference', e.target.value)}
                      placeholder="MSN-20260521-0001"
                      style={inp}
                    />
                  </div>
                  <div>
                    <label style={lbl}>Début planifié </label>
                    <input
                      type="datetime-local"
                      value={toDateTimeLocal(form.scheduled_start_date)}
                      onChange={(e) => setField('scheduled_start_date', e.target.value)}
                      required
                      style={inp}
                    />
                  </div>
                  <div>
                    <label style={lbl}>Fin planifiée</label>
                    <input
                      type="datetime-local"
                      value={toDateTimeLocal(form.scheduled_end_date)}
                      onChange={(e) => setField('scheduled_end_date', e.target.value)}
                      required
                      style={inp}
                    />
                  </div>
                </div>
              </div>

              <div style={card}>
                <p style={sec}>Assignation (FK users & sites)</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={lbl}>driver_id </label>
                    <select
                      value={form.driver_id}
                      onChange={(e) => setField('driver_id', e.target.value)}
                      style={{ ...inp, cursor: 'pointer' }}
                    >
                      <option value="">— Choisir —</option>
                      {drivers.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.full_name} ({d.id})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={lbl}>technician_id (technicien)</label>
                    <select
                      value={form.technician_id}
                      onChange={(e) => setField('technician_id', e.target.value)}
                      style={{ ...inp, cursor: 'pointer' }}
                    >
                      <option value="">— Choisir —</option>
                      {technicians.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.full_name} ({t.id})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={lbl}>site_id </label>
                    <select
                      value={form.site_id}
                      onChange={(e) => setField('site_id', e.target.value)}
                      style={{ ...inp, cursor: 'pointer' }}
                    >
                      <option value="">— Choisir —</option>
                      {sites.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.id})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={lbl}>container_id</label>
                    <select
                      value={form.container_id}
                      onChange={(e) => setField('container_id', e.target.value)}
                      style={{ ...inp, cursor: 'pointer' }}
                    >
                      <option value="">— Aucun —</option>
                      {containers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.qr_code || c.id} ({c.id})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div style={card}>
                <p style={sec}>Équipements de la mission *</p>
                <p style={{ fontSize: 11, color: 'rgba(148,163,184,.45)', marginBottom: 12 }}>
                  Saisissez les équipements de cette mission (exemple ci-dessous). Utilisez « + Ajouter » pour en ajouter d&apos;autres — pas de liste globale en base.
                </p>
                {form.equipment_list.map((eq, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1.2fr 1fr 1fr 80px auto',
                      gap: 10,
                      marginBottom: 10,
                      alignItems: 'center',
                    }}
                  >
                    <input
                      value={eq.label || ''}
                      onChange={(e) => updateEquipment(i, 'label', e.target.value)}
                      placeholder="Type (ex. Fibre optique)"
                      style={inp}
                    />
                    <input
                      value={eq.model || ''}
                      onChange={(e) => updateEquipment(i, 'model', e.target.value)}
                      placeholder="Modèle"
                      style={inp}
                    />
                    <input
                      value={eq.serial_number || ''}
                      onChange={(e) => updateEquipment(i, 'serial_number', e.target.value)}
                      placeholder="N° de série"
                      style={inp}
                    />
                    <input
                      type="number"
                      min={1}
                      value={eq.quantity}
                      onChange={(e) => updateEquipment(i, 'quantity', e.target.value)}
                      style={inp}
                    />
                    <button
                      type="button"
                      onClick={() => removeEquipment(i)}
                      style={{
                        background: 'rgba(239,68,68,.08)',
                        border: '0.5px solid rgba(239,68,68,.2)',
                        color: '#f87171',
                        borderRadius: 7,
                        padding: '8px 12px',
                        cursor: 'pointer',
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addEquipment}
                  style={{
                    background: 'rgba(59,130,246,.08)',
                    border: '0.5px solid rgba(59,130,246,.2)',
                    color: '#60a5fa',
                    borderRadius: 7,
                    padding: '8px 14px',
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  + Ajouter équipement
                </button>
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={downloadTemplate}
                  style={{
                    background: 'transparent',
                    border: '0.5px solid rgba(59,130,246,.25)',
                    color: '#60a5fa',
                    borderRadius: 8,
                    padding: '10px 18px',
                    fontSize: 13,
                    cursor: 'pointer',
                  }}
                >
                  Exporter JSON
                </button>
                <button
                  type="button"
                  onClick={submitForm}
                  disabled={loading}
                  style={{
                    background: '#1d4ed8',
                    color: '#e2e8f0',
                    border: 'none',
                    borderRadius: 8,
                    padding: '10px 24px',
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: 'pointer',
                    opacity: loading ? 0.6 : 1,
                  }}
                >
                  {loading ? 'Création…' : 'Créer la mission'}
                </button>
              </div>
            </>
          ) : (
            <>
              <div style={card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <p style={{ ...sec, marginBottom: 0 }}>Fichier JSON</p>
                  <button
                    type="button"
                    onClick={downloadTemplate}
                    style={{
                      background: 'rgba(59,130,246,.08)',
                      border: '0.5px solid rgba(59,130,246,.2)',
                      color: '#60a5fa',
                      borderRadius: 6,
                      padding: '4px 12px',
                      fontSize: 11,
                      cursor: 'pointer',
                    }}
                  >
                    Télécharger modèle
                  </button>
                </div>

                <div
                  onClick={() => fileRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  style={{
                    border: isDragging ? '1.5px dashed #3b82f6' : '1px dashed rgba(59,130,246,.3)',
                    borderRadius: 10,
                    padding: '32px 16px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: isDragging ? 'rgba(59,130,246,.06)' : 'rgba(59,130,246,.02)',
                  }}
                >
                  <p style={{ fontSize: 14, color: 'rgba(148,163,184,.7)' }}>Glisser un .json ou cliquer</p>
                  <input ref={fileRef} type="file" accept=".json" onChange={handleFile} style={{ display: 'none' }} />
                </div>

                {importedJson && (
                  <p style={{ fontSize: 12, color: '#4ade80', marginTop: 12 }}>
                    ✓ {fileName} — prêt à importer
                  </p>
                )}
              </div>

              {importedJson && (
                <div style={card}>
                  <p style={sec}>Données extraites du JSON</p>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: 'rgba(148,163,184,.75)', lineHeight: 1.7 }}>
                    {summarizeImportPreview(importedJson).map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                  <p style={{ ...sec, marginTop: 14, marginBottom: 8 }}>Fichier brut</p>
                  <pre
                    style={{
                      fontSize: 10,
                      color: 'rgba(148,163,184,.55)',
                      background: '#0d1426',
                      padding: 12,
                      borderRadius: 8,
                      overflow: 'auto',
                      margin: 0,
                      maxHeight: 220,
                    }}
                  >
                    {JSON.stringify(importedJson, null, 2)}
                  </pre>
                </div>
              )}

              <div style={card}>
                <p style={sec}>Structure attendue (import complet)</p>
                <pre style={{ fontSize: 10, color: 'rgba(148,163,184,.45)', margin: 0, lineHeight: 1.6 }}>
{`{
  "scheduled_start_date": "2026-05-21T08:00:00.000Z",
  "scheduled_end_date": "2026-05-21T18:00:00.000Z",
  "site": { "name": "...", "address": "...", "latitude": 36.8, "longitude": 10.2 },
  "driver": { "id": "USR-…" } ou { "email": "…" } — doit exister en base,
  "technician": { "id": "USR-…" } ou { "email": "…" } — doit exister en base,
  "equipment_list": [
    { "type": "Fibre", "serial_number": "SN-001", "model": "FO-48C", "quantity": 1 }
  ],
  "container": {
    "qr_code": "CTR-QR-001", "capacity": 120,
    "gps_device": { "device_serial_number": "GPS-001", "battery_level": 100 }
  }
}`}
                </pre>
                <p style={{ fontSize: 11, color: 'rgba(148,163,184,.45)', marginTop: 10, marginBottom: 0 }}>
                  Démo IoT : <code style={{ color: '#93c5fd' }}>examples/mission-iot-package_001.json</code> (simulateur package_001 / route Draria).
                  Conducteur et technicien doivent exister en base.
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={submitImport}
                  disabled={loading || !importedJson}
                  style={{
                    background: '#1d4ed8',
                    color: '#e2e8f0',
                    border: 'none',
                    borderRadius: 8,
                    padding: '10px 24px',
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: importedJson ? 'pointer' : 'not-allowed',
                    opacity: loading || !importedJson ? 0.5 : 1,
                  }}
                >
                  {loading ? 'Import…' : 'Importer et créer (POST /missions/from-json)'}
                </button>
              </div>
            </>
          )}

        </main>
      </div>
    </div>
  )
}
