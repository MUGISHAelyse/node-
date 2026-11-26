// Footer.jsx: the links and copyright line at the bottom of every page.

import { Link } from 'react-router-dom'
import { useProducts } from '../context/ProductsContext'
import { useAuth } from '../context/AuthContext'

export default function Footer() {
  const { categories } = useProducts()
  const { isAdmin } = useAuth()
  return (
    <footer className="footer">
      <div className="container foot">
        <div>
          <div className="logo">Shop<span>wise</span></div>
          <p className="muted">Quality products, fair prices.</p>
        </div>
        <div>
          <b>Shop</b>
          <Link to="/products">All products</Link>
          {/* One link per category. */}
          {categories.map(c => <Link key={c} to={`/products/category/${c}`}>{c}</Link>)}
        </div>
        <div>
          <b>Company</b>
          <Link to="/about">About us</Link>
          <Link to="/contact">Contact us</Link>
        </div>
        <div>
          <b>Account</b>
          <Link to="/">Home</Link>
          <Link to="/login">Log in</Link>
          <Link to="/signup">Sign up</Link>
          <Link to="/profile">My profile</Link>
          <Link to="/profile/orders">My orders</Link>
          <Link to="/cart">Cart</Link>
          {isAdmin && <Link to="/admin">Admin</Link>}
        </div>
      </div>
      <p className="muted center">Shopwise &copy; 2026. Demo store: no real payments.</p>
    </footer>
  )
}
