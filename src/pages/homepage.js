import React, { useState, useEffect } from 'react'
import Navbar from './components/navbar'
import Footer from './components/footer'
import '../pages//components/css/homepage.css'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import RestaurantMap from './components/RestaurantMap';
import '../../src/pages/components/css/CuisineList.css'
import RestaurantCardList from './components/RestaurantCardList';

const API_BASE_URL = 'https://localhost:7017/api';

document.title = "QuickBite - Főoldal";

export default function Homepage() {
    const [restaurants, setRestaurants] = useState([]);
    const [cuisines, setCuisines] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Éttermek betöltése
            const restaurantsResponse = await fetch(`${API_BASE_URL}/Restaurants`);
            if (restaurantsResponse.ok) {
                const restaurantsData = await restaurantsResponse.json();
                setRestaurants(restaurantsData);
            }

            // Konyhatípusok betöltése (ha van külön endpoint)
            try {
                const cuisinesResponse = await fetch(`${API_BASE_URL}/Cuisines`);
                if (cuisinesResponse.ok) {
                    const cuisinesData = await cuisinesResponse.json();
                    setCuisines(cuisinesData);
                } else {
                    // Ha nincs külön endpoint, dummy adatokat használunk
                    setCuisines([
                        { id: 1, name: 'Olasz', icon: '🍝' },
                        { id: 2, name: 'Ázsiai', icon: '🍜' },
                        { id: 3, name: 'Mexikói', icon: '🌮' },
                        { id: 4, name: 'Amerikai', icon: '🍔' },
                        { id: 5, name: 'Indiai', icon: '🍛' },
                        { id: 6, name: 'Mediterrán', icon: '🥙' }
                    ]);
                }
            } catch (cuisineErr) {
                console.warn('Konyhatípusok betöltési hiba, dummy adatok használata:', cuisineErr);
                setCuisines([
                    { id: 1, name: 'Olasz', icon: '🍝' },
                    { id: 2, name: 'Ázsiai', icon: '🍜' },
                    { id: 3, name: 'Mexikói', icon: '🌮' },
                    { id: 4, name: 'Amerikai', icon: '🍔' },
                    { id: 5, name: 'Indiai', icon: '🍛' },
                    { id: 6, name: 'Mediterrán', icon: '🥙' }
                ]);
            }
        } catch (err) {
            console.error('Hiba az adatok betöltésekor:', err);
        } finally {
            setLoading(false);
        }
    };

    // Konyhatípusokhoz tartozó éttermek számának kiszámítása
    const getCuisineRestaurantCount = (cuisineName) => {
        return restaurants.filter(restaurant => 
            restaurant.description && restaurant.description.toLowerCase().includes(cuisineName.toLowerCase())
        ).length;
    };

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
                <RestaurantMap restaurants={restaurants} />
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
                {loading ? (
                    <div className="loading">Betöltés...</div>
                ) : (
                    <div className="cuisines-grid">
                        {cuisines.map((cuisine) => (
                            <div key={cuisine.id} className="cuisine-card">
                                <div className="cuisine-icon">{cuisine.icon}</div>
                                <span className="cuisine-title">{cuisine.name}</span>
                                <span className="cuisine-meta">
                                    {getCuisineRestaurantCount(cuisine.name)} étterem
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <RestaurantCardList />

            <Footer />
        </>
    )
}
