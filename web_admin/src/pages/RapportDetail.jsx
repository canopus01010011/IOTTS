import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import Sidebar from '../components/Sidebar'
import TopBar  from '../components/TopBar'

const MOCK = {
  id:1, reference:'MSN-087', site:'BTS Bab Ezzouar', gps:'36.7372, 3.1897',
  date:'12 Avr 2024', heureDebut:'08:30', heureFin:'12:15', statut:'En attente',
  technicien:{ nom:'Karim Benali', telephone:'+213 550 12 34' },
  travaux:'Remplacement câbles fibre optique secteur Nord. Installation nouvelle antenne 4G sur pylône P-12. Vérification connexions réseau.',
  materiel:['Fibre optique 50m','Connecteurs SC/APC','Antenne 4G','Câbles RJ45'],
  incidents:'Pylône P-12 légèrement corrodé — signalé pour maintenance préventive.',
  photos:[1,2,3],
}

export default function RapportDetail() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const [rapport, setRapport]       = useState(null)
  const [commentaire, setComment]   = useState('')
  const [loading, setLoading]       = useState(false)
  const [actionDone, setActionDone] = useState('')

  useEffect(() => {
    axios.get(`/api/rapports/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(r => setRapport(r.data))
      .catch(() => setRapport(MOCK))
  }, [id])

  const handleAction = async (action) => {
    setLoading(true)
    try {
      await axios.patch(`/api/rapports/${id}`, { statut: action, commentaire }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      setActionDone(action)
      setTimeout(() => navigate('/dashboard/rapports'), 1500)
    } catch {
      setActionDone('')
      alert('Erreur lors de la mise à jour.')
    } finally {
      setLoading(false)
    }
  }

  const card = { background:'#111827', border:'0.5px solid rgba(59,130,246,.18)', borderRadius:10, padding:20, marginBottom:14 }
  const sec  = { fontSize:11, fontWeight:500, color:'#60a5fa', letterSpacing:'.05em', textTransform:'uppercase', marginBottom:12 }
  const lbl  = { fontSize:11, color:'rgba(148,163,184,.5)', marginBottom:3 }
  const val  = { fontSize:13, color:'#e2e8f0' }

  if (!rapport) return (
    <div className="flex min-h-screen" style={{ background:'#0a0f1e' }}>
      <Sidebar />
      <div className="flex-1 flex items-center justify-center">
        <p style={{ color:'rgba(148,163,184,.4)', fontSize:13 }}>Chargement…</p>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen" style={{ background:'#0a0f1e' }}>
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopBar title={`Rapport — ${rapport.reference}`} />
        <main className="flex-1 p-6 max-w-3xl">

          {actionDone && (
            <div className="mb-4 px-4 py-3 rounded-lg text-sm font-medium"
              style={actionDone === 'Validé'
                ? { background:'rgba(34,197,94,.1)', color:'#4ade80', border:'0.5px solid rgba(34,197,94,.2)' }
                : { background:'rgba(239,68,68,.1)', color:'#f87171', border:'0.5px solid rgba(239,68,68,.2)' }
              }>
              Rapport {actionDone.toLowerCase()} avec succès. Redirection…
            </div>
          )}

          {/* Technicien */}
          <div style={card}>
            <p style={sec}>Technicien</p>
            <div className="grid grid-cols-3 gap-4">
              <div><p style={lbl}>Nom</p><p style={val}>{rapport.technicien.nom}</p></div>
              <div><p style={lbl}>Téléphone</p><p style={val}>{rapport.technicien.telephone}</p></div>
              <div><p style={lbl}>Réf. mission</p><p style={{ ...val, color:'#60a5fa' }}>{rapport.reference}</p></div>
            </div>
          </div>

          {/* Site & GPS */}
          <div style={card}>
            <p style={sec}>Site & localisation</p>
            <div className="grid grid-cols-2 gap-4">
              <div><p style={lbl}>Nom du site</p><p style={val}>{rapport.site}</p></div>
              <div>
                <p style={lbl}>Coordonnées GPS</p>
                <p style={{ ...val, color:'#60a5fa' }}>📍 {rapport.gps}</p>
              </div>
            </div>
          </div>

          {/* Horaires */}
          <div style={card}>
            <p style={sec}>Horaires d'intervention</p>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div><p style={lbl}>Date</p><p style={val}>{rapport.date}</p></div>
              <div><p style={lbl}>Heure début</p><p style={val}>{rapport.heureDebut}</p></div>
              <div><p style={lbl}>Heure fin</p><p style={val}>{rapport.heureFin}</p></div>
            </div>

            <div className="mb-4">
              <p style={lbl}>Travaux effectués</p>
              <p style={{ ...val, lineHeight:1.7, marginTop:4 }}>{rapport.travaux}</p>
            </div>

            <div className="mb-4">
              <p style={lbl}>Matériel utilisé</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {rapport.materiel.map(m => (
                  <span key={m} style={{
                    background:'rgba(59,130,246,.08)', border:'0.5px solid rgba(59,130,246,.2)',
                    borderRadius:6, padding:'3px 10px', fontSize:11, color:'#93c5fd'
                  }}>{m}</span>
                ))}
              </div>
            </div>

            <div>
              <p style={lbl}>Problèmes / incidents</p>
              <p style={{ ...val, color: rapport.incidents ? '#fbbf24' : 'rgba(148,163,184,.4)', marginTop:4 }}>
                {rapport.incidents || 'Aucun incident signalé'}
              </p>
            </div>
          </div>

          {/* Photos */}
          {rapport.photos?.length > 0 && (
            <div style={card}>
              <p style={sec}>Photos du site</p>
              <div className="grid grid-cols-3 gap-3">
                {rapport.photos.map((_, i) => (
                  <div key={i} style={{
                    background:'#0d1426', border:'0.5px solid rgba(59,130,246,.15)',
                    borderRadius:8, height:80, display:'flex', alignItems:'center',
                    justifyContent:'center', fontSize:11, color:'rgba(148,163,184,.4)'
                  }}>
                    📷 Photo {i + 1}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Validation admin */}
          <div style={card}>
            <p style={sec}>Validation admin</p>
            <textarea
              value={commentaire}
              onChange={e => setComment(e.target.value)}
              placeholder="Commentaire pour le technicien (optionnel)…"
              rows={3}
              style={{
                width:'100%', background:'#0d1426',
                border:'0.5px solid rgba(59,130,246,.25)',
                borderRadius:7, padding:'10px 12px',
                fontSize:13, color:'#e2e8f0', outline:'none',
                resize:'vertical', marginBottom:14
              }}
            />
            <div className="flex gap-3">
              <button onClick={() => handleAction('Validé')} disabled={loading}
                style={{
                  background:'rgba(34,197,94,.12)', border:'0.5px solid rgba(34,197,94,.3)',
                  color:'#4ade80', borderRadius:8, padding:'9px 20px',
                  fontSize:13, fontWeight:500, cursor:'pointer', opacity: loading ? .6 : 1
                }}>
                Valider le rapport
              </button>
              <button onClick={() => handleAction('Rejeté')} disabled={loading}
                style={{
                  background:'rgba(239,68,68,.1)', border:'0.5px solid rgba(239,68,68,.25)',
                  color:'#f87171', borderRadius:8, padding:'9px 20px',
                  fontSize:13, cursor:'pointer', opacity: loading ? .6 : 1
                }}>
                Rejeter
              </button>
              <button onClick={() => navigate('/dashboard/rapports')}
                style={{
                  background:'transparent', border:'0.5px solid rgba(148,163,184,.2)',
                  color:'rgba(148,163,184,.6)', borderRadius:8,
                  padding:'9px 20px', fontSize:13, cursor:'pointer'
                }}>
                Retour
              </button>
            </div>
          </div>

        </main>
      </div>
    </div>
  )
}
