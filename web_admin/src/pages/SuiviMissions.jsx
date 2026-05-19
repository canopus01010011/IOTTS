import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import Sidebar from '../components/Sidebar'
import TopBar  from '../components/TopBar'

const MOCK = [
  { id:1, ref:'MSN-091', site:'BTS Bab Ezzouar',  driver:'K. Benali',  technicien:'A. Hamid',   depart:'08:30', duree:'3h 45min', statut:'En route',   lat:36.7201, lng:3.1634, destLat:36.7372, destLng:3.1897 },
  { id:2, ref:'MSN-090', site:'Pylône Kouba',      driver:'M. Saadi',   technicien:'Y. Brahim',  depart:'09:00', duree:'2h 10min', statut:'Sur place',  lat:36.7218, lng:3.0847, destLat:36.7218, destLng:3.0847 },
  { id:3, ref:'MSN-089', site:'Site Rouiba',       driver:'O. Meziane', technicien:'N. Oukil',   depart:'07:45', duree:'1h 20min', statut:'Incident',   lat:36.7310, lng:3.2841, destLat:36.7310, destLng:3.2841 },
  { id:4, ref:'MSN-088', site:'Dar El Beida',      driver:'K. Benali',  technicien:'R. Ferhat',  depart:'10:00', duree:'—',        statut:'En attente', lat:36.6918, lng:3.2156, destLat:36.6918, destLng:3.2156 },
  { id:5, ref:'MSN-087', site:'Hussein Dey',       driver:'A. Hamid',   technicien:'A. Hamid',   depart:'06:30', duree:'4h 00min', statut:'Terminé',    lat:36.7456, lng:3.0962, destLat:36.7456, destLng:3.0962 },
  { id:6, ref:'MSN-086', site:'BTS Hydra',         driver:'M. Saadi',   technicien:'Y. Brahim',  depart:'11:00', duree:'—',        statut:'Annulé',     lat:36.7500, lng:3.0500, destLat:36.7500, destLng:3.0500 },
]

const STATUS = {
  'En route':   { bg:'rgba(59,130,246,.12)',  color:'#60a5fa',  dot:'#3b82f6'  },
  'Sur place':  { bg:'rgba(34,197,94,.1)',    color:'#4ade80',  dot:'#22c55e'  },
  'En attente': { bg:'rgba(234,179,8,.1)',    color:'#fbbf24',  dot:'#eab308'  },
  'Incident':   { bg:'rgba(239,68,68,.12)',   color:'#f87171',  dot:'#ef4444'  },
  'Terminé':    { bg:'rgba(148,163,184,.1)',  color:'#94a3b8',  dot:'#64748b'  },
  'Annulé':     { bg:'rgba(148,163,184,.08)', color:'#64748b',  dot:'#475569'  },
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

    if (mission.statut === 'En route') {
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
            {mission.statut === 'En route' && (
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
    axios.get('/api/missions/actives', { headers:{ Authorization:`Bearer ${localStorage.getItem('token')}` }})
      .then(r => setMissions(r.data))
      .catch(() => setMissions(MOCK))
  }, [])

  const filtres  = ['Tous','En route','Sur place','En attente','Incident','Terminé','Annulé']
  const displayed = filtre === 'Tous' ? missions : missions.filter(m => m.statut === filtre)

  const stats = {
    enRoute:  missions.filter(m => m.statut === 'En route').length,
    surPlace: missions.filter(m => m.statut === 'Sur place').length,
    incidents:missions.filter(m => m.statut === 'Incident').length,
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
              { label:'En route',  value:stats.enRoute,  color:'#60a5fa' },
              { label:'Sur place', value:stats.surPlace, color:'#4ade80' },
              { label:'Incidents', value:stats.incidents,color:'#f87171' },
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
                {(m.statut === 'En route' || m.statut === 'Sur place') && (
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