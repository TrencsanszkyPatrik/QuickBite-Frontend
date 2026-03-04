import React, { useState, useEffect } from 'react'
import axios from 'axios'
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
import SpinnerOverlay from '../components/SpinnerOverlay';
import { usePageTitle } from '../utils/usePageTitle';
import { API_BASE } from '../utils/api';

const parseTimeToMinutes = (timeValue) => {
    if (!timeValue) return null
    const normalized = String(timeValue).slice(0, 8)
    const [hour, minute] = normalized.split(':').map(Number)
    if (Number.isNaN(hour) || Number.isNaN(minute)) return null
    return (hour * 60) + minute
}

const isRestaurantOpenNow = (openingTime, closingTime) => {
    const openMinutes = parseTimeToMinutes(openingTime)
    const closeMinutes = parseTimeToMinutes(closingTime)

    if (openMinutes === null || closeMinutes === null) {
        return true
    }

    const now = new Date()
    const currentMinutes = (now.getHours() * 60) + now.getMinutes()

    if (openMinutes <= closeMinutes) {
        return currentMinutes >= openMinutes && currentMinutes < closeMinutes
    }

    return currentMinutes >= openMinutes || currentMinutes < closeMinutes
}

export default function HomePage({ favorites = [], pendingFavoriteIds, onToggleFavorite }) {
    usePageTitle("QuickBite - Főoldal");
    const navigate = useNavigate()
    const [selectedCuisineId, setSelectedCuisineId] = useState(null)
    const [isScrolled, setIsScrolled] = useState(false)
    const [heroAddress, setHeroAddress] = useState("")
    const [heroQuery, setHeroQuery] = useState("")
    const [restaurants, setRestaurants] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const loadRestaurantData = async () => {
            try {
                const response = await axios.get(`${API_BASE}/Restaurants`)
                const data = response.data || []
                const mapped = data.map((r) => ({
                    ...r,
                    id: String(r.id),
                    address: `${r.city}, ${r.address}`,
                    img: r.image_url,
                    freeDelivery: r.free_delivery,
                    acceptCards: r.accept_cards,
                    openingTime: r.opening_time,
                    closingTime: r.closing_time,
                    isOpen: r.is_open !== undefined
                        ? r.is_open
                        : isRestaurantOpenNow(r.opening_time, r.closing_time)
                }))
                setRestaurants(mapped)
            } catch (err) {
            } finally {
                setIsLoading(false)
            }
        }
        loadRestaurantData()
    }, [])

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
            {isLoading && <SpinnerOverlay label="Éttermek betöltése..." />}

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
                    restaurants={restaurants}
                    selectedCuisineId={selectedCuisineId}
                    favorites={favorites}
                    pendingFavoriteIds={pendingFavoriteIds}
                    onToggleFavorite={onToggleFavorite}
                    limit={4}
                    skip={Math.max(0, restaurants.length - 4)}
                    isLoading={isLoading}
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