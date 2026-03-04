import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useParams, useNavigate } from 'react-router-dom'
import '../styles/RestaurantDetails.css'
import '../styles/modal.css'
import Navbar from '../components/Navbar'
import SpinnerOverlay from '../components/SpinnerOverlay'
import { usePageTitle } from '../utils/usePageTitle'
import { API_BASE, getAuthHeaders } from '../utils/api'
import { showToast } from '../utils/toast'
import { animateAddToCart } from '../utils/cartAnimation'
import { getCart, setCart, getAuthToken } from '../utils/storage'

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

const getMinutesUntilNextStatusChange = (openingTime, closingTime, isOpen) => {
  const openMinutes = parseTimeToMinutes(openingTime)
  const closeMinutes = parseTimeToMinutes(closingTime)

  if (openMinutes === null || closeMinutes === null) {
    return null
  }

  const now = new Date()
  const currentMinutes = (now.getHours() * 60) + now.getMinutes()

  if (openMinutes <= closeMinutes) {
    if (isOpen) {
      return closeMinutes - currentMinutes
    }

    if (currentMinutes < openMinutes) {
      return openMinutes - currentMinutes
    }

    return (24 * 60 - currentMinutes) + openMinutes
  }

  if (isOpen) {
    if (currentMinutes >= openMinutes) {
      return (24 * 60 - currentMinutes) + closeMinutes
    }

    return closeMinutes - currentMinutes
  }

  return openMinutes - currentMinutes
}

const getRestaurantSoonStatusLabel = (openingTime, closingTime, isOpen) => {
  const minutesUntilChange = getMinutesUntilNextStatusChange(openingTime, closingTime, isOpen)

  if (minutesUntilChange === null || minutesUntilChange <= 0 || minutesUntilChange > 60) {
    return null
  }

  if (isOpen) {
    return `Lassan zárunk (${minutesUntilChange} perc múlva)`
  }

  return `Lassan nyitunk (${minutesUntilChange} perc múlva)`
}

