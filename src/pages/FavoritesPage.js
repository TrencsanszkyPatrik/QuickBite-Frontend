import React from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import '../styles/homepage.css'
import '../styles/FavoritesPage.css'
import '../styles/RestaurantCardList.css'
import { usePageTitle } from '../utils/usePageTitle'

export default function FavoritesPage({ favorites = [], pendingFavoriteIds, onToggleFavorite }) {
  usePageTitle('QuickBite - Kedvencek')
  const navigate = useNavigate()


  return (
    <>
      <Navbar />
      <div className="container" style={{ paddingBottom: "00rem" }}>
        <h1 className="section-title" style={{ marginTop: "-2rem", marginBottom: "-3rem" }}>
          Kedvenc éttermeid
        </h1>

        {favorites.length === 0 ? (
          <div className="empty-favorites">
            <div className="empty-favorites-icon">😞</div>
            <h2>Még nincsenek kedvenc éttermeid</h2>
            <p>Fedezz fel új ízeket és mentsd el a kedvenceidet!</p>
            <button 
              className="favorites-button"
              onClick={() => navigate('/ettermek')}
            >
              Éttermeink böngészése
            </button>
          </div>
        ) : (
          <div className="restaurant-list-section container">
            <div className="favorites-stats">
              <span>{favorites.length} kedvenc étterem</span>
            </div>
            <div className="restaurant-cards-grid">
              {favorites.map((r) => (
                <div
                  className="restaurant-card"
                  key={r.id}
                  tabIndex={0}
                  onClick={() => navigate(`/restaurant/${r.id}`)}
                >
                  {(() => {
                    const isPending = pendingFavoriteIds?.has(String(r.id))
                    return (
                      <button
                        className={`favorite-btn favorite-btn--active favorite-btn--bounce ${
                          isPending ? 'favorite-btn--loading' : ''
                        }`}
                        onClick={(e) => {
                          e.stopPropagation()
                          if (onToggleFavorite) {
                            onToggleFavorite(r)
                          }
                        }}
                        aria-label="Eltávolítás a kedvencek közül"
                        disabled={isPending}
                        aria-busy={isPending}
                      >
                        {isPending ? (
                          <span className="favorite-spinner" aria-hidden="true" />
                        ) : (
                          '♥'
                        )}
                      </button>
                    )
                  })()}
                  <img src={r.img} alt={r.name} className="restaurant-img" />
                  <div className="restaurant-info">
                    <h3 className="restaurant-name">{r.name}</h3>
                    <span className="restaurant-address">{r.address}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  )
}

