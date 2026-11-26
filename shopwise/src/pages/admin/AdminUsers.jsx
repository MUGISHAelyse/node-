// AdminUsers.jsx: /admin/users: every account. Block or unblock, make someone an admin, or delete an account.

import { useState } from 'react'
import { useAuth, ADMIN_EMAIL } from '../../context/AuthContext'
import ConfirmButton from '../../components/ConfirmButton'
import { money } from '../../components/ProductCard'

export default function AdminUsers() {
  const { user, users, allOrders, setUserBlocked, setUserRole, deleteUser } = useAuth()
  const [q, setQ] = useState('')

  const text = q.trim().toLowerCase()
  const list = users.filter(u => !text || `${u.name} ${u.email}`.toLowerCase().includes(text))

  // Orders and money spent by one account (cancelled orders do not count as spent).
  const statsFor = email => {
    const mine = allOrders.filter(o => o.email === email)
    return { count: mine.length, spent: mine.filter(o => o.status !== 'Cancelled').reduce((s, o) => s + o.total, 0) }
  }

  return (
    <div className="panel">
      <h2>Customers and accounts ({users.length})</h2>
      <div className="toolbar filters-row">
        <input type="search" placeholder="Search name or email" aria-label="Search accounts" value={q} onChange={e => setQ(e.target.value)} />
      </div>

      <div className="tw">
        <table className="wide">
          <thead><tr><th>Account</th><th>Role</th><th>Joined</th><th>Orders</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {list.map(u => {
              const s = statsFor(u.email)
              // You cannot lock yourself out, and the built-in admin account stays protected.
              const locked = u.email === user.email || u.email === ADMIN_EMAIL
              return (
                <tr key={u.email}>
                  <td><b>{u.name}</b>{u.email === user.email && <span className="muted small"> (you)</span>}<div className="muted small">{u.email}</div></td>
                  <td>{u.role === 'admin' ? 'Admin' : 'Customer'}</td>
                  <td>{u.joined}</td>
                  <td>{s.count} · {money(s.spent)}</td>
                  <td><span className={'pill ' + (u.blocked ? 's-cancelled' : 's-delivered')}>{u.blocked ? 'Blocked' : 'Active'}</span></td>
                  <td>
                    {locked ? <span className="muted small">Protected</span> : (
                      <div className="row-actions">
                        <button className="btn sm sec" onClick={() => setUserBlocked(u.email, !u.blocked)}>{u.blocked ? 'Unblock' : 'Block'}</button>
                        <button className="btn sm sec" onClick={() => setUserRole(u.email, u.role === 'admin' ? 'customer' : 'admin')}>{u.role === 'admin' ? 'Remove admin' : 'Make admin'}</button>
                        <ConfirmButton label="Delete" question="Delete?" onConfirm={() => deleteUser(u.email)} />
                      </div>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {!list.length && <p className="empty">No accounts match your search.</p>}
      <p className="muted small">A blocked person is logged out and cannot log in. Admins sign in with the admin password. Deleting an account keeps its past orders.</p>
    </div>
  )
}
