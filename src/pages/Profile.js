import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import { usePageTitle } from '../utils/usePageTitle'
import { showToast } from '../utils/toast'
import './components/css/profile.css'

const API_BASE = 'https://localhost:7236/api'

const ADDRESS_LABELS = [
  { value: 'Otthon', label: 'Otthon' },
  { value: 'Munkahely', label: 'Munkahely' },
  { value: 'Egyéb', label: 'Egyéb' }
]

const PAYMENT_TYPES = [
  { value: 'card', label: 'Bankkártya' },
  { value: 'cash', label: 'Készpénz' },
  { value: 'szep', label: 'SZÉP kártya' }
]

function getAuthHeaders() {
  const token = localStorage.getItem('quickbite_token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  }
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' })
}

function getInitials(name) {
  if (!name || typeof name !== 'string') return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

const emptyAddressForm = () => ({
  label: 'Otthon',
  addressLine: '',
  city: '',
  zipCode: '',
  isDefault: false
})

const emptyPaymentForm = () => ({
  type: 'card',
  displayName: '',
  lastFourDigits: '',
  isDefault: false
})

export default function Profile() {
  usePageTitle('QuickBite - Profilom')
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    avatarUrl: ''
  })
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [editingAddressId, setEditingAddressId] = useState(null)
  const [editingPaymentId, setEditingPaymentId] = useState(null)
  const [addressForm, setAddressForm] = useState(emptyAddressForm)
  const [paymentForm, setPaymentForm] = useState(emptyPaymentForm)
  const [busyId, setBusyId] = useState(null)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    newPasswordConfirm: ''
  })
  const [deleteAccountPassword, setDeleteAccountPassword] = useState('')
  const [deleteAccountConfirmed, setDeleteAccountConfirmed] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)

  const loadProfile = async () => {
    const res = await fetch(`${API_BASE}/Profile/me`, { headers: getAuthHeaders() })
    if (res.status === 401) {
      showToast.error('Munkamenet lejárt. Jelentkezz be újra!')
      navigate('/bejelentkezes')
      return null
    }
    if (!res.ok) throw new Error('Profil betöltése sikertelen')
    return res.json()
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

  const handleSave = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      const res = await fetch(`${API_BASE}/Profile/me`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: editForm.name || undefined,
          phone: editForm.phone || undefined,
          avatarUrl: editForm.avatarUrl || undefined
        })
      })
      if (!res.ok) throw new Error('Mentés sikertelen')
      const data = await res.json()
      setProfile(data)
      const stored = localStorage.getItem('quickbite_user')
      if (stored) {
        try {
          const user = JSON.parse(stored)
          user.name = data.name
          localStorage.setItem('quickbite_user', JSON.stringify(user))
          window.dispatchEvent(new Event('userLoggedIn'))
        } catch (_) { }
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

  // ——— Címeim ———
  const openAddAddress = () => {
    setEditingAddressId(null)
    setAddressForm(emptyAddressForm())
    setShowAddressForm(true)
  }
  const openEditAddress = (a) => {
    setEditingAddressId(a.id)
    setAddressForm({
      label: a.label,
      addressLine: a.addressLine,
      city: a.city,
      zipCode: a.zipCode,
      isDefault: a.isDefault
    })
    setShowAddressForm(true)
  }
  const submitAddress = async (e) => {
    e.preventDefault()
    if (!addressForm.addressLine?.trim() || !addressForm.city?.trim() || !addressForm.zipCode?.trim()) {
      showToast.error('Cím, város és irányítószám kötelező.')
      return
    }
    setBusyId('address')
    try {
      if (editingAddressId) {
        const res = await fetch(`${API_BASE}/Profile/addresses/${editingAddressId}`, {
          method: 'PATCH',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            label: addressForm.label,
            addressLine: addressForm.addressLine.trim(),
            city: addressForm.city.trim(),
            zipCode: addressForm.zipCode.trim(),
            isDefault: addressForm.isDefault
          })
        })
        if (!res.ok) throw new Error('Cím mentése sikertelen')
        showToast.success('Cím frissítve.')
      } else {
        const res = await fetch(`${API_BASE}/Profile/addresses`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            label: addressForm.label,
            addressLine: addressForm.addressLine.trim(),
            city: addressForm.city.trim(),
            zipCode: addressForm.zipCode.trim(),
            isDefault: addressForm.isDefault
          })
        })
        if (!res.ok) throw new Error('Cím mentése sikertelen')
        showToast.success('Cím hozzáadva.')
      }
      const data = await loadProfile()
      if (data) setProfile(data)
      setShowAddressForm(false)
      setAddressForm(emptyAddressForm())
      setEditingAddressId(null)
    } catch (err) {
      console.error(err)
      showToast.error('Cím mentése sikertelen.')
    } finally {
      setBusyId(null)
    }
  }
  const setDefaultAddress = async (id) => {
    setBusyId(id)
    try {
      const res = await fetch(`${API_BASE}/Profile/addresses/${id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ isDefault: true })
      })
      if (!res.ok) throw new Error()
      const data = await loadProfile()
      if (data) setProfile(data)
      showToast.success('Alapértelmezett cím beállítva.')
    } catch {
      showToast.error('Nem sikerült beállítani.')
    } finally {
      setBusyId(null)
    }
  }
  const deleteAddress = async (id) => {
    if (!window.confirm('Biztosan törölni szeretnéd ezt a címet?')) return
    setBusyId(id)
    try {
      const res = await fetch(`${API_BASE}/Profile/addresses/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })
      if (!res.ok) throw new Error()
      const data = await loadProfile()
      if (data) setProfile(data)
      showToast.success('Cím törölve.')
      if (editingAddressId === id) {
        setShowAddressForm(false)
        setEditingAddressId(null)
        setAddressForm(emptyAddressForm())
      }
    } catch {
      showToast.error('Törlés sikertelen.')
    } finally {
      setBusyId(null)
    }
  }

  // ——— Fizetési módok ———
  const openAddPayment = () => {
    setEditingPaymentId(null)
    setPaymentForm(emptyPaymentForm())
    setShowPaymentForm(true)
  }
  const openEditPayment = (p) => {
    setEditingPaymentId(p.id)
    setPaymentForm({
      type: p.type,
      displayName: p.displayName,
      lastFourDigits: p.lastFourDigits || '',
      isDefault: p.isDefault
    })
    setShowPaymentForm(true)
  }
  const submitPayment = async (e) => {
    e.preventDefault()
    const displayName = paymentForm.displayName?.trim()
    if (!displayName) {
      showToast.error('Megjelenített név kötelező.')
      return
    }
    setBusyId('payment')
    try {
      if (editingPaymentId) {
        const res = await fetch(`${API_BASE}/Profile/payment-methods/${editingPaymentId}`, {
          method: 'PATCH',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            type: paymentForm.type,
            displayName,
            lastFourDigits: paymentForm.lastFourDigits?.trim() || null,
            isDefault: paymentForm.isDefault
          })
        })
        if (!res.ok) throw new Error('Mentés sikertelen')
        showToast.success('Fizetési mód frissítve.')
      } else {
        const res = await fetch(`${API_BASE}/Profile/payment-methods`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            type: paymentForm.type,
            displayName,
            lastFourDigits: paymentForm.lastFourDigits?.trim() || null,
            isDefault: paymentForm.isDefault
          })
        })
        if (!res.ok) throw new Error('Mentés sikertelen')
        showToast.success('Fizetési mód hozzáadva.')
      }
      const data = await loadProfile()
      if (data) setProfile(data)
      setShowPaymentForm(false)
      setPaymentForm(emptyPaymentForm())
      setEditingPaymentId(null)
    } catch (err) {
      console.error(err)
      showToast.error('Fizetési mód mentése sikertelen.')
    } finally {
      setBusyId(null)
    }
  }
  const setDefaultPayment = async (id) => {
    setBusyId(id)
    try {
      const res = await fetch(`${API_BASE}/Profile/payment-methods/${id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ isDefault: true })
      })
      if (!res.ok) throw new Error()
      const data = await loadProfile()
      if (data) setProfile(data)
      showToast.success('Alapértelmezett fizetési mód beállítva.')
    } catch {
      showToast.error('Nem sikerült beállítani.')
    } finally {
      setBusyId(null)
    }
  }
  const deletePayment = async (id) => {
    if (!window.confirm('Biztosan törölni szeretnéd ezt a fizetési módot?')) return
    setBusyId(id)
    try {
      const res = await fetch(`${API_BASE}/Profile/payment-methods/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })
      if (!res.ok) throw new Error()
      const data = await loadProfile()
      if (data) setProfile(data)
      showToast.success('Fizetési mód törölve.')
      if (editingPaymentId === id) {
        setShowPaymentForm(false)
        setEditingPaymentId(null)
        setPaymentForm(emptyPaymentForm())
      }
    } catch {
      showToast.error('Törlés sikertelen.')
    } finally {
      setBusyId(null)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (passwordForm.newPassword.length < 6) {
      showToast.error('Az új jelszónak legalább 6 karakter hosszúnak kell lennie.')
      return
    }
    if (passwordForm.newPassword !== passwordForm.newPasswordConfirm) {
      showToast.error('Az új jelszavak nem egyeznek meg.')
      return
    }
    setIsChangingPassword(true)
    try {
      const res = await fetch(`${API_BASE}/Profile/me/password`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        showToast.error(data.message || 'Jelszó megváltoztatása sikertelen.')
        return
      }
      showToast.success('A jelszavad sikeresen megváltozott.')
      setPasswordForm({ currentPassword: '', newPassword: '', newPasswordConfirm: '' })
      setShowPasswordForm(false)
    } catch (err) {
      console.error(err)
      showToast.error('Jelszó megváltoztatása sikertelen.')
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleDeleteAccount = async (e) => {
    e.preventDefault()
    if (!deleteAccountConfirmed) {
      showToast.error('Kérjük, jelöld be, hogy érted a fiók törlésének következményeit.')
      return
    }
    if (!deleteAccountPassword.trim()) {
      showToast.error('Add meg a jelszavadat a fiók törléséhez.')
      return
    }
    setIsDeletingAccount(true)
    try {
      const res = await fetch(`${API_BASE}/Profile/me/delete`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ password: deleteAccountPassword })
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        showToast.error(data.message || 'Fiók törlése sikertelen.')
        return
      }
      localStorage.removeItem('quickbite_token')
      localStorage.removeItem('quickbite_user')
      window.dispatchEvent(new Event('userLoggedOut'))
      showToast.success('A fiókod törölve lett. Viszlát!')
      setTimeout(() => navigate('/'), 1500)
    } catch (err) {
      console.error(err)
      showToast.error('Fiók törlése sikertelen.')
    } finally {
      setIsDeletingAccount(false)
    }
  }

  if (isLoading) {
    return (
      <div className="profile-page">
        <Navbar />
        <div className="profile-container">
          <div className="profile-loading">
            <div className="spinner" aria-hidden="true" />
            <p>Profil betöltése...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!profile) return null

  const addresses = profile.addresses || []
  const paymentMethods = profile.paymentMethods || []
  const favoritesCount = (() => {
    try {
      const stored = localStorage.getItem('quickbite_favorites')
      const arr = stored ? JSON.parse(stored) : []
      return Array.isArray(arr) ? arr.length : 0
    } catch {
      return 0
    }
  })()

  const paymentTypeLabel = (type) => PAYMENT_TYPES.find((t) => t.value === type)?.label || type

  return (
    <div className="profile-page">
      <Navbar />
      <div className="profile-container">
        <div className="profile-header-card">
          <div className="profile-avatar-wrap">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt={profile.name} className="profile-avatar" />
            ) : (
              <div className="profile-avatar-initials" aria-hidden="true">
                {getInitials(profile.name)}
              </div>
            )}
          </div>
          <div className="profile-header-info">
            <h1>{profile.name || 'Nincs megadva'}</h1>
            <p className="profile-email">{profile.email}</p>
            <p className="profile-member-since">
              <i className="bi bi-calendar3" aria-hidden="true" />
              Csatlakozott: {formatDate(profile.createdAt)}
            </p>
          </div>
        </div>

        <div className="profile-stats">
          <Link to="/kedvencek" className="profile-stat-card">
            <span className="stat-value">{favoritesCount}</span>
            <span className="stat-label">Kedvenc étterem</span>
          </Link>
          <div className="profile-stat-card">
            <span className="stat-value">{profile.reviewsCount ?? 0}</span>
            <span className="stat-label">Értékelésem</span>
          </div>
        </div>

        {/* Személyes adatok — címek kivéve */}
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
              <div className="profile-form-group">
                <label htmlFor="profile-phone">Telefonszám</label>
                <input
                  id="profile-phone"
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="+36 30 123 4567"
                />
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

        {/* Jelszó megváltoztatása */}
        <div className="profile-section-card">
          <h2>
            <i className="bi bi-key" aria-hidden="true" />
            Jelszó megváltoztatása
          </h2>
          {showPasswordForm ? (
            <form onSubmit={handleChangePassword}>
              <div className="profile-form-grid">
                <div className="profile-form-group full-width">
                  <label htmlFor="current-password">Jelenlegi jelszó</label>
                  <input
                    id="current-password"
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm((f) => ({ ...f, currentPassword: e.target.value }))
                    }
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                  />
                </div>
                <div className="profile-form-group full-width">
                  <label htmlFor="new-password">Új jelszó (min. 6 karakter)</label>
                  <input
                    id="new-password"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm((f) => ({ ...f, newPassword: e.target.value }))
                    }
                    placeholder="••••••••"
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                </div>
                <div className="profile-form-group full-width">
                  <label htmlFor="new-password-confirm">Új jelszó még egyszer</label>
                  <input
                    id="new-password-confirm"
                    type="password"
                    value={passwordForm.newPasswordConfirm}
                    onChange={(e) =>
                      setPasswordForm((f) => ({ ...f, newPasswordConfirm: e.target.value }))
                    }
                    placeholder="••••••••"
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                </div>
              </div>
              <div className="profile-actions">
                <button
                  type="submit"
                  className="profile-btn profile-btn-primary"
                  disabled={isChangingPassword}
                >
                  {isChangingPassword ? 'Mentés...' : 'Jelszó megváltoztatása'}
                </button>
                <button
                  type="button"
                  className="profile-btn profile-btn-outline"
                  onClick={() => {
                    setShowPasswordForm(false)
                    setPasswordForm({
                      currentPassword: '',
                      newPassword: '',
                      newPasswordConfirm: ''
                    })
                  }}
                >
                  Mégse
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              className="profile-btn profile-btn-outline"
              onClick={() => setShowPasswordForm(true)}
            >
              <i className="bi bi-key" /> Jelszó megváltoztatása
            </button>
          )}
        </div>



        {/* Címeim */}
        <div className="profile-section-card">
          <h2>
            <i className="bi bi-geo-alt" aria-hidden="true" />
            Címeim
          </h2>
          <div className="profile-item-list">
            {addresses.map((a) => (
              <div
                key={a.id}
                className={`profile-item-card ${a.isDefault ? 'is-default' : ''}`}
              >
                <div className="profile-item-body">
                  <div className="profile-item-label">
                    {a.label}
                    {a.isDefault && (
                      <span className="profile-default-badge">Alapértelmezett</span>
                    )}
                  </div>
                  <div className="profile-item-detail">
                    {a.addressLine}, {a.zipCode} {a.city}
                  </div>
                </div>
                <div className="profile-item-actions">
                  {!a.isDefault && (
                    <button
                      type="button"
                      className="profile-btn profile-btn-sm profile-btn-ghost"
                      onClick={() => setDefaultAddress(a.id)}
                      disabled={busyId !== null}
                    >
                      Alapértelmezett
                    </button>
                  )}
                  <button
                    type="button"
                    className="profile-btn profile-btn-sm profile-btn-ghost"
                    onClick={() => openEditAddress(a)}
                    disabled={busyId !== null}
                  >
                    <i className="bi bi-pencil" /> Szerkeszt
                  </button>
                  <button
                    type="button"
                    className="profile-btn profile-btn-sm profile-btn-ghost"
                    onClick={() => deleteAddress(a.id)}
                    disabled={busyId !== null}
                  >
                    <i className="bi bi-trash" /> Törlés
                  </button>
                </div>
              </div>
            ))}
          </div>
          {showAddressForm ? (
            <form className="profile-add-form" onSubmit={submitAddress}>
              <div className="profile-form-grid">
                <div className="profile-form-group">
                  <label>Megnevezés</label>
                  <select
                    value={addressForm.label}
                    onChange={(e) =>
                      setAddressForm((f) => ({ ...f, label: e.target.value }))
                    }
                  >
                    {ADDRESS_LABELS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="profile-form-group full-width">
                  <label>Cím (utca, házszám)</label>
                  <input
                    type="text"
                    value={addressForm.addressLine}
                    onChange={(e) =>
                      setAddressForm((f) => ({ ...f, addressLine: e.target.value }))
                    }
                    placeholder="Petőfi Sándor út 1."
                    required
                  />
                </div>
                <div className="profile-form-group">
                  <label>Város</label>
                  <input
                    type="text"
                    value={addressForm.city}
                    onChange={(e) =>
                      setAddressForm((f) => ({ ...f, city: e.target.value }))
                    }
                    placeholder="Budapest"
                    required
                  />
                </div>
                <div className="profile-form-group">
                  <label>Irányítószám</label>
                  <input
                    type="text"
                    value={addressForm.zipCode}
                    onChange={(e) =>
                      setAddressForm((f) => ({ ...f, zipCode: e.target.value }))
                    }
                    placeholder="1051"
                    required
                  />
                </div>
                <div className="profile-form-group full-width">
                  <label>
                    <input
                      type="checkbox"
                      checked={addressForm.isDefault}
                      onChange={(e) =>
                        setAddressForm((f) => ({ ...f, isDefault: e.target.checked }))
                      }
                    />{' '}
                    Alapértelmezett cím
                  </label>
                </div>
              </div>
              <div className="profile-actions">
                <button
                  type="submit"
                  className="profile-btn profile-btn-primary"
                  disabled={busyId === 'address'}
                >
                  {editingAddressId ? 'Mentem' : 'Hozzáadom'}
                </button>
                <button
                  type="button"
                  className="profile-btn profile-btn-outline"
                  onClick={() => {
                    setShowAddressForm(false)
                    setEditingAddressId(null)
                    setAddressForm(emptyAddressForm())
                  }}
                >
                  Mégse
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              className="profile-btn profile-btn-outline"
              onClick={openAddAddress}
              style={{ marginTop: '0.75rem' }}
            >
              <i className="bi bi-plus-lg" /> Új cím
            </button>
          )}
        </div>

        {/* Fizetési módok */}
        <div className="profile-section-card">
          <h2>
            <i className="bi bi-credit-card" aria-hidden="true" />
            Fizetési módok
          </h2>
          <div className="profile-item-list">
            {paymentMethods.map((p) => (
              <div
                key={p.id}
                className={`profile-item-card ${p.isDefault ? 'is-default' : ''}`}
              >
                <div className="profile-item-body">
                  <div className="profile-item-label">
                    {p.type === 'card' && <i className="bi bi-credit-card-2-front" />}
                    {p.type === 'cash' && <i className="bi bi-cash-stack" />}
                    {p.type === 'szep' && <i className="bi bi-wallet2" />}
                    {paymentTypeLabel(p.type)}
                    {p.isDefault && (
                      <span className="profile-default-badge">Alapértelmezett</span>
                    )}
                  </div>
                  <div className="profile-item-detail">
                    {p.displayName}
                    {p.lastFourDigits && ` •••• ${p.lastFourDigits}`}
                  </div>
                </div>
                <div className="profile-item-actions">
                  {!p.isDefault && (
                    <button
                      type="button"
                      className="profile-btn profile-btn-sm profile-btn-ghost"
                      onClick={() => setDefaultPayment(p.id)}
                      disabled={busyId !== null}
                    >
                      Alapértelmezett
                    </button>
                  )}
                  <button
                    type="button"
                    className="profile-btn profile-btn-sm profile-btn-ghost"
                    onClick={() => openEditPayment(p)}
                    disabled={busyId !== null}
                  >
                    <i className="bi bi-pencil" /> Szerkeszt
                  </button>
                  <button
                    type="button"
                    className="profile-btn profile-btn-sm profile-btn-ghost"
                    onClick={() => deletePayment(p.id)}
                    disabled={busyId !== null}
                  >
                    <i className="bi bi-trash" /> Törlés
                  </button>
                </div>
              </div>
            ))}
          </div>
          {showPaymentForm ? (
            <form className="profile-add-form" onSubmit={submitPayment}>
              <div className="profile-form-grid">
                <div className="profile-form-group">
                  <label>Típus</label>
                  <select
                    value={paymentForm.type}
                    onChange={(e) =>
                      setPaymentForm((f) => ({ ...f, type: e.target.value }))
                    }
                  >
                    {PAYMENT_TYPES.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="profile-form-group full-width">
                  <label>Megjelenített név (pl. Bankkártya **** 1234)</label>
                  <input
                    type="text"
                    value={paymentForm.displayName}
                    onChange={(e) =>
                      setPaymentForm((f) => ({ ...f, displayName: e.target.value }))
                    }
                    placeholder="Bankkártya **** 1234"
                    required
                  />
                </div>
                {paymentForm.type === 'card' && (
                  <div className="profile-form-group">
                    <label>Utolsó 4 számjegy (opcionális)</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={4}
                      value={paymentForm.lastFourDigits}
                      onChange={(e) => {
                        const v = e.target.value.replace(/\D/g, '').slice(0, 4)
                        setPaymentForm((f) => ({ ...f, lastFourDigits: v }))
                      }}
                      placeholder="1234"
                    />
                  </div>
                )}
                <div className="profile-form-group full-width">
                  <label>
                    <input
                      type="checkbox"
                      checked={paymentForm.isDefault}
                      onChange={(e) =>
                        setPaymentForm((f) => ({ ...f, isDefault: e.target.checked }))
                      }
                    />{' '}
                    Alapértelmezett fizetési mód
                  </label>
                </div>
              </div>
              <div className="profile-actions">
                <button
                  type="submit"
                  className="profile-btn profile-btn-primary"
                  disabled={busyId === 'payment'}
                >
                  {editingPaymentId ? 'Mentem' : 'Hozzáadom'}
                </button>
                <button
                  type="button"
                  className="profile-btn profile-btn-outline"
                  onClick={() => {
                    setShowPaymentForm(false)
                    setEditingPaymentId(null)
                    setPaymentForm(emptyPaymentForm())
                  }}
                >
                  Mégse
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              className="profile-btn profile-btn-outline"
              onClick={openAddPayment}
              style={{ marginTop: '0.75rem' }}
            >
              <i className="bi bi-plus-lg" /> Új fizetési mód
            </button>
          )}
        </div>



        {/* Fiók törlése */}
        <div className="profile-section-card profile-section-card--danger">
          <h2>
            <i className="bi bi-exclamation-triangle" aria-hidden="true" />
            Fiók törlése
          </h2>
          <p className="profile-danger-text">
            A fiók törlése visszavonhatatlan. Minden adatod (címeid, fizetési módok, értékeléseid) véglegesen törlésre kerül.
          </p>
          <form onSubmit={handleDeleteAccount}>
            <div className="profile-form-grid">
              <div className="profile-form-group full-width">
                <label htmlFor="delete-account-password">Jelszó megerősítése</label>
                <input
                  id="delete-account-password"
                  type="password"
                  value={deleteAccountPassword}
                  onChange={(e) => setDeleteAccountPassword(e.target.value)}
                  placeholder="Add meg a jelszavadat"
                  autoComplete="current-password"
                />
              </div>
              <div className="profile-form-group full-width">
                <label className="profile-checkbox-label">
                  <input
                    type="checkbox"
                    checked={deleteAccountConfirmed}
                    onChange={(e) => setDeleteAccountConfirmed(e.target.checked)}
                  />{' '}
                  Értem, hogy a fiókom és minden adata véglegesen törlésre kerül, és ezt nem lehet visszavonni.
                </label>
              </div>
            </div>
            <div className="profile-actions">
              <button
                type="submit"
                className="profile-btn profile-btn-danger"
                disabled={!deleteAccountConfirmed || !deleteAccountPassword.trim() || isDeletingAccount}
              >
                <i className="bi bi-trash" />
                {isDeletingAccount ? 'Törlés...' : 'Fiókom végleges törlése'}
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  )
}
