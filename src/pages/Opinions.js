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
  const [newUsername, setNewUsername] = useState('');
  const [newText, setNewText] = useState('');
  const [newStars, setNewStars] = useState(5);

  useEffect(() => {
    fetchReviews();
  }, []);

  const safeJson = async (response) => {
    const text = await response.text();
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch (err) {
      console.error('Hibás JSON válasz:', text);
      throw new Error('Hibás szerver válasz');
    }
  };

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://localhost:7236/api/QuickbiteReviews');
      if (!response.ok) {
        throw new Error('Nem sikerült betölteni a véleményeket');
      }
      const data = await safeJson(response);
      setReviews(data || []);
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
    if (newName.trim() === '' || newUsername.trim() === '' || newText.trim() === '') return; // Kötelező mezők
    
    const newReview = {
      name: newName,
      username: newUsername,
      review: newText,
      stars: newStars
    };

    try {
      const response = await fetch('https://localhost:7236/api/QuickbiteReviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newReview)
      });

      if (!response.ok) {
        throw new Error('Nem sikerült hozzáadni a véleményt');
      }

      const addedReview = await safeJson(response);
      if (addedReview) {
        setReviews([addedReview, ...reviews]);
      }
      setNewName('');
      setNewUsername('');
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
          <input 
            type="text" 
            placeholder="Felhasználónév (username)" 
            value={newUsername} 
            onChange={(e) => setNewUsername(e.target.value)} 
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
              <p className="opinion-text">"{r.review || r.text}"</p>
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
