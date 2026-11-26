// Signup.jsx: create an account at /signup. Existing customers use /login instead.

import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Signup() {
  const { user, signup } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false) // true while the account is being created
  const from = location.state?.from || '/profile' // where the visitor wanted to go

  // Already logged in, so there is no need to see this page.
  if (user) return <Navigate to={from} replace />

  // Check every field, create the account, then go on to the page the visitor wanted.
  const submit = async e => {
    e.preventDefault()
    const f = Object.fromEntries(new FormData(e.target))
    if (f.name.trim().length < 2) return setError('Enter your name.')
    if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) return setError('Enter a valid email address.')
    if (f.password.length < 6) return setError('Choose a password with at least 6 characters.')
    if (f.password !== f.confirm) return setError('The two passwords do not match.')
    setBusy(true)
    const result = await signup(f.name.trim(), f.email.trim().toLowerCase(), f.password)
    setBusy(false)
    if (result.error) return setError(result.error)
    navigate(from, { replace: true })
  }

  return (
    <div className="auth panel">
      <h1>Create an account</h1>
      <p className="muted">It takes a minute. You can then check out, track orders and write reviews.</p>
      <form onSubmit={submit} noValidate>
        <label htmlFor="sn">Full name</label><input id="sn" name="name" autoComplete="name" />
        <label htmlFor="se">Email</label><input id="se" name="email" type="email" autoComplete="email" />
        <label htmlFor="sp">Password <span className="muted small">(at least 6 characters)</span></label><input id="sp" name="password" type="password" autoComplete="new-password" />
        <label htmlFor="sc">Confirm password</label><input id="sc" name="confirm" type="password" autoComplete="new-password" />
        <p className="err" role="alert">{error}</p>
        <button className="btn block" disabled={busy}>{busy ? 'Creating…' : 'Sign up'}</button>
      </form>
      <p className="auth-switch">Already have an account? <Link to="/login" state={location.state}>Log in</Link></p>
      <p className="muted small admin-hint">With XAMPP connected, your account is saved in the MySQL database.</p>
    </div>
  )
}
