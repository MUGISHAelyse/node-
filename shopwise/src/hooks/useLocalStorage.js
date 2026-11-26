import { useState, useEffect } from 'react'

// Like useState, but the value is also saved in the browser (localStorage)
export default function useLocalStorage(key, initial) {
  // Start with the saved value if there is one, otherwise with `initial`.
  const [value, setValue] = useState(() => {
    try {
      // The browser only stores text, so values are converted with JSON.parse and JSON.stringify.
      const saved = localStorage.getItem(key)
      return saved ? JSON.parse(saved) : initial
    } catch {
      return initial
    }
  })

  // Save the value in the browser every time it changes.
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      /* storage can be blocked, the app still works without it */
    }
  }, [key, value])

  return [value, setValue]
}
