// AuthContext.jsx: who is logged in, the list of all users, and the orders that have been placed.

import { createContext, useContext } from 'react'
import useLocalStorage from '../hooks/useLocalStorage'
import { hashPassword, newSalt } from '../utils/password'
import { apiRequest } from '../utils/api'

const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

// DEMO ADMIN ACCOUNT. Everything runs in the browser, so this is NOT real security:
// anyone can read this file. A real shop checks passwords on a server.
export const ADMIN_EMAIL = 'admin@shopwise.com'
export const ADMIN_PASSWORD = 'admin123'

// The users that exist the first time the site is opened: the admin and three example customers.
const seedUsers = [
  { name: 'Shop Admin', email: ADMIN_EMAIL, role: 'admin', joined: '2026-01-01', blocked: false },
  { name: 'Tom B.', email: 'tom@example.com', role: 'customer', joined: '2026-08-02', blocked: false },
  { name: 'Amara K.', email: 'amara@example.com', role: 'customer', joined: '2026-08-19', blocked: false },
  { name: 'Lerato M.', email: 'lerato@example.com', role: 'customer', joined: '2026-09-14', blocked: false },
]

// Example orders so the admin pages are not empty the first time. They belong to the example customers above.
const seedOrders = [
  { id: '#1001', date: '2026-09-20', createdAt: '2026-09-20T10:15:00.000Z', status: 'Delivered', email: 'tom@example.com', name: 'Tom B.', total: 61.99, ship: '12 Oak Street, Cape Town',
    items: [{ id: '6', name: 'Backpack', emoji: '🎒', qty: 1, price: 55 }] },
  { id: '#1002', date: '2026-10-01', createdAt: '2026-10-01T14:40:00.000Z', status: 'Shipped', email: 'amara@example.com', name: 'Amara K.', total: 173, ship: '8 Palm Avenue, Durban',
    items: [{ id: '2', name: 'Smartwatch', emoji: '⌚', qty: 1, price: 149 }, { id: '11', name: 'Paperback Books', emoji: '📚', qty: 2, price: 12 }] },
  { id: '#1003', date: '2026-10-05', createdAt: '2026-10-05T09:05:00.000Z', status: 'Processing', email: 'lerato@example.com', name: 'Lerato M.', total: 158, ship: '3 Hill Road, Pretoria',
    items: [{ id: '5', name: 'Running Sneakers', emoji: '👟', qty: 2, price: 79 }] },
  { id: '#1004', date: '2026-10-07', createdAt: '2026-10-07T16:20:00.000Z', status: 'Cancelled', email: 'tom@example.com', name: 'Tom B.', total: 66.99, ship: '12 Oak Street, Cape Town',
    items: [{ id: '12', name: 'Football', emoji: '⚽', qty: 1, price: 25 }, { id: '7', name: 'Sunglasses', emoji: '🕶️', qty: 1, price: 35 }] },
]

// The steps an order goes through. The admin changes the status in /admin/orders.
export const ORDER_STATUSES = ['Processing', 'Shipped', 'Delivered', 'Cancelled']

