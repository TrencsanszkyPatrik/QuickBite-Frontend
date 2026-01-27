import React, { useState, useEffect, useRef } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import '../styles/homepage.css'
import RestaurantCardList from '../components/RestaurantCardList'
import '../styles/CuisineList.css'
import '../styles/AllRestaurantPage.css'
import { usePageTitle } from '../utils/usePageTitle'
import { useLocation } from 'react-router-dom'
import { API_BASE } from '../utils/api'

export default function AllRestaurantPage({ favorites = [], onToggleFavorite }) {
  usePageTitle('QuickBite - Éttermeink')
  const location = useLocation()
  const [showDiscountOnly, setShowDiscountOnly] = useState(false)
  const [showFreeDeliveryOnly, setShowFreeDeliveryOnly] = useState(false)
  const [showCardPaymentOnly, setShowCardPaymentOnly] = useState(false)
  const [showOpenNowOnly, setShowOpenNowOnly] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchSuggestions, setSearchSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [allRestaurants, setAllRestaurants] = useState([])
  const [allMenuItems, setAllMenuItems] = useState([])
  const [selectedCategoryId, setSelectedCategoryId] = useState(null)
  const [categories, setCategories] = useState([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const hasAppliedUrlFilters = useRef(false)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_BASE}/Categories`)
        if (!response.ok) {
          throw new Error('Nem sikerült betölteni a kategóriákat.');
        }
        const data = await response.json()
        setCategories(data)
      } catch (err) {
        console.error('Hiba történt a kategóriák betöltése közben:', err)
      } finally {
        setIsLoadingCategories(false)
      }
    }

    const fetchRestaurants = async () => {
      try {
        const response = await fetch(`${API_BASE}/Restaurants`)
        if (!response.ok) {
          throw new Error('Nem sikerült betölteni az éttermeket.')
        }
        const data = await response.json()
        const mapped = data.map((r) => ({
          ...r,
          id: String(r.id),
          address: `${r.city}, ${r.address}`,
          img: r.image_url,
          freeDelivery: r.free_delivery,
          acceptCards: r.accept_cards
        }))
        setAllRestaurants(mapped)
      } catch (err) {
        console.error('Hiba történt az éttermek betöltése közben:', err)
      }
    }

    const fetchMenuItems = async () => {
      try {
        const response = await fetch(`${API_BASE}/MenuItems`)
        if (!response.ok) {
          throw new Error('Nem sikerült betölteni a menü tételeket.')
        }
        const data = await response.json()
        console.log('Menu items loaded:', data.length)
        setAllMenuItems(data)
      } catch (err) {
        console.error('Hiba történt a menü tételek betöltése közben:', err)
      }
    }

    fetchCategories()
    fetchRestaurants()
    fetchMenuItems()
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
      if (restaurant.cuisine?.toLowerCase().includes(query)) {
        suggestions.add(`Típus: ${restaurant.cuisine}`)
      }
      if (restaurant.city?.toLowerCase().includes(query)) {
        suggestions.add(`Város: ${restaurant.city}`)
      }
    })

    // Étel nevek alapján
    allMenuItems.forEach(item => {
      if (item.name.toLowerCase().includes(query)) {
        suggestions.add(`Étel: ${item.name}`)
      }
    })

    setSearchSuggestions(Array.from(suggestions).slice(0, 10)) 
    setShowSuggestions(true)
  }, [searchQuery, allRestaurants, allMenuItems])

  return (
    <>
      <Navbar />
      <div className="all-restaurants-page container">
        <h1 className="section-title" style={{ marginTop: "1rem" }}>
          Böngéssz éttermeket, vagy keress kedvenceidre!
        </h1>

        <div className="restaurant-filters">
          <div className="search-container">
            <input
              type="text"
              className="restaurant-search"
              placeholder="Keress név, cím, típus vagy étel alapján..."
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
            <div className="category-buttons">
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
          </div>
        </div>

        <div style={{ marginTop: "2rem" }}>
          <RestaurantCardList
            showDiscountOnly={showDiscountOnly}
            showFreeDeliveryOnly={showFreeDeliveryOnly}
            selectedCuisineId={selectedCategoryId}
            searchQuery={searchQuery}
            favorites={favorites}
            onToggleFavorite={onToggleFavorite}
            menuItems={allMenuItems}
          />
        </div>
      </div>

      <Footer />
    </>
  )
}
