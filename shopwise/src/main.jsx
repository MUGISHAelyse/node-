// main.jsx: the first file that runs. It starts React and shows the app on the page.

import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import router from './router.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { ProductsProvider } from './context/ProductsContext.jsx'
import { MessagesProvider } from './context/MessagesContext.jsx'
import { CartProvider } from './context/CartContext.jsx'
import { ReviewsProvider } from './context/ReviewsContext.jsx'
import './index.css'

// Find <div id="root"> in index.html and draw the whole app inside it.
ReactDOM.createRoot(document.getElementById('root')).render(
  // StrictMode adds extra warnings while developing. It does nothing in the final site.
  <React.StrictMode>
    {/* Providers share data with every page inside them.
       AuthProvider = who is logged in and the orders, ProductsProvider = the products (the admin can change them),
       CartProvider = the cart, ReviewsProvider = product reviews, MessagesProvider = messages from the Contact page.
       CartProvider is inside ProductsProvider because the cart needs the product list. */}
    <AuthProvider>
      <ProductsProvider>
        <CartProvider>
          <ReviewsProvider>
            <MessagesProvider>
              {/* RouterProvider shows the page that matches the current URL. The routes are in router.jsx. */}
              <RouterProvider router={router} />
            </MessagesProvider>
          </ReviewsProvider>
        </CartProvider>
      </ProductsProvider>
    </AuthProvider>
  </React.StrictMode>
)
