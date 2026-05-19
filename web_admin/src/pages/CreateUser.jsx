import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Sidebar from '../components/Sidebar'
import TopBar  from '../components/TopBar'

const ROLES = [
  { id:'driver',     label:'Driver',     desc:'Transporte les équipements sur site',        icon:'🚛', color:'#3b82f6', bg:'rgba(59,130,246,.1)', border:'rgba(59,130,246,.3)'  },
  { id:'technician', label:'Technicien', desc:'Installe et répare les équipements télécom', icon:'🔧', color:'#4ade80', bg:'rgba(34,197,94,.08)', border:'rgba(34,197,94,.25)'  },
]

export default function CreateUser() {
  const navigate = useNavigate()
  const [role, setRole] = useState('')
  const [form, setForm] = useState({
    nom:'', identifiant:'', cin:'', email:'', telephone:'',
    password:'', confirm:'', vehicule:'', specialite:''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError]     = useState('')

  const set = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!role) { setError('Veuillez sélectionner un rôle.'); return }
    if (form.password !== form.confirm) { setError('Les mots de passe ne correspondent pas.'); return }
    if (form.password.length < 6) { setError('Mot de passe trop court (min. 6 caractères).'); return }
    setLoading(true)
    try {
      await axios.post('/api/users', {
        full_name: form.nom,
        email: form.email,
        phone: form.telephone,
        password: form.password,
        role,
      }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      setSuccess(true)
      setTimeout(() => navigate('/dashboard/users'), 1500)
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la création.')
    } finally {
      setLoading(false)
    }
  }

  const inp  = { width:'100%', background:'#0d1426', border:'0.5px solid rgba(59,130,246,.25)', borderRadius:7, padding:'10px 12px', fontSize:13, color:'#e2e8f0', outline:'none' }
  const lbl  = { display:'block', fontSize:11, color:'rgba(148,163,184,.55)', marginBottom:5 }
  const card = { background:'#111827', border:'0.5px solid rgba(59,130,246,.18)', borderRadius:10, padding:20, marginBottom:16 }
  const sec  = { fontSize:11, fontWeight:500, color:'#60a5fa', letterSpacing:'.05em', textTransform:'uppercase', marginBottom:14 }

  return (
    <div className="flex min-h-screen" style={{ background:'#0a0f1e' }}>
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopBar title="Créer un compte utilisateur" />
        <main className="flex-1 p-6 max-w-2xl">

          {success && (
            <div className="mb-4 px-4 py-3 rounded-lg text-sm font-medium"
              style={{ background:'rgba(34,197,94,.1)', color:'#4ade80', border:'0.5px solid rgba(34,197,94,.2)' }}>
              Compte créé avec succès ! Redirection…
            </div>
          )}
          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg text-sm"
              style={{ background:'rgba(239,68,68,.1)', color:'#f87171', border:'0.5px solid rgba(239,68,68,.2)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            {/* Rôle */}
            <div style={card}>
              <p style={sec}>Choisir le rôle</p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                {ROLES.map(r => (
                  <div key={r.id} onClick={() => setRole(r.id)} style={{
                    border: role === r.id ? `1.5px solid ${r.color}` : '0.5px solid rgba(59,130,246,.15)',
                    background: role === r.id ? r.bg : 'transparent',
                    borderRadius:10, padding:16, cursor:'pointer', transition:'all .15s',
                  }}>
                    <div style={{ fontSize:28, marginBottom:8 }}>{r.icon}</div>
                    <p style={{ fontSize:14, fontWeight:500, color: role === r.id ? r.color : '#e2e8f0', marginBottom:4 }}>{r.label}</p>
                    <p style={{ fontSize:11, color:'rgba(148,163,184,.5)', lineHeight:1.5 }}>{r.desc}</p>
                    {role === r.id && (
                      <div style={{ display:'inline-flex', alignItems:'center', gap:4, marginTop:8, background:r.bg, border:`0.5px solid ${r.border}`, color:r.color, fontSize:10, fontWeight:500, padding:'2px 8px', borderRadius:20 }}>
                        Sélectionné
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Infos personnelles */}
            <div style={card}>
              <p style={sec}>Informations personnelles</p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                <div>
                  <label style={lbl}>Nom complet</label>
                  <input name="nom" value={form.nom} onChange={set}
                    placeholder="Karim Benali" required style={inp} />
                </div>
                <div>
                  <label style={lbl}>Identifiant (ID)</label>
                  <input name="identifiant" value={form.identifiant} onChange={set}
                    placeholder={role === 'driver' ? 'DRV-001' : role === 'technician' ? 'TECH-001' : 'ID-001'}
                    required style={inp} />
                </div>
                <div>
                  <label style={lbl}>Numéro carte nationale</label>
                  <input name="cin" value={form.cin} onChange={set}
                    placeholder="123456789" required style={inp} />
                </div>
                <div>
                  <label style={lbl}>Numéro de téléphone</label>
                  <input type="tel" name="telephone" value={form.telephone} onChange={set}
                    placeholder="+213 5XX XX XX XX" required style={inp} />
                </div>
                <div style={{ gridColumn:'1 / -1' }}>
                  <label style={lbl}>Adresse e-mail</label>
                  <input type="email" name="email" value={form.email} onChange={set}
                    placeholder="karim@erctrac.dz" required style={inp} />
                </div>
              </div>
            </div>

            {/* Champ driver */}
            {role === 'driver' && (
              <div style={card}>
                <p style={sec}>Informations driver</p>
                <label style={lbl}>Véhicule / immatriculation</label>
                <input name="vehicule" value={form.vehicule} onChange={set}
                  placeholder="Camionnette — 16-DZ-142" style={inp} />
              </div>
            )}

            {/* Champ technicien */}
            {role === 'technician' && (
              <div style={card}>
                <p style={sec}>Informations technicien</p>
                <label style={lbl}>Spécialité</label>
                <select name="specialite" value={form.specialite} onChange={set}
                  style={{ ...inp, cursor:'pointer' }}>
                  <option value=""                style={{ background:'#0d1426' }}>Choisir une spécialité</option>
                  <option value="Fibre optique"      style={{ background:'#0d1426' }}>Fibre optique</option>
                  <option value="Antenne / pylône"   style={{ background:'#0d1426' }}>Antenne / pylône</option>
                  <option value="Câblage réseau"     style={{ background:'#0d1426' }}>Câblage réseau</option>
                  <option value="Groupe électrogène" style={{ background:'#0d1426' }}>Groupe électrogène</option>
                  <option value="Climatisation site" style={{ background:'#0d1426' }}>Climatisation site</option>
                  <option value="Polyvalent"         style={{ background:'#0d1426' }}>Polyvalent</option>
                </select>
              </div>
            )}

            {/* Mot de passe */}
            <div style={card}>
              <p style={sec}>Mot de passe</p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                <div>
                  <label style={lbl}>Mot de passe</label>
                  <input type="password" name="password" value={form.password} onChange={set}
                    placeholder="••••••••" required style={inp} />
                </div>
                <div>
                  <label style={lbl}>Confirmer</label>
                  <input type="password" name="confirm" value={form.confirm} onChange={set}
                    placeholder="••••••••" required style={inp} />
                </div>
              </div>
              {form.password && form.confirm && form.password !== form.confirm && (
                <p style={{ fontSize:11, color:'#f87171', marginTop:8 }}>Les mots de passe ne correspondent pas.</p>
              )}
            </div>

            {/* Actions */}
            <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
              <button type="button" onClick={() => navigate('/dashboard')}
                style={{ background:'transparent', border:'0.5px solid rgba(148,163,184,.2)', color:'rgba(148,163,184,.6)', borderRadius:8, padding:'10px 20px', fontSize:13, cursor:'pointer' }}>
                Annuler
              </button>
              <button type="submit" disabled={loading || !role}
                style={{ background: !role ? 'rgba(29,78,216,.4)' : '#1d4ed8', color:'#e2e8f0', border:'none', borderRadius:8, padding:'10px 24px', fontSize:13, fontWeight:500, cursor: !role ? 'not-allowed' : 'pointer', opacity: loading ? .6 : 1 }}>
                {loading ? 'Création…' : `Créer le compte${role ? ' ' + ROLES.find(r=>r.id===role)?.label : ''}`}
              </button>
            </div>

          </form>
        </main>
      </div>
    </div>
  )
}