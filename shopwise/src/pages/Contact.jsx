// Contact.jsx: the Contact page at /contact: a message form plus ways to reach the shop.
// Sent messages are saved in the browser and shown to the admin in /admin/messages.

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useMessages } from '../context/MessagesContext'
import { apiRequest } from '../utils/api'

// What the message is about (the admin sees this).
const TOPICS = ['Order help', 'Product question', 'Returns', 'Feedback', 'Other']
// The longest message allowed.
const MAX_LENGTH = 1000

export default function Contact() {
  const { user } = useAuth()
  const { addMessage } = useMessages()
  // Error text for each field, e.g. { email: 'Enter a valid email address.' }
  const [errors, setErrors] = useState({})
  // The message that was just sent (shows the thank-you box). null while the form is shown.
  const [sent, setSent] = useState(null)
  // The text typed in the message box, so the counter can show how many characters are left.
  const [text, setText] = useState('')

  // Give the browser tab a useful title while this page is open
  useEffect(() => {
    const previous = document.title
    document.title = 'Contact | Shopwise'
    return () => { document.title = previous }
  }, [])

  // Check every field. If all are fine, save the message and show the thank-you box.
  const submit = async e => {
    e.preventDefault()
    const f = Object.fromEntries(new FormData(e.target))
    const found = {}
    if (f.name.trim().length < 2) found.name = 'Enter your name.'
    if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) found.email = 'Enter a valid email address.'
    // The order number is optional, but if it is typed it must look like 1001 or #1001.
    const order = f.order.trim()
    if (order && !/^#?\d{3,6}$/.test(order)) found.order = 'Order numbers look like #1001.'
    if (f.message.trim().length < 10) found.message = 'Please write at least 10 characters so we can help.'
    if (f.message.length > MAX_LENGTH) found.message = `Please keep the message under ${MAX_LENGTH} characters.`
    setErrors(found)
    if (Object.keys(found).length) {
      // Move the cursor to the first field with a problem.
      e.target.elements[Object.keys(found)[0]]?.focus()
      return
    }
    const message = {
      name: f.name.trim(),
      email: f.email.trim().toLowerCase(),
      topic: f.topic,
      order: order ? '#' + order.replace('#', '') : '',
      message: f.message.trim(),
    }
    let reference = null
    try { reference = await apiRequest('contact', { method: 'POST', body: JSON.stringify(message) }) }
    catch (err) { if (err.message !== 'Failed to fetch' && err.message !== 'The server request failed.') { setErrors({ message: err.message }); return } }
    const saved = addMessage(message)
    setSent(reference ? { ...saved, id: reference.id } : saved)
    setText('')
  }

  return (
    <div className="contact-page">
      <h1>Contact us</h1>
      <p className="muted">Questions about an order, a product or a return? Send us a message and we will reply by email.</p>

      <div className="contact">
        {/* Left: the message form, or the thank-you box after sending. */}
        {sent ? (
          <section className="panel sent" role="status" aria-live="polite">
            <h2>Thank you, {sent.name.split(' ')[0]}!</h2>
            <p>Your message was sent. Your reference number is <b>{sent.id}</b>.</p>
            <p className="muted">We will reply to <b>{sent.email}</b>. Your message is recorded for the shop team.</p>
            <div className="acts">
              <button className="btn" onClick={() => setSent(null)}>Send another message</button>
              <Link to="/products" className="btn sec">Keep shopping</Link>
            </div>
          </section>
        ) : (
          <form className="panel" onSubmit={submit} noValidate>
            <h2>Send a message</h2>
            <label htmlFor="c-name">Your name</label>
            <input id="c-name" name="name" autoComplete="name" defaultValue={user?.name || ''} aria-invalid={!!errors.name} aria-describedby="c-name-err" />
            <p className="err" id="c-name-err" role="alert">{errors.name}</p>

            <label htmlFor="c-email">Email</label>
            <input id="c-email" name="email" type="email" autoComplete="email" defaultValue={user?.email || ''} aria-invalid={!!errors.email} aria-describedby="c-email-err" />
            <p className="err" id="c-email-err" role="alert">{errors.email}</p>

            <div className="two">
              <div>
                <label htmlFor="c-topic">Topic</label>
                <select id="c-topic" name="topic" className="full">
                  {TOPICS.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="c-order">Order number <span className="muted small">(optional)</span></label>
                <input id="c-order" name="order" placeholder="#1001" aria-invalid={!!errors.order} aria-describedby="c-order-err" />
              </div>
            </div>
            <p className="err" id="c-order-err" role="alert">{errors.order}</p>

            <label htmlFor="c-message">Message</label>
            <textarea id="c-message" name="message" rows="6" value={text} onChange={e => setText(e.target.value)} aria-invalid={!!errors.message} aria-describedby="c-message-err" />
            <div className="counter muted small">{text.length} / {MAX_LENGTH}</div>
            <p className="err" id="c-message-err" role="alert">{errors.message}</p>

            <button className="btn block">Send message</button>
          </form>
        )}

        {/* Right: other ways to get help. */}
        <aside className="contact-info">
          <div className="panel">
            <h3>Email</h3>
            <p><a href="mailto:support@shopwise.example">support@shopwise.example</a></p>
            <h3>Opening hours</h3>
            <p>Monday to Friday, 08:00 to 17:00</p>
          </div>
          <div className="panel">
            <h3>Quick answers</h3>
            <ul className="plain">
              <li>Delivery is free on orders over $100, otherwise $6.99.</li>
              <li>Every product can be returned within 30 days.</li>
              <li>Track your orders under <Link to="/profile/orders">My orders</Link>.</li>
              <li>More answers are in the <Link to="/about">About page FAQ</Link>.</li>
            </ul>
          </div>
          <p className="notice" role="note"><b>Note.</b> Messages are stored for the shop team. No email is sent automatically.</p>
        </aside>
      </div>
    </div>
  )
}
