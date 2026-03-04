export const parseApiDateTime = (value) => {
  if (!value) return null
  if (value instanceof Date) return value

  const str = String(value)
  const hasTimezone = /([zZ]|[+-]\d{2}:?\d{2})$/.test(str)
  const normalized = hasTimezone ? str : `${str}Z`

  const parsed = new Date(normalized)
  if (Number.isNaN(parsed.getTime())) {
    return new Date(str)
  }
  return parsed
}

export const formatDateHungarian = (date) => {
  if (!date) return ''
  const d = parseApiDateTime(date)
  if (!d) return ''

  const days = ['vasárnap', 'hétfő', 'kedd', 'szerda', 'csütörtök', 'péntek', 'szombat']
  const months = ['jan', 'feb', 'már', 'ápr', 'máj', 'jún', 'júl', 'aug', 'szep', 'okt', 'nov', 'dec']

  const dayName = days[d.getDay()]
  const day = d.getDate()
  const month = months[d.getMonth()]
  const year = d.getFullYear()
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')

  return `${dayName}, ${year}. ${month} ${day}. ${hours}:${minutes}`
}
