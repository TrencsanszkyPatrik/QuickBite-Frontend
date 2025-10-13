import React, { useState, useEffect } from 'react';
import './css/RestaurantCardList.css';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'https://localhost:7017/api';

export default function RestaurantCardList() {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/Restaurants`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setRestaurants(data);
    } catch (err) {
      console.error('Hiba az éttermek betöltésekor:', err);
      setError('Nem sikerült betölteni az éttermeket. Kérlek, próbáld újra később.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="restaurant-list-section container">
        <h2 className="section-title">Éttermek</h2>
        <div className="loading">Betöltés...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="restaurant-list-section container">
        <h2 className="section-title">Éttermek</h2>
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="restaurant-list-section container">
      <h2 className="section-title">Éttermek</h2>
      <div className="restaurant-cards-grid">
        {restaurants.map((restaurant) => (
          <div
            className="restaurant-card"
            key={restaurant.id}
            tabIndex={0}
            onClick={() => navigate(`/restaurant/${restaurant.id}`)}
          >
            <img 
              src={require('../../img/etteremkepek/Lángoló Rostély - Grill & BBQ.png')} 
              alt={restaurant.name} 
              className="restaurant-img" 
            />
            <div className="restaurant-info">
              <h3 className="restaurant-name">{restaurant.name}</h3>
              <span className="restaurant-cuisine">{restaurant.description}</span>
              <span className="restaurant-address">
                {restaurant.city}, {restaurant.addressLine1}
              </span>
              <div className="restaurant-meta">
                <span className="min-order">Min. rendelés: {restaurant.minOrderAmount} Ft</span>
                <span className="delivery-fee">Szállítás: {restaurant.deliveryFee} Ft</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
