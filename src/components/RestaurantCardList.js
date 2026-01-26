import React, { useEffect, useState, useMemo } from 'react'
import '../styles/RestaurantCardList.css'
import { useNavigate } from 'react-router-dom'
import { API_BASE } from '../utils/api'

export default function RestaurantCardList({
  showDiscountOnly = false,
  showFreeDeliveryOnly = false,
  selectedCuisineId = null,
  searchQuery = '',
  favorites = [],
  onToggleFavorite,
  limit = null,
  menuItems = [] // Új prop a menü tételekhez
}) {
  const navigate = useNavigate()
  const [restaurants, setRestaurants] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
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
        setRestaurants(mapped)
      } catch (err) {
        console.error(err)
        setError('Hiba történt az éttermek betöltése közben.')
      } finally {
        setIsLoading(false)
      }
    }
    fetchRestaurants()
  }, [])

  const filteredRestaurants = useMemo(() => {
    return restaurants.filter((restaurant) => {
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase()
        const matchesName = restaurant.name.toLowerCase().includes(q)
        const matchesAddress = restaurant.address?.toLowerCase().includes(q)
        const matchesCuisine = restaurant.cuisine?.toLowerCase().includes(q)
        
        const hasMatchingMenuItem = menuItems.some(item => {
          const itemRestaurantId = typeof item.restaurant_id === 'string' ? item.restaurant_id : item.restaurant_id.toString()
          const restaurantId = typeof restaurant.id === 'string' ? restaurant.id : restaurant.id.toString()
          return itemRestaurantId === restaurantId && item.name.toLowerCase().includes(q)
        })
        
        if (!matchesName && !matchesAddress && !matchesCuisine && !hasMatchingMenuItem) return false
      }
      if (selectedCuisineId && restaurant.cuisine_id !== selectedCuisineId) {
        return false
      }
      if (showDiscountOnly && restaurant.discount <= 0) {
        return false
      }
      if (showFreeDeliveryOnly && !restaurant.freeDelivery) {
        return false
      }
      return true
    })
  }, [restaurants, searchQuery, selectedCuisineId, showDiscountOnly, showFreeDeliveryOnly, menuItems])

  if (isLoading) {
    return (
      <div className="restaurant-list-section container">
        <p>Étterem lista betöltése...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="restaurant-list-section container">
        <p>{error}</p>
      </div>
    )
  }

  const visibleRestaurants = limit
    ? filteredRestaurants.slice(0, limit)
    : filteredRestaurants

  return (
    <div className="restaurant-list-section container">
      <div className="restaurant-cards-grid">
        {visibleRestaurants.map((r) => (
          <div
            className="restaurant-card"
            key={r.id}
            tabIndex={0}
            onClick={() => navigate(`/restaurant/${r.id}`)}
          >
            <button
              className={`favorite-btn ${
                favorites.some((fav) => String(fav.id) === String(r.id))
                  ? 'favorite-btn--active'
                  : ''
              }`}
              onClick={(e) => {
                e.stopPropagation()
                if (onToggleFavorite) {
                  onToggleFavorite(r)
                }
              }}
              aria-label={
                favorites.some((fav) => String(fav.id) === String(r.id))
                  ? 'Eltávolítás a kedvencek közül'
                  : 'Hozzáadás a kedvencekhez'
              }
            >
              {favorites.some((fav) => String(fav.id) === String(r.id)) ? '♥' : '♡'}
            </button>
            <img src={r.img} alt={r.name} className="restaurant-img" />
            <div className="restaurant-info">
              <h3 className="restaurant-name">{r.name}</h3>
              <span className="restaurant-cuisine">{r.cuisine}</span>
              <span className="restaurant-address">{r.address}</span>
            </div>
          </div>
        ))}
        {filteredRestaurants.length === 0 && (
          <p>Nincs találat a megadott keresésre.</p>
        )}
      </div>
    </div>
  )
}
