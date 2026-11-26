// Dashboard.jsx: /admin: the numbers that matter at a glance, what needs attention, and the latest orders.

import { Link } from 'react-router-dom'
import { useAuth, ORDER_STATUSES } from '../../context/AuthContext'
import { useProducts } from '../../context/ProductsContext'
import { useMessages } from '../../context/MessagesContext'
import { useReviews } from '../../context/ReviewsContext'
import ConfirmButton from '../../components/ConfirmButton'
import { money } from '../../components/ProductCard'
import { LOW_STOCK, shortDate } from '../../utils/format'

// A list of horizontal bars. Each row is { label, value, note }. The longest bar fills the width.
function BarRows({ rows, empty }) {
  const max = Math.max(1, ...rows.map(r => r.value))
  if (!rows.length) return <p className="muted">{empty}</p>
  return (
    <ul className="hbars">
      {rows.map(r => (
        <li key={r.label}>
          <span className="hbar-label">{r.label}</span>
          <span className="hbar-track"><span style={{ width: `${(r.value / max) * 100}%` }} /></span>
          <span className="hbar-value">{r.note ?? r.value}</span>
        </li>
      ))}
    </ul>
  )
}

export default function Dashboard() {
  const { allOrders, users } = useAuth()
  const { products } = useProducts()
  const { messages, unread } = useMessages()
  const { all: reviews } = useReviews()

  // Cancelled orders do not count as sales.
  const sales = allOrders.filter(o => o.status !== 'Cancelled')
  const revenue = sales.reduce((sum, o) => sum + o.total, 0)
  const toProcess = allOrders.filter(o => o.status === 'Processing').length
  const customers = users.filter(u => u.role === 'customer').length
  // Products that are nearly or completely sold out, lowest first.
  const low = products.filter(p => p.stock <= LOW_STOCK).sort((a, b) => a.stock - b.stock)

  // How many orders are in each status.
  const byStatus = ORDER_STATUSES.map(s => ({ label: s, value: allOrders.filter(o => o.status === s).length }))

  // Best sellers: add up the units sold for each product, then keep the top 5.
  const units = {}
  sales.forEach(o => o.items.forEach(i => {
    units[i.id] = { label: `${i.emoji} ${i.name}`, value: (units[i.id]?.value || 0) + i.qty }
  }))
  const best = Object.values(units).sort((a, b) => b.value - a.value).slice(0, 5).map(r => ({ ...r, note: `${r.value} sold` }))

  const recent = [...allOrders].reverse().slice(0, 5)

  // Delete everything this demo saved in the browser (products, orders, users, reviews, messages, cart, login) and start again.
  // The theme choice is kept. The page reloads so every part of the app starts fresh.
  const resetDemo = () => {
    try {
      Object.keys(localStorage)
        .filter(k => k.startsWith('shopwise_') && k !== 'shopwise_theme')
        .forEach(k => localStorage.removeItem(k))
    } catch { /* storage can be blocked */ }
    window.location.reload()
  }

  return (
    <>
      {/* Number tiles. Each one links to the page where you can act on it. */}
      <div className="stats">
        <Link className="stat" to="/admin/orders"><b>{money(revenue)}</b><span>Sales ({sales.length} orders)</span></Link>
        <Link className="stat" to="/admin/orders"><b>{toProcess}</b><span>Orders to process</span></Link>
        <Link className="stat" to="/admin/users"><b>{customers}</b><span>Customers</span></Link>
        <Link className="stat" to="/admin/products"><b>{products.length}</b><span>Products</span></Link>
        <Link className="stat" to="/admin/products"><b className={low.length ? 'low' : ''}>{low.length}</b><span>Low or out of stock</span></Link>
        <Link className="stat" to="/admin/messages"><b className={unread ? 'low' : ''}>{unread}</b><span>New messages</span></Link>
      </div>

      <div className="dash-grid">
        <div className="panel">
          <h2>Orders by status</h2>
          <BarRows rows={byStatus} empty="No orders yet." />
        </div>
        <div className="panel">
          <h2>Best sellers</h2>
          <BarRows rows={best} empty="Nothing sold yet." />
        </div>
      </div>

      <div className="dash-grid">
        <div className="panel">
          <h2>Needs restocking</h2>
          {low.length ? (
            <ul className="plain">
              {low.map(p => (
                <li key={p.id} className="row">
                  <span>{p.emoji} {p.name}</span>
                  <span><b className="low">{p.stock === 0 ? 'Out of stock' : `${p.stock} left`}</b> · <Link to={`/admin/products/${p.id}/edit`}>Edit</Link></span>
                </li>
              ))}
            </ul>
          ) : <p className="muted">Every product has more than {LOW_STOCK} in stock.</p>}
        </div>
        <div className="panel">
          <h2>Latest orders</h2>
          {recent.length ? (
            <ul className="plain">
              {recent.map(o => (
                <li key={o.id} className="row">
                  <span><b>{o.id}</b> · {o.name || o.email}</span>
                  <span>{money(o.total)} · <span className={'pill s-' + o.status.toLowerCase()}>{o.status}</span></span>
                </li>
              ))}
            </ul>
          ) : <p className="muted">No orders yet.</p>}
          <Link to="/admin/orders" className="btn sec sm">All orders</Link>
        </div>
      </div>

      <div className="panel">
        <h2>Shop summary</h2>
        <p className="muted">
          {products.length} products · {reviews.length} reviews · {messages.length} messages · {users.length} accounts · last order {recent[0] ? shortDate(recent[0].createdAt || recent[0].date) : 'none yet'}.
        </p>
        <p className="muted small">Everything in this demo is saved in this browser only. Resetting brings back the example products, orders, customers, reviews and messages, and logs you out.</p>
        <ConfirmButton label="Reset demo data" question="Delete all changes?" onConfirm={resetDemo} />
      </div>
    </>
  )
}
