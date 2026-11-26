// ProfileOrders.jsx: the /profile/orders page: a table of the visitor's orders.

import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { money } from '../../components/ProductCard'

export default function ProfileOrders() {
  const { orders } = useAuth()
  const location = useLocation()
  // Newest order first.
  const list = [...orders].reverse()

  return (
    <div className="panel">
      <h2>My orders</h2>
      {/* Shown once, right after checkout. */}
      {location.state?.justOrdered && <p className="ok">Thank you! Your order was placed.</p>}
      {list.length ? (
        <div className="tw">
          <table>
            <thead><tr><th>Order</th><th>Date</th><th>Items</th><th>Total</th><th>Status</th></tr></thead>
            <tbody>
              {list.map(o => (
                <tr key={o.id}>
                  <td>{o.id}</td>
                  <td>{o.date}</td>
                  <td>{o.items.map(i => (
                    <Link key={i.id} to={`/products/${i.id}`} title={i.name}>{i.emoji}×{i.qty} </Link>
                  ))}</td>
                  <td>{money(o.total)}</td>
                  <td>{o.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="empty">No orders yet. <Link to="/products">Start shopping</Link></p>
      )}
    </div>
  )
}
