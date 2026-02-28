import React, { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import '../styles/navbar.css'

export default function Navbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState('')
  const [cartItemsCount, setCartItemsCount] = useState(0)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isCartPreviewOpen, setIsCartPreviewOpen] = useState(false)
  const [cartItems, setCartItems] = useState([])
  const [scrollProgress, setScrollProgress] = useState(0)
  const dropdownRef = useRef(null)
  const mobileMenuRef = useRef(null)
  const cartPreviewRef = useRef(null)
  const scrollRafRef = useRef(null)
  const lastProgressRef = useRef(0)
  const foodEmojis = ['🍔', '🍕', '🍟', '🌭', '🌮', '🍣', '🍩', '🍗']
  const foodStart = 8
  const foodEnd = 92
  const foodStep = foodEmojis.length > 1 ? (foodEnd - foodStart) / (foodEmojis.length - 1) : 0
  const foodPositions = foodEmojis.map((_, index) => foodStart + index * foodStep)
  const visualStart = 2
  const visualEnd = 98
  const visualProgress = visualStart + (Math.min(Math.max(scrollProgress, 0), 100) / 100) * (visualEnd - visualStart)
  const pacmanPosition = visualProgress
  const isAtScrollEnd = scrollProgress >= 99

  const updateCartCount = () => {
    try {
      const savedCart = localStorage.getItem('quickbite_cart')
      if (savedCart) {
        const cart = JSON.parse(savedCart)
        const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0)
        setCartItemsCount(totalItems)
        setCartItems(cart)
      } else {
        setCartItemsCount(0)
        setCartItems([])
      }
    } catch (error) {
      console.error('Hiba a kosár számának betöltése közben:', error)
      setCartItemsCount(0)
      setCartItems([])
    }
  }

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  }

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
    updateCartCount()
    
    const handleStorageChange = () => {
      checkAuth()
      updateCartCount()
    }
    
    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('userLoggedIn', checkAuth)
    window.addEventListener('userLoggedOut', checkAuth)
    window.addEventListener('cartUpdated', updateCartCount)

    const cartInterval = setInterval(updateCartCount, 1000)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('userLoggedIn', checkAuth)
      window.removeEventListener('userLoggedOut', checkAuth)
      window.removeEventListener('cartUpdated', updateCartCount)
      clearInterval(cartInterval)
    }
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      const hamburgerBtn = document.querySelector('.hamburger-btn')
      
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
      
      if (mobileMenuRef.current && 
          !mobileMenuRef.current.contains(event.target) &&
          hamburgerBtn && !hamburgerBtn.contains(event.target)) {
        setIsMobileMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    const getScrollProgress = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight

      if (scrollableHeight <= 0) {
        return 0
      }

      return Math.min((scrollTop / scrollableHeight) * 100, 100)
    }

    const commitProgress = (nextProgress) => {
      if (Math.abs(nextProgress - lastProgressRef.current) < 0.2) return
      lastProgressRef.current = nextProgress
      setScrollProgress(nextProgress)
    }

    const handleScroll = () => {
      if (scrollRafRef.current !== null) return

      scrollRafRef.current = window.requestAnimationFrame(() => {
        scrollRafRef.current = null
        commitProgress(getScrollProgress())
      })
    }

    const handleResize = () => {
      commitProgress(getScrollProgress())
    }

    handleResize()
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize)
      if (scrollRafRef.current !== null) {
        window.cancelAnimationFrame(scrollRafRef.current)
      }
    }
  }, [])

  return (
    <header>
      <div className="header-content">
        <Link to="/">
          <div className="logo"> <span id='quick'> Quick</span><span id='bite' >Bite</span></div>
        </Link>
        
        {/* Hamburger menü gomb (mobil) */}
        <button 
          className="hamburger-btn"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Menü megnyitása"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Desktop menü */}
        <div className="header-actions desktop-menu">
          <Link to="/ettermek">Éttermeink</Link>
          {isLoggedIn && <Link to="/kedvencek">Kedvencek</Link>}
          {isLoggedIn && <Link to="/rendelesek">Rendeléseim</Link>}
          <div className="dropdown" ref={dropdownRef}>
            <button
              className="btn btn-secondary dropdown-toggle"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <i className="bi bi-list"></i>További
            </button>
            {isDropdownOpen && (
              <div className="dropdown-menu">
                <Link to="/velemenyek">Vásárlók véleményei</Link>
                <Link to="/kapcsolat">Kapcsolat</Link>
                <Link to="/rolunk">Rólunk</Link>
              </div>
            )}
          </div>
          <div 
            className="cart-wrapper"
            onMouseEnter={() => setIsCartPreviewOpen(true)}
            onMouseLeave={() => setIsCartPreviewOpen(false)}
            ref={cartPreviewRef}
          >
            <Link to="/kosar">
              <button className="btn btn-secondary cart-btn">
                <i className="bi bi-basket2-fill"></i>Kosár
                {cartItemsCount > 0 && (
                  <span className="cart-badge">{cartItemsCount}</span>
                )}
              </button>
            </Link>
            
            {/* Mini Cart Preview */}
            {isCartPreviewOpen && cartItems.length > 0 && (
              <div className="mini-cart-preview">
                <div className="mini-cart-header">
                  <h4>Kosár tartalma</h4>
                  <span className="mini-cart-count">{cartItemsCount} tétel</span>
                </div>
                <div className="mini-cart-items">
                  {cartItems.map((item, index) => (
                    <div key={index} className="mini-cart-item">
                      <img src={item.img || '/img/EtelKepek/default.png'} alt={item.name} />
                      <div className="mini-cart-item-details">
                        <span className="mini-cart-item-name">{item.name}</span>
                        <span className="mini-cart-item-price">{item.quantity}x {item.price.toLocaleString()} Ft</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mini-cart-footer">
                  <div className="mini-cart-total">
                    <span>Összesen:</span>
                    <span className="mini-cart-total-amount">{calculateTotal().toLocaleString()} Ft</span>
                  </div>
                   </div>
              </div>
            )}
          </div>
          {isLoggedIn ? (
            <Link to="/profilom" className="auth-link">
              <button className="btn btn-primary">
                <i className="bi bi-person-circle"></i>{userName}
              </button>
            </Link>
          ) : (
            <Link to="/bejelentkezes" className="auth-link">
              <button className="btn btn-primary">
                <i className="bi bi-person-circle"></i>Bejelentkezés
              </button>
            </Link>
          )}
        </div>

        {/* Mobil menü */}
        <div 
          ref={mobileMenuRef}
          className={`mobile-menu ${isMobileMenuOpen ? 'mobile-menu-open' : ''}`}
        >
          <div className="mobile-menu-content">
            <Link to="/ettermek" onClick={() => setIsMobileMenuOpen(false)}>
              <i className="bi bi-shop"></i> Éttermeink
            </Link>
            {isLoggedIn && (
              <Link to="/kedvencek" onClick={() => setIsMobileMenuOpen(false)}>
                <i className="bi bi-heart"></i> Kedvencek
              </Link>
            )}
            {isLoggedIn && (
              <Link to="/rendelesek" onClick={() => setIsMobileMenuOpen(false)}>
                <i className="bi bi-receipt"></i> Rendeléseim
              </Link>
            )}
            <Link to="/kosar" onClick={() => setIsMobileMenuOpen(false)}>
              <i className="bi bi-basket2-fill"></i> Kosár
              {cartItemsCount > 0 && (
                <span className="mobile-cart-badge">{cartItemsCount}</span>
              )}
            </Link>
            <div className="mobile-menu-divider"></div>
            <Link to="/velemenyek" onClick={() => setIsMobileMenuOpen(false)}>
              <i className="bi bi-chat-quote"></i> Vásárlók véleményei
            </Link>
            <Link to="/kapcsolat" onClick={() => setIsMobileMenuOpen(false)}>
              <i className="bi bi-envelope"></i> Kapcsolat
            </Link>
            <Link to="/rolunk" onClick={() => setIsMobileMenuOpen(false)}>
              <i className="bi bi-info-circle"></i> Rólunk
            </Link>
            <div className="mobile-menu-divider"></div>
            {isLoggedIn ? (
              <Link to="/profilom" className="mobile-menu-auth" onClick={() => setIsMobileMenuOpen(false)}>
                <i className="bi bi-person-circle"></i> {userName}
              </Link>
            ) : (
              <Link to="/bejelentkezes" className="mobile-menu-auth" onClick={() => setIsMobileMenuOpen(false)}>
                <i className="bi bi-person-circle"></i> Bejelentkezés
              </Link>
            )}
          </div>
        </div>
      </div>

      <div
        className="navbar-scroll-progress"
        role="progressbar"
        aria-label="Oldal görgetési állapot"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(scrollProgress)}
      >
        <div className="navbar-scroll-track">
          <div className="navbar-scroll-fill" style={{ width: `${visualProgress}%` }}></div>
          <div className="navbar-scroll-foods">
            {foodEmojis.map((emoji, index) => (
              <span
                key={`${emoji}-${index}`}
                className={`navbar-food-emoji ${pacmanPosition >= foodPositions[index] ? 'eaten' : ''}`}
                style={{ left: `${foodPositions[index]}%` }}
              >
                {emoji}
              </span>
            ))}
          </div>
          <div
            className={`navbar-pacman ${isAtScrollEnd ? 'celebrate' : ''}`}
            style={{ left: `${pacmanPosition}%` }}
          >
            <svg
              className="navbar-pacman-svg"
              viewBox="0 0 100 100"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path className="pacman-jaw-top pacman-body" d="M50 50 L95 50 A45 45 0 0 0 5 50 Z" />
              <path className="pacman-jaw-bottom pacman-body" d="M50 50 L95 50 A45 45 0 0 1 5 50 Z" />
              <circle className="pacman-eye" cx="56" cy="30" r="4" />
            </svg>
          </div>
        </div>
      </div>
    </header>
  )
}
