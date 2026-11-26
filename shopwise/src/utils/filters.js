/*
  URL PARAMETERS USED BY /products AND /products/category/:category

    q         search text                      ?q=watch
    category  category name (same as the path) ?category=Books
    min       lowest price                     ?min=20
    max       highest price                    ?max=100
    rating    minimum rating, 1 to 5           ?rating=4.5
    sort      featured | price-asc | price-desc | rating | name
    page      page number, starting at 1       ?page=2

  Example:  /products?q=a&min=20&max=100&rating=4&sort=price-asc&page=1

  Every parameter is optional. Missing parameters use a default. Invalid
  parameters are ignored and a friendly note is returned so the page can tell
  the visitor what happened (nothing ever crashes or shows a blank page).
*/

export const SORTS = {
  featured: 'Featured',
  'price-asc': 'Price: low to high',
  'price-desc': 'Price: high to low',
  rating: 'Top rated',
  name: 'Name A to Z',
}
export const RATING_OPTIONS = [3, 3.5, 4, 4.5]
export const PAGE_SIZE = 8

// Turn a missing value into "" and trim the spaces around text.
const clean = v => (v === null ? '' : v.trim())

// Read the URL parameters into one tidy `filters` object. Anything invalid is ignored and explained in `notes`.
// `categories` is the list of category names that exist right now.
export function parseFilters(params, routeCategory, categories) {
  const notes = []
  const f = { q: '', category: null, sort: 'featured', min: null, max: null, rating: null, page: 1 }

  // q: any text, trimmed and limited in length
  f.q = clean(params.get('q')).slice(0, 60)

  // category: the path wins (/products/category/Books), else ?category=Books
  const rawCategory = routeCategory ?? params.get('category')
  if (rawCategory) {
    const found = categories.find(c => c.toLowerCase() === rawCategory.trim().toLowerCase())
    if (found) f.category = found
    else notes.push(`There is no category called “${rawCategory}”, so all products are shown.`)
  }

  // sort: must be one of the known options
  const rawSort = params.get('sort')
  if (rawSort !== null) {
    if (Object.hasOwn(SORTS, rawSort)) f.sort = rawSort
    else notes.push(`“${rawSort}” is not a sort option, so Featured order is used.`)
  }

  // min and max price: numbers that are not negative
  for (const key of ['min', 'max']) {
    const raw = clean(params.get(key))
    if (!raw) continue
    const n = Number(raw)
    if (!Number.isFinite(n) || n < 0) notes.push(`The ${key === 'min' ? 'lowest' : 'highest'} price “${raw}” is not valid and was ignored.`)
    else f[key] = n
  }
  if (f.min !== null && f.max !== null && f.min > f.max) {
    ;[f.min, f.max] = [f.max, f.min]
    notes.push('The lowest price was above the highest price, so the two were swapped.')
  }

  // rating: a number from 1 to 5
  const rawRating = clean(params.get('rating'))
  if (rawRating) {
    const n = Number(rawRating)
    if (!Number.isFinite(n) || n < 1 || n > 5) notes.push(`The rating “${rawRating}” is not between 1 and 5 and was ignored.`)
    else f.rating = n
  }

  // page: a whole number, 1 or more
  const rawPage = clean(params.get('page'))
  if (rawPage) {
    const n = Number(rawPage)
    if (!Number.isInteger(n) || n < 1) notes.push(`The page “${rawPage}” is not valid, so page 1 is shown.`)
    else f.page = n
  }

  return { filters: f, notes }
}

// Keep only the products that pass every filter, then sort them.
export function applyFilters(products, f) {
  const q = f.q.toLowerCase()
  let list = products.filter(p =>
    (!f.category || p.category === f.category) &&
    (!q || (p.name + ' ' + p.description + ' ' + p.category).toLowerCase().includes(q)) &&
    (f.min === null || p.price >= f.min) &&
    (f.max === null || p.price <= f.max) &&
    (f.rating === null || p.rating >= f.rating)
  )
  if (f.sort === 'price-asc') list = [...list].sort((a, b) => a.price - b.price)
  if (f.sort === 'price-desc') list = [...list].sort((a, b) => b.price - a.price)
  if (f.sort === 'rating') list = [...list].sort((a, b) => b.rating - a.rating)
  if (f.sort === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name))
  return list
}

// Cut the list into pages of PAGE_SIZE and make sure the requested page exists.
export function paginate(list, page) {
  const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE))
  const current = Math.min(page, totalPages)
  const start = (current - 1) * PAGE_SIZE
  return {
    items: list.slice(start, start + PAGE_SIZE),
    page: current,
    totalPages,
    clamped: page > totalPages, // the URL asked for a page that does not exist
    start,
    end: Math.min(start + PAGE_SIZE, list.length),
  }
}
