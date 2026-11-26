// Shows a rating as stars, e.g. 4.3 -> ★★★★☆
export default function Stars({ value }) {
  // Round to the nearest whole star.
  const full = Math.round(value || 0)
  // role="img" and aria-label let screen readers say "4 out of 5 stars" instead of reading the symbols.
  return (
    <span className="stars" role="img" aria-label={value ? `${value} out of 5 stars` : 'No rating yet'}>
      {'★'.repeat(full)}
      <span className="off">{'★'.repeat(5 - full)}</span>
    </span>
  )
}
