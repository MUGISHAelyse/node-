// Home.jsx: the home page at "/": banner, quick picks, categories and top rated products.

import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { useProducts } from '../context/ProductsContext'
import { useReviews } from '../context/ReviewsContext'

// A small icon for each category tile.
const icons = { Electronics: '🎧', Fashion: '👟', Clothes: '👗', Books: '📚', Sports: '⚽' }

export default function Home() {
  const { withRatings } = useReviews()
  const { products, categories } = useProducts()
  // The 4 products with the best rating from customer reviews.
  const featured = withRatings(products).sort((a, b) => b.rating - a.rating).slice(0, 4)

  return (
    <>
      {/* Big banner at the top of the page. */}
      <section className="hero">
        <div>
          <h1>Everything you need, delivered.</h1>
          <p>Browse {products.length} products in {categories.length} categories, from electronics to sports gear.</p>
          <Link to="/products" className="btn gold">Shop now</Link>
        </div>
        <div className="big" aria-hidden="true">🛍️</div>
      </section>

      {/* Shortcut links. Each one is a URL with parameters, e.g. /products?max=50 (see utils/filters.js). */}
      <h2>Quick picks</h2>
      <div className="quick">
        <Link className="chip" to="/products?max=50&sort=price-asc">Under $50</Link>
        <Link className="chip" to="/products?rating=4.5&sort=rating">Rated 4.5★ and up</Link>
        <Link className="chip" to="/products?min=200&sort=price-desc">Premium ($200+)</Link>
        <Link className="chip" to="/products/category/Clothes?max=60">Clothes under $60</Link>
      </div>

      {/* One tile per category. */}
      <h2>Shop by category</h2>
      <div className="cats">
        {categories.map(c => (
          <Link key={c} to={`/products/category/${c}`} className="cat">
            <span>{icons[c] || '🛍️'}</span>{c}
          </Link>
        ))}
      </div>

      {/* The featured products. */}
      <h2>Top rated</h2>
      <div className="grid">{featured.map(p => <ProductCard key={p.id} product={p} />)}</div>
    </>
  )
}
