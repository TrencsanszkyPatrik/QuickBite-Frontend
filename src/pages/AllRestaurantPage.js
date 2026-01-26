import React, { useState, useEffect } from 'react';
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
  const [showCardPaymentOnly, setShowCardPaymentOnly] = useState(false);
  const [showOpenNowOnly, setShowOpenNowOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('https://localhost:7236/api/Categories');
        if (!response.ok) {
          throw new Error('Nem sikerült betölteni a kategóriákat.');
        }
        const data = await response.json();
        setCategories(data);
      } catch (err) {
        console.error('Hiba történt a kategóriák betöltése közben:', err);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []); 

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
            <button
              className={`filter-btn ${showFreeDeliveryOnly ? 'selected' : ''}`}
              onClick={() => setShowFreeDeliveryOnly(!showFreeDeliveryOnly)}
            >
              Ingyenes kiszállítás
            </button>

            <button
              className={`filter-btn ${showCardPaymentOnly ? 'selected' : ''}`}
              onClick={() => setShowCardPaymentOnly(!showCardPaymentOnly)}
            >
              Bankkártyás fizetés
            </button>

            <button
              className={`filter-btn ${showDiscountOnly ? 'selected' : ''}`}
              onClick={() => setShowDiscountOnly(!showDiscountOnly)}
            >
              Akciós ajánlatok
            </button>

            <button
              className={`filter-btn ${showOpenNowOnly ? 'selected' : ''}`}
              onClick={() => setShowOpenNowOnly(!showOpenNowOnly)}
            >
              Nyitva most
            </button>
          </div>

          <div className="category-filter">
            
            <div className="category-buttons">
              <button
                className={`category-btn ${selectedCategoryId === null ? 'selected' : ''}`}
                onClick={() => setSelectedCategoryId(null)}
              >
                Összes
              </button>
              {!isLoadingCategories && categories.map((category) => (
                <button
                  key={category.id}
                  className={`category-btn ${selectedCategoryId === category.id ? 'selected' : ''}`}
                  onClick={() => setSelectedCategoryId(
                    selectedCategoryId === category.id ? null : category.id
                  )}
                >
                  <span className="category-icon">{category.icon}</span>
                  <span className="category-name">{category.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ marginTop: "2rem" }}>
          <RestaurantCardList
            showDiscountOnly={showDiscountOnly}
            showFreeDeliveryOnly={showFreeDeliveryOnly}
            selectedCuisineId={selectedCategoryId}
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
