// Layout.jsx: the frame around every page: menu on top, footer at the bottom, the current page in the middle.

import { useEffect, useRef, useState } from 'react'
import { Outlet, ScrollRestoration, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Breadcrumbs from './Breadcrumbs'
import Footer from './Footer'
import useLocalStorage from '../hooks/useLocalStorage'

export default function Layout() {
  // "light" or "dark". Starts from the saved choice, or from the device setting.
  const [theme, setTheme] = useLocalStorage('shopwise_theme', matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  const location = useLocation()
  const mainRef = useRef(null)
  const first = useRef(true)
  const [dismissed, setDismissed] = useState(null)

  // Set when a redirect sent the visitor here (see components/Redirect.jsx)
  const movedFrom = location.state?.redirectedFrom

  useEffect(() => {
    // The CSS reads data-theme on <html> to switch the colours.
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  // After moving to a new page, put keyboard focus on the page content
  // so screen readers and keyboard users start at the top of it.
  useEffect(() => {
    if (first.current) { first.current = false; return }
    mainRef.current?.focus({ preventScroll: true })
  }, [location.pathname])

  return (
    <>
      {/* Lets keyboard users jump past the menu straight to the page content. */}
      <a href="#main-content" className="skip">Skip to content</a>
      <Navbar theme={theme} toggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')} />
      <main id="main-content" className="container" tabIndex={-1} ref={mainRef}>
        {movedFrom && dismissed !== location.key && (
          <div className="moved" role="status">
            <span>
              The address <code>{movedFrom}</code> has moved. You are now on <code>{location.pathname + location.search}</code>.
              Please update your bookmark.
            </span>
            <button className="link" onClick={() => setDismissed(location.key)}>Dismiss</button>
          </div>
        )}
        <Breadcrumbs />
        {/* The page for the current URL appears here. */}
        <Outlet />
      </main>
      <Footer />
      {/* Scrolls to the top on a new page and restores the position when going Back. */}
      <ScrollRestoration />
    </>
  )
}
