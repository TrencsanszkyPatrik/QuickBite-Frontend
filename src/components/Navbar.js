import React, { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import '../styles/navbar.css'

export default function Navbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState('')
  const dropdownRef = useRef(null)

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('quickbite_token')
      const user = localStorage.getItem('quickbite_user')
      if (token && user) {
        setIsLoggedIn(true)
        try {
          const userData = JSON.parse(user)
          setUserName(userData.name || userData.email || 'Felhasználó')
        } catch (e) {
          setUserName('Felhasználó')
        }
      } else {
        setIsLoggedIn(false)
        setUserName('')
      }
    }

    checkAuth()
    const handleStorageChange = () => checkAuth()
    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('userLoggedIn', checkAuth)
    window.addEventListener('userLoggedOut', checkAuth)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('userLoggedIn', checkAuth)
      window.removeEventListener('userLoggedOut', checkAuth)
    }
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <header>
      <div className="header-content">
        <Link to="/">
          <div className="logo">
            <span><span id="quick">Quick</span><span id="bite">Bite</span></span>
          </div>
        </Link>
        <div className="header-actions">
          <Link to="/ettermek">Éttermeink</Link>
          <Link to="/kedvencek">Kedvencek</Link>
          <div className="dropdown" ref={dropdownRef}>
            <button
              className="btn btn-secondary dropdown-toggle"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <i className="bi bi-list"></i>Menü
            </button>
            {isDropdownOpen && (
              <div className="dropdown-menu">
                <Link to="/velemenyek">Vásárlók véleményei</Link>
                <Link to="/kapcsolat">Kapcsolat</Link>
                <Link to="/rolunk">Rólunk</Link>
              </div>
            )}
          </div>
          <Link to="/kosar">
            <button className="btn btn-secondary">
              <i className="bi bi-basket2-fill"></i>Kosár
            </button>
          </Link>
          {isLoggedIn ? (
            <Link to="/profilom">
              <button className="btn btn-primary">
                <i className="bi bi-person-circle"></i>Profilom
              </button>
            </Link>
          ) : (
            <Link to="/bejelentkezes">
              <button className="btn btn-primary">
                <i className="bi bi-person-circle"></i>Bejelentkezés
              </button>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
