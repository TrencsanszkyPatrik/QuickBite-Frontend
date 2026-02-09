import React, { useState, useCallback, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import '../styles/homepage.css'
import '../styles/restaurant-map.css'
import { API_BASE } from '../utils/api'

export default function RestaurantMap() {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [restaurants, setRestaurants] = useState([])
  const miskolcCenter = [48.1031, 20.7784]
  const mapRef = useRef(null)

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await fetch(`${API_BASE}/Restaurants`)
        if (!response.ok) {
          throw new Error('Nem sikerült betölteni az éttermeket a térképhez.')
        }
        const data = await response.json()
        const mapped = data.map((r) => ({
          id: r.id,
          name: r.name,
          position: [r.latitude, r.longitude],
          description: r.description,
          image_url: r.image_url,
          phone: r.phone,
          email: r.email,
          city: r.city,
          address: r.address,
          delivery_time: r.delivery_time,
          min_order_value: r.min_order_value,
          free_delivery: r.free_delivery,
          rating: r.rating,
          review_count: r.review_count
        }))
        setRestaurants(mapped)
      } catch (err) {
        console.error(err)
      }
    }
    fetchRestaurants()
  }, [])

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        close()
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', onKeyDown)
      if (mapRef.current) {
        setTimeout(() => mapRef.current.invalidateSize(), 50)
      }
    }
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isOpen, close])

  return (
    <>
      <button className="btn btn-secondary restaurant-map-open-btn" onClick={open} aria-haspopup="dialog">
        Térkép
      </button>
      {isOpen && createPortal(
        (
          <div className="restaurant-map-modal-overlay" onClick={close}>
            <div
              className="restaurant-map-modal"
              role="dialog"
              aria-modal="true"
              aria-label="Étterem térkép és kereső"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="restaurant-map-modal-header">
                <h2 className="restaurant-map-title">Keresés térképen</h2>
                <button className="btn restaurant-map-close-btn" onClick={close} aria-label="Térkép bezárása">✕</button>
              </div>
              <div className="restaurant-map-search">
                <input type="text" placeholder="📍 Cím vagy terület" aria-label="Cím vagy terület" />
                <input type="text" placeholder="🍕 Étel vagy étterem" aria-label="Étel vagy étterem" />
                <button className="btn btn-primary">Keresés</button>
              </div>
              <div className="restaurant-map-map-section">
                <MapContainer
                  whenCreated={(map) => {
                    mapRef.current = map
                    setTimeout(() => map.invalidateSize(), 50)
                  }}
                  className="restaurant-map-leaflet"
                  center={miskolcCenter}
                  zoom={13}
                  scrollWheelZoom={true}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {restaurants.map((restaurant) => (
                    <Marker 
                      key={restaurant.id} 
                      position={restaurant.position}
                    >
                      <Popup>
                        <div className="restaurant-map-popup">
                          {restaurant.image_url && (
                            <img 
                              src={restaurant.image_url} 
                              alt={restaurant.name}
                              className="restaurant-map-popup-img"
                            />
                          )}
                          <div className="restaurant-map-popup-content">
                            <h3 className="restaurant-map-popup-name">{restaurant.name}</h3>
                            <p className="restaurant-map-popup-description">{restaurant.description}</p>
                            <div className="restaurant-map-popup-info">
                              {restaurant.rating && (
                                <span className="restaurant-map-popup-rating">⭐ {restaurant.rating}</span>
                              )}
                              {restaurant.delivery_time && (
                                <span className="restaurant-map-popup-delivery">🚚 {restaurant.delivery_time} perc</span>
                              )}
                            </div>
                            <div className="restaurant-map-popup-details">
                              <p><strong>Cím:</strong> {restaurant.city}, {restaurant.address}</p>
                              {restaurant.phone && <p><strong>Telefon:</strong> {restaurant.phone}</p>}
                              {restaurant.email && <p><strong>Email:</strong> {restaurant.email}</p>}
                              {restaurant.min_order_value && (
                                <p><strong>Minimális rendelés:</strong> {restaurant.min_order_value} Ft</p>
                              )}
                              
                              <button 
                                className="restaurant-map-popup-button"
                                onClick={() => navigate(`/restaurant/${restaurant.id}`)}
                              >
                                Étterem oldala →
                              </button>
                            </div>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            </div>
          </div>
        ),
        document.body
      )}
    </>
  )
}
