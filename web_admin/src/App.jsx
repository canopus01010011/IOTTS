import { Routes, Route, Navigate } from 'react-router-dom'
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
  const token = localStorage.getItem('token')
  return token ? children : <Navigate to="/login" replace />
}

function PR({ children }) {
  return <PrivateRoute>{children}</PrivateRoute>
}

export default function App() {
  return (
    <Routes>
      {/* Pages publiques */}
      <Route path="/"      element={<Landing />} />
      <Route path="/login"    element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Pages admin protégées */}
      <Route path="/dashboard"                  element={<PR><Dashboard /></PR>} />
      <Route path="/dashboard/missions"         element={<PR><CreateMission /></PR>} />
      <Route path="/dashboard/suivi"            element={<PR><SuiviMissions /></PR>} />
      <Route path="/dashboard/historique"       element={<PR><Historique /></PR>} />
      <Route path="/dashboard/rapports"         element={<PR><Rapports /></PR>} />
      <Route path="/dashboard/rapports/:id"     element={<PR><RapportDetail /></PR>} />
      <Route path="/dashboard/drivers"          element={<PR><Drivers /></PR>} />
      <Route path="/dashboard/settings"         element={<PR><Settings /></PR>} />
      <Route path="/dashboard/create-user" element={<PR><CreateUser /></PR>} />

      {/* Redirection route inconnue */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
