import axios from 'axios'
import { clearAuth, getAuthToken } from './storage'

export const API_BASE = 'https://quickbite-backend-production-6372.up.railway.app/api'

export const GEOAPIFY_API_KEY = '27e1a15b9929418dbca154ae5fe8af4a'

// create a shared axios instance so we can configure interceptors globally
// shared axios instance (optional – some files still use axios directly)
export const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' }
})

// Make sure the global axios default also points at the API base;
// this lets existing `axios.get/post` calls still use our interceptor.
axios.defaults.baseURL = API_BASE
axios.defaults.headers.common['Content-Type'] = 'application/json'

// response interceptor handles 401 (session expiration) by clearing auth data
const handleUnauthorized = (error) => {
  if (error.response && error.response.status === 401) {
    clearAuth()
    window.dispatchEvent(new Event('userLoggedOut'))
  }
  return Promise.reject(error)
}

api.interceptors.response.use(response => response, handleUnauthorized)
axios.interceptors.response.use(response => response, handleUnauthorized)

export function getAuthHeaders() {
  const token = getAuthToken()
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  }
}