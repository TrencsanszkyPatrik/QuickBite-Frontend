import React from 'react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import '../pages//components/css/homepage.css'
import 'leaflet/dist/leaflet.css';
import RestaurantMap from './components/RestaurantMap';
import '../../src/pages/components/css/CuisineList.css'
import RestaurantCardList from './components/RestaurantCardList';
import Benefits from './components/Benefits';
import Cousines from './components/Cousines';

document.title = "QuickBite - Főoldal";

export default function HomePage() {
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
                        <RestaurantMap />
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
            <Cousines />
            <RestaurantCardList />

            <Benefits />

            <Footer />
        </>
    )
}
