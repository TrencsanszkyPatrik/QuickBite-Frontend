import React, { useMemo, useEffect, useState } from 'react'
import axios from 'axios'
import '../styles/RestaurantCardList.css'
import { useNavigate } from 'react-router-dom'
import { API_BASE } from '../utils/api'

export default function RestaurantCardList({
  restaurants = [],
  showDiscountOnly = false,
  showFreeDeliveryOnly = false,
  showCardPaymentOnly = false,
  showOpenNowOnly = false,
  selectedCuisineId = null,
  searchQuery = '',
  favorites = [],
  pendingFavoriteIds = new Set(),
  onToggleFavorite,
  limit = null,
  skip = 0,
  menuItems = [],
  isLoading = false
}) {
  const navigate = useNavigate()
  const [restaurantRatings, setRestaurantRatings] = useState({})

  useEffect(() => {
    // Minden étterem értékelésének betöltése
    const loadRatings = async () => {
      const ratings = {}
      await Promise.all(
        restaurants.map(async (restaurant) => {
          try {
            const res = await axios.get(`${API_BASE}/Reviews/restaurant/${restaurant.id}`)
            ratings[restaurant.id] = res.data.averageRating
          } catch (err) {
            ratings[restaurant.id] = 0
          }
        })
      )
      setRestaurantRatings(ratings)
    }
    
    if (restaurants.length > 0) {
      loadRatings()
    }
  }, [restaurants])

  const renderStars = (rating) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<i key={i} className="bi bi-star-fill rating-star-small" />)
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<i key={i} className="bi bi-star-half rating-star-small" />)
      } else {
        stars.push(<i key={i} className="bi bi-star rating-star-small" />)
      }
    }
    return stars
  }

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
      if (showDiscountOnly && restaurant.discount <= 0) return false
      if (showFreeDeliveryOnly && !restaurant.freeDelivery) return false
      if (showCardPaymentOnly && !restaurant.acceptCards) return false
      if (showOpenNowOnly && !restaurant.isOpen) return false
      return true
    })
  }, [restaurants, searchQuery, selectedCuisineId, showDiscountOnly, showFreeDeliveryOnly, showCardPaymentOnly, showOpenNowOnly, menuItems])

  if (isLoading) {
    return <div className="restaurant-list-section container"><p>Étterem lista betöltése...</p></div>
  }

  const visibleRestaurants = limit
    ? filteredRestaurants.slice(skip, skip + limit)
    : filteredRestaurants.slice(skip)

  return (
    <div className="restaurant-list-section container">
      <div className="restaurant-cards-grid">
        {visibleRestaurants.map((r) => {
          const isClosed = r.isOpen === false

          return (
          <div
            className={`restaurant-card ${isClosed ? 'restaurant-card--closed' : ''}`}
            key={r.id}
            tabIndex={isClosed ? -1 : 0}
            onClick={() => {
              if (!isClosed) {
                navigate(`/restaurant/${r.id}`)
              }
            }}
          >
            {(() => {
              const isFavorited = favorites.some((fav) => String(fav.id) === String(r.id))
              const isPending = pendingFavoriteIds.has(String(r.id))
              return (
                <button
                  className={`favorite-btn ${
                    isFavorited ? 'favorite-btn--active' : ''
                  } ${isPending ? 'favorite-btn--loading' : ''}`}
                  disabled={isPending}
                  aria-busy={isPending}
                  aria-label={
                    isFavorited
                      ? 'Eltávolítás a kedvencek közül'
                      : 'Hozzáadás a kedvencekhez'
                  }
                  onClick={(e) => {
                    e.stopPropagation()
                    if (onToggleFavorite) {
                      onToggleFavorite(r)
                    }
                  }}
                >
                  {isPending ? (
                    <span className="favorite-spinner" aria-hidden="true" />
                  ) : isFavorited ? '♥' : '♡'}
                </button>
              )
            })()}
            <img src={r.img} alt={r.name} className="restaurant-img" />
            <div className="restaurant-info">
              <h3 className="restaurant-name">{r.name}</h3>
              <span className="restaurant-cuisine">{r.cuisine}</span>
              {restaurantRatings[r.id] !== undefined && restaurantRatings[r.id] > 0 && (
                <div className="restaurant-rating-card">
                  <div className="rating-stars-small">
                    {renderStars(restaurantRatings[r.id])}
                  </div>
                  <span className="rating-value-small">{restaurantRatings[r.id].toFixed(1)}</span>
                </div>
              )}
              <span className="restaurant-address">{r.address}</span>
              {r.openingTime && r.closingTime && (
                <span className="restaurant-address">
                  Nyitvatartás: {String(r.openingTime).slice(0, 5)} - {String(r.closingTime).slice(0, 5)}
                </span>
              )}
              {r.isOpen !== undefined && (
                <div className={`status-badge ${r.isOpen ? 'status-badge--open' : 'status-badge--closed'}`}>
                  <span className={`status-dot ${r.isOpen ? 'status-dot--open' : 'status-dot--closed'}`}></span>
                  <span className="status-text">{r.isOpen ? 'Nyitva' : 'Zárva'}</span>
                </div>
              )}
            </div>
          </div>
          )
        })}
        {filteredRestaurants.length === 0 && (
          <p>Nincs találat a megadott keresésre.</p>
        )}
      </div>
    </div>
  )
}
