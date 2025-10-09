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
    img: require('../img/etteremkepek/Lángoló Rostély - Grill & BBQ.png'),
    menu: [
      { name: 'Margherita pizza', price: 2490, img: require('../img/etteremkepek/Lángoló Rostély - Grill & BBQ.png'), desc: 'Paradicsomos, mozzarellás klasszikus.' },
      { name: 'Carbonara spagetti', price: 2890, img: require('../img/etteremkepek/Lángoló Rostély - Grill & BBQ.png'), desc: 'Krémes, szalonnás tészta.' },
      { name: 'Tiramisu', price: 1690, img: require('../img/etteremkepek/Lángoló Rostély - Grill & BBQ.png'), desc: 'Olasz desszert, kávéval és mascarponéval.' },
    ],
  },
  {
    id: '2',
    name: 'Végállomás Bistorant',
    cuisine: 'Magyar',
    address: 'Miskolc, Dorottya u. 1.',
    img: require('../img/etteremkepek/Lángoló Rostély - Grill & BBQ.png'),
    menu: [
      { name: 'Rántott hús', price: 2990, img: require('../img/etteremkepek/Lángoló Rostély - Grill & BBQ.png'), desc: 'Ropogós panír, friss köret.' },
      { name: 'Gulyásleves', price: 1990, img: require('../img/etteremkepek/Lángoló Rostély - Grill & BBQ.png'), desc: 'Hagyományos magyar leves.' },
      { name: 'Somlói galuska', price: 1490, img: require('../img/etteremkepek/Lángoló Rostély - Grill & BBQ.png'), desc: 'Kedvelt magyar desszert.' },
    ],
  },
  {
    id: '3',
    name: "Zip's Brewhouse",
    cuisine: 'Pub',
    address: 'Miskolc, Arany János tér 1.',
    img: require('../img/etteremkepek/Lángoló Rostély - Grill & BBQ.png'),
    menu: [
      { name: 'BBQ burger', price: 3190, img: require('../img/etteremkepek/Lángoló Rostély - Grill & BBQ.png'), desc: 'Füstös BBQ szósz, szaftos hús.' },
      { name: 'Sült krumpli', price: 990, img: require('../img/etteremkepek/Lángoló Rostély - Grill & BBQ.png'), desc: 'Ropogós, aranybarna.' },
      { name: 'Kézműves sör', price: 1290, img: require('../img/etteremkepek/Lángoló Rostély - Grill & BBQ.png'), desc: 'Helyben főzött sör.' },
    ],
  },
  {
    id: '4',
    name: 'Calypso Kisvendéglő',
    cuisine: 'Magyar',
    address: 'Miskolc, Görgey Artúr u. 23.',
    img: require('../img/etteremkepek/Lángoló Rostély - Grill & BBQ.png'),
    menu: [
      { name: 'Húsleves', price: 1790, img: require('../img/etteremkepek/Lángoló Rostély - Grill & BBQ.png'), desc: 'Házi, gazdag húsleves.' },
      { name: 'Roston csirke', price: 2590, img: require('../img/etteremkepek/Lángoló Rostély - Grill & BBQ.png'), desc: 'Szaftos csirkemell, grillezve.' },
      { name: 'Palacsinta', price: 990, img: require('../img/etteremkepek/Lángoló Rostély - Grill & BBQ.png'), desc: 'Töltött, édes palacsinta.' },
    ],
  },
];

export default function RestaurantDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const restaurant = restaurants.find(r => r.id === id);

  if (!restaurant) return (
    <div className="container"><h2>Étterem nem található</h2></div>
  );

  return (
    <div className="restaurant-details-page container">
      <button className="back-btn" onClick={() => navigate(-1)}>← Vissza</button>
      <div className="restaurant-details-header">
        <img src={restaurant.img} alt={restaurant.name} className="restaurant-details-img" />
        <div className="restaurant-details-info">
          <h1>{restaurant.name}</h1>
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
