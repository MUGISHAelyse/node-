// MessagesContext.jsx: messages sent from the Contact page. The admin reads them in /admin/messages.
// There is no server, so messages are saved in this browser (localStorage).

import { createContext, useContext } from 'react'
import useLocalStorage from '../hooks/useLocalStorage'

const MessagesContext = createContext(null)
export const useMessages = () => useContext(MessagesContext)

// Two example messages so the admin page is not empty the first time.
const seedMessages = [
  { id: 'M-1002', name: 'Lerato M.', email: 'lerato@example.com', topic: 'Product question', order: '', message: 'Does the Winter Coat run large or small? I am between two sizes and would like some advice before I order.', date: '2026-10-03', read: false },
  { id: 'M-1001', name: 'Tom B.', email: 'tom@example.com', topic: 'Returns', order: '#1001', message: 'I would like to return the Backpack from my last order. What is the best way to send it back?', date: '2026-09-28', read: true },
]

export function MessagesProvider({ children }) {
  const [messages, setMessages] = useLocalStorage('shopwise_messages', seedMessages)

  // Save a new message. It gets the next reference number (M-1003 ...), today's date and starts as unread.
  const addMessage = msg => {
    const next = Math.max(1000, ...messages.map(m => Number(m.id.slice(2)) || 0)) + 1
    const saved = { id: 'M-' + next, date: new Date().toISOString().slice(0, 10), read: false, order: '', ...msg }
    setMessages(list => [saved, ...list])
    return saved
  }
  // Mark a message as read or unread.
  const setRead = (id, read) => setMessages(list => list.map(m => (m.id === id ? { ...m, read } : m)))
  // Delete a message.
  const deleteMessage = id => setMessages(list => list.filter(m => m.id !== id))
  const unread = messages.filter(m => !m.read).length

  return (
    <MessagesContext.Provider value={{ messages, unread, addMessage, setRead, deleteMessage }}>
      {children}
    </MessagesContext.Provider>
  )
}
