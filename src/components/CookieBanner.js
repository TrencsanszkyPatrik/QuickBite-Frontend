import React, { useState, useEffect } from 'react'
import '../styles/cookiebanner.css'

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const cookieConsent = localStorage.getItem('quickbite_cookie_consent')
    if (!cookieConsent) {
      setIsVisible(true)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('quickbite_cookie_consent', 'accepted')
    setIsVisible(false)
  }

  const handleReject = () => {
    localStorage.setItem('quickbite_cookie_consent', 'rejected')
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div className="cookie-banner">
      <div className="cookie-content">
        <div className="cookie-text">
          <span className="cookie-icon">🍪</span>
          <p>
            <strong>Sütiket használunk</strong> az élmény javítása érdekében. 
            A weboldal használatával elfogadod a sütik használatát.
          </p>
        </div>
        <div className="cookie-actions">
          <button className="cookie-btn cookie-btn-accept" onClick={handleAccept}>
            Elfogadom
          </button>
          <button className="cookie-btn cookie-btn-reject" onClick={handleReject}>
            Elutasítom
          </button>
        </div>
      </div>
    </div>
  )
}
