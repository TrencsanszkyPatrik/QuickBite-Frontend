import axios from 'axios'
import { clearAuth, getAuthToken } from './storage'

export const API_BASE = 'http://localhost:5158/api'

export const GEOAPIFY_API_KEY = '27e1a15b9929418dbca154ae5fe8af4a'

export const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' }
})


axios.defaults.baseURL = API_BASE
axios.defaults.headers.common['Content-Type'] = 'application/json'

// A response interceptor kezeli a 401-es hibát (munkamenet lejárta) azzal, hogy törli az autentikációs adatokat
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