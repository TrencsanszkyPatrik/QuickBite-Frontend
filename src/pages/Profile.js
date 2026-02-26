import React, { useState, useEffect } from 'react'
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

export default function Profile({ favorites = [] }) {
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

        <PasswordChangeSection />

        <AddressSection addresses={profile.addresses || []} onUpdate={setProfile} />

        <PaymentMethodSection paymentMethods={profile.paymentMethods || []} onUpdate={setProfile} />

        <DeleteAccountSection />
      </div>
      <Footer />
    </div>
  )
}
