// ProductForm.jsx: add a product (/admin/products/new) or edit one (/admin/products/:productId/edit).
// The same form is used for both. When there is a :productId in the URL it is filled in with that product.

import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useProducts } from '../../context/ProductsContext'
import { money } from '../../components/ProductCard'
import Pic from '../../components/Pic'
import NotFound from '../NotFound'
import { imageToDataUrl } from '../../utils/image'

// The value of the category drop-down that means "type a new category".
const NEW_CATEGORY = '__new__'

export default function ProductForm() {
  const { productId } = useParams() // undefined when adding a new product
  const { products, categories, getProduct, addProduct, updateProduct } = useProducts()
  const navigate = useNavigate()
  const existing = productId ? getProduct(productId) : null

  // Everything typed in the form lives in one object. Numbers are kept as text while typing.
  const [form, setForm] = useState({
    name: existing?.name ?? '',
    category: existing?.category ?? categories[0] ?? NEW_CATEGORY,
    newCategory: '',
    price: existing ? String(existing.price) : '',
    stock: existing ? String(existing.stock) : '',
    emoji: existing?.emoji ?? '📦',
    image: existing?.image ?? '',
    description: existing?.description ?? '',
  })
  const [errors, setErrors] = useState({})
  const [imageError, setImageError] = useState('')

  // The product id in the URL does not exist.
  if (productId && !existing) {
    return <NotFound title="Product not found" message={`There is no product with the id “${productId}”. It may have been deleted.`} />
  }

  // Update one field.
  const set = (key, value) => setForm(f => ({ ...f, [key]: value }))

  // The admin picked a picture from their computer: shrink it and keep it in the form.
  const pickImage = async e => {
    const file = e.target.files[0]
    e.target.value = '' // lets the same file be chosen again later
    if (!file) return
    try {
      set('image', await imageToDataUrl(file))
      setImageError('')
    } catch (err) {
      setImageError(err.message)
    }
  }

  // The category that will be saved (the typed one when "New category" is chosen).
  const chosenCategory = form.category === NEW_CATEGORY ? form.newCategory.trim() : form.category

  // Check every field, then save.
  const submit = e => {
    e.preventDefault()
    const found = {}
    if (form.name.trim().length < 2) found.name = 'Enter a product name (at least 2 letters).'
    // Another product with the same name would be confusing in the shop.
    if (products.some(p => p.id !== productId && p.name.toLowerCase() === form.name.trim().toLowerCase())) found.name = 'A product with this name already exists.'
    if (!chosenCategory || chosenCategory.length < 2) found.category = 'Choose a category or type a new one.'
    const price = Number(form.price)
    if (form.price.trim() === '' || !Number.isFinite(price) || price <= 0) found.price = 'Enter a price above 0.'
    const stock = Number(form.stock)
    if (form.stock.trim() === '' || !Number.isInteger(stock) || stock < 0) found.stock = 'Enter a whole number, 0 or more.'
    if (form.description.trim().length < 10) found.description = 'Write a short description (at least 10 characters).'
    setErrors(found)
    if (Object.keys(found).length) return

    // If the typed category matches an existing one (ignoring capitals), use the existing spelling.
    const category = categories.find(c => c.toLowerCase() === chosenCategory.toLowerCase()) || chosenCategory
    const data = {
      name: form.name.trim(),
      category,
      price: Math.round(price * 100) / 100,
      stock,
      emoji: form.emoji.trim() || '📦',
      image: form.image,
      description: form.description.trim(),
    }
    if (existing) updateProduct(existing.id, data)
    else addProduct(data)
    navigate('/admin/products', { state: { notice: `“${data.name}” was ${existing ? 'saved' : 'added'}.` } })
  }

  // What the product tile will look like in the shop.
  const draft = { name: form.name || 'Product name', emoji: form.emoji.trim() || '📦', image: form.image }

  return (
    <div className="panel">
      <h2>{existing ? `Edit “${existing.name}”` : 'Add a product'}</h2>
      <div className="form-split">
        <form onSubmit={submit} noValidate>
          <label htmlFor="p-name">Name</label>
          <input id="p-name" value={form.name} maxLength={60} onChange={e => set('name', e.target.value)} aria-invalid={!!errors.name} />
          <p className="err" role="alert">{errors.name}</p>

          <label htmlFor="p-cat">Category</label>
          <select id="p-cat" className="full" value={form.category} onChange={e => set('category', e.target.value)}>
            {categories.map(c => <option key={c}>{c}</option>)}
            <option value={NEW_CATEGORY}>+ New category…</option>
          </select>
          {form.category === NEW_CATEGORY && (
            <input aria-label="New category name" placeholder="New category name, e.g. Toys" maxLength={30} value={form.newCategory} onChange={e => set('newCategory', e.target.value)} />
          )}
          <p className="err" role="alert">{errors.category}</p>

          <div className="two">
            <div>
              <label htmlFor="p-price">Price ($)</label>
              <input id="p-price" type="number" inputMode="decimal" min="0" step="0.01" value={form.price} onChange={e => set('price', e.target.value)} aria-invalid={!!errors.price} />
              <p className="err" role="alert">{errors.price}</p>
            </div>
            <div>
              <label htmlFor="p-stock">Stock</label>
              <input id="p-stock" type="number" inputMode="numeric" min="0" step="1" value={form.stock} onChange={e => set('stock', e.target.value)} aria-invalid={!!errors.stock} />
              <p className="err" role="alert">{errors.stock}</p>
            </div>
          </div>

          <label htmlFor="p-desc">Description</label>
          <textarea id="p-desc" rows="4" maxLength={300} value={form.description} onChange={e => set('description', e.target.value)} aria-invalid={!!errors.description} />
          <p className="err" role="alert">{errors.description}</p>

          {/* The picture: choose a photo from the computer, or use an emoji. */}
          <fieldset className="pic-fields">
            <legend>Picture</legend>
            <label htmlFor="p-file" className="btn sec sm upload">Choose a photo from your computer</label>
            <input id="p-file" type="file" accept="image/*" className="sr-only" onChange={pickImage} />
            {form.image && <button type="button" className="link" onClick={() => set('image', '')}>Remove photo</button>}
            <p className="err" role="alert">{imageError}</p>
            <label htmlFor="p-emoji">Emoji (used when there is no photo)</label>
            <input id="p-emoji" className="emoji-in" value={form.emoji} maxLength={8} onChange={e => set('emoji', e.target.value)} />
          </fieldset>

          <div className="row-actions">
            <button className="btn">{existing ? 'Save changes' : 'Add product'}</button>
            <Link to="/admin/products" className="btn sec">Cancel</Link>
            {existing && <Link to={`/products/${existing.id}`} className="link">View in shop</Link>}
          </div>
        </form>

        {/* Live preview of the product tile. */}
        <aside aria-label="Preview">
          <p className="muted small">Preview</p>
          <article className="card preview">
            <div className="pic"><Pic product={draft} /></div>
            <div className="info">
              <span className="muted small">{chosenCategory || 'Category'}</span>
              <h3>{draft.name}</h3>
              <div className="row"><span className="price">{money(Number(form.price) || 0)}</span><span className="btn sm">Add</span></div>
            </div>
          </article>
        </aside>
      </div>
    </div>
  )
}
