import React, { useState, useRef, useEffect } from 'react'
import logo from '../../img/LOGO/logo.jpg'
import { Link } from 'react-router-dom'
import '../components/css/navbar.css'

export default function Navbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

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
          <Link to="/bejelentkezes"><button class="btn btn-primary"><i class="bi bi-person-circle"></i>Bejelentkezés</button></Link>
        </div>
      </div>
    </header>

  )
}
