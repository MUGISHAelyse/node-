// router.jsx: the map of the website. It says which page (component) to show for each URL.

import { createBrowserRouter, Navigate } from 'react-router-dom'

import Layout from './components/Layout'
import RequireAuth from './components/RequireAuth'
import RequireAdmin from './components/RequireAdmin'
import Redirect from './components/Redirect'
import { redirects } from './utils/redirects'

import Home from './pages/Home'
import ProductList from './pages/ProductList'
import ProductLayout from './pages/product/ProductLayout'
import ProductOverview from './pages/product/ProductOverview'
import ReviewsLayout from './pages/product/ReviewsLayout'
import ReviewList from './pages/product/ReviewList'
import WriteReview from './pages/product/WriteReview'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Login from './pages/Login'
import Signup from './pages/Signup'
import About from './pages/About'
import Contact from './pages/Contact'
import Assistant from './pages/Assistant'
import NotFound from './pages/NotFound'
import RouteError from './pages/RouteError'
import ProfileLayout from './pages/profile/ProfileLayout'
import ProfileOverview from './pages/profile/ProfileOverview'
import ProfileOrders from './pages/profile/ProfileOrders'
import ProfileSettings from './pages/profile/ProfileSettings'
import AdminLayout from './pages/admin/AdminLayout'
import Dashboard from './pages/admin/Dashboard'
import AdminProducts from './pages/admin/AdminProducts'
import ProductForm from './pages/admin/ProductForm'
import AdminOrders from './pages/admin/AdminOrders'
import AdminUsers from './pages/admin/AdminUsers'
import AdminReviews from './pages/admin/AdminReviews'
import AdminMessages from './pages/admin/AdminMessages'

/*
  ROUTE MAP
  /                              Home
  /products                      Product listing (all)        ?q=search &sort=price-asc
  /products/category/:category   Product listing (one category)
  /products/:productId           Product page (PARENT layout, nested children below)
    /products/:productId                 Details tab        (index child)
    /products/:productId/reviews         Reviews tab        (ReviewsLayout > ReviewList)
    /products/:productId/reviews/new     Write a review     (ReviewsLayout > WriteReview, login required)
  /cart                          Shopping cart
  /checkout                      Checkout (login required)
  /login                         Log in
  /signup                        Sign up (create an account)
  /about                         About page
  /contact                       Contact page (message form)
  /assistant                     Help me choose (AI product suggestions)
  /profile                       User profile overview (login required)
  /profile/orders                User orders
  /profile/settings              User settings
  /admin                         Admin dashboard (admins only)
    /admin/products                    Product table
    /admin/products/new                Add a product
    /admin/products/:productId/edit    Edit a product
    /admin/orders                      All orders, change status
    /admin/users                       All accounts, block / make admin
    /admin/reviews                     All reviews, delete
    /admin/messages                    Messages from the Contact page
  *                              Custom 404 page

  OUTDATED URLS (redirected, see utils/redirects.js)
  /shop, /product/3, /basket, /signin, /account ...   ->  the current pages
*/
// createBrowserRouter builds the route table. Each object is one URL pattern:
// path = the part of the URL, element = the page to show,
// children = nested routes that appear inside the parent's <Outlet />.
const router = createBrowserRouter([
  // 1. Outdated URLs: each one redirects to its current address
  ...redirects.map(({ from, to }) => ({ path: from, element: <Redirect to={to} /> })),

  // 2. The real site
  {
    path: '/',
    element: <Layout />, // navbar + footer + <Outlet /> for the page
    errorElement: <RouteError />, // if the layout itself fails
    children: [
      {
        // A route with no path: it only adds an errorElement, so a page that
        // crashes shows the error page INSIDE the layout (navbar stays visible).
        errorElement: <RouteError />,
        children: [
          // index: true means "the page at the parent's own URL", here "/".
          { index: true, element: <Home /> },

          // Product listing routes + dynamic detail route
          {
            path: 'products',
            children: [
              { index: true, element: <ProductList /> },
              // :category is a URL parameter. The page reads it with useParams(), e.g. "Books".
              { path: 'category/:category', element: <ProductList /> },

              // Nested routes: ProductLayout draws the header + tabs and an <Outlet />.
              // ReviewsLayout is a second parent with its own <Outlet />.
              {
                path: ':productId',
                element: <ProductLayout />,
                children: [
                  { index: true, element: <ProductOverview /> },
                  {
                    path: 'reviews',
                    element: <ReviewsLayout />,
                    children: [
                      { index: true, element: <ReviewList /> },
                      // RequireAuth: only logged-in visitors may open this page. Others are sent to /login.
                      { path: 'new', element: <RequireAuth><WriteReview /></RequireAuth> },
                    ],
                  },
                ],
              },
            ],
          },

          // Shopping cart route
          { path: 'cart', element: <Cart /> },
          { path: 'checkout', element: <RequireAuth><Checkout /></RequireAuth> },

          { path: 'login', element: <Login /> },
          { path: 'signup', element: <Signup /> },

          // About and Contact pages
          { path: 'about', element: <About /> },
          { path: 'contact', element: <Contact /> },
          // AI shopping helper: describe what you need, get product suggestions
          { path: 'assistant', element: <Assistant /> },

          // User profile routes (nested, all protected)
          {
            path: 'profile',
            element: <RequireAuth><ProfileLayout /></RequireAuth>,
            children: [
              { index: true, element: <ProfileOverview /> },
              { path: 'orders', element: <ProfileOrders /> },
              { path: 'settings', element: <ProfileSettings /> },
            ],
          },

          // Admin routes (nested, admins only). AdminLayout draws the side menu and an <Outlet />.
          {
            path: 'admin',
            element: <RequireAdmin><AdminLayout /></RequireAdmin>,
            children: [
              { index: true, element: <Dashboard /> },
              {
                path: 'products',
                children: [
                  { index: true, element: <AdminProducts /> },
                  // The same form adds (new) and edits (:productId/edit).
                  { path: 'new', element: <ProductForm /> },
                  { path: ':productId', element: <Navigate to="edit" replace /> }, // /admin/products/5 -> /admin/products/5/edit
                  { path: ':productId/edit', element: <ProductForm /> },
                ],
              },
              { path: 'orders', element: <AdminOrders /> },
              { path: 'users', element: <AdminUsers /> },
              { path: 'reviews', element: <AdminReviews /> },
              { path: 'messages', element: <AdminMessages /> },
            ],
          },

          // 3. Anything that matched nothing above: the custom 404 page
          { path: '*', element: <NotFound /> },
        ],
      },
    ],
  },
])

// Shared so main.jsx can give the router to <RouterProvider>.
export default router
