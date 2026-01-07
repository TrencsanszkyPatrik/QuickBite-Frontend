import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../../src/pages//components//css/RestaurantDetails.css';


// Dummy étterem adatok (képek, cím, konyha, menü, menü képek)
const restaurants = [
  {
    id: '1',
    name: 'Anyukám Mondta',
    cuisine: 'Olasz',
    address: 'Encs, Petőfi Sándor út 57.',
    img: '/img/etteremkepek/anyukam.jpg',
    menu: [
      { name: 'Margherita pizza', price: 2490, img: '/img/EtelKepek/MargaretaPizza.png', desc: 'Paradicsomos, mozzarellás klasszikus.' },
      { name: 'Carbonara spagetti', price: 2890, img: '/img/EtelKepek/CarbonaraSpagetti.png', desc: 'Krémes, szalonnás tészta.' },
      { name: 'Tiramisu', price: 1690, img: '/img/EtelKepek/Tiramisu.png', desc: 'Olasz desszert, kávéval és mascarponéval.' },
    ],
  },
  {
    id: '2',
    name: 'Végállomás Bistorant',
    cuisine: 'Magyar',
    address: 'Miskolc, Dorottya u. 1.',
    img: '/img/etteremkepek/vegallomas.jpg',
    menu: [
      { name: 'Rántott hús', price: 2990, img: '/img/EtelKepek/Rantotthus.png', desc: 'Ropogós panír, friss köret.' },
      { name: 'Gulyásleves', price: 1990, img: '/img/EtelKepek/Gulyasleves.png', desc: 'Hagyományos magyar leves.' },
      { name: 'Somlói galuska', price: 1490, img: '/img/EtelKepek/SomloiGaluska.png', desc: 'Kedvelt magyar desszert.' },
    ],
  },
  {
    id: '3',
    name: "Zip's Brewhouse",
    cuisine: 'Pub',
    address: 'Miskolc, Arany János tér 1.',
    img: '/img/etteremkepek/zip.jpg',
    menu: [
      { name: 'BBQ burger', price: 3190, img: '/img/EtelKepek/BbqBurger.png', desc: 'Füstös BBQ szósz, szaftos hús.' },
      { name: 'Sült krumpli', price: 990, img: '/img/EtelKepek/Sultkrumpli.png', desc: 'Ropogós, aranybarna.' },
      { name: 'Kézműves sör', price: 1290, img: '/img/EtelKepek/KezmuvesSor.png', desc: 'Helyben főzött sör.' },
    ],
  },
  {
    id: '4',
    name: 'Calypso Kisvendéglő',
    cuisine: 'Magyar',
    address: 'Miskolc, Görgey Artúr u. 23.',
    img: '/img/etteremkepek/calypso.jpg',
    menu: [
      { name: 'Húsleves', price: 1790, img: '/img/EtelKepek/Husleves.png', desc: 'Házi, gazdag húsleves.' },    
      { name: 'Palacsinta', price: 990, img: '/img/EtelKepek/Palacsinta.png', desc: 'Töltött, édes palacsinta.' },
    ],
  },
];

export default function RestaurantDetails({ favorites = [], onToggleFavorite }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const restaurant = restaurants.find(r => r.id === id);
  const isFavorite = restaurant
    ? favorites.some((fav) => String(fav.id) === String(restaurant.id))
    : false;

  if (!restaurant) return (
    <div className="container"><h2>Étterem nem található</h2></div>
  );

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
      <div className="menu-grid">
        {restaurant.menu.map((item, idx) => (
          <div className="menu-card" key={idx}>
            <img src={item.img} alt={item.name} className="menu-img" />
            <div className="menu-info">
              <h3>{item.name}</h3>
              <p className="menu-desc">{item.desc}</p>
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
