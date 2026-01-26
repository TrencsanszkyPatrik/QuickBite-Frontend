import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import '../styles/login.css'
import { usePageTitle } from '../utils/usePageTitle'
import { showToast } from '../utils/toast'
import { API_BASE } from '../utils/api'

export default function Login() {
  usePageTitle('QuickBite - Bejelentkezés')
  const navigate = useNavigate()
  const [isLogin, setIsLogin] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [showRegisterPassword, setShowRegisterPassword] = useState(false)
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] = useState(false)
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [registerFullName, setRegisterFullName] = useState('')
  const [registerEmail, setRegisterEmail] = useState('')
  const [registerPassword, setRegisterPassword] = useState('')
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    
    if (!loginEmail || !loginPassword) {
      showToast.error('Kérjük, töltse ki az összes mezőt!')
      return
    }

    if (!loginEmail.includes('@')) {
      showToast.error('Kérjük, adjon meg egy érvényes email címet!')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('https://localhost:7236/api/Auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Bejelentkezés sikertelen' }))
        throw new Error(errorData.message || 'Bejelentkezés sikertelen')
      }

      const data = await response.json()
      if (data.token) {
        localStorage.setItem('quickbite_token', data.token)
        localStorage.setItem('quickbite_user', JSON.stringify({
          id: data.userId,
          email: loginEmail,
          name: data.name || loginEmail
        }))
        window.dispatchEvent(new Event('userLoggedIn'))
      }

      showToast.success('Sikeres bejelentkezés!')
      setTimeout(() => {
        navigate('/')
      }, 1000)
    } catch (error) {
      console.error('Bejelentkezési hiba:', error)
      showToast.error(error.message || 'Bejelentkezés sikertelen. Kérjük, ellenőrizze az adatokat!')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    
    if (!registerFullName || !registerEmail || !registerPassword || !registerConfirmPassword) {
      showToast.error('Kérjük, töltse ki az összes mezőt!')
      return
    }

    if (!registerEmail.includes('@')) {
      showToast.error('Kérjük, adjon meg egy érvényes email címet!')
      return
    }

    if (registerPassword.length < 6) {
      showToast.error('A jelszónak legalább 6 karakter hosszúnak kell lennie!')
      return
    }

    if (registerPassword !== registerConfirmPassword) {
      showToast.error('A jelszavak nem egyeznek meg!')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE}/Auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: registerFullName,
          email: registerEmail,
          password: registerPassword
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Regisztráció sikertelen' }))
        throw new Error(errorData.message || 'Regisztráció sikertelen')
      }

      const data = await response.json()
      if (data.token) {
        localStorage.setItem('quickbite_token', data.token)
        localStorage.setItem('quickbite_user', JSON.stringify({
          id: data.userId,
          email: registerEmail,
          name: registerFullName
        }))
        window.dispatchEvent(new Event('userLoggedIn'))
      }

      showToast.success('Sikeres regisztráció!')
      setTimeout(() => {
        navigate('/')
      }, 1000)
    } catch (error) {
      console.error('Regisztrációs hiba:', error)
      showToast.error(error.message || 'Regisztráció sikertelen. Kérjük, próbálja újra!')
    } finally {
      setIsLoading(false)
    }
  }

  const switchToLogin = () => {
    setIsLogin(true)
    setRegisterFullName('')
    setRegisterEmail('')
    setRegisterPassword('')
    setRegisterConfirmPassword('')
  }

  const switchToRegister = () => {
    setIsLogin(false)
    setLoginEmail('')
    setLoginPassword('')
  }

  return (
    <div className="login-page">
      <Navbar />
      <div className="container-login">
        <h1>QuickBite</h1>
        <p>{isLogin ? 'Jelentkezz be a könnyebb rendelésért!' : 'Regisztrálj, hogy máris rendelhess!'}</p>
        <div className="buttons-login">
            <button 
              className={isLogin ? "login-login active" : "login-login"}
              onClick={switchToLogin}
            >
              Bejelentkezés
            </button>
            <button 
              className={isLogin ? "register-login" : "register-login active"}
              onClick={switchToRegister}
            >
              Regisztráció
            </button>
        </div>
        
        {isLogin ? (
          <form key="login-form" onSubmit={handleLogin}>
            <div className="form-group-login">
              <label htmlFor="login-email">Email:</label>
              <input 
                type="email" 
                id="login-email" 
                placeholder="NagyZoltan@gmail.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            <div className="form-group-login">
              <label htmlFor="login-password">Jelszó:</label>
              <div className="password-input-wrapper">
                <input 
                  type={showLoginPassword ? "text" : "password"}
                  id="login-password" 
                  placeholder="Jelszó"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
                {loginPassword.length > 0 && (
                  <button
                    type="button"
                    className="toggle-password-visibility"
                    onClick={() => setShowLoginPassword((prev) => !prev)}
                    aria-label={showLoginPassword ? "Jelszó elrejtése" : "Jelszó megjelenítése"}
                    aria-pressed={showLoginPassword}
                    disabled={isLoading}
                  >
                    <i className="bi bi-eye" aria-hidden="true"></i>
                  </button>
                )}
              </div>
            </div>
            <button 
              type="submit"
              className="create-account-login"
              disabled={isLoading}
            >
              {isLoading ? 'Bejelentkezés...' : 'Bejelentkezés!'}
            </button>
          </form>
        ) : (
          <form key="register-form" onSubmit={handleRegister}>
            <div className="form-group-login">
              <label htmlFor="register-fullName">Teljes Név:</label>
              <input 
                type="text" 
                id="register-fullName" 
                placeholder="Nagy Zoltán"
                value={registerFullName}
                onChange={(e) => setRegisterFullName(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            <div className="form-group-login">
              <label htmlFor="register-email">Email:</label>
              <input 
                type="email" 
                id="register-email" 
                placeholder="NagyZoltan@gmail.com"
                value={registerEmail}
                onChange={(e) => setRegisterEmail(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            <div className="form-group-login">
              <label htmlFor="register-password">Jelszó:</label>
              <div className="password-input-wrapper">
                <input 
                  type={showRegisterPassword ? "text" : "password"}
                  id="register-password" 
                  placeholder="Jelszó"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  disabled={isLoading}
                  required
                  minLength={6}
                />
                {registerPassword.length > 0 && (
                  <button
                    type="button"
                    className="toggle-password-visibility"
                    onClick={() => setShowRegisterPassword((prev) => !prev)}
                    aria-label={showRegisterPassword ? "Jelszó elrejtése" : "Jelszó megjelenítése"}
                    aria-pressed={showRegisterPassword}
                    disabled={isLoading}
                  >
                    <i className="bi bi-eye" aria-hidden="true"></i>
                  </button>
                )}
              </div>
            </div>
            <div className="form-group-login">
              <label htmlFor="register-confirmPassword">Jelszó Megerősítése:</label>
              <div className="password-input-wrapper">
                <input 
                  type={showRegisterConfirmPassword ? "text" : "password"}
                  id="register-confirmPassword" 
                  placeholder="Jelszó Megerősítése"
                  value={registerConfirmPassword}
                  onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  required
                  minLength={6}
                />
                {registerConfirmPassword.length > 0 && (
                  <button
                    type="button"
                    className="toggle-password-visibility"
                    onClick={() => setShowRegisterConfirmPassword((prev) => !prev)}
                    aria-label={showRegisterConfirmPassword ? "Jelszó elrejtése" : "Jelszó megjelenítése"}
                    aria-pressed={showRegisterConfirmPassword}
                    disabled={isLoading}
                  >
                    <i className="bi bi-eye" aria-hidden="true"></i>
                  </button>
                )}
              </div>
            </div>
            <button 
              type="submit"
              className="create-account-login"
              disabled={isLoading}
            >
              {isLoading ? 'Regisztrálás...' : 'Regisztrálok!'}
            </button>
          </form>
        )}
      </div>
      <Footer />
    </div>
  )
}
