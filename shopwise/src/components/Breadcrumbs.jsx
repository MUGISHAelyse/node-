import { Link, useLocation } from 'react-router-dom'
import { useProducts } from '../context/ProductsContext'

// Readable names for the parts of a URL.
const labels = {
  products: 'Products',
  cart: 'Cart',
  checkout: 'Checkout',
  login: 'Log in',
  signup: 'Sign up',
  about: 'About',
  contact: 'Contact',
  profile: 'My profile',
  orders: 'My orders',
  settings: 'Settings',
  reviews: 'Reviews',
  new: 'Write a review',
}

// Names for the parts of an /admin address. They are separate because "orders" and "new" mean something else there.
const adminLabels = {
  admin: 'Admin',
  products: 'Products',
  orders: 'Orders',
  users: 'Customers',
  reviews: 'Reviews',
  messages: 'Messages',
  new: 'New product',
  edit: 'Edit',
}

// Shows where you are, e.g.  Home / Products / Smartwatch
// Every crumb except the last one is a link back up the path.
export default function Breadcrumbs() {
  const { pathname } = useLocation()
  const { getProduct } = useProducts()
  // "/products/3/reviews" becomes ["products", "3", "reviews"].
  const parts = pathname.split('/').filter(Boolean)
  if (!parts.length) return null // no breadcrumbs on the home page

  // The trail always starts with Home.
  const crumbs = [{ to: '/', label: 'Home' }]
  // Add one crumb for every part of the URL.
  parts.forEach((part, i) => {
    // /products/category/:category has no page of its own at "category"
    if (parts[0] === 'products' && parts[1] === 'category' && i === 1) return

    // Use the readable name, or the URL text itself when there is none.
    let label = labels[part] || decodeURIComponent(part)
    if (parts[0] === 'products' && i === 1 && part !== 'category') {
      label = getProduct(part)?.name || 'Not found'
    }
    // Admin pages: /admin/products/5/edit  ->  Admin / Products / Smartwatch / Edit
    if (parts[0] === 'admin') {
      label = adminLabels[part] || getProduct(part)?.name || decodeURIComponent(part)
    }
    crumbs.push({ to: '/' + parts.slice(0, i + 1).join('/'), label })
  })

  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <ol>
        {crumbs.map((c, i) => (
          <li key={c.to + i}>
            {/* The last crumb is the current page, so it is plain text and not a link. */}
            {i === crumbs.length - 1
              ? <span aria-current="page">{c.label}</span>
              : <Link to={c.to}>{c.label}</Link>}
          </li>
        ))}
      </ol>
    </nav>
  )
}
