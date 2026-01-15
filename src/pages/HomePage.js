import React, { useState } from 'react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import '../pages//components/css/homepage.css'
import 'leaflet/dist/leaflet.css';
import RestaurantMap from './components/RestaurantMap';
import '../../src/pages/components/css/CuisineList.css'
import RestaurantCardList from './components/RestaurantCardList';
import Benefits from './components/Benefits';
import Cousines from './components/Cousines';
import BackToTopButton from './components/BackToTopButton.js';
import FloatingOpinions from './components/FloatingOpinions';

document.title = "QuickBite - Főoldal";

export default function HomePage({ favorites = [], onToggleFavorite }) {
    const [selectedCuisineId, setSelectedCuisineId] = useState(null)

    const handleSelectCuisine = (id) => {
        setSelectedCuisineId((current) => (current === id ? null : id))
    }

    return (
        <>
            <Navbar />

            <section className="hero">
                <div className="hero-content">
                    <h1>Éhes vagy? Rendelj most! 🚀</h1>
                    <p>Fedezd fel a környék legjobb éttermeit és élvezd a gyors kiszállítást.</p>

                    <div style={{display: 'flex', gap: '2rem', alignItems: 'flex-start', flexWrap: 'wrap'}}>
                        <div className="hero-search">
                            <input type="text" placeholder="📍 Add meg a címed" />
                            <input type="text" placeholder="🍕 Mit keresel?" />
                            <button className="btn btn-primary">Keresés</button>
                            <RestaurantMap />
                        </div>
                        <FloatingOpinions />
                    </div>
                    <div className="stats-container">
            <div className="stat-item">
                <span className="stat-number">50+</span>
                <span className="stat-text">Partner étterem</span>
            </div>
            <div className="stat-item">
                <span className="stat-number">10 000+</span>
                <span className="stat-text">Elégedett vásárló</span>
            </div>
            <div className="stat-item">
                <span className="stat-number">1 000 000+</span>
                <span className="stat-text">Kiszállított rendelés</span>
            </div>
            <div className="stat-item">
                <span className="stat-number">4,8</span>
                <span className="stat-text">Átlagos értékelés</span>
            </div>
            
        </div>
                </div>
                
            </section>

            <Cousines
                selectedCuisineId={selectedCuisineId}
                onSelectCuisine={handleSelectCuisine}
            />
            <h1 className="section-title">Válassz kiemelkedő éttermeink közül!</h1>
            <RestaurantCardList
                selectedCuisineId={selectedCuisineId}
                favorites={favorites}
                onToggleFavorite={onToggleFavorite}
            />
            <Benefits />
            <Footer />
            <BackToTopButton />
        </>
    )
}
