// AdminOrders.jsx: /admin/orders: every order from every customer. The admin changes the status here.

import { useState } from 'react'
import { useAuth, ORDER_STATUSES } from '../../context/AuthContext'
import { useProducts } from '../../context/ProductsContext'
import { money } from '../../components/ProductCard'
import { shortDate } from '../../utils/format'

export default function AdminOrders() {
  const { allOrders, setOrderStatus } = useAuth()
  const { adjustStock } = useProducts()
  const [status, setStatus] = useState('')
  const [q, setQ] = useState('')

  // Newest first, then keep the orders that match the status and the search text (order number, name or email).
  const text = q.trim().toLowerCase()
  const list = [...allOrders].reverse().filter(o =>
    (!status || o.status === status) &&
    (!text || `${o.id} ${o.name || ''} ${o.email}`.toLowerCase().includes(text))
  )

  // Change an order's status. Cancelling puts the items back in stock, and un-cancelling takes them out again.
  const change = (order, next) => {
    if (next === order.status) return
    if (next === 'Cancelled') adjustStock(order.items, 1)
    else if (order.status === 'Cancelled') adjustStock(order.items, -1)
    setOrderStatus(order.id, next)
  }

  return (
    <div className="panel">
      <h2>Orders ({allOrders.length})</h2>
      <div className="toolbar filters-row">
        <input type="search" placeholder="Search order, name or email" aria-label="Search orders" value={q} onChange={e => setQ(e.target.value)} />
        <select aria-label="Filter by status" value={status} onChange={e => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {ORDER_STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {list.length ? (
        <div className="tw">
          <table className="wide">
            <thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th></tr></thead>
            <tbody>
              {list.map(o => (
                <tr key={o.id}>
                  <td><b>{o.id}</b><div className="muted small">{shortDate(o.createdAt || o.date)}</div></td>
                  <td>{o.name || '—'}<div className="muted small">{o.email}</div><div className="muted small">{o.ship}</div></td>
                  <td>
                    <ul className="plain tight">
                      {o.items.map(i => <li key={i.id}>{i.emoji} {i.name} × {i.qty}</li>)}
                    </ul>
                  </td>
                  <td>{money(o.total)}</td>
                  <td>
                    <span className={'pill s-' + o.status.toLowerCase()}>{o.status}</span>
                    <select aria-label={`Change status of order ${o.id}`} value={o.status} onChange={e => change(o, e.target.value)}>
                      {ORDER_STATUSES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="empty">{allOrders.length ? 'No orders match your search.' : 'No orders yet. They appear here when customers check out.'}</p>
      )}
      <p className="muted small">Cancelling an order puts its items back in stock. Customers see the new status on their My orders page.</p>
    </div>
  )
}
