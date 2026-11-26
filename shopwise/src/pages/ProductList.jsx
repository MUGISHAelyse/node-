import { useState, useEffect } from 'react'
import { Link, Navigate, useLocation, useParams, useSearchParams } from 'react-router-dom'
import ProductCard, { money } from '../components/ProductCard'
import { useProducts } from '../context/ProductsContext'
import { useReviews } from '../context/ReviewsContext'
import NotFound from './NotFound'
import { modernizeSearch } from '../utils/redirects'
import { SORTS, RATING_OPTIONS, parseFilters, applyFilters, paginate } from '../utils/filters'

// Used by BOTH /products and /products/category/:category
// Everything the visitor chooses is stored in the URL, so a filtered page can be
// bookmarked, shared, refreshed, and used with the browser's back button.
export default function ProductList() {
  const { category: routeCategory } = useParams() // undefined on /products
  const [params, setParams] = useSearchParams()
  const location = useLocation()
  const { withRatings } = useReviews() // ratings come from the customer reviews
  const { products, categories } = useProducts() // the live product list

  // 1. READ the URL (invalid values are ignored and explained in `notes`)
  const { filters: f, notes } = parseFilters(params, routeCategory, categories)

  // 2. FILTER, SORT and PAGE the products
  const list = applyFilters(withRatings(products), f)
  const pg = paginate(list, f.page)
  const messages = pg.clamped ? [...notes, `Page ${f.page} does not exist, so page ${pg.page} is shown.`] : notes

  // Text boxes keep their own draft so the URL only changes when you press Apply
  const [qText, setQText] = useState(params.get('q') ?? '')
  const [minText, setMinText] = useState(params.get('min') ?? '')
  const [maxText, setMaxText] = useState(params.get('max') ?? '')
  useEffect(() => {
    setQText(params.get('q') ?? '')
    setMinText(params.get('min') ?? '')
    setMaxText(params.get('max') ?? '')
  }, [params])

  // 3. WRITE to the URL: set a value, or remove it when it is empty
  const update = changes => {
    const next = new URLSearchParams(params)
    Object.entries(changes).forEach(([key, value]) => {
      if (value === null || value === '' || value === false) next.delete(key)
      else next.set(key, String(value))
    })
    if (!('page' in changes)) next.delete('page') // a new filter starts on page 1
    setParams(next)
  }
  const clearAll = () => setParams(new URLSearchParams()) // the path category stays

  // Pressing Apply puts the typed search and prices into the URL.
  const applyText = e => {
    e.preventDefault()
    update({ q: qText.trim(), min: minText.trim(), max: maxText.trim() })
  }

  // Keep the chosen filters when switching category or page
  const keep = new URLSearchParams(params)
  keep.delete('page')
  keep.delete('category')
  const keepQs = keep.toString() ? '?' + keep.toString() : ''
  // Build the link for page number n, keeping the other filters.
  const pageHref = n => {
    const next = new URLSearchParams(params)
    if (n === 1) next.delete('page')
    else next.set('page', String(n))
    return { search: next.toString() ? '?' + next.toString() : '' }
  }

  // The filters currently in use. They are shown as tags the visitor can remove.
  const active = []
  if (f.q) active.push({ key: 'q', label: `Search: “${f.q}”`, clear: { q: null } })
  if (f.category && !routeCategory) active.push({ key: 'category', label: `Category: ${f.category}`, clear: { category: null } })
  if (f.min !== null) active.push({ key: 'min', label: `From ${money(f.min)}`, clear: { min: null } })
  if (f.max !== null) active.push({ key: 'max', label: `Up to ${money(f.max)}`, clear: { max: null } })
  if (f.rating !== null) active.push({ key: 'rating', label: `${f.rating}★ and up`, clear: { rating: null } })

  // The usual rating choices, plus the one from the URL if it is not in the list.
  const ratingOptions = f.rating !== null && !RATING_OPTIONS.includes(f.rating) ? [...RATING_OPTIONS, f.rating].sort() : RATING_OPTIONS

  // ---- 404 and redirects (see utils/redirects.js) ----
  const knownCategory = routeCategory ? categories.find(c => c.toLowerCase() === routeCategory.toLowerCase()) : null
  if (routeCategory && !knownCategory) {
    return <NotFound title="Category not found" message={`We do not have a category called “${routeCategory}”. Try one of these instead.`} />
  }
  if (knownCategory && knownCategory !== routeCategory) {
    // /products/category/books  ->  /products/category/Books
    return <Navigate replace to={{ pathname: `/products/category/${knownCategory}`, search: location.search }} state={{ redirectedFrom: location.pathname + location.search }} />
  }
  const modern = modernizeSearch(params)
  if (modern) {
    // old parameter names, e.g. ?search=watch  ->  ?q=watch
    return <Navigate replace to={{ pathname: location.pathname, search: '?' + modern.toString() }} state={{ redirectedFrom: location.pathname + location.search }} />
  }

  return (
    <>
      <h1>{f.category || 'All products'}</h1>

      {/* Category links (keep your filters) */}
      <div className="chips">
        <Link to={'/products' + keepQs} className={'chip' + (!f.category ? ' on' : '')}>All</Link>
        {categories.map(c => (
          <Link key={c} to={`/products/category/${c}${keepQs}`} className={'chip' + (c === f.category ? ' on' : '')}>{c}</Link>
        ))}
      </div>

      {/* Filter form */}
      <form className="filters panel" onSubmit={applyText}>
        <div className="f-field"><label htmlFor="fq">Search</label>
          <input id="fq" type="search" value={qText} onChange={e => setQText(e.target.value)} placeholder="Name or description" /></div>
        <div className="f-field"><label htmlFor="fmin">Lowest price ($)</label>
          <input id="fmin" type="number" inputMode="decimal" min="0" value={minText} onChange={e => setMinText(e.target.value)} placeholder="0" /></div>
        <div className="f-field"><label htmlFor="fmax">Highest price ($)</label>
          <input id="fmax" type="number" inputMode="decimal" min="0" value={maxText} onChange={e => setMaxText(e.target.value)} placeholder="Any" /></div>
        <div className="f-field"><label htmlFor="frating">Rating</label>
          <select id="frating" value={f.rating ?? ''} onChange={e => update({ rating: e.target.value })}>
            <option value="">Any rating</option>
            {ratingOptions.map(r => <option key={r} value={r}>{r}★ and up</option>)}
          </select></div>
        <div className="f-field"><label htmlFor="fsort">Sort by</label>
          <select id="fsort" value={f.sort} onChange={e => update({ sort: e.target.value === 'featured' ? null : e.target.value })}>
            {Object.entries(SORTS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select></div>
        <div className="f-actions">
          <button className="btn sm">Apply</button>
          <button type="button" className="btn sec sm" onClick={clearAll}>Clear all</button>
        </div>
      </form>

      {/* Friendly notes about missing or invalid parameters */}
      {messages.length > 0 && (
        <div className="notice" role="status">
          <b>Some filters in the link could not be used</b>
          <ul>{messages.map(m => <li key={m}>{m}</li>)}</ul>
          <button className="link" onClick={clearAll}>Reset filters</button>
        </div>
      )}

      {/* Active filters */}
      {active.length > 0 && (
        <div className="active-filters" aria-label="Active filters">
          {active.map(a => (
            <button key={a.key} className="tag" onClick={() => update(a.clear)} aria-label={`Remove filter ${a.label}`}>{a.label} <span aria-hidden="true">✕</span></button>
          ))}
        </div>
      )}

      <div className="tools">
        <b>{list.length ? `Showing ${pg.start + 1}–${pg.end} of ${list.length} product${list.length === 1 ? '' : 's'}` : '0 products'}</b>
      </div>

      {list.length ? (
        <div className="grid">{pg.items.map(p => <ProductCard key={p.id} product={p} />)}</div>
      ) : (
        <div className="empty">
          <div className="big-emoji">🔍</div>
          <h2>No products match these filters</h2>
          <p>Try a wider price range or a lower rating.</p>
          <button className="btn" onClick={clearAll}>Clear all filters</button>
        </div>
      )}

      {pg.totalPages > 1 && (
        <nav className="pager" aria-label="Pages">
          {pg.page > 1 ? <Link to={pageHref(pg.page - 1)} className="btn sec sm">← Previous</Link> : <span className="btn sec sm off">← Previous</span>}
          {Array.from({ length: pg.totalPages }, (_, i) => i + 1).map(n => (
            <Link key={n} to={pageHref(n)} className={'chip' + (n === pg.page ? ' on' : '')} aria-current={n === pg.page ? 'page' : undefined}>{n}</Link>
          ))}
          {pg.page < pg.totalPages ? <Link to={pageHref(pg.page + 1)} className="btn sec sm">Next →</Link> : <span className="btn sec sm off">Next →</span>}
        </nav>
      )}
    </>
  )
}
