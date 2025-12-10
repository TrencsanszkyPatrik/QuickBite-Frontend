import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import "../pages/components/css/opinions.css";

export default function Opinions() {
  // Vélemények állapot
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Új vélemény állapotok
  const [newName, setNewName] = useState('');
  const [newText, setNewText] = useState('');
  const [newStars, setNewStars] = useState(5);

  // Vélemények betöltése az API-ból
  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/QuickbiteReviews');
      if (!response.ok) {
        throw new Error('Nem sikerült betölteni a véleményeket');
      }
      const data = await response.json();
      setReviews(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Hiba a vélemények betöltésekor:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (count) => "⭐".repeat(count);

  // Vélemény hozzáadása
  const addReview = async () => {
    if (newName.trim() === '' || newText.trim() === '') return; // Név és szöveg kötelező
    
    const newReview = {
      username: newName.toLowerCase().replace(/\s/g, '.'),
      name: newName,
      text: newText,
      stars: newStars
    };

    try {
      const response = await fetch('http://localhost:5000/api/QuickbiteReviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newReview)
      });

      if (!response.ok) {
        throw new Error('Nem sikerült hozzáadni a véleményt');
      }

      const addedReview = await response.json();
      setReviews([addedReview, ...reviews]); // Új vélemény felülre kerül
      setNewName('');
      setNewText('');
      setNewStars(5);
    } catch (err) {
      console.error('Hiba a vélemény hozzáadásakor:', err);
      alert('Hiba történt a vélemény hozzáadásakor. Kérjük, próbálja újra.');
    }
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

        {/* Betöltés és hibaüzenetek */}
        {loading && <p>Vélemények betöltése...</p>}
        {error && <p style={{color: 'red'}}>Hiba: {error}</p>}

        {/* Vélemények */}
        <div className="opinions-grid">
          {reviews.length === 0 && !loading && (
            <p>Még nincsenek vélemények. Legyél te az első!</p>
          )}
          {reviews.map((r) => (
            <div key={r.id} className="opinion-card">
              <div className="opinion-header">
                <h3>{r.name}</h3>
                <span className="username">@{r.username}</span>
              </div>
              <p className="opinion-text">"{r.text}"</p>
              <div className="stars">{renderStars(r.stars)}</div>
              {r.createdAt && (
                <div className="opinion-date">
                  {new Date(r.createdAt).toLocaleDateString('hu-HU')}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}
