import { CARD_NAME_LETTERS_REGEX } from './phoneValidation'

export const formatCardNumber = (value) => {
  const digits = value.replace(/\D/g, '').slice(0, 16)
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim()
}

export const isValidCardNumber = (value) => {
  if (!value) return false
  const cleaned = value.replace(/\D/g, '')
  return /^\d{16}$/.test(cleaned)
}

export const isValidExpiry = (value) => {
  if (!value) return false
  const trimmed = value.trim()
  const match = trimmed.match(/^(\d{2})\/(\d{2})$/)
  if (!match) return false

  const month = Number(match[1])
  let year = Number(match[2])
  if (Number.isNaN(month) || Number.isNaN(year) || month < 1 || month > 12) return false

  const now = new Date()
  const currentYear = now.getFullYear() % 100
  const currentMonth = now.getMonth() + 1

  if (year < currentYear) return false
  if (year === currentYear && month < currentMonth) return false
  return true
}

export const isValidCvv = (value) => {
  if (!value) return false
  return /^\d{3}$/.test(value.trim())
}

export const isValidCardName = (value) => {
  if (!value) return false
  const trimmed = value.trim()
  return trimmed.length >= 5 && CARD_NAME_LETTERS_REGEX.test(trimmed)
}
