// ProductCard.jsx: one product tile. It is used on the home page, the product list and the "you may also like" section.

import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import Pic from './Pic'

// Turns 89 into "$89.00". Exported so other files can reuse it.
export const money = n => '$' + Number(n).toFixed(2)

export default function ProductCard({ product }) {
  // Get the addToCart function from the cart context.
  const { addToCart } = useCart()

  return (
    <article className="card">
      {/* Link to the dynamic route /products/:productId */}
      <Link to={`/products/${product.id}`} className="pic" aria-label={product.name}><Pic product={product} /></Link>
      <div className="info">
        <Link to={`/products/category/${product.category}`} className="muted small">{product.category}</Link>
        <h3><Link to={`/products/${product.id}`}>{product.name}</Link></h3>
        {/* The rating comes from the reviews, with the number of reviews in brackets. */}
        <div className="muted small">{product.rating ? `⭐ ${Number(product.rating).toFixed(1)}${product.reviewCount ? ` (${product.reviewCount})` : ''}` : 'No reviews yet'}</div>
        <div className="row">
          <span className="price">{money(product.price)}</span>
          {/* Adds one of this product to the cart. */}
          {/* Out of stock products cannot be added. */}
          <button className="btn sm" disabled={product.stock <= 0} onClick={() => addToCart(product.id)}>{product.stock > 0 ? 'Add' : 'Sold out'}</button>
        </div>
      </div>
    </article>
  )
}
