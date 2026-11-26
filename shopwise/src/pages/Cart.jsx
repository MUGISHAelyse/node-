// Cart.jsx: the shopping cart page at /cart.

import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { money } from '../components/ProductCard'
import Pic from '../components/Pic'

// Shopping cart route: /cart
export default function Cart() {
  const { lines, subtotal, setQty, removeFromCart, clearCart } = useCart()
  // Free shipping over $100 (or for an empty cart), otherwise $6.99.
  const shipping = subtotal > 100 || subtotal === 0 ? 0 : 6.99

  // Empty cart: show a friendly message instead of an empty table.
  if (!lines.length) {
    return (
      <div className="empty">
        <div className="big-emoji">🛒</div>
        <h1>Your cart is empty</h1>
        <p>Add something you like and it will show up here.</p>
        <Link to="/products" className="btn">Browse products</Link>
      </div>
    )
  }

  return (
    <>
      <h1>Shopping cart</h1>
      <div className="cart-layout">
        {/* One row for each product in the cart. */}
        <div className="panel">
          {lines.map(({ product, qty }) => (
            <div className="cart-row" key={product.id}>
              <Link to={`/products/${product.id}`} className="pic thumb" aria-label={product.name}><Pic product={product} /></Link>
              <div>
                <Link to={`/products/${product.id}`}><b>{product.name}</b></Link>
                <div className="muted small">{money(product.price)} each</div>
                <button className="link" onClick={() => removeFromCart(product.id)}>Remove</button>
              </div>
              <div className="qty">
                <button onClick={() => setQty(product.id, qty - 1)} aria-label="Decrease quantity">−</button>
                <span>{qty}</span>
                <button onClick={() => setQty(product.id, qty + 1)} aria-label="Increase quantity">+</button>
              </div>
              <b>{money(product.price * qty)}</b>
            </div>
          ))}
          <button className="link" onClick={clearCart}>Clear cart</button>
        </div>

        {/* Order summary with the total and the Checkout button. */}
        <aside className="panel summary">
          <h2>Order summary</h2>
          <div className="row"><span>Subtotal</span><span>{money(subtotal)}</span></div>
          <div className="row"><span>Shipping</span><span>{shipping ? money(shipping) : 'Free'}</span></div>
          <div className="row total"><span>Total</span><span>{money(subtotal + shipping)}</span></div>
          <p className="muted small">Free shipping on orders over $100.</p>
          <Link to="/checkout" className="btn block">Checkout</Link>
          <Link to="/products" className="btn sec block">Continue shopping</Link>
        </aside>
      </div>
    </>
  )
}
