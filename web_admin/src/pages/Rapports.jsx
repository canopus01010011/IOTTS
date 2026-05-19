import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Sidebar from '../components/Sidebar'
import TopBar  from '../components/TopBar'

const badgeStyle = {
  'Validé':     { background:'rgba(34,197,94,.1)',  color:'#4ade80' },
  'En attente': { background:'rgba(234,179,8,.1)',  color:'#fbbf24' },
  'Rejeté':     { background:'rgba(239,68,68,.12)', color:'#f87171' },
}
const avatarColors = ['#1d4ed8','#0f6e56','#712b13','#534ab7','#854f0b']

const MOCK = [
  { id:1, reference:'MSN-087', site:'BTS Bab Ezzouar', gps:'36.7372, 3.1897', date:'12 Avr 2024', heureDebut:'08:30', heureFin:'12:15', statut:'Validé',     technicien:{ nom:'K. Benali',  telephone:'+213 550 12 34' }},
  { id:2, reference:'MSN-086', site:'Site Kouba Nord', gps:'36.7218, 3.0847', date:'11 Avr 2024', heureDebut:'09:00', heureFin:'14:30', statut:'En attente', technicien:{ nom:'A. Hamid',   telephone:'+213 661 98 76' }},
  { id:3, reference:'MSN-085', site:'Pylône Rouiba',   gps:'36.7310, 3.2841', date:'10 Avr 2024', heureDebut:'07:45', heureFin:'11:00', statut:'En attente', technicien:{ nom:'M. Saadi',   telephone:'+213 770 45 67' }},
  { id:4, reference:'MSN-084', site:'Dar El Beida',    gps:'36.6918, 3.2156', date:'09 Avr 2024', heureDebut:'10:00', heureFin:'15:45', statut:'Validé',     technicien:{ nom:'K. Benali',  telephone:'+213 550 12 34' }},
  { id:5, reference:'MSN-083', site:'Hussein Dey',     gps:'36.7456, 3.0962', date:'08 Avr 2024', heureDebut:'06:30', heureFin:'10:00', statut:'Rejeté',     technicien:{ nom:'O. Meziane', telephone:'+213 699 23 45' }},
]

