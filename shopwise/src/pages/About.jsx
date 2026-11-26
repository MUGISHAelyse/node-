// About.jsx: the About page at /about: who we are, what we stand for and how ordering works.

import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useProducts } from '../context/ProductsContext'
import { useReviews } from '../context/ReviewsContext'

// The four things the store promises (shown as cards)
const values = [
  { title: 'Fair prices', text: 'The price you see is the price you pay. Delivery is free on orders over $100.' },
  { title: 'Honest reviews', text: 'Every product shows its rating and customer reviews. Reviews from buyers carry a "Verified purchase" label.' },
  { title: 'Easy returns', text: 'Change your mind? Every product can be returned within 30 days.' },
  { title: 'Your privacy', text: 'In this demo, your account, cart and orders are saved only in your own browser. Nothing is sent to a server.' },
]

// The steps from browsing to receiving an order
const steps = [
  ['Browse.', 'Search, filter by price or rating, or open a category.'],
  ['Add to cart.', 'Change quantities any time in your cart.'],
  ['Check out.', 'Log in or sign up, enter your delivery details and place the order.'],
  ['Track it.', 'Find every order on your profile under "My orders".'],
]

// Common questions (each one opens and closes)
const faqs = [
  ['How much is delivery?', 'Delivery is free on orders over $100. Smaller orders pay $6.99.'],
  ['Can I return something?', 'Yes. Every product can be returned within 30 days.'],
  ['Do I need an account to buy?', 'You can browse and fill your cart without one. You log in or create an account at checkout. In this demo your account and password are kept only in your browser.'],
  ['Is this a real store?', 'No. Shopwise is a demo built with React. Orders are saved in your browser and no payment is taken.'],
]

export default function About() {
  const { products, categories } = useProducts()
  const { all: allReviews } = useReviews()
  // Give the browser tab a useful title while this page is open
  useEffect(() => {
    const previous = document.title
    document.title = 'About | Shopwise'
    return () => { document.title = previous }
  }, [])

  // Numbers come from the real data, so they stay correct when products are added
  const stats = [
    [products.length, 'Products'],
    [categories.length, 'Categories'],
    [allReviews.length, 'Customer reviews'],
    ['$100', 'Free delivery over'],
  ]

  return (
    <div className="about">
      {/* Banner at the top of the page */}
      <section className="hero">
        <div>
          <h1>About Shopwise</h1>
          <p>A small online store for electronics, fashion, clothes, books and sports gear, built to make shopping clear and fair.</p>
          <Link to="/products" className="btn gold">Browse products</Link>
        </div>
        <div className="big" aria-hidden="true">🛍️</div>
      </section>

      {/* Key numbers */}
      <div className="stats about-stats">
        {stats.map(([number, label]) => (
          <div className="stat" key={label}><b>{number}</b><span>{label}</span></div>
        ))}
      </div>

      {/* Our story */}
      <div className="panel">
        <h2>Our story</h2>
        <p>Shopwise started with one idea: buying things online should feel as clear as shopping in a good local store. You can see the price, the stock level and what other customers think before anything goes into your cart.</p>
        <p>We keep the range focused instead of selling everything. Each product has a plain description, a rating based on customer reviews, and a stock level so you know when something is running low.</p>
      </div>

      {/* What we stand for */}
      <h2>What we stand for</h2>
      <div className="vals">
        {values.map(v => (
          <div className="val" key={v.title}>
            <h3>{v.title}</h3>
            <p>{v.text}</p>
          </div>
        ))}
      </div>

      {/* How ordering works */}
      <div className="panel">
        <h2>How ordering works</h2>
        <ol className="steps">
          {steps.map(([bold, text]) => <li key={bold}><b>{bold}</b> {text}</li>)}
        </ol>
      </div>

      {/* Frequently asked questions */}
      <div className="panel faq">
        <h2>Questions people ask</h2>
        {faqs.map(([question, answer]) => (
          <details key={question}>
            <summary>{question}</summary>
            <p>{answer}</p>
          </details>
        ))}
      </div>

      {/* Be honest that this is a demo */}
      <p className="notice" role="note">
        <b>Demo store.</b> Shopwise is a practice project. The products, reviews and orders are examples and no real payments are taken.
      </p>

      {/* Call to action */}
      <div className="panel about-cta">
        <h2>Ready to look around?</h2>
        <div className="acts">
          <Link to="/products" className="btn">Browse products</Link>
          <Link to="/products?rating=4.5&sort=rating" className="btn sec">See top rated</Link>
          <Link to="/contact" className="btn sec">Contact us</Link>
        </div>
      </div>
    </div>
  )
}
