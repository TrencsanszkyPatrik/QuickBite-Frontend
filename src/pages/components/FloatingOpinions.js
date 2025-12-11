import React, { useEffect, useState } from 'react';
import './css/homepage.css';

const opinionsList = [
  {
    name: 'Kovács Péter',
    text: 'Nagyon gyors kiszállítás és finom ételek! Csak ajánlani tudom.',
    stars: 5
  },
  {
    name: 'Szabó Anna',
    text: 'A pizzájuk verhetetlen, a futár is kedves volt.',
    stars: 5
  },
  {
    name: 'Tóth Gábor',
    text: 'Remek választék, minden friss és ízletes.',
    stars: 4
  },
  {
    name: 'Nagy Eszter',
    text: 'Gyors, pontos, megbízható! Kedvenc éttermem.',
    stars: 5
  },
  {
    name: 'Farkas Dániel',
    text: 'A desszertek isteni finomak voltak!',
    stars: 5
  }
];

export default function FloatingOpinions() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % opinionsList.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const opinion = opinionsList[current];

  return (
    <div className="floating-opinion">
      <div className="floating-opinion-card">
        <div className="floating-opinion-stars">
          {'★'.repeat(opinion.stars)}{'☆'.repeat(5 - opinion.stars)}
        </div>
        <div className="floating-opinion-text">"{opinion.text}"</div>
        <div className="floating-opinion-name">- {opinion.name}</div>
      </div>
    </div>
  );
}