export function AuthProvider({ children }) {
  // Every account on this device: { name, email, role: 'customer' | 'admin', joined, blocked }.
  const [users, setUsers] = useLocalStorage('shopwise_users', seedUsers)
  // The email of the person who is logged in, or null when logged out.
  const [session, setSession] = useLocalStorage('shopwise_session', null)
  // Every order placed on this device.
  const [allOrders, setAllOrders] = useLocalStorage('shopwise_orders', seedOrders)

  // The logged-in user. A blocked or deleted account counts as logged out.
  const record = users.find(u => u.email === session)
  const user = record && !record.blocked ? record : null
  const isAdmin = user?.role === 'admin'

  // Log in with an email and password. Returns { ok: true, role } or { error: 'message to show' }.
  // Admin accounts use the demo ADMIN_PASSWORD. Customers use the password they chose when signing up.
  const login = async (email, password) => {
    // Authenticate against MySQL first. If Apache is offline, keep the original demo mode usable.
    try {
      const data = await apiRequest('login', { method: 'POST', body: JSON.stringify({ email, password }) })
      const account = { ...data.user, joined: data.user.joined || new Date().toISOString().slice(0, 10) }
      setUsers(list => [...list.filter(u => u.email !== account.email), account])
      setSession(account.email)
      return { ok: true, role: account.role }
    } catch (error) {
      if (error.message !== 'Failed to fetch' && error.message !== 'The server request failed.') return { error: error.message }
    }
    const found = users.find(u => u.email === email)
    const wrong = { error: 'Incorrect email or password.' } // the same message for both, so it does not reveal which one was wrong
    if (!found) return wrong
    if (found.blocked) return { error: 'This account has been blocked. Please contact us if you think this is a mistake.' }
    if (found.role === 'admin') {
      if (password !== ADMIN_PASSWORD) return wrong
    } else {
      if (!found.hash) return { error: 'This is an example account without a password. Please sign up with your own email.' }
      try {
        if ((await hashPassword(password, found.salt)) !== found.hash) return wrong
      } catch {
        return { error: 'Passwords need a secure page (https or localhost).' }
      }
    }
    setSession(email)
    return { ok: true, role: found.role }
  }

  // Create a new customer account and log in. Returns { ok: true } or { error }.
  const signup = async (name, email, password) => {
    try {
      const data = await apiRequest('signup', { method: 'POST', body: JSON.stringify({ name, email, password }) })
      const account = { ...data.user, joined: data.user.joined || new Date().toISOString().slice(0, 10) }
      setUsers(list => [...list.filter(u => u.email !== account.email), account])
      setSession(account.email)
      return { ok: true, role: account.role }
    } catch (error) {
      if (error.message !== 'Failed to fetch' && error.message !== 'The server request failed.') return { error: error.message }
    }
    if (users.some(u => u.email === email)) return { error: 'An account with this email already exists. Please log in instead.' }
    try {
      const salt = newSalt()
      const hash = await hashPassword(password, salt)
      setUsers(list => [...list, { name, email, role: 'customer', joined: new Date().toLocaleDateString(), blocked: false, salt, hash }])
    } catch {
      return { error: 'Passwords need a secure page (https or localhost).' }
    }
    setSession(email)
    return { ok: true, role: 'customer' }
  }
  // Log out by forgetting who is logged in.
  const logout = () => {
    apiRequest('logout', { method: 'POST', body: JSON.stringify({}) }).catch(() => {})
    setSession(null)
  }

  // Change the name or email (used on the Settings page). Returns { ok: true } or { error }.
  const updateUser = changes => {
    if (changes.email && changes.email !== user.email && users.some(u => u.email === changes.email)) {
      return { error: 'That email address is already used by another account.' }
    }
    setUsers(list => list.map(u => (u.email === user.email ? { ...u, ...changes } : u)))
    // Orders are matched to a person by email, so move them to the new email too.
    if (changes.email && changes.email !== user.email) {
      setAllOrders(list => list.map(o => (o.email === user.email ? { ...o, email: changes.email } : o)))
      setSession(changes.email)
    }
    return { ok: true }
  }

  // Save a new order. The id counts up from #1001 and the status starts as "Processing".
  const addOrder = order => {
    const saved = {
      id: '#' + (1001 + allOrders.length),
      date: new Date().toLocaleDateString(),
      createdAt: new Date().toISOString(), // used by the admin to sort and to read the date
      status: 'Processing',
      email: user.email,
      name: user.name,
      ...order,
    }
    setAllOrders(list => [...list, saved])
    return saved
  }
  // Only the orders that belong to the logged-in user.
  const orders = user ? allOrders.filter(o => o.email === user.email) : []

  // ---- admin functions (the admin pages are only shown to admins) ----
  // Change the status of one order.
  const setOrderStatus = (id, status) => setAllOrders(list => list.map(o => (o.id === id ? { ...o, status } : o)))
  // Block or unblock an account. A blocked person cannot log in.
  const setUserBlocked = (email, blocked) => setUsers(list => list.map(u => (u.email === email ? { ...u, blocked } : u)))
  // Make an account an admin or a normal customer.
  const setUserRole = (email, role) => setUsers(list => list.map(u => (u.email === email ? { ...u, role } : u)))
  // Delete an account (their past orders are kept).
  const deleteUser = email => setUsers(list => list.filter(u => u.email !== email))

  return (
    <AuthContext.Provider
      value={{ user, isAdmin, users, login, signup, logout, updateUser, orders, allOrders, addOrder, setOrderStatus, setUserBlocked, setUserRole, deleteUser }}
    >
      {children}
    </AuthContext.Provider>
  )
}
