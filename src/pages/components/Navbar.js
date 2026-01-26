import React, { useState, useRef, useEffect } from 'react'
import logo from '../../img/LOGO/logo.jpg'
import { Link } from 'react-router-dom'
import '../components/css/navbar.css'

export default function Navbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState('')
  const dropdownRef = useRef(null)

  useEffect(() => {
    // Ellenőrizzük a bejelentkezési állapotot
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
    
    // Hallgatjuk a storage változásokat (pl. másik ablakban történő bejelentkezés)
    const handleStorageChange = () => checkAuth()
    window.addEventListener('storage', handleStorageChange)
    
    // Custom event a bejelentkezés után
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
      <div class="header-content">
        <Link to={"/"}>
          <div class="logo">
            <img class="logo-img" src={logo} alt="QuickBite logó" />
            <span>QuickBite</span>
          </div>
        </Link>

        <div class="header-actions">
          <Link to="/ettermek">Éttermeink</Link>
          <Link to="/kedvencek">Kedvencek</Link>

          <div class="dropdown" ref={dropdownRef}>
            <button
              class="btn btn-secondary dropdown-toggle"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <i class="bi bi-list"></i>Menü
            </button>
            {isDropdownOpen && (
              <div class="dropdown-menu">

                <Link to="/velemenyek">Vásárlók véleményei</Link>

                <Link to="/kapcsolat">Kapcsolat</Link>
                <Link to="/rolunk">Rólunk</Link>
              </div>
            )}
          </div>

            
          <Link to="/kosar"><button class="btn btn-secondary"><i class="bi bi-basket2-fill"></i>Kosár</button></Link>
          {isLoggedIn ? (
            <Link to="/profilom">
              <button class="btn btn-primary">
                <i class="bi bi-person-circle"></i>Profilom
              </button>
            </Link>
          ) : (
            <Link to="/bejelentkezes">
              <button class="btn btn-primary">
                <i class="bi bi-person-circle"></i>Bejelentkezés
              </button>
            </Link>
          )}
        </div>
      </div>
    </header>

  )
}
