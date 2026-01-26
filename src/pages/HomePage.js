import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import '../styles/homepage.css'
import 'leaflet/dist/leaflet.css';
import RestaurantMap from '../components/RestaurantMap';
import '../styles/CuisineList.css'
import RestaurantCardList from '../components/RestaurantCardList';
import Benefits from '../components/Benefits';
import Cousines from '../components/Cousines';
import BackToTopButton from '../components/BackToTopButton.js';
import FloatingOpinions from '../components/FloatingOpinions';
import { usePageTitle } from '../utils/usePageTitle';

export default function HomePage({ favorites = [], onToggleFavorite }) {
    usePageTitle("QuickBite - Főoldal");
    const navigate = useNavigate()
    const [selectedCuisineId, setSelectedCuisineId] = useState(null)
    const [isScrolled, setIsScrolled] = useState(false)
    const [heroAddress, setHeroAddress] = useState("")
    const [heroQuery, setHeroQuery] = useState("")

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY
            const heroHeight = window.innerHeight
            setIsScrolled(currentScrollY > heroHeight * 0.05)
        }

        handleScroll()
        
        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const handleSelectCuisine = (id) => {
        setSelectedCuisineId((current) => (current === id ? null : id))
    }

    const handleHeroSearch = () => {
        const params = new URLSearchParams()
        if (heroAddress.trim()) params.set('cim', heroAddress.trim())
        if (heroQuery.trim()) params.set('konyha', heroQuery.trim())
        navigate(`/ettermek${params.toString() ? `?${params.toString()}` : ''}`)
    }

    return (
        <>
            <Navbar />

            <section className={`hero ${isScrolled ? 'hero-scrolled' : ''}`}>
                <div className="hero-content">
                    <div className="hero-layout">
                        <div className="hero-left">
                            <div className="hero-text">
                                <h1>Éhes vagy? Rendelj most!🚀</h1>
                                <p>Fedezd fel a környék legjobb éttermeit és élvezd a gyors kiszállítást.</p>
                            </div>
                            <div className="hero-search">
                                <input 
                                    type="text" 
                                    placeholder="📍 Add meg a címed" 
                                    value={heroAddress}
                                    onChange={(e) => setHeroAddress(e.target.value)}
                                />
                                <input 
                                    type="text" 
                                    placeholder="🍕 Mit keresel?" 
                                    value={heroQuery}
                                    onChange={(e) => setHeroQuery(e.target.value)}
                                />
                                <button 
                                    className="btn btn-primary"
                                    onClick={handleHeroSearch}
                                >
                                    Keresés
                                </button>
                                <RestaurantMap />
                            </div>
                        </div>
                        <div className="hero-right">
                            <FloatingOpinions />
                        </div>
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
                            <span className="stat-text">Átlagos értékélés</span>
                        </div>
                    </div>
                </div>
            </section>

            <div className={`main-content ${isScrolled ? 'main-content-visible' : ''}`}>
                <h1 className="section-title">Válassz kiemelkedő éttermeink közül!</h1>
                <RestaurantCardList
                    selectedCuisineId={selectedCuisineId}
                    favorites={favorites}
                    onToggleFavorite={onToggleFavorite}
                    limit={4}
                />
                <div className="view-all-restaurants-container">
                    <Link to="/ettermek" className="btn btn-primary view-all-btn">
                        Összes étterem megtekintése
                    </Link>
                </div>
                <Benefits />
                <Footer />
            </div>
            <BackToTopButton />
        </>
    )
}
