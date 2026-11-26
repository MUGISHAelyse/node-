// ProfileSettings.jsx: the /profile/settings page: change your name and email.

import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'

export default function ProfileSettings() {
  const { user, updateUser } = useAuth()
  const [msg, setMsg] = useState({ type: '', text: '' })

  // Check the form and save the new details.
  const submit = e => {
    e.preventDefault()
    const f = Object.fromEntries(new FormData(e.target))
    if (f.name.trim().length < 2) return setMsg({ type: 'err', text: 'Enter your name.' })
    if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) return setMsg({ type: 'err', text: 'Enter a valid email address.' })
    const result = updateUser({ name: f.name.trim(), email: f.email.trim().toLowerCase() })
    if (result.error) return setMsg({ type: 'err', text: result.error })
    setMsg({ type: 'ok', text: 'Your details were saved.' })
  }

  return (
    <div className="panel">
      <h2>Settings</h2>
      <form onSubmit={submit} noValidate>
        <label htmlFor="sn">Full name</label><input id="sn" name="name" defaultValue={user.name} />
        <label htmlFor="se">Email</label><input id="se" name="email" type="email" defaultValue={user.email} />
        <p className={msg.type} role="status">{msg.text}</p>
        <button className="btn">Save changes</button>
      </form>
    </div>
  )
}
