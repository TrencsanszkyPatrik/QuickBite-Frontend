import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import '../styles/homepage.css'
import RestaurantCardList from '../components/RestaurantCardList'
import '../styles/CuisineList.css'
import '../styles/AllRestaurantPage.css'
import { usePageTitle } from '../utils/usePageTitle'
import { useLocation } from 'react-router-dom'
import { API_BASE } from '../utils/api'
import SpinnerOverlay from '../components/SpinnerOverlay'

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

export default function AllRestaurantPage({ favorites = [], pendingFavoriteIds, onToggleFavorite }) {
  usePageTitle('QuickBite - Éttermeink')
  const location = useLocation()
  const categoryButtonsRef = useRef(null)
  const [showDiscountOnly, setShowDiscountOnly] = useState(false)
  const [showFreeDeliveryOnly, setShowFreeDeliveryOnly] = useState(false)
  const [showCardPaymentOnly, setShowCardPaymentOnly] = useState(false)
  const [showOpenNowOnly, setShowOpenNowOnly] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchSuggestions, setSearchSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [allRestaurants, setAllRestaurants] = useState([])
  const [selectedCategoryId, setSelectedCategoryId] = useState(null)
  const [categories, setCategories] = useState([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [isLoadingRestaurants, setIsLoadingRestaurants] = useState(true)
  const [categoryScrollValue, setCategoryScrollValue] = useState(0)
  const [categoryScrollMax, setCategoryScrollMax] = useState(0)
  const hasAppliedUrlFilters = useRef(false)

  const syncCategoryScrollState = () => {
    const el = categoryButtonsRef.current
    if (!el) return
    const maxScroll = Math.max(0, el.scrollWidth - el.clientWidth)
    setCategoryScrollMax(maxScroll)
    setCategoryScrollValue(Math.min(el.scrollLeft, maxScroll))
  }

  useEffect(() => {
    const loadRestaurantCategories = async () => {
      try {
        const response = await axios.get(`${API_BASE}/Categories`)
        const data = response.data || []
        setCategories(data)
      } catch (err) {
        console.error('Hiba történt a kategóriák betöltése közben:', err)
      } finally {
        setIsLoadingCategories(false)
      }
    }

    const loadRestaurants = async () => {
      try {
        setIsLoadingRestaurants(true)
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
        setAllRestaurants(mapped)
      } catch (err) {
        console.error('Hiba történt az éttermek betöltése közben:', err)
      } finally {
        setIsLoadingRestaurants(false)
      }
    }

    loadRestaurantCategories()
    loadRestaurants()
  }, [])

  useEffect(() => {
    // URL paraméterek kezelése a főoldali keresőből:
    // /ettermek?cim=miskolc&konyha=olasz
    // Ha "konyha" van megadva (pl. "olasz"), akkor ugyanaz történjen,
    // mintha az "Olasz" kategória gombra kattintott volna a user:
    // -> beállítjuk a megfelelő kategória ID-t.
    //
    // Ha csak "cim" van (pl. "miskolc"), akkor azt írjuk be a keresőmezőbe.

    if (hasAppliedUrlFilters.current) return

    const params = new URLSearchParams(location.search)
    const rawCuisine = params.get('konyha') || ''
    const rawAddress = params.get('cim') || ''

    const cuisine = rawCuisine.trim()
    const address = rawAddress.trim()

    // 1) Konyha paraméter -> kategória gomb kiválasztása (pl. "Olasz")
    if (cuisine && categories.length > 0) {
      const lowerCuisine = cuisine.toLowerCase()

      const matchedCategory = categories.find((cat) =>
        cat.name?.toLowerCase() === lowerCuisine
      )

      if (matchedCategory) {
        setSelectedCategoryId(matchedCategory.id)
        hasAppliedUrlFilters.current = true
        return
      }
    }

    // 2) Ha nem találtunk ilyen kategóriát, de van cím -> szabad szöveges keresésre használjuk
    if (address && !hasAppliedUrlFilters.current) {
      setSearchQuery(address)
      hasAppliedUrlFilters.current = true
    }
  }, [location.search, categories])

  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchSuggestions([])
      setShowSuggestions(false)
      return
    }

    const suggestions = new Set()
    const query = searchQuery.toLowerCase()

    // Étterem adatok alapján
    allRestaurants.forEach(restaurant => {
      if (restaurant.name.toLowerCase().includes(query)) {
        suggestions.add(`Étterem: ${restaurant.name}`)
      }
      if (restaurant.address.toLowerCase().includes(query)) {
        suggestions.add(`Cím: ${restaurant.address}`)
      }
      if (restaurant.city?.toLowerCase().includes(query)) {
        suggestions.add(`Város: ${restaurant.city}`)
      }
    })

    setSearchSuggestions(Array.from(suggestions).slice(0, 4)) 
    setShowSuggestions(true)
  }, [searchQuery, allRestaurants])

  useEffect(() => {
    syncCategoryScrollState()

    const el = categoryButtonsRef.current
    if (!el) return

    const handleScroll = () => {
      setCategoryScrollValue(el.scrollLeft)
    }

    const handleResize = () => {
      syncCategoryScrollState()
    }

    el.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleResize)

    return () => {
      el.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize)
    }
  }, [categories])

  const handleCategorySliderChange = (e) => {
    const el = categoryButtonsRef.current
    if (!el) return

    const value = Number(e.target.value)
    el.scrollTo({ left: value, behavior: 'auto' })
    setCategoryScrollValue(value)
  }

  return (
    <>
      <Navbar />
      {(isLoadingCategories || isLoadingRestaurants) && (
        <SpinnerOverlay label="Adatok betöltése..." />
      )}
      <div className="all-restaurants-page container">
        <h1 className="section-title" style={{ marginTop: "1rem" }}>
          Böngéssz éttermeket, vagy keress kedvenceidre!
        </h1>

        <div className="restaurant-filters">
          <div className="search-container">
            <input
              type="text"
              className="restaurant-search"
              placeholder="Keress név, cím, város alapján..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.trim().length >= 2 && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setShowSuggestions(false)
                }
              }}
            />
            {showSuggestions && searchSuggestions.length > 0 && (
              <div className="search-suggestions">
                {searchSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="search-suggestion-item"
                    onClick={() => {
                      const cleanQuery = suggestion.replace(/^[^\s]+\s/, '')
                      setSearchQuery(cleanQuery)
                      setShowSuggestions(false)
                    }}
                  >
                    {suggestion}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="filter-options">
            <button
              className={`filter-btn ${showFreeDeliveryOnly ? 'selected' : ''}`}
              onClick={() => setShowFreeDeliveryOnly(!showFreeDeliveryOnly)}
            >
              Ingyenes kiszállítás
            </button>

            <button
              className={`filter-btn ${showCardPaymentOnly ? 'selected' : ''}`}
              onClick={() => setShowCardPaymentOnly(!showCardPaymentOnly)}
            >
              Bankkártyás fizetés
            </button>

            <button
              className={`filter-btn ${showDiscountOnly ? 'selected' : ''}`}
              onClick={() => setShowDiscountOnly(!showDiscountOnly)}
            >
              Akciós ajánlatok
            </button>

            <button
              className={`filter-btn ${showOpenNowOnly ? 'selected' : ''}`}
              onClick={() => setShowOpenNowOnly(!showOpenNowOnly)}
            >
              Nyitva most
            </button>
          </div>

          <div className="category-filter">
            <div className="category-scroll-wrapper">
              <button
                className="category-scroll-arrow left"
                onClick={() => {
                  const el = categoryButtonsRef.current
                  if (el) el.scrollBy({ left: -220, behavior: 'smooth' });
                }}
                aria-label="Balra görgetés"
              >
                <i className="bi bi-arrow-left-circle"></i>
              </button>
              <div className="category-buttons" tabIndex={0} ref={categoryButtonsRef}>
                <button
                  className={`category-btn ${selectedCategoryId === null ? 'selected' : ''}`}
                  onClick={() => setSelectedCategoryId(null)}
                >
                  Összes
                </button>
                {!isLoadingCategories && categories.map((category) => (
                  <button
                    key={category.id}
                    className={`category-btn ${selectedCategoryId === category.id ? 'selected' : ''}`}
                    onClick={() => setSelectedCategoryId(
                      selectedCategoryId === category.id ? null : category.id
                    )}
                  >
                    <span className="category-icon">{category.icon}</span>
                    <span className="category-name">{category.name}</span>
                  </button>
                ))}
              </div>
              <button
                className="category-scroll-arrow right"
                onClick={() => {
                  const el = categoryButtonsRef.current
                  if (el) el.scrollBy({ left: 220, behavior: 'smooth' });
                }}
                aria-label="Jobbra görgetés"
              >
                <i className="bi bi-arrow-right-circle"></i>
              </button>
            </div>
            {categoryScrollMax > 0 && (
              <div className="category-slider-wrap">
                <input
                  type="range"
                  className="category-scroll-slider"
                  min={0}
                  max={categoryScrollMax}
                  step={1}
                  value={categoryScrollValue}
                  onChange={handleCategorySliderChange}
                  aria-label="Kategória lista görgetése"
                />
              </div>
            )}
          </div>
        </div>

        <div style={{ marginTop: "2rem" }}>
          <RestaurantCardList
            restaurants={allRestaurants}
            showDiscountOnly={showDiscountOnly}
            showFreeDeliveryOnly={showFreeDeliveryOnly}
            showCardPaymentOnly={showCardPaymentOnly}
            showOpenNowOnly={showOpenNowOnly}
            selectedCuisineId={selectedCategoryId}
            searchQuery={searchQuery}
            favorites={favorites}
            pendingFavoriteIds={pendingFavoriteIds}
            onToggleFavorite={onToggleFavorite}
            menuItems={[]}
            isLoading={false}
          />
        </div>
      </div>

      <Footer />
    </>
  )
}
