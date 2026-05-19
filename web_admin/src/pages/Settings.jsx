import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import TopBar  from '../components/TopBar'

export default function Settings() {
  const [nom, setNom]           = useState('Administrateur')
  const [email, setEmail]       = useState('admin@erctrac.dz')
  const [mdpActuel, setMdpA]    = useState('')
  const [mdpNouv, setMdpN]      = useState('')
  const [mdpConf, setMdpC]      = useState('')
  const [saved, setSaved]       = useState(false)

  const handleSave = (e) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const card = {
    background:'#111827', border:'0.5px solid rgba(59,130,246,.18)',
    borderRadius:10, padding:24, marginBottom:16,
  }
  const sec = {
    fontSize:11, fontWeight:500, color:'#60a5fa',
    letterSpacing:'.05em', textTransform:'uppercase', marginBottom:16,
  }
  const inp = {
    background:'#0d1426', border:'0.5px solid rgba(59,130,246,.25)',
    color:'#e2e8f0', borderRadius:7, padding:'9px 12px',
    fontSize:13, width:'100%', outline:'none',
  }
  const lbl = { display:'block', fontSize:11, color:'rgba(148,163,184,.55)', marginBottom:5 }

  return (
    <div className="flex min-h-screen" style={{ background:'#0a0f1e' }}>
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopBar title="Paramètres" />
        <main className="flex-1 p-6 max-w-2xl">

          {saved && (
            <div className="mb-4 px-4 py-3 rounded-lg text-sm font-medium"
              style={{ background:'rgba(34,197,94,.1)', color:'#4ade80', border:'0.5px solid rgba(34,197,94,.2)' }}>
              Modifications enregistrées.
            </div>
          )}

          <form onSubmit={handleSave}>

            {/* Profil */}
            <div style={card}>
              <p style={sec}>Profil administrateur</p>
              <div className="flex items-center gap-4 mb-5">
                <div style={{
                  width:56, height:56, borderRadius:'50%',
                  background:'#1d4ed8', display:'flex', alignItems:'center',
                  justifyContent:'center', fontSize:18, fontWeight:500, color:'#e2e8f0'
                }}>A</div>
                <div>
                  <p style={{ fontSize:15, fontWeight:500, color:'#e2e8f0' }}>{nom}</p>
                  <p style={{ fontSize:12, color:'rgba(148,163,184,.5)' }}>{email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label style={lbl}>Nom complet</label>
                  <input value={nom} onChange={e => setNom(e.target.value)} style={inp} />
                </div>
                <div>
                  <label style={lbl}>Adresse e-mail</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={inp} />
                </div>
              </div>
            </div>

            {/* Mot de passe */}
            <div style={card}>
              <p style={sec}>Changer le mot de passe</p>
              <div className="flex flex-col gap-4">
                <div>
                  <label style={lbl}>Mot de passe actuel</label>
                  <input type="password" value={mdpActuel} onChange={e => setMdpA(e.target.value)}
                    placeholder="••••••••" style={inp} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label style={lbl}>Nouveau mot de passe</label>
                    <input type="password" value={mdpNouv} onChange={e => setMdpN(e.target.value)}
                      placeholder="••••••••" style={inp} />
                  </div>
                  <div>
                    <label style={lbl}>Confirmer</label>
                    <input type="password" value={mdpConf} onChange={e => setMdpC(e.target.value)}
                      placeholder="••••••••" style={inp} />
                  </div>
                </div>
                {mdpNouv && mdpConf && mdpNouv !== mdpConf && (
                  <p style={{ fontSize:11, color:'#f87171' }}>Les mots de passe ne correspondent pas.</p>
                )}
              </div>
            </div>

            {/* Bouton save */}
            <div className="flex justify-end">
              <button type="submit"
                style={{
                  background:'#1d4ed8', color:'#e2e8f0', border:'none',
                  borderRadius:8, padding:'10px 28px', fontSize:13,
                  fontWeight:500, cursor:'pointer'
                }}>
                Enregistrer
              </button>
            </div>

          </form>
        </main>
      </div>
    </div>
  )
}
