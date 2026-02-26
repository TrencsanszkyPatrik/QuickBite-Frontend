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

const PHONE_CODE_OPTIONS = [
  { value: '+36', label: 'HU +36', localMinLength: 9, localMaxLength: 9, groupSizes: [2, 3, 4] },
  { value: '+43', label: 'AT +43', localMinLength: 7, localMaxLength: 12, groupSizes: [3, 3, 3, 3] },
  { value: '+32', label: 'BE +32', localMinLength: 8, localMaxLength: 9, groupSizes: [3, 3, 3] },
  { value: '+359', label: 'BG +359', localMinLength: 8, localMaxLength: 9, groupSizes: [3, 3, 3] },
  { value: '+40', label: 'RO +40', localMinLength: 9, localMaxLength: 9, groupSizes: [3, 3, 3] },
  { value: '+421', label: 'SK +421', localMinLength: 9, localMaxLength: 9, groupSizes: [3, 3, 3] },
  { value: '+385', label: 'HR +385', localMinLength: 8, localMaxLength: 9, groupSizes: [3, 3, 3] },
  { value: '+357', label: 'CY +357', localMinLength: 8, localMaxLength: 8, groupSizes: [4, 4] },
  { value: '+420', label: 'CZ +420', localMinLength: 9, localMaxLength: 9, groupSizes: [3, 3, 3] },
  { value: '+45', label: 'DK +45', localMinLength: 8, localMaxLength: 8, groupSizes: [4, 4] },
  { value: '+372', label: 'EE +372', localMinLength: 7, localMaxLength: 8, groupSizes: [3, 3, 2] },
  { value: '+358', label: 'FI +358', localMinLength: 7, localMaxLength: 12, groupSizes: [3, 3, 3, 3] },
  { value: '+33', label: 'FR +33', localMinLength: 9, localMaxLength: 9, groupSizes: [1, 2, 2, 2, 2] },
  { value: '+49', label: 'DE +49', localMinLength: 7, localMaxLength: 13, groupSizes: [3, 3, 3, 4] },
  { value: '+30', label: 'GR +30', localMinLength: 10, localMaxLength: 10, groupSizes: [3, 3, 4] },
  { value: '+353', label: 'IE +353', localMinLength: 7, localMaxLength: 9, groupSizes: [3, 3, 3] },
  { value: '+39', label: 'IT +39', localMinLength: 8, localMaxLength: 11, groupSizes: [3, 3, 3, 2] },
  { value: '+371', label: 'LV +371', localMinLength: 8, localMaxLength: 8, groupSizes: [4, 4] },
  { value: '+370', label: 'LT +370', localMinLength: 8, localMaxLength: 8, groupSizes: [3, 3, 2] },
  { value: '+352', label: 'LU +352', localMinLength: 6, localMaxLength: 11, groupSizes: [3, 3, 3, 2] },
  { value: '+356', label: 'MT +356', localMinLength: 8, localMaxLength: 8, groupSizes: [4, 4] },
  { value: '+31', label: 'NL +31', localMinLength: 9, localMaxLength: 9, groupSizes: [2, 3, 4] },
  { value: '+47', label: 'NO +47', localMinLength: 8, localMaxLength: 8, groupSizes: [3, 3, 2] },
  { value: '+48', label: 'PL +48', localMinLength: 9, localMaxLength: 9, groupSizes: [3, 3, 3] },
  { value: '+351', label: 'PT +351', localMinLength: 9, localMaxLength: 9, groupSizes: [3, 3, 3] },
  { value: '+386', label: 'SI +386', localMinLength: 8, localMaxLength: 8, groupSizes: [3, 3, 2] },
  { value: '+34', label: 'ES +34', localMinLength: 9, localMaxLength: 9, groupSizes: [3, 3, 3] },
  { value: '+46', label: 'SE +46', localMinLength: 7, localMaxLength: 10, groupSizes: [3, 3, 4] },
  { value: '+41', label: 'CH +41', localMinLength: 9, localMaxLength: 9, groupSizes: [2, 3, 2, 2] },
  { value: '+44', label: 'UK +44', localMinLength: 10, localMaxLength: 10, groupSizes: [4, 3, 3] },
  { value: '+1', label: 'US/CA +1', localMinLength: 10, localMaxLength: 10, groupSizes: [3, 3, 4] },
  { value: '+52', label: 'MX +52', localMinLength: 10, localMaxLength: 10, groupSizes: [3, 3, 4] },
  { value: '+55', label: 'BR +55', localMinLength: 10, localMaxLength: 11, groupSizes: [2, 4, 4, 1] },
  { value: '+54', label: 'AR +54', localMinLength: 10, localMaxLength: 10, groupSizes: [3, 3, 4] },
  { value: '+90', label: 'TR +90', localMinLength: 10, localMaxLength: 10, groupSizes: [3, 3, 4] },
  { value: '+380', label: 'UA +380', localMinLength: 9, localMaxLength: 9, groupSizes: [2, 3, 4] },
  { value: '+7', label: 'KZ/RU +7', localMinLength: 10, localMaxLength: 10, groupSizes: [3, 3, 4] },
  { value: '+81', label: 'JP +81', localMinLength: 9, localMaxLength: 10, groupSizes: [2, 4, 4] },
  { value: '+82', label: 'KR +82', localMinLength: 9, localMaxLength: 10, groupSizes: [2, 4, 4] },
  { value: '+86', label: 'CN +86', localMinLength: 11, localMaxLength: 11, groupSizes: [3, 4, 4] },
  { value: '+91', label: 'IN +91', localMinLength: 10, localMaxLength: 10, groupSizes: [5, 5] },
  { value: '+92', label: 'PK +92', localMinLength: 10, localMaxLength: 10, groupSizes: [3, 3, 4] },
  { value: '+94', label: 'LK +94', localMinLength: 9, localMaxLength: 9, groupSizes: [2, 3, 4] },
  { value: '+971', label: 'AE +971', localMinLength: 8, localMaxLength: 9, groupSizes: [2, 3, 4] },
  { value: '+972', label: 'IL +972', localMinLength: 8, localMaxLength: 9, groupSizes: [2, 3, 4] },
  { value: '+20', label: 'EG +20', localMinLength: 10, localMaxLength: 10, groupSizes: [3, 3, 4] },
  { value: '+27', label: 'ZA +27', localMinLength: 9, localMaxLength: 9, groupSizes: [2, 3, 4] },
  { value: '+61', label: 'AU +61', localMinLength: 9, localMaxLength: 9, groupSizes: [1, 4, 4] },
  { value: '+64', label: 'NZ +64', localMinLength: 8, localMaxLength: 10, groupSizes: [2, 3, 4, 1] }
]

