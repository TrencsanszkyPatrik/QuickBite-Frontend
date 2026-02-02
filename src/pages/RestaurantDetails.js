import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import '../styles/RestaurantDetails.css'
import Navbar from '../components/Navbar'
import { usePageTitle } from '../utils/usePageTitle'
import { API_BASE } from '../utils/api'
import { showToast } from '../utils/toast'

export default function RestaurantDetails({ favorites = [], onToggleFavorite }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [restaurant, setRestaurant] = useState(null)
  const [menuItems, setMenuItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showSwitchModal, setShowSwitchModal] = useState(false)
  const [pendingItem, setPendingItem] = useState(null)
  const [oldRestaurantName, setOldRestaurantName] = useState('')

  const addToCart = (menuItem) => {
    const savedCart = localStorage.getItem('quickbite_cart')
    let currentCart = []
    
    try {
      if (savedCart) {
        currentCart = JSON.parse(savedCart)
      }
    } catch (error) {
      console.error('Hiba a kosár betöltése közben:', error)
      currentCart = []
    }

    if (currentCart.length > 0 && currentCart[0].restaurantId !== restaurant.id) {
      setOldRestaurantName(currentCart[0].restaurantName)
      setPendingItem(menuItem)
      setShowSwitchModal(true)
      return
    }

    const existingItemIndex = currentCart.findIndex(
      (item) => item.name === menuItem.name && item.restaurantId === restaurant.id
    )

    if (existingItemIndex > -1) {
      currentCart[existingItemIndex].quantity += 1
    } else {
      const cartItem = {
        ...menuItem,
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        quantity: 1
      }
      currentCart.push(cartItem)
    }

    localStorage.setItem('quickbite_cart', JSON.stringify(currentCart))
    
    window.dispatchEvent(new Event('cartUpdated'))
    
    showToast.success(`${menuItem.name} hozzáadva a kosárhoz!`)
  }

  const handleSwitchConfirm = () => {
    const cartItem = {
      ...pendingItem,
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      quantity: 1
    }
    
    localStorage.setItem('quickbite_cart', JSON.stringify([cartItem]))
    window.dispatchEvent(new Event('cartUpdated'))
    showToast.success(`${pendingItem.name} hozzáadva a kosárhoz!`)
    
    setShowSwitchModal(false)
    setPendingItem(null)
    setOldRestaurantName('')
  }

  const handleSwitchCancel = () => {
    setShowSwitchModal(false)
    setPendingItem(null)
    setOldRestaurantName('')
  }

  useEffect(() => {
    const fetchRestaurantAndMenu = async () => {
      try {
        setIsLoading(true)
        const [restaurantRes, menuRes] = await Promise.all([
          fetch(`${API_BASE}/Restaurants/${id}`),
          fetch(`${API_BASE}/MenuItems/restaurant/${id}`)
        ])

        if (!restaurantRes.ok) {
          throw new Error('Nem sikerült betölteni az étterem adatait.')
        }

        const restaurantData = await restaurantRes.json()
        const categoriesRes = await fetch(`${API_BASE}/Categories`)
        const categories = await categoriesRes.json()
        const cuisine = categories.find((c) => c.id === restaurantData.cuisine_id)

        const mappedRestaurant = {
          ...restaurantData,
          id: String(restaurantData.id),
          address: `${restaurantData.city}, ${restaurantData.address}`,
          img: restaurantData.image_url,
          cuisine: cuisine?.name || 'Ismeretlen',
          phone: restaurantData.phonenumber
        }

        setRestaurant(mappedRestaurant)

        if (menuRes.ok) {
          const menuData = await menuRes.json()
          const mappedMenu = menuData.map((item) => ({
            name: item.name,
            price: item.price,
            img: item.image_url || '/img/EtelKepek/default.png',
            desc: item.description || '',
            category: item.category
          }))
          setMenuItems(mappedMenu)
        }
      } catch (err) {
        console.error(err)
        setError(err.message || 'Hiba történt az adatok betöltése közben.')
      } finally {
        setIsLoading(false)
      }
    }
    fetchRestaurantAndMenu()
  }, [id])

  usePageTitle(restaurant ? `${restaurant.name} - QuickBite` : 'Étterem részletek - QuickBite')

  const isFavorite = restaurant
    ? favorites.some((fav) => String(fav.id) === String(restaurant.id))
    : false

  if (isLoading) {
    return (
      <div className="container">
        <p>Betöltés...</p>
      </div>
    )
  }

  if (error || !restaurant) {
    return (
      <div className="container">
        <h2>{error || 'Étterem nem található'}</h2>
      </div>
    )
  }

  return (
    <>
      <Navbar />
      
      {/* Étterem váltás modal */}
      {showSwitchModal && (
        <div className="modal-overlay" onClick={handleSwitchCancel}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Étterem váltás</h2>
              <button className="modal-close" onClick={handleSwitchCancel}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-icon">⚠️</div>
              <p className="modal-text">
                A kosaradban már van rendelés innen: <strong>{oldRestaurantName}</strong>
              </p>
              <p className="modal-text">
                Ha új ételt adsz hozzá innen: <strong>{restaurant?.name}</strong>, az előző kosár tartalma törlődik.
              </p>
              <p className="modal-question">Biztosan folytatod?</p>
            </div>
            <div className="modal-actions">
              <button className="modal-btn modal-btn-cancel" onClick={handleSwitchCancel}>
                Mégse
              </button>
              <button className="modal-btn modal-btn-confirm" onClick={handleSwitchConfirm}>
                Kosár ürítése és folytatás
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="restaurant-details-page container">
      
      <div className="restaurant-details-header">
        <img src={restaurant.img} alt={restaurant.name} className="restaurant-details-img" />
        <div className="restaurant-details-info">
          <div className="restaurant-title-row">
            <div className="restaurant-title-section">
              <h1>{restaurant.name}</h1>
              {restaurant.discount > 0 && (
                <span className="discount-badge">-{restaurant.discount}%</span>
              )}
            </div>
            <button
              className={`favorite-btn favorite-btn--details ${
                isFavorite ? 'favorite-btn--active' : ''
              }`}
              onClick={() => onToggleFavorite && onToggleFavorite(restaurant)}
            >
              {isFavorite ? '♥ Kedvenc' : '♡ Kedvencekhez'}
            </button>
          </div>
          <div className="restaurant-details-meta">
            <span className="cuisine">{restaurant.cuisine}</span> • <span className="address">{restaurant.address}</span>
          </div>
          {restaurant.phone && (
            <div className="restaurant-phone">
              <strong>Telefonszám: </strong>
              <a href={`tel:${restaurant.phone}`}>{restaurant.phone}</a>
            </div>
          )}
          {restaurant.description_long && (
            <p className="restaurant-description">{restaurant.description_long}</p>
          )}
          <div className="restaurant-features">
            {restaurant.free_delivery && (
              <div className="feature-badge feature-badge--delivery">
                <i className="bi bi-truck"></i>
                <span>Ingyenes kiszállítás</span>
              </div>
            )}
            {restaurant.accept_cards && (
              <div className="feature-badge feature-badge--card">
                <i className="bi bi-credit-card"></i>
                <span>Kártyás fizetés</span>
              </div>
            )}
          </div>
        </div>
      </div>
      <h2 className="menu-title">Étlap</h2>
      {menuItems.length === 0 ? (
        <p>Jelenleg nincs elérhető menü elem.</p>
      ) : (
        <div className="menu-container">
          {Object.entries(
            menuItems.reduce((acc, item) => {
              const category = item.category || 'Egyéb'
              if (!acc[category]) acc[category] = []
              acc[category].push(item)
              return acc
            }, {})
          ).map(([category, items], categoryIdx) => (
            <div className="menu-category-section" key={category}>
              <h3 className="category-title">{category}</h3>
              <div className={`menu-grid menu-grid--${categoryIdx % 2 === 0 ? 'alternate' : 'standard'}`}>
                {items.map((item, idx) => (
                  <div
                    className={`menu-card menu-card--${idx % 3 === 0 ? 'featured' : idx % 3 === 1 ? 'medium' : 'compact'}`}
                    key={`${category}-${idx}`}
                  >
                    <div className="menu-card-image-wrapper">
                      <img src={item.img} alt={item.name} className="menu-img" />
                      <div className="menu-card-overlay">
                        <button 
                          className="btn btn-primary btn-overlay"
                          onClick={() => addToCart(item)}
                        >
                          Kosárba
                        </button>
                      </div>
                    </div>
                    <div className="menu-info">
                      <div className="menu-header">
                        <h3>{item.name}</h3>
                        <span className="menu-price">{item.price} Ft</span>
                      </div>
                      {item.desc && <p className="menu-desc">{item.desc}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </>
  )
}
