const TOKEN_KEY = 'quickbite_token'
const USER_KEY = 'quickbite_user'
const CART_KEY = 'quickbite_cart'

export const getAuthToken = () => localStorage.getItem(TOKEN_KEY)

export const getAuthUser = () => {
  try {
    const userJSON = localStorage.getItem(USER_KEY)
    return userJSON ? JSON.parse(userJSON) : null
  } catch {
    return null
  }
}

export const getAuth = () => ({
  token: getAuthToken(),
  user: getAuthUser()
})

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
  } else {
    localStorage.removeItem(TOKEN_KEY)
  }
}

export const setAuthUser = (user) => {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  } else {
    localStorage.removeItem(USER_KEY)
  }
}

export const setAuth = (token, user) => {
  setAuthToken(token)
  setAuthUser(user)
}

export const clearAuth = () => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export const getCart = () => {
  try {
    const cartJSON = localStorage.getItem(CART_KEY)
    return cartJSON ? JSON.parse(cartJSON) : []
  } catch {
    return []
  }
}

export const setCart = (items) => {
  localStorage.setItem(CART_KEY, JSON.stringify(items))
}

export const clearCart = () => {
  localStorage.removeItem(CART_KEY)
}