const DEFAULT_PHONE_CODE = PHONE_CODE_OPTIONS[0].value

export default function Profile({ favorites = [] }) {
  usePageTitle('QuickBite - Profilom')
  const navigate = useNavigate()
  const phoneCodeDropdownRef = useRef(null)
  const [profile, setProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [selectedPhoneCountryCode, setSelectedPhoneCountryCode] = useState(DEFAULT_PHONE_CODE)
  const [isPhoneCodeListOpen, setIsPhoneCodeListOpen] = useState(false)
  const phoneCodeOptionRefs = useRef({})
  const phoneCodeTypeBufferRef = useRef('')
  const phoneCodeTypeTimeoutRef = useRef(null)
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    avatarUrl: ''
  })

  const getPhoneConfig = (countryCode) => {
    return PHONE_CODE_OPTIONS.find((option) => option.value === countryCode) || PHONE_CODE_OPTIONS[0]
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

    const matchedOption = PHONE_CODE_OPTIONS.find((option) => {
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
    const sortedByLength = [...PHONE_CODE_OPTIONS]
      .map((option) => option.value.replace('+', ''))
      .sort((a, b) => b.length - a.length)

    for (const code of sortedByLength) {
      if (digits.startsWith(code)) {
        return `+${code}`
      }
    }

    return null
  }

  const parsePhoneValue = (value, fallbackCountryCode = DEFAULT_PHONE_CODE) => {
    const raw = typeof value === 'string' ? value.trim() : ''
    let countryCode = fallbackCountryCode
    let digits = raw.replace(/\D/g, '')

    const plusMatch = raw.match(/^\s*(\+\d{1,3})/)
    if (plusMatch && PHONE_CODE_OPTIONS.some((option) => option.value === plusMatch[1])) {
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
    } else {
      const detectedCode = findCountryCodeFromDigits(digits)
      if (detectedCode) {
        countryCode = detectedCode
        digits = digits.slice(detectedCode.replace('+', '').length)
      }
    }

    if (countryCode === '+36' && digits.startsWith('06')) {
      digits = digits.slice(2)
    } else if (countryCode === '+36' && digits.startsWith('0')) {
      digits = digits.slice(1)
    } else if (countryCode !== '+36' && digits.startsWith('0') && digits.length > 7) {
      digits = digits.slice(1)
    } else if (digits.startsWith('06')) {
      countryCode = '+36'
      digits = digits.slice(2)
    }

    const config = getPhoneConfig(countryCode)
    const localDigits = digits.slice(0, config.localMaxLength)

    return { countryCode, localDigits }
  }

  const formatPhoneLocal = (localDigits, countryCode) => {
    const config = getPhoneConfig(countryCode)
    if (!localDigits) return ''

    const chunks = []
    let index = 0

    for (const groupSize of config.groupSizes) {
      if (index >= localDigits.length) break
      chunks.push(localDigits.slice(index, index + groupSize))
      index += groupSize
    }

    return chunks.join(' ')
  }

  const buildPhoneValue = (countryCode, localDigits) => {
    const formattedLocal = formatPhoneLocal(localDigits, countryCode)
    return formattedLocal ? `${countryCode} ${formattedLocal}` : ''
  }

  const isValidPhoneNumber = (value) => {
    if (!value) return false
    const { countryCode, localDigits } = parsePhoneValue(value, selectedPhoneCountryCode)
    const config = getPhoneConfig(countryCode)
    return localDigits.length >= config.localMinLength && localDigits.length <= config.localMaxLength
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

        if (data.phone) {
          const parsedPhone = parsePhoneValue(data.phone, selectedPhoneCountryCode)
          setSelectedPhoneCountryCode(parsedPhone.countryCode)
        }

        setEditForm({
          name: data.name || '',
          phone: data.phone || '',
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
    if (!editForm.phone?.trim()) return
    const parsed = parsePhoneValue(editForm.phone, selectedPhoneCountryCode)
    if (parsed.countryCode !== selectedPhoneCountryCode) {
      setSelectedPhoneCountryCode(parsed.countryCode)
    }
  }, [editForm.phone, selectedPhoneCountryCode])

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
                            {PHONE_CODE_OPTIONS.map((option) => (
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
                        onChange={(e) => {
                          const numericOnly = e.target.value.replace(/\D/g, '')
                          const maxLength = phoneConfig.localMaxLength
                          const localDigits = numericOnly.slice(0, maxLength)
                          const nextValue = buildPhoneValue(parsedPhone.countryCode, localDigits)
                          setEditForm((f) => ({ ...f, phone: nextValue }))
                        }}
                        placeholder={formatPhoneLocal('301234567', DEFAULT_PHONE_CODE)}
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
