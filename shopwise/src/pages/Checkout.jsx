// Checkout.jsx: delivery details and "Place order" at /checkout. Only logged-in visitors can open it.

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useProducts } from '../context/ProductsContext'
import { money } from '../components/ProductCard'
import { apiRequest } from '../utils/api'

// /checkout (login required, see RequireAuth in router.jsx)
export default function Checkout() {
  const { lines, subtotal, clearCart } = useCart()
  const { user, addOrder } = useAuth()
  const { adjustStock } = useProducts()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  // Free shipping over $100, otherwise $6.99.
  const shipping = subtotal > 100 ? 0 : 6.99

  if (!lines.length) {
    return (
      <div className="empty">
        <h1>Nothing to check out</h1>
        <Link to="/products" className="btn">Browse products</Link>
      </div>
    )
  }

  // Check the form, save the order, empty the cart and open the orders page.
  const submit = async e => {
    e.preventDefault()
    const f = Object.fromEntries(new FormData(e.target))
    if (!f.address.trim() || !f.city.trim()) return setError('Please fill in your address and city.')
    try {
      // Save the order in MySQL and reduce stock on the server when XAMPP is connected.
      await apiRequest('orders', { method: 'POST', body: JSON.stringify({
        items: lines.map(l => ({ id: l.product.id, qty: l.qty })),
        address: f.address.trim(), city: f.city.trim(),
      }) })
    } catch (apiError) {
      // Preserve the original local demo mode if the PHP backend is not running.
      if (apiError.message !== 'Failed to fetch' && apiError.message !== 'The server request failed.') {
        setError(apiError.message); return
      }
    }
    addOrder({
      items: lines.map(l => ({ id: l.product.id, name: l.product.name, emoji: l.product.emoji, qty: l.qty, price: l.product.price })),
      total: subtotal + shipping,
      ship: `${f.address.trim()}, ${f.city.trim()}`,
    })
    // Take the bought items out of the stock, then empty the cart.
    adjustStock(lines.map(l => ({ id: l.product.id, qty: l.qty })), -1)
    clearCart()
    navigate('/profile/orders', { state: { justOrdered: true } })
  }

  return (
    <>
      <h1>Checkout</h1>
      <div className="cart-layout">
        {/* Delivery details form. */}
        <form className="panel" onSubmit={submit} noValidate>
          <h2>Delivery details</h2>
          <label htmlFor="nm">Name</label><input id="nm" defaultValue={user.name} readOnly />
          <label htmlFor="ad">Street address</label><input id="ad" name="address" autoComplete="street-address" />
          <label htmlFor="ct">City</label><input id="ct" name="city" autoComplete="address-level2" />
          <p className="muted small">Demo only: no real payment is taken.</p>
          <p className="err" role="alert">{error}</p>
          <button className="btn block">Place order · {money(subtotal + shipping)}</button>
        </form>

        {/* Summary of what is being bought. */}
        <aside className="panel summary">
          <h2>Your items</h2>
          {lines.map(l => (
            <div className="row" key={l.product.id}><span>{l.product.emoji} {l.product.name} × {l.qty}</span><span>{money(l.product.price * l.qty)}</span></div>
          ))}
          <div className="row"><span>Shipping</span><span>{shipping ? money(shipping) : 'Free'}</span></div>
          <div className="row total"><span>Total</span><span>{money(subtotal + shipping)}</span></div>
        </aside>
      </div>
    </>
  )
}
