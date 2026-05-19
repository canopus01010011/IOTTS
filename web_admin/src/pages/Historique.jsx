import { useState, useEffect } from 'react'
import axios from 'axios'
import Sidebar from '../components/Sidebar'
import TopBar  from '../components/TopBar'

const badgeStyle = {
  'En cours':   { background: 'rgba(59,130,246,.12)', color: '#60a5fa' },
  'En attente': { background: 'rgba(234,179,8,.1)',   color: '#fbbf24' },
  'Incident':   { background: 'rgba(239,68,68,.12)',  color: '#f87171' },
  'Annulé':     { background: 'rgba(148,163,184,.1)', color: '#94a3b8' },
  'Terminé':    { background: 'rgba(34,197,94,.1)',   color: '#4ade80' },
}

const MOCK = [
  { id:1,  ref:'MSN-087', site:'BTS Bab Ezzouar',  driver:'K. Benali',  equip:'Fibre + Antenne',  date:'12/04/2024', statut:'Terminé'   },
  { id:2,  ref:'MSN-086', site:'Site Kouba Nord',   driver:'A. Hamid',   equip:'Câblage réseau',   date:'11/04/2024', statut:'En cours'  },
  { id:3,  ref:'MSN-085', site:'Pylône Rouiba',     driver:'M. Saadi',   equip:'Antenne / pylône', date:'10/04/2024', statut:'Incident'  },
  { id:4,  ref:'MSN-084', site:'Dar El Beida',      driver:'K. Benali',  equip:'Groupe élec.',     date:'09/04/2024', statut:'Annulé'    },
  { id:5,  ref:'MSN-083', site:'Hussein Dey',       driver:'O. Meziane', equip:'Clim. site',       date:'08/04/2024', statut:'Terminé'   },
  { id:6,  ref:'MSN-082', site:'Site Hydra',        driver:'A. Hamid',   equip:'Fibre optique',    date:'07/04/2024', statut:'Terminé'   },
  { id:7,  ref:'MSN-081', site:'BTS Bordj',         driver:'M. Saadi',   equip:'Câblage réseau',   date:'06/04/2024', statut:'En attente'},
  { id:8,  ref:'MSN-080', site:'Pylône Baraki',     driver:'K. Benali',  equip:'Antenne 4G',       date:'05/04/2024', statut:'Terminé'   },
]

