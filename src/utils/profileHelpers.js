export function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' })
}

export function getInitials(name) {
  if (!name || typeof name !== 'string') return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

export function getFavoritesCount() {
  try {
    const stored = localStorage.getItem('quickbite_favorites')
    const arr = stored ? JSON.parse(stored) : []
    return Array.isArray(arr) ? arr.length : 0
  } catch {
    return 0
  }
}
