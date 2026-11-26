import { Navigate, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Wrap a page with this to make it available to admins only.
// Visitors who are not logged in are sent to /login. Logged-in customers see a "no access" message.
// (In this demo the check happens in the browser, so it is not real security. A real shop checks on a server.)
export default function RequireAdmin({ children }) {
  const { user, isAdmin, logout } = useAuth()
  const location = useLocation()

  // Not logged in: go to /login and come back here afterwards.
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />

  // Logged in but not an admin: explain, and offer a way to switch account.
  if (!isAdmin) {
    return (
      <section className="nf" aria-labelledby="noaccess-title">
        <div className="nf-code" aria-hidden="true">403</div>
        <h1 id="noaccess-title">Admins only</h1>
        <p className="muted">You are logged in as <b>{user.email}</b>, which is a customer account, so you cannot open the admin area.</p>
        <div className="acts">
          <Link to="/" className="btn">Go to home</Link>
          <button className="btn sec" onClick={logout}>Log out to switch account</button>
        </div>
      </section>
    )
  }

  // Admin: show the protected page.
  return children
}
