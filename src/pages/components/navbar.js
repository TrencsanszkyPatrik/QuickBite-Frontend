import React from 'react'
import logo from '../../img/LOGO/logo.jpg'
import '../components/navbar.css'

export default function Navbar() {
  return (
    
    <header>
        <div class="header-content">
            <div class="logo">
                <img class="logo-img" src={logo} alt="QuickBite logó" />
                <span>QuickBite</span>
            </div>
            <div class="search-container">
                <div class="search-box">
                    <span class="search-icon">🔍</span>
                    <input type="text" placeholder="Keress étteremre vagy ételre..." />
                </div>
            </div>
            <div class="header-actions">
                <a href="kosar.html"><button class="btn btn-secondary">🛒 Kosár</button></a>
                <a href="login.html"><button class="btn btn-primary">Bejelentkezés</button></a>
            </div>
        </div>
    </header>

  )
}
