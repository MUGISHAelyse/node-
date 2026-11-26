import { useState, useEffect } from 'react'
import { Link, NavLink, Outlet, useParams, useNavigate } from 'react-router-dom'
import { useProducts } from '../../context/ProductsContext'
import { useCart } from '../../context/CartContext'
import { useReviews } from '../../context/ReviewsContext'
import { money } from '../../components/ProductCard'
import Pic from '../../components/Pic'
import Stars from '../../components/Stars'
import NotFound from '../NotFound'

/*
  PARENT ROUTE for  /products/:productId  and everything nested under it:

    /products/3                    -> Details   (index child, ProductOverview)
    /products/3/reviews            -> Reviews   (ReviewsLayout > ReviewList)
    /products/3/reviews/new        -> Write a review (ReviewsLayout > WriteReview)

  The product header and the tabs are drawn once, here. The tab content is
  drawn by <Outlet />. The product is passed down with the Outlet's `context`
  prop, so child pages read it with useOutletContext() and do not look it up again.
*/
export default function ProductLayout() {
  // The :productId from the URL, e.g. "3" for /products/3.
  const { productId } = useParams()
  // Look the product up in the data. It is undefined when the id does not exist.
  const { getProduct } = useProducts()
  const base = getProduct(productId)
  const { addToCart } = useCart()
  const { stats } = useReviews()
  const navigate = useNavigate()
  // How many the visitor wants to add to the cart.
  const [qty, setQty] = useState(1)

  useEffect(() => setQty(1), [productId]) // new product, start again at 1

  if (!base) {
    return (
      <NotFound
        title="Product not found"
        message={`We could not find a product with the id “${productId}”. It may have been removed or the link may be wrong.`}
      />
    )
  }

  const { count, average } = stats(base.id)
  // The same product, but with its rating taken from the reviews.
  const product = { ...base, rating: average ?? base.rating, reviewCount: count }

  return (
    <>
      {/* Top part: the picture on one side, the details and buy buttons on the other. */}
      <div className="detail">
        <div className="pic big-pic" role="img" aria-label={product.name}><Pic product={product} /></div>
        <div className="detail-info">
          <h1>{product.name}</h1>
          {/* Stars and rating. Clicking them opens the Reviews tab. */}
          <Link to={`/products/${product.id}/reviews`} className="rating-link">
            <Stars value={product.rating} /> <b>{count ? Number(product.rating).toFixed(1) : 'New'}</b>
            <span className="muted"> · {count} review{count === 1 ? '' : 's'}</span>
          </Link>
          <div className="price xl">{money(product.price)}</div>
          <p>{product.description}</p>
          <p className={product.stock > 10 ? 'ok' : 'low'}>{product.stock > 10 ? 'In stock' : product.stock > 0 ? `Only ${product.stock} left` : 'Out of stock'}</p>

          {/* Quantity picker and buttons. "Buy now" adds to the cart and then opens /cart. */}
          <div className="qty-row">
            <div className="qty">
              <button onClick={() => setQty(q => Math.max(1, q - 1))} aria-label="Decrease quantity">−</button>
              <span>{qty}</span>
              <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} aria-label="Increase quantity">+</button>
            </div>
            <button className="btn" disabled={product.stock <= 0} onClick={() => addToCart(product.id, qty)}>Add to cart</button>
            <button className="btn gold" disabled={product.stock <= 0} onClick={() => { addToCart(product.id, qty); navigate('/cart') }}>Buy now</button>
          </div>
        </div>
      </div>

      {/* Tabs: NavLink marks the open one. "end" keeps Details from staying active on /reviews */}
      <nav className="tabs-nav" aria-label="Product sections">
        <NavLink to={`/products/${product.id}`} end>Details</NavLink>
        <NavLink to={`/products/${product.id}/reviews`}>Reviews ({count})</NavLink>
      </nav>

      {/* The matching child route appears here */}
      <Outlet context={{ product }} />
    </>
  )
}
