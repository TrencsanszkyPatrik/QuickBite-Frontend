import React, { useEffect, useState } from 'react'
import '../styles/homepage.css'
import { Link } from 'react-router-dom'
import { API_BASE } from '../utils/api'

export default function FloatingOpinions() {
  const [opinions, setOpinions] = useState([])
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    fetch(`${API_BASE}/QuickbiteReviews`)
      .then((response) => response.json())
      .then((data) => setOpinions(data))
      .catch((error) => console.error('Error fetching opinions:', error))
  }, [])

  useEffect(() => {
    if (opinions.length === 0) return
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % opinions.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [opinions])

  if (opinions.length === 0) {
    return null
  }

  const opinion = opinions[current]
  const maxLength = 100
  const shortText =
    typeof opinion.text === 'string' && opinion.text.length > maxLength
      ? `${opinion.text.slice(0, maxLength)}...`
      : opinion.text

  return (
    <div className="floating-opinion" key={current}>
      <Link to="/velemenyek">
        <div className="floating-opinion-card">
          <div className="floating-opinion-stars">
            {'★'.repeat(opinion.stars)}{'☆'.repeat(5 - opinion.stars)}
          </div>
          <div className="floating-opinion-text">"{shortText}"</div>
          <div className="floating-opinion-name">- {opinion.name}</div>
        </div>
      </Link>
    </div>
  )
}
