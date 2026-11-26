// ProductsContext.jsx: the list of products. The admin can add, edit and delete them.
// The list is saved in the browser (localStorage), so changes survive a refresh.

import { createContext, useContext } from 'react'
import useLocalStorage from '../hooks/useLocalStorage'
import { seedProducts, seedCategories } from '../data/products'
import { apiRequest } from '../utils/api'
import { useEffect, useState } from 'react'

const ProductsContext = createContext(null)
// Components call useProducts() to get the products and the functions that change them.
export const useProducts = () => useContext(ProductsContext)

export function ProductsProvider({ children }) {
  // Starts with the sample products the first time the site is opened.
  const [products, setProducts] = useLocalStorage('shopwise_products', seedProducts)
  const [databaseConnected, setDatabaseConnected] = useState(false)

  // Load the real catalogue from MySQL through the PHP API. Keep demo data available if XAMPP is not running.
  useEffect(() => {
    let active = true
    apiRequest('products').then(data => {
      if (active && Array.isArray(data.products)) { setProducts(data.products); setDatabaseConnected(true) }
    }).catch(() => { if (active) setDatabaseConnected(false) })
    return () => { active = false }
  }, [])

  // The categories in use: the original ones first, then any new ones the admin created.
  // A category with no products left disappears from the menus.
  const names = [...new Set([...seedCategories, ...products.map(p => p.category)])]
  const categories = names.filter(c => products.some(p => p.category === c))

  // Find one product by its id. Returns undefined when there is none.
  const getProduct = id => products.find(p => p.id === id)

  // Add a product. It gets the next free number as its id, e.g. "14".
  const addProduct = product => {
    const id = String(Math.max(0, ...products.map(p => Number(p.id) || 0)) + 1)
    const saved = { rating: 0, ...product, id }
    setProducts(list => [...list, saved])
    if (databaseConnected) apiRequest('products', { method: 'POST', body: JSON.stringify(product) })
      .then(data => setProducts(list => list.map(p => p.id === id ? { ...p, id: data.id } : p)))
      .catch(err => console.error('Could not save product to MySQL:', err))
    return id
  }
  // Change some fields of one product.
  const updateProduct = (id, changes) => {
    setProducts(list => list.map(p => (p.id === id ? { ...p, ...changes } : p)))
    if (databaseConnected) {
      const updated = { ...products.find(p => p.id === id), ...changes, id }
      apiRequest('products', { method: 'PUT', body: JSON.stringify(updated) })
        .catch(err => console.error('Could not update product in MySQL:', err))
    }
  }
  // Remove a product.
  const deleteProduct = id => {
    setProducts(list => list.filter(p => p.id !== id))
    if (databaseConnected) apiRequest('products', { method: 'DELETE', query: `&id=${encodeURIComponent(id)}` })
      .catch(err => console.error('Could not delete product from MySQL:', err))
  }

  // Take stock away (direction -1, an order is placed) or put it back (direction 1, an order is cancelled).
  // `items` is a list of { id, qty }. Stock never goes below 0.
  const adjustStock = (items, direction) =>
    setProducts(list =>
      list.map(p => {
        const hit = items.find(i => i.id === p.id)
        return hit ? { ...p, stock: Math.max(0, p.stock + direction * hit.qty) } : p
      })
    )

  return (
    <ProductsContext.Provider value={{ products, categories, getProduct, addProduct, updateProduct, deleteProduct, adjustStock, databaseConnected }}>
      {children}
    </ProductsContext.Provider>
  )
}
