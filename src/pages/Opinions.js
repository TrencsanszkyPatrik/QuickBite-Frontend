import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import "../pages/components/css/opinions.css";

export default function Opinions() {
  // Kezdeti vélemények
  const [reviews, setReviews] = useState([
    { username: "nagy.zoltan", name: "Nagy Zoltán", text: "Nagyon gyors kiszállítás és finom ételek! Biztosan rendelek még.", stars: 5 },
    { username: "reka.kovacs", name: "Kovács Réka", text: "A kedvenc éttermem itt találtam meg, minden mindig friss.", stars: 4 },
    { username: "levente.toth", name: "Tóth Levente", text: "Kicsit hosszú volt a kiszállítás, de az étel kárpótolt.", stars: 3 },
    { username: "anna.kis", name: "Kis Anna", text: "Imádom a vegetáriánus menüket, mindig frissek az alapanyagok.", stars: 5 },
    { username: "peter.nagy", name: "Nagy Péter", text: "A rendelés folyamata egyszerű és gyors. Nagyon elégedett vagyok.", stars: 4 },
    { username: "zsuzsa.farkas", name: "Farkas Zsuzsa", text: "Az étel finom volt, de a csomagolás lehetne környezetbarátabb.", stars: 4 },
    { username: "martin.takacs", name: "Takács Márton", text: "Nagyon jó ár-érték arány, gyors kiszállítás. Csak ajánlani tudom!", stars: 5 },
    { username: "emese.nemeth", name: "Németh Emese", text: "Sajnos a leves hideg volt, de a főétel kiváló volt.", stars: 3 },
    { username: "daniel.sipos", name: "Sipos Dániel", text: "Mindig friss és ízletes. A kiszállítás is pontos.", stars: 5 },
    { username: "zsombi.karoly", name: "Károly Zsombor", text: "Jó választék és könnyen használható weboldal. Csak így tovább!", stars: 4 },
    { username: "lili.szabo", name: "Szabó Lili", text: "Nagyon gyors volt a kiszállítás, és az étel ízletes. Teljesen elégedett vagyok!", stars: 5 },
    { username: "adam.fodor", name: "Fodor Ádám", text: "Az alkalmazás könnyen használható, a rendelés egyszerű. Az étel is finom volt.", stars: 4 }
  ]);
  

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
