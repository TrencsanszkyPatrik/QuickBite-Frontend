import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import { usePageTitle } from '../utils/usePageTitle'
import { showToast } from '../utils/toast'
import './components/css/login.css'

export default function Profile() {
  usePageTitle("QuickBite - Profilom")
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('quickbite_token')
    const userData = localStorage.getItem('quickbite_user')

    if (!token || !userData) {
      showToast.error('Kérjük, jelentkezzen be!')
      navigate('/bejelentkezes')
      return
    }

    try {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
    } catch (e) {
      console.error('Hiba a felhasználó adatok betöltésekor:', e)
      showToast.error('Hiba a profil betöltésekor!')
      navigate('/bejelentkezes')
    } finally {
      setIsLoading(false)
    }
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('quickbite_token')
    localStorage.removeItem('quickbite_user')
    
    // Custom event a Navbar frissítéséhez
    window.dispatchEvent(new Event('userLoggedOut'))
    
    showToast.success('Sikeres kijelentkezés!')
    setTimeout(() => {
      navigate('/')
    }, 1000)
  }

  if (isLoading) {
    return (
      <div className="login-page">
        <Navbar />
        <div className="container-login">
          <p>Betöltés...</p>
        </div>
        <Footer />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="login-page">
      <Navbar />
      <div className="container-login">
        <h1>Profilom</h1>
        <div style={{ marginTop: '2rem', textAlign: 'left', maxWidth: '500px', margin: '2rem auto' }}>
          <div style={{ 
            background: 'white', 
            padding: '2rem', 
            borderRadius: '12px', 
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            marginBottom: '1.5rem'
          }}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ 
                display: 'block', 
                fontWeight: '600', 
                marginBottom: '0.5rem',
                color: 'var(--text)'
              }}>
                Név:
              </label>
              <div style={{ 
                padding: '0.75rem', 
                background: '#f5f5f5', 
                borderRadius: '8px',
                color: 'var(--text)'
              }}>
                {user.name || 'Nincs megadva'}
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ 
                display: 'block', 
                fontWeight: '600', 
                marginBottom: '0.5rem',
                color: 'var(--text)'
              }}>
                Email:
              </label>
              <div style={{ 
                padding: '0.75rem', 
                background: '#f5f5f5', 
                borderRadius: '8px',
                color: 'var(--text)'
              }}>
                {user.email || 'Nincs megadva'}
              </div>
            </div>
          </div>

          <button 
            onClick={handleLogout}
            className="create-account-login"
            style={{ 
              background: '#dc3545',
              width: '100%',
              marginTop: '1rem'
            }}
          >
            <i className="bi bi-box-arrow-right"></i> Kijelentkezés
          </button>
        </div>
      </div>
      <Footer />
    </div>
  )
}
