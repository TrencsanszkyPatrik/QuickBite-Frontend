import React from 'react'
import '../components/css/footer.css'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className='footer'>
        <div className="footer-content">
            <div class="footer-section">
                <h3>QuickBite</h3>
                <p>A leggyorsabb és legmegbízhatóbb ételkiszállítási szolgáltatás a városban. Rendelj percek alatt!</p>
            </div>
            <div class="footer-section">
                <h3>Linkek</h3>
                <div class="footer-links">
                    <Link to = "/">Főoldal</Link>
                    <Link to = "/ettermek">Éttermek</Link>
                    <Link to ="/rolunk">Rólunk</Link>
                    <Link to = "/kapcsolat">Kapcsolat</Link>
                </div>
            </div>
            <div class="footer-section">
                <h3>Jogi</h3>
                <div class="footer-links">
                    <Link to = "/aszf">ÁSZF</Link>
                    <Link to = "/privacy">Adatvédelem</Link>
                    <Link to = "/cookies">Cookie-k</Link>
                </div>
            </div>
            <div class="footer-section">
                <h3>Közösségi média</h3>
                <div class="footer-links">
                    <a href="https://www.facebook.com" target='_blank' rel="noopener noreferrer"><i class="bi bi-facebook"></i> Facebook</a>
                    <a href="https://www.instagram.com" target='_blank' rel="noopener noreferrer"><i class="bi bi-instagram"></i> Instagram</a>
                    <a href="https://x.com" target='_blank' rel="noopener noreferrer"><i class="bi bi-twitter-x"></i> Twitter</a>
                </div>
            </div>
        </div>
        <div class="footer-bottom">
            © 2026 QuickBite. Minden jog fenntartva.
        </div>
    </footer>

  )
}
