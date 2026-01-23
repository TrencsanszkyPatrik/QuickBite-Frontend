import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import '../pages/components/css/homepage.css';
import RestaurantCardList from './components/RestaurantCardList';
import '../../src/pages/components/css/CuisineList.css';
import '../../src/pages/components/css/AllRestaurantPage.css';
import { usePageTitle } from '../utils/usePageTitle';

export default function AllRestaurantPage({ favorites = [], onToggleFavorite }) {
  usePageTitle("QuickBite - Éttermeink");
  const [showDiscountOnly, setShowDiscountOnly] = useState(false);
  const [showFreeDeliveryOnly, setShowFreeDeliveryOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); 

  return (
    <>
      <Navbar />
      <div className="all-restaurants-page container">
        <h1 className="section-title" style={{ marginTop: "1rem" }}>
          Böngéssz éttermeket, vagy keress kedvenceidre!
        </h1>

        <div className="restaurant-filters">
          <input
            type="text"
            className="restaurant-search"
            placeholder="🔍 Étterem neve, cím, konyha..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)} 
          />

          <div className="filter-options">
            <label>
              <input
                type="checkbox"
                checked={showFreeDeliveryOnly}
                onChange={(e) => setShowFreeDeliveryOnly(e.target.checked)}
              />
              <span>Ingyenes kiszállítás</span>
            </label>

            <label>
              <input type="checkbox" />
              <span>Bankkártyás fizetés</span>
            </label>

            <label>
              <input
                type="checkbox"
                checked={showDiscountOnly}
                onChange={(e) => setShowDiscountOnly(e.target.checked)}
              />
              <span>Akciós ajánlatok</span>
            </label>

            <label>
              <input type="checkbox" />
              <span>Nyitva most</span>
            </label>
          </div>
        </div>

        <div style={{ marginTop: "2rem" }}>
          <RestaurantCardList
            showDiscountOnly={showDiscountOnly}
            showFreeDeliveryOnly={showFreeDeliveryOnly}
            searchQuery={searchQuery} // <-- ÁTADJUK
            favorites={favorites}
            onToggleFavorite={onToggleFavorite}
          />
        </div>
      </div>

      <Footer />
    </>
  )
}
