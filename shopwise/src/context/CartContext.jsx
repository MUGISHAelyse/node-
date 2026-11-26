// CartContext.jsx: the shopping cart. Any page can add, change or remove items.

import { createContext, useContext } from 'react'
import useLocalStorage from '../hooks/useLocalStorage'
import { useProducts } from './ProductsContext'

// A context is shared storage that any component can read without passing props down.
const CartContext = createContext(null)
// Components call useCart() to get the cart and its functions.
export const useCart = () => useContext(CartContext)

// Wrap the app with this so every page can use the cart.
export function CartProvider({ children }) {
  // The live product list (the admin can change it).
  const { getProduct } = useProducts()
  // The cart is just a list of product ids and quantities. It is saved in the browser so it survives a refresh.
  const [items, setItems] = useLocalStorage('shopwise_cart', []) // [{ id, qty }]

  // Add `qty` of a product. If it is already in the cart, add to its quantity, but never go above the stock.
  const addToCart = (id, qty = 1) => {
    const product = getProduct(id)
    if (!product || product.stock <= 0) return // nothing to add when it is out of stock
    setItems(list => {
      const found = list.find(i => i.id === id)
      const next = Math.min(product.stock, (found ? found.qty : 0) + qty)
      return found ? list.map(i => (i.id === id ? { ...i, qty: next } : i)) : [...list, { id, qty: next }]
    })
  }

  // Set an exact quantity. A quantity of 0 or less removes the item.
  const setQty = (id, qty) => {
    const product = getProduct(id)
    if (!product) return
    if (qty <= 0) return removeFromCart(id)
    setItems(list => list.map(i => (i.id === id ? { ...i, qty: Math.min(product.stock, qty) } : i)))
  }

  // Remove one product from the cart.
  const removeFromCart = id => setItems(list => list.filter(i => i.id !== id))
  // Empty the cart (used after checkout).
  const clearCart = () => setItems([])

  // Join cart rows with product details. A product the admin deleted, or sold out, is dropped,
  // and a quantity above the current stock is lowered to what is left.
  const lines = items
    .map(i => ({ ...i, product: getProduct(i.id) }))
    .filter(l => l.product && l.product.stock > 0)
    .map(l => ({ ...l, qty: Math.min(l.qty, l.product.stock) }))
  const count = lines.reduce((sum, l) => sum + l.qty, 0)
  const subtotal = lines.reduce((sum, l) => sum + l.qty * l.product.price, 0)

  // Everything inside `value` becomes available through useCart().
  return (
    <CartContext.Provider value={{ lines, count, subtotal, addToCart, setQty, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}
