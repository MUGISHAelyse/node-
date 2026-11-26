// AdminReviews.jsx: /admin/reviews: all customer reviews. The admin can delete reviews that break the rules.

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useReviews } from '../../context/ReviewsContext'
import { useProducts } from '../../context/ProductsContext'
import ConfirmButton from '../../components/ConfirmButton'
import Stars from '../../components/Stars'
import { shortDate } from '../../utils/format'

export default function AdminReviews() {
  const { all, removeReview } = useReviews()
  const { products, getProduct } = useProducts()
  const [productId, setProductId] = useState('')
  const [rating, setRating] = useState('')

  // Newest first, filtered by product and star rating.
  const list = [...all]
    .sort((a, b) => b.date.localeCompare(a.date))
    .filter(r => (!productId || r.productId === productId) && (!rating || r.rating === Number(rating)))

  return (
    <div className="panel">
      <h2>Reviews ({all.length})</h2>
      <div className="toolbar filters-row">
        <select aria-label="Filter by product" value={productId} onChange={e => setProductId(e.target.value)}>
          <option value="">All products</option>
          {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select aria-label="Filter by stars" value={rating} onChange={e => setRating(e.target.value)}>
          <option value="">All ratings</option>
          {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} stars</option>)}
        </select>
      </div>

      {list.length ? (
        <ul className="reviews">
          {list.map(r => {
            const product = getProduct(r.productId)
            return (
              <li key={r.id} className="panel review">
                <div className="review-top">
                  <Stars value={r.rating} />
                  <b>{r.title}</b>
                </div>
                <p>{r.text}</p>
                <div className="review-meta muted small">
                  <span>{r.author}</span>
                  <span>{shortDate(r.date)}</span>
                  <span>{r.verified ? 'Verified purchase' : 'Customer review'}</span>
                  <span>on {product ? <Link to={`/products/${product.id}/reviews`}>{product.name}</Link> : 'a deleted product'}</span>
                  <ConfirmButton label="Delete review" question="Delete?" onConfirm={() => removeReview(r.id)} />
                </div>
              </li>
            )
          })}
        </ul>
      ) : <p className="empty">No reviews match.</p>}
    </div>
  )
}
