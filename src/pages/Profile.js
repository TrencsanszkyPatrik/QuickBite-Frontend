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
import { getPhoneConfig, parsePhoneValue, formatPhoneLocal, buildPhoneValue, isValidPhoneNumber, findCountryCodeFromDigits, handlePhoneCodeTypeAhead, resetPhoneCodeTypeAhead, FALLBACK_PHONE_CODE_OPTIONS, DEFAULT_PHONE_CODE, CARD_NAME_LETTERS_REGEX } from '../utils/phoneValidation'
import { getAuthToken, getAuthUser, setAuthUser, clearAuth } from '../utils/storage'

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

  const getPhoneConfigUtil = (countryCode) => {
    return getPhoneConfig(phoneCodeOptions, phoneLengthBoundsCacheRef, countryCode)
  }

  const parsePhoneValueUtil = (value, fallbackCountryCode = DEFAULT_PHONE_CODE, allowCountryCodeDetection = false) => {
    return parsePhoneValue(phoneCodeOptions, value, fallbackCountryCode, allowCountryCodeDetection)
  }

  const formatPhoneLocalUtil = (localDigits, countryCode) => {
    return formatPhoneLocal(localDigits, countryCode, phoneCodeOptions)
  }

  const buildPhoneValueUtil = (countryCode, localDigits) => {
    return buildPhoneValue(countryCode, localDigits, phoneCodeOptions)
  }

  const isValidPhoneNumberUtil = (value) => {
    return isValidPhoneNumber(phoneCodeOptions, selectedPhoneCountryCode, phoneLengthBoundsCacheRef, value)
  }

  const findCountryCodeFromDigitsUtil = (digits) => {
    return findCountryCodeFromDigits(phoneCodeOptions, digits)
  }

  const resetPhoneCodeTypeAheadUtil = () => {
    resetPhoneCodeTypeAhead(phoneCodeTypeBufferRef, phoneCodeTypeTimeoutRef)
  }

  const closePhoneCodeList = () => {
    setIsPhoneCodeListOpen(false)
    resetPhoneCodeTypeAheadUtil()
  }

  const applyPhoneCountryCode = (countryCode) => {
    const parsedPhone = parsePhoneValueUtil(editForm.phone, selectedPhoneCountryCode)
    const nextValue = buildPhoneValueUtil(countryCode, parsedPhone.localDigits)
    setSelectedPhoneCountryCode(countryCode)
    setEditForm((f) => ({ ...f, phone: nextValue }))
  }

  const handlePhoneCodeTypeAheadUtil = (character) => {
    handlePhoneCodeTypeAhead(
      phoneCodeOptions,
      phoneCodeTypeBufferRef,
      phoneCodeTypeTimeoutRef,
      phoneCodeOptionRefs,
      phoneCodeTypeBufferRef.current,
      character,
      (matchedOption) => applyPhoneCountryCode(matchedOption.value)
    )
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
      handlePhoneCodeTypeAheadUtil(e.key)
    }
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
    const token = getAuthToken()
    const userData = getAuthUser()
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
          const parsedPhone = parsePhoneValueUtil(data.phone, selectedPhoneCountryCode, true)
          setSelectedPhoneCountryCode(parsedPhone.countryCode)
          normalizedPhone = buildPhoneValueUtil(parsedPhone.countryCode, parsedPhone.localDigits)
        }

        setEditForm({
          name: data.name || '',
          phone: normalizedPhone,
          avatarUrl: data.avatarUrl || ''
        })
      } catch (err) {
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
      resetPhoneCodeTypeAheadUtil()
    }
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    if (editForm.phone && !isValidPhoneNumberUtil(editForm.phone)) {
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
      const user = getAuthUser()
      if (user) {
        const updatedUser = { ...user, name: data.name }
        setAuthUser(updatedUser)
        window.dispatchEvent(new Event('userLoggedIn'))
      }
      showToast.success('Profil mentve!')
    } catch (err) {
      showToast.error('Mentés sikertelen. Próbáld újra!')
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogout = () => {
    clearAuth()
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
                  const parsedPhone = parsePhoneValueUtil(editForm.phone, selectedPhoneCountryCode)
                  const phoneConfig = getPhoneConfigUtil(parsedPhone.countryCode)
                  const phonePlaceholder =
                    parsedPhone.countryCode === '+36'
                      ? '30 123 4567'
                      : formatPhoneLocalUtil('9'.repeat(phoneConfig.localMaxLength), parsedPhone.countryCode)
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
                          {getPhoneConfigUtil(selectedPhoneCountryCode).label}
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
                        value={formatPhoneLocalUtil(parsedPhone.localDigits, parsedPhone.countryCode)}
                        maxLength={phoneInputMaxLength}
                        onChange={(e) => {
                          const numericOnly = e.target.value.replace(/\D/g, '')
                          const maxLength = phoneConfig.localMaxLength
                          const localDigits = numericOnly.slice(0, maxLength)
                          const nextValue = buildPhoneValueUtil(parsedPhone.countryCode, localDigits)
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