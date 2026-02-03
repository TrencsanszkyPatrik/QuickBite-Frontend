import React, { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import AddressAutocomplete from '../components/AddressAutocomplete'
import '../styles/cart.css'
import { usePageTitle } from '../utils/usePageTitle'
import { API_BASE, getAuthHeaders } from '../utils/api'
import { Link } from 'react-router-dom'

export default function Cart() {
  usePageTitle('QuickBite - Kosár')
  
  const [cartItems, setCartItems] = useState([])
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [showCardDetails, setShowCardDetails] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userProfile, setUserProfile] = useState(null)
  const [selectedAddressId, setSelectedAddressId] = useState(null)
  const [selectedPaymentId, setSelectedPaymentId] = useState(null)
  const [useNewAddress, setUseNewAddress] = useState(false)
  const [suggestedItems, setSuggestedItems] = useState([])
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)
  const [deliveryAddress, setDeliveryAddress] = useState({
    fullName: '',
    address: '',
    city: '',
    zip: '',
    phone: '',
    instructions: ''
  })
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiry: '',
    cvv: '',
    cardName: ''
  })

  useEffect(() => {
    const token = localStorage.getItem('quickbite_token')
    const userData = localStorage.getItem('quickbite_user')
    
    if (token && userData) {
      setIsLoggedIn(true)
      loadUserProfile()
    } else {
      setIsLoggedIn(false)
    }
  }, [])

  const loadUserProfile = async () => {
    try {
      const res = await fetch(`${API_BASE}/Profile/me`, { headers: getAuthHeaders() })
      if (res.ok) {
        const data = await res.json()
        setUserProfile(data)
        
        const defaultAddress = data.addresses?.find(a => a.isDefault)
        const defaultPayment = data.paymentMethods?.find(p => p.isDefault)
        
        setDeliveryAddress(prev => ({
          ...prev,
          fullName: data.name || prev.fullName,
          phone: data.phone || prev.phone
        }))
        
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id)
          setDeliveryAddress(prev => ({
            ...prev,
            address: defaultAddress.addressLine,
            city: defaultAddress.city,
            zip: defaultAddress.zipCode
          }))
        }
        
        if (defaultPayment) {
          setSelectedPaymentId(defaultPayment.id)
          if (defaultPayment.type === 'card') {
            setPaymentMethod('credit-card')
            setShowCardDetails(true)
          } else if (defaultPayment.type === 'cash') {
            setPaymentMethod('cash')
            setShowCardDetails(false)
          }
        }
      }
    } catch (error) {
      console.error('Profil betöltése sikertelen:', error)
    }
  }

  useEffect(() => {
    const savedCart = localStorage.getItem('quickbite_cart')
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart))
      } catch (error) {
        console.error('Hiba a kosár betöltése közben:', error)
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('quickbite_cart', JSON.stringify(cartItems))
    window.dispatchEvent(new Event('cartUpdated'))
    
    // Javasolt ételek betöltése ha van étterem a kosárban
    if (cartItems.length > 0 && cartItems[0].restaurantId) {
      loadSuggestedItems(cartItems[0].restaurantId)
    } else {
      setSuggestedItems([])
    }
  }, [cartItems])

  const increaseQuantity = (index) => {
    const newCart = [...cartItems]
    newCart[index].quantity += 1
    setCartItems(newCart)
  }

  const decreaseQuantity = (index) => {
    const newCart = [...cartItems]
    if (newCart[index].quantity > 1) {
      newCart[index].quantity -= 1
      setCartItems(newCart)
    }
  }

  const removeItem = (index) => {
    const newCart = cartItems.filter((_, i) => i !== index)
    setCartItems(newCart)
  }

  const clearCart = () => {
    if (window.confirm('Biztosan törölni szeretnéd az összes terméket a kosárból?')) {
      setCartItems([])
    }
  }

  const handleCheckout = (e) => {
    e.preventDefault()
    
    if (cartItems.length === 0) {
      alert('A kosár üres!')
      return
    }

    // Cím ellenőrzés
    if (!deliveryAddress.fullName || !deliveryAddress.address || !deliveryAddress.city || 
        !deliveryAddress.zip || !deliveryAddress.phone) {
      alert('Kérjük, töltsd ki az összes kötelező mezőt!')
      return
    }

    if (paymentMethod === 'credit-card' && !selectedPaymentId && 
        (!cardDetails.cardNumber || !cardDetails.expiry || !cardDetails.cvv || !cardDetails.cardName)) {
      alert('Kérjük, add meg a bankkártya adatait vagy válassz mentett fizetési módot!')
      return
    }

    const order = {
      items: cartItems,
      delivery: deliveryAddress,
      payment: paymentMethod,
      savedAddressId: selectedAddressId,
      savedPaymentId: selectedPaymentId,
      subtotal: calculateSubtotal(),
      deliveryFee: calculateDeliveryFee(),
      total: calculateTotal(),
      timestamp: new Date().toISOString()
    }

    console.log('Rendelés leadva:', order)
    alert('Sikeres rendelés! Köszönjük a vásárlást!')
    
    
    setCartItems([])
    
    
    if (!selectedAddressId) {
      setDeliveryAddress({
        fullName: userProfile?.name || '',
        address: '',
        city: '',
        zip: '',
        phone: userProfile?.phone || '',
        instructions: ''
      })
    }
    if (!selectedPaymentId) {
      setCardDetails({
        cardNumber: '',
        expiry: '',
        cvv: '',
        cardName: ''
      })
    }
  }

  
  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  }

  const calculateDeliveryFee = () => {
    const hasFreeDelivery = cartItems.length > 0 && cartItems[0].restaurantFreeDelivery
    
    if (!hasFreeDelivery) {
      return 499 
    }
    
    const subtotal = calculateSubtotal()
    return subtotal > 5000 ? 0 : 499
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateDeliveryFee()
  }

  const loadSuggestedItems = async (restaurantId) => {
    setIsLoadingSuggestions(true)
    try {
      const res = await fetch(`${API_BASE}/MenuItems/restaurant/${restaurantId}`)
      if (res.ok) {
        const allItems = await res.json()
        
        // Kiszűrjük a kosárban lévő ételeket
        const cartItemIds = cartItems.map(item => item.id)
        const filtered = allItems.filter(item => !cartItemIds.includes(item.id))
        
        // Véletlenszerű keveredés
        const shuffled = [...filtered].sort(() => Math.random() - 0.5)
        
        // Kategorizálás
        const desserts = shuffled.filter(item => 
          item.category?.toLowerCase().includes('desszert') ||
          item.category?.toLowerCase().includes('édesség') ||
          item.name?.toLowerCase().includes('süti') ||
          item.name?.toLowerCase().includes('torta')
        )
        
        const popular = shuffled.filter(item => item.isPopular || item.rating >= 4.5)
        
        // Véletlenszerűen válasszunk ételeket
        let suggestions = []
        
        // Véletlenszerűen válasszunk 1-2 desszertet
        if (desserts.length > 0) {
          const randomDesserts = desserts.sort(() => Math.random() - 0.5).slice(0, Math.min(2, desserts.length))
          suggestions.push(...randomDesserts)
        }
        
        // Véletlenszerűen válasszunk 1-2 népszerű ételt
        if (popular.length > 0) {
          const randomPopular = popular
            .filter(item => !suggestions.includes(item))
            .sort(() => Math.random() - 0.5)
            .slice(0, Math.min(2, popular.length))
          suggestions.push(...randomPopular)
        }
        
        // Ha kevés az ajánlat, töltsük fel véletlenszerű ételekkel
        if (suggestions.length < 4 && filtered.length > suggestions.length) {
          const remaining = shuffled.filter(item => !suggestions.includes(item))
          const randomRemaining = remaining.slice(0, 4 - suggestions.length)
          suggestions.push(...randomRemaining)
        }
        
        setSuggestedItems(suggestions.slice(0, 6))
      }
    } catch (error) {
      console.error('Javasolt ételek betöltése sikertelen:', error)
    } finally {
      setIsLoadingSuggestions(false)
    }
  }

  const addSuggestedToCart = (item) => {
    const newItem = {
      id: item.id,
      name: item.name,
      price: item.price,
      desc: item.description,
      img: item.image_url || '/img/EtelKepek/default.png',
      quantity: 1,
      restaurantId: item.restaurantId,
      restaurantName: cartItems[0]?.restaurantName,
      restaurantFreeDelivery: cartItems[0]?.restaurantFreeDelivery
    }
    setCartItems([...cartItems, newItem])
  }

  // Csak egy etterembol rendeles
  const restaurantId = cartItems.length > 0 ? cartItems[0].restaurantId : null
  const restaurantName = cartItems.length > 0 ? cartItems[0].restaurantName : null

  return (
    <>
      <Navbar />
      <main className="cart-page">
        <div className="cart-container">
          <div className="cart-header">
            {cartItems.length > 0 && (
              <button className="clear-cart-btn" onClick={clearCart}>
                Kosár ürítése
              </button>
            )}
          </div>

          {cartItems.length === 0 ? (
            <div className="empty-cart">
              <div className="empty-cart-icon">🛒</div>
              <h2>A kosarad üres</h2>
              <p>Adj hozzá ételeket a rendeléshez!</p>
              <Link to="/ettermek" className="browse-btn">Étteremek böngészése</Link>
            </div>
          ) : (
            <div className="cart-content">
              <div className="cart-items-section">
                {restaurantName && (
                  <div className="restaurant-info-banner">
                    <span className="restaurant-icon">🏪</span>
                    <div>
                      <h3>{restaurantName}</h3>
                      <p>Egyszerre csak egy étteremből rendelhetsz</p>
                    </div>
                  </div>
                )}

                <div className="cart-items">
                  {cartItems.map((item, index) => (
                    <div key={index} className="cart-item">
                      <img 
                        src={item.img || '/img/EtelKepek/default.png'} 
                        alt={item.name} 
                        className="cart-item-image"
                      />
                      <div className="cart-item-details">
                        <h3>{item.name}</h3>
                        {item.desc && <p className="item-description">{item.desc}</p>}
                        <p className="item-price">{item.price.toLocaleString()} Ft</p>
                      </div>
                      <div className="cart-item-actions">
                        <div className="quantity-controls">
                          <button 
                            className="quantity-btn" 
                            onClick={() => decreaseQuantity(index)}
                          >
                            −
                          </button>
                          <span className="quantity">{item.quantity}</span>
                          <button 
                            className="quantity-btn" 
                            onClick={() => increaseQuantity(index)}
                          >
                            +
                          </button>
                        </div>
                        <p className="item-total">{(item.price * item.quantity).toLocaleString()} Ft</p>
                        <button 
                          className="remove-btn" 
                          onClick={() => removeItem(index)}
                          title="Eltávolítás"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                 {suggestedItems.length > 0 && (
                  <div className="suggested-items-section">
                    <h3>Hiányzik valami?</h3>
                    <p className="suggested-subtitle">Ezeket is sokan rendelik ebből az étteremből</p>
                    <div className="suggested-items-grid">
                      {suggestedItems.map((item) => (
                        <div key={item.id} className="suggested-item">
                          <img 
                            src={item.image_url || '/img/EtelKepek/default.png'} 
                            alt={item.name}
                            className="suggested-item-image"
                          />
                          <div className="suggested-item-info">
                            <h4>{item.name}</h4>
                            {item.description && (
                              <p className="suggested-item-desc">{item.description.substring(0, 60)}...</p>
                            )}
                            <div className="suggested-item-footer">
                              <span className="suggested-item-price">{item.price.toLocaleString()} Ft</span>
                              <button 
                                className="suggested-add-btn"
                                onClick={() => addSuggestedToCart(item)}
                                title="Hozzáadás a kosárhoz"
                              >
                                <i className="bi bi-plus-lg"></i> Kosárba
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="cart-sidebar">
                <div className="order-summary">
                  <h3>Rendelés összesítő</h3>
                  <div className="summary-row">
                    <span>Részösszeg:</span>
                    <span>{calculateSubtotal().toLocaleString()} Ft</span>
                  </div>
                  <div className="summary-row">
                    <span>Szállítási díj:</span>
                    <span>
                      {calculateDeliveryFee() === 0 ? (
                        <span className="free-delivery">Ingyenes</span>
                      ) : (
                        `${calculateDeliveryFee()} Ft`
                      )}
                    </span>
                  </div>
                  {cartItems.length > 0 && cartItems[0].restaurantFreeDelivery && calculateSubtotal() < 5000 && calculateSubtotal() > 0 && (
                    <p className="free-delivery-info">
                      Még {(5000 - calculateSubtotal()).toLocaleString()} Ft és ingyenes a szállítás!
                    </p>
                  )}
                  <div className="summary-divider"></div>
                  <div className="summary-row total">
                    <span>Összesen:</span>
                    <span className="total-amount">{calculateTotal().toLocaleString()} Ft</span>
                  </div>
                </div>

                {!isLoggedIn && (
                  <div className="login-suggestion">
                    <i className="bi bi-info-circle"></i>
                    <p>Jelentkezz be a gyorsabb rendeléshez!</p>
                    <a href="/bejelentkezes" className="login-link">Bejelentkezés</a>
                  </div>
                )}

                <form onSubmit={handleCheckout} className="checkout-form">
                  <h3>Szállítási adatok</h3>
                  
                  {isLoggedIn && userProfile?.addresses && userProfile.addresses.length > 0 && (
                    <div className="saved-addresses">
                      <label className="section-label">Mentett címek</label>
                      <div className="address-options">
                        {userProfile.addresses.map((addr) => (
                          <label 
                            key={addr.id} 
                            className={`address-option ${selectedAddressId === addr.id && !useNewAddress ? 'selected' : ''}`}
                          >
                            <input
                              type="radio"
                              name="savedAddress"
                              checked={selectedAddressId === addr.id && !useNewAddress}
                              onChange={() => {
                                setSelectedAddressId(addr.id)
                                setUseNewAddress(false)
                                setDeliveryAddress({
                                  ...deliveryAddress,
                                  address: addr.addressLine,
                                  city: addr.city,
                                  zip: addr.zipCode,
                                  instructions: ''
                                })
                              }}
                            />
                            <div className="address-content">
                              <span className="address-label">{addr.label}</span>
                              <span className="address-detail">
                                {addr.addressLine}, {addr.zipCode} {addr.city}
                              </span>
                            </div>
                          </label>
                        ))}
                        <label className={`address-option ${useNewAddress ? 'selected' : ''}`}>
                          <input
                            type="radio"
                            name="savedAddress"
                            checked={useNewAddress}
                            onChange={() => {
                              setUseNewAddress(true)
                              setSelectedAddressId(null)
                              setDeliveryAddress({
                                ...deliveryAddress,
                                address: '',
                                city: '',
                                zip: '',
                                instructions: ''
                              })
                            }}
                          />
                          <div className="address-content">
                            <span className="address-label">Új cím használata</span>
                          </div>
                        </label>
                      </div>
                    </div>
                  )}

                  <div className="form-group">
                    <label htmlFor="fullName">Név *</label>
                    <input
                      type="text"
                      id="fullName"
                      value={deliveryAddress.fullName}
                      onChange={(e) => setDeliveryAddress({...deliveryAddress, fullName: e.target.value})}
                      placeholder="Teljes név"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="phone">Telefonszám *</label>
                    <input
                      type="tel"
                      id="phone"
                      value={deliveryAddress.phone}
                      onChange={(e) => setDeliveryAddress({...deliveryAddress, phone: e.target.value})}
                      placeholder="+36 30 123 4567"
                      required
                    />
                  </div>

                  {(!isLoggedIn || !userProfile?.addresses || userProfile.addresses.length === 0 || useNewAddress) && (
                    <>
                      <div className="form-group">
                        <label htmlFor="city">Város *</label>
                        <input
                          type="text"
                          id="city"
                          value={deliveryAddress.city}
                          onChange={(e) => setDeliveryAddress({...deliveryAddress, city: e.target.value})}
                          placeholder="Budapest"
                          required
                        />
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="zip">Irányítószám *</label>
                          <input
                            type="text"
                            id="zip"
                            value={deliveryAddress.zip}
                            onChange={(e) => setDeliveryAddress({...deliveryAddress, zip: e.target.value})}
                            placeholder="1234"
                            required
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <label htmlFor="address">Cím (utca, házszám) *</label>
                        <AddressAutocomplete
                          value={deliveryAddress.address}
                          onChange={(value) => setDeliveryAddress({...deliveryAddress, address: value})}
                          onAddressSelect={(addressData) => setDeliveryAddress({
                            ...deliveryAddress,
                            address: addressData.addressLine,
                            city: addressData.city,
                            zip: addressData.zipCode
                          })}
                          placeholder="Utca, házszám, emelet, ajtó"
                          required
                        />
                      </div>
                    </>
                  )}
                  
                  <div className="form-group">
                    <label htmlFor="instructions">További megjegyzések</label>
                    <textarea
                      id="instructions"
                      value={deliveryAddress.instructions}
                      onChange={(e) => setDeliveryAddress({...deliveryAddress, instructions: e.target.value})}
                      placeholder="Pl.: Csengessen kétszer"
                      rows="3"
                    />
                  </div>

                  <h3>Fizetési mód</h3>
                  
                  {isLoggedIn && userProfile?.paymentMethods && userProfile.paymentMethods.length > 0 && (
                    <div className="saved-payment-methods">
                      <label className="section-label">Mentett fizetési módok</label>
                      <div className="payment-options-list">
                        {userProfile.paymentMethods.map((pm) => (
                          <label 
                            key={pm.id} 
                            className={`payment-option ${selectedPaymentId === pm.id ? 'selected' : ''}`}
                          >
                            <input
                              type="radio"
                              name="savedPayment"
                              checked={selectedPaymentId === pm.id}
                              onChange={() => {
                                setSelectedPaymentId(pm.id)
                                setPaymentMethod(pm.type === 'card' ? 'credit-card' : pm.type)
                                setShowCardDetails(false)
                              }}
                            />
                            <div className="payment-content">
                              <span className="payment-icon">
                                {pm.type === 'card' && '💳'}
                                {pm.type === 'cash' && '💵'}
                                {pm.type === 'szep' && '🎫'}
                              </span>
                              <div>
                                <span className="payment-label">{pm.displayName}</span>
                                {pm.lastFourDigits && (
                                  <span className="payment-detail"> •••• {pm.lastFourDigits}</span>
                                )}
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                      <div className="payment-divider">vagy válassz új fizetési módot:</div>
                    </div>
                  )}

                  <div className="payment-methods">
                    <label className={`payment-option ${paymentMethod === 'cash' && !selectedPaymentId ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="payment"
                        value="cash"
                        checked={paymentMethod === 'cash' && !selectedPaymentId}
                        onChange={(e) => {
                          setPaymentMethod(e.target.value)
                          setShowCardDetails(false)
                          setSelectedPaymentId(null)
                        }}
                      />
                      <div className="payment-content">
                        <span className="payment-icon">💵</span>
                        <span>Készpénz kézbesítéskor</span>
                      </div>
                    </label>
                    <label className={`payment-option ${paymentMethod === 'credit-card' && !selectedPaymentId ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="payment"
                        value="credit-card"
                        checked={paymentMethod === 'credit-card' && !selectedPaymentId}
                        onChange={(e) => {
                          setPaymentMethod(e.target.value)
                          setShowCardDetails(true)
                          setSelectedPaymentId(null)
                        }}
                      />
                      <div className="payment-content">
                        <span className="payment-icon">💳</span>
                        <span>Bankkártya</span>
                      </div>
                    </label>
                  </div>

                  {showCardDetails && !selectedPaymentId && (
                    <div className="card-details">
                      <div className="form-group">
                        <label htmlFor="cardNumber">Kártyaszám *</label>
                        <input
                          type="text"
                          id="cardNumber"
                          value={cardDetails.cardNumber}
                          onChange={(e) => setCardDetails({...cardDetails, cardNumber: e.target.value})}
                          placeholder="1234 5678 9012 3456"
                          maxLength="19"
                          required={paymentMethod === 'credit-card' && !selectedPaymentId}
                        />
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="expiry">Lejárat *</label>
                          <input
                            type="text"
                            id="expiry"
                            value={cardDetails.expiry}
                            onChange={(e) => setCardDetails({...cardDetails, expiry: e.target.value})}
                            placeholder="MM/ÉÉ"
                            maxLength="5"
                            required={paymentMethod === 'credit-card' && !selectedPaymentId}
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="cvv">CVV *</label>
                          <input
                            type="text"
                            id="cvv"
                            value={cardDetails.cvv}
                            onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value})}
                            placeholder="123"
                            maxLength="3"
                            required={paymentMethod === 'credit-card' && !selectedPaymentId}
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <label htmlFor="cardName">Kártyabirtokos neve *</label>
                        <input
                          type="text"
                          id="cardName"
                          value={cardDetails.cardName}
                          onChange={(e) => setCardDetails({...cardDetails, cardName: e.target.value})}
                          placeholder="Név a kártyán"
                          required={paymentMethod === 'credit-card' && !selectedPaymentId}
                        />
                      </div>
                    </div>
                  )}

                  <button type="submit" className="checkout-btn">
                    Rendelés leadása
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
