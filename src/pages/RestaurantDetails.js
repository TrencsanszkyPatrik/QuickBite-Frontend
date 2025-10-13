import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../../src/pages//components//css/RestaurantDetails.css';

const API_BASE_URL = 'https://localhost:7017/api';

export default function RestaurantDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRestaurantDetails();
  }, [id]);

  const fetchRestaurantDetails = async () => {
    try {
      setLoading(true);
      
      // Éttermi adatok betöltése
      const restaurantResponse = await fetch(`${API_BASE_URL}/Restaurants/${id}`);
      if (!restaurantResponse.ok) {
        throw new Error(`HTTP error! status: ${restaurantResponse.status}`);
      }
      const restaurantData = await restaurantResponse.json();
      setRestaurant(restaurantData);

      // Menü tételek betöltése (ha van külön endpoint)
      try {
        const menuResponse = await fetch(`${API_BASE_URL}/Restaurants/${id}/MenuItems`);
        if (menuResponse.ok) {
          const menuData = await menuResponse.json();
          setMenuItems(menuData);
        } else {
          // Ha nincs külön menü endpoint, dummy adatokat használunk
          setMenuItems([
            { 
              id: '1', 
              name: 'Margherita pizza', 
              price: 2490, 
              description: 'Paradicsomos, mozzarellás klasszikus.',
              imageUrl: null
            },
            { 
              id: '2', 
              name: 'Carbonara spagetti', 
              price: 2890, 
              description: 'Krémes, szalonnás tészta.',
              imageUrl: null
            },
            { 
              id: '3', 
              name: 'Tiramisu', 
              price: 1690, 
              description: 'Olasz desszert, kávéval és mascarponéval.',
              imageUrl: null
            }
          ]);
        }
      } catch (menuErr) {
        console.warn('Menü betöltési hiba, dummy adatok használata:', menuErr);
        // Dummy menü adatok
        setMenuItems([
          { 
            id: '1', 
            name: 'Margherita pizza', 
            price: 2490, 
            description: 'Paradicsomos, mozzarellás klasszikus.',
            imageUrl: null
          },
          { 
            id: '2', 
            name: 'Carbonara spagetti', 
            price: 2890, 
            description: 'Krémes, szalonnás tészta.',
            imageUrl: null
          },
          { 
            id: '3', 
            name: 'Tiramisu', 
            price: 1690, 
            description: 'Olasz desszert, kávéval és mascarponéval.',
            imageUrl: null
          }
        ]);
      }
    } catch (err) {
      console.error('Hiba az étterem betöltésekor:', err);
      setError('Nem sikerült betölteni az étterem adatait. Kérlek, próbáld újra később.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="restaurant-details-page container">
        <button className="back-btn" onClick={() => navigate(-1)}>← Vissza</button>
        <div className="loading">Betöltés...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="restaurant-details-page container">
        <button className="back-btn" onClick={() => navigate(-1)}>← Vissza</button>
        <div className="error">{error}</div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="restaurant-details-page container">
        <button className="back-btn" onClick={() => navigate(-1)}>← Vissza</button>
        <div className="error">Étterem nem található</div>
      </div>
    );
  }

  return (
    <div className="restaurant-details-page container">
      <button className="back-btn" onClick={() => navigate(-1)}>← Vissza</button>
      <div className="restaurant-details-header">
        <img 
          src={require('../img/etteremkepek/Lángoló Rostély - Grill & BBQ.png')} 
          alt={restaurant.name} 
          className="restaurant-details-img" 
        />
        <div className="restaurant-details-info">
          <h1>{restaurant.name}</h1>
          <div className="restaurant-details-meta">
            <span className="cuisine">{restaurant.description}</span> • 
            <span className="address">{restaurant.city}, {restaurant.addressLine1}</span>
          </div>
          <div className="restaurant-details-extra">
            <span className="min-order">Min. rendelés: {restaurant.minOrderAmount} Ft</span>
            <span className="delivery-fee">Szállítás: {restaurant.deliveryFee} Ft</span>
            <span className="prep-time">Előkészítés: {restaurant.avgPrepTimeMinutes} perc</span>
          </div>
        </div>
      </div>
      <h2 className="menu-title">Étlap</h2>
      <div className="menu-grid">
        {menuItems.map((item) => (
          <div className="menu-card" key={item.id}>
            <img 
              src={item.imageUrl || require('../img/etteremkepek/Lángoló Rostély - Grill & BBQ.png')} 
              alt={item.name} 
              className="menu-img" 
            />
            <div className="menu-info">
              <h3>{item.name}</h3>
              <p className="menu-desc">{item.description}</p>
              <div className="menu-bottom">
                <span className="menu-price">{item.price} Ft</span>
                <button className="btn btn-primary">Kosárba</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}