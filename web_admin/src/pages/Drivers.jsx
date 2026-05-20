import { useState, useEffect } from 'react'
import api from '../services/api'
import Sidebar from '../components/Sidebar'
import TopBar  from '../components/TopBar'

const avatarColors = ['#1d4ed8','#0f6e56','#712b13','#534ab7','#854f0b','#0c447c']

const MOCK = [
  { id:1, nom:'Karim Benali',   telephone:'+213 550 12 34', vehicule:'Camionnette 16-DZ-142', missions:24, statut:'Disponible' },
  { id:2, nom:'Ali Hamid',      telephone:'+213 661 98 76', vehicule:'Fourgon 09-DZ-871',     missions:18, statut:'En mission' },
  { id:3, nom:'Mohamed Saadi',  telephone:'+213 770 45 67', vehicule:'Pick-up 23-DZ-305',     missions:31, statut:'En mission' },
  { id:4, nom:'Omar Meziane',   telephone:'+213 699 23 45', vehicule:'Camionnette 07-DZ-490', missions:12, statut:'Disponible' },
  { id:5, nom:'Yacine Brahim',  telephone:'+213 555 67 89', vehicule:'Fourgon 14-DZ-228',     missions:9,  statut:'Indisponible'},
]

const statusStyle = {
  'Disponible':   { background:'rgba(34,197,94,.1)',  color:'#4ade80' },
  'En mission':   { background:'rgba(59,130,246,.12)',color:'#60a5fa' },
  'Indisponible': { background:'rgba(148,163,184,.1)',color:'#94a3b8' },
}

export default function Drivers() {
  const [drivers, setDrivers] = useState([])
  const [search, setSearch]   = useState('')

  useEffect(() => {
    api.get('/users?role=driver')
      .then((r) => setDrivers(r.data.users || []))
      .catch(() => setDrivers(MOCK))
  }, [])

  const displayed = drivers.filter((d) => {
    const name = d.full_name || d.nom || ''
    const email = d.email || ''
    return (
      name.toLowerCase().includes(search.toLowerCase()) ||
      email.toLowerCase().includes(search.toLowerCase()) ||
      (d.vehicule || '').toLowerCase().includes(search.toLowerCase())
    )
  })

  const stats = {
    total:  drivers.length,
    dispo:  drivers.filter(d => d.statut === 'Disponible').length,
    actifs: drivers.filter(d => d.statut === 'En mission').length,
  }

  return (
    <div className="flex min-h-screen" style={{ background:'#0a0f1e' }}>
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopBar title="Drivers" />
        <main className="flex-1 p-6">

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { label:'Total drivers',   value: stats.total,  color:'#e2e8f0' },
              { label:'Disponibles',     value: stats.dispo,  color:'#4ade80' },
              { label:'En mission',      value: stats.actifs, color:'#60a5fa' },
            ].map(s => (
              <div key={s.label} className="rounded-xl p-4"
                style={{ background:'#111827', border:'0.5px solid rgba(59,130,246,.15)' }}>
                <p className="text-xl font-medium" style={{ color: s.color }}>{s.value}</p>
                <p className="text-xs mt-1" style={{ color:'rgba(148,163,184,.5)' }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Recherche */}
          <div className="mb-4">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher un driver ou véhicule…"
              style={{
                background:'#0d1426', border:'0.5px solid rgba(59,130,246,.2)',
                borderRadius:7, padding:'8px 14px', fontSize:13,
                color:'#e2e8f0', outline:'none', width:280,
              }}
            />
          </div>

          {/* Grille drivers */}
          <div className="grid grid-cols-2 gap-4">
            {displayed.map((d, i) => (
              <div key={d.id} className="rounded-xl p-5"
                style={{ background:'#111827', border:'0.5px solid rgba(59,130,246,.15)' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div style={{
                    width:44, height:44, borderRadius:'50%',
                    background: avatarColors[i % avatarColors.length],
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:14, fontWeight:500, color:'#e2e8f0', flexShrink:0
                  }}>
                    {d.nom.split(' ').map(n => n[0]).join('').slice(0,2)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium" style={{ color:'#e2e8f0' }}>{d.full_name || d.nom || 'Conducteur'}</p>
                    <p className="text-xs" style={{ color:'rgba(148,163,184,.5)' }}>{d.email || d.telephone || 'N/A'}</p>
                  </div>
                  <span style={{
                    padding:'2px 10px', borderRadius:20, fontSize:11, fontWeight:500,
                    background: 'rgba(148,163,184,.1)', color: '#94a3b8'
                  }}>
                    {d.statut || 'N/A'}
                  </span>
                </div>

                <div style={{ borderTop:'0.5px solid rgba(59,130,246,.1)', paddingTop:12 }}>
                  <div className="flex justify-between">
                    <div>
                      <p style={{ fontSize:10, color:'rgba(148,163,184,.4)' }}>Véhicule</p>
                      <p style={{ fontSize:12, color:'#cbd5e1', marginTop:2 }}>{d.vehicle || d.vehicule || 'N/A'}</p>
                    </div>
                    <div className="text-right">
                      <p style={{ fontSize:10, color:'rgba(148,163,184,.4)' }}>Missions totales</p>
                      <p style={{ fontSize:18, fontWeight:500, color:'#60a5fa', marginTop:2 }}>{d.missions || 0}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </main>
      </div>
    </div>
  )
}
