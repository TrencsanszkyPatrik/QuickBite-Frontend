import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useParams, useNavigate } from 'react-router-dom'
import '../styles/RestaurantDetails.css'
import '../styles/modal.css'
import Navbar from '../components/Navbar'
import { usePageTitle } from '../utils/usePageTitle'
import { API_BASE, getAuthHeaders } from '../utils/api'
import { showToast } from '../utils/toast'
import { animateAddToCart } from '../utils/cartAnimation'

const CATEGORY_ORDER = [
  'Előétel',
  'Előételek',
  'Saláta',
  "Saláták",
  'Leves',
  'Főzelék',
  'Főétel',
  'Főételek',
  'Szendvicsek',
  'Burger',
  'Pizza',
  'Tészta',
  'Köret',
  'Desszert',
  'Édességek',
  'Sütemény',
  'Torta',
  'Fagylalt',
  'Ital',
  'Italok',
  'Forró ital',
  'Kávé',
  'Matcha Latte',
  'Tea',
  'Alkoholos ital',
  'Alkoholos italok',
  'Alkoholmentes ital',
  'Rövidital',
  'Üdítő',
  'Limonádé',
  'Víz',
  'Sör',
  'Bor',
  'Egyéb'
]

const sortCategoriesByLogicalOrder = (categories) => {
  return categories.sort((a, b) => {
    const indexA = CATEGORY_ORDER.indexOf(a)
    const indexB = CATEGORY_ORDER.indexOf(b)
    const orderA = indexA === -1 ? CATEGORY_ORDER.length : indexA
    const orderB = indexB === -1 ? CATEGORY_ORDER.length : indexB
    return orderA - orderB
  })
}

