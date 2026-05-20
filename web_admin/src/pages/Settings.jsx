import { useState, useEffect } from 'react'
import api from '../services/api'
import Sidebar from '../components/Sidebar'
import TopBar  from '../components/TopBar'

const ROLE_LABEL = {
  admin: 'Administrateur',
  technician: 'Technicien',
  driver: 'Conducteur',
}

function initials(name) {
  if (!name) return 'A'
  return name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export default function Settings() {
  const [userId, setUserId]             = useState(null)
  const [fullName, setFullName]         = useState('')
  const [email, setEmail]               = useState('')
  const [phone, setPhone]               = useState('')
  const [role, setRole]                 = useState('')
  const [createdAt, setCreatedAt]       = useState('')
  const [mdpNouv, setMdpN]              = useState('')
  const [mdpConf, setMdpC]              = useState('')
  const [loading, setLoading]           = useState(true)
  const [saving, setSaving]             = useState(false)
  const [error, setError]               = useState('')
  const [success, setSuccess]           = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')
    api.get('/auth/me')
      .then((res) => {
        const user = res.data?.user
        if (!user?.id) throw new Error('Profil introuvable')
        setUserId(user.id)
        setFullName(user.full_name || '')
        setEmail(user.email || '')
        setPhone(user.phone || '')
        setRole(user.role || '')
        setCreatedAt(user.created_at || '')
      })
      .catch((err) => {
        setError(
          err.response?.data?.error ||
          err.response?.data?.message ||
          err.message ||
          'Impossible de charger le profil.',
        )
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!success) return undefined
    const timer = setTimeout(() => setSuccess(''), 3000)
    return () => clearTimeout(timer)
  }, [success])

  const handleSave = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!userId) {
      setError('Profil non chargé.')
      return
    }

    if (mdpNouv || mdpConf) {
      if (mdpNouv.length < 6) {
        setError('Le mot de passe doit contenir au moins 6 caractères.')
        return
      }
      if (mdpNouv !== mdpConf) {
        setError('Les mots de passe ne correspondent pas.')
        return
      }
    }

    const payload = {
      full_name: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
    }
    if (mdpNouv) payload.password = mdpNouv

    setSaving(true)
    try {
      const res = await api.put(`/users/${userId}`, payload)
      const updated = res.data

      setFullName(updated.full_name || payload.full_name)
      setEmail(updated.email || payload.email)
      setPhone(updated.phone || payload.phone)
      setMdpN('')
      setMdpC('')
      setSuccess('Modifications enregistrées.')
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        'Erreur lors de l\'enregistrement.',
      )
    } finally {
      setSaving(false)
    }
  }

  const card = {
    background: '#111827',
    border: '0.5px solid rgba(59,130,246,.18)',
    borderRadius: 10,
    padding: 24,
    marginBottom: 16,
  }
  const sec = {
    fontSize: 11,
    fontWeight: 500,
    color: '#60a5fa',
    letterSpacing: '.05em',
    textTransform: 'uppercase',
    marginBottom: 16,
  }
  const inp = {
    background: '#0d1426',
    border: '0.5px solid rgba(59,130,246,.25)',
    color: '#e2e8f0',
    borderRadius: 7,
    padding: '9px 12px',
    fontSize: 13,
    width: '100%',
    outline: 'none',
  }
  const inpReadonly = {
    ...inp,
    color: 'rgba(148,163,184,.6)',
    cursor: 'not-allowed',
  }
  const lbl = { display: 'block', fontSize: 11, color: 'rgba(148,163,184,.55)', marginBottom: 5 }

  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : '—'

  return (
    <div className="flex min-h-screen" style={{ background: '#0a0f1e' }}>
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopBar title="Paramètres" />
        <main className="flex-1 p-6 max-w-2xl">

          {success && (
            <div
              className="mb-4 px-4 py-3 rounded-lg text-sm font-medium"
              style={{
                background: 'rgba(34,197,94,.1)',
                color: '#4ade80',
                border: '0.5px solid rgba(34,197,94,.2)',
              }}
            >
              {success}
            </div>
          )}

          {error && (
            <div
              className="mb-4 px-4 py-3 rounded-lg text-sm"
              style={{
                background: 'rgba(239,68,68,.1)',
                color: '#f87171',
                border: '0.5px solid rgba(239,68,68,.2)',
              }}
            >
              {error}
            </div>
          )}

          {loading ? (
            <p style={{ fontSize: 13, color: 'rgba(148,163,184,.5)' }}>Chargement…</p>
          ) : (
            <form onSubmit={handleSave}>

              <div style={card}>
                <p style={sec}>Profil</p>
                <div className="flex items-center gap-4 mb-5">
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: '50%',
                      background: '#1d4ed8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 18,
                      fontWeight: 500,
                      color: '#e2e8f0',
                    }}
                  >
                    {initials(fullName)}
                  </div>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 500, color: '#e2e8f0' }}>
                      {fullName || '—'}
                    </p>
                    <p style={{ fontSize: 12, color: 'rgba(148,163,184,.5)' }}>{email}</p>
                    <p style={{ fontSize: 11, color: '#60a5fa', marginTop: 4 }}>
                      {ROLE_LABEL[role] || role || '—'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label style={lbl}>Nom complet</label>
                    <input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      style={inp}
                    />
                  </div>
                  <div>
                    <label style={lbl}>Téléphone</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      style={inp}
                    />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={lbl}>Adresse e-mail</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      style={inp}
                    />
                  </div>
                  <div>
                    <label style={lbl}>ID utilisateur</label>
                    <input value={userId || ''} readOnly style={inpReadonly} />
                  </div>
                  <div>
                    <label style={lbl}>Rôle</label>
                    <input
                      value={ROLE_LABEL[role] || role}
                      readOnly
                      style={inpReadonly}
                    />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={lbl}>Compte créé le</label>
                    <input value={formattedDate} readOnly style={inpReadonly} />
                  </div>
                </div>
              </div>

              <div style={card}>
                <p style={sec}>Changer le mot de passe</p>
                <p style={{ fontSize: 11, color: 'rgba(148,163,184,.45)', marginBottom: 14 }}>
                  Laissez vide pour ne pas modifier le mot de passe.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label style={lbl}>Nouveau mot de passe</label>
                    <input
                      type="password"
                      value={mdpNouv}
                      onChange={(e) => setMdpN(e.target.value)}
                      placeholder="••••••••"
                      minLength={6}
                      style={inp}
                    />
                  </div>
                  <div>
                    <label style={lbl}>Confirmer</label>
                    <input
                      type="password"
                      value={mdpConf}
                      onChange={(e) => setMdpC(e.target.value)}
                      placeholder="••••••••"
                      style={inp}
                    />
                  </div>
                </div>
                {mdpNouv && mdpConf && mdpNouv !== mdpConf && (
                  <p style={{ fontSize: 11, color: '#f87171', marginTop: 10 }}>
                    Les mots de passe ne correspondent pas.
                  </p>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving || !userId}
                  style={{
                    background: '#1d4ed8',
                    color: '#e2e8f0',
                    border: 'none',
                    borderRadius: 8,
                    padding: '10px 28px',
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: saving ? 'not-allowed' : 'pointer',
                    opacity: saving ? 0.6 : 1,
                  }}
                >
                  {saving ? 'Enregistrement…' : 'Enregistrer'}
                </button>
              </div>

            </form>
          )}

        </main>
      </div>
    </div>
  )
}
