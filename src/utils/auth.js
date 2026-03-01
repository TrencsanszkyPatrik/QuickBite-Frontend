// helper functions related to authentication tokens
// this module is intentionally small and dependencies-free so
// it can be used from components and from api interceptors.

export function logout() {
  localStorage.removeItem('quickbite_token')
  localStorage.removeItem('quickbite_user')
  window.dispatchEvent(new Event('userLoggedOut'))
}

export function isTokenExpired(token) {
  if (!token) return true
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return true
    const payload = JSON.parse(atob(parts[1]))
    if (!payload.exp) return true
    // exp is in seconds
    return Date.now() / 1000 >= payload.exp
  } catch {
    return true
  }
}

// schedule a one‑time check that will automatically log the user out
// when the JWT `exp` time passes.  If the token is already expired the
// logout is triggered immediately.  Returns a function that can be used
// to cancel the timeout.
export function scheduleTokenExpiryCheck() {
  const token = localStorage.getItem('quickbite_token')
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
          }, msRemaining + 500) // add small buffer
        }
      }
    }
  } catch (e) {
    // if parsing fails just log out to be safe
    logout()
  }

  return () => {
    if (timeoutId) clearTimeout(timeoutId)
  }
}
