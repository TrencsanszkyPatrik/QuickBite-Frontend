import { AsYouType, parsePhoneNumberFromString, validatePhoneNumberLength } from 'libphonenumber-js'

const FALLBACK_PHONE_CODE_OPTIONS = [
  { value: '+36', label: 'HU +36', countryCodes: ['HU'], defaultCountry: 'HU' }
]

const DEFAULT_PHONE_CODE = FALLBACK_PHONE_CODE_OPTIONS[0].value
const CARD_NAME_LETTERS_REGEX = /^[a-zA-Z\s'-]+$/

export { FALLBACK_PHONE_CODE_OPTIONS, DEFAULT_PHONE_CODE, CARD_NAME_LETTERS_REGEX }

export const getPhoneConfig = (phoneCodeOptions, phoneLengthBoundsCacheRef, countryCode) => {
  const selectedOption =
    phoneCodeOptions.find((option) => option.value === countryCode) ||
    phoneCodeOptions[0] ||
    FALLBACK_PHONE_CODE_OPTIONS[0]

  const defaultCountry = selectedOption.defaultCountry || selectedOption.countryCodes?.[0]

  if (selectedOption.value === '+36') {
    return {
      ...selectedOption,
      defaultCountry,
      localMinLength: 9,
      localMaxLength: 9
    }
  }

  if (defaultCountry) {
    if (!phoneLengthBoundsCacheRef.current[defaultCountry]) {
      let minLength = 6
      let maxLength = 12

      for (let len = 1; len <= 15; len += 1) {
        const sample = '9'.repeat(len)
        const lengthCheck = validatePhoneNumberLength(sample, defaultCountry)

        if (lengthCheck !== 'TOO_SHORT' && minLength === 6) {
          minLength = len
        }

        if (lengthCheck === 'TOO_LONG') {
          maxLength = len - 1
          break
        }

        if (len === 15) {
          maxLength = len
        }
      }

      if (maxLength < minLength) {
        maxLength = minLength
      }

      phoneLengthBoundsCacheRef.current[defaultCountry] = { minLength, maxLength }
    }

    const bounds = phoneLengthBoundsCacheRef.current[defaultCountry]
    return {
      ...selectedOption,
      defaultCountry,
      localMinLength: bounds.minLength,
      localMaxLength: bounds.maxLength
    }
  }

  const dialCodeDigitsLength = selectedOption.value.replace(/\D/g, '').length
  const localMaxLength = Math.max(6, 15 - dialCodeDigitsLength)

  return {
    ...selectedOption,
    defaultCountry,
    localMinLength: 6,
    localMaxLength
  }
}

export const findCountryCodeFromDigits = (phoneCodeOptions, digits) => {
  const sortedByLength = [...phoneCodeOptions]
    .map((option) => option.value.replace('+', ''))
    .sort((a, b) => b.length - a.length)

  for (const code of sortedByLength) {
    if (digits.startsWith(code)) {
      return `+${code}`
    }
  }

  return null
}

export const parsePhoneValue = (phoneCodeOptions, value, fallbackCountryCode = DEFAULT_PHONE_CODE, allowCountryCodeDetection = false) => {
  const raw = typeof value === 'string' ? value.trim() : ''
  let countryCode = fallbackCountryCode
  let digits = raw.replace(/\D/g, '')

  if (allowCountryCodeDetection) {
    const plusMatch = raw.match(/^\s*(\+\d{1,3})/)
    if (plusMatch && phoneCodeOptions.some((option) => option.value === plusMatch[1])) {
      countryCode = plusMatch[1]
      const countryDigits = countryCode.replace('+', '')
      if (digits.startsWith(countryDigits)) {
        digits = digits.slice(countryDigits.length)
      }
    } else if (digits.startsWith('00')) {
      const withoutPrefix = digits.slice(2)
      const detectedCode = findCountryCodeFromDigits(phoneCodeOptions, withoutPrefix)
      if (detectedCode) {
        countryCode = detectedCode
        digits = withoutPrefix.slice(detectedCode.replace('+', '').length)
      }
    }
  }

  const selectedCountryDigits = countryCode.replace('+', '')
  if (raw.startsWith(countryCode) && digits.startsWith(selectedCountryDigits)) {
    digits = digits.slice(selectedCountryDigits.length)
  } else if (raw.startsWith(`00${selectedCountryDigits}`) && digits.startsWith(`00${selectedCountryDigits}`)) {
    digits = digits.slice(2 + selectedCountryDigits.length)
  }

  if (countryCode === '+36' && digits.startsWith('06')) {
    digits = digits.slice(2)
  } else if (countryCode === '+36' && digits.startsWith('0')) {
    digits = digits.slice(1)
  }

  const config = getPhoneConfig(phoneCodeOptions, { current: {} }, countryCode)
  const localDigits = digits.slice(0, config.localMaxLength)

  return { countryCode, localDigits }
}

export const formatPhoneLocal = (localDigits, countryCode, phoneCodeOptions = []) => {
  if (!localDigits) return ''

  if (countryCode === '+36') {
    const part1 = localDigits.slice(0, 2)
    const part2 = localDigits.slice(2, 5)
    const part3 = localDigits.slice(5, 9)
    return [part1, part2, part3].filter(Boolean).join(' ')
  }

  const phoneConfig = getPhoneConfig(phoneCodeOptions, { current: {} }, countryCode)
  if (phoneConfig.defaultCountry) {
    const nationalFormatter = new AsYouType(phoneConfig.defaultCountry)
    return nationalFormatter.input(localDigits)
  }

  const formatter = new AsYouType()
  const formatted = formatter.input(`${countryCode}${localDigits}`)
  const escapedCountryCode = countryCode.replace('+', '\\+')
  return formatted.replace(new RegExp(`^${escapedCountryCode}\\s*`), '').trim()
}

export const buildPhoneValue = (countryCode, localDigits, phoneCodeOptions = []) => {
  const formattedLocal = formatPhoneLocal(localDigits, countryCode, phoneCodeOptions)
  return formattedLocal ? `${countryCode} ${formattedLocal}` : ''
}

export const isValidPhoneNumber = (phoneCodeOptions, selectedPhoneCountryCode, phoneLengthBoundsCacheRef, value) => {
  if (!value) return false
  if (selectedPhoneCountryCode === '+36') {
    const normalized = value.replace(/^\+36\s*/, '').trim()
    return /^\d{2}\s\d{3}\s\d{4}$/.test(normalized)
  }

  const { localDigits } = parsePhoneValue(phoneCodeOptions, value, selectedPhoneCountryCode)
  if (!localDigits) return false

  const phoneConfig = getPhoneConfig(phoneCodeOptions, phoneLengthBoundsCacheRef, selectedPhoneCountryCode)
  if (phoneConfig.defaultCountry) {
    if (validatePhoneNumberLength(localDigits, phoneConfig.defaultCountry)) {
      return false
    }

    const nationalPhoneNumber = parsePhoneNumberFromString(localDigits, phoneConfig.defaultCountry)
    return Boolean(
      nationalPhoneNumber?.isValid() &&
      `+${nationalPhoneNumber.countryCallingCode}` === selectedPhoneCountryCode
    )
  }

  const phoneNumber = parsePhoneNumberFromString(`${selectedPhoneCountryCode}${localDigits}`)
  return Boolean(phoneNumber?.isValid())
}

export const handlePhoneCodeTypeAhead = (phoneCodeOptions, phoneCodeTypeBufferRef, phoneCodeTypeTimeoutRef, phoneCodeOptionRefs, currentBuffer, character, matchedOptionCallback) => {
  const normalized = character.toLowerCase()
  const nextBuffer = `${currentBuffer}${normalized}`

  phoneCodeTypeBufferRef.current = nextBuffer
  if (phoneCodeTypeTimeoutRef.current) {
    clearTimeout(phoneCodeTypeTimeoutRef.current)
  }
  phoneCodeTypeTimeoutRef.current = setTimeout(() => {
    phoneCodeTypeBufferRef.current = ''
    phoneCodeTypeTimeoutRef.current = null
  }, 700)

  const matchedOption = phoneCodeOptions.find((option) => {
    const label = option.label.toLowerCase()
    const dial = option.value.toLowerCase()
    return label.startsWith(nextBuffer) || dial.startsWith(nextBuffer)
  })

  if (!matchedOption) return

  if (matchedOptionCallback) {
    matchedOptionCallback(matchedOption)
  }

  requestAnimationFrame(() => {
    const el = phoneCodeOptionRefs.current[matchedOption.value]
    if (el) {
      el.scrollIntoView({ block: 'nearest' })
    }
  })
}

export const resetPhoneCodeTypeAhead = (phoneCodeTypeBufferRef, phoneCodeTypeTimeoutRef) => {
  phoneCodeTypeBufferRef.current = ''
  if (phoneCodeTypeTimeoutRef.current) {
    clearTimeout(phoneCodeTypeTimeoutRef.current)
    phoneCodeTypeTimeoutRef.current = null
  }
}
