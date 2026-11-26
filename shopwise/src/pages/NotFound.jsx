import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useProducts } from '../context/ProductsContext'
import { suggestPath } from '../utils/redirects'

// Custom 404 page.
// It is used for unknown URLs (the "*" route) and is reused, with its own
// title and message, for a product or category that does not exist.
export default function NotFound({ title = 'Page not found', message }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { categories } = useProducts() // used for the "Did you mean" hint and the category links
  const [q, setQ] = useState('')
  const suggestion = suggestPath(pathname, categories) // "Did you mean ...?" for small typos

  // Give the browser tab a useful title while this page is open
  useEffect(() => {
    const previous = document.title
    document.title = `${title} | Shopwise`
    return () => { document.title = previous }
  }, [title])

  const search = e => {
    e.preventDefault()
    navigate(q.trim() ? `/products?q=${encodeURIComponent(q.trim())}` : '/products')
  }

  return (
    <section className="nf" aria-labelledby="nf-title">
      <div className="nf-code" aria-hidden="true">404</div>
      <h1 id="nf-title">{title}</h1>
      <p className="muted">
        {message || <>We could not find <code>{pathname}</code>. The page may have moved, or the link may have a typing mistake.</>}
      </p>

      {suggestion && (
        <p>Did you mean <Link to={suggestion}><b>{suggestion}</b></Link>?</p>
      )}

      <form onSubmit={search} role="search">
        <label htmlFor="nf-q" className="sr-only">Search products</label>
        <input id="nf-q" type="search" placeholder="Search for a product" value={q} onChange={e => setQ(e.target.value)} />
        <button className="btn">Search</button>
      </form>

      <div className="acts">
        <button className="btn sec" onClick={() => navigate(-1)}>← Go back</button>
        <Link to="/" className="btn">Go to home</Link>
        <Link to="/products" className="btn sec">Browse products</Link>
      </div>

      <h2>Popular places</h2>
      <div className="chips">
        {categories.map(c => <Link key={c} to={`/products/category/${c}`} className="chip">{c}</Link>)}
        <Link to="/about" className="chip">About</Link>
        <Link to="/contact" className="chip">Contact</Link>
        <Link to="/cart" className="chip">Cart</Link>
        <Link to="/profile" className="chip">My profile</Link>
      </div>
    </section>
  )
}