export default function RestaurantDetails({ favorites = [], onToggleFavorite }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [restaurant, setRestaurant] = useState(null)
  const [menuItems, setMenuItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showSwitchModal, setShowSwitchModal] = useState(false)
  const [pendingItem, setPendingItem] = useState(null)
  const [pendingQuantity, setPendingQuantity] = useState(1)
  const [oldRestaurantName, setOldRestaurantName] = useState('')

  const [showItemModal, setShowItemModal] = useState(false)
  const [selectedItemIndex, setSelectedItemIndex] = useState(-1)
  const [selectedQuantity, setSelectedQuantity] = useState(1)
  
  const [reviewData, setReviewData] = useState(null)
  const [userRating, setUserRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isSubmittingRating, setIsSubmittingRating] = useState(false)

  const openItemModal = (itemIndex) => {
    if (typeof itemIndex !== 'number') return
    if (itemIndex < 0 || itemIndex >= menuItems.length) return
    setSelectedItemIndex(itemIndex)
    setSelectedQuantity(1)
    setShowItemModal(true)
  }

  const closeItemModal = () => {
    setShowItemModal(false)
    setSelectedItemIndex(-1)
    setSelectedQuantity(1)
  }

  const selectedItem =
    selectedItemIndex >= 0 && selectedItemIndex < menuItems.length
      ? menuItems[selectedItemIndex]
      : null

  const goToPrevItem = () => {
    if (menuItems.length <= 1) return
    setSelectedQuantity(1)
    setSelectedItemIndex((idx) => (idx <= 0 ? menuItems.length - 1 : idx - 1))
  }

  const goToNextItem = () => {
    if (menuItems.length <= 1) return
    setSelectedQuantity(1)
    setSelectedItemIndex((idx) => (idx >= menuItems.length - 1 ? 0 : idx + 1))
  }

  const addToCart = (menuItem, quantity = 1, sourceElement = null) => {
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
      setPendingQuantity(Math.max(1, Number(quantity) || 1))
      setShowSwitchModal(true)
      return
    }

    const existingItemIndex = currentCart.findIndex(
      (item) => item.name === menuItem.name && item.restaurantId === restaurant.id
    )

    if (existingItemIndex > -1) {
      currentCart[existingItemIndex].quantity += Math.max(1, Number(quantity) || 1)
    } else {
      const cartItem = {
        ...menuItem,
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        restaurantFreeDelivery: restaurant.free_delivery || false,
        quantity: Math.max(1, Number(quantity) || 1)
      }
      currentCart.push(cartItem)
    }

    localStorage.setItem('quickbite_cart', JSON.stringify(currentCart))
    
    window.dispatchEvent(new Event('cartUpdated'))
    
    // Animáció indítása
    if (sourceElement) {
      animateAddToCart(sourceElement, menuItem.img)
    }
    
    showToast.success(`${menuItem.name} hozzáadva a kosárhoz!`)
  }

  const handleSwitchConfirm = () => {
    const cartItem = {
      ...pendingItem,
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      restaurantFreeDelivery: restaurant.free_delivery || false,
      quantity: Math.max(1, Number(pendingQuantity) || 1)
    }
    
    localStorage.setItem('quickbite_cart', JSON.stringify([cartItem]))
    window.dispatchEvent(new Event('cartUpdated'))
    showToast.success(`${pendingItem.name} hozzáadva a kosárhoz!`)
    
    setShowSwitchModal(false)
    setPendingItem(null)
    setPendingQuantity(1)
    setOldRestaurantName('')
  }

  const handleSwitchCancel = () => {
    setShowSwitchModal(false)
    setPendingItem(null)
    setPendingQuantity(1)
    setOldRestaurantName('')
  }

  useEffect(() => {
    const token = localStorage.getItem('quickbite_token')
    setIsLoggedIn(!!token)
  }, [])

  useEffect(() => {
    const loadRestaurantAndMenuData = async () => {
      try {
        setIsLoading(true)
        const [restaurantRes, menuRes, categoriesRes] = await Promise.all([
          axios.get(`${API_BASE}/Restaurants/${id}`),
          axios.get(`${API_BASE}/MenuItems/restaurant/${id}`),
          axios.get(`${API_BASE}/Categories`)
        ])

        const restaurantData = restaurantRes.data
        const categories = categoriesRes.data || []
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

        const menuData = menuRes.data || []
        const mappedMenu = menuData.map((item) => ({
          name: item.name,
          price: item.price,
          img: item.image_url || '/img/EtelKepek/default.png',
          desc: item.description || '',
          category: item.category
        }))
        setMenuItems(mappedMenu)
        
        // Értékelések betöltése
        loadReviews()
      } catch (err) {
        console.error(err)
        setError(err?.message || 'Hiba történt az adatok betöltése közben.')
      } finally {
        setIsLoading(false)
      }
    }
    loadRestaurantAndMenuData()
  }, [id])

  const loadReviews = async () => {
    try {
      const reviewsRes = await axios.get(`${API_BASE}/Reviews/restaurant/${id}`)
      setReviewData(reviewsRes.data)
      
      // Felhasználó saját értékelésének betöltése ha be van jelentkezve
      if (isLoggedIn) {
        try {
          const userReviewRes = await axios.get(
            `${API_BASE}/Reviews/restaurant/${id}/user-review`,
            { headers: getAuthHeaders() }
          )
          setUserRating(userReviewRes.data.rating)
        } catch (err) {
          // Nincs még értékelés
          setUserRating(0)
        }
      }
    } catch (err) {
      console.error('Értékelések betöltése sikertelen:', err)
    }
  }

  const handleRatingSubmit = async (rating) => {
    if (!isLoggedIn) {
      showToast.error('Bejelentkezés szükséges az értékeléshez!')
      setTimeout(() => navigate('/bejelentkezes'), 1000)
      return
    }

    setIsSubmittingRating(true)
    try {
      await axios.post(
        `${API_BASE}/Reviews`,
        {
          restaurantId: parseInt(id),
          rating: rating,
          comment: null
        },
        { headers: getAuthHeaders() }
      )
      
      setUserRating(rating)
      showToast.success('Értékelés sikeresen elküldve!')
      
      // Értékelések újratöltése
      loadReviews()
    } catch (err) {
      console.error('Értékelés hiba:', err)
      showToast.error('Hiba az értékelés küldésekor')
    } finally {
      setIsSubmittingRating(false)
    }
  }

  const renderStars = (rating, interactive = false) => {
    const stars = []
    
    if (interactive) {
      // Interaktív csillagok félcsillag támogatással
      for (let i = 1; i <= 5; i++) {
        const currentRating = hoverRating || userRating
        const isFull = currentRating >= i
        const isHalf = currentRating === i - 0.5
        
        let starClass = 'bi bi-star'
        if (isFull) {
          starClass = 'bi bi-star-fill'
        } else if (isHalf) {
          starClass = 'bi bi-star-half'
        }
        
        stars.push(
          <div 
            key={i} 
            className="star-wrapper"
            onMouseLeave={() => setHoverRating(0)}
          >
            <div 
              className="star-half left"
              onMouseEnter={() => setHoverRating(i - 0.5)}
              onClick={() => handleRatingSubmit(i - 0.5)}
            />
            <div 
              className="star-half right"
              onMouseEnter={() => setHoverRating(i)}
              onClick={() => handleRatingSubmit(i)}
            />
            <i className={`${starClass} rating-star interactive`} />
          </div>
        )
      }
    } else {
      // Statikus csillagok megjelenítéshez
      const fullStars = Math.floor(rating)
      const hasHalfStar = rating % 1 >= 0.5
      
      for (let i = 1; i <= 5; i++) {
        if (i <= fullStars) {
          stars.push(<i key={i} className="bi bi-star-fill rating-star" />)
        } else if (i === fullStars + 1 && hasHalfStar) {
          stars.push(<i key={i} className="bi bi-star-half rating-star" />)
        } else {
          stars.push(<i key={i} className="bi bi-star rating-star" />)
        }
      }
    }
    return stars
  }

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

      {showItemModal && selectedItem && (
        <div className="modal-overlay" onClick={closeItemModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="product-modal-title">{selectedItem.name}</h2>
              <div className="product-modal-nav">
                <button
                  type="button"
                  className="product-modal-nav-btn"
                  onClick={goToPrevItem}
                  aria-label="Előző étel/ital"
                  disabled={menuItems.length <= 1}
                  title="Előző"
                >
                  ‹
                </button>
                <button
                  type="button"
                  className="product-modal-nav-btn"
                  onClick={goToNextItem}
                  aria-label="Következő étel/ital"
                  disabled={menuItems.length <= 1}
                  title="Következő"
                >
                  ›
                </button>
                <button className="modal-close" onClick={closeItemModal} aria-label="Bezárás">
                  ✕
                </button>
              </div>
            </div>
            <div className="modal-body product-modal-body">
              <div className="product-modal-top">
                <img
                  id="product-modal-img-animated"
                  className="product-modal-img"
                  src={selectedItem.img}
                  alt={selectedItem.name}
                />
                <div className="product-modal-info">
                  <div className="product-modal-price">{selectedItem.price} Ft</div>
                  {selectedItem.desc ? (
                    <p className="product-modal-desc">{selectedItem.desc}</p>
                  ) : (
                    <p className="product-modal-desc product-modal-desc--muted">
                      Nincs megadott leírás.
                    </p>
                  )}
                </div>
              </div>

              <div className="product-modal-qty">
                <span className="product-modal-qty-label">Mennyiség</span>
                <div className="product-modal-qty-controls">
                  <button
                    type="button"
                    className="product-modal-qty-btn"
                    onClick={() => setSelectedQuantity((q) => Math.max(1, q - 1))}
                    aria-label="Mennyiség csökkentése"
                  >
                    −
                  </button>
                  <span className="product-modal-qty-value">{selectedQuantity}</span>
                  <button
                    type="button"
                    className="product-modal-qty-btn"
                    onClick={() => setSelectedQuantity((q) => Math.min(99, q + 1))}
                    aria-label="Mennyiség növelése"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button className="modal-btn modal-btn-cancel" onClick={closeItemModal}>
                Mégse
              </button>
              <button
                className="modal-btn modal-btn-confirm"
                onClick={(e) => {
                  // Használjuk a kép elemet animációhoz
                  const imageElement = document.getElementById('product-modal-img-animated')
                  addToCart(selectedItem, selectedQuantity, imageElement || e.currentTarget)
                  // Kis késleltetéssel zárjuk be, hogy az animáció elinduljon
                  setTimeout(() => closeItemModal(), 100)
                }}
              >
                Kosárba teszem
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
              <i className="bi bi-telephone-fill"></i>
              <a href={`tel:${restaurant.phone}`}>{restaurant.phone}</a>
            </div>
          )}
          
          {restaurant.description_long && (
            <p className="restaurant-description">{restaurant.description_long}</p>
          )}
          
          {/* Értékelés megjelenítése - új elrendezés */}
          <div className="restaurant-rating-section">
            <div className="rating-overview">
              {reviewData && reviewData.totalReviews > 0 ? (
                <>
                  <div className="rating-score">
                    <span className="rating-number">{reviewData.averageRating.toFixed(1)}</span>
                    <div className="rating-stars-display">
                      {renderStars(reviewData.averageRating)}
                    </div>
                    <span className="rating-count">{reviewData.totalReviews} értékelés</span>
                  </div>
                </>
              ) : (
                <div className="rating-score">
                  <span className="rating-no-reviews">Még nincs értékelés</span>
                  <div className="rating-stars-display">
                    {renderStars(0)}
                  </div>
                </div>
              )}
              
              <div className="rating-divider"></div>
              
              <div className="user-rating-section">
                <p className="rating-label">
                  {isLoggedIn ? (
                    userRating > 0 ? 'Módosítsa értékelését:' : 'Értékelje az éttermet:'
                  ) : (
                    'Értékeléshez jelentkezzen be'
                  )}
                </p>
                <div className="rating-stars-interactive">
                  {renderStars(userRating, true)}
                </div>
                {userRating > 0 && isLoggedIn && (
                  <p className="current-user-rating">Az Ön értékelése: <strong>{userRating}</strong> csillag</p>
                )}
                {!isLoggedIn && (
                  <button className="rating-login-btn" onClick={() => navigate('/bejelentkezes')}>
                    <i className="bi bi-box-arrow-in-right"></i> Bejelentkezés
                  </button>
                )}
                {isSubmittingRating && <p className="rating-submitting"><i className="bi bi-hourglass-split"></i> Küldés...</p>}
              </div>
            </div>
          </div>
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
          )
            .sort((a, b) => {
              const categories = Object.keys(
                menuItems.reduce((acc, item) => {
                  const category = item.category || 'Egyéb'
                  if (!acc[category]) acc[category] = []
                  acc[category].push(item)
                  return acc
                }, {})
              )
              const sortedCategories = sortCategoriesByLogicalOrder(categories)
              return sortedCategories.indexOf(a[0]) - sortedCategories.indexOf(b[0])
            })
            .map(([category, items], categoryIdx) => (
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
                          onClick={() => openItemModal(menuItems.indexOf(item))}
                        >
                          + Részletek
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
