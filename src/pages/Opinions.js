import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import "../pages/components/css/opinions.css";

export default function Opinions() {
  // Új vélemény állapotok
  const [newName, setNewName] = useState('');
  const [newText, setNewText] = useState('');
  const [newStars, setNewStars] = useState(5);

  const renderStars = (count) => "⭐".repeat(count);

  // Vélemény hozzáadása
  const addReview = () => {
    if (newName.trim() === '' || newText.trim() === '') return; // Név és szöveg kötelező
    const newReview = {
      username: newName.toLowerCase().replace(/\s/g, '.'),
      name: newName,
      text: newText,
      stars: newStars
    };
    setReviews([newReview, ...reviews]); // Új vélemény felülre kerül
    setNewName('');
    setNewText('');
    setNewStars(5);
  };

  return (
    <div>
      <Navbar />

      <div className="opinions-container">
        <h1>Vásárlói Vélemények</h1>
        <p>Olvasd el, mit gondolnak a QuickBite felhasználói!</p>

        {/* Vélemény írása */}
        <div className="new-opinion">
          <input 
            type="text" 
            placeholder="Neved" 
            value={newName} 
            onChange={(e) => setNewName(e.target.value)} 
          />
          <textarea 
            placeholder="Írd meg a véleményed..." 
            value={newText} 
            onChange={(e) => setNewText(e.target.value)} 
          />
          <select value={newStars} onChange={(e) => setNewStars(Number(e.target.value))}>
            {[5,4,3,2,1].map(n => <option key={n} value={n}>{n}⭐</option>)}
          </select>
          <button onClick={addReview}>Hozzáadás</button>
        </div>

        {/* Vélemények */}
        <div className="opinions-grid">
          {reviews.map((r, index) => (
            <div key={index} className="opinion-card">
              <div className="opinion-header">
                <h3>{r.name}</h3>
                <span className="username">@{r.username}</span>
              </div>
              <p className="opinion-text">"{r.text}"</p>
              <div className="stars">{renderStars(r.stars)}</div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}
