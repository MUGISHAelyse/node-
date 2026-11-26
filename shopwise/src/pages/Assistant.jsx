// Assistant.jsx: the "Help me choose" page at /assistant.
// The shopper describes what they need; an AI model (on the server) picks matching products.

import { useEffect, useState } from 'react'
import { useProducts } from '../context/ProductsContext'
import ProductCard from '../components/ProductCard'

// Ideas the shopper can click to fill the box.
const EXAMPLES = [
  'A gift for a friend who loves running, under $100',
  'Something warm for a cold winter trip',
  'I am starting university and need gear for studying',
]

export default function Assistant() {
  const { products, getProduct } = useProducts()
  const [need, setNeed] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  useEffect(() => {
    const previous = document.title
    document.title = 'Help me choose | Shopwise'
    return () => { document.title = previous }
  }, [])

  const submit = async e => {
    e.preventDefault()
    if (need.trim().length < 3 || loading) return
    setLoading(true); setError(''); setResult(null)
    try {
      const res = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ need, products }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Something went wrong. Please try again.')
      setResult(data)
    } catch (err) {
      setError(err.message || 'Could not reach the AI helper.')
    } finally {
      setLoading(false)
    }
  }

  // Turn the picked ids back into real products (skip any that were deleted).
  const picks = (result?.picks || []).map(p => ({ ...p, product: getProduct(p.id) })).filter(p => p.product)

  return (
    <section>
      <h1>Help me choose</h1>
      <p className="muted">Tell us what you are looking for, who it is for, or your budget. We will suggest products that fit.</p>

      <form onSubmit={submit} className="assistant-form">
        <label htmlFor="need">What do you need?</label>
        <textarea id="need" rows={3} maxLength={500} value={need} autoFocus
          placeholder="e.g. A birthday present for my dad who likes music, around $200"
          onChange={e => setNeed(e.target.value)} />
        <div className="assistant-examples">
          {EXAMPLES.map(x => (
            <button type="button" key={x} className="btn sm sec" onClick={() => setNeed(x)}>{x}</button>
          ))}
        </div>
        <button className="btn" disabled={loading || need.trim().length < 3}>
          {loading ? 'Finding products…' : 'Get suggestions'}
        </button>
      </form>

      <div aria-live="polite">
        {error && <p className="notice" role="alert">{error}</p>}
        {result && (
          <>
            {result.summary && <p className="notice">{result.summary}</p>}
            {picks.length > 0 ? (
              <div className="grid">
                {picks.map(({ id, reason, product }) => (
                  <div key={id} className="assistant-pick">
                    <ProductCard product={product} />
                    <p className="small muted">💡 {reason}</p>
                  </div>
                ))}
              </div>
            ) : <p className="muted">No matching products this time. Try describing it differently.</p>}
          </>
        )}
      </div>
    </section>
  )
}
