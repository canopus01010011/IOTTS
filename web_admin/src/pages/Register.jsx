import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import logo from '../assets/logo.js'

export default function Register() {
  const [form, setForm] = useState({
    nom: '', email: '', telephone: '', password: '', confirm: ''
  })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const set = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }
    if (form.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.')
      return
    }
    setLoading(true)
    try {
      await axios.post('/api/auth/register', {
        nom:       form.nom,
        email:     form.email,
        telephone: form.telephone,
        password:  form.password,
        role:      'admin',
      })
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la création du compte.')
    } finally {
      setLoading(false)
    }
  }

  const inp = {
    width: '100%',
    background: '#0d1426',
    border: '0.5px solid rgba(59,130,246,.25)',
    borderRadius: 7,
    padding: '10px 12px',
    fontSize: 13,
    color: '#e2e8f0',
    outline: 'none',
  }

  const lbl = {
    display: 'block',
    fontSize: 11,
    color: 'rgba(148,163,184,.5)',
    marginBottom: 5,
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0a0f1e',
      padding: '24px 16px',
    }}>

      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <img
          src={`data:image/png;base64,${logo}`}
          alt="ErcTrac"
          style={{ width: 48, height: 48, borderRadius: 12, objectFit: 'cover' }}
        />
        <div>
          <p style={{ fontSize: 18, fontWeight: 500, color: '#e2e8f0', lineHeight: 1.2 }}>
            Erc<span style={{ color: '#3b82f6' }}>Trac</span>
          </p>
          <p style={{ fontSize: 11, color: 'rgba(148,163,184,.4)' }}>Télécom Admin</p>
        </div>
      </div>

      {/* Card */}
      <div style={{
        width: '100%',
        maxWidth: 400,
        background: '#111827',
        border: '0.5px solid rgba(59,130,246,.2)',
        borderRadius: 14,
        padding: 32,
      }}>
        <h2 style={{ fontSize: 18, fontWeight: 500, color: '#e2e8f0', marginBottom: 4 }}>
          Créer un compte admin
        </h2>
        <p style={{ fontSize: 12, color: 'rgba(148,163,184,.45)', marginBottom: 24 }}>
          Accès complet à la plateforme ErcTrac
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Nom complet */}
          <div>
            <label style={lbl}>Nom complet</label>
            <input
              name="nom" value={form.nom} onChange={set}
              placeholder="Karim Benali"
              required style={inp}
            />
          </div>

          {/* Email */}
          <div>
            <label style={lbl}>Adresse e-mail</label>
            <input
              type="email" name="email" value={form.email} onChange={set}
              placeholder="admin@erctrac.dz"
              required style={inp}
            />
          </div>

          {/* Téléphone */}
          <div>
            <label style={lbl}>Numéro de téléphone</label>
            <input
              type="tel" name="telephone" value={form.telephone} onChange={set}
              placeholder="+213 5XX XX XX XX"
              required style={inp}
            />
          </div>

          {/* Mot de passe */}
          <div>
            <label style={lbl}>Mot de passe</label>
            <input
              type="password" name="password" value={form.password} onChange={set}
              placeholder="••••••••"
              required style={inp}
            />
          </div>

          {/* Confirmation */}
          <div>
            <label style={lbl}>Confirmer le mot de passe</label>
            <input
              type="password" name="confirm" value={form.confirm} onChange={set}
              placeholder="••••••••"
              required style={inp}
            />
          </div>

          {/* Rôle badge (fixe) */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 12px',
            background: 'rgba(59,130,246,.06)',
            border: '0.5px solid rgba(59,130,246,.15)',
            borderRadius: 7,
          }}>
            <span style={{ fontSize: 11, color: 'rgba(148,163,184,.5)' }}>Rôle :</span>
            <span style={{
              background: 'rgba(59,130,246,.15)',
              border: '0.5px solid rgba(59,130,246,.3)',
              color: '#60a5fa',
              fontSize: 11, fontWeight: 500,
              padding: '2px 10px', borderRadius: 20,
            }}>
              Administrateur
            </span>
          </div>

          {/* Erreur */}
          {error && (
            <p style={{
              fontSize: 12, color: '#f87171',
              background: 'rgba(239,68,68,.08)',
              border: '0.5px solid rgba(239,68,68,.2)',
              borderRadius: 6, padding: '8px 12px',
            }}>
              {error}
            </p>
          )}

          {/* Bouton */}
          <button
            type="submit" disabled={loading}
            style={{
              background: '#1d4ed8', color: '#e2e8f0', border: 'none',
              borderRadius: 8, padding: 11, fontSize: 13,
              fontWeight: 500, cursor: 'pointer',
              opacity: loading ? .6 : 1, marginTop: 4,
            }}
          >
            {loading ? 'Création en cours…' : 'Créer le compte'}
          </button>
        </form>

        {/* Lien login */}
        <p style={{ textAlign: 'center', fontSize: 12, marginTop: 16, color: 'rgba(148,163,184,.4)' }}>
          Déjà un compte ?{' '}
          <Link to="/login" style={{ color: '#60a5fa', textDecoration: 'none' }}>
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  )
}
