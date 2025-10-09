import React from 'react'
import Navbar from './components/navbar'
import Footer from './components/footer'
import '../pages//components/css/homepage.css'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import RestaurantMap from './components/RestaurantMap';
import '../../src/pages/components/css/CuisineList.css'
import RestaurantCardList from './components/RestaurantCardList';

document.title = "QuickBite - Főoldal";

export default function Homepage() {
    return (
        <>
            <Navbar />

            <section className="hero">
                <div className="hero-content">
                    <h1>Éhes vagy? Rendelj most! 🚀</h1>
                    <p>Fedezd fel a környék legjobb éttermeit és élvezd a gyors kiszállítást.</p>

                    <div className="hero-search">
                        <input type="text" placeholder="📍 Add meg a címed" />
                        <input type="text" placeholder="🍕 Mit keresel?" />
                        <button className="btn btn-primary">Keresés</button>
                    </div>

                    <div className="categories-pills">
                        <div className="pill">🍕 Pizza</div>
                        <div className="pill">🍔 Burger</div>
                        <div className="pill">🍣 Sushi</div>
                        <div className="pill">🌮 Mexikói</div>
                        <div className="pill">🍝 Tészta</div>
                    </div>
                </div>
            </section>

            <div className="container">
                <RestaurantMap />
            </div>

            <div className="container">
                <div className="benefits">
                    <div className="benefit-card">
                        <div className="benefit-icon">⭐</div>
                        <h3>Legjobb éttermek</h3>
                        <p>Csak ellenőrzött, magas minőségű éttermekkel dolgozunk. Minden vendéglátóhely megfelel a legszigorúbb követelményeknek.</p>
                    </div>
                    <div className="benefit-card">
                        <div className="benefit-icon">⚡</div>
                        <h3>Villámgyors szállítás</h3>
                        <p>30 percen belül kiszállítjuk az ételedet. Valós idejű követéssel mindig tudod, hol jár a futár.</p>
                    </div>
                    <div className="benefit-card">
                        <div className="benefit-icon">💳</div>
                        <h3>Biztonságos fizetés</h3>
                        <p>Fizetés készpénzzel, bankkártyával vagy online. Minden tranzakció biztonságos és védett.</p>
                    </div>
                </div>
            </div>

            <div className="container">
                <h2 className="section-title">Böngéssz konyhatípus szerint</h2>
                <div className="cuisines-grid">
                    <div className="cuisine-card">
                        <div className="cuisine-icon">🍝</div>
                        <span className="cuisine-title">Olasz</span>
                        <span className="cuisine-meta">23 étterem</span>
                    </div>
                    <div className="cuisine-card">
                        <div className="cuisine-icon">🍜</div>
                        <span className="cuisine-title">Ázsiai</span>
                        <span className="cuisine-meta">31 étterem</span>
                    </div>
                    <div className="cuisine-card">
                        <div className="cuisine-icon">🌮</div>
                        <span className="cuisine-title">Mexikói</span>
                        <span className="cuisine-meta">18 étterem</span>
                    </div>
                    <div className="cuisine-card">
                        <div className="cuisine-icon">🍔</div>
                        <span className="cuisine-title">Amerikai</span>
                        <span className="cuisine-meta">27 étterem</span>
                    </div>
                    <div className="cuisine-card">
                        <div className="cuisine-icon">🍛</div>
                        <span className="cuisine-title">Indiai</span>
                        <span className="cuisine-meta">15 étterem</span>
                    </div>
                    <div className="cuisine-card">
                        <div className="cuisine-icon">🥙</div>
                        <span className="cuisine-title">Mediterrán</span>
                        <span className="cuisine-meta">12 étterem</span>
                    </div>
                </div>
            </div>

            <RestaurantCardList />

            <Footer />
        </>
    )
}
