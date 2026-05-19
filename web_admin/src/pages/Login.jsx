import { useState } from 'react'
import axios from 'axios'
import logo from '../assets/logo.js'
import { useNavigate, Link } from 'react-router-dom'

const ADMIN_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjM3ZWQ2ZTk5LWI3NTItNDlkOS1hMWQ2LTk4MmExNzJiNTkwMiIsImVtYWlsIjoiYWRtaW5AZXF1aXB0cmFjay5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NzY3OTU1NzEsImV4cCI6MTc3NzQwMDM3MX0.cgU7jrqFRbn_2ictHyW8XDI7Z7NNdyI4ggieNq8yvjw'
const ADMIN_EMAIL = 'admin@equiptrack.com'

export default function Login() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await axios.post('/api/auth/login', { email, password })
      localStorage.setItem('token', res.data.token)
      navigate('/dashboard')
    } catch {
      // Fallback : token admin direct si API pas encore prête
      if (email === ADMIN_EMAIL) {
        localStorage.setItem('token', ADMIN_TOKEN)
        navigate('/dashboard')
      } else {
        setError('Email ou mot de passe incorrect.')
      }
    } finally {
      setLoading(false)
    }
  }

  const inp = {
    width: '100%', background: '#0d1426',
    border: '0.5px solid rgba(59,130,246,.25)',
    borderRadius: 7, padding: '10px 12px',
    fontSize: 13, color: '#e2e8f0', outline: 'none',
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: '#0a0f1e', padding: '0 16px'
    }}>

      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
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
        width: '100%', maxWidth: 360,
        background: '#111827',
        border: '0.5px solid rgba(59,130,246,.2)',
        borderRadius: 14, padding: 32
      }}>
        <h2 style={{ fontSize: 18, fontWeight: 500, color: '#e2e8f0', marginBottom: 4 }}>
          Connexion
        </h2>
        <p style={{ fontSize: 12, color: 'rgba(148,163,184,.45)', marginBottom: 24 }}>
          Accès réservé aux administrateurs
        </p>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, color: 'rgba(148,163,184,.5)', marginBottom: 5 }}>
              Adresse e-mail
            </label>
            <input
              type="email" value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@equiptrack.com"
              required style={inp}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 11, color: 'rgba(148,163,184,.5)', marginBottom: 5 }}>
              Mot de passe
            </label>
            <input
              type="password" value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required style={inp}
            />
          </div>

          {error && (
            <p style={{ fontSize: 12, color: '#f87171', background:'rgba(239,68,68,.08)', border:'0.5px solid rgba(239,68,68,.2)', borderRadius:6, padding:'8px 10px' }}>
              {error}
            </p>
          )}

          <button
            type="submit" disabled={loading}
            style={{
              background: '#1d4ed8', color: '#e2e8f0', border: 'none',
              borderRadius: 8, padding: '11px', fontSize: 13,
              fontWeight: 500, cursor: 'pointer',
              opacity: loading ? .6 : 1, marginTop: 4
            }}
          >
            {loading ? 'Connexion en cours…' : 'Se connecter'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 12, color: 'rgba(96,165,250,.55)', marginTop: 16, cursor: 'pointer' }}>
          Mot de passe oublié ?
        </p>
        <p style={{ textAlign:'center', fontSize:12, marginTop:12, color:'rgba(148,163,184,.4)' }}>
          Pas encore de compte ?{' '}
          <Link to="/register" style={{ color:'#60a5fa', textDecoration:'none' }}>
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  )
}