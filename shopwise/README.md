# Shopwise: React + React Router e-commerce site

## 1. Project setup and configuration

| Step | Where |
|---|---|
| 1.2 Create a React app | Vite + React 18 (`package.json`, `vite.config.js`, `index.html`, `src/main.jsx`) |
| 1.3 Install React Router | `react-router-dom` v6 is in `package.json` and installed by `npm install` |
| 1.4 Organize files and components | see the structure below |

Create the same setup from scratch with:
```
npm create vite@latest shopwise -- --template react
cd shopwise
npm install react-router-dom
```

## 2. Routing configuration (all in `src/router.jsx`)

| Step | Route | Page |
|---|---|---|
| 2.1 Main router | `createBrowserRouter` + `<RouterProvider>` in `src/main.jsx`; `Layout` renders the navbar, footer and an `<Outlet />` | `components/Layout.jsx` |
| 2.2 Product listing | `/products` and `/products/category/:category` (supports `?q=`, `?min=`, `?max=`, `?rating=`, `?sort=`, `?page=`) | `pages/ProductList.jsx` |
| 2.3 User profile | `/profile`, `/profile/orders`, `/profile/settings` (nested routes, login required) | `pages/profile/*` |
| 2.4 Shopping cart | `/cart` (and `/checkout`) | `pages/Cart.jsx`, `pages/Checkout.jsx` |
| 2.5 Dynamic product detail | `/products/:productId` read with `useParams()` | `pages/product/ProductLayout.jsx` |

Extras: `/login` and `/signup` (separate forms), `/about` (the About page with story, values, ordering steps and FAQ), `/contact` and `/admin` (sections 7 and 8 below), a `RequireAuth` guard that redirects to `/login` and back, old-URL redirects, and a custom 404 page (`*`).

## 3. Navigation implementation

| Step | What was built | Where |
|---|---|---|
| 3.1 Navigation links and menu | Top bar with Home, a **Shop dropdown** (all products + every category), search, dark-mode toggle, cart with item count, and a **user menu** (profile, orders, settings, log out). On phones a **menu button** opens a full list of links. A footer repeats the main links. | `components/Navbar.jsx`, `components/Footer.jsx` |
| 3.2 Navigation between pages | Every link is a React Router `<Link>` or `<NavLink>`, so pages change without a reload. Search and checkout use `useNavigate()`. Product cards, cart rows, order items and breadcrumbs all link to the right route. | `Navbar`, `ProductCard`, `Cart`, `Checkout`, `ProfileOrders` |
| 3.3 Clear and user-friendly | `NavLink` highlights the page you are on. **Breadcrumbs** (Home / Products / Smartwatch) show where you are and link back up. Menus close when the page changes, on outside click, and on Escape. A **Skip to content** link, labelled buttons (`aria-expanded`, `aria-label`) and focus moved to the page content after each navigation help keyboard and screen reader users. | `components/Breadcrumbs.jsx`, `components/Layout.jsx` |

## 4. URL parameters and filtering

| Step | What was built | Where |
|---|---|---|
| 4.1 Use URL query parameters correctly | `useSearchParams()` reads and writes the query string. Every choice lives in the URL: `q`, `category`, `min`, `max`, `rating`, `sort`, `page`. Links, the back button, refresh and bookmarks all keep the filters. Changing one filter keeps the others and resets to page 1. | `pages/ProductList.jsx` |
| 4.2 Filter products from the URL | `applyFilters()` filters by category, search text, price range and minimum rating, then sorts and splits the result into pages of 8. The page shows active filter tags you can remove, and the category links keep your other filters. | `utils/filters.js` |
| 4.3 Missing or invalid parameters | Missing values use defaults. Invalid values are ignored and a notice explains why. Examples are in the table below. Nothing crashes and the page never goes blank. | `parseFilters()` in `utils/filters.js` |

Try these URLs:

