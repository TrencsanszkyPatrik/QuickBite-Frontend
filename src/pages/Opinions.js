import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import '../styles/opinions.css'
import { showToast } from '../utils/toast'
import { usePageTitle } from '../utils/usePageTitle'
import { API_BASE } from '../utils/api'

export default function Opinions() {
  usePageTitle('QuickBite - Vásárlói vélemények')
  const navigate = useNavigate()
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [newName, setNewName] = useState('')
  const [newUsername, setNewUsername] = useState('')
  const [newText, setNewText] = useState('')
  const [newStars, setNewStars] = useState(5)
  const [editingId, setEditingId] = useState(null)
  const [editText, setEditText] = useState('')
  const [editStars, setEditStars] = useState(5)

  const auth = useMemo(() => {
    const token = localStorage.getItem('quickbite_token');
    const userRaw = localStorage.getItem('quickbite_user');
    let user = null;
    try {
      user = userRaw ? JSON.parse(userRaw) : null;
    } catch {
      user = null;
    }

    const email = user?.email || ''
    const fallbackUsername = email && email.includes('@') ? email.split('@')[0] : ''
    const displayName = user?.name || email || ''
    return {
      isLoggedIn: Boolean(token && user),
      displayName,
      username: fallbackUsername || displayName.replace(/\s+/g, '').toLowerCase()
    }
  }, [])

  useEffect(() => {
    fetchReviews()
  }, [])

  const safeJson = async (response) => {
    const text = await response.text()
    if (!text) return null
    try {
      return JSON.parse(text)
    } catch (err) {
      console.error('Hibás JSON válasz:', text)
      throw new Error('Hibás szerver válasz')
    }
  }

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE}/QuickbiteReviews`)
      if (!response.ok) {
        throw new Error('Nem sikerült betölteni a véleményeket')
      }
      const data = await safeJson(response)
      setReviews(data || [])
      setError(null)
    } catch (err) {
      setError(err.message)
      console.error('Hiba a vélemények betöltésekor:', err)
    } finally {
      setLoading(false)
    }
  }

  const renderStars = (count) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={`star ${i <= count ? 'filled' : ''}`} aria-hidden="true">★</span>
      )
    }
    return stars
  }

  const addReview = async () => {
    if (!auth.isLoggedIn) {
      showToast.error('Vélemény írásához bejelentkezés szükséges!')
      setTimeout(() => navigate('/bejelentkezes'), 800)
      return
    }

    if (newText.trim() === '') {
      showToast.error('Írj egy véleményt!')
      return
    }

    const newReview = {
      name: auth.displayName || newName,
      username: auth.username || newUsername,
      review: newText,
      stars: newStars
    }

    try {
      const response = await fetch(`${API_BASE}/QuickbiteReviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newReview)
      })

      if (!response.ok) {
        throw new Error('Nem sikerült hozzáadni a véleményt')
      }

      const addedReview = await safeJson(response)
      if (addedReview) {
        setReviews([addedReview, ...reviews])
        showToast.success('Sikeresen hozzáadva!')
      }
      setNewText('')
      setNewStars(5)
    } catch (err) {
      console.error('Hiba a vélemény hozzáadásakor:', err)
      showToast.error('Hiba történt a vélemény hozzáadásakor. Kérjük, próbálja újra.')
    }
  }

  const startEdit = (review) => {
    setEditingId(review.id)
    setEditText(review.review || review.text)
    setEditStars(review.stars)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditText('')
    setEditStars(5)
  }

  const updateReview = async (id) => {
    if (editText.trim() === '') {
      showToast.error('A vélemény nem lehet üres!')
      return
    }

    try {
      const response = await fetch(`${API_BASE}/QuickbiteReviews/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          review: editText,
          stars: editStars
        })
      })

      if (!response.ok) {
        throw new Error('Nem sikerült módosítani a véleményt')
      }

      const updatedReview = await safeJson(response)
      setReviews(reviews.map(r => r.id === id ? { ...r, review: editText, stars: editStars } : r))
      showToast.success('Vélemény módosítva!')
      cancelEdit()
    } catch (err) {
      console.error('Hiba a vélemény módosításakor:', err)
      showToast.error('Nem sikerült módosítani a véleményt.')
    }
  }

  const deleteReview = async (id) => {
    if (!window.confirm('Biztosan törölni szeretnéd ezt a véleményt?')) {
      return
    }

    try {
      const response = await fetch(`${API_BASE}/QuickbiteReviews/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Nem sikerült törölni a véleményt')
      }

      setReviews(reviews.filter(r => r.id !== id))
      showToast.success('Vélemény törölve!')
    } catch (err) {
      console.error('Hiba a vélemény törlésekor:', err)
      showToast.error('Nem sikerült törölni a véleményt.')
    }
  }

  const isOwnReview = (review) => {
    if (!auth.isLoggedIn) return false
    return review.username === auth.username || review.name === auth.displayName
  }

  return (
    <div>
      <Navbar />

      <div className="opinions-container">
        <h1>Vásárlói Vélemények</h1>
        <p>Olvasd el, mit gondolnak a QuickBite felhasználói!</p>
        <div className="new-opinion">
          {!auth.isLoggedIn ? (
            <div style={{ marginBottom: 8, color: '#555' }}>
              Vélemény írásához jelentkezz be.
            </div>
          ) : (
            <div style={{ marginBottom: 8, color: '#555' }}>
              Bejelentkezve mint <strong>{auth.displayName}</strong>
            </div>
          )}
          <textarea 
            placeholder="Írd meg a véleményed..." 
            value={newText} 
            onChange={(e) => setNewText(e.target.value)} 
          />
          <div className="stars new-stars">
            {[1,2,3,4,5].map((n) => (
              <span
                key={n}
                className={`star ${n <= newStars ? 'filled' : ''}`}
                aria-label={`${n} csillag`}
                role="button"
                tabIndex={0}
                onClick={() => setNewStars(n)}
                onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setNewStars(n)}
                style={{cursor: 'pointer'}}
              >
                ★
              </span>
            ))}
          </div>
          <button onClick={addReview}>Hozzáadás</button>
        </div>
        {loading && <p>Vélemények betöltése...</p>}
        {error && <p style={{ color: 'red' }}>Hiba: {error}</p>}
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
              
              {editingId === r.id ? (
                <div className="edit-opinion-form">
                  <textarea 
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="edit-textarea"
                  />
                  <div className="stars edit-stars">
                    {[1,2,3,4,5].map((n) => (
                      <span
                        key={n}
                        className={`star ${n <= editStars ? 'filled' : ''}`}
                        onClick={() => setEditStars(n)}
                        style={{cursor: 'pointer'}}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <div className="edit-actions">
                    <button className="save-btn" onClick={() => updateReview(r.id)}>
                      <i className="bi bi-check-lg"></i> Mentés
                    </button>
                    <button className="cancel-btn" onClick={cancelEdit}>
                      <i className="bi bi-x-lg"></i> Mégse
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="opinion-text">"{r.review || r.text}"</p>
                  <div className="stars">{renderStars(r.stars)}</div>
                  {r.createdAt && (
                    <div className="opinion-date">
                      {new Date(r.createdAt).toLocaleDateString('hu-HU')}
                    </div>
                  )}
                  
                  {isOwnReview(r) && (
                    <div className="opinion-actions">
                      <button className="edit-btn" onClick={() => startEdit(r)} title="Szerkesztés">
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button className="delete-btn" onClick={() => deleteReview(r.id)} title="Törlés">
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  )
}
