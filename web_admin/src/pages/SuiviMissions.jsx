import { useState, useEffect, useRef } from 'react'
import api from '../services/api'
import Sidebar from '../components/Sidebar'
import TopBar  from '../components/TopBar'

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

const formatMission = (mission) => {
  const site = mission.Site || {}
  const startAt = mission.start_date || mission.scheduled_start_date
  return {
    id: mission.id,
    ref: mission.id,
    site: site.name || mission.site_id || 'N/A',
    driver: mission.driver?.full_name || 'N/A',
    technicien: mission.technician?.full_name || 'N/A',
    depart: startAt
      ? new Date(startAt).toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit' })
      : '—',
    duree: formatDuration(mission.scheduled_start_date, mission.scheduled_end_date),
    statut: statusMap[mission.status] || mission.status || 'N/A',
    statusValue: mission.status,
    lat: Number(site.latitude) || 0,
    lng: Number(site.longitude) || 0,
    destLat: Number(site.latitude) || 0,
    destLng: Number(site.longitude) || 0,
  }
}

function MapModal({ mission, onClose }) {
  const mapRef = useRef(null)
  const mapObj = useRef(null)
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (!window.L || !mapRef.current) return
    const L = window.L
    const map = L.map(mapRef.current, { zoomControl:true, attributionControl:false })
      .setView([mission.lat, mission.lng], 14)
    mapObj.current = map

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom:19 }).addTo(map)

    const truckIcon = L.divIcon({
      className:'',
      html:`<div style="width:44px;height:44px;background:#1d4ed8;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid #60a5fa;font-size:22px;box-shadow:0 0 0 6px rgba(59,130,246,.2);">🚛</div>`,
      iconSize:[44,44], iconAnchor:[22,22],
    })
    const siteIcon = L.divIcon({
      className:'',
      html:`<div style="width:38px;height:38px;background:#0f6e56;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid #4ade80;font-size:20px;">📡</div>`,
      iconSize:[38,38], iconAnchor:[19,19],
    })
    const departIcon = L.divIcon({
      className:'',
      html:`<div style="width:30px;height:30px;background:#854f0b;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid #fbbf24;font-size:16px;">🏭</div>`,
      iconSize:[30,30], iconAnchor:[15,15],
    })

    L.marker([mission.lat, mission.lng], { icon: truckIcon })
      .addTo(map).bindPopup(`<b>${mission.driver}</b><br/>Position actuelle`)

    L.marker([mission.destLat, mission.destLng], { icon: siteIcon })
      .addTo(map).bindPopup(`<b>${mission.site}</b><br/>Destination`)

    if (mission.statut === 'En cours') {
      const dLat = mission.destLat - 0.05
      const dLng = mission.destLng - 0.05
      L.marker([dLat, dLng], { icon: departIcon })
        .addTo(map).bindPopup('Point de départ')
      L.polyline([[dLat, dLng],[mission.lat, mission.lng],[mission.destLat, mission.destLng]], {
        color:'#3b82f6', weight:3, dashArray:'8 6', opacity:.8
      }).addTo(map)
      map.fitBounds([[dLat,dLng],[mission.destLat,mission.destLng]], { padding:[60,60] })
    } else {
      map.setView([mission.lat, mission.lng], 15)
    }

    return () => { if (mapObj.current) { mapObj.current.remove(); mapObj.current = null } }
  }, [mission.id])

  const fmt = (s) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.8)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:16 }}
      onClick={onClose}>
      <div style={{ width:'100%', maxWidth:960, background:'#111827', border:'0.5px solid rgba(59,130,246,.3)', borderRadius:14, overflow:'hidden' }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 18px', background:'#080d1a', borderBottom:'0.5px solid rgba(59,130,246,.15)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <span style={{ fontSize:14, fontWeight:500, color:'#60a5fa' }}>{mission.ref}</span>
            <span style={{ fontSize:13, color:'#e2e8f0', fontWeight:500 }}>{mission.site}</span>
            <span style={{ padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:500, background:STATUS[mission.statut]?.bg, color:STATUS[mission.statut]?.color }}>
              {mission.statut}
            </span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            {mission.statut === 'En cours' && (
              <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                <span style={{ width:7, height:7, borderRadius:'50%', background:'#4ade80', display:'inline-block', animation:'pulse 1.5s infinite' }}></span>
                <span style={{ fontSize:11, color:'#4ade80' }}>Live • {fmt(elapsed)}</span>
              </div>
            )}
            <button onClick={onClose}
              style={{ background:'rgba(239,68,68,.1)', border:'0.5px solid rgba(239,68,68,.2)', color:'#f87171', borderRadius:6, padding:'5px 14px', fontSize:12, cursor:'pointer' }}>
              ✕ Fermer
            </button>
          </div>
        </div>

        {/* Carte */}
        <div ref={mapRef} style={{ width:'100%', height:440 }} />

        {/* Footer infos */}
        <div style={{ padding:'12px 18px', background:'#0d1426', borderTop:'0.5px solid rgba(59,130,246,.1)', display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14 }}>
          <div>
            <p style={{ fontSize:10, color:'rgba(148,163,184,.4)', marginBottom:3 }}>Driver</p>
            <p style={{ fontSize:13, color:'#e2e8f0', fontWeight:500 }}>🚛 {mission.driver}</p>
          </div>
          <div>
            <p style={{ fontSize:10, color:'rgba(148,163,184,.4)', marginBottom:3 }}>Heure départ</p>
            <p style={{ fontSize:13, color:'#e2e8f0', fontWeight:500 }}>⏰ {mission.depart}</p>
          </div>
          <div>
            <p style={{ fontSize:10, color:'rgba(148,163,184,.4)', marginBottom:3 }}>Durée</p>
            <p style={{ fontSize:13, color:'#e2e8f0', fontWeight:500 }}>⏱ {mission.duree}</p>
          </div>
          <div>
            <p style={{ fontSize:10, color:'rgba(148,163,184,.4)', marginBottom:3 }}>Position GPS</p>
            <p style={{ fontSize:12, color:'#60a5fa' }}>📍 {mission.lat.toFixed(4)}, {mission.lng.toFixed(4)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SuiviMissions() {
  const [missions,  setMissions]  = useState([])
  const [selected,  setSelected]  = useState(null)
  const [filtre,    setFiltre]    = useState('Tous')
  const [leaflet,   setLeaflet]   = useState(false)

  useEffect(() => {
    if (!document.getElementById('leaflet-css')) {
      const l = document.createElement('link')
      l.id='leaflet-css'; l.rel='stylesheet'
      l.href='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(l)
    }
    if (!window.L) {
      const s = document.createElement('script')
      s.src='https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
      s.onload = () => setLeaflet(true)
      document.head.appendChild(s)
    } else setLeaflet(true)
  }, [])

  useEffect(() => {
    api.get('/missions')
      .then((r) => setMissions((r.data.missions || []).map(formatMission)))
      .catch(() => setMissions([]))
  }, [])

  const filtres  = ['Tous','En attente','En cours','Terminé']
  const displayed = filtre === 'Tous' ? missions : missions.filter(m => m.statut === filtre)

  const stats = {
    enCours:  missions.filter(m => m.statut === 'En cours').length,
    enAttente: missions.filter(m => m.statut === 'En attente').length,
    termines: missions.filter(m => m.statut === 'Terminé').length,
  }

  return (
    <div className="flex min-h-screen" style={{ background:'#0a0f1e' }}>
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopBar title="Suivi des missions" />
        <main className="flex-1 p-6">

          {/* Stats */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:20 }}>
            {[
              { label:'En cours',   value:stats.enCours,   color:'#60a5fa' },
              { label:'En attente', value:stats.enAttente, color:'#fbbf24' },
              { label:'Terminées',  value:stats.termines,  color:'#4ade80' },
            ].map(s => (
              <div key={s.label} style={{ background:'#111827', border:'0.5px solid rgba(59,130,246,.15)', borderRadius:12, padding:'14px 18px' }}>
                <p style={{ fontSize:26, fontWeight:500, color:s.color }}>{s.value}</p>
                <p style={{ fontSize:12, color:'rgba(148,163,184,.5)', marginTop:4 }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Filtres */}
          <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:20 }}>
            {filtres.map(f => (
              <button key={f} onClick={() => setFiltre(f)}
                style={filtre===f
                  ? { background:'rgba(59,130,246,.18)', border:'0.5px solid #3b82f6', color:'#60a5fa', padding:'5px 14px', borderRadius:20, fontSize:12, cursor:'pointer' }
                  : { background:'rgba(59,130,246,.06)', border:'0.5px solid rgba(59,130,246,.15)', color:'rgba(148,163,184,.6)', padding:'5px 14px', borderRadius:20, fontSize:12, cursor:'pointer' }
                }>
                {f}
              </button>
            ))}
          </div>

          {/* Grille missions */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14 }}>
            {displayed.map(m => (
              <div key={m.id}
                onClick={() => leaflet && setSelected(m)}
                style={{
                  background:'#111827', border:'0.5px solid rgba(59,130,246,.15)',
                  borderRadius:12, padding:16, cursor:'pointer', transition:'all .15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor='#3b82f6'; e.currentTarget.style.background='rgba(59,130,246,.06)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(59,130,246,.15)'; e.currentTarget.style.background='#111827' }}
              >
                {/* Header */}
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                  <span style={{ fontSize:13, fontWeight:500, color:'#60a5fa' }}>{m.ref}</span>
                  <span style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'3px 9px', borderRadius:20, fontSize:10, fontWeight:500, background:STATUS[m.statut]?.bg, color:STATUS[m.statut]?.color }}>
                    <span style={{ width:5, height:5, borderRadius:'50%', background:STATUS[m.statut]?.dot }}></span>
                    {m.statut}
                  </span>
                </div>

                {/* Site */}
                <p style={{ fontSize:14, fontWeight:500, color:'#e2e8f0', marginBottom:6 }}>{m.site}</p>

                {/* Infos */}
                <div style={{ display:'flex', flexDirection:'column', gap:4, marginBottom:12 }}>
                  <p style={{ fontSize:11, color:'rgba(148,163,184,.55)' }}>🚛 {m.driver}</p>
                  <p style={{ fontSize:11, color:'rgba(148,163,184,.55)' }}>🔧 {m.technicien}</p>
                  <p style={{ fontSize:11, color:'rgba(148,163,184,.45)' }}>⏰ Départ {m.depart} · ⏱ {m.duree}</p>
                </div>

                {/* GPS si en route */}
                {(m.statut === 'En cours' || m.statut === 'En attente') && m.lat && m.lng && (
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'7px 10px', background:'rgba(59,130,246,.06)', border:'0.5px solid rgba(59,130,246,.12)', borderRadius:7 }}>
                    <p style={{ fontSize:10, color:'rgba(59,130,246,.7)' }}>📍 {m.lat.toFixed(4)}, {m.lng.toFixed(4)}</p>
                    <p style={{ fontSize:10, color:'#60a5fa' }}>Voir carte →</p>
                  </div>
                )}
              </div>
            ))}
          </div>

        </main>
      </div>

      {selected && leaflet && (
        <MapModal mission={selected} onClose={() => setSelected(null)} />
      )}

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
    </div>
  )
}