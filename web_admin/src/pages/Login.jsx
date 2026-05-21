import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'
import logo from '../assets/logo.js'
import LanguageSelect from '../components/LanguageSelect.jsx'
import { useLanguage } from '../i18n.jsx'

export default function Login() {
  const { t } = useLanguage()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/auth/login', { email, password })
      const user = res?.data?.user
      const tokens = res?.data?.tokens

      if (!user || user.role !== 'admin') {
        localStorage.removeItem('token')
        localStorage.removeItem('userRole')
        setError(t('login.denied'))
        return
      }

      localStorage.setItem('token', tokens.accessToken)
      localStorage.setItem('userRole', 'admin')
      navigate('/dashboard')
    } catch (err) {
      setError(
        err?.response?.data?.error ||
        err?.message ||
        t('login.invalid'),
      )
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%',
    background: 'var(--surface-2)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    padding: '11px 12px',
    fontSize: 13,
    color: '#f8fafc',
    outline: 'none',
  }

  const labelStyle = {
    display: 'block',
    fontSize: 11,
    color: 'rgba(148,163,184,.68)',
    marginBottom: 6,
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background:
          'radial-gradient(circle at 50% 0%, rgba(59,130,246,.2), transparent 32rem), linear-gradient(180deg, #020617 0%, #0a0f1e 100%)',
        padding: '0 16px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <img
          src={`data:image/png;base64,${logo}`}
          alt="ErcTrac"
          style={{
            width: 50,
            height: 50,
            borderRadius: 10,
            objectFit: 'cover',
            border: '1px solid rgba(96,165,250,.24)',
          }}
        />
        <div>
          <p style={{ fontSize: 20, fontWeight: 800, color: '#f8fafc', lineHeight: 1.2 }}>
            Erc<span style={{ color: '#3b82f6' }}>Trac</span>
          </p>
          <p style={{ fontSize: 12, color: 'rgba(148,163,184,.68)' }}>{t('app.admin')}</p>
        </div>
      </div>

      <div className="admin-card" style={{ width: '100%', maxWidth: 380, padding: 30 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#f8fafc', marginBottom: 5 }}>
          {t('login.title')}
        </h2>
        <p style={{ fontSize: 12, color: 'rgba(148,163,184,.68)', marginBottom: 24 }}>
          {t('login.subtitle')}
        </p>
        <div style={{ marginBottom: 18 }}>
          <LanguageSelect />
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={labelStyle}>{t('login.email')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@equiptrack.com"
              required
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>{t('login.password')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('login.passwordPlaceholder')}
              required
              style={inputStyle}
            />
          </div>

          {error && (
            <p
              style={{
                fontSize: 12,
                color: '#f87171',
                background: 'rgba(239,68,68,.08)',
                border: '1px solid rgba(239,68,68,.2)',
                borderRadius: 8,
                padding: '9px 10px',
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="admin-primary-btn"
            style={{ opacity: loading ? 0.6 : 1, marginTop: 4, width: '100%' }}
          >
            {loading ? t('login.loading') : t('login.submit')}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 12, color: 'rgba(96,165,250,.72)', marginTop: 16 }}>
          {t('login.forgot')}
        </p>
        <p style={{ textAlign: 'center', fontSize: 12, marginTop: 12, color: 'rgba(148,163,184,.58)' }}>
          {t('login.noAccount')}{' '}
          <Link to="/register" style={{ color: '#60a5fa', textDecoration: 'none', fontWeight: 700 }}>
            {t('login.createAccount')}
          </Link>
        </p>
      </div>
    </div>
  )
}
