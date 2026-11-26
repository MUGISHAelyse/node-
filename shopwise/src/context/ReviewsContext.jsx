import { createContext, useContext } from 'react'
import useLocalStorage from '../hooks/useLocalStorage'
import { seedReviews } from '../data/reviews'

const ReviewsContext = createContext(null)
export const useReviews = () => useContext(ReviewsContext)

// Sample reviews come from data/reviews.js. Reviews written by the visitor are
// saved in the browser (localStorage), like the cart.
export function ReviewsProvider({ children }) {
  const [mine, setMine] = useLocalStorage('shopwise_reviews', [])
  // Ids of sample reviews that the admin has removed.
  const [hidden, setHidden] = useLocalStorage('shopwise_hidden_reviews', [])
  // The visitor's own reviews first, then the sample reviews (without the ones the admin removed).
  const all = [...mine, ...seedReviews].filter(r => !hidden.includes(r.id))

  // All reviews for one product.
  const getReviews = productId => all.filter(r => r.productId === productId)

  // count, average and a 5-to-1 star breakdown for one product
  const stats = productId => {
    const list = getReviews(productId)
    const count = list.length
    // Average rounded to one decimal, e.g. 4.3. It is null when there are no reviews.
    const average = count ? Math.round((list.reduce((sum, r) => sum + r.rating, 0) / count) * 10) / 10 : null
    const breakdown = [5, 4, 3, 2, 1].map(star => ({ star, count: list.filter(r => r.rating === star).length }))
    return { count, average, breakdown }
  }

  // Add a review written by the visitor. It gets an id and today's date.
  const addReview = review =>
    setMine(list => [{ id: 'u' + Date.now(), date: new Date().toISOString().slice(0, 10), verified: false, ...review }, ...list])
  // Remove one of the visitor's own reviews.
  const deleteReview = id => setMine(list => list.filter(r => r.id !== id))
  // Admin: remove any review. Visitor reviews are deleted, sample reviews are hidden.
  const removeReview = id => {
    if (mine.some(r => r.id === id)) deleteReview(id)
    else setHidden(list => [...list, id])
  }

  // Give products the rating that comes from their reviews (used by cards and filters)
  const withRatings = products =>
    products.map(p => {
      const s = stats(p.id)
      return { ...p, rating: s.average ?? p.rating, reviewCount: s.count }
    })

  return (
    <ReviewsContext.Provider value={{ all, getReviews, stats, addReview, deleteReview, removeReview, withRatings }}>
      {children}
    </ReviewsContext.Provider>
  )
}
