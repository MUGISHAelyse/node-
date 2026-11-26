// password.js: turns a password into a scrambled "hash" so the password itself is never saved.
// This is only a demo: everything is stored in the browser, so it is NOT real security.
// A real shop hashes passwords on a server with a slow algorithm such as bcrypt or argon2.

const toHex = bytes => Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('')

// A random piece of text mixed into the password so two people with the same password get different hashes.
export const newSalt = () => toHex(crypto.getRandomValues(new Uint8Array(8)))

// SHA-256 of salt + password, as text. The browser only offers this on secure pages (https or localhost).
export async function hashPassword(password, salt) {
  const data = new TextEncoder().encode(salt + ':' + password)
  return toHex(new Uint8Array(await crypto.subtle.digest('SHA-256', data)))
}
