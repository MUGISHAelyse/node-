// ProfileOverview.jsx: the /profile page: order count, total spent and account details.

import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { money } from '../../components/ProductCard'

export default function ProfileOverview() {
  const { user, orders } = useAuth()
  // Total money spent across all orders.
  const spent = orders.reduce((a, o) => a + o.total, 0)

  return (
    <>
      <div className="stats">
        <div className="stat"><b>{orders.length}</b><span>Orders</span></div>
        <div className="stat"><b>{money(spent)}</b><span>Total spent</span></div>
        <div className="stat"><b>{user.joined}</b><span>Member since</span></div>
      </div>
      <div className="panel">
        <h2>Your details</h2>
        <p><b>Name:</b> {user.name}</p>
        <p><b>Email:</b> {user.email}</p>
        <Link to="/profile/settings" className="btn sec">Edit details</Link>
      </div>
    </>
  )
}