| URL | Result |
|---|---|
| `/products?max=50&sort=price-asc` | Products up to $50, cheapest first |
| `/products?rating=4.5&sort=rating` | Rated 4.5 and up, best first |
| `/products/category/Clothes?max=60` | Clothes under $60 |
| `/products?q=watch` | Search results |
| `/products?sort=banana` | Notice, Featured order used |
| `/products?min=abc&max=-5` | Notice, both prices ignored |
| `/products?min=100&max=20` | Notice, the two prices are swapped |
| `/products?rating=9` | Notice, rating ignored |
| `/products?page=99` | Notice, last page shown |
| `/products/category/Toys` | 404 "Category not found" page |
| `/products?min=900&rating=5` | "No products match" with a Clear button |

## 5. Nested routing for product reviews

The product page is now a **parent route** with **nested child routes** (all in `src/router.jsx`):

```
/products/:productId                 ProductLayout   (header, add to cart, tabs, <Outlet />)
├─ (index)                           ProductOverview  Details tab
└─ reviews                           ReviewsLayout    (score summary, <Outlet />)
   ├─ (index)                        ReviewList       /products/3/reviews
   └─ new                            WriteReview      /products/3/reviews/new  (login required)
```

| Step | What was built | Where |
|---|---|---|
| 5.1 Configure nested routes | `:productId` has `children`: an index route, and `reviews` which has its own `children` (an index route and `new`). Child paths are relative, so `reviews/new` becomes `/products/3/reviews/new`. `RequireAuth` guards only the write form. | `router.jsx` |
| 5.2 Display reviews for the selected product | `ReviewList` shows the reviews of the product in the URL, with a score summary, a star breakdown (each row links to `?stars=5`), sorting (`?sort=highest`), a "Verified purchase" label, and an empty state. Visitors can write and delete their own review. Cards, filters and Top rated use the review averages. | `pages/product/*`, `context/ReviewsContext.jsx`, `data/reviews.js` |
| 5.3 Parent layout and Outlet | `ProductLayout` and `ReviewsLayout` draw the shared parts once and render `<Outlet context={...} />`. Children read the product, reviews and stats with `useOutletContext()` instead of looking them up again. | `ProductLayout.jsx`, `ReviewsLayout.jsx` |

Try: `/products/3/reviews`, `/products/3/reviews?stars=5&sort=highest`, `/products/3/reviews/new`,
`/products/3/reviews?stars=9` (notice and all reviews), `/products/99/reviews` (product not found).

## 6. Redirects and 404 error handling

| Step | What was built | Where |
|---|---|---|
| 6.1 Redirects for outdated URLs | A table of 50 old addresses and where they now go. Each becomes a route that redirects, keeps `:params` and the `?query`, and uses `replace` so the Back button does not loop. A "This page has moved, please update your bookmark" notice appears after a redirect. Old query names are fixed too (`?search=` becomes `?q=`, `?sort=price_asc` becomes `?sort=price-asc`), and `/products/category/books` becomes `/products/category/Books`. The same list is written to `public/_redirects` for real HTTP 301 redirects on the host. | `utils/redirects.js`, `components/Redirect.jsx`, `public/_redirects` |
| 6.2 Custom 404 page | A friendly 404 with the address that was not found, a "Did you mean...?" suggestion for small typos (`/prodcuts`), a search box, Go back / Home / Browse buttons, and category links. The browser tab title changes to "Page not found". | `pages/NotFound.jsx` |
| 6.3 Non-existent routes handled correctly | The `*` route catches every unknown address and shows the 404 page inside the normal layout. Unknown products (`/products/99`) and categories (`/products/category/Toys`) show the same page with their own message. An `errorElement` shows a "Something went wrong" page if a page crashes, with the navbar still visible. | `router.jsx`, `pages/RouteError.jsx`, `pages/product/ProductLayout.jsx`, `pages/ProductList.jsx` |

Try these addresses:

