import Sidebar from './Sidebar.jsx'
import TopBar from './TopBar.jsx'

export default function DashboardLayout({ title, children }) {
  return (
    <div className="admin-shell">
      <Sidebar />
      <div className="admin-shell__main">
        <TopBar title={title} />
        <main className="admin-main page-enter">{children}</main>
      </div>
    </div>
  )
}