const normalizeRestaurantName = (name) => {
  if (!name) return ''
  return String(name)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

const isDrinkHubPecsRestaurantName = (name) => {
  const normalizedName = normalizeRestaurantName(name)
  return normalizedName === 'drinkhub pecs'
}

const CATEGORY_ORDER = [
  'Shake',
  'Smoothie',
  'Luxury Roll',
  'Premium Roll',
  'Csokis/Kekszes Roll',
  'Gyümölcsös Roll',
  'Zero Roll',
  'Sós palacsinta',
  'Édes palacsinta',
  'Gofri',
  'Különlegességek',
  'Előétel',
  'Wrap',
  'Lángos',
  'Előételek',
  'Saláta',
  "Saláták",
  'Leves',
  'Főzelék',
  'Főétel',
  'Főételek',
  'Kenyerek',
  'Szendvicsek',
  'Sós pékáruk',
  'Édes pékáruk',
  'Burger',
  'Pizza',
  'Tészta',
  'Tálak',
  'Boxok',
  'Kosarak',
  'Wrapek',
  'Köret',
  'Köretek',
  'Hot-dog',
  'Szósz',
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
  'Szószok',
  'Üdítő',
  'Limonádé',
  'Kávé & Meleg italok',
  'Hűsítők',
  'Ásványvíz',
  'Víz',
  'Sör',
  'Sörök',
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

export default function RestaurantDetails({ favorites = [], pendingFavoriteIds, onToggleFavorite }) {
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

  const [showAgeModal, setShowAgeModal] = useState(false);
  const [pendingCartAction, setPendingCartAction] = useState(null);

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

  const soonStatusLabel = restaurant
    ? getRestaurantSoonStatusLabel(restaurant.openingTime, restaurant.closingTime, restaurant.isOpen)
    : null

  const isDrinkHubPecs = isDrinkHubPecsRestaurantName(restaurant?.name)

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
    const currentCart = getCart()
    
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
    const is18PlusTermek = isAlkoholosTermek(menuItem)

    if (existingItemIndex > -1) {
      currentCart[existingItemIndex].quantity += Math.max(1, Number(quantity) || 1)
      currentCart[existingItemIndex].is18Plus =
        Boolean(currentCart[existingItemIndex].is18Plus) || is18PlusTermek
    } else {
      const cartItem = {
        ...menuItem,
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        restaurantFreeDelivery: restaurant.free_delivery || false,
        is18Plus: is18PlusTermek,
        quantity: Math.max(1, Number(quantity) || 1)
      }
      currentCart.push(cartItem)
    }

    setCart(currentCart)
    
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
      is18Plus: isAlkoholosTermek(pendingItem),
      quantity: Math.max(1, Number(pendingQuantity) || 1)
    }
    
    setCart([cartItem])
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
    const token = getAuthToken()
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
          phone: restaurantData.phonenumber,
          openingTime: restaurantData.opening_time,
          closingTime: restaurantData.closing_time,
          isOpen: restaurantData.is_open !== undefined
            ? restaurantData.is_open
            : isRestaurantOpenNow(restaurantData.opening_time, restaurantData.closing_time)
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
      const token = getAuthToken()
      if (token) {
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
  const isFavoritePending = restaurant
    ? pendingFavoriteIds?.has(String(restaurant.id))
    : false

  const alkoholosKategoriak = [
    'Alkohol',
    'Alkoholos ital',
    'Alkoholos italok',
    'Sör',
    'Sörök',
    'Bor',
    'Rövidital',
    'Rövid ital',
    'Röviditalok',
    'Whiskey',
    'Vodka',
    'Vermut',
    'Tequila',
    'Rum',
    'Likőr',
    'Gin',
    'Energiaital',
    'Energiaitalok',
    'Koktélok',
    'Koktél'
  ];

  const normalizeForCompare = (value) =>
    String(value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();

  const isAlkoholosTermek = (item) => {
    if (!item) return false;

    const normalizedCategory = normalizeForCompare(item.category);
    const kategoriabolAlkoholos =
      !!normalizedCategory &&
      alkoholosKategoriak
        .map((k) => normalizeForCompare(k))
        .includes(normalizedCategory);

    if (kategoriabolAlkoholos) return true;

    const restaurantName = normalizeForCompare(restaurant?.name);
    const itemName = normalizeForCompare(item.name);
    const isZipsBrewhouse = restaurantName.includes('zip') && restaurantName.includes('brewhouse');
    const zips18PlusSorok = ['ipa', 'kezmuves sor', 'stout'];
    const isTuzhelyKavezoBisztro =
      restaurantName.includes('tuzhely') &&
      restaurantName.includes('kavezo') &&
      restaurantName.includes('bisztro');
    const isHajnaliWokBao =
      restaurantName.includes('hajnali') &&
      restaurantName.includes('wok') &&
      restaurantName.includes('bao');
    const isSaboresPerdidos =
      restaurantName.includes('sabores') &&
      restaurantName.includes('perdidos');
    const isLaStradaItaliana =
      restaurantName.includes('la strada') &&
      restaurantName.includes('italiana');
    const isNeoDog =
      restaurantName.includes('neo') &&
      restaurantName.includes('dog');
    const isItalKategoriaban = ['ital', 'italok'].includes(normalizedCategory);
    const isUditoKategoriaban = ['udito', 'uditok'].includes(normalizedCategory);
    const tuzhely18PlusItalok = ['aperol spritz', 'bloody mary', 'craft sorok', 'craft sor', 'mimosa'];
    const hajnali18PlusItalok = [
      'lychee martini',
      'sake flight',
      'shochu',
      'soju',
      'makgeolli'
    ];

    if (isZipsBrewhouse) {
      return zips18PlusSorok.some((beerName) => itemName.includes(beerName));
    }

    if (isTuzhelyKavezoBisztro && isItalKategoriaban) {
      return tuzhely18PlusItalok.some((drinkName) => itemName.includes(drinkName));
    }

    if (isHajnaliWokBao && isItalKategoriaban) {
      return hajnali18PlusItalok.some((drinkName) => itemName.includes(drinkName));
    }

    if (isSaboresPerdidos && itemName.includes('paloma picante')) {
      return true;
    }

    if (isLaStradaItaliana) {
      return (
        itemName.includes('campari soda') ||
        itemName.includes('aperol spitz') ||
        itemName.includes('aperol spritz')
      );
    }

    if (isNeoDog && isUditoKategoriaban && itemName.includes('source code')) {
      return true;
    }

    return false;
  };

  const handleAddToCart = (menuItem, quantity = 1, sourceElement = null) => {
    if (isAlkoholosTermek(menuItem)) {
      setPendingCartAction({ menuItem, quantity, sourceElement });
      setShowAgeModal(true);
      return;
    }
    addToCart(menuItem, quantity, sourceElement);
    setShowItemModal(false);
  };

  const handleConfirmAge = () => {
    if (pendingCartAction) {
      addToCart(pendingCartAction.menuItem, pendingCartAction.quantity, pendingCartAction.sourceElement);
      setShowItemModal(false);
    }
    setShowAgeModal(false);
    setPendingCartAction(null);
  };

  const handleCancelAgeModal = () => {
    setShowAgeModal(false);
    setPendingCartAction(null);
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <SpinnerOverlay label="Étterem betöltése..." />
      </>
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
                  {/* 18+ badge for alcoholic drinks - CENTERED BELOW price & desc */}
                  {(() => {
                    if (isAlkoholosTermek(selectedItem)) {
                      return (
                        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
                          <button
                            type="button"
                            className="alkoholos-badge-modal"
                            style={{
                              background: '#d7263d', // piros
                              color: '#fff8e1', // fehér/beige
                              fontWeight: 'bold',
                              border: 'none',
                              borderRadius: '12px',
                              padding: '1rem 1.5rem',
                              fontSize: '1rem',
                              cursor: 'default',
                              boxShadow: '0 4px 12px rgba(215,38,61,0.12)',
                              outline: 'none',
                              pointerEvents: 'none',
                              textTransform: 'uppercase',
                              letterSpacing: '1px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.5rem',
                            }}
                            disabled
                            aria-disabled="true"
                          >
                            Figyelem! 18+
                          </button>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              </div>
              {restaurant.isOpen && (
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
              )}
            </div>
            <div className="modal-actions">
              {restaurant.isOpen ? (
                <>
                  <button className="modal-btn modal-btn-cancel" onClick={closeItemModal}>
                    Mégse
                  </button>
                  <button
                    className="modal-btn modal-btn-confirm"
                    onClick={(e) => {
                      const imageElement = document.getElementById('product-modal-img-animated')
                      handleAddToCart(selectedItem, selectedQuantity, imageElement || e.currentTarget)
                    }}
                  >
                    Kosárba teszem
                  </button>
                </>
              ) : (
                <span className="product-modal-closed-text" role="status" aria-live="polite">
                  <i className="bi bi-moon-stars-fill"></i>
                  <span>Jelenleg zárva vagyunk</span>
                </span>
              )}
            </div>
          </div>
        </div>
      )}
      {showAgeModal && (
        <div className="modal-overlay" onClick={handleCancelAgeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxWidth: 480, fontFamily: 'inherit'}}>
            <div className="modal-header">
              <h2 style={{fontFamily: 'inherit'}}>Figyelem! 18+ termék</h2>
              <button className="modal-close" onClick={handleCancelAgeModal} aria-label="Bezárás">✕</button>
            </div>
            <div className="modal-body" style={{textAlign: 'center', fontFamily: 'inherit'}}>
              <div style={{margin: '2rem 0 1.5rem 0'}}>
                <span style={{
                  background: '#d7263d',
                  color: '#fff8e1',
                  fontWeight: 'bold',
                  borderRadius: '14px',
                  padding: '1.1rem 2.2rem',
                  fontSize: '1.25rem',
                  display: 'inline-block',
                  marginBottom: '1.2rem',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  fontFamily: 'inherit',
                  boxShadow: '0 4px 16px rgba(215,38,61,0.13)'
                }}>Figyelem! 18+</span>
                <p style={{margin: '0.7rem 0 0.7rem 0', fontSize: '1.13rem', fontFamily: 'inherit', lineHeight: 1.6}}>
                  Ez egy 18 éven felülieknek szóló termék.<br/>
                  Kérjük, csak akkor rendeld meg, ha elmúltál 18 éves,<br/>
                  és az átvételkor is csak 18 éven felüli személy veheti át.<br/>
                  A futár jogosult személyazonosságot igazoló okmányt kérni.<br/>
                  <b>Ha nem tudod igazolni életkorodat, a terméket nem adhatja át!</b>
                </p>
              </div>
              <div style={{display: 'flex', justifyContent: 'center', gap: '1.2rem', marginTop: '1.5rem'}}>
                <button className="modal-btn modal-btn-cancel" onClick={handleCancelAgeModal} style={{minWidth: 100}}>Mégse</button>
                <button className="modal-btn modal-btn-confirm" style={{minWidth: 100}} onClick={handleConfirmAge} autoFocus>OK</button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className={`restaurant-details-page container ${isDrinkHubPecs ? 'restaurant-details-page--drinkhub-pecs' : ''}`}>
      
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
              disabled={isFavoritePending}
            >
              {isFavoritePending ? (
                <span className="favorite-spinner" aria-hidden="true" />
              ) : isFavorite ? '♥ Kedvenc' : '♡ Kedvencekhez'}
            </button>
          </div>
          <div className="restaurant-details-meta">
            <span className="cuisine">{restaurant.cuisine}</span> • <span className="address">{restaurant.address}</span>
          </div>

          {!restaurant.isOpen && (
            <div className="restaurant-status-alert" role="status" aria-live="polite">
              <i className="bi bi-exclamation-circle-fill"></i>
              <span>Jelenleg zárva</span>
            </div>
          )}
          
          {restaurant.phone && (
            <div className="restaurant-phone">
              <i className="bi bi-telephone-fill"></i>
              <a href={`tel:${restaurant.phone}`}>{restaurant.phone}</a>
            </div>
          )}

          {restaurant.openingTime && restaurant.closingTime && (
            <div className="restaurant-phone">
              <i className="bi bi-clock-fill"></i>
              <span>
                Nyitvatartás: {String(restaurant.openingTime).slice(0, 5)} - {String(restaurant.closingTime).slice(0, 5)}
              </span>
              {soonStatusLabel && (
                <span className="restaurant-soon-status">• {soonStatusLabel}</span>
              )}
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
                {items.map((item, idx) => {
                  const isAlkoholos = isAlkoholosTermek(item);
                  return (
                    <div
                      className={`menu-card menu-card--${idx % 3 === 0 ? 'featured' : idx % 3 === 1 ? 'medium' : 'compact'}`}
                      key={`${category}-${idx}`}
                    >
                      <div className="menu-card-image-wrapper" style={{position: 'relative'}}>
                        <img src={item.img} alt={item.name} className="menu-img" />
                        {/* 18+ badge for alcoholic drinks in card */}
                        {isAlkoholos && (
                          <span
                            className="alkoholos-badge-card"
                            style={{
                              position: 'absolute',
                              right: '8px',
                              bottom: '8px',
                              background: '#d7263d',
                              color: '#fff8e1',
                              fontWeight: 'bold',
                              borderRadius: '8px',
                              padding: '4px 10px',
                              fontSize: '0.95rem',
                              zIndex: 2,
                              boxShadow: '0 2px 6px rgba(215,38,61,0.12)',
                              pointerEvents: 'none',
                              textTransform: 'uppercase',
                              letterSpacing: '1px',
                            }}
                          >
                            18+
                          </span>
                        )}
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
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </>
  )
}