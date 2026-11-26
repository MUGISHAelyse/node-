import { Navigate, generatePath, useLocation, useParams } from 'react-router-dom'

// Sends an old URL to its new address, e.g.  /product/3  ->  /products/3
//  - :params are copied over (generatePath fills :productId and so on)
//  - the ?query and #hash are kept, so old bookmarks and search links still work
//  - `replace` swaps the old URL in the history, so the Back button does not
//    bring the visitor back to the old address and loop
//  - `state` tells the Layout to show a "this page has moved" notice
export default function Redirect({ to }) {
  const params = useParams()
  const { pathname, search, hash } = useLocation()

  return (
    <Navigate
      replace
      to={{ pathname: generatePath(to, params), search, hash }}
      state={{ redirectedFrom: pathname + search }}
    />
  )
}
