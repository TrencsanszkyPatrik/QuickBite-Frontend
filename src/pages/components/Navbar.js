import React from 'react'
import logo from '../../img/LOGO/logo.jpg'
import { Link } from 'react-router-dom'
import '../components/css/navbar.css'

export default function Navbar() {
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
                <Link to = "/kapcsolat">Kapcsolat</Link>
                <Link to = "/rolunk">Rólunk</Link>
                <Link to ="/ettermek">Éttermeink</Link>
                <Link to ="/velemenyek">Vásárlók véleményei</Link>
                <Link to ="/kosar"><button class="btn btn-secondary">Kosár</button></Link>
                <Link to ="/bejelentkezes"><button class="btn btn-primary">Bejelentkezés</button></Link>
            </div>
        </div>
    </header>

  )
}
