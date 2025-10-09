import React from 'react'
import '../components/footer.css'

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
                    <a href="#">Főoldal</a>
                    <a href="#">Éttermek</a>
                    <a href="rolunk.html">Rólunk</a>
                    <a href="#">Kapcsolat</a>
                </div>
            </div>
            <div class="footer-section">
                <h3>Jogi</h3>
                <div class="footer-links">
                    <a href="#">ÁSZF</a>
                    <a href="#">Adatvédelem</a>
                    <a href="#">Cookie-k</a>
                </div>
            </div>
            <div class="footer-section">
                <h3>Közösségi média</h3>
                <div class="footer-links">
                    <a href="#">Facebook</a>
                    <a href="#">Instagram</a>
                    <a href="#">Twitter</a>
                </div>
            </div>
        </div>
        <div class="footer-bottom">
            © 2025 QuickBite. Minden jog fenntartva.
        </div>
    </footer>

  )
}
