// AdminProducts.jsx: /admin/products: every product in a table. Search, filter, change stock, edit or delete.

import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useProducts } from '../../context/ProductsContext'
import ConfirmButton from '../../components/ConfirmButton'
import Pic from '../../components/Pic'
import { money } from '../../components/ProductCard'
import { LOW_STOCK } from '../../utils/format'

export default function AdminProducts() {
  const { products, categories, updateProduct, deleteProduct } = useProducts()
  const location = useLocation()
  const [q, setQ] = useState('')
  const [category, setCategory] = useState('')
  // A message such as "Smartwatch was saved." (from the form, or after a delete).
  const [notice, setNotice] = useState(location.state?.notice || '')

  // Keep the products that match the search text and the chosen category.
  const list = products.filter(p =>
    (!category || p.category === category) &&
    (!q.trim() || (p.name + ' ' + p.category).toLowerCase().includes(q.trim().toLowerCase()))
  )

  // Change the stock number right in the table (whole number, never below 0).
  const setStock = (id, value) => updateProduct(id, { stock: Math.max(0, Math.floor(Number(value)) || 0) })

  return (
    <div className="panel">
      <div className="toolbar">
        <h2>Products ({products.length})</h2>
        <Link to="/admin/products/new" className="btn">+ Add product</Link>
      </div>

      <div className="toolbar filters-row">
        <input type="search" placeholder="Search products" aria-label="Search products" value={q} onChange={e => setQ(e.target.value)} />
        <select aria-label="Filter by category" value={category} onChange={e => setCategory(e.target.value)}>
          <option value="">All categories</option>
          {categories.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      <p className="ok" role="status">{notice}</p>

      {list.length ? (
        <div className="tw">
          <table>
            <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Actions</th></tr></thead>
            <tbody>
              {list.map(p => (
                <tr key={p.id}>
                  <td>
                    <div className="prod-cell">
                      <span className="pic thumb-xs"><Pic product={p} /></span>
                      <Link to={`/products/${p.id}`}><b>{p.name}</b></Link>
                    </div>
                  </td>
                  <td>{p.category}</td>
                  <td>{money(p.price)}</td>
                  <td>
                    <input type="number" min="0" className={'stock-in' + (p.stock <= LOW_STOCK ? ' low-in' : '')} value={p.stock} onChange={e => setStock(p.id, e.target.value)} aria-label={`Stock for ${p.name}`} />
                  </td>
                  <td>
                    <div className="row-actions">
                      <Link to={`/admin/products/${p.id}/edit`} className="btn sm sec">Edit</Link>
                      <ConfirmButton label="Delete" question="Delete?" onConfirm={() => { deleteProduct(p.id); setNotice(`“${p.name}” was deleted.`) }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="empty">No products match. <button className="link" onClick={() => { setQ(''); setCategory('') }}>Clear the search</button></p>
      )}
      <p className="muted small">Stock numbers save as you type. Red means {LOW_STOCK} or fewer are left. Orders take stock away automatically.</p>
    </div>
  )
}
