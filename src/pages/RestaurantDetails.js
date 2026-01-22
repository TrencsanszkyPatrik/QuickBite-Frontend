import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../../src/pages//components//css/RestaurantDetails.css';

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
    <div className="restaurant-details-page container">
      <button className="back-btn" onClick={() => navigate(-1)}>← Vissza</button>
      <div className="restaurant-details-header">
        <img src={restaurant.img} alt={restaurant.name} className="restaurant-details-img" />
        <div className="restaurant-details-info">
          <div className="restaurant-title-row">
            <h1>{restaurant.name}</h1>
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
        </div>
      </div>
      <h2 className="menu-title">Étlap</h2>
      {menuItems.length === 0 ? (
        <p>Jelenleg nincs elérhető menü elem.</p>
      ) : (
        <div className="menu-grid">
          {menuItems.map((item, idx) => (
            <div className="menu-card" key={idx}>
              <img src={item.img} alt={item.name} className="menu-img" />
              <div className="menu-info">
                <h3>{item.name}</h3>
                {item.desc && <p className="menu-desc">{item.desc}</p>}
                <div className="menu-bottom">
                  <span className="menu-price">{item.price} Ft</span>
                  <button className="btn btn-primary">Kosárba</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
