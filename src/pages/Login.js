import React, { useState } from 'react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import "../pages/components/css/login.css"
import { usePageTitle } from '../utils/usePageTitle';

export default function Login() {
  usePageTitle("QuickBite - Bejelentkezés");
  const [isLogin, setIsLogin] = useState(true)

  return (
    <div className="login-page">
        <Navbar/>
    <div className="container-login">
        <h1>QuickBite</h1>
        <p>{isLogin ? 'Jelentkezz be a könnyebb rendelésért!' : 'Regisztrálj, hogy máris rendelhess!'}</p>
        <div className="buttons-login">
            <button 
              className={isLogin ? "login-login active" : "login-login"}
              onClick={() => setIsLogin(true)}
            >
              Bejelentkezés
            </button>
            <button 
              className={isLogin ? "register-login" : "register-login active"}
              onClick={() => setIsLogin(false)}
            >
              Regisztráció
            </button>
        </div>
        
        {isLogin ? (
          <div key="login-form">
            <div className="form-group-login">
              <label htmlFor="email">Email:</label>
              <input type="email" id="email" placeholder="NagyZoltan@gmail.com"/>
            </div>
            <div className="form-group-login">
              <label htmlFor="password">Jelszó:</label>
              <input type="password" id="password" placeholder="Jelszó"/>
            </div>
            <button className="create-account-login">Bejelentkezés!</button>
          </div>
        ) : (
          <div key="register-form">
            <div className="form-group-login">
              <label htmlFor="fullName">Teljes Név:</label>
              <input type="text" id="fullName" placeholder="Nagy Zoltán"/>
            </div>
            <div className="form-group-login">
              <label htmlFor="email">Email:</label>
              <input type="email" id="email" placeholder="NagyZoltan@gmail.com"/>
            </div>
            <div className="form-group-login">
              <label htmlFor="password">Jelszó:</label>
              <input type="password" id="password" placeholder="Jelszó"/>
            </div>
            <div className="form-group-login">
              <label htmlFor="confirmPassword">Jelszó Megerősítése:</label>
              <input type="password" id="confirmPassword" placeholder="Jelszó Megerősítése"/>
            </div>
            <button className="create-account-login">Regisztrálok!</button>
          </div>
        )}
    </div>
    <Footer/>
    </div>

  )
}
