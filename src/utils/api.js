export const API_BASE = 'https://localhost:7236/api'

export function getAuthHeaders() {
  const token = localStorage.getItem('quickbite_token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  }
}
