import { useEffect, useState } from 'react'
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
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
import Technicians   from './pages/Technicians'
import Settings      from './pages/Settings'
import CreateUser    from './pages/CreateUser'
import Sites         from './pages/Sites'
import Containers    from './pages/Containers'

function PrivateRoute() {
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

  return allowed ? <Outlet /> : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/"      element={<Landing />} />
      <Route path="/login"    element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<PrivateRoute />}>
        <Route path="/dashboard"                  element={<Dashboard />} />
        <Route path="/dashboard/missions"         element={<CreateMission />} />
        <Route path="/dashboard/suivi"            element={<SuiviMissions />} />
        <Route path="/dashboard/historique"       element={<Historique />} />
        <Route path="/dashboard/rapports"         element={<Rapports />} />
        <Route path="/dashboard/rapports/:id"     element={<RapportDetail />} />
        <Route path="/dashboard/drivers"          element={<Drivers />} />
        <Route path="/dashboard/technicians"      element={<Technicians />} />
        <Route path="/dashboard/sites"            element={<Sites />} />
        <Route path="/dashboard/containers"      element={<Containers />} />
        <Route path="/dashboard/settings"         element={<Settings />} />
        <Route path="/dashboard/create-user"      element={<CreateUser />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
