import React, { useState, useEffect, useMemo } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SpinnerOverlay from '../components/SpinnerOverlay'
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
  const [newText, setNewText] = useState('')
  const [newStars, setNewStars] = useState(5)
  const [filterStars, setFilterStars] = useState(0)
  const [sortBy, setSortBy] = useState('newest')

  const auth = useMemo(() => {
    const token = localStorage.getItem('quickbite_token')
    const userRaw = localStorage.getItem('quickbite_user')
    let user = null
    try {
      user = userRaw ? JSON.parse(userRaw) : null
    } catch {
      user = null
    }

    const email = user?.email || ''
    const fallbackUsername = email && email.includes('@') ? email.split('@')[0] : ''
    const displayName = user?.name || email || ''
    return {
      isLoggedIn: Boolean(token && user),
      displayName,
      email,
      username: fallbackUsername || displayName.replace(/\s+/g, '').toLowerCase()
    }
  }, [])

  useEffect(() => {
    loadReviews()
  }, [])

  const loadReviews = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_BASE}/QuickbiteReviews`)
      const data = response.data || []
      setReviews(data)
      setError(null)
    } catch (err) {
      setError(err?.message || 'Nem sikerült betölteni a véleményeket')
      console.error('Hiba a vélemények betöltésekor:', err)
    } finally {
      setLoading(false)
    }
  }

  const renderStars = (count) => {
    return [...Array(5)].map((_, i) => (
      <i key={i} className={`bi bi-star${i < count ? '-fill' : ''}`}></i>
    ))
  }

  const addReview = async () => {
    if (!auth.isLoggedIn) {
      showToast.error('Vélemény írásához bejelentkezés szükséges!')
      setTimeout(() => navigate('/bejelentkezes'), 800)
      return
    }

    if (newText.trim().length < 5) {
      showToast.error('A vélemény legalább 5 karakter hosszú kell legyen!')
      return
    }

    const newReview = {
      name: auth.displayName,
      username: auth.username,
      review: newText,
      stars: newStars
    }

    try {
      const response = await axios.post(`${API_BASE}/QuickbiteReviews`, newReview, {
        headers: { 'Content-Type': 'application/json' }
      })
      const addedReview = response.data
      setReviews([addedReview, ...reviews])
      setNewText('')
      setNewStars(5)
      showToast.success('Vélemény sikeresen hozzáadva!')
    } catch (err) {
      console.error('Hiba:', err)
      showToast.error('Hiba a vélemény hozzáadásakor')
    }
  }

  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getAvatarColor = (username) => {
    // Natural earthy colors matching the site theme
    const colors = ['#3C3D37', '#697565', '#8B7A6B', '#A89477', '#D4A373', '#E8D9C8', '#B8956A', '#9B8B7E']
    const charCode = username.charCodeAt(0)
    return colors[charCode % colors.length]
  }

  const filteredAndSortedReviews = useMemo(() => {
    let result = reviews
    
    if (filterStars > 0) {
      result = result.filter(r => r.stars === filterStars)
    }
    
    // Sort
    if (sortBy === 'newest') {
      result = [...result].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    } else if (sortBy === 'oldest') {
      result = [...result].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    } else if (sortBy === 'highest') {
      result = [...result].sort((a, b) => b.stars - a.stars)
    } else if (sortBy === 'lowest') {
      result = [...result].sort((a, b) => a.stars - b.stars)
    }
    
    return result
  }, [reviews, filterStars, sortBy])

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.stars, 0) / reviews.length).toFixed(1)
    : 0

  return (
    <div>
      <Navbar />
      {loading && <SpinnerOverlay label="Vélemények betöltése..." />}

      <div className="opinions-page">
        <div className="opinions-header">
          <div className="opinions-header-content">
            <h1>Vásárlói Vélemények</h1>
            <p>Fedezd fel, mit gondolnak valódi felhasználók a QuickBite-ról</p>
          </div>
        </div>

        <div className="opinions-wrapper">
          {/* Stats Section */}
          <div className="opinions-stats">
            <div className="stat-card">
              <div className="stat-value">{reviews.length}</div>
              <div className="stat-label">Vélemény</div>
            </div>
            <div className="stat-card">
              <div className="stat-rating">
                {averageRating > 0 && (
                  <>
                    <span className="rating-number">{averageRating}</span>
                    <div className="rating-stars">{renderStars(Math.round(averageRating))}</div>
                  </>
                )}
              </div>
              <div className="stat-label">Átlagos értékelés</div>
            </div>
          </div>

          <div className="opinions-content">
            {auth.isLoggedIn ? (
              <div className="new-review-card">
                <div className="new-review-header">
                  <div className="user-avatar">
                    <div 
                      className="avatar-initials" 
                      style={{ backgroundColor: getAvatarColor(auth.username) }}
                    >
                      {getInitials(auth.displayName)}
                    </div>
                  </div>
                  <div className="user-info">
                    <p className="user-name">{auth.displayName}</p>
                    <p className="user-email">{auth.email}</p>
                  </div>
                </div>

                <textarea
                  className="review-textarea"
                  placeholder="Mi a véleményed a QuickBite-ról? Oszd meg másokkal..."
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  maxLength={500}
                />

                <div className="review-form-footer">
                  <div className="star-rating-input">
                    <span className="rating-label">Értékelés:</span>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        className={`star-btn ${n <= newStars ? 'active' : ''}`}
                        onClick={() => setNewStars(n)}
                        title={`${n} csillag`}
                      >
                        <i className="bi bi-star-fill"></i>
                      </button>
                    ))}
                  </div>
                  <button
                    className="submit-review-btn"
                    onClick={addReview}
                    disabled={newText.trim().length < 5}
                  >
                    <i className="bi bi-send-fill"></i> Küldés
                  </button>
                </div>
                <div className="char-count">{newText.length}/500</div>
              </div>
            ) : (
              <div className="login-prompt">
                <i className="bi bi-info-circle"></i>
                <h3>Vélemény írásához bejelentkezés szükséges</h3>
                <p>Oszd meg véleményed, hogy segíts másoknak!</p>
                <button
                  className="login-btn"
                  onClick={() => navigate('/bejelentkezes')}
                >
                  Bejelentkezés
                </button>
              </div>
            )}

            {/* Filters and Sort */}
            <div className="reviews-controls">
              <div className="filter-group">
                <label>Szűrés csillagok alapján:</label>
                <div className="star-filter">
                  <button
                    className={`filter-btn ${filterStars === 0 ? 'active' : ''}`}
                    onClick={() => setFilterStars(0)}
                  >
                    Összes
                  </button>
                  {[5, 4, 3, 2, 1].map((n) => (
                    <button
                      key={n}
                      className={`filter-btn ${filterStars === n ? 'active' : ''}`}
                      onClick={() => setFilterStars(n)}
                    >
                      {n} <i className="bi bi-star-fill"></i>
                    </button>
                  ))}
                </div>
              </div>

              <div className="sort-group">
                <label htmlFor="sort-select">Rendezés:</label>
                <select
                  id="sort-select"
                  className="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="newest">Legújabb először</option>
                  <option value="oldest">Legrégebbi először</option>
                  <option value="highest">Legmagasabb értékelés</option>
                  <option value="lowest">Legalacsonyabb értékelés</option>
                </select>
              </div>
            </div>

            {/* Reviews List */}
            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Vélemények betöltése...</p>
              </div>
            ) : error ? (
              <div className="error-state">
                <i className="bi bi-exclamation-triangle"></i>
                <p>Hiba a vélemények betöltésekor: {error}</p>
              </div>
            ) : filteredAndSortedReviews.length === 0 ? (
              <div className="empty-state">
                <i className="bi bi-chat-left-text"></i>
                <p>
                  {filterStars > 0 ? 'Nincs vélemény ezzel az értékeléssel' : 'Még nincs vélemény'}
                </p>
              </div>
            ) : (
              <div className="reviews-grid">
                {filteredAndSortedReviews.map((review) => (
                  <div key={review.id} className="review-card">
                    <div className="review-header">
                      <div className="reviewer-info">
                        <div className="reviewer-avatar">
                          <div 
                            className="avatar-initials" 
                            style={{ backgroundColor: getAvatarColor(review.username) }}
                          >
                            {getInitials(review.name)}
                          </div>
                        </div>
                        <div>
                          <h4>{review.name}</h4>
                          <span className="username">@{review.username}</span>
                        </div>
                      </div>
                    </div>

                    <div className="review-rating">
                      {renderStars(review.stars)}
                    </div>

                    <p className="review-text">{review.text || review.review}</p>

                    <div className="review-footer">
                      {review.createdAt && (
                        <span className="review-date">
                          {new Date(review.createdAt).toLocaleDateString('hu-HU')}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
