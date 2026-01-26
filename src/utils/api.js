export const API_BASE = 'https://localhost:7236/api'

export const GEOAPIFY_API_KEY = '27e1a15b9929418dbca154ae5fe8af4a'

export function getAuthHeaders() {
  const token = localStorage.getItem('quickbite_token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  }
}
