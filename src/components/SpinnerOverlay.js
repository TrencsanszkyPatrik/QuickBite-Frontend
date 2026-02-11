import React from 'react'
import '../styles/spinner.css'

export default function SpinnerOverlay({ label = 'Betöltés...' }) {
  return (
    <div className="spinner-overlay" role="status" aria-live="polite" aria-busy="true">
      <div className="spinner-card">
        <div className="spinner-ring" aria-hidden="true" />
        <p className="spinner-label">{label}</p>
      </div>
    </div>
  )
}
