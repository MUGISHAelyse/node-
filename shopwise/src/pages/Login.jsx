// Login.jsx: log in at /login with an email and password. New customers use /signup instead.

import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { user, isAdmin, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false) // true while the password is being checked
  // Where to go after logging in: the page the visitor wanted, otherwise the admin dashboard for admins and the profile for everyone else.
  const from = location.state?.from || (isAdmin ? '/admin' : '/profile')

  // Already logged in, so there is no need to see this page.
  if (user) return <Navigate to={from} replace />

  // Check the form, log in, then go back to the page the visitor came from.
  const submit = async e => {
    e.preventDefault()
    const f = Object.fromEntries(new FormData(e.target))
    if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) return setError('Enter a valid email address.')
    if (!f.password) return setError('Enter your password.')
    setBusy(true)
    const result = await login(f.email.trim().toLowerCase(), f.password)
    setBusy(false)
    if (result.error) return setError(result.error)
    navigate(location.state?.from || (result.role === 'admin' ? '/admin' : '/profile'), { replace: true })
  }

  return (
    <div className="auth panel">
      <h1>Log in</h1>
      <p className="muted">Welcome back. Log in to see your orders and check out.</p>
      <form onSubmit={submit} noValidate>
        <label htmlFor="e">Email</label><input id="e" name="email" type="email" autoComplete="email" />
        <label htmlFor="pw">Password</label><input id="pw" name="password" type="password" autoComplete="current-password" />
        <p className="err" role="alert">{error}</p>
        <button className="btn block" disabled={busy}>{busy ? 'Checking…' : 'Log in'}</button>
      </form>
      {/* New customers go to the separate sign up page. The page they wanted is passed along. */}
      <p className="auth-switch">New here? <Link to="/signup" state={location.state}>Create an account</Link></p>
      <p className="muted small admin-hint">
        To set up an administrator for XAMPP, create an account first, then promote it in phpMyAdmin using the SQL instructions in <b>backend/README.md</b>.
      </p>
    </div>
  )
}
