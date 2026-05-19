import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Sidebar from '../components/Sidebar'
import TopBar  from '../components/TopBar'

const JSON_EXEMPLE = `{
  "reference": "MSN-2024-0088",
  "date": "2024-04-15",
  "heure": "08:30",
  "adresseDepart": "Dépôt Central, Alger",
  "adresseArrivee": "Site BTS Bab Ezzouar",
  "driver": "Karim Benali",
  "conteneur": "CTN-2024-001",
  "techniciens": [
    { "nom": "Ali Hamid",    "id": "TECH-001" },
    { "nom": "Omar Meziane", "id": "TECH-002" }
  ],
  "equipements": ["Fibre optique", "Câblage réseau"],
  "description": "Remplacement câbles fibre optique secteur Nord."
}`

export default function CreateMission() {
  const navigate = useNavigate()
  const fileRef  = useRef(null)

  const [mission,   setMission]   = useState(null)
  const [fileName,  setFileName]  = useState('')
  const [jsonError, setJsonError] = useState('')
  const [isDragging,setIsDragging]= useState(false)
  const [loading,   setLoading]   = useState(false)
  const [success,   setSuccess]   = useState(false)

  const parseJSON = (text, name) => {
    setJsonError('')
    try {
      const data = JSON.parse(text)
      setMission(data)
      setFileName(name)
    } catch {
      setJsonError('Fichier JSON invalide. Vérifiez le format.')
      setMission(null)
    }
  }

  const handleFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.name.endsWith('.json')) { setJsonError('Veuillez sélectionner un fichier .json'); return }
    const reader = new FileReader()
    reader.onload = (ev) => parseJSON(ev.target.result, file.name)
    reader.readAsText(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => parseJSON(ev.target.result, file.name)
    reader.readAsText(file)
  }

  const handleLancer = async () => {
    setLoading(true)
    try {
      await axios.post('/api/missions', mission, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      setSuccess(true)
      setTimeout(() => navigate('/dashboard/historique'), 1500)
    } catch {
      setJsonError('Erreur lors de la création. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  const downloadExample = () => {
    const blob = new Blob([JSON_EXEMPLE], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = 'mission-exemple.json'; a.click()
    URL.revokeObjectURL(url)
  }

  const reset = () => { setMission(null); setFileName(''); setJsonError('') }

  const card = { background:'#111827', border:'0.5px solid rgba(59,130,246,.18)', borderRadius:10, padding:20, marginBottom:14 }
  const sec  = { fontSize:11, fontWeight:500, color:'#60a5fa', letterSpacing:'.05em', textTransform:'uppercase', marginBottom:14 }
  const row  = { display:'flex', flexDirection:'column', gap:3 }
  const rowL = { fontSize:10, color:'rgba(148,163,184,.45)' }
  const rowV = { fontSize:13, color:'#e2e8f0' }

  return (
    <div className="flex min-h-screen" style={{ background:'#0a0f1e' }}>
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopBar title="Créer une mission" />
        <main className="flex-1 p-6 max-w-2xl">

          {success && (
            <div className="mb-4 px-4 py-3 rounded-lg text-sm font-medium"
              style={{ background:'rgba(34,197,94,.1)', color:'#4ade80', border:'0.5px solid rgba(34,197,94,.2)' }}>
              Mission lancée avec succès ! Redirection…
            </div>
          )}

          {/* ── ÉTAPE 1 : Upload ── */}
          {!mission && (
            <div style={card}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
                <p style={sec}>Importer le fichier JSON</p>
                <button onClick={downloadExample} type="button"
                  style={{ background:'rgba(59,130,246,.08)', border:'0.5px solid rgba(59,130,246,.2)', color:'#60a5fa', borderRadius:6, padding:'4px 12px', fontSize:11, cursor:'pointer' }}>
                  Télécharger exemple
                </button>
              </div>

              {/* Drag & drop */}
              <div
                onClick={() => fileRef.current.click()}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                style={{
                  border: isDragging ? '1.5px dashed #3b82f6' : '1px dashed rgba(59,130,246,.3)',
                  borderRadius:10, padding:'36px 20px', textAlign:'center',
                  background: isDragging ? 'rgba(59,130,246,.06)' : 'rgba(59,130,246,.02)',
                  cursor:'pointer', transition:'all .15s',
                }}>
                <div style={{ fontSize:36, marginBottom:10 }}>📂</div>
                <p style={{ fontSize:14, color:'rgba(148,163,184,.7)', marginBottom:4 }}>
                  Glisse ton fichier JSON ici
                </p>
                <p style={{ fontSize:11, color:'rgba(148,163,184,.4)' }}>ou clique pour sélectionner</p>
                <input ref={fileRef} type="file" accept=".json" onChange={handleFile} style={{ display:'none' }} />
              </div>

              {jsonError && (
                <p style={{ fontSize:11, color:'#f87171', marginTop:10 }}>{jsonError}</p>
              )}

              {/* Format */}
              <div style={{ marginTop:14, background:'#0d1426', border:'0.5px solid rgba(59,130,246,.12)', borderRadius:8, padding:12 }}>
                <p style={{ fontSize:10, color:'rgba(148,163,184,.4)', marginBottom:6 }}>Format JSON attendu :</p>
                <pre style={{ fontSize:10, color:'rgba(148,163,184,.45)', lineHeight:1.7, margin:0, overflowX:'auto' }}>{JSON_EXEMPLE}</pre>
              </div>
            </div>
          )}

          {/* ── ÉTAPE 2 : Confirmation ── */}
          {mission && (
            <>
              {/* Header confirmation */}
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <span style={{ fontSize:18 }}>✅</span>
                  <div>
                    <p style={{ fontSize:13, fontWeight:500, color:'#4ade80' }}>Fichier importé avec succès</p>
                    <p style={{ fontSize:11, color:'rgba(148,163,184,.4)' }}>{fileName}</p>
                  </div>
                </div>
                <button onClick={reset} type="button"
                  style={{ background:'rgba(239,68,68,.08)', border:'0.5px solid rgba(239,68,68,.2)', color:'#f87171', borderRadius:6, padding:'4px 12px', fontSize:11, cursor:'pointer' }}>
                  Changer fichier
                </button>
              </div>

              {/* Référence + date */}
              <div style={card}>
                <p style={sec}>Détails de la mission</p>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:16 }}>
                  <div style={row}>
                    <span style={rowL}>Référence</span>
                    <span style={{ ...rowV, color:'#60a5fa', fontWeight:500 }}>{mission.reference || '—'}</span>
                  </div>
                  <div style={row}>
                    <span style={rowL}>Date</span>
                    <span style={rowV}>{mission.date || '—'}</span>
                  </div>
                  <div style={row}>
                    <span style={rowL}>Heure</span>
                    <span style={rowV}>{mission.heure || '—'}</span>
                  </div>
                  <div style={row}>
                    <span style={rowL}>Adresse départ</span>
                    <span style={rowV}>{mission.adresseDepart || '—'}</span>
                  </div>
                  <div style={{ ...row, gridColumn:'span 2' }}>
                    <span style={rowL}>Adresse site (arrivée)</span>
                    <span style={rowV}>{mission.adresseArrivee || '—'}</span>
                  </div>
                </div>
              </div>

              {/* Driver & véhicule */}
              <div style={card}>
                <p style={sec}>Driver & véhicule</p>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                  <div style={row}>
                    <span style={rowL}>Driver assigné</span>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:4 }}>
                      <div style={{ width:30, height:30, borderRadius:'50%', background:'#1d4ed8', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:500, color:'#e2e8f0', flexShrink:0 }}>
                        {mission.driver ? mission.driver.split(' ').map(n=>n[0]).join('').slice(0,2) : '?'}
                      </div>
                      <span style={rowV}>{mission.driver || '—'}</span>
                    </div>
                  </div>
                  <div style={row}>
                    <span style={rowL}>Conteneur</span>
                    <span style={rowV}>{mission.conteneur || '—'}</span>
                  </div>
                </div>
              </div>

              {/* Techniciens */}
              <div style={card}>
                <p style={sec}>
                  Techniciens
                  <span style={{ marginLeft:8, background:'rgba(59,130,246,.15)', border:'0.5px solid rgba(59,130,246,.3)', color:'#60a5fa', fontSize:10, padding:'1px 8px', borderRadius:20 }}>
                    {Array.isArray(mission.techniciens) ? mission.techniciens.length : 0}
                  </span>
                </p>
                {Array.isArray(mission.techniciens) && mission.techniciens.length > 0
                  ? (
                    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                      {mission.techniciens.map((t, i) => (
                        <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', background:'#0d1426', border:'0.5px solid rgba(59,130,246,.15)', borderRadius:8 }}>
                          <div style={{ width:34, height:34, borderRadius:'50%', background:'#0f6e56', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:500, color:'#e2e8f0', flexShrink:0 }}>
                            {t.nom ? t.nom.split(' ').map(n=>n[0]).join('').slice(0,2) : '?'}
                          </div>
                          <div>
                            <p style={{ fontSize:13, color:'#e2e8f0', fontWeight:500 }}>{t.nom}</p>
                            <p style={{ fontSize:10, color:'rgba(148,163,184,.4)' }}>{t.id}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                  : <p style={{ fontSize:12, color:'rgba(148,163,184,.4)' }}>Aucun technicien dans le fichier.</p>
                }
              </div>

              {/* Équipements */}
              <div style={card}>
                <p style={sec}>Équipements télécom</p>
                {Array.isArray(mission.equipements) && mission.equipements.length > 0
                  ? (
                    <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                      {mission.equipements.map((eq, i) => (
                        <span key={i} style={{ background:'rgba(59,130,246,.12)', border:'0.5px solid rgba(59,130,246,.25)', color:'#93c5fd', fontSize:12, padding:'5px 12px', borderRadius:7 }}>
                          {eq}
                        </span>
                      ))}
                    </div>
                  )
                  : <p style={{ fontSize:12, color:'rgba(148,163,184,.4)' }}>Aucun équipement.</p>
                }
              </div>

              {/* Description */}
              {mission.description && (
                <div style={card}>
                  <p style={sec}>Description</p>
                  <p style={{ fontSize:13, color:'#cbd5e1', lineHeight:1.7 }}>{mission.description}</p>
                </div>
              )}

              {/* Bouton lancer */}
              <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:4 }}>
                <button onClick={() => navigate('/dashboard')} type="button"
                  style={{ background:'transparent', border:'0.5px solid rgba(148,163,184,.2)', color:'rgba(148,163,184,.6)', borderRadius:8, padding:'11px 20px', fontSize:13, cursor:'pointer' }}>
                  Annuler
                </button>
                <button onClick={handleLancer} disabled={loading}
                  style={{ background:'#1d4ed8', color:'#e2e8f0', border:'none', borderRadius:8, padding:'11px 28px', fontSize:13, fontWeight:500, cursor:'pointer', opacity: loading ? .6 : 1 }}>
                  {loading ? 'Lancement…' : '🚀 Lancer la mission'}
                </button>
              </div>
            </>
          )}

        </main>
      </div>
    </div>
  )
}