import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import BrandLogo from '../components/BrandLogo.jsx'
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
    borderRadius: 12,
    padding: '12px 14px',
    fontSize: 14,
    color: '#f8fafc',
    outline: 'none',
  }

  const labelStyle = {
    display: 'block',
    fontSize: 11,
    fontWeight: 600,
    color: 'rgba(139, 164, 190, 0.9)',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  }

  return (
    <div
      className="admin-page"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
      }}
    >
      <div style={{ marginBottom: 32 }}>
        <BrandLogo size={56} subtitle={t('app.admin')} />
      </div>

      <div className="admin-card" style={{ width: '100%', maxWidth: 400, padding: 32 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#f8fafc', marginBottom: 6 }}>
          {t('login.title')}
        </h2>
        <p style={{ fontSize: 13, color: 'rgba(139, 164, 190, 0.85)', marginBottom: 22 }}>
          {t('login.subtitle')}
        </p>
        <div style={{ marginBottom: 20 }}>
          <LanguageSelect />
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <label style={labelStyle}>{t('login.email')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@ericsson.com"
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
                borderRadius: 10,
                padding: '10px 12px',
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="admin-primary-btn"
            style={{
              opacity: loading ? 0.6 : 1,
              marginTop: 4,
              width: '100%',
              minHeight: 44,
              borderRadius: 12,
              fontSize: 14,
            }}
          >
            {loading ? t('login.loading') : t('login.submit')}
          </button>
        </form>
      </div>
    </div>
  )
}
