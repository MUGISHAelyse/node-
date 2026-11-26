// AdminLayout.jsx: the frame of every /admin page: a side menu on the left and the chosen page on the right.
// It is protected by RequireAdmin in router.jsx, so only admins get here.

import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useMessages } from '../../context/MessagesContext'

export default function AdminLayout() {
  const { user } = useAuth()
  const { unread } = useMessages() // new messages are shown as a number on the Messages link

  return (
    <>
      <h1>Admin</h1>
      <p className="muted admin-sub">Signed in as {user.name} ({user.email})</p>
      <div className="profile">
        {/* Side menu. NavLink highlights the page that is open. */}
        <nav className="side panel" aria-label="Admin">
          <NavLink to="/admin" end>Dashboard</NavLink>
          <NavLink to="/admin/products">Products</NavLink>
          <NavLink to="/admin/orders">Orders</NavLink>
          <NavLink to="/admin/users">Customers</NavLink>
          <NavLink to="/admin/reviews">Reviews</NavLink>
          <NavLink to="/admin/messages">Messages{unread > 0 && <span className="pill-count">{unread}</span>}</NavLink>
        </nav>
        <section className="admin-main">
          {/* The chosen admin page appears here. */}
          <Outlet />
        </section>
      </div>
    </>
  )
}
