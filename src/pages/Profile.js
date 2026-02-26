import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ProfileHeader from '../components/ProfileHeader'
import SpinnerOverlay from '../components/SpinnerOverlay'
import AddressSection from '../components/AddressSection'
import PaymentMethodSection from '../components/PaymentMethodSection'
import PasswordChangeSection from '../components/PasswordChangeSection'
import DeleteAccountSection from '../components/DeleteAccountSection'
import { usePageTitle } from '../utils/usePageTitle'
import { showToast } from '../utils/toast'
import { API_BASE, getAuthHeaders } from '../utils/api'
import '../styles/profile.css'
import '../styles/modal.css'
import { AsYouType, parsePhoneNumberFromString, validatePhoneNumberLength } from 'libphonenumber-js'

const FALLBACK_PHONE_CODE_OPTIONS = [
  { value: '+36', label: 'HU +36', countryCodes: ['HU'], defaultCountry: 'HU' }
]

const DEFAULT_PHONE_CODE = FALLBACK_PHONE_CODE_OPTIONS[0].value

export default function Profile({ favorites = [] }) {
  usePageTitle('QuickBite - Profilom')
  const navigate = useNavigate()
  const phoneCodeDropdownRef = useRef(null)
  const [phoneCodeOptions, setPhoneCodeOptions] = useState(FALLBACK_PHONE_CODE_OPTIONS)
  const [profile, setProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [selectedPhoneCountryCode, setSelectedPhoneCountryCode] = useState(DEFAULT_PHONE_CODE)
  const [isPhoneCodeListOpen, setIsPhoneCodeListOpen] = useState(false)
  const phoneCodeOptionRefs = useRef({})
  const phoneCodeTypeBufferRef = useRef('')
  const phoneCodeTypeTimeoutRef = useRef(null)
  const phoneLengthBoundsCacheRef = useRef({})
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    avatarUrl: ''
  })

  const getPhoneConfig = (countryCode) => {
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

  const resetPhoneCodeTypeAhead = () => {
    phoneCodeTypeBufferRef.current = ''
    if (phoneCodeTypeTimeoutRef.current) {
      clearTimeout(phoneCodeTypeTimeoutRef.current)
      phoneCodeTypeTimeoutRef.current = null
    }
  }

  const closePhoneCodeList = () => {
    setIsPhoneCodeListOpen(false)
    resetPhoneCodeTypeAhead()
  }

  const applyPhoneCountryCode = (countryCode) => {
    const parsedPhone = parsePhoneValue(editForm.phone, selectedPhoneCountryCode)
    const nextValue = buildPhoneValue(countryCode, parsedPhone.localDigits)
    setSelectedPhoneCountryCode(countryCode)
    setEditForm((f) => ({ ...f, phone: nextValue }))
  }

  const handlePhoneCodeTypeAhead = (character) => {
    const normalized = character.toLowerCase()
    const nextBuffer = `${phoneCodeTypeBufferRef.current}${normalized}`

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

    applyPhoneCountryCode(matchedOption.value)

    requestAnimationFrame(() => {
      const el = phoneCodeOptionRefs.current[matchedOption.value]
      if (el) {
        el.scrollIntoView({ block: 'nearest' })
      }
    })
  }

  const handlePhoneCodeTriggerKeyDown = (e) => {
    if (e.key === 'Escape') {
      closePhoneCodeList()
      return
    }

    if (e.key.length === 1 && /[a-zA-Z0-9+]/.test(e.key)) {
      e.preventDefault()
      if (!isPhoneCodeListOpen) {
        setIsPhoneCodeListOpen(true)
      }
      handlePhoneCodeTypeAhead(e.key)
    }
  }

  const findCountryCodeFromDigits = (digits) => {
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

  const parsePhoneValue = (value, fallbackCountryCode = DEFAULT_PHONE_CODE, allowCountryCodeDetection = false) => {
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
        const detectedCode = findCountryCodeFromDigits(withoutPrefix)
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

    const config = getPhoneConfig(countryCode)
    const localDigits = digits.slice(0, config.localMaxLength)

    return { countryCode, localDigits }
  }

  const formatPhoneLocal = (localDigits, countryCode) => {
    if (!localDigits) return ''

    if (countryCode === '+36') {
      const part1 = localDigits.slice(0, 2)
      const part2 = localDigits.slice(2, 5)
      const part3 = localDigits.slice(5, 9)
      return [part1, part2, part3].filter(Boolean).join(' ')
    }

    const phoneConfig = getPhoneConfig(countryCode)
    if (phoneConfig.defaultCountry) {
      const nationalFormatter = new AsYouType(phoneConfig.defaultCountry)
      return nationalFormatter.input(localDigits)
    }

    const formatter = new AsYouType()
    const formatted = formatter.input(`${countryCode}${localDigits}`)
    const escapedCountryCode = countryCode.replace('+', '\\+')
    return formatted.replace(new RegExp(`^${escapedCountryCode}\\s*`), '').trim()
  }

  const buildPhoneValue = (countryCode, localDigits) => {
    const formattedLocal = formatPhoneLocal(localDigits, countryCode)
    return formattedLocal ? `${countryCode} ${formattedLocal}` : ''
  }

  const isValidPhoneNumber = (value) => {
    if (!value) return false
    if (selectedPhoneCountryCode === '+36') {
      const normalized = value.replace(/^\+36\s*/, '').trim()
      return /^\d{2}\s\d{3}\s\d{4}$/.test(normalized)
    }

    const { localDigits } = parsePhoneValue(value, selectedPhoneCountryCode)
    if (!localDigits) return false

    const phoneConfig = getPhoneConfig(selectedPhoneCountryCode)
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

  const loadProfile = async () => {
    try {
      const res = await axios.get(`${API_BASE}/Profile/me`, { headers: getAuthHeaders() })
      return res.data
    } catch (err) {
      if (err?.response?.status === 401) {
        showToast.error('Munkamenet lejárt. Jelentkezz be újra!')
        navigate('/bejelentkezes')
        return null
      }
      throw new Error('Profil betöltése sikertelen')
    }
  }

  useEffect(() => {
    const loadPhoneCodeOptions = async () => {
      try {
        const response = await axios.get('https://restcountries.com/v3.1/all?fields=cca2,idd')
        const countries = Array.isArray(response.data) ? response.data : []
        const groupedByDialCode = new Map()

        countries.forEach((country) => {
          const root = country?.idd?.root
          const suffixes = Array.isArray(country?.idd?.suffixes) ? country.idd.suffixes : []
          const cca2 = typeof country?.cca2 === 'string' ? country.cca2.toUpperCase() : null
          if (!root || !suffixes.length || !cca2) return

          suffixes.forEach((suffix) => {
            const dialCode = `${root}${suffix}`
            if (!/^\+\d{1,4}$/.test(dialCode)) return

            const existing = groupedByDialCode.get(dialCode)
            if (existing) {
              existing.countryCodes.add(cca2)
              return
            }

            groupedByDialCode.set(dialCode, {
              value: dialCode,
              countryCodes: new Set([cca2])
            })
          })
        })

        const fetchedOptions = [...groupedByDialCode.values()]
          .map((item) => ({
            value: item.value,
            label: `${[...item.countryCodes].sort().join('/')} ${item.value}`,
            countryCodes: [...item.countryCodes].sort(),
            defaultCountry: [...item.countryCodes].sort()[0]
          }))
          .sort((a, b) => a.label.localeCompare(b.label))

        if (fetchedOptions.length > 0) {
          setPhoneCodeOptions(fetchedOptions)
          return
        }
      } catch (error) {
        console.error('Országkódok API betöltése sikertelen, fallback lista marad:', error)
      }

      setPhoneCodeOptions(FALLBACK_PHONE_CODE_OPTIONS)
    }

    loadPhoneCodeOptions()
  }, [])

  useEffect(() => {
    if (!phoneCodeOptions.some((option) => option.value === selectedPhoneCountryCode)) {
      setSelectedPhoneCountryCode(phoneCodeOptions[0]?.value || DEFAULT_PHONE_CODE)
    }
  }, [phoneCodeOptions, selectedPhoneCountryCode])

  useEffect(() => {
    const token = localStorage.getItem('quickbite_token')
    const userData = localStorage.getItem('quickbite_user')
    if (!token || !userData) {
      showToast.error('Kérjük, jelentkezz be!')
      navigate('/bejelentkezes')
      return
    }

    const load = async () => {
      try {
        const data = await loadProfile()
        if (!data) return
        setProfile(data)

        let normalizedPhone = data.phone || ''
        if (data.phone) {
          const parsedPhone = parsePhoneValue(data.phone, selectedPhoneCountryCode, true)
          setSelectedPhoneCountryCode(parsedPhone.countryCode)
          normalizedPhone = buildPhoneValue(parsedPhone.countryCode, parsedPhone.localDigits)
        }

        setEditForm({
          name: data.name || '',
          phone: normalizedPhone,
          avatarUrl: data.avatarUrl || ''
        })
      } catch (err) {
        console.error(err)
        showToast.error('Profil betöltése sikertelen. Próbáld újra!')
        navigate('/bejelentkezes')
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [navigate])

  useEffect(() => {
    if (!isPhoneCodeListOpen) return

    const handleOutsideClick = (event) => {
      if (!phoneCodeDropdownRef.current?.contains(event.target)) {
        closePhoneCodeList()
      }
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        closePhoneCodeList()
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isPhoneCodeListOpen])

  useEffect(() => {
    return () => {
      resetPhoneCodeTypeAhead()
    }
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    if (editForm.phone && !isValidPhoneNumber(editForm.phone)) {
      showToast.error('Kérjük, érvényes telefonszámot adj meg a kiválasztott országkódhoz!')
      return
    }
    setIsSaving(true)
    try {
      const res = await axios.patch(
        `${API_BASE}/Profile/me`,
        {
          name: editForm.name || undefined,
          phone: editForm.phone || undefined,
          avatarUrl: editForm.avatarUrl || undefined
        },
        { headers: getAuthHeaders() }
      )
      const data = res.data
      setProfile(data)
      const stored = localStorage.getItem('quickbite_user')
      if (stored) {
        try {
          const user = JSON.parse(stored)
          user.name = data.name
          localStorage.setItem('quickbite_user', JSON.stringify(user))
          window.dispatchEvent(new Event('userLoggedIn'))
        } catch (_) {}
      }
      showToast.success('Profil mentve!')
    } catch (err) {
      console.error(err)
      showToast.error('Mentés sikertelen. Próbáld újra!')
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('quickbite_token')
    localStorage.removeItem('quickbite_user')
    window.dispatchEvent(new Event('userLoggedOut'))
    showToast.success('Sikeres kijelentkezés!')
    setTimeout(() => navigate('/'), 1000)
  }

  if (isLoading) {
    return (
      <>
        <Navbar />
        <SpinnerOverlay label="Profil betöltése..." />
        <Footer />
      </>
    )
  }

  if (!profile) return null

  return (
    <div className="profile-page">
      <Navbar />
      <div className="profile-container">
        <ProfileHeader profile={profile} />

        <div className="profile-stats">
          <Link to="/kedvencek" className="profile-stat-card">
            <span className="stat-value">{favorites.length}</span>
            <span className="stat-label">Kedvenc étterem</span>
          </Link>
          <Link to="/rendelesek" className="profile-stat-card">
            <span className="stat-value">{profile.ordersCount ?? 0}</span>
            <span className="stat-label">Leadott rendelés</span>
          </Link>
          <div className="profile-stat-card">
            <span className="stat-value">{profile.reviewsCount ?? 0}</span>
            <span className="stat-label">Értékelésem</span>
          </div>
        </div>

        <div className="profile-section-card">
          <h2>
            <i className="bi bi-pencil-square" aria-hidden="true" />
            Személyes adatok
          </h2>
          <form onSubmit={handleSave}>
            <div className="profile-form-grid">
              <div className="profile-form-group full-width">
                <label htmlFor="profile-name">Teljes név</label>
                <input
                  id="profile-name"
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Nagy Zoltán"
                />
              </div>
              <div className="profile-form-group full-width">
                <label htmlFor="profile-phone">Telefonszám</label>
                {(() => {
                  const parsedPhone = parsePhoneValue(editForm.phone, selectedPhoneCountryCode)
                  const phoneConfig = getPhoneConfig(parsedPhone.countryCode)
                  const phonePlaceholder =
                    parsedPhone.countryCode === '+36'
                      ? '30 123 4567'
                      : formatPhoneLocal('9'.repeat(phoneConfig.localMaxLength), parsedPhone.countryCode)
                  const phoneInputMaxLength = phonePlaceholder.length

                  return (
                    <div className="profile-phone-input-row">
                      <div className="profile-phone-code-dropdown" ref={phoneCodeDropdownRef}>
                        <button
                          type="button"
                          id="profile-phone-country"
                          className="profile-phone-code-select"
                          aria-haspopup="listbox"
                          aria-expanded={isPhoneCodeListOpen}
                          onClick={() => setIsPhoneCodeListOpen((prev) => !prev)}
                          onKeyDown={handlePhoneCodeTriggerKeyDown}
                        >
                          {getPhoneConfig(selectedPhoneCountryCode).label}
                        </button>

                        {isPhoneCodeListOpen && (
                          <div className="profile-phone-code-dropdown-list" role="listbox" aria-label="Országkód lista">
                            {phoneCodeOptions.map((option) => (
                              <button
                                type="button"
                                key={option.value}
                                ref={(el) => {
                                  phoneCodeOptionRefs.current[option.value] = el
                                }}
                                className={`profile-phone-code-option ${selectedPhoneCountryCode === option.value ? 'active' : ''}`}
                                onClick={() => {
                                  applyPhoneCountryCode(option.value)
                                  closePhoneCodeList()
                                }}
                                onKeyDown={handlePhoneCodeTriggerKeyDown}
                                role="option"
                                aria-selected={selectedPhoneCountryCode === option.value}
                              >
                                {option.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <input
                        id="profile-phone"
                        type="tel"
                        inputMode="numeric"
                        value={formatPhoneLocal(parsedPhone.localDigits, parsedPhone.countryCode)}
                        maxLength={phoneInputMaxLength}
                        onChange={(e) => {
                          const numericOnly = e.target.value.replace(/\D/g, '')
                          const maxLength = phoneConfig.localMaxLength
                          const localDigits = numericOnly.slice(0, maxLength)
                          const nextValue = buildPhoneValue(parsedPhone.countryCode, localDigits)
                          setEditForm((f) => ({ ...f, phone: nextValue }))
                        }}
                        placeholder={phonePlaceholder}
                      />
                    </div>
                  )
                })()}
              </div>
              <div className="profile-form-group full-width">
                <label htmlFor="profile-avatar">Profilkép URL (opcionális)</label>
                <input
                  id="profile-avatar"
                  type="url"
                  value={editForm.avatarUrl}
                  onChange={(e) => setEditForm((f) => ({ ...f, avatarUrl: e.target.value }))}
                  placeholder="https://..."
                />
              </div>
            </div>
            <div className="profile-actions">
              <button type="submit" className="profile-btn profile-btn-primary" disabled={isSaving}>
                <i className="bi bi-check-lg" aria-hidden="true" />
                {isSaving ? 'Mentés...' : 'Mentem'}
              </button>
              <Link to="/kedvencek" className="profile-btn profile-btn-outline link-style">
                <i className="bi bi-heart" aria-hidden="true" />
                Kedvencek
              </Link>
              <Link to="/velemenyek" className="profile-btn profile-btn-outline link-style">
                <i className="bi bi-chat-quote" aria-hidden="true" />
                Véleményeim
              </Link>
              <button type="button" onClick={handleLogout} className="profile-btn profile-btn-danger">
                <i className="bi bi-box-arrow-right" aria-hidden="true" />
                Kijelentkezés
              </button>
            </div>
          </form>
        </div>

        <PasswordChangeSection />

        <AddressSection addresses={profile.addresses || []} onUpdate={setProfile} />

        <PaymentMethodSection paymentMethods={profile.paymentMethods || []} onUpdate={setProfile} />

        <DeleteAccountSection />
      </div>
      <Footer />
    </div>
  )
}
