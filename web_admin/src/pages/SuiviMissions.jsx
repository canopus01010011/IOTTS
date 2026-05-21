import { useState, useEffect, useRef, useCallback } from 'react'
import api from '../services/api'
import Sidebar from '../components/Sidebar'
import TopBar  from '../components/TopBar'
import { WAREHOUSE } from '../constants/warehouse'

const POLL_MS = 10000

const statusMap = {
  pending: 'En attente',
  'in-progress': 'En cours',
  completed: 'Terminé',
  cancelled: 'Annulé',
  incident: 'Incident',
}

const STATUS = {
  'En cours':    { bg:'rgba(59,130,246,.12)',  color:'#60a5fa',  dot:'#3b82f6'  },
  'En attente':  { bg:'rgba(234,179,8,.1)',    color:'#fbbf24',  dot:'#eab308'  },
  'Terminé':     { bg:'rgba(148,163,184,.1)',  color:'#94a3b8',  dot:'#64748b'  },
  'Annulé':      { bg:'rgba(148,163,184,.08)', color:'#64748b',  dot:'#475569'  },
  'Incident':    { bg:'rgba(239,68,68,.12)',   color:'#f87171',  dot:'#ef4444'  },
}

const formatDuration = (start, end) => {
  if (!start || !end) return '—'
  const diff = Math.abs(new Date(end) - new Date(start))
  const minutes = Math.round(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return `${hours}h ${rest.toString().padStart(2, '0')}min`
}

const hasValidCoords = (lat, lng) => {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false
  if (lat === 0 && lng === 0) return false
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
}

const formatMission = (mission) => {
  const site = mission.Site || {}
  const lat = Number(site.latitude)
  const lng = Number(site.longitude)
  const startAt = mission.start_date || mission.scheduled_start_date
  return {
    id: mission.id,
    ref: mission.id,
    containerId: mission.container_id || null,
    site: site.name || mission.site_id || 'N/A',
    siteAddress: site.address || '',
    driver: mission.driver?.full_name || 'N/A',
    technicien: mission.technician?.full_name || 'N/A',
    depart: startAt
      ? new Date(startAt).toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit' })
      : '—',
    duree: formatDuration(mission.scheduled_start_date, mission.scheduled_end_date),
    statut: statusMap[mission.status] || mission.status || 'N/A',
    statusValue: mission.status,
    lat,
    lng,
    hasCoords: hasValidCoords(lat, lng),
  }
}

function pickLiveForContainer(liveDevices, containerId) {
  if (!containerId) return null
  const row = liveDevices.find((d) => d.container_id === containerId)
  if (!row) return null
  const pt = row.TrackingData?.[0]
  if (!pt) return { ...row, latitude: null, longitude: null }
  return {
    ...row,
    latitude: Number(pt.latitude),
    longitude: Number(pt.longitude),
    timestamp: pt.timestamp,
  }
}

function MapModal({ mission, liveGps, trackPoints, onClose }) {
  const mapRef = useRef(null)
  const mapObj = useRef(null)
  const layersRef = useRef(null)

  const containerLat = liveGps?.latitude
  const containerLng = liveGps?.longitude
  const hasContainer =
    containerLat != null &&
    containerLng != null &&
    hasValidCoords(containerLat, containerLng)

  useEffect(() => {
    if (!window.L || !mapRef.current) return
    const L = window.L

    const centerLat = hasContainer ? containerLat : mission.lat
    const centerLng = hasContainer ? containerLng : mission.lng
    if (!hasValidCoords(centerLat, centerLng)) return

    const map = L.map(mapRef.current, { zoomControl: true, attributionControl: false })
      .setView([centerLat, centerLng], 13)
    mapObj.current = map
    layersRef.current = L.layerGroup().addTo(map)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map)

    const siteIcon = L.divIcon({
      className: '',
      html: `<div style="width:42px;height:42px;background:#0f6e56;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid #4ade80;font-size:22px;">📍</div>`,
      iconSize: [42, 42],
      iconAnchor: [21, 42],
    })

    const truckIcon = L.divIcon({
      className: '',
      html: `<div style="width:44px;height:44px;background:#1d4ed8;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid #60a5fa;font-size:22px;box-shadow:0 0 0 6px rgba(59,130,246,.25);">🚛</div>`,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    })
    const warehouseIcon = L.divIcon({
      className: '',
      html: `<div style="width:40px;height:40px;background:#92400e;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid #fbbf24;font-size:20px;">🏭</div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 40],
    })

    const bounds = []

    L.marker([WAREHOUSE.latitude, WAREHOUSE.longitude], { icon: warehouseIcon })
      .addTo(layersRef.current)
      .bindPopup(`<b>${WAREHOUSE.name}</b><br/>Départ simulation`)
    bounds.push([WAREHOUSE.latitude, WAREHOUSE.longitude])

    if (mission.hasCoords) {
      L.marker([mission.lat, mission.lng], { icon: siteIcon })
        .addTo(layersRef.current)
        .bindPopup(`<b>Site : ${mission.site}</b><br/>${mission.siteAddress || ''}`)
      bounds.push([mission.lat, mission.lng])
    }

    if (hasContainer) {
      L.marker([containerLat, containerLng], { icon: truckIcon })
        .addTo(layersRef.current)
        .bindPopup(
          `<b>Conteneur (simulation IoT)</b><br/>${liveGps.device_serial_number}<br/>Batterie : ${liveGps.battery_level ?? '—'}%`,
        )
      bounds.push([containerLat, containerLng])
    }

    if (trackPoints.length >= 2) {
      const latlngs = trackPoints.map((p) => [Number(p.latitude), Number(p.longitude)])
      L.polyline(latlngs, { color: '#3b82f6', weight: 3, opacity: 0.75 }).addTo(layersRef.current)
      latlngs.forEach((ll) => bounds.push(ll))
    } else if (hasContainer && mission.hasCoords) {
      L.polyline(
        [[containerLat, containerLng], [mission.lat, mission.lng]],
        { color: '#3b82f6', weight: 2, dashArray: '6 8', opacity: 0.6 },
      ).addTo(layersRef.current)
    }

    if (bounds.length > 1) {
      map.fitBounds(bounds, { padding: [48, 48] })
    }

    return () => {
      if (mapObj.current) {
        mapObj.current.remove()
        mapObj.current = null
        layersRef.current = null
      }
    }
  }, [
    mission.id,
    mission.lat,
    mission.lng,
    mission.hasCoords,
    containerLat,
    containerLng,
    hasContainer,
    liveGps?.battery_level,
    liveGps?.device_serial_number,
    trackPoints.length,
  ])

  return (
    <div
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.8)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:16 }}
      onClick={onClose}
    >
      <div
        style={{ width:'100%', maxWidth:960, background:'#111827', border:'0.5px solid rgba(59,130,246,.3)', borderRadius:14, overflow:'hidden' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 18px', background:'#080d1a', borderBottom:'0.5px solid rgba(59,130,246,.15)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
            <span style={{ fontSize:14, fontWeight:500, color:'#60a5fa' }}>{mission.ref}</span>
            <span style={{ fontSize:13, color:'#e2e8f0', fontWeight:500 }}>{mission.site}</span>
            <span style={{ padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:500, background:STATUS[mission.statut]?.bg, color:STATUS[mission.statut]?.color }}>
              {mission.statut}
            </span>
            {hasContainer && (
              <span style={{ fontSize:11, color:'#4ade80' }}>● Live IoT</span>
            )}
          </div>
          <button
            onClick={onClose}
            style={{ background:'rgba(239,68,68,.1)', border:'0.5px solid rgba(239,68,68,.2)', color:'#f87171', borderRadius:6, padding:'5px 14px', fontSize:12, cursor:'pointer' }}
          >
            ✕ Fermer
          </button>
        </div>

        {mission.hasCoords || hasContainer ? (
          <div ref={mapRef} style={{ width:'100%', height:440 }} />
        ) : (
          <div style={{ padding: 48, textAlign: 'center' }}>
            <p style={{ fontSize: 14, color: '#fbbf24' }}>Aucune position disponible</p>
            <p style={{ fontSize: 12, color: 'rgba(148,163,184,.6)', marginTop: 8 }}>
              Assignez un conteneur avec GPS (package_001…) et lancez le simulateur IoT.
            </p>
          </div>
        )}

        <div style={{ padding:'12px 18px', background:'#0d1426', borderTop:'0.5px solid rgba(59,130,246,.1)', display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14 }}>
          <div>
            <p style={{ fontSize:10, color:'rgba(148,163,184,.4)', marginBottom:3 }}>Conducteur</p>
            <p style={{ fontSize:13, color:'#e2e8f0' }}>🚛 {mission.driver}</p>
          </div>
          <div>
            <p style={{ fontSize:10, color:'rgba(148,163,184,.4)', marginBottom:3 }}>GPS conteneur</p>
            <p style={{ fontSize:12, color:'#60a5fa' }}>
              {hasContainer
                ? `${containerLat.toFixed(5)}, ${containerLng.toFixed(5)}`
                : mission.containerId
                  ? 'En attente de données…'
                  : 'Pas de conteneur'}
            </p>
          </div>
          <div>
            <p style={{ fontSize:10, color:'rgba(148,163,184,.4)', marginBottom:3 }}>Device IoT</p>
            <p style={{ fontSize:12, color:'#cbd5e1' }}>{liveGps?.device_serial_number || '—'}</p>
          </div>
          <div>
            <p style={{ fontSize:10, color:'rgba(148,163,184,.4)', marginBottom:3 }}>Batterie</p>
            <p style={{ fontSize:12, color:'#cbd5e1' }}>{liveGps?.battery_level != null ? `${liveGps.battery_level}%` : '—'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SuiviMissions() {
  const [missions, setMissions] = useState([])
  const [liveDevices, setLiveDevices] = useState([])
  const [selected, setSelected] = useState(null)
  const [trackPoints, setTrackPoints] = useState([])
  const [filtre, setFiltre] = useState('Tous')
  const [leaflet, setLeaflet] = useState(false)
  const [loadError, setLoadError] = useState('')

  const loadLiveGps = useCallback(async () => {
    try {
      const res = await api.get('/gps/live')
      setLiveDevices(res.data?.data || [])
    } catch {
      setLiveDevices([])
    }
  }, [])

  useEffect(() => {
    if (!document.getElementById('leaflet-css')) {
      const l = document.createElement('link')
      l.id = 'leaflet-css'
      l.rel = 'stylesheet'
      l.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(l)
    }
    if (!window.L) {
      const s = document.createElement('script')
      s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
      s.onload = () => setLeaflet(true)
      document.head.appendChild(s)
    } else setLeaflet(true)
  }, [])

  useEffect(() => {
    setLoadError('')
    api.get('/missions', { params: { limit: 100 } })
      .then((r) => setMissions((r.data.missions || []).map(formatMission)))
      .catch((err) => {
        setMissions([])
        setLoadError(err.response?.data?.error || err.message || 'Erreur de chargement')
      })
  }, [])

  useEffect(() => {
    loadLiveGps()
    const id = setInterval(loadLiveGps, POLL_MS)
    return () => clearInterval(id)
  }, [loadLiveGps])

  const openMap = async (m) => {
    if (!leaflet) return
    setSelected(m)
    setTrackPoints([])
    if (m.containerId) {
      try {
        const res = await api.get(`/gps/container/${m.containerId}/history`, { params: { limit: 200 } })
        setTrackPoints(res.data?.data || [])
      } catch {
        setTrackPoints([])
      }
    }
  }

  const selectedLive = selected
    ? pickLiveForContainer(liveDevices, selected.containerId)
    : null

  const filtres = ['Tous', 'En attente', 'En cours', 'Terminé']
  const displayed = filtre === 'Tous' ? missions : missions.filter((m) => m.statut === filtre)

  const stats = {
    enCours: missions.filter((m) => m.statut === 'En cours').length,
    enAttente: missions.filter((m) => m.statut === 'En attente').length,
    termines: missions.filter((m) => m.statut === 'Terminé').length,
  }

  return (
    <div className="flex min-h-screen" style={{ background:'#0a0f1e' }}>
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopBar title="Suivi des missions" />
        <main className="flex-1 p-6">

          {loadError && (
            <div className="mb-4 px-4 py-3 rounded-lg text-sm" style={{ background:'rgba(239,68,68,.1)', color:'#f87171' }}>
              {loadError}
            </div>
          )}

          <p className="text-xs mb-4" style={{ color: 'rgba(148,163,184,.5)' }}>
            Suivi livraison IoT : positions du simulateur (<code style={{ color: '#93c5fd' }}>iot_system</code>) rafraîchies toutes les {POLL_MS / 1000}s.
          </p>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:20 }}>
            {[
              { label:'En cours', value:stats.enCours, color:'#60a5fa' },
              { label:'En attente', value:stats.enAttente, color:'#fbbf24' },
              { label:'Terminées', value:stats.termines, color:'#4ade80' },
            ].map((s) => (
              <div key={s.label} style={{ background:'#111827', border:'0.5px solid rgba(59,130,246,.15)', borderRadius:12, padding:'14px 18px' }}>
                <p style={{ fontSize:26, fontWeight:500, color:s.color }}>{s.value}</p>
                <p style={{ fontSize:12, color:'rgba(148,163,184,.5)', marginTop:4 }}>{s.label}</p>
              </div>
            ))}
          </div>

          <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:20 }}>
            {filtres.map((f) => (
              <button key={f} onClick={() => setFiltre(f)}
                style={filtre === f
                  ? { background:'rgba(59,130,246,.18)', border:'0.5px solid #3b82f6', color:'#60a5fa', padding:'5px 14px', borderRadius:20, fontSize:12, cursor:'pointer' }
                  : { background:'rgba(59,130,246,.06)', border:'0.5px solid rgba(59,130,246,.15)', color:'rgba(148,163,184,.6)', padding:'5px 14px', borderRadius:20, fontSize:12, cursor:'pointer' }}
              >
                {f}
              </button>
            ))}
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14 }}>
            {displayed.map((m) => {
              const live = pickLiveForContainer(liveDevices, m.containerId)
              const hasLive =
                live?.latitude != null &&
                live?.longitude != null &&
                hasValidCoords(live.latitude, live.longitude)

              return (
                <div
                  key={m.id}
                  onClick={() => openMap(m)}
                  style={{
                    background:'#111827', border:'0.5px solid rgba(59,130,246,.15)',
                    borderRadius:12, padding:16, cursor: leaflet ? 'pointer' : 'default',
                  }}
                >
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                    <span style={{ fontSize:13, fontWeight:500, color:'#60a5fa' }}>{m.ref}</span>
                    <span style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'3px 9px', borderRadius:20, fontSize:10, fontWeight:500, background:STATUS[m.statut]?.bg, color:STATUS[m.statut]?.color }}>
                      {m.statut}
                    </span>
                  </div>

                  <p style={{ fontSize:14, fontWeight:500, color:'#e2e8f0', marginBottom:6 }}>{m.site}</p>

                  <div style={{ display:'flex', flexDirection:'column', gap:4, marginBottom:12 }}>
                    <p style={{ fontSize:11, color:'rgba(148,163,184,.55)' }}>🚛 {m.driver}</p>
                    <p style={{ fontSize:11, color:'rgba(148,163,184,.55)' }}>🔧 {m.technicien}</p>
                  </div>

                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'7px 10px', background:'rgba(59,130,246,.06)', border:'0.5px solid rgba(59,130,246,.12)', borderRadius:7 }}>
                    {hasLive ? (
                      <p style={{ fontSize:10, color:'#4ade80' }}>📡 Live : {live.latitude.toFixed(4)}, {live.longitude.toFixed(4)}</p>
                    ) : m.containerId ? (
                      <p style={{ fontSize:10, color:'rgba(234,179,8,.8)' }}>⏳ GPS en attente (IoT)</p>
                    ) : (
                      <p style={{ fontSize:10, color:'rgba(148,163,184,.5)' }}>Site : {m.hasCoords ? `${m.lat.toFixed(4)}, ${m.lng.toFixed(4)}` : '—'}</p>
                    )}
                    <p style={{ fontSize:10, color:'#60a5fa' }}>Carte →</p>
                  </div>
                </div>
              )
            })}
          </div>

        </main>
      </div>

      {selected && leaflet && (
        <MapModal
          mission={selected}
          liveGps={selectedLive}
          trackPoints={trackPoints}
          onClose={() => { setSelected(null); setTrackPoints([]) }}
        />
      )}
    </div>
  )
}
