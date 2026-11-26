import { Link, isRouteErrorResponse, useRouteError } from 'react-router-dom'
import NotFound from './NotFound'

// Shown by `errorElement` in router.jsx when something goes wrong while a page
// is loading or drawing (a crash, or a 404 response thrown by a loader).
// Without it, visitors would see the router's plain default error screen.
export default function RouteError() {
  const error = useRouteError()

  if (isRouteErrorResponse(error) && error.status === 404) return <NotFound />

  const detail = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : 'Unknown error'

  return (
    <section className="nf container" role="alert">
      <div className="nf-code" aria-hidden="true">:(</div>
      <h1>Something went wrong</h1>
      <p className="muted">An unexpected error stopped this page from loading. Your cart and account are safe.</p>
      <div className="acts">
        <button className="btn" onClick={() => window.location.reload()}>Try again</button>
        <Link to="/" className="btn sec">Go to home</Link>
      </div>
      <details className="nf-details">
        <summary>Technical details</summary>
        <pre>{detail}</pre>
      </details>
    </section>
  )
}
