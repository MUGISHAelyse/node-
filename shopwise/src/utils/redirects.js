/*
  OUTDATED URLS  ->  CURRENT URLS

  Old links keep working because each one is a route that redirects (see
  components/Redirect.jsx). :params are copied across and the ?query is kept,
  so  /product/3?ref=mail  becomes  /products/3?ref=mail.

  This list is used by router.jsx. The same list is written for the host in
  public/_redirects, where it becomes a real HTTP 301 (permanent) redirect.
*/
export const redirects = [
  { from: '/home', to: '/' },
  { from: '/index.html', to: '/' },
  { from: '/about-us', to: '/about' },
  { from: '/aboutus', to: '/about' },
  { from: '/company', to: '/about' },
  { from: '/who-we-are', to: '/about' },
  { from: '/contact-us', to: '/contact' },
  { from: '/contactus', to: '/contact' },
  { from: '/support', to: '/contact' },
  { from: '/help', to: '/contact' },
  { from: '/administrator', to: '/admin' },
  { from: '/admin/dashboard', to: '/admin' },
  { from: '/dashboard', to: '/admin' },
  { from: '/wp-admin', to: '/admin' },
  { from: '/admin/customers', to: '/admin/users' },
  { from: '/admin/inventory', to: '/admin/products' },
  { from: '/shop', to: '/products' },
  { from: '/store', to: '/products' },
  { from: '/catalog', to: '/products' },
  { from: '/categories', to: '/products' },
  { from: '/search', to: '/products' },
  { from: '/shop/:category', to: '/products/category/:category' },
  { from: '/category/:category', to: '/products/category/:category' },
  { from: '/product/:productId', to: '/products/:productId' },
  { from: '/item/:productId', to: '/products/:productId' },
  { from: '/items/:productId', to: '/products/:productId' },
  { from: '/p/:productId', to: '/products/:productId' },
  { from: '/product/:productId/reviews', to: '/products/:productId/reviews' },
  { from: '/products/:productId/review', to: '/products/:productId/reviews' },
  { from: '/products/:productId/reviews/add', to: '/products/:productId/reviews/new' },
  { from: '/products/:productId/write-review', to: '/products/:productId/reviews/new' },
  { from: '/basket', to: '/cart' },
  { from: '/bag', to: '/cart' },
  { from: '/shopping-cart', to: '/cart' },
  { from: '/cart/checkout', to: '/checkout' },
  { from: '/signin', to: '/login' },
  { from: '/sign-in', to: '/login' },
  { from: '/sign-up', to: '/signup' },
  { from: '/register', to: '/signup' },
  { from: '/join', to: '/signup' },
  { from: '/create-account', to: '/signup' },
  { from: '/account', to: '/profile' },
  { from: '/my-account', to: '/profile' },
  { from: '/user', to: '/profile' },
  { from: '/user/profile', to: '/profile' },
  { from: '/account/orders', to: '/profile/orders' },
  { from: '/orders', to: '/profile/orders' },
  { from: '/my-orders', to: '/profile/orders' },
  { from: '/account/settings', to: '/profile/settings' },
  { from: '/settings', to: '/profile/settings' },
]

/*
  OUTDATED QUERY PARAMETERS  ->  CURRENT ONES
  /products?search=watch&sort=price_asc  becomes  /products?q=watch&sort=price-asc
  Returns the fixed URLSearchParams, or null when nothing needs fixing.
*/
const PARAM_RENAMES = { search: 'q', keyword: 'q', term: 'q', cat: 'category', minprice: 'min', maxprice: 'max', price_min: 'min', price_max: 'max', p: 'page' }
const SORT_RENAMES = { price_asc: 'price-asc', price_desc: 'price-desc', priceasc: 'price-asc', pricedesc: 'price-desc', rating_desc: 'rating', top: 'rating', name_asc: 'name', 'a-z': 'name', az: 'name' }

export function modernizeSearch(params) {
  const next = new URLSearchParams(params)
  let changed = false

  for (const [oldKey, newKey] of Object.entries(PARAM_RENAMES)) {
    if (!next.has(oldKey)) continue
    const value = next.get(oldKey)
    next.delete(oldKey)
    if (!next.has(newKey)) next.set(newKey, value) // never overwrite a current parameter
    changed = true
  }

  const sort = next.get('sort')
  if (sort && Object.hasOwn(SORT_RENAMES, sort.toLowerCase())) {
    next.set('sort', SORT_RENAMES[sort.toLowerCase()])
    changed = true
  }
  return changed ? next : null
}

/*
  "DID YOU MEAN ...?" for the 404 page.
  Compares the unknown path with the real pages and returns the closest one
  when it is only a small typing mistake away (/prodcuts -> /products).
*/
const KNOWN_PATHS = ['/about', '/contact', '/products', '/cart', '/checkout', '/login', '/signup', '/profile', '/profile/orders', '/profile/settings',
  '/admin', '/admin/products', '/admin/orders', '/admin/users', '/admin/reviews', '/admin/messages']

// Counts how many single-letter changes turn text a into text b. Used to spot typing mistakes.
function distance(a, b) {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    let previous = row[0]
    row[0] = i
    for (let j = 1; j <= b.length; j++) {
      const temp = row[j]
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, previous + (a[i - 1] === b[j - 1] ? 0 : 1))
      previous = temp
    }
  }
  return row[b.length]
}

export function suggestPath(pathname, categories = []) {
  const path = pathname.toLowerCase().replace(/\/+$/, '') || '/'
  if (path === '/') return null
  let best = null
  let bestDistance = Infinity
  for (const known of [...KNOWN_PATHS, ...categories.map(c => `/products/category/${c}`)]) {
    const d = distance(path, known.toLowerCase())
    if (d < bestDistance) { best = known; bestDistance = d }
  }
  const limit = Math.min(2, Math.floor(path.length / 4))
  return best && bestDistance <= limit && best !== pathname ? best : null
}
