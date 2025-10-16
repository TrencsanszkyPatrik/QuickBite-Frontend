import React from 'react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import '../pages/components/css/homepage.css'
import RestaurantCardList from './components/RestaurantCardList'
import '../../src/pages/components/css/CuisineList.css'
import '../../src/pages/components/css/AllRestaurantPage.css'

export default function AllRestaurantPage() {
  return (
    <>
      <Navbar />
      <div className="all-restaurants-page container">
        <h1 className="section-title" style={{ marginTop: "1rem" }}>Éttermeink</h1>
        <div className="restaurant-filters">
          <input
            type="text"
            className="restaurant-search"
            placeholder="🔍 Étterem neve, cím, konyha..."
          />
          <div className="filter-options">
            <label>
              <input type="checkbox" />
              <span>Ingyenes kiszállítás</span>
            </label>
            <label>
              <input type="checkbox" />
              <span>Bankkártyás fizetés</span>
            </label>
            <label>
              <input type="checkbox" />
              <span>Akciós ajánlatok</span>
            </label>
            <label>
              <input type="checkbox" />
              <span>Nyitva most</span>
            </label>
          </div>
        </div>
        <div style={{ marginTop: "2rem" }}>
          <RestaurantCardList />
        </div>
      </div>
      <Footer />
    </>
  )
}
