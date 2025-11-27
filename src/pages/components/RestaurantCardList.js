import React from 'react';
import './css/RestaurantCardList.css';
import { useNavigate } from 'react-router-dom';

const restaurants = [
  {
    name: 'Anyukám Mondta',
    cuisine: 'Olasz',
    address: 'Encs, Petőfi Sándor út 57.',
    img: require('../../img/etteremkepek/Lángoló Rostély - Grill & BBQ.png'),
    discount: 20,
    freeDelivery: false,
    acceptCards: true,
    id: 1
  },
  {
    name: 'Végállomás Bistorant',
    cuisine: 'Magyar',  
    address: 'Miskolc, Dorottya u. 1.',
    img: require('../../img/etteremkepek/Lángoló Rostély - Grill & BBQ.png'),
    discount: 10,
    freeDelivery: true,
    acceptCards: true,
    id: 2
  },
  {
    name: "Zip's Brewhouse",
    cuisine: 'Pub',
    address: 'Miskolc, Arany János tér 1.',
    img: require('../../img/etteremkepek/Lángoló Rostély - Grill & BBQ.png'),
    discount: 0,
    freeDelivery: true,
    acceptCards: true,
    id: 3
  },
  {
    name: 'Calypso Kisvendéglő',
    cuisine: 'Magyar',
    address: 'Miskolc, Görgey Artúr u. 23.',
    img: require('../../img/etteremkepek/Lángoló Rostély - Grill & BBQ.png'),
    discount: 0,
    freeDelivery: true,
    acceptCards: true,
    id: 4
  }
];

export default function RestaurantCardList({
  showDiscountOnly = false,
  showFreeDeliveryOnly = false
}) {
  const navigate = useNavigate();
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