| Address | Result |
|---|---|
| `/shop` | Redirects to `/products` |
| `/product/3` | Redirects to `/products/3` |
| `/category/books` | Redirects to `/products/category/Books` |
| `/products?search=watch&sort=price_asc` | Redirects to `/products?q=watch&sort=price-asc` |
| `/basket`, `/signin`, `/account` | Redirect to `/cart`, `/login`, `/profile` |
| `/register`, `/join` | Redirect to `/signup` |
| `/prodcuts` | 404 with "Did you mean /products?" |
| `/careers` | 404 page |
| `/products/99` | 404 "Product not found" |
| `/products/category/Toys` | 404 "Category not found" |
| `/products/3/foo` | 404 page |

Note: this is a single-page app, so unknown addresses are answered by `index.html` with status 200 and
the 404 page is drawn by React. The redirects in `public/_redirects` are real 301s on Netlify. Other hosts
use their own format (Vercel: `vercel.json`, Apache: `.htaccess`). Search engines only see a true 404 status
if the page is rendered on a server.

## 7. Contact page

`/contact` (`pages/Contact.jsx`) has a message form (name, email, topic, optional order number, message) and a side
column with email, opening hours and quick answers. Every field is checked, and the first field with a problem gets the
cursor. When the form is valid, the message is saved by `context/MessagesContext.jsx` with a reference number
(for example `M-1003`) and a thank-you box replaces the form. Name and email are filled in when you are logged in.
There is no server, so nothing is emailed: messages are saved in the browser and appear in **Admin > Messages**.

## 8. Admin area

Customers create an account at `/signup` (name, email, password, confirm password) and log in at `/login` (email and password). Passwords are saved as salted SHA-256 hashes (`utils/password.js`), never as plain text.
Log in at `/login` with the demo admin account **admin@shopwise.com** and password **admin123** (defined in
`context/AuthContext.jsx`). An **Admin** link then appears in the menu, the user dropdown and the footer.

| Page | Address | What the admin can do |
|---|---|---|
| Dashboard | `/admin` | Sales, orders to process, customers, products, low stock and new messages; orders by status and best sellers as bar charts; products to restock; latest orders; reset the demo data |
| Products | `/admin/products` | Search and filter, change the stock number in the table, edit, delete |
| Add / edit product | `/admin/products/new`, `/admin/products/:productId/edit` | Name, category (or a new one), price, stock, description, a **photo chosen from your computer** (shrunk and saved in the browser) or an emoji, with a live preview |
| Orders | `/admin/orders` | See every order, search, filter by status, change the status (Processing, Shipped, Delivered, Cancelled). Cancelling puts the items back in stock |
| Customers | `/admin/users` | See every account with its orders and spend; block or unblock, make admin or remove admin, delete |
| Reviews | `/admin/reviews` | Filter by product or stars and delete any review |
| Messages | `/admin/messages` | Read messages from the Contact page (opening one marks it as read), reply by email, mark unread, delete |

How it fits together:

- `context/ProductsContext.jsx` now holds the product list (starting from `data/products.js`), so the shop, the cart and the
  admin all see the same products. New categories appear in the menus automatically. Checkout takes the bought items out of the stock.
- `context/AuthContext.jsx` keeps a list of accounts with a role (`customer` or `admin`) and all orders. A blocked account is logged out.
- `components/RequireAdmin.jsx` guards `/admin`: visitors who are not logged in are sent to `/login`, and customers see a "403 Admins only" page.
- `pages/admin/AdminLayout.jsx` is the parent route: a side menu and an `<Outlet />` for the chosen admin page.
- Delete buttons ask "Sure?" first (`components/ConfirmButton.jsx`).

**This is a demo, not real security.** The admin password is written in the source code and every check runs in the browser, so
anyone who opens the developer tools can change it. A real shop needs a backend that checks logins and permissions.
The first time the site opens it contains example customers, orders and messages so the admin pages are not empty. The example customers have no password, so use Sign up for your own account.

## Reading the code

