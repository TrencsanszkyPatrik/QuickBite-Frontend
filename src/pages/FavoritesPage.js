import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import '../pages/components/css/homepage.css';
import '../pages/components/css/RestaurantCardList.css';

export default function FavoritesPage({ favorites = [], onToggleFavorite }) {
  const navigate = useNavigate();

  return (
    <>
      <Navbar />
      <div className="container" style={{ paddingBottom: "3rem" }}>
        <h1 className="section-title" style={{ marginTop: "1.5rem" }}>
          Kedvenc éttermeid
        </h1>

        {favorites.length === 0 ? (
          <p style={{ marginTop: "1rem" }}>
            Még nincsenek kedvenc éttermeid. Böngéssz az{" "}
            <span
              style={{ cursor: "pointer", color: "#3B3355", fontWeight: 600 }}
              onClick={() => navigate("/ettermek")}
            >
              éttermeink között
            </span>
            , és jelöld őket kedvencként!
          </p>
        ) : (
          <div className="restaurant-list-section container">
            <div className="restaurant-cards-grid">
              {favorites.map((r) => (
                <div
                  className="restaurant-card"
                  key={r.id}
                  tabIndex={0}
                  onClick={() => navigate(`/restaurant/${r.id}`)}
                >
                  <button
                    className="favorite-btn favorite-btn--active"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onToggleFavorite) {
                        onToggleFavorite(r);
                      }
                    }}
                    aria-label="Eltávolítás a kedvencek közül"
                  >
                    ♥
                  </button>
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
  );
}


