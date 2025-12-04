import React, { useEffect, useState } from 'react';
import './css/RestaurantCardList.css';
import { useNavigate } from 'react-router-dom';

export default function RestaurantCardList({
  showDiscountOnly = false,
  showFreeDeliveryOnly = false
}) {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await fetch('https://localhost:7236/api/Restaurants');
        if (!response.ok) {
          throw new Error('Nem sikerült betölteni az éttermeket.');
        }
        const data = await response.json();

        
        const mapped = data.map((r) => ({
          ...r,
          
          address: `${r.city}, ${r.address}`,
          img: r.image_url,
          freeDelivery: r.free_delivery,
          acceptCards: r.accept_cards,
          
        }));

        setRestaurants(mapped);
      } catch (err) {
        console.error(err);
        setError('Hiba történt az éttermek betöltése közben.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  if (isLoading) {
    return (
      <div className="restaurant-list-section container">
        <p>Étterem lista betöltése...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="restaurant-list-section container">
        <p>{error}</p>
      </div>
    );
  }

  const filteredRestaurants = restaurants.filter((restaurant) => {
    if (showDiscountOnly && restaurant.discount <= 0) {
      return false;
    }
    if (showFreeDeliveryOnly && !restaurant.freeDelivery) {
      return false;
    }
    return true;
  });

  return (
    <div className="restaurant-list-section container">
      <div className="restaurant-cards-grid">
        {filteredRestaurants.map((r) => (
          <div
            className="restaurant-card"
            key={r.id}
            tabIndex={0}
            onClick={() => navigate(`/restaurant/${r.id}`)}
          >
            <img src={r.img} alt={r.name} className="restaurant-img" />
            <div className="restaurant-info">
              <h3 className="restaurant-name">{r.name}</h3>
              <span className="restaurant-cuisine">{r.cuisine}</span>
              <span className="restaurant-address">{r.address}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