export default function Rapports() {
  const navigate = useNavigate()
  const [rapports, setRapports] = useState([])
  const [filtre, setFiltre]     = useState('Tous')
  const [search, setSearch]     = useState('')

  useEffect(() => {
    axios.get('/api/rapports', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(r => setRapports(r.data))
      .catch(() => setRapports(MOCK))
  }, [])

  const filtres  = ['Tous','En attente','Validé','Rejeté']
  const displayed = rapports.filter(r => {
    const mF = filtre === 'Tous' || r.statut === filtre
    const mS = r.technicien.nom.toLowerCase().includes(search.toLowerCase()) ||
               r.reference.toLowerCase().includes(search.toLowerCase())
    return mF && mS
  })

  const stats = {
    total:  rapports.length,
    valide: rapports.filter(r => r.statut === 'Validé').length,
    attend: rapports.filter(r => r.statut === 'En attente').length,
  }

  const inp = {
    background:'#0d1426', border:'0.5px solid rgba(59,130,246,.2)',
    borderRadius:7, padding:'5px 12px', fontSize:12,
    color:'#e2e8f0', outline:'none', width:220,
  }

  return (
    <div className="flex min-h-screen" style={{ background:'#0a0f1e' }}>
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopBar title="Rapports techniciens" />
        <main className="flex-1 p-6">

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { label:'Rapports soumis',      value: stats.total,  color:'#e2e8f0' },
              { label:'Validés',              value: stats.valide, color:'#4ade80' },
              { label:'En attente validation',value: stats.attend, color:'#fbbf24' },
            ].map(s => (
              <div key={s.label} className="rounded-xl p-4"
                style={{ background:'#111827', border:'0.5px solid rgba(59,130,246,.15)' }}>
                <p className="text-xl font-medium" style={{ color: s.color }}>{s.value}</p>
                <p className="text-xs mt-1" style={{ color:'rgba(148,163,184,.5)' }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Filtres */}
          <div className="flex items-center gap-2 flex-wrap mb-4">
            {filtres.map(f => (
              <button key={f} onClick={() => setFiltre(f)}
                className="px-3 py-1 rounded-full text-xs"
                style={filtre === f
                  ? { background:'rgba(59,130,246,.18)', border:'0.5px solid #3b82f6', color:'#60a5fa' }
                  : { background:'rgba(59,130,246,.06)', border:'0.5px solid rgba(59,130,246,.15)', color:'rgba(148,163,184,.6)' }
                }>
                {f}
              </button>
            ))}
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher…" style={{ ...inp, marginLeft:'auto' }} />
          </div>

          {/* Table */}
          <div className="rounded-xl overflow-hidden"
            style={{ background:'#111827', border:'0.5px solid rgba(59,130,246,.15)' }}>
            <div style={{
              display:'grid', gridTemplateColumns:'.7fr 1.3fr 1.1fr 1.4fr .9fr .8fr',
              padding:'9px 16px', fontSize:10, color:'rgba(99,179,255,.45)',
              letterSpacing:'.05em', textTransform:'uppercase',
              borderBottom:'0.5px solid rgba(59,130,246,.1)'
            }}>
              {['Réf. mission','Technicien','Site / GPS','Intervention','Statut','Action'].map(h => (
                <span key={h}>{h}</span>
              ))}
            </div>

            {displayed.length === 0
              ? <p className="text-center py-10 text-sm" style={{ color:'rgba(148,163,184,.4)' }}>
                  Aucun rapport trouvé.
                </p>
              : displayed.map((r, i) => (
                <div key={r.id} style={{
                  display:'grid', gridTemplateColumns:'.7fr 1.3fr 1.1fr 1.4fr .9fr .8fr',
                  padding:'11px 16px', fontSize:11, color:'#cbd5e1',
                  borderBottom:'0.5px solid rgba(255,255,255,.03)', alignItems:'center'
                }}>
                  <span style={{ color:'#60a5fa', fontWeight:500 }}>{r.reference}</span>

                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <div style={{
                      width:28, height:28, borderRadius:'50%',
                      background: avatarColors[i % avatarColors.length],
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:10, fontWeight:500, color:'#e2e8f0', flexShrink:0
                    }}>
                      {r.technicien.nom.split(' ').map(n=>n[0]).join('').slice(0,2)}
                    </div>
                    <div>
                      <p style={{ fontSize:11, color:'#e2e8f0' }}>{r.technicien.nom}</p>
                      <p style={{ fontSize:10, color:'rgba(148,163,184,.4)' }}>{r.technicien.telephone}</p>
                    </div>
                  </div>

                  <div>
                    <p style={{ fontSize:11 }}>{r.site}</p>
                    <p style={{ fontSize:10, color:'rgba(59,130,246,.55)' }}>📍 {r.gps}</p>
                  </div>

                  <div>
                    <p style={{ fontSize:10, color:'rgba(148,163,184,.5)' }}>{r.heureDebut} → {r.heureFin}</p>
                    <p style={{ fontSize:10, color:'rgba(148,163,184,.4)' }}>{r.date}</p>
                  </div>

                  <span style={{
                    display:'inline-flex', alignItems:'center', gap:4,
                    padding:'2px 8px', borderRadius:20, fontSize:10, fontWeight:500,
                    ...badgeStyle[r.statut]
                  }}>
                    <span style={{ width:5, height:5, borderRadius:'50%', background:'currentColor' }} />
                    {r.statut}
                  </span>

                  <button onClick={() => navigate(`/dashboard/rapports/${r.id}`)}
                    style={{
                      background:'rgba(59,130,246,.1)', border:'0.5px solid rgba(59,130,246,.3)',
                      borderRadius:6, padding:'4px 10px', fontSize:10,
                      color:'#60a5fa', cursor:'pointer'
                    }}>
                    Voir détail
                  </button>
                </div>
              ))
            }
          </div>
        </main>
      </div>
    </div>
  )
}
