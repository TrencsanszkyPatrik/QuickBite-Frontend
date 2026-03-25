import { clearAuth, getAuthToken } from './storage'

export function logout() {
  clearAuth()
  window.dispatchEvent(new Event('userLoggedOut'))
}

export function isTokenExpired(token) {
  if (!token) return true
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return true
    const payload = JSON.parse(atob(parts[1]))
    if (!payload.exp) return true
    // Az exp másodpercben van megadva
    return Date.now() / 1000 >= payload.exp
  } catch {
    return true
  }
}

// Egy egyszeri ellenőrzés, amely automatikusan kijelentkezteti a felhasználót,
// amikor a JWT `exp` ideje lejár. Ha a token már lejárt, a kijelentkeztetés azonnal megtörténik.
// Visszaad egy függvényt, amellyel a timeout törölhető.
export function scheduleTokenExpiryCheck() {
  const token = getAuthToken()
  if (!token) return () => {}

  let timeoutId = null

  try {
    const parts = token.split('.')
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1]))
      if (payload.exp) {
        const msRemaining = payload.exp * 1000 - Date.now()
        if (msRemaining <= 0) {
          logout()
        } else {
          timeoutId = setTimeout(() => {
            logout()
          }, msRemaining + 500) 
        }
      }
    }
  } catch (e) {
    logout()
  }

  return () => {
    if (timeoutId) clearTimeout(timeoutId)
  }
}