import { Link, useOutletContext } from 'react-router-dom'
import { useProducts } from '../../context/ProductsContext'
import { useReviews } from '../../context/ReviewsContext'
import ProductCard from '../../components/ProductCard'

// Index child route of /products/:productId  ->  the "Details" tab
export default function ProductOverview() {
  const { product } = useOutletContext() // given by ProductLayout's <Outlet context={...} />
  const { withRatings } = useReviews()
  const { products } = useProducts()

  // Up to 4 other products from the same category.
  const related = withRatings(products.filter(p => p.category === product.category && p.id !== product.id)).slice(0, 4)

  return (
    <>
      {/* The description and key facts. */}
      <div className="panel">
        <h2>About this product</h2>
        <p>{product.description}</p>
        <dl className="facts">
          <div><dt>Category</dt><dd><Link to={`/products/category/${product.category}`}>{product.category}</Link></dd></div>
          <div><dt>Customer rating</dt><dd>{product.reviewCount ? <>{Number(product.rating).toFixed(1)} out of 5 (<Link to="reviews">{product.reviewCount} reviews</Link>)</> : 'No reviews yet'}</dd></div>
          <div><dt>Availability</dt><dd>{product.stock} in stock</dd></div>
          <div><dt>Delivery</dt><dd>Free over $100, otherwise $6.99</dd></div>
          <div><dt>Returns</dt><dd>30 days</dd></div>
        </dl>
      </div>

      {related.length > 0 && (
        <>
          <h2>You may also like</h2>
          <div className="grid">{related.map(p => <ProductCard key={p.id} product={p} />)}</div>
        </>
      )}
    </>
  )
}
