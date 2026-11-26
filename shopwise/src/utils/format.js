// format.js: small helpers shared by the admin pages.

// Products with this many items left (or fewer) count as "low stock".
export const LOW_STOCK = 5

// Turns an ISO date such as "2026-10-05T09:05:00.000Z" or "2026-10-05" into a short readable date.
// Old orders only have a text date, which is shown as it is.
export const shortDate = value => {
  if (!value) return ''
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}