Every file starts with a comment that says what it is for, and the important lines have a short
plain-English comment above them. A good reading order is `main.jsx`, `router.jsx`, then the
`context/` files, then the `pages/` and `components/` folders.

## Run it
1. Install Node.js (LTS) from https://nodejs.org
2. `npm install`
3. `npm run dev` and open the link it prints (usually http://localhost:5173)
4. `npm run build` creates the `dist` folder for hosting. Because the site uses real URLs
   (BrowserRouter), the host must send all paths to `index.html` (Netlify: add a `_redirects`
   file with `/* /index.html 200`; Vercel does this for Vite apps automatically).

## Project structure
```
shopwise/
├─ index.html
├─ package.json
├─ vite.config.js
└─ src/
   ├─ main.jsx            # entry: providers + RouterProvider
   ├─ router.jsx          # ALL routes in one place
   ├─ index.css           # styling, light and dark mode
   ├─ data/products.js    # product data (fake database)
   ├─ data/reviews.js     # sample customer reviews
   ├─ hooks/useLocalStorage.js
   ├─ utils/filters.js    # reads and validates URL parameters, filters, sorts, pages
   ├─ utils/redirects.js  # old URLs -> new URLs, old query names, "did you mean"
   ├─ context/
   │  ├─ ProductsContext.jsx # the live product list: add, edit, delete, stock
   │  ├─ CartContext.jsx  # cart items, totals, add/remove
   │  ├─ AuthContext.jsx  # demo login, accounts and roles, orders
   │  ├─ ReviewsContext.jsx # reviews, averages, add/delete
   │  └─ MessagesContext.jsx # messages from the Contact page
   ├─ components/         # Layout, Navbar, Breadcrumbs, Footer, ProductCard, Pic, Stars, Redirect, RequireAuth, RequireAdmin, ConfirmButton
   ├─ utils/image.js, utils/format.js   # photo shrinking, dates and the low-stock limit
   └─ pages/
      ├─ Home, About, Contact, ProductList, Cart, Checkout, Login, NotFound, RouteError
      ├─ product/         # ProductLayout, ProductOverview, ReviewsLayout, ReviewList, WriteReview
      ├─ profile/         # ProfileLayout, ProfileOverview, ProfileOrders, ProfileSettings
      └─ admin/           # AdminLayout, Dashboard, AdminProducts, ProductForm, AdminOrders, AdminUsers, AdminReviews, AdminMessages
```

Data (products, cart, login, accounts, orders, reviews, messages) is saved in the browser with localStorage. The login is a demo
with a password per customer (hashed in the browser, which is only a demo). A real store needs a backend and database.


## AI feature: Help me choose (`/assistant`)

Shoppers describe what they need and an AI model suggests matching products from the live catalog.

- Page: `src/pages/Assistant.jsx` (link "Help me choose" in the navbar)
- Server function: `netlify/functions/recommend.mjs`, served at `/api/recommend`. It calls the Lovable AI Gateway (`openai/gpt-6-astra`) so the key never reaches the browser.
- Setup: add the environment variable `LOVABLE_API_KEY` in Netlify (Site settings > Environment variables).
- Run locally with the function: `npx netlify dev` (plain `npm run dev` shows the page, but suggestions need the function).


## Connect Shopwise to XAMPP MySQL

The project now includes a PHP/MySQLi API in `backend/api.php` and database setup in `database/shopwise_ai.sql`. Read `backend/README.md` for the setup steps. Start Apache and MySQL in XAMPP, import the SQL file in phpMyAdmin, copy `backend` into `C:\xampp\htdocs\shopwise\backend`, then run `npm install` and `npm run dev` from this project folder. The frontend API URL is configured in `src/utils/api.js`.

Products are loaded from MySQL when the API is available; account sign-up/login, contact messages, and checkout orders also use the PHP API. If Apache is unavailable, the app can still fall back to its browser demo data. Some admin tools and reviews still use the original browser storage and are not yet fully synchronized with MySQL.
