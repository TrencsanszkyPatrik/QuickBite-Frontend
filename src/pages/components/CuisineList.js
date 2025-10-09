import React from 'react';
import './css/CuisineList.css';

const cuisines = [
  {
    icon: '🍝',
    title: 'Olasz',
    meta: '23 étterem',
  },
  {
    icon: '🍜',
    title: 'Ázsiai',
    meta: '31 étterem',
  },
  {
    icon: '🌮',
    title: 'Mexikói',
    meta: '18 étterem',
  },
  {
    icon: '🍔',
    title: 'Amerikai',
    meta: '27 étterem',
  },
  {
    icon: '🍛',
    title: 'Indiai',
    meta: '15 étterem',
  },
  {
    icon: '🥙',
    title: 'Mediterrán',
    meta: '12 étterem',
  },
];

export default function CuisineList() {
  const [selectedRestaurant, setSelectedRestaurant] = React.useState(null);

  return (
    <div>
      <div className="cuisine-list-section container">
        <h2 className="section-title">Böngéssz konyhatípus szerint</h2>
        <div className="cuisines-grid">
          {cuisines.map((cuisine, idx) => (
            <div className="cuisine-card" key={idx}>
              <div className="cuisine-icon">{cuisine.icon}</div>
              <span className="cuisine-title">{cuisine.title}</span>
              <span className="cuisine-meta">{cuisine.meta}</span>
            </div>
          ))}
        </div>
      </div>
      </div>
  );
}
