import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Wrap a page with this to make it available to logged-in users only.
// Visitors are sent to /login and returned to the page they wanted afterwards.
export default function RequireAuth({ children }) {
  // user is null when nobody is logged in.
  const { user } = useAuth()
  // Remember which page the visitor was trying to open.
  const location = useLocation()

  // Not logged in: go to /login. `replace` keeps this step out of the history, and `state.from` lets the login page send the visitor back here afterwards.
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  // Logged in: show the protected page.
  return children
}
