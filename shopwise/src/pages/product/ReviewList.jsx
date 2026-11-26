import { Link, useLocation, useOutletContext, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useReviews } from '../../context/ReviewsContext'
import Stars from '../../components/Stars'

const REVIEW_SORTS = { newest: 'Newest', highest: 'Highest rated', lowest: 'Lowest rated' }
const formatDate = d => new Date(d + 'T00:00:00').toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })

// Index child route of /products/:productId/reviews
// Optional URL parameters:  ?stars=5   ?sort=newest|highest|lowest
export default function ReviewList() {
  const { product, reviews } = useOutletContext()
  const { user } = useAuth()
  const { deleteReview } = useReviews()
  const [params, setParams] = useSearchParams()
  const location = useLocation()

  // read and check the URL parameters
  const notes = []
  const rawSort = params.get('sort')
  const sort = rawSort && Object.hasOwn(REVIEW_SORTS, rawSort) ? rawSort : 'newest'
  if (rawSort && sort !== rawSort) notes.push(`“${rawSort}” is not a sort option, so Newest is used.`)
  const rawStars = params.get('stars')
  const n = Number(rawStars)
  const stars = Number.isInteger(n) && n >= 1 && n <= 5 ? n : null
  if (rawStars && stars === null) notes.push(`“${rawStars}” is not a star rating from 1 to 5, so all reviews are shown.`)

  // Keep only the chosen star rating (if any), then sort the reviews.
  let list = stars ? reviews.filter(r => r.rating === stars) : [...reviews]
  list.sort((a, b) => {
    if (sort === 'highest') return b.rating - a.rating || b.date.localeCompare(a.date)
    if (sort === 'lowest') return a.rating - b.rating || b.date.localeCompare(a.date)
    return b.date.localeCompare(a.date)
  })

  // Change one URL parameter. It is removed from the URL when the value is empty.
  const change = (key, value) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next)
  }

  return (
    <>
      {/* Shown once, right after the visitor posts a review. */}
      {location.state?.posted && <p className="ok" role="status">Thank you! Your review was added.</p>}
      {notes.length > 0 && <div className="notice" role="status"><ul>{notes.map(m => <li key={m}>{m}</li>)}</ul></div>}

      {reviews.length > 0 && (
        <div className="tools">
          <b>
            {stars ? `${list.length} review${list.length === 1 ? '' : 's'} with ${stars} stars` : `${list.length} review${list.length === 1 ? '' : 's'}`}
            {stars && <> · <button className="link" onClick={() => change('stars', '')}>Show all</button></>}
          </b>
          <div>
            <label htmlFor="rsort" className="sr-only">Sort reviews</label>
            <select id="rsort" value={sort} onChange={e => change('sort', e.target.value === 'newest' ? '' : e.target.value)}>
              {Object.entries(REVIEW_SORTS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
        </div>
      )}

      {list.length ? (
        <ul className="reviews">
          {list.map(r => (
            <li key={r.id} className="review panel">
              <div className="review-top">
                <Stars value={r.rating} />
                <b>{r.title}</b>
              </div>
              <p>{r.text}</p>
              <div className="muted small review-meta">
                <span>{r.author}</span>
                <span>{formatDate(r.date)}</span>
                {r.verified && <span className="verified">Verified purchase</span>}
                {user && r.userEmail === user.email && (
                  <button className="link" onClick={() => deleteReview(r.id)}>Delete my review</button>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="empty">
          {reviews.length === 0 ? (
            <>
              <h2>No reviews yet</h2>
              <p>Be the first to share what you think of the {product.name}.</p>
              <Link to="new" className="btn">Write a review</Link>
            </>
          ) : (
            <>
              <h2>No {stars}-star reviews</h2>
              <button className="btn" onClick={() => change('stars', '')}>Show all reviews</button>
            </>
          )}
        </div>
      )}
    </>
  )
}
