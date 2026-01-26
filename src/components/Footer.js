import React from 'react'
import '../styles/footer.css'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className='footer'>
        <div className="footer-content">
            <div className="footer-section">
                <h3>QuickBite</h3>
                <p>A leggyorsabb és legmegbízhatóbb ételkiszállítási szolgáltatás a városban. Rendelj percek alatt!</p>
            </div>
            <div className="footer-section">
                <h3>Linkek</h3>
                <div className="footer-links">
                    <Link to = "/">Főoldal</Link>
                    <Link to = "/ettermek">Éttermek</Link>
                    <Link to ="/rolunk">Rólunk</Link>
                    <Link to = "/kapcsolat">Kapcsolat</Link>
                </div>
            </div>
            <div className="footer-section">
                <h3>Jogi</h3>
                <div className="footer-links">
                    <Link to = "/aszf">ÁSZF</Link>
                    <Link to = "/adatvedelem">Adatvédelem</Link>
                    <Link to = "/sütik">Cookie-k</Link>
                </div>
            </div>
            <div className="footer-section">
                <h3>Közösségi média</h3>
                <div className="footer-links">
                    <a href="https://www.facebook.com" target='_blank' rel="noopener noreferrer"><i className="bi bi-facebook"></i> Facebook</a>
                    <a href="https://www.instagram.com" target='_blank' rel="noopener noreferrer"><i className="bi bi-instagram"></i> Instagram</a>
                    <a href="https://x.com" target='_blank' rel="noopener noreferrer"><i className="bi bi-twitter-x"></i> Twitter</a>
                </div>
            </div>
        </div>
        <div className="footer-bottom">
            © 2026 QuickBite. Minden jog fenntartva.
        </div>
    </footer>

  )
}
