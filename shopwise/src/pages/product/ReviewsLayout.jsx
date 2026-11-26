import { Link, Outlet, useOutletContext } from 'react-router-dom'
import { useReviews } from '../../context/ReviewsContext'
import Stars from '../../components/Stars'

/*
  Second-level PARENT route:  /products/:productId/reviews

  It draws the review summary (score and star breakdown) and the
  "Write a review" button once. Its own <Outlet /> then shows either
    - ReviewList   (index)  at /products/3/reviews
    - WriteReview  ("new")  at /products/3/reviews/new
  It passes the product, the reviews and the stats on to both children.
*/
export default function ReviewsLayout() {
  const { product } = useOutletContext() // from ProductLayout
  const { getReviews, stats } = useReviews()
  // All reviews of this product.
  const reviews = getReviews(product.id)
  // Count, average and star breakdown.
  const summary = stats(product.id)
  // The biggest star count, so the bars can be drawn in proportion.
  const max = Math.max(1, ...summary.breakdown.map(b => b.count))

  return (
    <section aria-labelledby="reviews-title">
      {/* Summary: the average score on the left, the star bars on the right. */}
      <div className="panel rev-head">
        <div className="rev-score">
          <h2 id="reviews-title">Customer reviews</h2>
          <div className="rev-big">{summary.average === null ? '–' : summary.average.toFixed(1)}</div>
          <Stars value={summary.average} />
          <span className="muted small">{summary.count} review{summary.count === 1 ? '' : 's'}</span>
          <Link to="new" className="btn sm">Write a review</Link>
        </div>

        <div className="rev-bars" aria-label="Reviews by star rating">
          {summary.breakdown.map(b => (
            <Link key={b.star} to={`/products/${product.id}/reviews?stars=${b.star}`} className="rev-row" aria-label={`${b.count} reviews with ${b.star} stars. Show them.`}>
              <span>{b.star} ★</span>
              <span className="bar"><span style={{ width: `${(b.count / max) * 100}%` }} /></span>
              <span className="muted">{b.count}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* ReviewList or WriteReview appears here */}
      <Outlet context={{ product, reviews, summary }} />
    </section>
  )
}
