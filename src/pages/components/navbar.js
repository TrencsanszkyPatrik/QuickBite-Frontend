import React from 'react'
import logo from '../../img/LOGO/logo.jpg'
import { Link } from 'react-router-dom'
import '../components/css/navbar.css'

export default function Navbar() {
  return (
    
    <header>
        <div class="header-content">
            <div class="logo">
                <img class="logo-img" src={logo} alt="QuickBite logó" />
                <span>QuickBite</span>
            </div>
            
            <div class="header-actions">
                <Link to = "/about">Rólunk</Link>
                <Link to ="/restaurants">Éttermeink</Link>
                <a href="kosar.html"><button class="btn btn-secondary">🛒 Kosár</button></a>
                <a href="login.html"><button class="btn btn-primary">Bejelentkezés</button></a>
            </div>
        </div>
    </header>

  )
}
