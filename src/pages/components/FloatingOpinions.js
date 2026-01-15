import React, { useEffect, useState } from 'react';
import './css/homepage.css';

export default function FloatingOpinions() {
  const [opinions, setOpinions] = useState([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    fetch('https://localhost:7236/api/QuickbiteReviews')
      .then(response => response.json())
      .then(data => setOpinions(data))
      .catch(error => console.error('Error fetching opinions:', error));
  }, []);

  useEffect(() => {
    if (opinions.length === 0) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % opinions.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [opinions]);

  if (opinions.length === 0) {
    return null;
  }

  const opinion = opinions[current];

  return (
  <>
    <div className="floating-opinion" key={current}>
      <div className="floating-opinion-card">
        <div className="floating-opinion-stars">
          {'★'.repeat(opinion.stars)}{'☆'.repeat(5 - opinion.stars)}
        </div>
        <div className="floating-opinion-text">"{opinion.text}"</div>
        <div className="floating-opinion-name">- {opinion.name}</div>
      </div>
    </div>
  </>
  );
}
