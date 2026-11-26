import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

// Parent of the nested profile routes: /profile, /profile/orders, /profile/settings
export default function ProfileLayout() {
  // The logged-in user. This page is protected by RequireAuth, so a user always exists here.
  const { user } = useAuth()

  return (
    <>
      <h1>Hi, {user.name}</h1>
      <div className="profile">
        {/* Side menu. NavLink highlights the page that is open. */}
        <nav className="side panel" aria-label="Profile">
          <NavLink to="/profile" end>Overview</NavLink>
          <NavLink to="/profile/orders">My orders</NavLink>
          <NavLink to="/profile/settings">Settings</NavLink>
        </nav>
        <section>
          {/* The chosen profile page (overview, orders or settings) appears here. */}
          <Outlet />
        </section>
      </div>
    </>
  )
}
