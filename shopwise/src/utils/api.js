// Local XAMPP API. The browser app talks to PHP; PHP talks to MySQL.
export const API_BASE = 'http://localhost/shopwise/backend/api.php'

export async function apiRequest(route, options = {}) {
  const response = await fetch(`${API_BASE}?route=${encodeURIComponent(route)}${options.query || ''}`, {
    credentials: 'include',
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error || 'The server request failed.')
  return data
}
