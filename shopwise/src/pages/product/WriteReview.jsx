import { useState } from 'react'
import { Link, useNavigate, useOutletContext } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useReviews } from '../../context/ReviewsContext'

const LABELS = { 1: 'Poor', 2: 'Fair', 3: 'Good', 4: 'Very good', 5: 'Excellent' }

// Child route "new" of /products/:productId/reviews  (login required, see router.jsx)
export default function WriteReview() {
  const { product, reviews } = useOutletContext()
  const { user } = useAuth()
  const { addReview } = useReviews()
  const navigate = useNavigate()
  // The chosen number of stars (0 means none chosen yet).
  const [rating, setRating] = useState(0)
  const [error, setError] = useState('')

  // Each person can review a product only once.
  const already = reviews.find(r => r.userEmail === user.email)
  if (already) {
    return (
      <div className="panel">
        <h2>You already reviewed this product</h2>
        <p>Thank you! You can delete your review from the list and write a new one.</p>
        <Link to={`/products/${product.id}/reviews`} className="btn">Back to reviews</Link>
      </div>
    )
  }

  // Check the form, save the review, then go back to the reviews list.
  const submit = e => {
    e.preventDefault()
    const f = Object.fromEntries(new FormData(e.target))
    const title = f.title.trim()
    const text = f.text.trim()
    if (!rating) return setError('Choose a star rating.')
    if (title.length < 3) return setError('Add a short title of at least 3 characters.')
    if (text.length < 10) return setError('Write at least 10 characters about the product.')
    addReview({ productId: product.id, author: user.name, userEmail: user.email, rating, title, text })
    navigate(`/products/${product.id}/reviews`, { state: { posted: true } })
  }

  return (
    <form className="panel review-form" onSubmit={submit} noValidate>
      <h2>Review the {product.name}</h2>

      {/* The star rating is a group of radio buttons, so it works with the keyboard too. */}
      <fieldset>
        <legend>Your rating</legend>
        <div className="rate">
          {[1, 2, 3, 4, 5].map(n => (
            <label key={n} className={'rate-opt' + (rating === n ? ' on' : '')}>
              <input type="radio" name="rating" value={n} checked={rating === n} onChange={() => setRating(n)} className="sr-only" />
              {n} ★
            </label>
          ))}
        </div>
        <p className="muted small">{rating ? LABELS[rating] : 'Tap a rating'}</p>
      </fieldset>

      <label htmlFor="rt">Title</label>
      <input id="rt" name="title" maxLength="80" placeholder="Sum it up in a few words" />
      <label htmlFor="rx">Your review</label>
      <textarea id="rx" name="text" rows="5" maxLength="800" placeholder="What did you like or dislike?" />
      <p className="muted small">Posting as {user.name}</p>
      <p className="err" role="alert">{error}</p>

      <div className="acts">
        <button className="btn">Post review</button>
        <Link to={`/products/${product.id}/reviews`} className="btn sec">Cancel</Link>
      </div>
    </form>
  )
}
