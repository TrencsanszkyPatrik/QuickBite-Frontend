import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_BASE, getAuthHeaders } from '../utils/api'
import { showToast } from '../utils/toast'

export default function DeleteAccountSection() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!confirmed) {
      showToast.error('Kérjük, jelöld be, hogy érted a fiók törlésének következményeit.')
      return
    }
    if (!password.trim()) {
      showToast.error('Add meg a jelszavadat a fiók törléséhez.')
      return
    }
    setIsLoading(true)
    try {
      const res = await fetch(`${API_BASE}/Profile/me/delete`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ password })
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        showToast.error(data.message || 'Fiók törlése sikertelen.')
        return
      }
      localStorage.removeItem('quickbite_token')
      localStorage.removeItem('quickbite_user')
      window.dispatchEvent(new Event('userLoggedOut'))
      showToast.success('A fiókod törölve lett. Viszlát!')
      setTimeout(() => navigate('/'), 1500)
    } catch (err) {
      console.error(err)
      showToast.error('Fiók törlése sikertelen.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="profile-section-card profile-section-card--danger">
      <h2>
        <i className="bi bi-exclamation-triangle" aria-hidden="true" />
        Fiók törlése
      </h2>
      <p className="profile-danger-text">
        A fiók törlése visszavonhatatlan. Minden adatod (címeid, fizetési módok, értékeléseid) véglegesen törlésre kerül.
      </p>
      <form onSubmit={handleSubmit}>
        <div className="profile-form-grid">
          <div className="profile-form-group full-width">
            <label htmlFor="delete-account-password">Jelszó megerősítése</label>
            <input
              id="delete-account-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Add meg a jelszavadat"
              autoComplete="current-password"
            />
          </div>
          <div className="profile-form-group full-width">
            <label className="profile-checkbox-label">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
              />{' '}
              Értem, hogy a fiókom és minden adata véglegesen törlésre kerül, és ezt nem lehet visszavonni.
            </label>
          </div>
        </div>
        <div className="profile-actions">
          <button
            type="submit"
            className="profile-btn profile-btn-danger"
            disabled={!confirmed || !password.trim() || isLoading}
          >
            <i className="bi bi-trash" />
            {isLoading ? 'Törlés...' : 'Fiókom végleges törlése'}
          </button>
        </div>
      </form>
    </div>
  )
}
