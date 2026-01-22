import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../../src/pages//components//css/RestaurantDetails.css';
import Navbar from './components/Navbar';

export default function RestaurantDetails({ favorites = [], onToggleFavorite }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRestaurantAndMenu = async () => {
      try {
        setIsLoading(true);
        const [restaurantRes, menuRes] = await Promise.all([
          fetch(`https://localhost:7236/api/Restaurants/${id}`),
          fetch(`https://localhost:7236/api/MenuItems/restaurant/${id}`)
        ]);

        if (!restaurantRes.ok) {
          throw new Error('Nem sikerült betölteni az étterem adatait.');
        }

        const restaurantData = await restaurantRes.json();
        
        const categoriesRes = await fetch('https://localhost:7236/api/Categories');
        const categories = await categoriesRes.json();
        const cuisine = categories.find(c => c.id === restaurantData.cuisine_id);

        const mappedRestaurant = {
          ...restaurantData,
          id: String(restaurantData.id),
          address: `${restaurantData.city}, ${restaurantData.address}`,
          img: restaurantData.image_url,
          cuisine: cuisine?.name || 'Ismeretlen'
        };

        setRestaurant(mappedRestaurant);

        if (menuRes.ok) {
          const menuData = await menuRes.json();
          const mappedMenu = menuData.map(item => ({
            name: item.name,
            price: item.price,
            img: item.image_url || '/img/EtelKepek/default.png',
            desc: item.description || '',
            category: item.category
          }));
          setMenuItems(mappedMenu);
        }
      } catch (err) {
        console.error(err);
        setError(err.message || 'Hiba történt az adatok betöltése közben.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRestaurantAndMenu();
  }, [id]);

  const isFavorite = restaurant
    ? favorites.some((fav) => String(fav.id) === String(restaurant.id))
    : false;

  if (isLoading) {
    return (
      <div className="container">
        <p>Betöltés...</p>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="container">
        <h2>{error || 'Étterem nem található'}</h2>
      </div>
    );
  }

  return (
    <>
    <Navbar/>
    <div className="restaurant-details-page container">
      
      <div className="restaurant-details-header">
        <img src={restaurant.img} alt={restaurant.name} className="restaurant-details-img" />
        <div className="restaurant-details-info">
          <div className="restaurant-title-row">
            <div className="restaurant-title-section">
              <h1>{restaurant.name}</h1>
              {restaurant.discount > 0 && (
                <span className="discount-badge">-{restaurant.discount}%</span>
              )}
            </div>
            <button
              className={`favorite-btn favorite-btn--details ${
                isFavorite ? "favorite-btn--active" : ""
              }`}
              onClick={() => onToggleFavorite && onToggleFavorite(restaurant)}
            >
              {isFavorite ? "♥ Kedvenc" : "♡ Kedvencekhez"}
            </button>
          </div>
          <div className="restaurant-details-meta">
            <span className="cuisine">{restaurant.cuisine}</span> • <span className="address">{restaurant.address}</span>
          </div>
          {restaurant.description_long && (
            <p className="restaurant-description">{restaurant.description_long}</p>
          )}
          <div className="restaurant-features">
            {restaurant.free_delivery && (
              <div className="feature-badge feature-badge--delivery">
                <i className="bi bi-truck"></i>
                <span>Ingyenes kiszállítás</span>
              </div>
            )}
            {restaurant.accept_cards && (
              <div className="feature-badge feature-badge--card">
                <i className="bi bi-credit-card"></i>
                <span>Kártyás fizetés</span>
              </div>
            )}
          </div>
        </div>
      </div>
      <h2 className="menu-title">Étlap</h2>
      {menuItems.length === 0 ? (
        <p>Jelenleg nincs elérhető menü elem.</p>
      ) : (
        <div className="menu-container">
          {Object.entries(
            menuItems.reduce((acc, item) => {
              const category = item.category || 'Egyéb';
              if (!acc[category]) acc[category] = [];
              acc[category].push(item);
              return acc;
            }, {})
          ).map(([category, items], categoryIdx) => (
            <div className="menu-category-section" key={category}>
              <h3 className="category-title">{category}</h3>
              <div className={`menu-grid menu-grid--${categoryIdx % 2 === 0 ? 'alternate' : 'standard'}`}>
                {items.map((item, idx) => (
                  <div 
                    className={`menu-card menu-card--${idx % 3 === 0 ? 'featured' : idx % 3 === 1 ? 'medium' : 'compact'}`}
                    key={`${category}-${idx}`}
                  >
                    <div className="menu-card-image-wrapper">
                      <img src={item.img} alt={item.name} className="menu-img" />
                      <div className="menu-card-overlay">
                        <button className="btn btn-primary btn-overlay">Kosárba</button>
                      </div>
                    </div>
                    <div className="menu-info">
                      <div className="menu-header">
                        <h3>{item.name}</h3>
                        <span className="menu-price">{item.price} Ft</span>
                      </div>
                      {item.desc && <p className="menu-desc">{item.desc}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
    </>
  );
}
