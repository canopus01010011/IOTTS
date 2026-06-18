import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import AnimatedBackground from '../components/AnimatedBackground.jsx'
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
      setError(err?.response?.data?.error || err?.message || t('login.invalid'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-page login-wrap">
      <AnimatedBackground variant="login" />

      <div className="login-logo">
        <BrandLogo size={56} subtitle={t('app.admin')} />
      </div>

      <div className="admin-card login-card">
        <h2
          style={{
            fontSize: 24,
            fontWeight: 800,
            color: '#f8fafc',
            marginBottom: 8,
            letterSpacing: '-0.02em',
          }}
        >
          {t('login.title')}
        </h2>
        <p className="admin-subtle" style={{ marginBottom: 22 }}>
          {t('login.subtitle')}
        </p>
        <div style={{ marginBottom: 20 }}>
          <LanguageSelect />
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <label
              style={{
                display: 'block',
                fontSize: 11,
                fontWeight: 700,
                color: 'rgba(139, 164, 190, 0.9)',
                marginBottom: 8,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              {t('login.email')}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@ericsson.com"
              required
              style={{ width: '100%', padding: '13px 16px', fontSize: 14 }}
            />
          </div>

          <div className="animate-fade-in-up" style={{ animationDelay: '0.28s' }}>
            <label
              style={{
                display: 'block',
                fontSize: 11,
                fontWeight: 700,
                color: 'rgba(139, 164, 190, 0.9)',
                marginBottom: 8,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              {t('login.password')}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('login.passwordPlaceholder')}
              required
              style={{ width: '100%', padding: '13px 16px', fontSize: 14 }}
            />
          </div>

          {error && (
            <p
              className="animate-scale-in"
              style={{
                fontSize: 12,
                color: '#f87171',
                background: 'rgba(239,68,68,.1)',
                border: '1px solid rgba(239,68,68,.25)',
                borderRadius: 12,
                padding: '12px 14px',
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="admin-primary-btn animate-fade-in-up"
            style={{
              opacity: loading ? 0.65 : 1,
              marginTop: 8,
              width: '100%',
              minHeight: 48,
              fontSize: 15,
              animationDelay: '0.35s',
            }}
          >
            {loading ? t('login.loading') : t('login.submit')}
          </button>
        </form>
      </div>
    </div>
  )
}