export default function Historique() {
  const [missions, setMissions] = useState([])
  const [filtre, setFiltre]     = useState('Tous')
  const [search, setSearch]     = useState('')
  const [page, setPage]         = useState(1)
  const PER_PAGE = 6

  useEffect(() => {
    axios.get('/api/missions', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(r => setMissions(r.data))
      .catch(() => setMissions(MOCK))
  }, [])

  const filtres = ['Tous', 'Terminé', 'En cours', 'En attente', 'Incident', 'Annulé']

  const filtered = missions.filter(m => {
    const matchF = filtre === 'Tous' || m.statut === filtre
    const matchS = m.site.toLowerCase().includes(search.toLowerCase()) ||
                   m.driver.toLowerCase().includes(search.toLowerCase()) ||
                   m.ref.toLowerCase().includes(search.toLowerCase())
    return matchF && matchS
  })

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const displayed  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const stats = {
    total:    missions.length,
    termines: missions.filter(m => m.statut === 'Terminé').length,
    incidents:missions.filter(m => m.statut === 'Incident').length,
    annules:  missions.filter(m => m.statut === 'Annulé').length,
  }

  const inp = {
    background: '#0d1426', border: '0.5px solid rgba(59,130,246,.2)',
    borderRadius: 7, padding: '5px 12px', fontSize: 12,
    color: '#e2e8f0', outline: 'none', width: 220,
  }

  return (
    <div className="flex min-h-screen" style={{ background: '#0a0f1e' }}>
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopBar title="Historique des missions" />
        <main className="flex-1 p-6">

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3 mb-5">
            {[
              { label:'Total missions', value: stats.total,     color:'#e2e8f0' },
              { label:'Terminées',      value: stats.termines,  color:'#4ade80' },
              { label:'Incidents',      value: stats.incidents, color:'#f87171' },
              { label:'Annulées',       value: stats.annules,   color:'#94a3b8' },
            ].map(s => (
              <div key={s.label} className="rounded-xl p-4"
                style={{ background:'#111827', border:'0.5px solid rgba(59,130,246,.15)' }}>
                <p className="text-xl font-medium" style={{ color: s.color }}>{s.value}</p>
                <p className="text-xs mt-1" style={{ color:'rgba(148,163,184,.5)' }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Filtres + recherche */}
          <div className="flex items-center gap-2 flex-wrap mb-4">
            {filtres.map(f => (
              <button key={f} onClick={() => { setFiltre(f); setPage(1) }}
                className="px-3 py-1 rounded-full text-xs"
                style={filtre === f
                  ? { background:'rgba(59,130,246,.18)', border:'0.5px solid #3b82f6', color:'#60a5fa' }
                  : { background:'rgba(59,130,246,.06)', border:'0.5px solid rgba(59,130,246,.15)', color:'rgba(148,163,184,.6)' }
                }>
                {f}
              </button>
            ))}
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              placeholder="Rechercher…"
              style={{ ...inp, marginLeft: 'auto' }}
            />
          </div>

          {/* Tableau */}
          <div className="rounded-xl overflow-hidden"
            style={{ background:'#111827', border:'0.5px solid rgba(59,130,246,.15)' }}>

            {/* En-tête */}
            <div style={{
              display:'grid', gridTemplateColumns:'.7fr 1.3fr 1fr 1.3fr .8fr .9fr',
              padding:'9px 16px', fontSize:10, color:'rgba(99,179,255,.45)',
              letterSpacing:'.05em', textTransform:'uppercase',
              borderBottom:'0.5px solid rgba(59,130,246,.1)'
            }}>
              {['Réf.','Site','Driver','Équipement','Date','Statut'].map(h => (
                <span key={h}>{h}</span>
              ))}
            </div>

            {/* Lignes */}
            {displayed.length === 0
              ? <p className="text-center py-10 text-sm" style={{ color:'rgba(148,163,184,.4)' }}>
                  Aucune mission trouvée.
                </p>
              : displayed.map(m => (
                <div key={m.id} style={{
                  display:'grid', gridTemplateColumns:'.7fr 1.3fr 1fr 1.3fr .8fr .9fr',
                  padding:'11px 16px', fontSize:12, color:'#cbd5e1',
                  borderBottom:'0.5px solid rgba(255,255,255,.03)', alignItems:'center'
                }}>
                  <span style={{ color:'#60a5fa', fontWeight:500 }}>{m.ref}</span>
                  <span>{m.site}</span>
                  <span style={{ color:'rgba(148,163,184,.7)' }}>{m.driver}</span>
                  <span style={{ color:'rgba(148,163,184,.5)', fontSize:11 }}>{m.equip}</span>
                  <span style={{ color:'rgba(148,163,184,.5)', fontSize:11 }}>{m.date}</span>
                  <span style={{
                    display:'inline-flex', alignItems:'center', gap:4,
                    padding:'2px 8px', borderRadius:20, fontSize:10, fontWeight:500,
                    ...badgeStyle[m.statut]
                  }}>
                    <span style={{ width:5, height:5, borderRadius:'50%', background:'currentColor' }} />
                    {m.statut}
                  </span>
                </div>
              ))
            }
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  style={{
                    width:30, height:30, borderRadius:6, fontSize:12,
                    background: p === page ? '#1d4ed8' : 'rgba(59,130,246,.08)',
                    border: p === page ? 'none' : '0.5px solid rgba(59,130,246,.15)',
                    color: p === page ? '#fff' : 'rgba(148,163,184,.6)',
                    cursor:'pointer'
                  }}>
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
