import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import api from './services/api'
import Landing       from './pages/Landing'
import Login         from './pages/Login'
import Register      from './pages/Register'
import Dashboard     from './pages/Dashboard'
import CreateMission from './pages/CreateMission'
import SuiviMissions from './pages/SuiviMissions'
import Historique    from './pages/Historique'
import Rapports      from './pages/Rapports'
import RapportDetail from './pages/RapportDetail'
import Drivers       from './pages/Drivers'
import Settings      from './pages/Settings'
import CreateUser    from './pages/CreateUser'

function PrivateRoute({ children }) {
  const [checking, setChecking] = useState(true)
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      setAllowed(false)
      setChecking(false)
      return
    }

    api.get('/auth/me')
      .then((res) => {
        const user = res.data?.user
        if (user?.role === 'admin') {
          localStorage.setItem('userRole', 'admin')
          setAllowed(true)
        } else {
          localStorage.removeItem('token')
          localStorage.removeItem('userRole')
          setAllowed(false)
        }
      })
      .catch(() => {
        localStorage.removeItem('token')
        localStorage.removeItem('userRole')
        setAllowed(false)
      })
      .finally(() => setChecking(false))
  }, [])

  if (checking) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: '#0a0f1e', color: '#94a3b8',
        fontSize: 13,
      }}>
        Vérification de la session…
      </div>
    )
  }

  return allowed ? children : <Navigate to="/login" replace />
}

function PR({ children }) {
  return <PrivateRoute>{children}</PrivateRoute>
}

export default function App() {
  return (
    <Routes>
      <Route path="/"      element={<Landing />} />
      <Route path="/login"    element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/dashboard"                  element={<PR><Dashboard /></PR>} />
      <Route path="/dashboard/missions"         element={<PR><CreateMission /></PR>} />
      <Route path="/dashboard/suivi"            element={<PR><SuiviMissions /></PR>} />
      <Route path="/dashboard/historique"       element={<PR><Historique /></PR>} />
      <Route path="/dashboard/rapports"         element={<PR><Rapports /></PR>} />
      <Route path="/dashboard/rapports/:id"     element={<PR><RapportDetail /></PR>} />
      <Route path="/dashboard/drivers"          element={<PR><Drivers /></PR>} />
      <Route path="/dashboard/settings"         element={<PR><Settings /></PR>} />
      <Route path="/dashboard/create-user" element={<PR><CreateUser /></PR>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
