import React, { useState, useCallback, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup, useMap, CircleMarker } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import '../styles/homepage.css'
import '../styles/restaurant-map.css'
import { API_BASE, GEOAPIFY_API_KEY } from '../utils/api'

// Belső komponens a useMap hook kezeléséhez
function MapContent({ restaurants, navigate, setMapInstance, searchPosition }) {
  const map = useMap()

  useEffect(() => {
    setMapInstance(map)
  }, [map, setMapInstance])

  const createRestaurantIcon = (imageUrl) => {
    return L.divIcon({
      html: `
        <div style="
          width: 60px;
          height: 60px;
          border-radius: 50%;
          border: 3px solid white;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          background-size: cover;
          background-position: center;
          background-image: url('${imageUrl}');
        "></div>
      `,
      iconSize: [50, 50],
      className: 'restaurant-map-custom-icon'
    })
  }

  return (
    <>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {searchPosition && (
        <CircleMarker
          center={searchPosition}
          radius={12}
          weight={3}
          color="#FF6B6B"
          fillColor="#FF6B6B"
          fillOpacity={0.7}
        />
      )}
      {restaurants.map((restaurant) => (
        <Marker 
          key={restaurant.id} 
          position={restaurant.position}
          icon={restaurant.image_url ? createRestaurantIcon(restaurant.image_url) : undefined}
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
    </>
  )
}

export default function RestaurantMap() {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [restaurants, setRestaurants] = useState([])
  const [searchAddress, setSearchAddress] = useState('')
  const [mapInstance, setMapInstance] = useState(null)
  const [searchPosition, setSearchPosition] = useState(null)
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

  const handleSearch = async () => {
    if (!searchAddress.trim() || !mapInstance) return

    try {
      const url = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(searchAddress)}&apiKey=${GEOAPIFY_API_KEY}`
      console.log('Keresés URL:', url)
      
      const response = await fetch(url)
      const data = await response.json()
      console.log('Geoapify válasz:', data)
      
      if (data.features && data.features.length > 0) {
        const result = data.features[0]
        const { lat, lon } = result.properties
        
        console.log('Talált pozíció:', lat, lon)
        setSearchPosition([lat, lon])
        mapInstance.setView([lat, lon], 14)
        console.log('Térkép mozgatva')
      } else {
        console.warn('Nincs találat a kereséshez')
      }
    } catch (err) {
      console.error('Keresési hiba:', err)
    }
  }

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

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
                <input 
                  type="text" 
                  placeholder="📍 Cím vagy terület" 
                  aria-label="Cím vagy terület"
                  value={searchAddress}
                  onChange={(e) => setSearchAddress(e.target.value)}
                  onKeyPress={handleSearchKeyPress}
                />
                <button className="btn btn-primary" onClick={handleSearch}>Keresés</button>
              </div>
              <div className="restaurant-map-map-section">
                <MapContainer
                  className="restaurant-map-leaflet"
                  center={miskolcCenter}
                  zoom={13}
                  scrollWheelZoom={true}
                >
                  <MapContent restaurants={restaurants} navigate={navigate} setMapInstance={setMapInstance} searchPosition={searchPosition} />
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
