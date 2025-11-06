import React from 'react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import "../pages/components/css/login.css"
import { Link } from 'react-router-dom'

export default function Login() {
  return (
    <div>
        <Navbar/>
    <div className="container-login">
        <h1>QuickBite</h1>
        <p>Jelentkezz be a könnyebb rendelésért!</p>
        <div className="buttons-login">
            <button className="login-login active">Bejelentkezés</button>
            <Link to ="/register"><a><button className="register-login">Regisztráció</button></a></Link>
        </div>
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
    <Footer/>
    </div>

  )
}
