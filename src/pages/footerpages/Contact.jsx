import React from 'react'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import '../../styles/contact.css'
import { usePageTitle } from '../../utils/usePageTitle';

export default function Contact() {
    usePageTitle("QuickBite - Kapcsolat");
    return (
        <>
            <Navbar />
            <main className="contact-page">
                <section className="contact-hero">
                    <div className="contact-hero-content">
                        <div className="contact-hero-text">
                            <span className="contact-kicker">Kapcsolat</span>
                            <h1>Írj nekünk, gyorsan válaszolunk.</h1>
                            <p>
                                Ügyfélszolgálat, partnerség vagy visszajelzés? Itt vagyunk,
                                és segítünk. A legtöbb megkeresésre még aznap válaszolunk.
                            </p>
                            <div className="contact-hero-metrics">
                                <div className="contact-metric">
                                    <span className="metric-value">2 óra</span>
                                    <span className="metric-label">Átlagos válaszidő</span>
                                </div>
                                <div className="contact-metric">
                                    <span className="metric-value">12 000+</span>
                                    <span className="metric-label">Megoldott ügy</span>
                                </div>
                                <div className="contact-metric">
                                    <span className="metric-value">4,9/5</span>
                                    <span className="metric-label">Ügyfél elégedettség</span>
                                </div>
                            </div>
                        </div>
                        <div className="contact-card">
                            <div className="contact-card-header">
                                <h2>Gyors elérés</h2>
                                <p>Ha azonnali segítség kell, itt találsz minket.</p>
                            </div>
                            <ul className="contact-card-list">
                                <li>
                                    <span className="contact-chip">Telefon</span>
                                    <strong>+36 30 123 4567</strong>
                                    <span>H-P 9:00-18:00</span>
                                </li>
                                <li>
                                    <span className="contact-chip">Email</span>
                                    <strong>hello@quickbite.hu</strong>
                                    <span>24/7 jegykezelés</span>
                                </li>
                                <li>
                                    <span className="contact-chip">Cím</span>
                                    <strong>3525 Miskolc</strong>
                                    <span>Palóczy László utca 3.</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>

                <section className="contact-main">
                    <div className="contact-grid">
                        <form className="contact-form">
                            <div className="contact-form-header">
                                <h2>Írj üzenetet</h2>
                                <p>Mondd el, miben segíthetünk, és visszajelzünk.</p>
                            </div>
                            <div className="contact-field-group">
                                <label htmlFor="contact-name">Név</label>
                                <input id="contact-name" type="text" placeholder="Nagy Zoltán" />
                            </div>
                            <div className="contact-field-group">
                                <label htmlFor="contact-email">Email</label>
                                <input id="contact-email" type="email" placeholder="zoltan@gmail.com" />
                            </div>
                            <div className="contact-field-group">
                                <label htmlFor="contact-topic">Téma</label>
                                <select id="contact-topic" defaultValue="support">
                                    <option value="support">Rendeléssel kapcsolatos kérdés</option>
                                    <option value="partner">Éttermeknek / partneri kérdés</option>
                                    <option value="billing">Számlázás</option>
                                    <option value="feedback">Visszajelzés</option>
                                </select>
                            </div>
                            <div className="contact-field-group">
                                <label htmlFor="contact-message">Üzenet</label>
                                <textarea
                                    id="contact-message"
                                    placeholder="Írd le röviden a kérdésed..."
                                />
                            </div>
                            <button type="submit" className="contact-submit">
                                Küldés
                            </button>
                        </form>

                        <div className="contact-actions">
                            <div className="contact-action-card">
                                <h3>Éttermeknek</h3>
                                <p>Csatlakoznál a QuickBite-hoz? Küldünk egy részletes ajánlatot.</p>
                                <button type="button" className="contact-action-btn">Partneri csomag</button>
                            </div>
                            <div className="contact-action-card">
                                <h3>Kiszállítási probléma</h3>
                                <p>Ha valami nem stimmel a rendeléseddel, gyorsan intézzük.</p>
                                <button type="button" className="contact-action-btn">Hibabejelentés</button>
                            </div>
                            <div className="contact-action-card">
                                <h3>Visszajelzés</h3>
                                <p>Mondd el, min javítsunk. Minden ötlet számít.</p>
                                <button type="button" className="contact-action-btn">Javaslat küldése</button>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    )
}