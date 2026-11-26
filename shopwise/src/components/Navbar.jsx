import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useProducts } from '../context/ProductsContext'
import { useMessages } from '../context/MessagesContext'

/*
  Navigation bar
  - Desktop: Home, Shop dropdown (categories), search, theme, cart, user menu
  - Mobile:  menu button opens a full list of links
  - NavLink adds the "active" class to the page you are on
  - Menus close on: page change, outside click, Escape key
*/
export default function Navbar({ theme, toggleTheme }) {
  const { count } = useCart()
  const { user, isAdmin, logout } = useAuth()
  const { categories } = useProducts() // category names for the Shop dropdown
  const { unread } = useMessages() // number of new messages (shown to admins)
  const navigate = useNavigate()
  const location = useLocation()
  // Points at the <header> element so we can tell when the visitor clicks outside the menus.
  const headerRef = useRef(null)

  // The text typed in the search box.
  const [q, setQ] = useState('')
  const [menuOpen, setMenuOpen] = useState(false) // mobile menu
  const [shopOpen, setShopOpen] = useState(false) // Shop dropdown
  const [userOpen, setUserOpen] = useState(false) // user dropdown
  // True on any /products page, so the Shop button can be highlighted.
  const inShop = location.pathname.startsWith('/products')

  // Close every menu when the page changes
  useEffect(() => {
    setMenuOpen(false)
    setShopOpen(false)
    setUserOpen(false)
  }, [location.pathname])

  // Close dropdowns on outside click or Escape
  useEffect(() => {
    const onDown = e => {
      if (headerRef.current && !headerRef.current.contains(e.target)) {
        setShopOpen(false)
        setUserOpen(false)
      }
    }
    const onKey = e => {
      if (e.key === 'Escape') {
        setShopOpen(false)
        setUserOpen(false)
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  // Send the search to the product list as ?q=your+words.
  const search = e => {
    e.preventDefault()
    navigate(q.trim() ? `/products?q=${encodeURIComponent(q.trim())}` : '/products')
  }
  // Log out, then go to the home page.
  const doLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="header" ref={headerRef}>
      <div className="bar container">
        <button
          className="icon-btn menu-btn"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          onClick={() => setMenuOpen(o => !o)}
        >
          {menuOpen ? '✕' : '☰'}
        </button>

        <Link to="/" className="logo">Shop<span>wise</span></Link>

        {/* Desktop links */}
        <nav className="links" aria-label="Main">
          {/* NavLink adds the class "active" when its page is open. `end` makes "/" match only the home page. */}
          <NavLink to="/" end>Home</NavLink>

          {/* Shop dropdown: click the button to show the list of categories. */}
          <div className="dropdown">
            <button
              className={'dd-btn' + (inShop ? ' active' : '')}
              aria-haspopup="true"
              aria-expanded={shopOpen}
              onClick={() => { setShopOpen(o => !o); setUserOpen(false) }}
            >
              Shop <span aria-hidden="true">▾</span>
            </button>
            {shopOpen && (
              <div className="dd-menu">
                <NavLink to="/products" end>All products</NavLink>
                <hr />
                {categories.map(c => (
                  <NavLink key={c} to={`/products/category/${c}`}>{c}</NavLink>
                ))}
              </div>
            )}
          </div>

          {/* About and Contact pages */}
          <NavLink to="/assistant">Help me choose</NavLink>
          <NavLink to="/about">About</NavLink>
          <NavLink to="/contact">Contact</NavLink>
          {/* Only admins see the Admin link. */}
          {isAdmin && <NavLink to="/admin">Admin{unread > 0 && <span className="pill-count">{unread}</span>}</NavLink>}
        </nav>

        {/* Search box: pressing Enter opens /products?q=your+words. */}
        <form className="search" onSubmit={search} role="search">
          <input type="search" placeholder="Search products" aria-label="Search products" value={q} onChange={e => setQ(e.target.value)} />
        </form>

        {/* Dark mode button, cart with item count, and the account menu or Log in button. */}
        <div className="actions">
          <button className="icon-btn" onClick={toggleTheme} aria-label="Toggle dark mode">{theme === 'dark' ? '☀️' : '🌙'}</button>
          <Link to="/cart" className="icon-btn" aria-label={`Cart, ${count} items`}>
            🛒{count > 0 && <span className="badge">{count}</span>}
          </Link>

          {user ? (
            <div className="dropdown user-menu">
              <button
                className="dd-btn"
                aria-haspopup="true"
                aria-expanded={userOpen}
                onClick={() => { setUserOpen(o => !o); setShopOpen(false) }}
              >
                <span className="avatar" aria-hidden="true">{user.name.charAt(0).toUpperCase()}</span>
                <span className="user-name">{user.name.split(' ')[0]}</span>
              </button>
              {userOpen && (
                <div className="dd-menu right">
                  {isAdmin && <NavLink to="/admin">Admin dashboard</NavLink>}
                  <NavLink to="/profile" end>My profile</NavLink>
                  <NavLink to="/profile/orders">My orders</NavLink>
                  <NavLink to="/profile/settings">Settings</NavLink>
                  <hr />
                  <button onClick={doLogout}>Log out</button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-btns">
              <Link to="/login" className="btn sm sec">Log in</Link>
              <Link to="/signup" className="btn sm gold">Sign up</Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav id="mobile-nav" className="mobile-nav" aria-label="Mobile">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/products" end>All products</NavLink>
          <NavLink to="/assistant">Help me choose</NavLink>
          <NavLink to="/cart">Cart ({count})</NavLink>
          <NavLink to="/about">About</NavLink>
          <NavLink to="/contact">Contact</NavLink>
          <h3>Categories</h3>
          {categories.map(c => (
            <NavLink key={c} to={`/products/category/${c}`}>{c}</NavLink>
          ))}
          <h3>Account</h3>
          {user ? (
            <>
              {isAdmin && <NavLink to="/admin">Admin dashboard{unread > 0 ? ` (${unread} new)` : ''}</NavLink>}
              <NavLink to="/profile" end>My profile</NavLink>
              <NavLink to="/profile/orders">My orders</NavLink>
              <NavLink to="/profile/settings">Settings</NavLink>
              <button onClick={doLogout}>Log out</button>
            </>
          ) : (
            <>
              <NavLink to="/login">Log in</NavLink>
              <NavLink to="/signup">Sign up</NavLink>
            </>
          )}
        </nav>
      )}
    </header>
  )
}
